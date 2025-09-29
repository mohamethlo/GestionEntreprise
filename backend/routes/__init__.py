# routes/__init__.py
from flask import Flask

# Import des sous-blueprints
from .users import users_bp
from .roles import roles_bp
from .client import client_bp
from .intervention import intervention_bp
from .attendance import attendance_bp
from .work_locations import work_locations_bp  


def register_blueprints(app: Flask):
    """Enregistre tous les blueprints du projet"""

    # Blueprints utilisateurs et rôles
    app.register_blueprint(users_bp, url_prefix="/api/users")
    app.register_blueprint(roles_bp, url_prefix="/api/roles")
    app.register_blueprint(client_bp, url_prefix="/api/clients")
    app.register_blueprint(intervention_bp, url_prefix="/api/interventions")

    app.register_blueprint(attendance_bp, url_prefix="/api/attendance")
    app.register_blueprint(work_locations_bp, url_prefix="/api/work_locations")
