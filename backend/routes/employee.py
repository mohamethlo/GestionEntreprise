from flask import Blueprint, request, jsonify
from extensions import db
from models.employee import Employee
from models.user import User, Role
from datetime import datetime

employee_bp = Blueprint('employee_bp', __name__)

# 📋 Liste complète : utilisateurs + détails employés (si existants)
@employee_bp.route('/', methods=['GET'])
def get_employees():
    excluded_roles = ['Administrateur', 'Administration']
    
    users = (
        User.query
        .join(Role, User.role_id == Role.id)
        .filter(~Role.name.in_(excluded_roles))
        .all()
    )
    
    data = []
    for user in users:
        emp = Employee.query.filter_by(user_id=user.id).first()
        
        item = {
            "userId": user.id,
            "username": user.username,
            "nom": user.nom,
            "prenom": user.prenom,
            "email": user.email,
            "telephone": user.telephone,
            "role": user.role.name if user.role else None,
            "site": user.site,
            "is_active": user.is_active,
            "hasEmployeeDetails": emp is not None,  # Indicateur important
        }
        
        # Si fiche employé existe, on fusionne
        if emp:
            item.update(emp.to_dict())
        else:
            # Valeurs par défaut pour un employé sans fiche
            item.update({
                "employeeId": None,
                "birthDate": None,
                "job": None,
                "department": None,
                "manager": None,
                "contractType": None,
                "skills": [],
                "documents": [],
                "status": "Non enregistré",
                "baseSalary": None,
                "cssNumber": None,
                "ipresNumber": None,
                "taxNumber": None,
            })
        
        data.append(item)
    
    return jsonify(data), 200


# ➕ Créer ou mettre à jour la fiche employé d'un utilisateur
@employee_bp.route('/user/<int:user_id>', methods=['POST', 'PUT'])
def add_or_update_employee_details(user_id):
    excluded_roles = ['Administrateur', 'Administration']
    
    user = User.query.get(user_id)
    if not user:
        return jsonify({"error": "Utilisateur introuvable"}), 404
    
    if user.role and user.role.name in excluded_roles:
        return jsonify({"error": "Impossible d'ajouter des détails pour un administrateur"}), 403
    
    data = request.get_json()
    emp = Employee.query.filter_by(user_id=user_id).first()
    
    if not emp:
        # Création
        emp = Employee(user_id=user_id)
        db.session.add(emp)
    
    # Mise à jour des champs
    emp.birth_date = datetime.fromisoformat(data["birthDate"]) if data.get("birthDate") else emp.birth_date
    emp.job = data.get("job", emp.job)
    emp.department = data.get("department", emp.department)
    emp.manager = data.get("manager", emp.manager)
    emp.contract_type = data.get("contractType", emp.contract_type)
    emp.skills = ",".join(data.get("skills", [])) if data.get("skills") else emp.skills
    emp.documents = ",".join(data.get("documents", [])) if data.get("documents") else emp.documents
    emp.hire_date = datetime.fromisoformat(data["hireDate"]) if data.get("hireDate") else emp.hire_date
    emp.status = data.get("status", emp.status)
    
    # Paie
    emp.base_salary = data.get("baseSalary", emp.base_salary)
    emp.bank_account = data.get("bankAccount", emp.bank_account)
    emp.bank_name = data.get("bankName", emp.bank_name)
    
    # Charges sociales
    emp.css_number = data.get("cssNumber", emp.css_number)
    emp.ipres_number = data.get("ipresNumber", emp.ipres_number)
    emp.css_rate = data.get("cssRate", emp.css_rate)
    emp.ipres_rate = data.get("ipresRate", emp.ipres_rate)
    
    # Impôts
    emp.tax_number = data.get("taxNumber", emp.tax_number)
    emp.trimf_rate = data.get("trimfRate", emp.trimf_rate)
    emp.family_situation = data.get("familySituation", emp.family_situation)
    emp.dependents = data.get("dependents", emp.dependents)
    
    # Documents
    emp.id_card_number = data.get("idCardNumber", emp.id_card_number)
    emp.id_card_expiry = datetime.fromisoformat(data["idCardExpiry"]) if data.get("idCardExpiry") else emp.id_card_expiry
    
    db.session.commit()
    
    return jsonify({
        "msg": "Fiche employé enregistrée avec succès",
        "employee": emp.to_dict()
    }), 200


# 👁 Détails d'un employé spécifique
@employee_bp.route('/<int:employee_id>', methods=['GET'])
def get_employee_detail(employee_id):
    emp = Employee.query.get_or_404(employee_id)
    return jsonify(emp.to_dict()), 200


# ❌ Supprimer la fiche employé (pas l'utilisateur)
@employee_bp.route('/<int:employee_id>', methods=['DELETE'])
def delete_employee(employee_id):
    emp = Employee.query.get_or_404(employee_id)
    db.session.delete(emp)
    db.session.commit()
    return jsonify({"msg": "Fiche employé supprimée"}), 200