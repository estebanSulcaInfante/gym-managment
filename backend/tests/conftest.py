import os
import pytest
import jwt
from datetime import datetime, timedelta, timezone
from werkzeug.security import generate_password_hash
from app import create_app, db as _db
from app.models import Empleado, Usuario, Horario, Asistencia


@pytest.fixture(scope='function')
def app(tmp_path):
    """Create a fresh app + SQLite DB in tmp_path for every test."""
    db_path = tmp_path / "test.db"

    app = create_app({
        'TESTING': True,
        'SQLALCHEMY_DATABASE_URI': f'sqlite:///{db_path}',
        'SQLALCHEMY_TRACK_MODIFICATIONS': False,
        'SECRET_KEY': 'test-secret-key-for-jwt',
    })

    with app.app_context():
        _db.create_all()
        yield app
        _db.session.remove()


@pytest.fixture
def client(app):
    return app.test_client()


# ─── Helper fixtures ─────────────────────────────────────────

@pytest.fixture
def seed_empleado(app):
    """Insert an active employee with a Monday-Friday 09:00-18:00 schedule."""
    with app.app_context():
        emp = Empleado(
            nombre="Carlos", apellido="Test",
            dni="12345678", cargo="Trainer",
            departamento="Fitness", activo=True,
        )
        _db.session.add(emp)
        _db.session.flush()

        for dia in range(5):  # Lun-Vie
            h = Horario(
                empleado_id=emp.id, dia_semana=dia,
                hora_entrada=datetime.strptime("09:00", "%H:%M").time(),
                hora_salida=datetime.strptime("18:00", "%H:%M").time(),
            )
            _db.session.add(h)

        _db.session.commit()
        return emp.id


@pytest.fixture
def seed_admin(app):
    """Insert an admin user and return (user_id, token)."""
    with app.app_context():
        user = Usuario(
            username="admin_test",
            password_hash=generate_password_hash("pass123"),
            rol="Admin",
            activo=True,
        )
        _db.session.add(user)
        _db.session.commit()

        payload = {
            'user_id': user.id,
            'username': user.username,
            'rol': user.rol,
            'exp': datetime.now(timezone.utc) + timedelta(hours=1),
        }
        token = jwt.encode(payload, 'test-secret-key-for-jwt', algorithm='HS256')
        return user.id, token


@pytest.fixture
def seed_recepcionista(app):
    """Insert a receptionist user and return (user_id, token)."""
    with app.app_context():
        user = Usuario(
            username="recep_test",
            password_hash=generate_password_hash("recep123"),
            rol="Recepcionista",
            activo=True,
        )
        _db.session.add(user)
        _db.session.commit()

        payload = {
            'user_id': user.id,
            'username': user.username,
            'rol': user.rol,
            'exp': datetime.now(timezone.utc) + timedelta(hours=1),
        }
        token = jwt.encode(payload, 'test-secret-key-for-jwt', algorithm='HS256')
        return user.id, token


def auth_header(token):
    """Return dict with Authorization header."""
    return {'Authorization': f'Bearer {token}'}
