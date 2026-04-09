import jwt
import functools
from flask import request, jsonify, current_app
from app.models import Usuario


def get_current_user():
    """Extracts and validates JWT from Authorization header. Returns Usuario or None."""
    auth_header = request.headers.get('Authorization', '')
    if not auth_header.startswith('Bearer '):
        return None

    token = auth_header.split(' ', 1)[1]
    try:
        payload = jwt.decode(token, current_app.config['SECRET_KEY'], algorithms=['HS256'])
        user = Usuario.query.get(payload.get('user_id'))
        if user and user.activo:
            return user
        return None
    except (jwt.ExpiredSignatureError, jwt.InvalidTokenError):
        return None


def login_required(f):
    """Decorator: requires a valid JWT token (any role)."""
    @functools.wraps(f)
    def decorated(*args, **kwargs):
        user = get_current_user()
        if not user:
            return jsonify({'error': 'Autenticación requerida'}), 401
        request.current_user = user
        return f(*args, **kwargs)
    return decorated


def admin_required(f):
    """Decorator: requires a valid JWT token with role 'Admin'."""
    @functools.wraps(f)
    def decorated(*args, **kwargs):
        user = get_current_user()
        if not user:
            return jsonify({'error': 'Autenticación requerida'}), 401
        if user.rol.lower() != 'admin':
            return jsonify({'error': 'Permisos de administrador requeridos'}), 403
        request.current_user = user
        return f(*args, **kwargs)
    return decorated
