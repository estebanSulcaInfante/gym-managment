from datetime import datetime, timezone
from app import db

class Asistencia(db.Model):
    __tablename__ = 'asistencias'

    id = db.Column(db.Integer, primary_key=True)
    empleado_id = db.Column(db.Integer, db.ForeignKey('empleados.id'), nullable=False)
    fecha = db.Column(db.Date, nullable=False)
    hora_entrada = db.Column(db.Time, nullable=False)
    hora_salida = db.Column(db.Time, nullable=True)
    foto_entrada_url = db.Column(db.String(255), nullable=True)
    foto_salida_url = db.Column(db.String(255), nullable=True)
    estado = db.Column(db.String(20), nullable=True) # puntual, retraso, ausente
    horas_totales = db.Column(db.Float, nullable=True)
    observaciones = db.Column(db.Text, nullable=True)
    created_at = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc))

    empleado = db.relationship('Empleado', backref=db.backref('asistencias', lazy=True))

    def to_dict(self):
        return {
            'id': self.id,
            'empleado_id': self.empleado_id,
            'fecha': self.fecha.isoformat(),
            'hora_entrada': self.hora_entrada.isoformat() if self.hora_entrada else None,
            'hora_salida': self.hora_salida.isoformat() if self.hora_salida else None,
            'foto_entrada_url': self.foto_entrada_url,
            'foto_salida_url': self.foto_salida_url,
            'estado': self.estado,
            'horas_totales': self.horas_totales,
            'observaciones': self.observaciones
        }
