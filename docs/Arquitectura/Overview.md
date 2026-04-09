---
tags: [arquitectura]
---

# Overview del Sistema

> Sistema de gestión para un gimnasio emergente. Modular, comenzando con empleados y asistencia.

## Visión General

```
┌─────────────┐     HTTP/JSON     ┌──────────────┐     PostgreSQL
│   Frontend   │ ◄──────────────► │   Backend    │ ◄──────────► 🗄️ Supabase
│ React + TW   │                  │  Flask API   │
└─────────────┘                  └──────────────┘
        │                               │
   Vite Dev Server               Zona: America/Lima
   Puerto :5173                  Puerto :5000
```

## Principios

1. **Modularidad** — Cada módulo funcional es independiente y autocontenido
2. **API-first** — El backend expone una API REST consumida por el frontend
3. **Rendimiento** — Uso de PostgreSQL (Supabase) con optimizaciones de carga (Eager Loading) para minimizar latencia remota.
4. **Iterativo** — Se construye módulo a módulo según prioridad del negocio
5. **Timezone explícito** — Todas las operaciones de fecha/hora usan `America/Lima`

## Módulos

| Módulo | Prioridad | Estado |
|--------|-----------|--------|
| [[Empleados]] | 🔴 Alta | ✅ Implementado |
| [[Asistencia]] | 🔴 Alta | ✅ Implementado |
| [[Dashboard]] | 🟡 Media | ✅ Implementado |
| [[Reportes]] | 🟡 Media | ✅ Implementado |
| [[Autenticacion]] | 🟡 Media | ✅ Implementado |

## Stack

Ver [[Tech Stack]] para detalles y justificación.

## Base de Datos

Ver [[Base de Datos]] para el esquema.
