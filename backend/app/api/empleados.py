from flask import Blueprint, request, jsonify
from app.models import Empleado, Horario
from app import db

bp = Blueprint('empleados', __name__, url_prefix='/api/empleados')

@bp.route('', methods=['GET'])
def list_empleados():
    empleados = Empleado.query.all()
    return jsonify([emp.to_dict() for emp in empleados]), 200

@bp.route('/<int:id>', methods=['GET'])
def get_empleado(id):
    emp = Empleado.query.get_or_404(id)
    data = emp.to_dict()
    data['horarios'] = [h.to_dict() for h in emp.horarios]
    return jsonify(data), 200

@bp.route('', methods=['POST'])
def create_empleado():
    data = request.json
    if not data or not 'dni' in data or not 'nombre' in data:
        return jsonify({'error': 'DNI and nombre are required'}), 400
    
    if Empleado.query.filter_by(dni=data['dni']).first():
        return jsonify({'error': 'DNI ya registrado'}), 400

    emp = Empleado(
        nombre=data['nombre'],
        apellido=data.get('apellido', ''),
        dni=data['dni'],
        cargo=data.get('cargo', 'Staff'),
        departamento=data.get('departamento', 'General'),
        telefono=data.get('telefono'),
        foto_url=data.get('foto_url')
    )
    db.session.add(emp)
    db.session.commit()
    return jsonify(emp.to_dict()), 201

@bp.route('/<int:id>', methods=['PUT'])
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
    
    db.session.commit()
    return jsonify(emp.to_dict()), 200

@bp.route('/<int:id>', methods=['DELETE'])
def deactivate_empleado(id):
    emp = Empleado.query.get_or_404(id)
    emp.activo = False
    db.session.commit()
    return jsonify({'status': 'deactivated'}), 200
