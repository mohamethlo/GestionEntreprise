# models/client.py
from datetime import datetime
from extensions import db

class ClientImportHistory(db.Model):
    __tablename__ = 'client_import_history'
    id = db.Column(db.Integer, primary_key=True)
    filename = db.Column(db.String(255))
    imported_at = db.Column(db.DateTime, default=datetime.utcnow)
    imported_by_id = db.Column(db.Integer, db.ForeignKey('user.id'))
    imported_by = db.relationship('User')

class Client(db.Model):
    __tablename__ = 'client'
    id = db.Column(db.Integer, primary_key=True)
    nom = db.Column(db.String(100), nullable=False)
    prenom = db.Column(db.String(100))
    entreprise = db.Column(db.String(100))
    email = db.Column(db.String(120))
    telephone = db.Column(db.String(20), unique=True)
    adresse = db.Column(db.Text)
    ville = db.Column(db.String(100))
    code_postal = db.Column(db.String(10))
    type_client = db.Column(db.String(20), default='prospect')  # prospect, client
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    assigned_to = db.Column(db.Integer, db.ForeignKey('user.id'))  # commercial assigné
    is_blacklisted = db.Column(db.Boolean, default=False)
    note_conversion = db.Column(db.Text)
    converted_by_id = db.Column(db.Integer, db.ForeignKey('user.id'))
    converted_by = db.relationship('User', foreign_keys=[converted_by_id])
    date_blacklisted = db.Column(db.DateTime)
    import_history_id = db.Column(db.Integer, db.ForeignKey('client_import_history.id'))
    import_history = db.relationship('ClientImportHistory', backref='clients')
    reminders = db.relationship('Reminder', backref='client', lazy='dynamic')

    interventions = db.relationship('Intervention', backref='client', lazy=True)

    @staticmethod
    def telephone_exists(telephone):
        return Client.query.filter_by(telephone=telephone).first() is not None

    def __repr__(self):
        return f'<Client {self.nom} {self.prenom or ""}>'
