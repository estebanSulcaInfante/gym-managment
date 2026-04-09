import os
import base64
import uuid
from supabase import create_client, Client

def get_supabase_client() -> Client:
    url = os.environ.get("SUPABASE_URL")
    key = os.environ.get("SUPABASE_KEY")
    if not url or not key:
        return None
    return create_client(url, key)

def upload_base64_image(b64_string: str, bucket: str = 'gym_media', folder: str = 'kiosco') -> str:
    """Sube un string base64 a Supabase Storage y retorna la URL pública."""
    if not b64_string or not b64_string.startswith('data:image/'):
        return b64_string # No es un b64 válido o es ya una URL
        
    client = get_supabase_client()
    if not client:
        print("Warning: Supabase client no configurado. Faltan variables de entorno.")
        return ""

    try:
        header, encoded = b64_string.split(",", 1)
        # Extraer extension del header (data:image/jpeg;base64)
        ext = header.split(';')[0].split('/')[1]
        
        file_bytes = base64.b64decode(encoded)
        filename = f"{folder}/{uuid.uuid4()}.{ext}"
        
        client.storage.from_(bucket).upload(
            file=file_bytes,
            path=filename,
            file_options={"content-type": f"image/{ext}"}
        )
        
        return client.storage.from_(bucket).get_public_url(filename)
    except Exception as e:
        print(f"Error subiendo imagen a Supabase: {e}")
        return ""
