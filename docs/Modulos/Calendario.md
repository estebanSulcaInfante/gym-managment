---
tags: [modulo]
---

# Calendario

## Propósito

Vista mensual tipo calendario para analizar de un vistazo los patrones de asistencia del equipo, con detalle por día y resumen de métricas mensuales.

## Endpoint

`GET /api/stats/calendario?year=2026&month=4`

### Respuesta

| Campo | Tipo | Descripción |
|-------|------|-------------|
| `year` | int | Año consultado |
| `month` | int | Mes consultado |
| `total_empleados` | int | Empleados activos |
| `primer_dia_semana` | int | 0=Lun del primer día |
| `total_dias` | int | Días en el mes |
| `dias` | object | Mapa `{día: data}` con presentes, puntuales, retrasos, ausentes, detalle[] |

### Detalle por día
Cada día incluye un array `detalle` con:
- nombre del empleado, estado, hora entrada/salida, justificación

## Componente: `Calendar.jsx`

### Características
- Grilla de 7 columnas (Lun-Dom) con celdas por día
- Dots de colores por estado (verde=puntual, ámbar=retraso, rojo=ausente)
- Indicador visual del día actual (circulo azul)
- Navegación mes anterior / siguiente
- Panel lateral derecho con resumen del mes (4 KPIs: puntuales, retrasos, ausencias, total)
- Panel detalle del día seleccionado con lista de empleados y su estado
- Leyenda de colores

## Estado

- [x] Backend
- [x] Frontend
- [ ] Testing
