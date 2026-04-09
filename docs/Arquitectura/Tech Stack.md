---
tags: [arquitectura, decision]
---

# Tech Stack

**Decisión tomada**: 2025-04-01
**ADR**: [[ADR 001 - Tech Stack]]

## Stack Elegido

| Capa | Tecnología | Versión |
|------|-----------|---------|
| **Frontend** | React (Vite) | 18+ |
| **Estilos** | Tailwind CSS | 3 |
| **Backend** | Flask (Python) | 3 |
| **Seguridad** | JWT | - |
| **Base de Datos** | PostgreSQL (Supabase) | 15+ |
| **Documentación** | Obsidian | - |

## ¿Por qué este stack?

### Flask (Backend)
- Ligero y minimalista — ideal para un proyecto emergente
- Ecosistema Python familiar
- Fácil de extender con blueprints por módulo

### React + Vite (Frontend)
- Bundle rápido y HMR eficiente con Vite
- Componentes reutilizables para construir UI interactiva
- Ecosistema maduro con muchas librerías

### Tailwind CSS (Estilos)
- Desarrollo rápido con clases utilitarias
- Consistencia visual sin escribir CSS custom
- Soporte para dark mode habilitado

### PostgreSQL / Supabase (Base de Datos)
- Robusto y escalable para producción
- Facilidad de despliegue en la nube
- Rendimiento optimizado mediante Eager Loading (SQLAlchemy) para mitigar latencia de red remota
- JWT integrado para manejo de sesiones stateless
