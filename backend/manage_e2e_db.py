import os
import sys

# Configuramos las variables para forzar base de datos local SQLite y modo de pruebas.
os.environ['DATABASE_URL'] = 'sqlite:///test_e2e.db'
os.environ['FLASK_ENV'] = 'testing'

# Importar después de setear las variables de entorno
from app import create_app, db
from app.models import Empleado, Usuario, Horario
from werkzeug.security import generate_password_hash
from datetime import time

app = create_app()

def reset_db():
    with app.app_context():
        print("Restableciendo base de datos E2E...")
        db.drop_all()
        db.create_all()

        # Crear admin
        admin_emp = Empleado(
            nombre="Admin",
            apellido="Admin",
            dni="00000000",
            telefono="000000000",
            cargo='Administrador',
            departamento="Administración"
        )
        db.session.add(admin_emp)
        db.session.flush()

        admin_user = Usuario(
            username="admin",
            password_hash=generate_password_hash("admin123"),
            rol='admin',
            empleado_id=admin_emp.id,
            activo=True
        )
        db.session.add(admin_user)

        # Horarios admin (Lunes-Viernes, 08:00-17:00)
        for dia in range(5):
            db.session.add(Horario(
                empleado_id=admin_emp.id,
                dia_semana=dia,
                hora_entrada=time(8, 0),
                hora_salida=time(17, 0),
                cruza_medianoche=False
            ))

        # Crear recepcion
        recep_emp = Empleado(
            nombre="Recep",
            apellido="Recep",
            dni="11111111",
            telefono="111111111",
            cargo='Recepción',
            departamento="Recepción"
        )
        db.session.add(recep_emp)
        db.session.flush()

        recep_user = Usuario(
            username="recepcion",
            password_hash=generate_password_hash("recep123"),
            rol='recepcionista',
            empleado_id=recep_emp.id,
            activo=True
        )
        db.session.add(recep_user)

        # Horarios recepcion (Lunes-Viernes, 08:00-17:00)
        for dia in range(5):
            db.session.add(Horario(
                empleado_id=recep_emp.id,
                dia_semana=dia,
                hora_entrada=time(8, 0),
                hora_salida=time(17, 0),
                cruza_medianoche=False
            ))

        db.session.commit()
        print("Base de datos E2E reseteada.")

if __name__ == '__main__':
    if len(sys.argv) > 1 and sys.argv[1] == 'reset':
        reset_db()
