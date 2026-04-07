---
tags: [arquitectura, decision]
---

# ADR 002: Método de Check-in (Kiosko)

**Fecha**: 2026-04-01
**Estado**: Aceptada

## Contexto

El gimnasio necesita un método para que el staff registre su asistencia. Originalmente se pensó en usar lector de huellas biométrico. Sin embargo, en un entorno de gimnasio (callos, magnesia, sudor, desgaste de manos), los lectores de huellas tradicionales suelen fallar mucho y generar fricción. Una huella tampoco es compatible siempre sin hardware especial.

## Opciones Evaluadas

### Opción A: Lector de huella real
- ✅ Difícil de falsificar
- ❌ Alta tasa de fallo por desgaste de manos (entrenadores)
- ❌ Requiere comprar e integrar hardware específico

### Opción B: Reconocimiento Facial
- ✅ Alta integridad
- ✅ Sin contacto (ideal post-entreno)
- ❌ Más complejo de implementar inicialmente y requiere webcam de buena calidad

### Opción C: DNI manual + Foto automática (Seleccionada)
- ✅ **Costo cero**: Usa cualquier tablet o laptop con webcam
- ✅ **Baja fricción**: Integridad mantenida por el factor disuasorio (la foto se guarda con el registro)
- ✅ **Fácil desarrollo**: API de navegador y guardar un string base64 / archivo.

## Decisión

**DNI Manual + Foto Automática vía Webcam**. Se eligió esta opción debido a su relación perfecta entre simplicidad técnica, costo nulo en hardware adicional, y suficiente grado de integridad (disuasivo) para un gimnasio emergente.

## Consecuencias

- El frontend (Kiosko) debe solicitar permisos de cámara en el navegador.
- El backend debe manejar almacenamiento de imágenes.
- El diseño debe acomodar la experiencia de captura.
