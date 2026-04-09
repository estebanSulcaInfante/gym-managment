from flask import Blueprint, request, jsonify
from zoneinfo import ZoneInfo
from datetime import datetime, timezone, date, timedelta
from app.models import Asistencia, Empleado, Horario
from app import db
from app.utils.supabase_storage import upload_base64_image
from app.decorators import login_required, admin_required

LIMATZ = ZoneInfo("America/Lima")

bp = Blueprint('asistencias', __name__, url_prefix='/api/asistencias')

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
            h, m = map(int, data['hora_entrada'].split(':'))
            asist.hora_entrada = datetime.strptime(data['hora_entrada'], '%H:%M').time()
        else:
            asist.hora_entrada = None

    if 'hora_salida' in data:
        if data['hora_salida']:
            asist.hora_salida = datetime.strptime(data['hora_salida'], '%H:%M').time()
        else:
            asist.hora_salida = None

    if 'estado' in data:
        asist.estado = data['estado']

    if 'justificacion' in data:
        asist.justificacion = data['justificacion']

    if 'observaciones' in data:
        asist.observaciones = data['observaciones']

    # Recalcular horas si ambas horas presentes
    if asist.hora_entrada and asist.hora_salida:
        dt_ent = datetime.combine(asist.fecha, asist.hora_entrada)
        dt_sal = datetime.combine(asist.fecha, asist.hora_salida)
        asist.horas_totales = round((dt_sal - dt_ent).total_seconds() / 3600, 2)
    elif not asist.hora_entrada:
        asist.horas_totales = None

    db.session.commit()
    return jsonify({'status': 'success', 'asistencia': asist.to_dict()}), 200


# ─── Reconciliación de Jornada ───
@bp.route('/pendientes', methods=['GET'])
@admin_required
def obtener_pendientes():
    """Retorna la cantidad de registros huérfanos o ausencias no procesadas de los últimos 7 días."""
    hoy = datetime.now(LIMATZ).date()
    hace_7_dias = hoy - timedelta(days=7)

    # 1. Sesiones abiertas (sin salida) en días anteriores
    sesiones_abiertas = Asistencia.query.filter(
        Asistencia.fecha >= hace_7_dias,
        Asistencia.fecha < hoy,
        Asistencia.hora_salida.is_(None),
        Asistencia.estado != 'ausente'
    ).count()

    # 2. Ausencias no marcadas: Empleados con horario que no tienen asistencia registrada en días pasados
    ausencias_pendientes = 0
    # Generamos los días
    fechas_evaluar = [hace_7_dias + timedelta(days=i) for i in range((hoy - hace_7_dias).days)]
    
    for f in fechas_evaluar:
        # Empleados con turno ese día
        emp_con_turno_ids = {horario.empleado_id for horario in Horario.query.filter_by(dia_semana=f.weekday()).all() if horario.hora_entrada}
        # Empleados con asistencia (cualquier estado) ese día
        emp_con_asist_ids = {a.empleado_id for a in Asistencia.query.filter_by(fecha=f).all()}
        
        # Intersección: tenían turno pero no hay asistencia
        faltantes = emp_con_turno_ids - emp_con_asist_ids
        ausencias_pendientes += len(faltantes)

    return jsonify({
        'total': sesiones_abiertas + ausencias_pendientes,
        'detalles': {
            'sesiones_abiertas': sesiones_abiertas,
            'ausencias_no_marcadas': ausencias_pendientes
        }
    }), 200


