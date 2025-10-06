from datetime import datetime
from extensions import db

class Employee(db.Model):
    __tablename__ = "employee"

    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=True)  # lien optionnel vers User
    first_name = db.Column(db.String(100), nullable=False)
    last_name = db.Column(db.String(100), nullable=False)
    birth_date = db.Column(db.Date, nullable=True)
    email = db.Column(db.String(120), nullable=False)
    phone = db.Column(db.String(50))
    job = db.Column(db.String(100))  # intitulé du poste
    department = db.Column(db.String(100))
    manager = db.Column(db.String(120))  # nom du responsable
    contract_type = db.Column(db.String(100))  # CDD, CDI, Stage, etc.
    skills = db.Column(db.Text)  # stocké sous forme de texte séparé par des virgules
    documents = db.Column(db.Text)  # chemins ou noms des fichiers, séparés par des virgules
    hire_date = db.Column(db.Date, default=datetime.utcnow)
    status = db.Column(db.String(50), default="Actif")  # Actif / En congé / Démissionné
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    user = db.relationship("User", backref="employee", lazy=True)

    def __repr__(self):
        return f"<Employee {self.first_name} {self.last_name}>"

    def to_dict(self):
        return {
            "id": self.id,
            "firstName": self.first_name,
            "lastName": self.last_name,
            "birthDate": self.birth_date.isoformat() if self.birth_date else None,
            "email": self.email,
            "phone": self.phone,
            "job": self.job,
            "department": self.department,
            "manager": self.manager,
            "contractType": self.contract_type,
            "skills": self.skills.split(",") if self.skills else [],
            "documents": self.documents.split(",") if self.documents else [],
            "status": self.status
        }
