from datetime import datetime, timezone
from app import db

class Empleado(db.Model):
    __tablename__ = 'empleados'

    id = db.Column(db.Integer, primary_key=True)
    nombre = db.Column(db.String(100), nullable=False)
    apellido = db.Column(db.String(100), nullable=False)
    dni = db.Column(db.String(20), unique=True, nullable=False)
    cargo = db.Column(db.String(100), nullable=False)
    departamento = db.Column(db.String(100), nullable=False)
    telefono = db.Column(db.String(20))
    foto_url = db.Column(db.String(255))
    activo = db.Column(db.Boolean, default=True)
    created_at = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc))
    updated_at = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))

    def to_dict(self):
        return {
            'id': self.id,
            'nombre': self.nombre,
            'apellido': self.apellido,
            'dni': self.dni,
            'cargo': self.cargo,
            'departamento': self.departamento,
            'telefono': self.telefono,
            'foto_url': self.foto_url,
            'activo': self.activo
        }
