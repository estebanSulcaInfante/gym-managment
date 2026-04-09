---
tags: [decision, adr]
---

# ADR 001: Tech Stack

**Fecha**: 2025-04-01
**Estado**: Superado (Migración a Supabase completa)

## Contexto

Se necesita un sistema de gestión para un gimnasio emergente. El primer módulo será empleados y asistencia. Se requiere un stack que permita desarrollo rápido, sea fácil de desplegar, y pueda crecer con el negocio. Posteriormente se decidió migrar a la nube para facilitar el acceso remoto y mejorar el rendimiento de consultas complejas.

## Opciones Evaluadas

### Opción A: Flask + React + Tailwind + SQLite (Original)
- ✅ Rápido de prototipar
- ❌ Limitaciones de concurrencia y acceso remoto compartido

### Opción B: PostgreSQL (Supabase) + JWT (Actualizada)
- ✅ Escalabilidad para producción
- ✅ Acceso remoto centralizado
- ✅ Seguridad stateless con JWT para la SPA

## Decisión

**Flask + React + Tailwind + PostgreSQL (Supabase)**. Mantuvimos el core de React/Flask pero migramos la persistencia a **Supabase** para robustez. Implementamos **JWT** como estándar de seguridad para desacoplar la autenticación y facilitar futuras integraciones mobile.

## Consecuencias

- Se utilizan variables de entorno para la conexión segura a la DB.
- Mayor latencia en desarrollo (compensada con técnicas de *Eager Loading* en el backend).
- Sesiones gestionadas por el Frontend mediante tokens, eliminando el estado en servidor.
