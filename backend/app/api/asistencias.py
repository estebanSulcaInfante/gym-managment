from flask import Blueprint, request, jsonify
from datetime import datetime, timezone, date
from app.models import Asistencia, Empleado
from app import db

bp = Blueprint('asistencias', __name__, url_prefix='/api/asistencias')

@bp.route('', methods=['GET'])
def get_reporte():
    """Retorna las asistencias recientes."""
    limit = request.args.get('limit', 50, type=int)
    asists = Asistencia.query.order_by(Asistencia.created_at.desc()).limit(limit).all()
    return jsonify([a.to_dict() for a in asists]), 200

@bp.route('/entrada', methods=['POST'])
def registrar_entrada():
    """Registra la entrada de un empleado por su DNI (Kiosko)"""
    data = request.json
    dni = data.get('dni')
    foto_url = data.get('foto_url')

    if not dni:
        return jsonify({'error': 'DNI es requerido'}), 400

    emp = Empleado.query.filter_by(dni=dni).first()
    if not emp:
        return jsonify({'error': 'Empleado no encontrado'}), 404
    if not emp.activo:
        return jsonify({'error': 'Empleado inactivo'}), 403

    hoy = date.today()
    # Revisar si ya marcó entrada hoy
    asist_existente = Asistencia.query.filter_by(empleado_id=emp.id, fecha=hoy).first()
    
    if asist_existente:
        return jsonify({'error': 'La entrada ya fue registrada para hoy'}), 400

    ahora = datetime.now(timezone.utc).time()
    
    # Evaluar puntualidad (simplificado: asume como 'puntual' temporalmente hasta cruzar con Horarios)
    estado = 'puntual' 

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
    foto_url = data.get('foto_url')

    if not dni:
        return jsonify({'error': 'DNI es requerido'}), 400

    emp = Empleado.query.filter_by(dni=dni).first()
    if not emp:
        return jsonify({'error': 'Empleado no encontrado'}), 404

    hoy = date.today()
    asist_existente = Asistencia.query.filter_by(empleado_id=emp.id, fecha=hoy).first()
    
    if not asist_existente:
        return jsonify({'error': 'No hay registro de entrada para hoy'}), 400
        
    if asist_existente.hora_salida:
        return jsonify({'error': 'La salida ya fue registrada'}), 400

    ahora = datetime.now(timezone.utc).time()
    asist_existente.hora_salida = ahora
    asist_existente.foto_salida_url = foto_url
    
    # Calcular horas (Simplificado usando timedelta)
    # timedelta no soporta restar `time` objs directamente si cruzan medianoche, pero es MVP.
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
