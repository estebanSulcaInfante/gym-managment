from app import db

class Horario(db.Model):
    __tablename__ = 'horarios_empleados'

    id = db.Column(db.Integer, primary_key=True)
    empleado_id = db.Column(db.Integer, db.ForeignKey('empleados.id'), nullable=False)
    dia_semana = db.Column(db.Integer, nullable=False) # 0=Lunes, ..., 6=Domingo
    hora_entrada = db.Column(db.Time, nullable=True) # Null implica libre
    hora_salida = db.Column(db.Time, nullable=True) 

    # Unique constraint para asegurar que un empleado tenga un solo horario por día
    __table_args__ = (
        db.UniqueConstraint('empleado_id', 'dia_semana', name='uq_empleado_dia'),
    )

    def to_dict(self):
        return {
            'dia_semana': self.dia_semana,
            'hora_entrada': self.hora_entrada.isoformat() if self.hora_entrada else None,
            'hora_salida': self.hora_salida.isoformat() if self.hora_salida else None
        }
