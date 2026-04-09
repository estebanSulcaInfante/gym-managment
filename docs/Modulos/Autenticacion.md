---
tags: [modulo, seguridad]
---

# Autenticación

## Propósito

Asegurar el sistema de gestión del gimnasio permitiendo el acceso solo a personal autorizado, diferenciando permisos entre Administradores y Recepcionistas.

## Funcionamiento Técnico

Se utiliza **JWT (JSON Web Tokens)** para una autenticación sin estado (stateless). El servidor valida el token en cada petición protegida.

### Flujo de Login
1. El usuario ingresa credenciales en `/login`.
2. El Backend verifica contra la DB (PostgreSQL) usando hashes de contraseñas (`werkzeug.security`).
3. Si es correcto, el servidor devuelve un token JWT y un objeto `user`.
4. El Frontend (React) guarda el token en `localStorage`.
5. Todas las llamadas posteriores incluyen el header `Authorization: Bearer <token>`.

## Roles y Permisos

| Rol | Alcance | Ejemplo de Permisos |
|-----|---------|---------------------|
| **Admin** | Acceso Total | Crear empleados, eliminar registros, gestionar usuarios. |
| **Recepcionista** | Operativo | Ver dashboard, ver reportes, ver staff. |
| **Kiosco** | Público (No Login) | Registrar entrada y salida (Público). |

## Endpoints de Seguridad

| Método | Ruta | Descripción |
|--------|------|-------------|
| POST | `/api/auth/login` | Recibe `username` y `password`, retorna token + user info. |
| GET | `/api/auth/me` | Retorna la información del usuario del token actual. |
| POST | `/api/auth/users` | (Solo Admin) Permite crear nuevos usuarios en el sistema. |

## Interfaz de Usuario

### Login Page (`Login.jsx`)
- Diseño oscuro con efectos "Glow" y cristalería (Glassmorphism).
- Redirección automática al Dashboard tras el éxito.
- Manejo de errores de credenciales inválidas.

### Sidebar dinámico
- Muestra el nombre e inicial del usuario logueado.
- Botón de **Cerrar Sesión** que limpia los tokens y redirige a Login.
- Oculta automáticamente secciones administrativas (como Staff) si el usuario no es Admin.

## Estado
- [x] Backend JWT (PyJWT) - Implementado ✅
- [x] Frontend Context (AuthContext) - Implementado ✅
- [x] Rutas Protegidas (ProtectedRoute) - Implementado ✅
- [x] Gestión de Roles - Implementado ✅
