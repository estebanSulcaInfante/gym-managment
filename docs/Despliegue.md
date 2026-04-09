# 🚀 Guía de Despliegue

El proyecto está preparado para ser desplegado en servicios PaaS modernos como **Render**, **Railway**, o **Vercel / Heroku**.

La arquitectura se divide en dos componentes desplegables de manera independiente.

---

## 1. Backend (Flask API)

El backend es compatible con despliegues a servicios contenerizados o basados en Buildpacks (como Render Web Services o Heroku).

### Archivos de Configuración Incluidos
- `Procfile`: Define cómo arrancar el servidor usando Gunicorn (`web: gunicorn run:app`).
- `runtime.txt`: Obliga a usar Python 3.12 asegurando ambiente idéntico a local.
- `requirements.txt`: Dependencias, incluye `pg8000` para Supabase y `gunicorn`.

### Variables de Entorno Requeridas en Producción
Para desplegar el backend, debes configurar las siguientes variables secretas en el panel de tu hosting:
- `SECRET_KEY`: Una cadena segura larga para encriptar los tokens JWT (ej. `generar-un-hash-aqui`).
- `DATABASE_URL`: URL de conexión a Supabase (PostgreSQL). Ej: `postgresql+pg8000://postgres:[PASSWORD]@[HOST]:6543/postgres`.
- `SUPABASE_URL`: (Opcional si usas kiosco fotos) La URL base generada en tu Dashboard de Supabase.
- `SUPABASE_KEY`: (Opcional si usas kiosco fotos) La *service_role* key o *anon* key de Supabase Storage.

### Alternativas de Hosting
1. **Render (Recomendado)**: Crea un "Web Service", conecta tu repo de GitHub. Como Build Command usa `pip install -r requirements.txt` y Start Command el de Procfile `gunicorn run:app`.
2. **Railway**: Detecta automáticamente el Procfile y gestiona el despliegue automático.

---

## 2. Frontend (React + Vite)

El frontend es una Single Page Application (SPA), lo que lo hace perfecto para hostings estáticos rápidos y gratuitos globales.

### Preparación Relizada
- La base URL de Axios fue migrada de `http://localhost:5000/api` a intentar leer `import.meta.env.VITE_API_URL`.

### Variables de Entorno Requeridas
- `VITE_API_URL`: La URL pública donde hayas desplegado tu Backend Flask en el paso 1 (ej. `https://mi-gimnasio-api.onrender.com/api`). 

### Alternativas de Hosting
1. **Vercel (Recomendado)**: Conecta el repo, selecciona el directorio `frontend`. Vercel detecta que es Vite (`npm install` -> `npm run build`), configuras el `VITE_API_URL` en sus environment variables y se despliega la carpeta `dist`.
2. **Netlify**: Similar a Vercel, con excelente soporte para React Router y rutas dinámicas.

---

## Recomendaciones Finales Post-Despliegue

1. **Revisar CORS**: Aunque el backend tiene `CORS(app)` que permite todo tráfico (bueno para empezar), en producción es aconsejable modificar `backend/app/__init__.py` para aceptar peticiones *solo* desde la URL de tu frontend en Vercel.
2. **First-Run**: Tras desplegar, accede a la URL y crea tu usuario Admin base (si no lo hiciste en local o si reiniciaste tu base en Supabase).
