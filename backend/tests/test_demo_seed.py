from datetime import datetime, timedelta
from app import db
from app.models import Asistencia, DemoState
from conftest import auth_header
from demo_seed import LIMA_TZ, refresh_demo_history, seed_demo_database


def test_demo_history_rolls_forward_to_the_current_lima_date(app):
    app.config.update(DEMO_MODE=True, DEMO_DATABASE_LABEL='gym-demo')

    assert seed_demo_database(app) is True
    with app.app_context():
        initial_count = Asistencia.query.count()
        today = datetime.now(LIMA_TZ).date()
        tomorrow = today + timedelta(days=1)
        today_records = Asistencia.query.filter_by(fecha=today).all()
        assert len(today_records) == 3
        assert len([record for record in today_records if record.estado == 'retraso']) == 1
        assert len([record for record in today_records if record.hora_salida is None]) == 2
        assert Asistencia.query.filter_by(estado='ausente').count() > 0

    assert refresh_demo_history(app, today=tomorrow) is True

    with app.app_context():
        state = db.session.get(DemoState, 1)
        latest_history_day = db.session.query(db.func.max(Asistencia.fecha)).scalar()
        assert state.seeded_for == tomorrow
        assert Asistencia.query.count() == initial_count
        assert latest_history_day == tomorrow
        refreshed_today_records = Asistencia.query.filter_by(fecha=tomorrow).all()
        assert len(refreshed_today_records) == 3


def test_demo_dashboard_has_live_attendance_signals(app, client, seed_admin):
    app.config.update(DEMO_MODE=True, DEMO_DATABASE_LABEL='gym-demo')
    assert seed_demo_database(app) is True
    _, token = seed_admin

    response = client.get('/api/stats/dashboard', headers=auth_header(token))

    assert response.status_code == 200
    data = response.get_json()
    assert data['asistencias_hoy'] == 3
    assert data['trabajando_ahora'] == 2
    assert data['retrasos_hoy'] == 1
    assert len(data['staff_en_turno']) == 2
    assert any(day['asistencias'] > 0 for day in data['chart_data'])
    assert data['retrasos_mes'] > 0
