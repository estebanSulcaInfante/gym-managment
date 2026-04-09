---
title: ADR 004 - Integridad Histórica de Asistencias (Snapshot Pattern)
date: 2026-04-09
status: Accepted
---

# ADR 004: Adopción de "Snapshot Pattern" para Registros Históricos de Asistencia

## Contexto

El sistema original calculaba el estado de puntualidad y reconstruía jornadas antiguas comparando la fecha del registro con el `Horario` de la tabla de empleados iterativamente. 

Esto creaba **5 clases de vulnerabilidades y corrupción iterativa de datos (phantom absences)** cada vez que un administrador editaba el turno de un empleado en el CRM de Staff:
1. Al evaluar días pasados, el algoritmo usaba reglas del futuro.
2. Un empleado que no debía venir el lunes pasado (pero ahora se le asignó lunes), aparecía falsamente como "Ausente".
3. Reportes alteraban retroactivamente si el registro de entrada fue puntual o tardío, cambiando la estadística real histórica del periodo.
4. Auto-cierres de jornada que calculaban el tope horario sobre una base inexistente.
5. Inconsistencia persistente que requería trabajo manual diario de re-conciliación.

## Decisión Técnica Adoptada

Abandonar la estrategia de "Join Selectivo" para métricas históricas integrando dos defensas arquitecturales simultáneas:

1. **Snapshot Inmutable (Base de Tiempos):** Añadir campos `hora_entrada_programada` y `hora_salida_programada` directo en el modelo relacional `Asistencia`.
   Al momento en que el Kiosko genera un `POST /api/asistencias/entrada`, el servidor lee el patrón actual, toma un snapshot y lo encapsula. Toda validación posterior en el dashboard dependerá del snapshot, convirtiéndolo en un registro auditable resistente a manipulaciones futuras del esquema.

2. **Temporal Guards (Guardias de Versionado):** Se agregó una marca de `updated_at` a la tabla `Horario` para rastrear cuándo cambió el modelo de horario por última vez.
   En los jobs de auto-cierre y aserción de ausencias, se implementó el guard lógico `horario.updated_at.date() <= fecha_evaluada`. De esta forma, el sistema ignora cualquier jornada configurada *después* del día retroactivo que se está analizando.

## Consecuencias

### Positivas
* La información es estricta e inmutable en sus estados históricos.
* Todos los endpoints de reportes reflejan la realidad de negocio del momento de marcación, no del momento de consulta, mejorando la confianza del usuario.
* Desacople relacional parcial que optimiza los queries del Dashboard.

### Negativas / Trade-offs
* Altera la estructura de la base de datos requiriendo migración y uso de storage para dos campos de hora adicionales.
* Requiere retrocompatibilidad si la base de datos se consulta para datos más viejos que no tuvieran snapshots (`COALESCE` con valor legacy).

## Opciones Alternativas Consideradas (Y Rechazadas)
- **Bloqueo de Edición (Opción A):** Prohibir la edición de horarios pasados. Denegada porque imposibilita correcciones legítimas de RRHH y reduce la flexibilidad de la plataforma.
- **Tabla Histórica Separada (Opción B):** Mantener un `Horario_History` versionado usando trigers en PostgreSQL. Positiva, pero consideraba una sobreingeniería excesiva para los requisitos, además de impactar latencia en la lectura. La solución de Snapshot Pattern sobre la tabla transaccional (Asistencia) resolvió lo mismo con extrema solidez pero un footprint en modelo/código menor.
