---
tags: [decision, adr, seguridad]
---

# ADR 003: Seguridad y Autenticación

**Fecha**: 2026-04-08
**Estado**: Aceptada

## Contexto

El sistema de gestión del gimnasio (KINETIC PRECISION) requiere proteger la información sensible de empleados y métricas de negocio. Inicialmente, el sistema era abierto, lo que exponía endpoints administrativos. Se necesita una solución que permita:
1. Control de acceso para administradores y recepcionistas.
2. Un terminal de Kiosco (Check-in) accesible al público sin loguearse cada vez.
3. Arquitectura desacoplada (Stateless) compatible con la SPA de React.

## Opciones Evaluadas

### Opción A: Session Cookies (Flask-Session)
- ✅ Standard en apps web tradicionales.
- ❌ Requiere manejo de estado en servidor (Redis/DB).
- ❌ Problemas de CORS más complejos con dominios cross-origin.

### Opción B: JSON Web Tokens (JWT)
- ✅ Stateless: El servidor no guarda sesión, solo valida el token.
- ✅ Escala fácilmente.
- ✅ Facilidad para inyectar en el header `Authorization`.
- ✅ Permite roles integrados en el payload.

## Decisión

Se elige **JWT (JSON Web Tokens)** implementado con la librería `PyJWT` en el backend y un `AuthContext` en el frontend.

**Detalles de la implementación**:
- **Tokens**: Expiración de 24 horas.
- **Roles**: `Admin` y `Recepcionista`.
- **Kiosco**: Se separa la ruta físicamente en el Frontend (`/kiosk`) y se mantiene libre de protección en los endpoints de registro de entrada/salida para facilitar la operación en tablets táctiles.

## Consecuencias

- Los usuarios deben loguearse para ver el Dashboard, Reportes y Staff.
- El Frontend debe manejar la persistencia del token en `localStorage`.
- Se introdujo un interceptor global de Axios para añadir el token a cada request y manejar errores 401 (redirección a Login).
- Mayor seguridad en la API mediante decoradores personalizados `@login_required` y `@admin_required`.
