---
tags: [arquitectura, decision]
---

# Tech Stack

**Decisión tomada**: 2025-04-01
**ADR**: [[ADR 001 - Tech Stack]]

## Stack Elegido

| Capa | Tecnología | Versión |
|------|-----------|---------|
| **Frontend** | React | - |
| **Estilos** | Tailwind CSS | - |
| **Backend** | Flask (Python) | - |
| **Base de Datos** | SQLite | 3 |
| **Documentación** | Obsidian | - |

## ¿Por qué este stack?

### Flask (Backend)
- Ligero y minimalista — ideal para un proyecto emergente
- Ecosistema Python familiar
- Fácil de extender con blueprints por módulo

### React (Frontend)
- Componentes reutilizables para construir UI interactiva
- Ecosistema maduro con muchas librerías
- Permite construir dashboards y formularios complejos

### Tailwind CSS (Estilos)
- Desarrollo rápido con clases utilitarias
- Componentes prefabricados disponibles (DaisyUI, shadcn/ui)
- Consistencia visual sin escribir CSS custom

### SQLite (Base de Datos)
- Zero-config, un solo archivo
- Ideal para un gimnasio emergente con volumen moderado de datos
- Fácil backup (copiar un archivo)
- Migración futura a PostgreSQL si escala
