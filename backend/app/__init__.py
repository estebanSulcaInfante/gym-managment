from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from flask_migrate import Migrate
from flask_cors import CORS
import os

db = SQLAlchemy()
migrate = Migrate()

def create_app(test_config=None):
    app = Flask(__name__, instance_relative_config=True)
    
    if test_config is None:
        db_path = os.path.join(app.instance_path, 'gym.db')
        
        # Heroku/Supabase Database connection
        database_url = os.environ.get('DATABASE_URL')
        if database_url and database_url.startswith("postgres://"):
            database_url = database_url.replace("postgres://", "postgresql://", 1)

        app.config.from_mapping(
            SECRET_KEY=os.environ.get('SECRET_KEY', 'dev'),
            SQLALCHEMY_DATABASE_URI=database_url or f'sqlite:///{db_path}',
            SQLALCHEMY_TRACK_MODIFICATIONS=False
        )
    else:
        app.config.from_mapping(test_config)

    # ensure the instance folder exists
    try:
        os.makedirs(app.instance_path)
    except OSError:
        pass

    CORS(app)
    db.init_app(app)
    migrate.init_app(app, db)

    from .api import empleados_bp, asistencias_bp
    app.register_blueprint(empleados_bp)
    app.register_blueprint(asistencias_bp)

    @app.route('/health')
    def health_check():
        return {'status': 'healthy'}
        
    return app
