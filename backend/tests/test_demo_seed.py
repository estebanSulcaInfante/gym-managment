from datetime import datetime, timedelta
from app import db
from app.models import Asistencia, DemoState
from demo_seed import LIMA_TZ, refresh_demo_history, seed_demo_database


def test_demo_history_rolls_forward_to_the_current_lima_date(app):
    app.config.update(DEMO_MODE=True, DEMO_DATABASE_LABEL='gym-demo')

    assert seed_demo_database(app) is True
    with app.app_context():
        initial_count = Asistencia.query.count()
        today = datetime.now(LIMA_TZ).date()
        tomorrow = today + timedelta(days=1)

    assert refresh_demo_history(app, today=tomorrow) is True

    with app.app_context():
        state = db.session.get(DemoState, 1)
        latest_history_day = db.session.query(db.func.max(Asistencia.fecha)).scalar()
        assert state.seeded_for == tomorrow
        assert Asistencia.query.count() == initial_count
        assert latest_history_day == tomorrow - timedelta(days=1)
