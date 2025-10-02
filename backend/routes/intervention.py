from datetime import datetime
from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from extensions import db
from models import Intervention, Client, User, InterventionMaterial, InventoryItem

intervention_bp = Blueprint("interventions", __name__, url_prefix="/api/interventions")


# -------------------------------
# Validation
# -------------------------------
def is_valid_intervention_data(data, is_update=False):
    required_fields = ['description', 'date_prevue', 'created_by_id']
    if not is_update and not all(field in data for field in required_fields):
        return False
    if "statut" in data and data["statut"] not in ["planifiee", "en_cours", "terminee", "annulee"]:
        return False
    if "priorite" in data and data["priorite"] not in ["basse", "normale", "haute", "urgente"]:
        return False
    return True


# -------------------------------
# Créer une intervention
# -------------------------------
@intervention_bp.route("/", methods=["POST"])
@jwt_required()
def create_intervention():
    data = request.get_json()
    if not data or not is_valid_intervention_data(data):
        return jsonify({"msg": "Données invalides"}), 400

    intervention = Intervention(
        description=data["description"],
        statut=data.get("statut", "planifiee"),
        priorite=data.get("priorite", "normale"),
        client_id=data.get("client_id"),
        client_libre_nom=data.get("client_libre_nom"),
        client_libre_telephone=data.get("client_libre_telephone"),
        technicien_id=data.get("technicien_id"),
        date_prevue=datetime.fromisoformat(data["date_prevue"]),
        created_by_id=data["created_by_id"],
        adresse=data.get("adresse"),
        notes=data.get("notes"),
        type_intervention=data.get("type_intervention"),
        societe=data.get("societe"),
        representant=data.get("representant"),
        telephone=data.get("telephone")
    )
    db.session.add(intervention)
    db.session.commit()

    return jsonify({"msg": "Intervention créée", "id": intervention.id}), 201


# -------------------------------
# Lister avec filtres
# -------------------------------
@intervention_bp.route("/", methods=["GET"])
@jwt_required()
def list_interventions():
    query = Intervention.query

    statut = request.args.get("statut")
    priorite = request.args.get("priorite")
    technicien_id = request.args.get("technicien_id", type=int)
    client_id = request.args.get("client_id", type=int)
    date_min = request.args.get("date_min")
    date_max = request.args.get("date_max")

    if statut:
        query = query.filter_by(statut=statut)
    if priorite:
        query = query.filter_by(priorite=priorite)
    if technicien_id:
        query = query.filter_by(technicien_id=technicien_id)
    if client_id:
        query = query.filter_by(client_id=client_id)
    if date_min:
        query = query.filter(Intervention.date_prevue >= datetime.fromisoformat(date_min))
    if date_max:
        query = query.filter(Intervention.date_prevue <= datetime.fromisoformat(date_max))

    interventions = query.all()
    return jsonify([{
        "id": i.id,
        "description": i.description,
        "statut": i.statut,
        "priorite": i.priorite,
        "client_id": i.client_id,
        "technicien_id": i.technicien_id,
        "date_prevue": i.date_prevue.isoformat() if i.date_prevue else None
    } for i in interventions]), 200


# -------------------------------
# Récupérer une intervention
# -------------------------------
@intervention_bp.route("/<int:id>", methods=["GET"])
@jwt_required()
def get_intervention(id):
    intervention = Intervention.query.get(id)
    if not intervention:
        return jsonify({"msg": "Intervention non trouvée"}), 404

    return jsonify({
        "id": intervention.id,
        "description": intervention.description,
        "statut": intervention.statut,
        "priorite": intervention.priorite,
        "client_id": intervention.client_id,
        "client_libre_nom": intervention.client_libre_nom,
        "client_libre_telephone": intervention.client_libre_telephone,
        "technicien_id": intervention.technicien_id,
        "date_prevue": intervention.date_prevue.isoformat() if intervention.date_prevue else None,
        "date_realisation": intervention.date_realisation.isoformat() if intervention.date_realisation else None,
        "adresse": intervention.adresse,
        "notes": intervention.notes,
        "type_intervention": intervention.type_intervention,
        "societe": intervention.societe,
        "representant": intervention.representant,
        "telephone": intervention.telephone,
        "created_by_id": intervention.created_by_id,
        "autres_intervenants": [{"id": u.id, "username": u.username} for u in intervention.autres_intervenants],
        "materiels": [{
            "id": m.id,
            "article_id": m.article_id,
            "article_nom": m.article.name if m.article else None,
            "quantite": m.quantite
        } for m in intervention.materiels]
    }), 200


