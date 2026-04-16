---
title: ADR 006 - Eliminación de Conciliación y Transición a Evaluación Perezosa
date: 2026-04-15
status: Accepted
---

# ADR 006: Reemplazo de Sistema de Conciliación por Evaluación Perezosa ("Lazy Derivation")

## Contexto

El sistema previamente intentaba forzar la integridad de los datos asumiendo o "adivinando" qué debió haber pasado si un empleado no interactuaba con el Kiosco. El módulo de **Conciliación** ejecutaba escaneos y:
1. Insertaba falsamente registros con estado `Ausente` para los que no vinieron.
2. Auto-completaba `hora_salida` a los que olvidaban marcar.

Esto propiciaba registros contaminados, exigía mantener pesado código de predicción, y generaba alertas molestas de "Conciliación Pendiente" para el administrador. Además, causaba el problema del "Cold Start", inundando el sistema de "Ausencias" en los días previos a la fecha en que el gimnasio realmente decidiera utilizar oficialmente el sistema tras haber creado los perfiles.

Adicionalmente, se detectaron fallos críticos (`500 Internal Server Error`) impulsados por colisiones de Foreign Keys (FK) cuando un empleado alteraba su bloque de horario y aún existían registros históricos atados al esquema viejo.

## Decisión Técnica Adoptada

1. **Destrucción Pragmática (Scraping):** Eliminar por completo el módulo de "Conciliación" manual o automática (`/api/asistencias/conciliar`). No escribir en BD ausencias falsas ni forzar horas de salida incorrectas. Si un empleado no marca salida, su registro se queda abierto (`None`) requiriendo intervención auditable del administrador o de él mismo al día siguiente. No se regalan horas.
2. **Evaluación Perezosa (Lazy Derivation):** Los endpoints de lectura o de "Dashboard" (`stats.py`) infieren dinámicamente las inasistencias en memoria durante el tiempo de ejecución (comparando `horarios` contra `asistencias` tomadas). Un empleado cuenta como ausente si "un bloque de tiempo programado hoy ya sobrepasó los 15 minutos en la realidad actual y no ha marcado entrada".
3. **Cold-Start Protection:** `stats.py` ahora implementa un flag de validación histórica (`ids_con_historial`). Ninguna alerta de inasistencia será proyectada contra un perfil de empleado si éste jamás ha interactuado en toda la vida útil de su existencia en la tabla Asistencia. Evitando así "ausencias" masivas en tiempos previos al lanzamiento.
4. **Resguardo de FK:** Se aplicó explícitamente y se delegó la carga a la Base de Datos con `ON DELETE SET NULL` para `asistencias.horario_id`. Eliminar y reemplazar horarios nunca volverá a crashear asistencias previas.
5. **Aritmética Modular para Medianoches:** Los cálculos de ventanas temporales utilizaron `(minutos % 1440)` para prevenir los valores negativos absurdos que rompían algoritmos a horas cercanas a la madrugada.

## Consecuencias

### Positivas
* ~400 líneas menos de lógica predictiva inestable y tests redundantes.
* La base de datos contiene ahora información 100% limpia y real, nunca interpolada ni imaginada.
* Experiencia UX del Administrador sin estrés y sin requerir rutinas aburridas de cierre diario ("Conciliar pendientes").
* Estabilidad absoluta al cambiar esquemas de turnos y protección limpia contra "Go-Live" tardíos.

### Negativas
* Al no insertarse en base de datos la "ausencia", exportar un CSV de asistencias mostrará solo las personas que sí fueron, delegando la tarea de cruzar "quién faltó" a la visión del administrador sobre su nómina o a un futuro reporte lazy exportable.
* Empleados que olvidan marcar su salida tendrán `horas_totales = 0` o nulo para ese día, obligando corrección manual. Esto, no obstante, aumenta la rendición de cuentas (accountability).
