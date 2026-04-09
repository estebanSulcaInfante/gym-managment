---
tags: [arquitectura]
---

# Base de Datos

> PostgreSQL — Hospedado en Supabase (Cloud).

## Conexión

```bash
# Configurado vía variable de entorno en backend/.env
DATABASE_URL="postgresql+pg8000://..."
```

## Esquema

El esquema se gestiona mediante **SQLAlchemy** y **Flask-Migrate**.

## Diagrama ER

```mermaid
erDiagram
    USUARIO {
        int id PK
        string username UK
        string password_hash
        string rol "admin|recepcionista"
        int empleado_id FK "nullable"
        bool activo
    }

    EMPLEADO {
        int id PK
        string nombre
        string apellido
        string dni UK
        string cargo
        string departamento
        string telefono
        string foto_url
        bool activo
        datetime created_at
        datetime updated_at
    }

    HORARIO {
        int id PK
        int empleado_id FK
        int dia_semana "0=Lun..6=Dom"
        time hora_entrada
        time hora_salida
        bool activo
        datetime updated_at "Para Tracking de Modificaciones"
    }
    
    ASISTENCIA {
        int id PK
        int empleado_id FK
        date fecha
        time hora_entrada
        time hora_salida
        time hora_entrada_programada "Snapshot INMUTABLE"
        time hora_salida_programada "Snapshot INMUTABLE"
        string foto_entrada_url
        string foto_salida_url
        string estado "puntual|retraso|ausente|fuera de turno..."
        float horas_totales
        string observaciones
        datetime created_at
    }
    
    USUARIO ||--o| EMPLEADO : "vinculado a"
    EMPLEADO ||--o{ HORARIO : "tiene"
    EMPLEADO ||--o{ ASISTENCIA : "registra"
```

## Patrones de Datos

### Snapshots de Horario
Para asegurar la integridad histórica, las reglas de turnos se capturan en la tabla `ASISTENCIA` (`hora_entrada_programada` y `hora_salida_programada`) en el momento que ocurre el evento (Kiosko) o se evalúan ausencias pasadas. 
Esto evita "phantom absences" y corrupción de datos cuando los horarios de un empleado cambian retrospectivamente.

## Migraciones

_Herramienta de migraciones por definir (Flask-Migrate / Alembic)._

## Backup

SQLite permite backup simplemente copiando el archivo `.db`.
