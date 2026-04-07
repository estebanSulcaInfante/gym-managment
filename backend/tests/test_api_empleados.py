import pytest
from app.models.empleado import Empleado
from app import db

def test_list_empleados(client, app):
    with app.app_context():
        emp1 = Empleado(nombre="A", apellido="1", dni="11", cargo="C1", departamento="D1")
        emp2 = Empleado(nombre="B", apellido="2", dni="22", cargo="C2", departamento="D2")
        db.session.add_all([emp1, emp2])
        db.session.commit()

    res = client.get('/api/empleados')
    assert res.status_code == 200
    data = res.json
    assert len(data) == 2
    assert data[0]['dni'] == "11"

def test_create_empleado(client, app):
    data = {
        "nombre": "Juan",
        "apellido": "Perez",
        "dni": "88888888",
        "cargo": "Trainer",
        "departamento": "Fitness"
    }
    res = client.post('/api/empleados', json=data)
    assert res.status_code == 201
    
    with app.app_context():
        emp = Empleado.query.filter_by(dni="88888888").first()
        assert emp is not None
        assert emp.nombre == "Juan"

def test_get_empleado(client, app):
    with app.app_context():
        emp = Empleado(nombre="Test", apellido="Test", dni="55", cargo="C1", departamento="D1")
        db.session.add(emp)
        db.session.commit()
        emp_id = emp.id

    res = client.get(f'/api/empleados/{emp_id}')
    assert res.status_code == 200
    assert res.json['dni'] == "55"
    assert 'horarios' in res.json
