from datetime import datetime, timezone
from app import db

class Horario(db.Model):
    __tablename__ = 'horarios_empleados'

    id = db.Column(db.Integer, primary_key=True)
    empleado_id = db.Column(db.Integer, db.ForeignKey('empleados.id'), nullable=False)
    dia_semana = db.Column(db.Integer, nullable=False) # 0=Lunes, ..., 6=Domingo
    hora_entrada = db.Column(db.Time, nullable=True) # Null implica libre
    hora_salida = db.Column(db.Time, nullable=True)
    cruza_medianoche = db.Column(db.Boolean, default=False, nullable=False)
    updated_at = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc),
                           onupdate=lambda: datetime.now(timezone.utc))

    # Sin UniqueConstraint en (empleado_id, dia_semana)
    # Un empleado puede tener N bloques de trabajo por día (turno partido)

    def to_dict(self):
        return {
            'id': self.id,
            'dia_semana': self.dia_semana,
            'hora_entrada': self.hora_entrada.isoformat() if self.hora_entrada else None,
            'hora_salida': self.hora_salida.isoformat() if self.hora_salida else None,
            'cruza_medianoche': self.cruza_medianoche
        }
