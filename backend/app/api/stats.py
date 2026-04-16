from flask import Blueprint, jsonify, request
from zoneinfo import ZoneInfo
from sqlalchemy import func, extract
from app.models import Empleado, Asistencia
from app import db
from datetime import datetime, date, timedelta
from app.decorators import login_required

LIMATZ = ZoneInfo("America/Lima")

bp = Blueprint('stats', __name__, url_prefix='/api/stats')

@bp.route('/dashboard', methods=['GET'])
@login_required
def get_dashboard_stats():
    hoy = datetime.now(LIMATZ).date()
    
    # Total empleados activos
    # --- Mapeo de Empleados en memoria (Cache) ---
    empleados_activos = Empleado.query.filter_by(activo=True).all()
    total_empleados = len(empleados_activos)
    emp_map = {e.id: e for e in empleados_activos}

    primer_dia_mes = hoy.replace(day=1)
    lunes_semana = hoy - timedelta(days=hoy.weekday())  # Lunes de esta semana
    fecha_minima = min(primer_dia_mes, lunes_semana)

    # Solo hacemos 1 query a la BD para todas las asistencias necesarias
    asistencias_base = Asistencia.query.filter(Asistencia.fecha >= fecha_minima).all()

    asistencias_mes = [a for a in asistencias_base if a.fecha >= primer_dia_mes]
    asistencias_7d = [a for a in asistencias_base if a.fecha >= lunes_semana]
    asistencias_hoy = [a for a in asistencias_base if a.fecha == hoy]

    total_hoy = len(asistencias_hoy)
    
    # Trabajando ahora (marcaron entrada pero no salida)
    trabajando_ahora = len([a for a in asistencias_hoy if a.hora_entrada and not a.hora_salida])
    
    # Retrasos hoy
    retrasos_hoy = len([a for a in asistencias_hoy if a.estado == 'retraso'])

    # Presencia actual (% de empleados que vinieron hoy vs total activos)
    presencia_actual = round((total_hoy / total_empleados * 100), 1) if total_empleados > 0 else 0

    total_mes = len(asistencias_mes)
    puntuales_mes = len([a for a in asistencias_mes if a.estado == 'puntual'])
    retrasos_mes = len([a for a in asistencias_mes if a.estado == 'retraso'])
    puntualidad_promedio = round((puntuales_mes / total_mes * 100), 1) if total_mes > 0 else 0

    horas_totales_mes = round(sum(a.horas_totales or 0 for a in asistencias_mes), 1)

    # --- Staff en turno (empleados que marcaron hoy) ---
    staff_en_turno = []
    for a in asistencias_hoy:
        emp = emp_map.get(a.empleado_id)
        if emp:
            staff_en_turno.append({
                'id': emp.id,
                'nombre': f"{emp.nombre} {emp.apellido}",
                'cargo': emp.cargo,
                'estado': a.estado or 'sin estado',
                'trabajando': bool(a.hora_entrada and not a.hora_salida),
                'hora_entrada': str(a.hora_entrada)[:5] if a.hora_entrada else None
            })

    # --- Alertas del día (derivación lazy de inasistencias) ---
    alertas = []
    # Precargar horarios de hoy para evitar N+1 queries
    from app.models import Horario
    ahora_time = datetime.now(LIMATZ).time()
    horarios_hoy = Horario.query.filter_by(dia_semana=hoy.weekday()).all()
    
    # Agrupar bloques por empleado (un empleado puede tener N bloques)
    from collections import defaultdict
    bloques_por_emp = defaultdict(list)
    for h in horarios_hoy:
        if h.hora_entrada:
            bloques_por_emp[h.empleado_id].append(h)

    # Variables previas
    ids_presentes = {a.empleado_id for a in asistencias_hoy}
    
    # Obtener IDs de empleados que tienen AL MENOS un registro en el sistema (Opción A)
    empleados_con_historial = db.session.query(Asistencia.empleado_id).distinct().all()
    ids_con_historial = {r[0] for r in empleados_con_historial}

    for emp in empleados_activos:
        # Opción A: Cold Start Protection
        # Solo considerar empleados si ya tienen al menos un registro histórico en el sistema.
        # Esto evita inasistencias fantasma antes de que empiecen a usar el sistema.
        if emp.id not in ids_con_historial:
            continue
            
        bloques_emp = bloques_por_emp.get(emp.id, [])
        if bloques_emp and emp.id not in ids_presentes:
            # Solo alertar si al menos un bloque ya debería haber empezado (hora_entrada + 15 min)
            bloques_vencidos = [
                b for b in bloques_emp
                if (b.hora_entrada.hour * 60 + b.hora_entrada.minute + 15) <= (ahora_time.hour * 60 + ahora_time.minute)
            ]
            if bloques_vencidos:
                primer_bloque = min(bloques_vencidos, key=lambda b: b.hora_entrada)
                alertas.append({
                    'tipo': 'ausencia',
                    'titulo': 'Ausencia sin notificar',
                    'mensaje': f"{emp.nombre} {emp.apellido} no ha registrado entrada (Turno {str(primer_bloque.hora_entrada)[:5]}).",
                })
    
    # Hito de puntualidad
    if puntualidad_promedio >= 90:
        alertas.append({
            'tipo': 'hito',
            'titulo': 'Hito Alcanzado',
            'mensaje': f"El equipo mantiene una puntualidad del {puntualidad_promedio}% este mes.",
        })

    # --- Semana actual (Lun → Dom) para gráfico ---
    nombres_dia = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom']
    lunes = hoy - timedelta(days=hoy.weekday())  # weekday(): 0=Lun
    dias = []
    
    for i in range(7):
        d = lunes + timedelta(days=i)
        count = len([a for a in asistencias_7d if a.fecha == d])
        puntuales = len([a for a in asistencias_7d if a.fecha == d and a.estado == 'puntual'])
        dias.append({
            'name': nombres_dia[d.weekday()],
            'asistencias': count,
            'puntuales': puntuales
        })

    return jsonify({
        'total_empleados': total_empleados,
        'asistencias_hoy': total_hoy,
        'trabajando_ahora': trabajando_ahora,
        'retrasos_hoy': retrasos_hoy,
        'presencia_actual': presencia_actual,
        'puntualidad_promedio': puntualidad_promedio,
        'retrasos_mes': retrasos_mes,
        'horas_totales_mes': horas_totales_mes,
        'staff_en_turno': staff_en_turno,
        'alertas': alertas,
        'chart_data': dias
    }), 200


