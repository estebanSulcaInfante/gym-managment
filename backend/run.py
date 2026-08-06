import os
from app import create_app

app = create_app()

if app.config.get('DEMO_MODE'):
    from demo_seed import ensure_demo_database
    ensure_demo_database(app)

if __name__ == '__main__':
    port = int(os.environ.get("PORT", 5000))
    app.run(host='0.0.0.0', port=port, debug=True)
