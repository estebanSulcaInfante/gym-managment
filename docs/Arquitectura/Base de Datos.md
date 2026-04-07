---
tags: [arquitectura]
---

# Base de Datos

> SQLite — archivo único, zero-config.

## Ubicación

```
backend/instance/gym.db
```

## Esquema

_Por definir al implementar los módulos [[Empleados]] y [[Asistencia]]._

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
    }
    
    ASISTENCIA {
        int id PK
        int empleado_id FK
        date fecha
        time hora_entrada
        time hora_salida
        string foto_entrada_url
        string foto_salida_url
        string estado "puntual|retraso|ausente"
        float horas_totales
        string observaciones
        datetime created_at
    }
    
    USUARIO ||--o| EMPLEADO : "vinculado a"
    EMPLEADO ||--o{ HORARIO : "tiene"
    EMPLEADO ||--o{ ASISTENCIA : "registra"
```

## Migraciones

_Herramienta de migraciones por definir (Flask-Migrate / Alembic)._

## Backup

SQLite permite backup simplemente copiando el archivo `.db`.
