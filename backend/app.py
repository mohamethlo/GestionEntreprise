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
    app = Flask(__name__)

    # Configurations de base
    app.secret_key = os.getenv("SECRET_KEY", "secret_dev")
    app.wsgi_app = ProxyFix(app.wsgi_app, x_proto=1, x_host=1)

    # --- CONFIG API ---
    CORS(app)  # Autoriser les appels depuis React

    app.config["JWT_SECRET_KEY"] = os.getenv("JWT_SECRET_KEY", "jwt_dev_secret")
    jwt = JWTManager(app)

    # --- Config Email ---
    app.config['MAIL_SERVER'] = os.getenv('MAIL_SERVER')
    app.config['MAIL_PORT'] = os.getenv('MAIL_PORT')
    app.config['MAIL_USE_TLS'] = os.getenv('MAIL_USE_TLS')
    app.config['MAIL_USERNAME'] = os.getenv('MAIL_USERNAME')
    app.config['MAIL_PASSWORD'] = os.getenv('MAIL_PASSWORD')
    app.config['MAIL_DEFAULT_SENDER'] = os.getenv('MAIL_USERNAME')

    # --- Config DB ---
    app.config["SQLALCHEMY_DATABASE_URI"] = os.getenv("DATABASE_URL", "sqlite:///db.sqlite3")
    app.config["SQLALCHEMY_ENGINE_OPTIONS"] = {"pool_recycle": 300, "pool_pre_ping": True}

    # Upload
    app.config['MAX_CONTENT_LENGTH'] = 16 * 1024 * 1024
    app.config['UPLOAD_FOLDER'] = 'uploads'

    # Init extensions
    db.init_app(app)
    mail.init_app(app)

    # --- Enregistrement Blueprints ---
    from auth import auth_bp
    from routes import main_bp, billing
    app.register_blueprint(auth_bp, url_prefix='/api/auth')
    app.register_blueprint(main_bp, url_prefix='/api/main')
    app.register_blueprint(billing, url_prefix='/api/billing')

    # --- Initialisation DB ---
    with app.app_context():
        import models
        db.create_all()

        from models import User, Role
        from werkzeug.security import generate_password_hash

        # Création des rôles si inexistant
        if not Role.query.first():
            roles = [
                Role(name='Administrateur', permissions='all'),
                Role(name='Commercial', permissions='attendance,clients,interventions'),
                Role(name='Technicien', permissions='attendance,interventions'),
                Role(name='Dev_administration', permissions='attendance'),
                Role(name='administration', permissions='attendance,interventions')
            ]
            db.session.add_all(roles)
            db.session.commit()

        # Création de l’admin si inexistant
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

    return app


if __name__ == "__main__":
    app = create_app()
    app.run(host="0.0.0.0", port=5000, debug=True)
