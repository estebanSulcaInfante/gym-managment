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
    EMPLEADO {
        int id PK
        string nombre
        string apellido
        string dni
        string cargo
        string telefono
        bool activo
        datetime created_at
    }
    
    ASISTENCIA {
        int id PK
        int empleado_id FK
        date fecha
        time hora_entrada
        time hora_salida
        string observaciones
    }
    
    EMPLEADO ||--o{ ASISTENCIA : "registra"
```

## Migraciones

_Herramienta de migraciones por definir (Flask-Migrate / Alembic)._

## Backup

SQLite permite backup simplemente copiando el archivo `.db`.
