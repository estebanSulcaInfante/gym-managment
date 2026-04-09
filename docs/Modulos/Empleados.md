---
tags: [modulo]
---

# Empleados

## Propósito

Gestión del personal del gimnasio: registro, edición, activación/desactivación de empleados con horarios semanales flexibles.

## Modelos de Datos

| Modelo | Tabla | Descripción |
|--------|-------|-------------|
| Usuario | `usuarios` | Cuentas de acceso (Admin/Recepcionista) |
| Empleado | `empleados` | Datos del personal del gimnasio |
| Horario | `horarios` | Turnos flexibles por empleado y día (L-D) |

## Endpoints API

| Método | Ruta | Descripción |
|--------|------|-------------|
| GET | `/api/empleados` | Listar empleados (incluye horarios) |
| POST | `/api/empleados` | Crear empleado con horarios semanales |
| GET | `/api/empleados/:id` | Obtener empleado (incluye horarios) |
| PUT | `/api/empleados/:id` | Actualizar empleado y horarios |
| DELETE | `/api/empleados/:id` | Desactivar empleado (soft delete) |

## Componentes UI

- [x] Lista de empleados (tabla con búsqueda, filtros, avatares)
- [x] Modal de crear/editar empleado con grilla de horarios semanales (L-D)
- [x] Botón de editar (ícono lápiz) y desactivar por empleado

## Reglas de Negocio

- Un empleado no se elimina, se desactiva (`activo = false`)
- DNI debe ser único y numérico (8 dígitos)
- Cada empleado tiene exactamente 7 registros de horario (uno por día)
- Los días sin turno se dejan con entrada/salida en blanco
- Un empleado no puede tener dos horarios distintos el mismo día

## Dependencias

- **Depende de**: —
- **Usado por**: [[Asistencia]], [[Dashboard]], [[Reportes]]

## Estado

- [x] Diseño (Stitch mockup)
- [x] Backend (CRUD + horarios)
- [x] Frontend (tabla + modal con grilla semanal)
- [x] Testing