@bp.route('/conciliar', methods=['POST'])
@admin_required
def conciliar_dias_pasados():
    """Auto-cierra jornadas pendientes con modalidad mixta: asigna hora de salida contractual y respeta entrada real."""
    hoy = datetime.now(LIMATZ).date()
    hace_7_dias = hoy - timedelta(days=7)

    sesiones_cerradas = 0
    ausencias_marcadas = 0

    # 1. auto-cerrar sesiones abiertas
    abiertas = Asistencia.query.filter(
        Asistencia.fecha >= hace_7_dias,
        Asistencia.fecha < hoy,
        Asistencia.hora_salida.is_(None),
        Asistencia.estado != 'ausente'
    ).all()

    for asist in abiertas:
        asist.estado = 'revision'
        asist.justificacion = 'auto-cierre generoso'
        
        dia_semana = asist.fecha.weekday()
        horario = Horario.query.filter_by(empleado_id=asist.empleado_id, dia_semana=dia_semana).first()
        
        if horario and horario.hora_salida:
            asist.hora_salida = horario.hora_salida
        else:
            # Tope de 8 horas si no tiene horario
            dt_ent_temp = datetime.combine(asist.fecha, asist.hora_entrada)
            asist.hora_salida = (dt_ent_temp + timedelta(hours=8)).time()
            
        # Calcular horas
        dt_ent = datetime.combine(asist.fecha, asist.hora_entrada)
        dt_sal = datetime.combine(asist.fecha, asist.hora_salida)
        
        delta_sec = (dt_sal - dt_ent).total_seconds()
        if delta_sec < 0:
            delta_sec = 0.0 # Caso borde si entró DESPUES de su hora de salida teórica
            
        asist.horas_totales = round(delta_sec / 3600, 2)
        sesiones_cerradas += 1

    # 2. auto-marcar ausencias
    fechas_evaluar = [hace_7_dias + timedelta(days=i) for i in range((hoy - hace_7_dias).days)]
    for f in fechas_evaluar:
        turnos_dia = Horario.query.filter_by(dia_semana=f.weekday()).all()
        emp_con_turno_ids = {t.empleado_id for t in turnos_dia if t.hora_entrada}
        emp_con_asist_ids = {a.empleado_id for a in Asistencia.query.filter_by(fecha=f).all()}
        
        faltantes = emp_con_turno_ids - emp_con_asist_ids
        for emp_id in faltantes:
            ausencia = Asistencia(
                empleado_id=emp_id,
                fecha=f,
                estado='ausente',
                justificacion='injustificada',
                horas_totales=0.0
            )
            db.session.add(ausencia)
            ausencias_marcadas += 1

    db.session.commit()

    return jsonify({
        'status': 'success',
        'mensaje': 'Días reconciliados exitosamente.',
        'resultado': {
            'sesiones_cerradas_en_revision': sesiones_cerradas,
            'ausencias_auto_marcadas': ausencias_marcadas
        }
    }), 200


@bp.route('/entrada', methods=['POST'])
def registrar_entrada():
    """Registra la entrada de un empleado por su DNI (Kiosko)"""
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

    hoy = datetime.now(LIMATZ).date()
    asist_existente = Asistencia.query.filter_by(empleado_id=emp.id, fecha=hoy).first()

    # Si ya existe un registro de ausencia, convertirlo en entrada
    if asist_existente and asist_existente.estado == 'ausente':
        ahora = datetime.now(LIMATZ).time()
        asist_existente.hora_entrada = ahora
        asist_existente.estado = 'retraso'
        asist_existente.justificacion = None
        asist_existente.foto_entrada_url = foto_url
        db.session.commit()
        return jsonify({
            'status': 'success',
            'mensaje': 'Entrada registrada (ausencia convertida)',
            'empleado': f"{emp.nombre} {emp.apellido}",
            'asistencia': asist_existente.to_dict()
        }), 201

    if asist_existente:
        return jsonify({'error': 'La entrada ya fue registrada para hoy'}), 400

    ahora_dt = datetime.now(LIMATZ)
    ahora = ahora_dt.time()
    
    dia_semana = hoy.weekday()
    horario_hoy = Horario.query.filter_by(empleado_id=emp.id, dia_semana=dia_semana).first()
    
    estado = 'puntual'
    if horario_hoy and horario_hoy.hora_entrada:
        ent_min = horario_hoy.hora_entrada.hour * 60 + horario_hoy.hora_entrada.minute
        curr_min = ahora.hour * 60 + ahora.minute
        if curr_min > ent_min + 15:
            estado = 'retraso'
    elif horario_hoy and not horario_hoy.hora_entrada:
        estado = 'fuera de turno'

    nueva_asist = Asistencia(
        empleado_id=emp.id,
        fecha=hoy,
        hora_entrada=ahora,
        foto_entrada_url=foto_url,
        estado=estado
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
    """Registra la salida usando el DNI"""
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
    asist_existente = Asistencia.query.filter_by(empleado_id=emp.id, fecha=hoy).first()
    
    if not asist_existente or not asist_existente.hora_entrada:
        return jsonify({'error': 'No hay registro de entrada para hoy'}), 400
        
    if asist_existente.hora_salida:
        return jsonify({'error': 'La salida ya fue registrada'}), 400

    ahora_dt = datetime.now(LIMATZ)
    ahora = ahora_dt.time()
    asist_existente.hora_salida = ahora
    asist_existente.foto_salida_url = foto_url
    
    dt_entrada = datetime.combine(hoy, asist_existente.hora_entrada)
    dt_salida = datetime.combine(hoy, ahora)
    delta = dt_salida - dt_entrada
    asist_existente.horas_totales = round(delta.total_seconds() / 3600, 2)

    db.session.commit()

    return jsonify({
        'status': 'success',
        'mensaje': 'Salida registrada',
        'empleado': f"{emp.nombre} {emp.apellido}",
        'asistencia': asist_existente.to_dict()
    }), 200
