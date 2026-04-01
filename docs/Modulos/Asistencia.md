---
tags: [modulo]
---

# Asistencia

## Propósito

Control de asistencia del personal: registro de entradas y salidas diarias.

## Modelos de Datos

| Modelo | Tabla | Descripción |
|--------|-------|-------------|
| Asistencia | `asistencias` | Registros de entrada/salida por empleado |

## Endpoints API

| Método | Ruta | Descripción |
|--------|------|-------------|
| GET | `/api/asistencias` | Listar registros (con filtros de fecha) |
| POST | `/api/asistencias/entrada` | Registrar entrada |
| PUT | `/api/asistencias/:id/salida` | Registrar salida |
| GET | `/api/asistencias/reporte` | Reporte de asistencia |

## Componentes UI

- [ ] Vista diaria de asistencia
- [ ] Botón de marcar entrada/salida
- [ ] Reporte/resumen semanal o mensual

## Reglas de Negocio

- Solo empleados activos pueden registrar asistencia
- Una entrada por día por empleado
- La salida solo se registra si existe una entrada previa

## Dependencias

- **Depende de**: [[Empleados]]
- **Usado por**: —

## Estado

- [ ] Diseño
- [ ] Backend
- [ ] Frontend
- [ ] Testing
- [ ] Producción
