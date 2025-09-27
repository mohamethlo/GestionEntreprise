from flask import Blueprint

# Import des sous-blueprints
from .users import users_bp
from .roles import roles_bp
from .client import client_bp
from .intervention import intervention_bp


def register_blueprints(app):
    """Enregistre tous les blueprints du projet"""
    app.register_blueprint(users_bp, url_prefix="/api/users")
    app.register_blueprint(roles_bp, url_prefix="/api/roles")
    app.register_blueprint(client_bp, url_prefix="/api/clients")
    app.register_blueprint(intervention_bp, url_prefix="/api/interventions")
