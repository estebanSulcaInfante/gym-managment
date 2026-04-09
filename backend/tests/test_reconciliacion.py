"""
Tests de la Reconciliación de Jornada (Auto-Cierre Generoso Mixto).
Cubre: detección de pendientes, auto-cierre con horario, tope 8h, ausencias.
"""
import pytest
from datetime import datetime, date, time, timedelta
from app import db
from app.models import Empleado, Horario, Asistencia
from tests.conftest import auth_header


class TestPendientes:
    """GET /api/asistencias/pendientes (admin_required)"""

    def test_sin_auth_retorna_401(self, client):
        res = client.get('/api/asistencias/pendientes')
        assert res.status_code == 401

    def test_recepcionista_retorna_403(self, client, seed_recepcionista):
        _, token = seed_recepcionista
        res = client.get('/api/asistencias/pendientes', headers=auth_header(token))
        assert res.status_code == 403

    def test_sin_pendientes(self, client, seed_admin):
        """Sin registros huérfanos retorna total=0."""
        _, token = seed_admin
        res = client.get('/api/asistencias/pendientes', headers=auth_header(token))
        assert res.status_code == 200
        assert res.get_json()['total'] == 0

    def test_detecta_sesion_abierta(self, client, seed_admin, seed_empleado, app):
        """Detecta una sesión sin salida de ayer."""
        _, token = seed_admin
        with app.app_context():
            from zoneinfo import ZoneInfo
            ayer = datetime.now(ZoneInfo("America/Lima")).date() - timedelta(days=1)
            asist = Asistencia(
                empleado_id=seed_empleado, fecha=ayer,
                hora_entrada=time(9, 0), estado='puntual',
            )
            db.session.add(asist)
            db.session.commit()

        res = client.get('/api/asistencias/pendientes', headers=auth_header(token))
        data = res.get_json()
        assert data['total'] >= 1
        assert data['detalles']['sesiones_abiertas'] >= 1


class TestConciliar:
    """POST /api/asistencias/conciliar (admin_required)"""

    def test_sin_auth_retorna_401(self, client):
        res = client.post('/api/asistencias/conciliar')
        assert res.status_code == 401

    def test_auto_cierre_generoso_con_horario(self, client, seed_admin, seed_empleado, app):
        """
        Sesión abierta de ayer:
        - Entrada real: 11:00
        - Horario contractual salida: 18:00
        - Resultado esperado: hora_salida=18:00, horas=7.0, estado=revision
        """
        _, token = seed_admin
        with app.app_context():
            from zoneinfo import ZoneInfo
            hoy = datetime.now(ZoneInfo("America/Lima")).date()
            # Buscar un día que caiga entre Lun-Vie (donde el empleado tiene horario)
            dias_atras = 1
            while (hoy - timedelta(days=dias_atras)).weekday() >= 5:  # Saltar fines de semana
                dias_atras += 1
            fecha_test = hoy - timedelta(days=dias_atras)

            asist = Asistencia(
                empleado_id=seed_empleado, fecha=fecha_test,
                hora_entrada=time(11, 0), estado='retraso',
            )
            db.session.add(asist)
            db.session.commit()
            asist_id = asist.id

        # Ejecutar conciliación
        res = client.post('/api/asistencias/conciliar', headers=auth_header(token))
        assert res.status_code == 200
        data = res.get_json()
        assert data['status'] == 'success'
        assert data['resultado']['sesiones_cerradas_en_revision'] >= 1

        # Verificar el registro
        with app.app_context():
            a = db.session.get(Asistencia, asist_id)
            assert a.estado == 'revision'
            assert a.justificacion == 'auto-cierre generoso'
            assert a.hora_salida == time(18, 0)
            assert a.horas_totales == 7.0  # 11:00 -> 18:00

    def test_auto_cierre_tope_8h_sin_horario(self, client, seed_admin, app):
        """
        Empleado fuera de turno (sin horario para ese día):
        - Entrada: 10:00
        - Resultado: hora_salida = 18:00 (10+8), horas=8.0
        """
        _, token = seed_admin
        with app.app_context():
            from zoneinfo import ZoneInfo
            hoy = datetime.now(ZoneInfo("America/Lima")).date()
            # Crear empleado SIN horarios
            emp = Empleado(
                nombre="Sin", apellido="Horario", dni="99990000",
                cargo="Freelance", departamento="General", activo=True,
            )
            db.session.add(emp)
            db.session.flush()

            ayer = hoy - timedelta(days=1)
            asist = Asistencia(
                empleado_id=emp.id, fecha=ayer,
                hora_entrada=time(10, 0), estado='fuera de turno',
            )
            db.session.add(asist)
            db.session.commit()
            asist_id = asist.id

        res = client.post('/api/asistencias/conciliar', headers=auth_header(token))
        assert res.status_code == 200

        with app.app_context():
            a = db.session.get(Asistencia, asist_id)
            assert a.estado == 'revision'
            assert a.hora_salida == time(18, 0)
            assert a.horas_totales == 8.0

    def test_marca_ausencias_injustificadas(self, client, seed_admin, seed_empleado, app):
        """Empleado con turno que no apareció queda como ausente."""
        _, token = seed_admin
        with app.app_context():
            from zoneinfo import ZoneInfo
            hoy = datetime.now(ZoneInfo("America/Lima")).date()
            # Buscar un día laboral (Lun-Vie)
            dias_atras = 1
            while (hoy - timedelta(days=dias_atras)).weekday() >= 5:
                dias_atras += 1
            fecha_test = hoy - timedelta(days=dias_atras)

            # Confirmar que NO hay asistencia para ese día
            existing = Asistencia.query.filter_by(
                empleado_id=seed_empleado, fecha=fecha_test
            ).first()
            if existing:
                db.session.delete(existing)
                db.session.commit()

        res = client.post('/api/asistencias/conciliar', headers=auth_header(token))
        assert res.status_code == 200
        data = res.get_json()
        assert data['resultado']['ausencias_auto_marcadas'] >= 1

        with app.app_context():
            ausencia = Asistencia.query.filter_by(
                empleado_id=seed_empleado, fecha=fecha_test
            ).first()
            assert ausencia is not None
            assert ausencia.estado == 'ausente'
            assert ausencia.justificacion == 'injustificada'
            assert ausencia.horas_totales == 0.0

    def test_conciliar_no_toca_registros_de_hoy(self, client, seed_admin, seed_empleado, app):
        """Una sesión abierta de HOY no debe ser conciliada."""
        _, token = seed_admin
        with app.app_context():
            from zoneinfo import ZoneInfo
            hoy = datetime.now(ZoneInfo("America/Lima")).date()
            asist = Asistencia(
                empleado_id=seed_empleado, fecha=hoy,
                hora_entrada=time(9, 0), estado='puntual',
            )
            db.session.add(asist)
            db.session.commit()
            asist_id = asist.id

        res = client.post('/api/asistencias/conciliar', headers=auth_header(token))
        assert res.status_code == 200

        with app.app_context():
            a = db.session.get(Asistencia, asist_id)
            # La sesión de hoy debe seguir intacta
            assert a.estado == 'puntual'
            assert a.hora_salida is None
