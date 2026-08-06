# Demo publica en Render y Supabase

## Objetivo

Esta demo permite evaluar el flujo de Sport Gym sin publicar una instancia de
produccion. Usa datos ficticios, una base de datos exclusiva y un acceso de
exploracion emitido por el servidor. No reutiliza usuarios, fotos ni datos de
ningun gimnasio real.

## Arquitectura

```text
Navegador
  -> Render Static Site (React/Vite)
  -> Render Web Service (Flask/Gunicorn)
  -> Supabase Postgres: proyecto exclusivo gym-demo
```

El frontend no se conecta directamente a Supabase. La API Flask es la unica
que usa `DATABASE_URL`; por eso la base no necesita exponerse a la Data API
ni usar una clave anonima en el navegador.

## Variables de entorno

API en Render:

```text
DATABASE_URL=postgresql+pg8000://...
SECRET_KEY=<generada-por-Render>
CORS_ORIGINS=https://<dominio-del-static-site>.onrender.com
DEMO_MODE=true
DEMO_DATABASE_LABEL=gym-demo
```

Static Site en Render:

```text
VITE_API_URL=https://<dominio-de-la-api>.onrender.com/api
VITE_DEMO_MODE=true
```

Los archivos `.env.example` solo sirven como plantilla local. No subir una
cadena de conexion, claves de Supabase ni otros secretos al repositorio.

## Datos y reinicio

`backend/demo_seed.py` crea cuatro empleados ficticios, horarios de lunes a
viernes y un historial determinista de asistencia. El proceso solo borra datos
si coinciden ambas protecciones:

```text
DEMO_MODE=true
DEMO_DATABASE_LABEL=gym-demo
```

Ademas requiere estas dos banderas explicitas:

```bash
python demo_seed.py --reset --confirm-gym-demo-reset
```

La API comprueba al arrancar si estos datos existen y los crea una sola vez.
Para restaurar la demo despues, ejecutar ese mismo comando manualmente desde
la Shell del servicio. No se programa un reinicio automatico: asi una persona
que evalua la demo no pierde su sesion ni los cambios mientras la explora.

## Provisionamiento

1. Crear en Supabase un proyecto nuevo llamado `gym-demo`, separado de los
   proyectos existentes.
2. Copiar su cadena de conexion Postgres a `DATABASE_URL` del servicio API.
3. Crear los dos servicios de Render desde `render.yaml` como Blueprint.
4. Cuando Render asigne el dominio del frontend, completar `CORS_ORIGINS` en
   la API y `VITE_API_URL` en el Static Site, y volver a desplegar ambos.
5. Abrir la demo y usar `Explorar demo` para comprobar el panel y el kiosco.

## Limites de la demo

- El kiosco no pide camara ni guarda fotos.
- Las identidades y telefonos de ejemplo son ficticios.
- La instancia se suspende cuando no tiene trafico si usa el plan gratuito de
  Render; el primer acceso puede tardar unos segundos.
- No exponer las tablas de esta base mediante la Data API de Supabase.
