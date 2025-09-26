# models/intervention.py
from datetime import datetime, time
from extensions import db

# association table for other participants
autres_intervenants_assoc = db.Table(
    'autres_intervenants_assoc',
    db.Column('intervention_id', db.Integer, db.ForeignKey('intervention.id'), primary_key=True),
    db.Column('user_id', db.Integer, db.ForeignKey('user.id'), primary_key=True)
)

class Intervention(db.Model):
    __tablename__ = 'intervention'
    id = db.Column(db.Integer, primary_key=True)
    description = db.Column(db.Text)
    client_id = db.Column(db.Integer, db.ForeignKey('client.id'), nullable=True)
    client_libre_nom = db.Column(db.String(200))
    client_libre_telephone = db.Column(db.String(20))
    technicien_id = db.Column(db.Integer, db.ForeignKey('user.id'))
    date_prevue = db.Column(db.DateTime, nullable=False)
    date_realisation = db.Column(db.DateTime)
    duree_estimee = db.Column(db.Integer)  # minutes
    duree_reelle = db.Column(db.Integer)   # minutes
    statut = db.Column(db.String(20), default='planifiee')  # planifiee, en_cours, terminee, annulee
    priorite = db.Column(db.String(20), default='normale')  # basse, normale, haute, urgente
    adresse = db.Column(db.Text)
    notes = db.Column(db.Text)
    created_by_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # autres champs
    type_intervention = db.Column(db.String(100))
    societe = db.Column(db.String(100))
    representant = db.Column(db.String(100))
    telephone = db.Column(db.String(30))

    autres_intervenants = db.relationship(
        'User',
        secondary=autres_intervenants_assoc,
        backref='interventions_autres',
        lazy='subquery'
    )

    taches_realisees = db.Column(db.Text)
    heure_arrivee = db.Column(db.Time)
    heure_depart = db.Column(db.Time)
    duree_intervention = db.Column(db.Time)
    observations_technicien = db.Column(db.Text)
    id_dvr_nvr = db.Column(db.String(100))
    mdp_dvr_nvr = db.Column(db.String(100))
    qr_code_path = db.Column(db.String(255))
    signature_data = db.Column(db.Text)
    materiels = db.relationship('InterventionMaterial', backref='intervention', lazy='joined')

    def __repr__(self):
        return f'<Intervention {self.id}>'

class InterventionMaterial(db.Model):
    __tablename__ = 'intervention_material'
    id = db.Column(db.Integer, primary_key=True)
    intervention_id = db.Column(db.Integer, db.ForeignKey('intervention.id'))
    article_id = db.Column(db.Integer, db.ForeignKey('inventory_item.id'))
    quantite = db.Column(db.Integer, nullable=False)
    article = db.relationship('InventoryItem')
