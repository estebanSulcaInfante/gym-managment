from flask import Blueprint, request, jsonify
from zoneinfo import ZoneInfo
from datetime import datetime, timezone, date, timedelta, time
from app.models import Asistencia, Empleado, Horario
from app import db
from app.utils.supabase_storage import upload_base64_image
from app.decorators import login_required, admin_required

LIMATZ = ZoneInfo("America/Lima")

bp = Blueprint('asistencias', __name__, url_prefix='/api/asistencias')

# ─── Utilidades ───

def calcular_horas(fecha, hora_entrada, hora_salida, cruza_medianoche):
    """Calcula horas trabajadas soportando turnos que cruzan medianoche."""
    dt_entrada = datetime.combine(fecha, hora_entrada)
    if cruza_medianoche:
        dt_salida = datetime.combine(fecha + timedelta(days=1), hora_salida)
    else:
        dt_salida = datetime.combine(fecha, hora_salida)
    delta_sec = (dt_salida - dt_entrada).total_seconds()
    if delta_sec < 0:
        delta_sec = 0.0
    return round(delta_sec / 3600, 2)


def encontrar_bloque_actual(bloques, hora_actual):
    """Dado una lista de bloques de horario y la hora actual, determina en cuál bloque cae.
    Retorna el bloque más cercano dentro de su ventana de entrada (30 min antes → hora_salida).
    """
    mejor_bloque = None
    menor_distancia = float('inf')

    for bloque in bloques:
        if not bloque.hora_entrada:
            continue

        ent_min = bloque.hora_entrada.hour * 60 + bloque.hora_entrada.minute
        sal_min = bloque.hora_salida.hour * 60 + bloque.hora_salida.minute if bloque.hora_salida else ent_min + 480
        curr_min = hora_actual.hour * 60 + hora_actual.minute

        # Ventana de entrada: 30 min antes de hora_entrada hasta hora_salida
        ventana_inicio = (ent_min - 30) % 1440  # Normalizar para evitar negativos

        if bloque.cruza_medianoche:
            # Turno nocturno: ventana va de (entrada-30min) hasta medianoche, 
            # o desde medianoche hasta hora_salida del día siguiente
            if curr_min >= ventana_inicio or curr_min <= sal_min:
                dist = (curr_min - ent_min) % 1440
                if dist < menor_distancia:
                    menor_distancia = dist
                    mejor_bloque = bloque
        else:
            # Turno normal
            if ventana_inicio <= curr_min <= sal_min:
                dist = abs(curr_min - ent_min)
                if dist < menor_distancia:
                    menor_distancia = dist
                    mejor_bloque = bloque

    return mejor_bloque


# ─── Reportes ───

@bp.route('', methods=['GET'])
@login_required
def get_reporte():
    """Retorna las asistencias con info del empleado, filtros y paginación."""
    limit = request.args.get('limit', 50, type=int)
    page = request.args.get('page', 1, type=int)
    offset = (page - 1) * limit

    empleado_id = request.args.get('empleado_id', type=int)
    desde = request.args.get('desde')
    hasta = request.args.get('hasta')
    departamento = request.args.get('departamento')
    estado_filter = request.args.get('estado')

    query = db.session.query(Asistencia, Empleado).join(
        Empleado, Asistencia.empleado_id == Empleado.id
    )

    if empleado_id:
        query = query.filter(Asistencia.empleado_id == empleado_id)
    if desde:
        query = query.filter(Asistencia.fecha >= desde)
    if hasta:
        query = query.filter(Asistencia.fecha <= hasta)
    if departamento:
        query = query.filter(Empleado.departamento == departamento)
    if estado_filter:
        query = query.filter(Asistencia.estado == estado_filter)

    total = query.count()
    results = query.order_by(Asistencia.fecha.desc(), Asistencia.hora_entrada.desc())\
                   .offset(offset).limit(limit).all()

    data = []
    for a, emp in results:
        d = a.to_dict()
        d['empleado_nombre'] = f"{emp.nombre} {emp.apellido}"
        d['empleado_cargo'] = emp.cargo
        d['empleado_departamento'] = emp.departamento
        data.append(d)

    return jsonify({
        'data': data,
        'total': total,
        'page': page,
        'pages': (total + limit - 1) // limit
    }), 200


