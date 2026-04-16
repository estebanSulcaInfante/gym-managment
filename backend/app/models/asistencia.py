from datetime import datetime, timezone
from app import db

class Asistencia(db.Model):
    __tablename__ = 'asistencias'

    id = db.Column(db.Integer, primary_key=True)
    empleado_id = db.Column(db.Integer, db.ForeignKey('empleados.id'), nullable=False)
    fecha = db.Column(db.Date, nullable=False)  # Fecha en que INICIÓ la jornada
    horario_id = db.Column(db.Integer, db.ForeignKey('horarios_empleados.id', ondelete='SET NULL'), nullable=True)
    # FK relacional: vincula esta asistencia al bloque programado que le corresponde
    # nullable: "fuera de turno" no tiene horario asociado

    hora_entrada = db.Column(db.Time, nullable=True)  # nullable para ausencias
    hora_salida = db.Column(db.Time, nullable=True)
    
    # Snapshots inmutables (ADR 004 - protección contra cambios retroactivos)
    hora_entrada_programada = db.Column(db.Time, nullable=True)
    hora_salida_programada = db.Column(db.Time, nullable=True)
    cruza_medianoche = db.Column(db.Boolean, default=False, nullable=False)  # Snapshot del flag

    foto_entrada_url = db.Column(db.String(255), nullable=True)
    foto_salida_url = db.Column(db.String(255), nullable=True)
    estado = db.Column(db.String(20), nullable=True) # puntual, retraso, fuera de turno, ausente
    horas_totales = db.Column(db.Float, nullable=True)
    observaciones = db.Column(db.Text, nullable=True)
    justificacion = db.Column(db.String(50), nullable=True)
    created_at = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc))

    empleado = db.relationship('Empleado', backref=db.backref('asistencias', lazy=True))
    horario = db.relationship('Horario', backref=db.backref('asistencias', lazy=True))

    def to_dict(self):
        return {
            'id': self.id,
            'empleado_id': self.empleado_id,
            'fecha': self.fecha.isoformat(),
            'horario_id': self.horario_id,
            'hora_entrada': self.hora_entrada.isoformat() if self.hora_entrada else None,
            'hora_salida': self.hora_salida.isoformat() if self.hora_salida else None,
            'hora_entrada_programada': self.hora_entrada_programada.isoformat() if self.hora_entrada_programada else None,
            'hora_salida_programada': self.hora_salida_programada.isoformat() if self.hora_salida_programada else None,
            'cruza_medianoche': self.cruza_medianoche,
            'foto_entrada_url': self.foto_entrada_url,
            'foto_salida_url': self.foto_salida_url,
            'estado': self.estado,
            'horas_totales': self.horas_totales,
            'observaciones': self.observaciones,
            'justificacion': self.justificacion
        }
