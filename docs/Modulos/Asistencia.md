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

- [ ] Kiosko: input DNI y captura de webcam
- [ ] Feed en tiempo real de entradas/salidas
- [ ] Vista diaria de asistencia (Admin)
- [ ] Reportes con análisis de puntualidad

## Reglas de Negocio

- Solo empleados activos pueden registrar asistencia
- El Kiosko usa DNI manual + foto automática usando la webcam
- La puntualidad (estado) se evalúa contra el `Horario` del empleado
- Se requiere entrada previa para registrar la salida

## Dependencias

- **Depende de**: [[Empleados]]
- **Usado por**: —

## Estado

- [ ] Diseño
- [ ] Backend
- [ ] Frontend
- [ ] Testing
- [ ] Producción
