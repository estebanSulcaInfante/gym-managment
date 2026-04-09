"""
Tests del módulo de Empleados (CRUD + Horarios).
Cubre: listar, crear, obtener, editar, desactivar.
Todos los endpoints de empleados requieren @login_required o @admin_required.
"""
import pytest
from app import db
from app.models import Empleado
from tests.conftest import auth_header


class TestHealthCheck:
    def test_health(self, client):
        res = client.get('/health')
        assert res.status_code == 200
        assert res.get_json() == {'status': 'healthy'}


class TestEmpleadoModel:
    def test_creacion_modelo(self, app):
        """Un empleado se crea activo por defecto."""
        with app.app_context():
            emp = Empleado(
                nombre="Juan", apellido="Perez", dni="12345678",
                cargo="Trainer", departamento="Fitness",
            )
            db.session.add(emp)
            db.session.commit()

            saved = Empleado.query.filter_by(dni="12345678").first()
            assert saved is not None
            assert saved.activo is True


class TestListarEmpleados:
    """GET /api/empleados (login_required)"""

    def test_sin_auth_retorna_401(self, client):
        res = client.get('/api/empleados')
        assert res.status_code == 401

    def test_lista_vacia(self, client, seed_admin):
        _, token = seed_admin
        res = client.get('/api/empleados', headers=auth_header(token))
        assert res.status_code == 200
        assert res.get_json() == []

    def test_lista_con_empleados(self, client, seed_admin, seed_empleado):
        _, token = seed_admin
        res = client.get('/api/empleados', headers=auth_header(token))
        assert res.status_code == 200
        data = res.get_json()
        assert len(data) == 1
        assert data[0]['nombre'] == 'Carlos'
        assert 'horarios' in data[0]


class TestCrearEmpleado:
    """POST /api/empleados (admin_required)"""

    def test_crear_empleado_basico(self, client, seed_admin):
        _, token = seed_admin
        res = client.post('/api/empleados', headers=auth_header(token), json={
            'nombre': 'Ana', 'apellido': 'Lopez', 'dni': '87654321',
            'cargo': 'Recepcionista', 'departamento': 'Admin',
        })
        assert res.status_code == 201
        assert res.get_json()['nombre'] == 'Ana'

    def test_crear_empleado_con_horarios(self, client, seed_admin):
        _, token = seed_admin
        res = client.post('/api/empleados', headers=auth_header(token), json={
            'nombre': 'Pedro', 'apellido': 'Garcia', 'dni': '11112222',
            'cargo': 'Trainer', 'departamento': 'Fitness',
            'horarios': [
                {'dia_semana': 0, 'hora_entrada': '08:00', 'hora_salida': '16:00'},
                {'dia_semana': 1, 'hora_entrada': '09:00', 'hora_salida': '17:00'},
            ],
        })
        assert res.status_code == 201
        data = res.get_json()
        assert len(data['horarios']) >= 2


class TestObtenerEmpleado:
    """GET /api/empleados/:id (login_required)"""

    def test_obtener_existente(self, client, seed_admin, seed_empleado):
        _, token = seed_admin
        res = client.get(f'/api/empleados/{seed_empleado}', headers=auth_header(token))
        assert res.status_code == 200
        assert res.get_json()['dni'] == '12345678'
        assert 'horarios' in res.get_json()

    def test_obtener_inexistente(self, client, seed_admin):
        _, token = seed_admin
        res = client.get('/api/empleados/9999', headers=auth_header(token))
        assert res.status_code == 404


class TestDesactivarEmpleado:
    """DELETE /api/empleados/:id (admin_required, soft delete)"""

    def test_desactivar_empleado(self, client, seed_admin, seed_empleado, app):
        _, token = seed_admin
        res = client.delete(f'/api/empleados/{seed_empleado}', headers=auth_header(token))
        assert res.status_code == 200

        with app.app_context():
            emp = db.session.get(Empleado, seed_empleado)
            assert emp.activo is False
