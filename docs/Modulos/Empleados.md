---
tags: [modulo]
---

# Empleados

## Propósito

Gestión del personal del gimnasio: registro, edición, activación/desactivación de empleados.

## Modelos de Datos

| Modelo | Tabla | Descripción |
|--------|-------|-------------|
| Empleado | `empleados` | Datos del personal del gimnasio |

## Endpoints API

| Método | Ruta | Descripción |
|--------|------|-------------|
| GET | `/api/empleados` | Listar empleados |
| POST | `/api/empleados` | Crear empleado |
| GET | `/api/empleados/:id` | Obtener empleado |
| PUT | `/api/empleados/:id` | Actualizar empleado |
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