# -------------------------------
# Mettre à jour
# -------------------------------
@intervention_bp.route("/<int:id>", methods=["PUT"])
@jwt_required()
def update_intervention(id):
    intervention = Intervention.query.get(id)
    if not intervention:
        return jsonify({"msg": "Intervention non trouvée"}), 404

    data = request.get_json()
    if not is_valid_intervention_data(data, is_update=True):
        return jsonify({"msg": "Données invalides"}), 400

    for field in [
        "description", "statut", "priorite", "technicien_id", "adresse", "notes",
        "type_intervention", "societe", "representant", "telephone",
        "client_libre_nom", "client_libre_telephone"
    ]:
        if field in data:
            setattr(intervention, field, data[field])

    if "date_prevue" in data:
        intervention.date_prevue = datetime.fromisoformat(data["date_prevue"])
    if "date_realisation" in data:
        intervention.date_realisation = datetime.fromisoformat(data["date_realisation"])

    db.session.commit()
    return jsonify({"msg": "Intervention mise à jour"}), 200


# -------------------------------
# Supprimer
# -------------------------------
@intervention_bp.route("/<int:id>", methods=["DELETE"])
@jwt_required()
def delete_intervention(id):
    intervention = Intervention.query.get(id)
    if not intervention:
        return jsonify({"msg": "Intervention non trouvée"}), 404

    db.session.delete(intervention)
    db.session.commit()
    return jsonify({"msg": "Intervention supprimée"}), 200


# -------------------------------
# Clôturer une intervention
# -------------------------------
@intervention_bp.route("/<int:id>/complete", methods=["POST"])
@jwt_required()
def complete_intervention(id):
    intervention = Intervention.query.get(id)
    if not intervention:
        return jsonify({"msg": "Intervention non trouvée"}), 404

    data = request.get_json() or {}
    intervention.statut = "terminee"
    intervention.notes = data.get("rapport", intervention.notes)
    intervention.date_realisation = datetime.utcnow()

    db.session.commit()
    return jsonify({"msg": "Intervention terminée"}), 200


# -------------------------------
# Gestion des autres intervenants
# -------------------------------
@intervention_bp.route("/<int:id>/intervenants", methods=["PATCH"])
@jwt_required()
def manage_intervenants(id):
    intervention = Intervention.query.get(id)
    if not intervention:
        return jsonify({"msg": "Intervention non trouvée"}), 404

    data = request.get_json() or {}
    action = data.get("action")
    user_id = data.get("user_id")

    user = User.query.get(user_id)
    if not user:
        return jsonify({"msg": "Utilisateur introuvable"}), 404

    if action == "add":
        intervention.autres_intervenants.append(user)
    elif action == "remove":
        intervention.autres_intervenants.remove(user)
    else:
        return jsonify({"msg": "Action invalide"}), 400

    db.session.commit()
    return jsonify({"msg": f"Intervenant {action}"}), 200


# -------------------------------
# Gestion des matériels
# -------------------------------
@intervention_bp.route("/<int:id>/materiels", methods=["PATCH"])
@jwt_required()
def manage_materiels(id):
    intervention = Intervention.query.get(id)
    if not intervention:
        return jsonify({"msg": "Intervention non trouvée"}), 404

    data = request.get_json() or {}
    action = data.get("action")
    article_id = data.get("article_id")
    quantite = data.get("quantite", 1)

    article = InventoryItem.query.get(article_id)
    if not article:
        return jsonify({"msg": "Article introuvable"}), 404

    if action == "add":
        mat = InterventionMaterial(intervention_id=id, article_id=article_id, quantite=quantite)
        db.session.add(mat)
    elif action == "update":
        mat = InterventionMaterial.query.filter_by(intervention_id=id, article_id=article_id).first()
        if not mat:
            return jsonify({"msg": "Matériel non trouvé dans l'intervention"}), 404
        mat.quantite = quantite
    elif action == "remove":
        mat = InterventionMaterial.query.filter_by(intervention_id=id, article_id=article_id).first()
        if mat:
            db.session.delete(mat)
    else:
        return jsonify({"msg": "Action invalide"}), 400

    db.session.commit()
    return jsonify({"msg": f"Matériel {action}"}), 200