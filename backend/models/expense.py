# models/expense.py
from datetime import datetime, date, timedelta
from extensions import db

class Expense(db.Model):
    __tablename__ = 'expense'
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    titre = db.Column(db.String(200), nullable=False)
    description = db.Column(db.Text)
    montant = db.Column(db.Float, nullable=False)
    categorie = db.Column(db.String(100))
    date_depense = db.Column(db.Date, default=date.today)
    statut = db.Column(db.String(20), default='en_attente')  # en_attente, approuve, refuse (ou rejete)
    justificatif = db.Column(db.String(512))  # path to uploaded file
    notes_admin = db.Column(db.Text)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    approved_at = db.Column(db.DateTime)
    approved_by_id = db.Column(db.Integer, db.ForeignKey('user.id'))
    site = db.Column(db.String(50))
    approved_by = db.relationship('User', foreign_keys=[approved_by_id], backref='approved_expenses')

    deleted_at = db.Column(db.DateTime, nullable=True, index=True)

    def __repr__(self):
        return f'<Expense {self.titre} - {self.montant}Fcfa>'

    def is_deleted(self):
        return self.deleted_at is not None

    def can_restore(self, hours=24):
        if not self.deleted_at:
            return False
        return (datetime.utcnow() - self.deleted_at) < timedelta(hours=hours)

class SalaryAdvance(db.Model):
    __tablename__ = 'salary_advance'
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    montant = db.Column(db.Float, nullable=False)
    motif = db.Column(db.Text)
    date_demande = db.Column(db.Date, default=date.today)
    statut = db.Column(db.String(20), default='en_attente')  # en_attente, approuve, refuse
    notes_admin = db.Column(db.Text)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    approved_at = db.Column(db.DateTime)
    approved_by_id = db.Column(db.Integer, db.ForeignKey('user.id'))
    
    user = db.relationship('User', foreign_keys=[user_id], backref='salary_advances')
    approved_by = db.relationship('User', foreign_keys=[approved_by_id], backref='approved_advances')
