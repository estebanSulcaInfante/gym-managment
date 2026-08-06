from app import db


class DemoState(db.Model):
    """Tracks the date for which the public demo history was generated."""

    __tablename__ = 'demo_state'

    id = db.Column(db.Integer, primary_key=True)
    seeded_for = db.Column(db.Date, nullable=False)
