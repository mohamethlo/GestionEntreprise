# models/justification.py
from datetime import datetime
from extensions import db

class Justification(db.Model):
    __tablename__ = 'justification'
    
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    attendance_id = db.Column(db.Integer, db.ForeignKey('attendance.id'), nullable=False)
    commentaire = db.Column(db.Text, nullable=False)
    date_justification = db.Column(db.DateTime, default=datetime.utcnow)
    statut = db.Column(db.String(20), default='en_attente')  # en_attente, approuvé, rejeté
    
    # Relations
    user = db.relationship('User', backref='justifications')
    # CORRECTION : Retrait de uselist=False pour permettre plusieurs justifications si nécessaire
    # attendance = db.relationship('Attendance', backref='justification', uselist=False)
    
    def __repr__(self):
        return f'<Justification {self.id} - User {self.user_id}>'
    
    def to_dict(self):
        return {
            'id': self.id,
            'user_id': self.user_id,
            'attendance_id': self.attendance_id,
            'commentaire': self.commentaire,
            'date_justification': self.date_justification.isoformat(),
            'statut': self.statut
        }