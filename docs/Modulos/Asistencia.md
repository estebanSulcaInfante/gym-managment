---
tags: [modulo]
---

# Asistencia

## Propósito

Control de asistencia del personal: registro de entradas y salidas diarias vía kiosco, evaluación automática de puntualidad según horario individual, y generación de métricas operativas.

## Modelos de Datos

| Modelo | Tabla | Descripción |
|--------|-------|-------------|
| Asistencia | `asistencias` | Registros de entrada/salida por empleado |

### Campos de Asistencia
- `empleado_id`, `fecha`, `hora_entrada`, `hora_salida`
- `foto_entrada_url`, `foto_salida_url` (Supabase Storage)
- `estado`: `puntual` | `retraso` | `fuera de turno` | `ausente` | `permiso` | `vacaciones` | `presente`
- `horas_totales`, `observaciones`

## Endpoints API

| Método | Ruta | Protección | Descripción |
|--------|------|------------|-------------|
| GET | `/api/asistencias` | 🛡️ Admin | Listar registros con join empleado + filtros |
| POST | `/api/asistencias/entrada` | 🔓 Público | Registrar entrada (evalúa puntualidad) |
| POST | `/api/asistencias/salida` | 🔓 Público | Registrar salida (calcula horas) |
| GET | `/api/stats/dashboard` | 🛡️ Login | Métricas: presencia, puntualidad, retrasos, staff en turno, alertas |
| GET | `/api/stats/empleado/:id` | 🛡️ Login | Métricas individuales por empleado |

### Filtros soportados en GET `/api/asistencias`
- `?limit=N` — Cantidad de registros
- `?empleado_id=X` — Por empleado específico
- `?desde=YYYY-MM-DD&hasta=YYYY-MM-DD` — Rango de fechas
- `?departamento=Fitness` — Por departamento

## Componentes UI

### Kiosco (`Kiosk.jsx`)
- [x] Input de DNI para marcar entrada/salida
- [x] Captura de foto con webcam (upload a Supabase Storage)
- [x] Feedback visual del registro (nombre, estado)

### Dashboard (`Dashboard.jsx`)
- [x] KPI: Presencia actual (%) con indicador
- [x] KPI: Staff activo X/Y
- [x] KPI: Retrasos hoy con alerta naranja
- [x] Gráfico de barras semanal (total + puntuales) — Recharts
- [x] Panel "Staff en Turno" en vivo con estado por empleado
- [x] Alertas del día dinámicas (ausencias, hitos de puntualidad)
- [x] Barra resumen mensual (puntualidad %, retrasos, horas, empleados)

### Reportes (`Reports.jsx`)
- [x] 4 KPIs: Puntualidad %, Staff, Retrasos mes, Horas mes
- [x] Filtros: búsqueda por nombre, departamento, rango de fechas
- [x] Tabla detallada con nombre del empleado, iniciales, cargo, status badges
- [x] Gráfico de Análisis de Precisión Temporal
- [x] Tarjeta "Insight Kinetic" con resumen dinámico
- [x] Exportación a CSV (con nombres de empleados)

## Reglas de Negocio

- Solo empleados activos pueden registrar asistencia
- El Kiosco usa DNI manual + foto automática usando la webcam
- La puntualidad se evalúa contra el `Horario` del día actual del empleado:
  - **Puntual**: llega hasta 15 min después de la hora pautada
  - **Retraso**: llega más de 15 min tarde
  - **Fuera de turno**: marca en un día sin horario asignado
- No se puede marcar entrada dos veces el mismo día
- Se requiere entrada previa para registrar la salida
- Al marcar salida se calculan automáticamente las `horas_totales` (Si el usuario olvida marcar salida, queda como `None` forzando edición manual)
- Todas las horas se calculan en zona `America/Lima`

## Dependencias

- **Depende de**: [[Empleados]] (empleado + horarios)
- **Usado por**: Dashboard, Reportes
- **Librerías**: `recharts` (frontend), `zoneinfo`+`tzdata` (backend)

## ¿Qué falta para módulo completo?

### Funcionalidades pendientes
- [ ] **Justificación de ausencias** — Campo para adjuntar motivo (permiso, enfermedad, vacaciones)
- [ ] **Resumen por empleado en UI** — Vista dedicada con historial individual del mes (endpoint ya existe)
- [ ] **Notificaciones de retraso** — Alerta push o email al llegar tarde
- [ ] **Exportar PDF** — Botón para generar reporte imprimible (adicional al CSV)

### Funcionalidades implementadas recientemente
- [x] **Evaluación Perezosa de Ausencias (Lazy Derivation)** — Ya no se insertan registros de `ausente` automáticamente. En cambio, el Dashboard y los Reportes derivan las faltas on-the-fly contrastando los horarios contra las asistencias. Esto incluye "Protección Cold-Start" para empleados nuevos.
- [x] **Integridad Inquebrantable de BD** — Integración agresiva de `ON DELETE SET NULL` para `horario_id` impidiendo crashes de servidor al editar reglas pasadas.
- [x] **Gestión histórica de turnos (Snapshots)** — Protección contra manipulaciones si se altera el horario posteriormente.
- [x] **Edición manual de asistencias** — Admin puede corregir hora de entrada/salida directamente desde el frontend de Reportes.

### Infraestructura pendiente
- [ ] **Paginación** — El endpoint de asistencias necesita paginación real para escalar (ya modelado en servidor, por implementarse en vista)

### Infraestructura implementada
- [x] **Autenticación** — Proteger endpoints admin (solo Kiosco público)
- [x] **Tests automatizados (E2E y Unitarios)** — Cobertura robusta de la lógica de aritmética en turnos que cruzan la medianoche y derivación de ausencias.

## Estado

- [x] Diseño (Stitch mockup)
- [x] Backend (entrada/salida + evaluación de puntualidad + stats lazy evaluation)
- [x] Frontend (Kiosco + Dashboard + Reportes + Edición Manual)
- [x] Testing (Suite Playwright de 9 escenarios 100% stable)
