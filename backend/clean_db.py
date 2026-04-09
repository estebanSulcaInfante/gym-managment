import os
from werkzeug.security import generate_password_hash
from app import create_app, db
from app.models import Usuario

def clean_db():
    app = create_app()
    with app.app_context():
        print("Vaciando base de datos (drop_all)...")
        db.drop_all()
        
        print("Creando tablas limpias (create_all)...")
        db.create_all()
        
        print("Creando cuenta de Administrador...")
        admin = Usuario(
            username="admin",
            password_hash=generate_password_hash("admin123"),
            rol="Admin",
            activo=True
        )
        db.session.add(admin)

        print("Creando cuenta de Recepcionista...")
        recep = Usuario(
            username="recepcion",
            password_hash=generate_password_hash("recep123"),
            rol="Recepcionista",  # Ajustamos la mayúscula inicial para ser consistentes con el auth
            activo=True
        )
        db.session.add(recep)

        db.session.commit()
        
        print("------------------------------------------")
        print("¡Base de datos limpiada con éxito!")
        print("Tus credenciales de acceso iniciales son:")
        print("👉 Administrador : admin / admin123")
        print("👉 Recepcionista : recepcion / recep123")
        print("------------------------------------------")

if __name__ == "__main__":
    clean_db()
