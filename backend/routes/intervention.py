# routes/intervention.py
from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from extensions import db
from models.intervention import Intervention
from models.client import Client
from datetime import datetime

intervention_bp = Blueprint("intervention_bp", __name__, url_prefix="/api/interventions")

# ➤ Validation des données
def is_valid_intervention_data(data, is_update=False):
    required_fields = ['client_id', 'description', 'status', 'technician_id']
    if not is_update and not all(field in data for field in required_fields):
        return False
    valid_statuses = ['Planifiée', 'En cours', 'Terminée', 'Annulée']
    if 'status' in data and data['status'] not in valid_statuses:
        return False
    return True

# ➤ Créer une intervention
@intervention_bp.route("/", methods=["POST"])
@jwt_required()
def create_intervention():
    data = request.get_json()
    if not data or not is_valid_intervention_data(data):
        return jsonify({"msg": "Données incomplètes ou statut invalide."}), 400

    client = Client.query.get(data["client_id"])
    if not client:
        return jsonify({"msg": f"Client {data['client_id']} non trouvé"}), 404

    intervention = Intervention(
        client_id=data["client_id"],
        description=data["description"],
        status=data.get("status", "Planifiée"),
        technician_id=data["technician_id"]
    )
    db.session.add(intervention)
    db.session.commit()
    return jsonify({"msg": "Intervention créée", "id": intervention.id}), 201

# ➤ Lister toutes les interventions
@intervention_bp.route("/", methods=["GET"])
@jwt_required()
def list_interventions():
    query = Intervention.query

    status_filter = request.args.get('status')
    technician_filter = request.args.get('technician_id', type=int)

    if status_filter:
        query = query.filter_by(status=status_filter)
    if technician_filter:
        query = query.filter_by(technician_id=technician_filter)

    interventions = query.all()
    return jsonify([{
        "id": i.id,
        "client_id": i.client_id,
        "description": i.description,
        "status": i.status,
        "technician_id": i.technician_id
    } for i in interventions]), 200

# ➤ Récupérer une intervention par ID
@intervention_bp.route("/<int:id>", methods=["GET"])
@jwt_required()
def get_intervention(id):
    intervention = Intervention.query.get(id)
    if not intervention:
        return jsonify({"msg": "Intervention non trouvée"}), 404
    return jsonify({
        "id": intervention.id,
        "client_id": intervention.client_id,
        "description": intervention.description,
        "status": intervention.status,
        "technician_id": intervention.technician_id,
        "rapport": intervention.rapport,
        "cout_estime": intervention.cout_estime
    }), 200

# ➤ Mettre à jour une intervention
@intervention_bp.route("/<int:id>", methods=["PUT"])
@jwt_required()
def update_intervention(id):
    intervention = Intervention.query.get(id)
    if not intervention:
        return jsonify({"msg": "Intervention non trouvée"}), 404

    data = request.get_json()
    if not data or not is_valid_intervention_data(data, is_update=True):
        return jsonify({"msg": "Données incomplètes ou statut invalide"}), 400

    for field in ["description", "status", "technician_id"]:
        if field in data:
            setattr(intervention, field, data[field])

    db.session.commit()
    return jsonify({"msg": "Intervention mise à jour"}), 200

# ➤ Supprimer une intervention
@intervention_bp.route("/<int:id>", methods=["DELETE"])
@jwt_required()
def delete_intervention(id):
    intervention = Intervention.query.get(id)
    if not intervention:
        return jsonify({"msg": "Intervention non trouvée"}), 404

    db.session.delete(intervention)
    db.session.commit()
    return jsonify({"msg": "Intervention supprimée"}), 200

# ➤ Marquer comme terminée
@intervention_bp.route("/<int:id>/complete", methods=["POST"])
@jwt_required()
def complete_intervention(id):
    intervention = Intervention.query.get(id)
    if not intervention:
        return jsonify({"msg": "Intervention non trouvée"}), 404

    data = request.get_json() or {}
    intervention.status = "Terminée"
    intervention.rapport = data.get("rapport", "Aucun rapport fourni")
    db.session.commit()
    return jsonify({"msg": "Intervention terminée", "rapport": intervention.rapport}), 200
