from app import db

class Usuario(db.Model):
    __tablename__ = 'usuarios'

    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(50), unique=True, nullable=False)
    password_hash = db.Column(db.String(255), nullable=False)
    rol = db.Column(db.String(20), nullable=False) # 'admin', 'recepcionista'
    empleado_id = db.Column(db.Integer, db.ForeignKey('empleados.id'), nullable=True)
    activo = db.Column(db.Boolean, default=True)

    empleado = db.relationship('Empleado', backref=db.backref('usuario', uselist=False))

    def to_dict(self):
        return {
            'id': self.id,
            'username': self.username,
            'rol': self.rol,
            'empleado_id': self.empleado_id,
            'activo': self.activo
        }