# ─── Editar asistencia manualmente ───
@bp.route('/<int:asist_id>', methods=['PUT'])
@admin_required
def editar_asistencia(asist_id):
    """Admin: corregir hora de entrada/salida, estado, justificación."""
    asist = Asistencia.query.get_or_404(asist_id)
    data = request.json

    if 'hora_entrada' in data:
        if data['hora_entrada']:
            asist.hora_entrada = datetime.strptime(data['hora_entrada'], '%H:%M').time()
        else:
            asist.hora_entrada = None

    if 'hora_salida' in data:
        if data['hora_salida']:
            asist.hora_salida = datetime.strptime(data['hora_salida'], '%H:%M').time()
        else:
            asist.hora_salida = None

    if 'estado' in data:
        ESTADOS_VALIDOS = {'puntual', 'retraso', 'ausente', 'fuera de turno', 'revision', 'presente', 'permiso', 'vacaciones'}
        if data['estado'] not in ESTADOS_VALIDOS:
            return jsonify({'error': f'Estado inválido. Permitidos: {", ".join(sorted(ESTADOS_VALIDOS))}'}), 400
        asist.estado = data['estado']

    if 'justificacion' in data:
        asist.justificacion = data['justificacion']

    if 'observaciones' in data:
        asist.observaciones = data['observaciones']

    # Recalcular horas si ambas horas presentes
    if asist.hora_entrada and asist.hora_salida:
        asist.horas_totales = calcular_horas(asist.fecha, asist.hora_entrada, asist.hora_salida, asist.cruza_medianoche)
    elif not asist.hora_entrada:
        asist.horas_totales = None

    db.session.commit()

    result = asist.to_dict()
    emp = Empleado.query.get(asist.empleado_id)
    result['empleado_nombre'] = f"{emp.nombre} {emp.apellido}" if emp else ''
    return jsonify(result), 200


# ─── Registro de Asistencia (Kiosko) ───

