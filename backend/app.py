import os
import logging
from flask import Flask
from dotenv import load_dotenv
from werkzeug.middleware.proxy_fix import ProxyFix
from extensions import db, mail
from flask_cors import CORS
from flask_jwt_extended import JWTManager

# Chargement des variables d'environnement
load_dotenv()


def create_app():
    """Factory de création de l'application Flask"""
    app = Flask(__name__)

    # --- CONFIG de base ---
    app.secret_key = os.getenv("SECRET_KEY", "secret_dev")
    app.wsgi_app = ProxyFix(app.wsgi_app, x_proto=1, x_host=1)

    # --- CONFIG API ---
    CORS(app, resources={r"/api/*": {"origins": "*"}})  # Autoriser les appels depuis React
    app.config["JWT_SECRET_KEY"] = os.getenv("JWT_SECRET_KEY", "jwt_dev_secret")
    JWTManager(app)

    # --- CONFIG Email ---
    app.config.update(
        MAIL_SERVER=os.getenv('MAIL_SERVER'),
        MAIL_PORT=os.getenv('MAIL_PORT'),
        MAIL_USE_TLS=os.getenv('MAIL_USE_TLS'),
        MAIL_USERNAME=os.getenv('MAIL_USERNAME'),
        MAIL_PASSWORD=os.getenv('MAIL_PASSWORD'),
        MAIL_DEFAULT_SENDER=os.getenv('MAIL_USERNAME')
    )

    # --- CONFIG DB ---
    app.config["SQLALCHEMY_DATABASE_URI"] = os.getenv("DATABASE_URL", "sqlite:///db.sqlite3")
    app.config["SQLALCHEMY_ENGINE_OPTIONS"] = {"pool_recycle": 300, "pool_pre_ping": True}

    # --- CONFIG Upload ---
    app.config['MAX_CONTENT_LENGTH'] = 16 * 1024 * 1024  # 16 MB
    app.config['UPLOAD_FOLDER'] = 'uploads'

    db.init_app(app)
    mail.init_app(app)

    # --- Enregistrement Blueprints ---
    from auth import auth_bp
    from users import users_bp
    from roles import roles_bp
    from devis import devis_bp
    from intervention import intervention_bp
    from inventory import inventory_bp
    from client import client_bp
    
    # Route pour servir les fichiers statiques
    @app.route('/uploads/<path:filename>')
    def uploaded_file(filename):
        from flask import send_from_directory
        return send_from_directory(app.config['UPLOAD_FOLDER'], filename)

    # --- Enregistrement Blueprints ---
    app.register_blueprint(auth_bp, url_prefix='/api/auth')
    app.register_blueprint(users_bp, url_prefix='/api/users')
    app.register_blueprint(roles_bp, url_prefix='/api/roles')
    app.register_blueprint(devis_bp, url_prefix='/api/devis')
    app.register_blueprint(intervention_bp, url_prefix='/api/interventions')
    app.register_blueprint(inventory_bp, url_prefix='/api/inventory')
    app.register_blueprint(client_bp, url_prefix='/api/clients')

    # --- Initialisation DB ---
    with app.app_context():
        import models  # pour que SQLAlchemy connaisse les tables
        db.create_all()

    return app


def seed_data():
    """Insère les rôles et l’utilisateur admin par défaut si non existants"""
    from models import User, Role
    from werkzeug.security import generate_password_hash

    # Création des rôles
    if not Role.query.first():
        roles = [
            Role(name='Administrateur', permissions='all'),
            Role(name='Commercial', permissions='attendance,clients,interventions'),
            Role(name='Technicien', permissions='attendance,interventions'),
            Role(name='Dev_administration', permissions='attendance'),
            Role(name='Administration', permissions='attendance,interventions')
        ]
        db.session.add_all(roles)
        db.session.commit()
        logging.info("✅ Rôles créés avec succès")

    # Création admin
    if not User.query.filter_by(email='admin@entreprise.fr').first():
        admin_role = Role.query.filter_by(name='Administrateur').first()
        admin_user = User(
            username='admin',
            email='admin@entreprise.fr',
            nom='Administrateur',
            prenom='Système',
            password_hash=generate_password_hash('admin123'),
            role=admin_role,
            is_active=True
        )
        db.session.add(admin_user)
        db.session.commit()
        logging.info("✅ Admin par défaut créé: admin@entreprise.fr / admin123")


if __name__ == "__main__":
    app = create_app()
    app.run(host="0.0.0.0", port=5000, debug=True)