@bp.route('/empleado/<int:emp_id>', methods=['GET'])
@login_required
def get_empleado_stats(emp_id):
    emp = Empleado.query.get_or_404(emp_id)
    hoy = datetime.now(LIMATZ).date()
    primer_dia_mes = hoy.replace(day=1)

    asistencias_mes = Asistencia.query.filter(
        Asistencia.empleado_id == emp_id,
        Asistencia.fecha >= primer_dia_mes
    ).all()

    total = len(asistencias_mes)
    puntuales = len([a for a in asistencias_mes if a.estado == 'puntual'])
    retrasos = len([a for a in asistencias_mes if a.estado == 'retraso'])
    puntualidad = round((puntuales / total * 100), 1) if total > 0 else 0
    horas_prom = round(sum(a.horas_totales or 0 for a in asistencias_mes) / total, 1) if total > 0 else 0

    # Historial última semana
    hace_7 = hoy - timedelta(days=6)
    historial = Asistencia.query.filter(
        Asistencia.empleado_id == emp_id,
        Asistencia.fecha >= hace_7
    ).order_by(Asistencia.fecha.desc()).all()

    historial_data = [{
        'fecha': str(a.fecha),
        'hora_entrada': str(a.hora_entrada)[:5] if a.hora_entrada else None,
        'hora_salida': str(a.hora_salida)[:5] if a.hora_salida else None,
        'estado': a.estado,
        'horas': a.horas_totales
    } for a in historial]

    return jsonify({
        'id': emp.id,
        'nombre': f"{emp.nombre} {emp.apellido}",
        'cargo': emp.cargo,
        'departamento': emp.departamento,
        'dias_trabajados_mes': total,
        'puntualidad': puntualidad,
        'retrasos': retrasos,
        'horas_promedio': horas_prom,
        'historial_semana': historial_data
    }), 200


@bp.route('/calendario', methods=['GET'])
@login_required
def get_calendario():
    """Vista de calendario mensual con asistencia por día."""
    hoy = datetime.now(LIMATZ).date()
    year = request.args.get('year', hoy.year, type=int)
    month = request.args.get('month', hoy.month, type=int)

    primer_dia = date(year, month, 1)
    if month == 12:
        ultimo_dia = date(year + 1, 1, 1) - timedelta(days=1)
    else:
        ultimo_dia = date(year, month + 1, 1) - timedelta(days=1)

    asistencias = Asistencia.query.filter(
        Asistencia.fecha >= primer_dia,
        Asistencia.fecha <= ultimo_dia
    ).all()

    empleados = Empleado.query.filter_by(activo=True).all()
    total_emp = len(empleados)
    emp_map = {e.id: f"{e.nombre} {e.apellido}" for e in empleados}

    # Agrupar por día
    dias = {}
    for d in range(1, ultimo_dia.day + 1):
        fecha = date(year, month, d)
        dia_asist = [a for a in asistencias if a.fecha == fecha]
        puntuales = len([a for a in dia_asist if a.estado == 'puntual'])
        retrasos = len([a for a in dia_asist if a.estado == 'retraso'])
        ausentes = len([a for a in dia_asist if a.estado == 'ausente'])
        presentes = len([a for a in dia_asist if a.estado in ('puntual', 'retraso', 'fuera de turno')])

        dias[str(d)] = {
            'fecha': fecha.isoformat(),
            'dia_semana': fecha.weekday(),
            'presentes': presentes,
            'puntuales': puntuales,
            'retrasos': retrasos,
            'ausentes': ausentes,
            'total': len(dia_asist),
            'es_hoy': fecha == hoy,
            'es_futuro': fecha > hoy,
            'detalle': [{
                'empleado_id': a.empleado_id,
                'nombre': emp_map.get(a.empleado_id, '?'),
                'estado': a.estado,
                'entrada': str(a.hora_entrada)[:5] if a.hora_entrada else None,
                'salida': str(a.hora_salida)[:5] if a.hora_salida else None,
                'justificacion': a.justificacion
            } for a in dia_asist]
        }

    return jsonify({
        'year': year,
        'month': month,
        'total_empleados': total_emp,
        'primer_dia_semana': primer_dia.weekday(),
        'total_dias': ultimo_dia.day,
        'dias': dias
    }), 200
