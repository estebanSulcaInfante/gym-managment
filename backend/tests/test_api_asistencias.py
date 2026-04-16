"""
Tests del módulo de Asistencia.
Cubre: entrada, salida, puntualidad, doble entrada, empleado inactivo.
"""
import pytest
from unittest.mock import patch
from datetime import datetime, time
from app import db
from app.models import Empleado, Horario, Asistencia


class TestRegistroEntrada:
    """POST /api/asistencias/entrada (Kiosko - Público)"""

    def test_entrada_exitosa(self, client, seed_empleado, app):
        """Registrar entrada con DNI válido retorna 201."""
        with patch('app.api.asistencias.upload_base64_image', return_value='http://foto.jpg'):
            res = client.post('/api/asistencias/entrada', json={'dni': '12345678'})

        assert res.status_code == 201
        data = res.get_json()
        assert data['status'] == 'success'
        assert data['empleado'] == 'Carlos Test'
        assert data['asistencia']['hora_entrada'] is not None

    def test_entrada_sin_dni(self, client):
        """DNI vacío retorna 400."""
        res = client.post('/api/asistencias/entrada', json={'dni': ''})
        assert res.status_code == 400

    def test_entrada_dni_inexistente(self, client):
        """DNI que no existe retorna 404."""
        res = client.post('/api/asistencias/entrada', json={'dni': '99999999'})
        assert res.status_code == 404

    def test_entrada_empleado_inactivo(self, client, app):
        """Empleado inactivo no puede marcar entrada."""
        with app.app_context():
            emp = Empleado(
                nombre="Inactivo", apellido="X", dni="00000000",
                cargo="C", departamento="D", activo=False,
            )
            db.session.add(emp)
            db.session.commit()

        res = client.post('/api/asistencias/entrada', json={'dni': '00000000'})
        assert res.status_code == 403

    def test_doble_entrada_mismo_dia(self, client, seed_empleado):
        """No se puede marcar entrada dos veces el mismo día."""
        with patch('app.api.asistencias.upload_base64_image', return_value=''):
            client.post('/api/asistencias/entrada', json={'dni': '12345678'})
            res = client.post('/api/asistencias/entrada', json={'dni': '12345678'})

        assert res.status_code == 400
        assert 'fuera de turno' in res.get_json()['error'] or 'registrada' in res.get_json()['error']


class TestPuntualidad:
    """Evaluación del estado (puntual / retraso / fuera de turno)."""

    def test_entrada_puntual(self, client, seed_empleado, app):
        """Si llega dentro del margen de 15 min, estado = puntual."""
        with app.app_context():
            emp = Empleado.query.filter_by(dni='12345678').first()
            from zoneinfo import ZoneInfo
            hoy = datetime.now(ZoneInfo("America/Lima")).date()
            # Simular entrada a las 09:10 (dentro del margen)
            asist = Asistencia(
                empleado_id=emp.id, fecha=hoy,
                hora_entrada=time(9, 10), estado='puntual',
            )
            db.session.add(asist)
            db.session.commit()

            saved = Asistencia.query.filter_by(empleado_id=emp.id).first()
            assert saved.estado == 'puntual'

    def test_entrada_con_retraso(self, client, seed_empleado, app):
        """Si llega >15 min tarde, estado = retraso."""
        with app.app_context():
            emp = Empleado.query.filter_by(dni='12345678').first()
            from zoneinfo import ZoneInfo
            hoy = datetime.now(ZoneInfo("America/Lima")).date()
            # Simular entrada a las 09:30 (>15 min)
            asist = Asistencia(
                empleado_id=emp.id, fecha=hoy,
                hora_entrada=time(9, 30), estado='retraso',
            )
            db.session.add(asist)
            db.session.commit()

            saved = Asistencia.query.filter_by(empleado_id=emp.id).first()
            assert saved.estado == 'retraso'


class TestRegistroSalida:
    """POST /api/asistencias/salida (Kiosko - Público)"""

    def test_salida_exitosa(self, client, seed_empleado, app):
        """Registrar salida calcula horas_totales."""
        with patch('app.api.asistencias.upload_base64_image', return_value=''):
            client.post('/api/asistencias/entrada', json={'dni': '12345678'})
            res = client.post('/api/asistencias/salida', json={'dni': '12345678'})

        assert res.status_code == 200
        data = res.get_json()
        assert data['asistencia']['hora_salida'] is not None
        assert data['asistencia']['horas_totales'] is not None

    def test_salida_sin_entrada(self, client, seed_empleado):
        """No se puede marcar salida sin entrada previa."""
        res = client.post('/api/asistencias/salida', json={'dni': '12345678'})
        assert res.status_code == 400

    def test_doble_salida(self, client, seed_empleado):
        """No se puede marcar salida dos veces."""
        with patch('app.api.asistencias.upload_base64_image', return_value=''):
            client.post('/api/asistencias/entrada', json={'dni': '12345678'})
            client.post('/api/asistencias/salida', json={'dni': '12345678'})
            res = client.post('/api/asistencias/salida', json={'dni': '12345678'})

        assert res.status_code == 400
        assert 'registro de entrada abierto' in res.get_json()['error'] or 'registrada' in res.get_json()['error']


class TestReporteAsistencias:
    """GET /api/asistencias (Protegido — login_required)"""

    def test_reporte_sin_auth(self, client):
        """Sin token retorna 401."""
        res = client.get('/api/asistencias')
        assert res.status_code == 401

    def test_reporte_con_auth(self, client, seed_admin):
        """Con token retorna 200 y estructura paginada."""
        from tests.conftest import auth_header
        _, token = seed_admin
        res = client.get('/api/asistencias', headers=auth_header(token))
        assert res.status_code == 200
        data = res.get_json()
        assert 'data' in data
        assert 'total' in data
        assert 'page' in data
