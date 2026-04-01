---
tags: [arquitectura]
---

# Overview del Sistema

> Sistema de gestión para un gimnasio emergente. Modular, comenzando con empleados y asistencia.

## Visión General

```
┌─────────────┐     HTTP/JSON     ┌──────────────┐     SQLite
│   Frontend   │ ◄──────────────► │   Backend    │ ◄──────────► 🗄️ DB
│ React + TW   │                  │  Flask API   │
└─────────────┘                  └──────────────┘
```

## Principios

1. **Modularidad** — Cada módulo funcional es independiente y autocontenido
2. **API-first** — El backend expone una API REST consumida por el frontend
3. **Simplicidad** — SQLite como BD para simplificar deployment y operación
4. **Iterativo** — Se construye módulo a módulo según prioridad del negocio

## Módulos Planificados

| Módulo | Prioridad | Estado |
|--------|-----------|--------|
| [[Empleados]] | 🔴 Alta | Pendiente |
| [[Asistencia]] | 🔴 Alta | Pendiente |

## Stack

Ver [[Tech Stack]] para detalles y justificación.

## Base de Datos

Ver [[Base de Datos]] para el esquema.
