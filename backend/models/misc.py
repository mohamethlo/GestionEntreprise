# models/misc.py
from datetime import datetime
from extensions import db

class Approvisionnement(db.Model):
    __tablename__ = 'approvisionnement'
    id = db.Column(db.Integer, primary_key=True)
    montant = db.Column(db.Float, nullable=False)
    date = db.Column(db.DateTime, default=datetime.utcnow)
    site = db.Column(db.String(50))

class Installation(db.Model):
    __tablename__ = 'installation'
    id = db.Column(db.Integer, primary_key=True)
    prenom = db.Column(db.String(100))
    nom = db.Column(db.String(100))
    telephone = db.Column(db.String(50))
    montant_total = db.Column(db.Float, nullable=False)
    montant_avance = db.Column(db.Float, default=0)
    montant_restant = db.Column(db.Float, default=0)
    date_installation = db.Column(db.Date)
    methode_paiement = db.Column(db.String(30))
    date_echeance = db.Column(db.Date)
    contrat_path = db.Column(db.String(255))
    statut = db.Column(db.String(30), default='en_attente')
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

class QuoteRequest(db.Model):
    __tablename__ = 'quote_request'
    id = db.Column(db.Integer, primary_key=True)
    client_id = db.Column(db.Integer, db.ForeignKey('client.id'))
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'))
    details = db.Column(db.Text, nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

class Devis(db.Model):
    __tablename__ = 'devis'
    id = db.Column(db.Integer, primary_key=True)
    nom = db.Column(db.String(100), nullable=False)
    prenom = db.Column(db.String(100), nullable=False)
    telephone = db.Column(db.String(20), nullable=False)
    commentaire = db.Column(db.Text)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    assigned_to = db.Column(db.Integer, db.ForeignKey('user.id'))
    status = db.Column(db.String(20), default='en_attente')
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'))
    
    # Relations
    user = db.relationship('User', foreign_keys=[user_id], backref='created_devis')
    assigned_user = db.relationship('User', foreign_keys=[assigned_to], backref='assigned_devis') 


class Reminder(db.Model):
    __tablename__ = 'reminder'
    id = db.Column(db.Integer, primary_key=True)
    client_id = db.Column(db.Integer, db.ForeignKey('client.id'))
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'))
    remind_at = db.Column(db.DateTime, nullable=True)
    notes = db.Column(db.Text)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)