@bp.route('/entrada', methods=['POST'])
def registrar_entrada():
    """Registra la entrada de un empleado por su DNI (Kiosko).
    Soporta múltiples bloques por día (turno partido).
    """
    data = request.json
    dni = data.get('dni')
    foto_b64 = data.get('foto_url')

    if not dni:
        return jsonify({'error': 'DNI es requerido'}), 400

    foto_url = upload_base64_image(foto_b64) if foto_b64 else None

    emp = Empleado.query.filter_by(dni=dni).first()
    if not emp:
        return jsonify({'error': 'Empleado no encontrado'}), 404
    if not emp.activo:
        return jsonify({'error': 'Empleado inactivo'}), 403

    ahora_dt = datetime.now(LIMATZ)
    hoy = ahora_dt.date()
    ahora = ahora_dt.time()

    # Obtener todos los bloques programados para hoy
    dia_semana = hoy.weekday()
    bloques_hoy = Horario.query.filter_by(empleado_id=emp.id, dia_semana=dia_semana).all()

    # Determinar en qué bloque cae la hora actual
    bloque_actual = encontrar_bloque_actual(bloques_hoy, ahora)

    if bloque_actual:
        # ¿Ya existe asistencia para este bloque específico hoy?
        asist_existente = Asistencia.query.filter_by(
            empleado_id=emp.id, fecha=hoy, horario_id=bloque_actual.id
        ).first()

        # Si existe una ausencia para este bloque, convertirla en entrada
        if asist_existente and asist_existente.estado == 'ausente':
            asist_existente.hora_entrada = ahora
            asist_existente.estado = 'retraso'
            asist_existente.justificacion = None
            asist_existente.foto_entrada_url = foto_url
            asist_existente.hora_entrada_programada = bloque_actual.hora_entrada
            asist_existente.hora_salida_programada = bloque_actual.hora_salida
            asist_existente.cruza_medianoche = bloque_actual.cruza_medianoche
            db.session.commit()
            return jsonify({
                'status': 'success',
                'mensaje': 'Entrada registrada (ausencia convertida)',
                'empleado': f"{emp.nombre} {emp.apellido}",
                'asistencia': asist_existente.to_dict()
            }), 201

        if asist_existente:
            return jsonify({'error': 'La entrada ya fue registrada para este turno'}), 400

        # Evaluar puntualidad contra el bloque (soporta turnos nocturnos)
        estado = 'puntual'
        ent_min = bloque_actual.hora_entrada.hour * 60 + bloque_actual.hora_entrada.minute
        curr_min = ahora.hour * 60 + ahora.minute
        diferencia = (curr_min - ent_min) % 1440  # Aritmética modular para cruce de medianoche
        if diferencia > 15 and diferencia < 720:  # >15 min tarde, <720 descarta "llegó antes"
            estado = 'retraso'

        nueva_asist = Asistencia(
            empleado_id=emp.id,
            fecha=hoy,
            horario_id=bloque_actual.id,
            hora_entrada=ahora,
            foto_entrada_url=foto_url,
            estado=estado,
            hora_entrada_programada=bloque_actual.hora_entrada,
            hora_salida_programada=bloque_actual.hora_salida,
            cruza_medianoche=bloque_actual.cruza_medianoche
        )
    else:
        # No cae en ningún bloque → "fuera de turno"
        # Verificar que no haya una asistencia "fuera de turno" ya abierta hoy
        asist_fuera = Asistencia.query.filter_by(
            empleado_id=emp.id, fecha=hoy, horario_id=None
        ).filter(Asistencia.hora_salida.is_(None)).first()
        
        if asist_fuera:
            return jsonify({'error': 'Ya tienes una entrada activa fuera de turno'}), 400

        nueva_asist = Asistencia(
            empleado_id=emp.id,
            fecha=hoy,
            horario_id=None,
            hora_entrada=ahora,
            foto_entrada_url=foto_url,
            estado='fuera de turno',
            cruza_medianoche=False
        )

    db.session.add(nueva_asist)
    db.session.commit()

    return jsonify({
        'status': 'success',
        'mensaje': 'Entrada registrada',
        'empleado': f"{emp.nombre} {emp.apellido}",
        'asistencia': nueva_asist.to_dict()
    }), 201

@bp.route('/salida', methods=['POST'])
def registrar_salida():
    """Registra la salida usando el DNI. Busca la asistencia abierta más reciente."""
    data = request.json
    dni = data.get('dni')
    foto_b64 = data.get('foto_url')

    if not dni:
        return jsonify({'error': 'DNI es requerido'}), 400
        
    foto_url = upload_base64_image(foto_b64) if foto_b64 else None

    emp = Empleado.query.filter_by(dni=dni).first()
    if not emp:
        return jsonify({'error': 'Empleado no encontrado'}), 404

    hoy = datetime.now(LIMATZ).date()
    
    # Buscar la asistencia abierta más reciente (sin hora_salida)
    # Puede ser de hoy o de ayer (si es un turno nocturno que empezó ayer)
    asist_abierta = Asistencia.query.filter(
        Asistencia.empleado_id == emp.id,
        Asistencia.hora_entrada.isnot(None),
        Asistencia.hora_salida.is_(None),
        Asistencia.estado != 'ausente',
        Asistencia.fecha >= hoy - timedelta(days=1)  # Buscar ayer y hoy
    ).order_by(Asistencia.fecha.desc(), Asistencia.hora_entrada.desc()).first()

    if not asist_abierta:
        return jsonify({'error': 'No hay registro de entrada abierto'}), 400

    ahora_dt = datetime.now(LIMATZ)
    ahora = ahora_dt.time()
    asist_abierta.hora_salida = ahora
    asist_abierta.foto_salida_url = foto_url
    
    # Calcular horas considerando cruza_medianoche
    asist_abierta.horas_totales = calcular_horas(
        asist_abierta.fecha, asist_abierta.hora_entrada, ahora, asist_abierta.cruza_medianoche
    )

    db.session.commit()

    return jsonify({
        'status': 'success',
        'mensaje': 'Salida registrada',
        'empleado': f"{emp.nombre} {emp.apellido}",
        'asistencia': asist_abierta.to_dict()
    }), 200
