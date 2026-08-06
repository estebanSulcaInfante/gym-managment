# 🏋️ Gym Management System

Sistema de gestión para gimnasio emergente.

## Tech Stack

| Capa | Tecnología |
|------|-----------|
| Backend | Flask (Python) + SQLite |
| Frontend | React + Tailwind CSS |
| Docs | Obsidian |

## Estructura

```
gym-managment/
├── backend/          # Flask API
├── frontend/         # React + Tailwind
├── docs/             # Documentación (Obsidian vault)
├── .obsidian/        # Configuración de Obsidian
└── README.md
```

## Documentación

Este repositorio incluye un vault de [Obsidian](https://obsidian.md/) para documentar la arquitectura, decisiones técnicas y desarrollo del proyecto.

### Cómo usar

1. Instalar [Obsidian](https://obsidian.md/)
2. **Open folder as vault** → seleccionar la carpeta `gym-managment/`
3. El dashboard principal es `docs/Home.md`

### Estructura del vault

| Carpeta | Contenido |
|---------|-----------|
| `docs/Arquitectura/` | Visión general, tech stack, base de datos |
| `docs/Modulos/` | Documentación por módulo funcional |
| `docs/Decisiones/` | Architecture Decision Records (ADR) |
| `docs/Diario/` | Notas diarias de desarrollo |
| `docs/Templates/` | Templates reutilizables |

## Módulos

- [x] **Empleados** — Gestión del personal _(en desarrollo)_
- [x] **Asistencia** — Control de entrada/salida _(en desarrollo)_

## Setup

_Por documentar al inicializar el proyecto._

## Demo publica

La version de portafolio se prepara como una demo aislada: React/Vite en un
Static Site de Render, Flask en un Web Service y una base Postgres exclusiva
en Supabase. Incluye datos ficticios y un acceso `Explorar demo` sin revelar
una contrasena publica.

La guia completa, las variables necesarias y el procedimiento seguro de
reinicio estan en [docs/DespliegueDemo.md](docs/DespliegueDemo.md). El archivo
[render.yaml](render.yaml) describe los dos servicios que se crean en Render.
