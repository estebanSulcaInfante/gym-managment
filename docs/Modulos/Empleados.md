---
tags: [modulo]
---

# Empleados

## Propósito

Gestión del personal del gimnasio: registro, edición, activación/desactivación de empleados.

## Modelos de Datos

| Modelo | Tabla | Descripción |
|--------|-------|-------------|
| Usuario | `usuarios` | Cuentas de acceso (Admin/Recepcionista) |
| Empleado | `empleados` | Datos del personal del gimnasio |
| Horario | `horarios` | Turnos flexibles por empleado y día |

## Endpoints API

| Método | Ruta | Descripción |
|--------|------|-------------|
| GET | `/api/empleados` | Listar empleados |
| POST | `/api/empleados` | Crear empleado (y sus horarios iniciales) |
| GET | `/api/empleados/:id` | Obtener empleado (incluye horarios) |
| PUT | `/api/empleados/:id` | Actualizar empleado |
| PUT | `/api/empleados/:id/horarios` | Modificar los turnos del empleado |
| DELETE | `/api/empleados/:id` | Desactivar empleado |

## Componentes UI

- [ ] Lista de empleados (tabla con búsqueda/filtros)
- [ ] Formulario de empleado (crear/editar)
- [ ] Vista de detalle de empleado

## Reglas de Negocio

- Un empleado no se elimina, se desactiva (`activo = false`)
- DNI debe ser único

## Dependencias

- **Depende de**: —
- **Usado por**: [[Asistencia]]

## Estado

- [ ] Diseño
- [ ] Backend
- [ ] Frontend
- [ ] Testing
- [ ] Producción
