from flask import Blueprint, request, jsonify
from extensions import db
from models.employee import Employee
from datetime import datetime
from sqlalchemy import or_


employee_bp = Blueprint('employee_bp', __name__)

# ➕ Ajouter un employé
@employee_bp.route('/', methods=['POST'])
def add_employee():
    data = request.get_json()
    employee = Employee(
        first_name=data.get("firstName"),
        last_name=data.get("lastName"),
        birth_date=datetime.fromisoformat(data["birthDate"]) if data.get("birthDate") else None,
        email=data.get("email"),
        phone=data.get("phone"),
        job=data.get("job"),
        department=data.get("department"),
        manager=data.get("manager"),
        contract_type=data.get("contractType"),
        skills=",".join(data.get("skills", [])),
        documents=",".join(data.get("documents", []))
    )
    db.session.add(employee)
    db.session.commit()
    return jsonify({"msg": "Employé ajouté avec succès", "employee": employee.to_dict()}), 201


# 📋 Liste des employés
@employee_bp.route('/', methods=['GET'])
def get_employees():
    employees = Employee.query.all()
    return jsonify([emp.to_dict() for emp in employees]), 200

# 👁️ Voir les détails d’un employé
@employee_bp.route('/<int:id>', methods=['GET'])
def get_employee_detail(id):
    emp = Employee.query.get_or_404(id)
    return jsonify(emp.to_dict()), 200



# 🔄 Modifier un employé
@employee_bp.route('/<int:id>', methods=['PUT'])
def update_employee(id):
    data = request.get_json()
    emp = Employee.query.get_or_404(id)
    emp.first_name = data.get("firstName", emp.first_name)
    emp.last_name = data.get("lastName", emp.last_name)
    emp.birth_date = datetime.fromisoformat(data["birthDate"]) if data.get("birthDate") else emp.birth_date
    emp.email = data.get("email", emp.email)
    emp.phone = data.get("phone", emp.phone)
    emp.job = data.get("job", emp.job)
    emp.department = data.get("department", emp.department)
    emp.manager = data.get("manager", emp.manager)
    emp.contract_type = data.get("contractType", emp.contract_type)
    emp.skills = ",".join(data.get("skills", []))
    emp.documents = ",".join(data.get("documents", []))
    emp.status = data.get("status", emp.status)
    db.session.commit()
    return jsonify({"msg": "Employé mis à jour avec succès", "employee": emp.to_dict()}), 200


# ❌ Supprimer un employé
@employee_bp.route('/<int:id>', methods=['DELETE'])
def delete_employee(id):
    emp = Employee.query.get_or_404(id)
    db.session.delete(emp)
    db.session.commit()
    return jsonify({"msg": "Employé supprimé avec succès"}), 200

