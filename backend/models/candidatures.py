# models.py (ajouter cette classe au fichier models.py existant)

from extensions import db
from datetime import datetime

class Candidature(db.Model):
    __tablename__ = 'candidatures'
    
    id = db.Column(db.Integer, primary_key=True)
    nom = db.Column(db.String(100), nullable=False)
    poste = db.Column(db.String(100), nullable=False)
    domaine = db.Column(db.String(100), nullable=False)
    email = db.Column(db.String(120), nullable=False)
    telephone = db.Column(db.String(20), nullable=False)
    fichier_nom = db.Column(db.String(255), nullable=False)  # Nom original du fichier
    fichier_path = db.Column(db.String(500), nullable=False)  # Chemin complet du fichier
    status = db.Column(db.String(50), default='nouveau')  # nouveau, en_cours, accepte, refuse
    date_depot = db.Column(db.DateTime, default=datetime.utcnow, nullable=False)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)

    
    # Relations
    created_by_user = db.relationship('User', backref='candidatures', foreign_keys=[user_id])
    
    def __repr__(self):
        return f'<Candidature {self.nom} - {self.poste}>'
    
    def to_dict(self):
        return {
            'id': self.id,
            'nom': self.nom,
            'poste': self.poste,
            'domaine': self.domaine,
            'email': self.email,
            'telephone': self.telephone,
            'fichier_nom': self.fichier_nom,
            'fichier_path': self.fichier_path,
            'status': self.status,
            'date_depot': self.date_depot.isoformat(),
            'user_id': self.user_id
        }