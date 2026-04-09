---
tags: [modulo]
---

# Reportes

## Propósito

Consulta y exportación de histórico de asistencias con filtros avanzados, métricas de rendimiento y análisis de puntualidad.

## Endpoint

`GET /api/asistencias` (con filtros) + `GET /api/stats/dashboard` (KPIs)

## Componente: `Reports.jsx`

Layout inspirado en mockup Stitch `01_reportes_asistencia.html`.

### Características
- 4 KPIs: Puntualidad %, Staff activo, Retrasos del mes, Horas totales
- Filtros: nombre (local), departamento, fecha desde/hasta (API)
- Tabla con join de empleados (nombre, cargo, iniciales coloreadas)
- Gráfico "Análisis de Precisión Temporal" (Recharts)
- Tarjeta "Insight Kinetic" con resumen dinámico
- Exportación CSV con datos completos

## Estado

- [x] Backend
- [x] Frontend
- [ ] Testing
