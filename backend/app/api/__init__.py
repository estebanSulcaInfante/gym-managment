from .empleados import bp as empleados_bp
from .asistencias import bp as asistencias_bp
from .stats import bp as stats_bp
from .auth import bp as auth_bp

__all__ = ['empleados_bp', 'asistencias_bp', 'stats_bp', 'auth_bp']
