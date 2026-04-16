from flask import Blueprint, request, jsonify
from app.models import Empleado, Horario
from app import db
from app.decorators import login_required, admin_required

bp = Blueprint('empleados', __name__, url_prefix='/api/empleados')

from datetime import datetime
from sqlalchemy.orm import joinedload

@bp.route('', methods=['GET'])
@login_required
def list_empleados():
    empleados = Empleado.query.options(joinedload(Empleado.horarios)).all()
    res = []
    for emp in empleados:
        d = emp.to_dict()
        d['horarios'] = [h.to_dict() for h in emp.horarios]
        res.append(d)
    return jsonify(res), 200

@bp.route('/<int:id>', methods=['GET'])
@login_required
def get_empleado(id):
    emp = Empleado.query.get_or_404(id)
    data = emp.to_dict()
    data['horarios'] = [h.to_dict() for h in emp.horarios]
    return jsonify(data), 200

@bp.route('', methods=['POST'])
@admin_required
def create_empleado():
    data = request.json
    if not data or not 'dni' in data or not 'nombre' in data:
        return jsonify({'error': 'DNI and nombre are required'}), 400
    
    dni = data['dni'].strip()
    if Empleado.query.filter_by(dni=dni).first():
        return jsonify({'error': 'DNI ya registrado'}), 400

    emp = Empleado(
        nombre=data['nombre'],
        apellido=data.get('apellido', ''),
        dni=dni,
        cargo=data.get('cargo', 'Staff'),
        departamento=data.get('departamento', 'General'),
        telefono=data.get('telefono'),
        foto_url=data.get('foto_url')
    )
    db.session.add(emp)
    db.session.flush() # Para tener el id

    if 'horarios' in data and isinstance(data['horarios'], list):
        for h_data in data['horarios']:
            he = h_data.get('hora_entrada') or ''
            hs = h_data.get('hora_salida') or ''
            hora_e = datetime.strptime(he, '%H:%M').time() if he else None
            hora_s = datetime.strptime(hs, '%H:%M').time() if hs else None
            # Auto-detect cruza_medianoche: si hora_salida < hora_entrada
            cruza = h_data.get('cruza_medianoche', False)
            if hora_e and hora_s and hora_s < hora_e:
                cruza = True
            h = Horario(
                empleado_id=emp.id,
                dia_semana=h_data['dia_semana'],
                hora_entrada=hora_e,
                hora_salida=hora_s,
                cruza_medianoche=cruza
            )
            db.session.add(h)

    db.session.commit()
    res = emp.to_dict()
    res['horarios'] = [h.to_dict() for h in emp.horarios]
    return jsonify(res), 201

@bp.route('/<int:id>', methods=['PUT'])
@admin_required
def update_empleado(id):
    emp = Empleado.query.get_or_404(id)
    data = request.json
    
    if 'nombre' in data: emp.nombre = data['nombre']
    if 'apellido' in data: emp.apellido = data['apellido']
    if 'cargo' in data: emp.cargo = data['cargo']
    if 'departamento' in data: emp.departamento = data['departamento']
    if 'telefono' in data: emp.telefono = data['telefono']
    if 'foto_url' in data: emp.foto_url = data['foto_url']
    if 'activo' in data: emp.activo = data['activo']
    
    if 'horarios' in data and isinstance(data['horarios'], list):
        # Borrar horarios viejos y recrear
        Horario.query.filter_by(empleado_id=emp.id).delete()
        for h_data in data['horarios']:
            he = h_data.get('hora_entrada') or ''
            hs = h_data.get('hora_salida') or ''
            hora_e = datetime.strptime(he, '%H:%M:%S').time() if len(he) > 5 else (datetime.strptime(he, '%H:%M').time() if he else None)
            hora_s = datetime.strptime(hs, '%H:%M:%S').time() if len(hs) > 5 else (datetime.strptime(hs, '%H:%M').time() if hs else None)
            # Auto-detect cruza_medianoche
            cruza = h_data.get('cruza_medianoche', False)
            if hora_e and hora_s and hora_s < hora_e:
                cruza = True
            h = Horario(
                empleado_id=emp.id,
                dia_semana=h_data['dia_semana'],
                hora_entrada=hora_e,
                hora_salida=hora_s,
                cruza_medianoche=cruza
            )
            db.session.add(h)

    db.session.commit()
    res = emp.to_dict()
    res['horarios'] = [h.to_dict() for h in emp.horarios]
    return jsonify(res), 200

@bp.route('/<int:id>', methods=['DELETE'])
@admin_required
def deactivate_empleado(id):
    emp = Empleado.query.get_or_404(id)
    emp.activo = False
    db.session.commit()
    return jsonify({'status': 'deactivated'}), 200
