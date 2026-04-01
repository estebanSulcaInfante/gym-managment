---
tags: [decision, adr]
---

# ADR 001: Tech Stack

**Fecha**: 2025-04-01
**Estado**: Aceptada

## Contexto

Se necesita un sistema de gestión para un gimnasio emergente. El primer módulo será empleados y asistencia. Se requiere un stack que permita desarrollo rápido, sea fácil de desplegar, y pueda crecer con el negocio.

## Opciones Evaluadas

### Opción A: Flask + React + Tailwind + SQLite
- ✅ API separada permite agregar mobile en el futuro
- ✅ React ofrece interactividad completa para dashboards
- ✅ Tailwind + componentes pre-hechos aceleran el desarrollo
- ✅ SQLite simplifica deployment (zero-config, un archivo)
- ❌ Más setup inicial (dos proyectos separados)

### Opción B: Flask + Jinja2 + HTMX + Tailwind
- ✅ Un solo proyecto, más simple de arrancar
- ✅ Server-side rendering, menos JavaScript
- ❌ Menos flexible para UIs complejas
- ❌ Más difícil agregar mobile después

### Opción C: Astro
- ✅ Rápido para sitios de contenido
- ❌ No diseñado para apps CRUD interactivas
- ❌ Islands architecture no ideal para dashboards

## Decisión

**Flask + React + Tailwind + SQLite**. Es el stack más adecuado para un sistema de gestión interactivo que necesita CRUD, dashboards y reportes. La separación API/Frontend permite escalar y agregar clientes mobile en el futuro.

## Consecuencias

- Se mantienen dos proyectos (backend/ y frontend/)
- SQLite es suficiente para un gimnasio emergente, migrar a PostgreSQL si crece
- Se necesita CORS configurado entre Flask y React en desarrollo
