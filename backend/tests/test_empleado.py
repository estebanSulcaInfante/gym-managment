def test_health_check(client):
    response = client.get('/health')
    assert response.status_code == 200
    assert response.json == {'status': 'healthy'}

def test_empleado_model_creation(app):
    from app import db
    from app.models.empleado import Empleado
    
    with app.app_context():
        emp = Empleado(
            nombre="Juan",
            apellido="Perez",
            dni="12345678",
            cargo="Entrenador",
            departamento="Fitness"
        )
        db.session.add(emp)
        db.session.commit()
        
        saved_emp = Empleado.query.filter_by(dni="12345678").first()
        assert saved_emp is not None
        assert saved_emp.nombre == "Juan"
        assert saved_emp.activo is True
