---
tags: [modulo]
---

# Dashboard

## Propósito

Panel de control operativo en tiempo real. Visualización de métricas de asistencia, staff activo, tendencias semanales y alertas del día.

## Endpoint

`GET /api/stats/dashboard`

### Respuesta

| Campo | Tipo | Descripción |
|-------|------|-------------|
| `presencia_actual` | float | % de empleados presentes hoy |
| `total_empleados` | int | Empleados activos |
| `asistencias_hoy` | int | Registros de hoy |
| `retrasos_hoy` | int | Retrasos de hoy |
| `trabajando_ahora` | int | Con entrada sin salida |
| `puntualidad_promedio` | float | % puntuales del mes |
| `retrasos_mes` | int | Total retrasos del mes |
| `horas_totales_mes` | float | Horas acumuladas del mes |
| `staff_en_turno` | array | Lista de empleados presentes hoy |
| `alertas` | array | Ausencias sin notificar + hitos |
| `chart_data` | array | 7 días: nombre, asistencias, puntuales |

## Componente: `Dashboard.jsx`

Layout inspirado en mockup Stitch `02_dashboard_asistencia.html`.

## Estado

- [x] Backend
- [x] Frontend
- [ ] Testing
