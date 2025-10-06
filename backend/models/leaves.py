from extensions import db
from datetime import datetime

class Leave(db.Model):
    __tablename__ = 'leaves'
    
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)  # corrigé ici
    leave_type = db.Column(db.String(50), nullable=False)
    start_date = db.Column(db.DateTime, nullable=False)
    end_date = db.Column(db.DateTime, nullable=False)
    duration = db.Column(db.Integer, nullable=False)
    reason = db.Column(db.Text)
    status = db.Column(db.String(20), default='pending')
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    approved_by = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=True)  # corrigé ici
    approved_at = db.Column(db.DateTime, nullable=True)
    
    # Relations
    user = db.relationship('User', foreign_keys=[user_id], backref='leaves')
    approver = db.relationship('User', foreign_keys=[approved_by], backref='approved_leaves')
    
    def __repr__(self):
        return f'<Leave {self.id} - {self.user.nom} ({self.leave_type})>'
    
    def to_dict(self):
        return {
            'id': self.id,
            'user_id': self.user_id,
            'user_name': f"{self.user.prenom} {self.user.nom}" if self.user else "Inconnu",
            'leave_type': self.leave_type,
            'start_date': self.start_date.isoformat() if self.start_date else None,
            'end_date': self.end_date.isoformat() if self.end_date else None,
            'duration': self.duration,
            'reason': self.reason,
            'status': self.status,
            'created_at': self.created_at.isoformat(),
            'approved_by': self.approved_by,
            'approved_at': self.approved_at.isoformat() if self.approved_at else None,
            'approver_name': f"{self.approver.prenom} {self.approver.nom}" if self.approver else None
        }
