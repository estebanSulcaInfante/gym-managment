from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from flask_migrate import Migrate
from flask_cors import CORS
import os
from datetime import datetime
from zoneinfo import ZoneInfo

db = SQLAlchemy()
migrate = Migrate()


def _env_flag(name, default=False):
    value = os.environ.get(name)
    if value is None:
        return default
    return value.strip().lower() in {'1', 'true', 'yes', 'on'}


def _cors_origins():
    configured = os.environ.get('CORS_ORIGINS', '')
    origins = [origin.strip() for origin in configured.split(',') if origin.strip()]
    return origins or ['http://localhost:5173', 'http://localhost:5174']


def create_app(test_config=None):
    app = Flask(__name__, instance_relative_config=True)
    demo_refresh_state = {'checked_on': None}
    
    if test_config is None:
        db_path = os.path.join(app.instance_path, 'gym.db')
        
        # Heroku/Supabase Database connection
        database_url = os.environ.get('DATABASE_URL')
        if database_url and database_url.startswith("postgres://"):
            database_url = database_url.replace("postgres://", "postgresql://", 1)

        app.config.from_mapping(
            SECRET_KEY=os.environ.get('SECRET_KEY', 'dev'),
            SQLALCHEMY_DATABASE_URI=database_url or f'sqlite:///{db_path}',
            SQLALCHEMY_TRACK_MODIFICATIONS=False,
            DEMO_MODE=_env_flag('DEMO_MODE'),
            DEMO_DATABASE_LABEL=os.environ.get('DEMO_DATABASE_LABEL', ''),
            CORS_ORIGINS=_cors_origins(),
            SQLALCHEMY_ENGINE_OPTIONS={
                "pool_size": 10,
                "pool_recycle": 1800,
                "pool_pre_ping": True,
            }
        )
    else:
        app.config.from_mapping(test_config)
        app.config.setdefault('DEMO_MODE', _env_flag('DEMO_MODE'))
        app.config.setdefault('DEMO_DATABASE_LABEL', os.environ.get('DEMO_DATABASE_LABEL', ''))
        app.config.setdefault('CORS_ORIGINS', _cors_origins())

    # ensure the instance folder exists
    try:
        os.makedirs(app.instance_path)
    except OSError:
        pass

    cors_origins = app.config['CORS_ORIGINS']
    if isinstance(cors_origins, str):
        cors_origins = [origin.strip() for origin in cors_origins.split(',') if origin.strip()]
    CORS(app, resources={r'/api/*': {'origins': cors_origins}})
    db.init_app(app)
    migrate.init_app(app, db)

    from .api import empleados_bp, asistencias_bp, stats_bp, auth_bp
    app.register_blueprint(empleados_bp)
    app.register_blueprint(asistencias_bp)
    app.register_blueprint(stats_bp)
    app.register_blueprint(auth_bp)

    @app.before_request
    def refresh_public_demo_history():
        if (
            not app.config.get('DEMO_MODE')
            or app.config.get('DEMO_DATABASE_LABEL') != 'gym-demo'
        ):
            return None

        today = datetime.now(ZoneInfo('America/Lima')).date()
        if demo_refresh_state['checked_on'] == today:
            return None

        from demo_seed import refresh_demo_history
        refresh_demo_history(app, today=today)
        demo_refresh_state['checked_on'] = today
        return None

    @app.route('/health')
    def health_check():
        return {'status': 'healthy'}
        
    return app
