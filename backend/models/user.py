# models/user.py
from datetime import datetime
from werkzeug.security import generate_password_hash, check_password_hash
from extensions import db

class Role(db.Model):
    __tablename__ = 'role'
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(64), unique=True, nullable=False)
    permissions = db.Column(db.Text)  # comma-separated permissions or 'all'
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    def __repr__(self):
        return f'<Role {self.name}>'

class User(db.Model):
    __tablename__ = 'user'
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(64), unique=True, nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False)
    password_hash = db.Column(db.String(256))
    nom = db.Column(db.String(100), nullable=False)
    prenom = db.Column(db.String(100), nullable=False)
    telephone = db.Column(db.String(20))
    role_id = db.Column(db.Integer, db.ForeignKey('role.id'), nullable=False)
    is_active = db.Column(db.Boolean, default=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    last_login = db.Column(db.DateTime)
    permissions = db.Column(db.String(255))  # ex: "attendance,clients"
    site = db.Column(db.String(50))

    # Relationships (backrefs defined in other models)
    role = db.relationship('Role', backref='users')

    def set_password(self, password):
        self.password_hash = generate_password_hash(password)

    def check_password(self, password):
        if not self.password_hash:
            return False
        return check_password_hash(self.password_hash, password)

    def has_permission(self, permission):
        """Vérifie permission d'abord au niveau user, puis role."""
        if self.permissions == 'all':
            return True
        if self.permissions:
            perms = [p.strip() for p in self.permissions.split(',') if p.strip()]
            if permission in perms:
                return True
        if self.role:
            if self.role.permissions == 'all':
                return True
            if self.role.permissions:
                role_perms = [p.strip() for p in self.role.permissions.split(',') if p.strip()]
                return permission in role_perms
        return False

    def __repr__(self):
        return f'<User {self.username}>'
