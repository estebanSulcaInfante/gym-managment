from app import db

class Horario(db.Model):
    __tablename__ = 'horarios'

    id = db.Column(db.Integer, primary_key=True)
    empleado_id = db.Column(db.Integer, db.ForeignKey('empleados.id'), nullable=False)
    dia_semana = db.Column(db.Integer, nullable=False) # 0=Lunes, 6=Domingo
    hora_entrada = db.Column(db.Time, nullable=False)
    hora_salida = db.Column(db.Time, nullable=False)
    activo = db.Column(db.Boolean, default=True)

    empleado = db.relationship('Empleado', backref=db.backref('horarios', lazy=True))

    def to_dict(self):
        return {
            'id': self.id,
            'empleado_id': self.empleado_id,
            'dia_semana': self.dia_semana,
            'hora_entrada': self.hora_entrada.isoformat(),
            'hora_salida': self.hora_salida.isoformat(),
            'activo': self.activo
        }
