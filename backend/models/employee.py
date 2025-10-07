from datetime import datetime
from extensions import db

class Employee(db.Model):
    __tablename__ = "employee"

    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False, unique=True)
    
    # Informations de base
    birth_date = db.Column(db.Date, nullable=True)
    job = db.Column(db.String(100))
    department = db.Column(db.String(100))
    manager = db.Column(db.String(120))
    contract_type = db.Column(db.String(100))  # CDD, CDI, Stage
    skills = db.Column(db.Text)
    documents = db.Column(db.Text)
    hire_date = db.Column(db.Date)
    status = db.Column(db.String(50), default="Actif")
    
    # 💰 Informations de paie
    base_salary = db.Column(db.Float, nullable=True)  # Salaire de base
    bank_account = db.Column(db.String(100), nullable=True)  # RIB
    bank_name = db.Column(db.String(100), nullable=True)
    
    # 🏥 Charges sociales
    css_number = db.Column(db.String(50), nullable=True)  # Numéro CSS
    ipres_number = db.Column(db.String(50), nullable=True)  # Numéro IPRES
    css_rate = db.Column(db.Float, default=7.0)  # Taux CSS (%)
    ipres_rate = db.Column(db.Float, default=5.6)  # Taux IPRES (%)
    
    # 💼 Impôts
    tax_number = db.Column(db.String(50), nullable=True)  # Numéro fiscal
    trimf_rate = db.Column(db.Float, default=0.0)  # Taux TRIMF (%)
    family_situation = db.Column(db.String(50), nullable=True)  # Célibataire, Marié, etc.
    dependents = db.Column(db.Integer, default=0)  # Nombre de personnes à charge
    
    # 📄 Documents administratifs
    id_card_number = db.Column(db.String(50), nullable=True)
    id_card_expiry = db.Column(db.Date, nullable=True)
    
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    user = db.relationship("User", backref="employee_details", lazy=True)

    def to_dict(self):
        return {
            "id": self.id,
            "userId": self.user_id,
            "birthDate": self.birth_date.isoformat() if self.birth_date else None,
            "job": self.job,
            "department": self.department,
            "manager": self.manager,
            "contractType": self.contract_type,
            "skills": self.skills.split(",") if self.skills else [],
            "documents": self.documents.split(",") if self.documents else [],
            "hireDate": self.hire_date.isoformat() if self.hire_date else None,
            "status": self.status,
            # Paie
            "baseSalary": self.base_salary,
            "bankAccount": self.bank_account,
            "bankName": self.bank_name,
            # Charges sociales
            "cssNumber": self.css_number,
            "ipresNumber": self.ipres_number,
            "cssRate": self.css_rate,
            "ipresRate": self.ipres_rate,
            # Impôts
            "taxNumber": self.tax_number,
            "trimfRate": self.trimf_rate,
            "familySituation": self.family_situation,
            "dependents": self.dependents,
            # Documents
            "idCardNumber": self.id_card_number,
            "idCardExpiry": self.id_card_expiry.isoformat() if self.id_card_expiry else None,
        }