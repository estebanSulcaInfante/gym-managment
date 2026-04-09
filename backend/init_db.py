from app import create_app, db
from app.models import Empleado, Usuario, Horario, Asistencia
from datetime import datetime, timezone, time, timedelta, date
from zoneinfo import ZoneInfo
from werkzeug.security import generate_password_hash
import random

LIMATZ = ZoneInfo("America/Lima")

def init_db():
    app = create_app()
    with app.app_context():
        print("Borrando y creando tablas en la base de datos...")
        db.drop_all()
        db.create_all()
        
        print("Insertando datos semilla (mock)...")
        
        mock_admin = Usuario(
            username="admin",
            password_hash=generate_password_hash("admin123"),
            rol="Admin"
        )
        db.session.add(mock_admin)

        mock_recep = Usuario(
            username="recepcion",
            password_hash=generate_password_hash("recep123"),
            rol="recepcionista"
        )
        db.session.add(mock_recep)

        empleados_data = [
            {"nombre": "Esteban",  "apellido": "Sulca",   "dni": "72345678", "cargo": "Gerente",     "depto": "Administración",    "tel": "987654321"},
            {"nombre": "María",    "apellido": "Gómez",   "dni": "45612345", "cargo": "Recepción",   "depto": "Atención al Cliente","tel": "912345678"},
            {"nombre": "Carlos",   "apellido": "Pérez",   "dni": "71002233", "cargo": "Entrenador",  "depto": "Fitness",           "tel": "998877665"},
            {"nombre": "Ana",      "apellido": "López",   "dni": "48991122", "cargo": "Entrenador",  "depto": "Fitness",           "tel": "955443322"},
            {"nombre": "Luis",     "apellido": "Torres",  "dni": "20114455", "cargo": "Limpieza",    "depto": "Mantenimiento",     "tel": "966778899"},
        ]

        empleados_creados = []
        for e in empleados_data:
            emp = Empleado(
                nombre=e["nombre"],
                apellido=e["apellido"],
                dni=e["dni"],
                cargo=e["cargo"],
                departamento=e["depto"],
                telefono=e["tel"],
                activo=True
            )
            db.session.add(emp)
            db.session.flush()
            empleados_creados.append(emp)

            # Horarios L-V (0-4) distintos por cargo, S-D libre
            if e["cargo"] == "Gerente":
                h_ent, h_sal = time(9, 0), time(18, 0)
            elif e["cargo"] == "Limpieza":
                h_ent, h_sal = time(6, 0), time(14, 0)
            else:
                h_ent, h_sal = time(8, 0), time(17, 0)

            for dia in range(7):
                if dia < 5:
                    h = Horario(empleado_id=emp.id, dia_semana=dia, hora_entrada=h_ent, hora_salida=h_sal)
                else:
                    h = Horario(empleado_id=emp.id, dia_semana=dia)
                db.session.add(h)

        db.session.commit()

        # ------------------------------------
        # Generar 30 días de asistencias mock
        # ------------------------------------
        print("Insertando historial de asistencias (30 días)...")
        hoy = datetime.now(LIMATZ).date()

        for emp in empleados_creados:
            # Determinar hora esperada según cargo
            if emp.cargo == "Gerente":
                hora_base_ent = 9
                hora_base_sal = 18
            elif emp.cargo == "Limpieza":
                hora_base_ent = 6
                hora_base_sal = 14
            else:
                hora_base_ent = 8
                hora_base_sal = 17

            for days_ago in range(30):
                fecha_iter = hoy - timedelta(days=days_ago)
                
                # Saltamos fines de semana
                if fecha_iter.weekday() >= 5:
                    continue

                # Hoy no generamos mock (se registrará en vivo)
                if fecha_iter == hoy:
                    continue

                # 85% chance de asistir (simula ausencias)
                if random.random() > 0.85:
                    continue

                # Hora de entrada: entre -10 y +25 minutos de la hora base
                offset_entrada = random.randint(-10, 25)
                min_total_ent = hora_base_ent * 60 + offset_entrada
                hora_e = time(min_total_ent // 60, min_total_ent % 60)

                # Hora de salida: entre 0 y +30 minutos de la hora base
                offset_salida = random.randint(0, 30)
                min_total_sal = hora_base_sal * 60 + offset_salida
                hora_s = time(min_total_sal // 60, min_total_sal % 60)

                # Calcular horas trabajadas
                dt_ent = datetime.combine(fecha_iter, hora_e)
                dt_sal = datetime.combine(fecha_iter, hora_s)
                horas_t = round((dt_sal - dt_ent).seconds / 3600, 1)

                # Determinar estado
                if offset_entrada <= 15:
                    estado = 'puntual'
                else:
                    estado = 'retraso'

                asist = Asistencia(
                    empleado_id=emp.id,
                    fecha=fecha_iter,
                    hora_entrada=hora_e,
                    hora_salida=hora_s,
                    estado=estado,
                    horas_totales=horas_t
                )
                db.session.add(asist)

        db.session.commit()

        # Resumen
        total_emp = Empleado.query.count()
        total_asist = Asistencia.query.count()
        print(f"[OK] {total_emp} empleados creados")
        print(f"[OK] {total_asist} registros de asistencia generados (30 dias)")
        print("Base de datos lista.")

if __name__ == "__main__":
    init_db()
