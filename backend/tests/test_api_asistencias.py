import pytest
from app.models.empleado import Empleado
from app.models.asistencia import Asistencia
from app import db
from datetime import date

def test_registro_entrada_salida_kiosko(client, app):
    # Setup test data
    with app.app_context():
        emp = Empleado(nombre="Maria", apellido="Gomez", dni="444", cargo="Staff", departamento="General")
        db.session.add(emp)
        db.session.commit()
        emp_id = emp.id

    # Prueba: Registrar Entrada
    res_entrada = client.post('/api/asistencias/entrada', json={
        "dni": "444",
        "foto_url": "https://example.com/foto_in.jpg"
    })
    
    assert res_entrada.status_code == 201
    assert res_entrada.json['status'] == 'success'
    assert res_entrada.json['asistencia']['estado'] == 'puntual'
    assert res_entrada.json['asistencia']['foto_entrada_url'] == 'https://example.com/foto_in.jpg'

    with app.app_context():
        asist = Asistencia.query.filter_by(empleado_id=emp_id).first()
        assert asist is not None
        assert asist.hora_entrada is not None
        assert asist.hora_salida is None
        assert asist.foto_entrada_url == "https://example.com/foto_in.jpg"

    # Prueba: Registrar Entrada Dos Veces (Debe Fallar)
    res_entrada2 = client.post('/api/asistencias/entrada', json={"dni": "444"})
    assert res_entrada2.status_code == 400
    assert 'ya fue registrada' in res_entrada2.json['error']

    # Prueba: Registrar Salida
    res_salida = client.post('/api/asistencias/salida', json={
        "dni": "444",
        "foto_url": "https://example.com/foto_out.jpg"
    })
    
    assert res_salida.status_code == 200
    assert res_salida.json['status'] == 'success'
    
    with app.app_context():
        asist = Asistencia.query.filter_by(empleado_id=emp_id).first()
        assert asist.hora_salida is not None
        assert asist.foto_salida_url == "https://example.com/foto_out.jpg"
        assert asist.horas_totales is not None

def test_get_reportes_asistencia(client, app):
    res = client.get('/api/asistencias')
    assert res.status_code == 200
    assert isinstance(res.json, list)
