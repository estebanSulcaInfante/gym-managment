"""
Tests de Autenticación JWT.
Cubre: login, token validation, role enforcement, user creation.
"""
import pytest
from werkzeug.security import generate_password_hash
from app import db
from app.models import Usuario
from tests.conftest import auth_header


class TestLogin:
    """POST /api/auth/login"""

    def test_login_exitoso(self, client, seed_admin):
        """Login correcto retorna token + user info."""
        _, _ = seed_admin
        res = client.post('/api/auth/login', json={
            'username': 'admin_test',
            'password': 'pass123',
        })
        assert res.status_code == 200
        data = res.get_json()
        assert 'token' in data
        assert data['user']['username'] == 'admin_test'
        assert data['user']['rol'] == 'Admin'

    def test_login_password_incorrecto(self, client, seed_admin):
        """Password incorrecto retorna 401."""
        res = client.post('/api/auth/login', json={
            'username': 'admin_test',
            'password': 'wrong',
        })
        assert res.status_code == 401
        assert 'error' in res.get_json()

    def test_login_usuario_inexistente(self, client):
        """Usuario que no existe retorna 401."""
        res = client.post('/api/auth/login', json={
            'username': 'fantasma',
            'password': 'nada',
        })
        assert res.status_code == 401

    def test_login_sin_campos(self, client):
        """Request sin username/password retorna 400."""
        res = client.post('/api/auth/login', json={})
        assert res.status_code == 400

    def test_login_usuario_desactivado(self, client, app):
        """Usuario desactivado retorna 403."""
        with app.app_context():
            user = Usuario(
                username='inactivo', rol='Admin', activo=False,
                password_hash=generate_password_hash('test'),
            )
            db.session.add(user)
            db.session.commit()

        res = client.post('/api/auth/login', json={
            'username': 'inactivo', 'password': 'test',
        })
        assert res.status_code == 403


class TestMe:
    """GET /api/auth/me"""

    def test_me_con_token_valido(self, client, seed_admin):
        """Token válido retorna info del usuario."""
        _, token = seed_admin
        res = client.get('/api/auth/me', headers=auth_header(token))
        assert res.status_code == 200
        assert res.get_json()['user']['username'] == 'admin_test'

    def test_me_sin_token(self, client):
        """Sin token retorna 401."""
        res = client.get('/api/auth/me')
        assert res.status_code == 401

    def test_me_token_invalido(self, client):
        """Token basura retorna 401."""
        res = client.get('/api/auth/me', headers=auth_header('token.invalido.xyz'))
        assert res.status_code == 401


class TestCreateUser:
    """POST /api/auth/users (admin only)"""

    def test_admin_puede_crear_usuario(self, client, seed_admin):
        """Admin crea un nuevo usuario correctamente."""
        _, token = seed_admin
        res = client.post('/api/auth/users', headers=auth_header(token), json={
            'username': 'nuevo_recep',
            'password': 'seguro123',
            'rol': 'recepcionista',
        })
        assert res.status_code == 201
        assert res.get_json()['user']['username'] == 'nuevo_recep'

    def test_recepcionista_no_puede_crear_usuario(self, client, seed_recepcionista):
        """Recepcionista recibe 403 al intentar crear usuario."""
        _, token = seed_recepcionista
        res = client.post('/api/auth/users', headers=auth_header(token), json={
            'username': 'hacker', 'password': 'x', 'rol': 'admin',
        })
        assert res.status_code == 403

    def test_crear_usuario_duplicado(self, client, seed_admin):
        """Username duplicado retorna 400."""
        _, token = seed_admin
        # El primer usuario ya existe como 'admin_test'
        res = client.post('/api/auth/users', headers=auth_header(token), json={
            'username': 'admin_test', 'password': 'x', 'rol': 'admin',
        })
        assert res.status_code == 400

    def test_crear_usuario_rol_invalido(self, client, seed_admin):
        """Rol no válido retorna 400."""
        _, token = seed_admin
        res = client.post('/api/auth/users', headers=auth_header(token), json={
            'username': 'nuevo', 'password': 'x', 'rol': 'superuser',
        })
        assert res.status_code == 400
