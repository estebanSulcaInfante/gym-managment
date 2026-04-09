from flask import Blueprint, request, jsonify, current_app
from werkzeug.security import check_password_hash, generate_password_hash
from app.models import Usuario
from app.decorators import login_required, admin_required
from app import db
import jwt
from datetime import datetime, timedelta, timezone

bp = Blueprint('auth', __name__, url_prefix='/api/auth')

TOKEN_EXPIRY_HOURS = 24


@bp.route('/login', methods=['POST'])
def login():
    """Authenticate user and return JWT token."""
    data = request.json
    if not data or not data.get('username') or not data.get('password'):
        return jsonify({'error': 'Username y password son requeridos'}), 400

    user = Usuario.query.filter_by(username=data['username']).first()
    
    if not user or not check_password_hash(user.password_hash, data['password']):
        return jsonify({'error': 'Credenciales inválidas'}), 401

    if not user.activo:
        return jsonify({'error': 'Usuario desactivado'}), 403

    payload = {
        'user_id': user.id,
        'username': user.username,
        'rol': user.rol,
        'exp': datetime.now(timezone.utc) + timedelta(hours=TOKEN_EXPIRY_HOURS)
    }
    token = jwt.encode(payload, current_app.config['SECRET_KEY'], algorithm='HS256')

    return jsonify({
        'token': token,
        'user': user.to_dict()
    }), 200


@bp.route('/me', methods=['GET'])
@login_required
def me():
    """Return current authenticated user info."""
    user = request.current_user
    return jsonify({'user': user.to_dict()}), 200


@bp.route('/users', methods=['POST'])
@admin_required
def create_user():
    """Admin: create a new user account."""
    data = request.json
    if not data or not data.get('username') or not data.get('password') or not data.get('rol'):
        return jsonify({'error': 'username, password y rol son requeridos'}), 400

    if Usuario.query.filter_by(username=data['username']).first():
        return jsonify({'error': 'Username ya existe'}), 400

    if data['rol'].lower() not in ('admin', 'recepcionista'):
        return jsonify({'error': 'Rol debe ser admin o recepcionista'}), 400

    new_user = Usuario(
        username=data['username'],
        password_hash=generate_password_hash(data['password']),
        rol=data['rol'],
        empleado_id=data.get('empleado_id'),
        activo=True
    )
    db.session.add(new_user)
    db.session.commit()

    return jsonify({'user': new_user.to_dict()}), 201
