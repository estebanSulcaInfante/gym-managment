# 🏋️ Gym Management System

> Sistema de gestión para gimnasio emergente.

## 📐 Arquitectura

- [[Overview]] — Visión general del sistema
- [[Tech Stack]] — Stack tecnológico y justificación
- [[Base de Datos]] — Esquema y modelos de datos

## 📦 Módulos

- [[Empleados]] — Gestión de empleados y horarios semanales ✅
- [[Asistencia]] — Control de asistencia con Kiosco + evaluación de puntualidad ✅
- [[Dashboard]] — Panel operativo en tiempo real con métricas ✅
- [[Calendario]] — Vista mensual de asistencia día a día ✅
- [[Reportes]] — Consulta de historial con filtros y exportación CSV ✅
- [[Autenticacion]] — Seguridad JWT, Login y Roles (Admin/Recepcionista) ✅

## 📝 Decisiones

- [[ADR 001 - Tech Stack]] — Migración a Supabase + JWT
- [[ADR 002 - Metodo Check-in]] — DNI manual + webcam
- [[ADR 003 - Seguridad y Autenticacion]] — Sistema de tokens stateless

## 📅 Diario

_Usa el plugin Daily Notes (`Ctrl/Cmd + P` → "Daily Note") para crear entradas diarias._

---

## 🗂️ Estructura del Proyecto

```
gym-managment/
├── backend/          # Flask API + SQLAlchemy + PostgreSQL
│   ├── app/api/      # Blueprints: empleados, asistencias, stats, auth
│   ├── app/models/   # Modelos: Empleado, Horario, Asistencia, Usuario
│   └── init_db.py    # Script de seed (Supabase)
├── frontend/         # React + Vite + Tailwind + Recharts
│   ├── src/pages/    # Dashboard, Kiosk, Login, Reports, StaffManagement
│   └── src/context/  # Global AuthContext
├── docs/             # 📚 Este vault de Obsidian
└── README.md
```

## 🏷️ Tags Útiles

- `#arquitectura` — Notas de diseño y arquitectura
- `#modulo` — Documentación de módulos
- `#decision` — Decisiones de arquitectura (ADR)
- `#diario` — Notas de desarrollo diarias
- `#bug` — Bugs conocidos
- `#idea` — Ideas para futuras features
