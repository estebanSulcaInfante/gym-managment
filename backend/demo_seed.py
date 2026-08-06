"""Create deterministic, fictional data for the public Sport Gym demo."""

from __future__ import annotations

import argparse
import random
from datetime import datetime, time, timedelta
from zoneinfo import ZoneInfo

from werkzeug.security import generate_password_hash

from app import create_app, db
from app.models import Asistencia, Empleado, Horario, Usuario


LIMA_TZ = ZoneInfo('America/Lima')
DEMO_LABEL = 'gym-demo'

DEMO_EMPLOYEES = [
    {
        'nombre': 'Valeria', 'apellido': 'Castro', 'dni': '70010010',
        'cargo': 'Recepcionista', 'departamento': 'Atencion al cliente',
        'telefono': '900100010', 'entrada': time(8, 0), 'salida': time(17, 0),
        'cruza_medianoche': False,
    },
    {
        'nombre': 'Mateo', 'apellido': 'Rios', 'dni': '70010011',
        'cargo': 'Entrenador', 'departamento': 'Fitness',
        'telefono': '900100011', 'entrada': time(7, 0), 'salida': time(16, 0),
        'cruza_medianoche': False,
    },
    {
        'nombre': 'Camila', 'apellido': 'Vega', 'dni': '70010012',
        'cargo': 'Coordinadora', 'departamento': 'Operaciones',
        'telefono': '900100012', 'entrada': time(9, 0), 'salida': time(18, 0),
        'cruza_medianoche': False,
    },
    {
        'nombre': 'Dario', 'apellido': 'Luna', 'dni': '70010013',
        'cargo': 'Seguridad', 'departamento': 'Operaciones',
        'telefono': '900100013', 'entrada': time(20, 0), 'salida': time(5, 0),
        'cruza_medianoche': True,
    },
]


def _assert_demo_target(app):
    if not app.config.get('DEMO_MODE'):
        raise RuntimeError('DEMO_MODE=true is required before resetting any database.')
    if app.config.get('DEMO_DATABASE_LABEL') != DEMO_LABEL:
        raise RuntimeError(f'DEMO_DATABASE_LABEL must be {DEMO_LABEL!r}.')


def _work_hours(fecha, entrada, salida, cruza_medianoche):
    started = datetime.combine(fecha, entrada)
    ended = datetime.combine(fecha + timedelta(days=1) if cruza_medianoche else fecha, salida)
    return round((ended - started).total_seconds() / 3600, 2)


def _seed_history(empleados, schedules):
    rng = random.Random(20260805)
    today = datetime.now(LIMA_TZ).date()

    for employee, employee_data in zip(empleados, DEMO_EMPLOYEES):
        for days_ago in range(1, 29):
            fecha = today - timedelta(days=days_ago)
            if fecha.weekday() >= 5 or (days_ago + employee.id) % 9 == 0:
                continue

            schedule = schedules[employee.id][fecha.weekday()]
            late_minutes = 18 if (days_ago + employee.id) % 7 == 0 else rng.choice([-5, 0, 4, 8])
            start_at = (datetime.combine(fecha, employee_data['entrada']) + timedelta(minutes=late_minutes)).time()
            end_at = (datetime.combine(fecha, employee_data['salida']) + timedelta(minutes=rng.choice([0, 5, 10]))).time()

            db.session.add(Asistencia(
                empleado_id=employee.id,
                fecha=fecha,
                horario_id=schedule.id,
                hora_entrada=start_at,
                hora_salida=end_at,
                hora_entrada_programada=employee_data['entrada'],
                hora_salida_programada=employee_data['salida'],
                cruza_medianoche=employee_data['cruza_medianoche'],
                estado='retraso' if late_minutes > 15 else 'puntual',
                horas_totales=_work_hours(fecha, start_at, end_at, employee_data['cruza_medianoche']),
            ))


def seed_demo_database(app, reset=False):
    with app.app_context():
        _assert_demo_target(app)

        if reset:
            db.drop_all()
        db.create_all()

        if not reset and Usuario.query.filter_by(username='demo').first():
            return False

        demo_user = Usuario(
            username='demo',
            password_hash=generate_password_hash('demo-session-is-issued-server-side'),
            rol='Admin',
            activo=True,
        )
        db.session.add(demo_user)

        employees = []
        schedules = {}
        for data in DEMO_EMPLOYEES:
            employee = Empleado(
                nombre=data['nombre'],
                apellido=data['apellido'],
                dni=data['dni'],
                cargo=data['cargo'],
                departamento=data['departamento'],
                telefono=data['telefono'],
                activo=True,
            )
            db.session.add(employee)
            db.session.flush()
            employees.append(employee)
            schedules[employee.id] = {}

            for weekday in range(5):
                schedule = Horario(
                    empleado_id=employee.id,
                    dia_semana=weekday,
                    hora_entrada=data['entrada'],
                    hora_salida=data['salida'],
                    cruza_medianoche=data['cruza_medianoche'],
                )
                db.session.add(schedule)
                db.session.flush()
                schedules[employee.id][weekday] = schedule

        _seed_history(employees, schedules)
        db.session.commit()
        print('Gym demo database seeded with fictional data.')
        return True


def reset_demo_database():
    return seed_demo_database(create_app(), reset=True)


def ensure_demo_database(app):
    """Create the disposable demo data on first boot without resetting it."""
    if not app.config.get('DEMO_MODE'):
        return False
    return seed_demo_database(app)


def main():
    parser = argparse.ArgumentParser(description='Reset the isolated Sport Gym demo database.')
    parser.add_argument('--reset', action='store_true', help='Permit the reset operation.')
    parser.add_argument(
        '--confirm-gym-demo-reset', action='store_true',
        help='Confirm that the target is the disposable gym-demo database.',
    )
    args = parser.parse_args()

    if not (args.reset and args.confirm_gym_demo_reset):
        parser.error('Both --reset and --confirm-gym-demo-reset are required.')

    reset_demo_database()


if __name__ == '__main__':
    main()
