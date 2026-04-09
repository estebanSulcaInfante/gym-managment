import os
from dotenv import load_dotenv
from sqlalchemy import text
from app import create_app, db
from app.utils.supabase_storage import get_supabase_client

load_dotenv()

def test_conn():
    print("Iniciando prueba de conexión...\n")
    
    app = create_app()
    with app.app_context():
        # 1. Prueba a la Base de Datos (Postgres en Supabase)
        print("--- PRUEBA DE BASE DE DATOS (POSTGRES) ---")
        try:
            result = db.session.execute(text("SELECT 1")).scalar()
            print(f"✅ Conectado exitosamente. Resultado de prueba: {result}")
        except Exception as e:
            print(f"❌ Error al conectar a Postgres:\n{e}")

    # 2. Prueba al Kiosco de Fotos (Supabase Storage)
    print("\n--- PRUEBA DE ALMACENAMIENTO (STORAGE) ---")
    try:
        client = get_supabase_client()
        if client:
            buckets = client.storage.list_buckets()
            bucket_names = [b.name for b in buckets]
            print(f"✅ Conectado exitosamente. Buckets encontrados: {bucket_names}")
            if "gym_media" not in bucket_names:
                print("⚠️  Advertencia: El bucket 'gym_media' no existe. ¡Debes crearlo!")
        else:
            print("❌ El cliente falló. Verifica SUPABASE_URL y SUPABASE_KEY en tu .env")
    except Exception as e:
        print(f"❌ Error al conectar a Supabase Storage API:\n{e}")

if __name__ == "__main__":
    test_conn()
