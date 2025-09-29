from flask import Blueprint, jsonify, request
from flask_jwt_extended import jwt_required
from extensions import db
from models import WorkLocation, User
work_locations_bp = Blueprint("work_locations_bp", __name__)

# 🔹 Récupérer toutes les zones de travail
@work_locations_bp.route("/", methods=["GET"])
@jwt_required()
def get_work_locations():
    locations = WorkLocation.query.filter_by(is_active=True).all()
    return jsonify([
        {
            "id": loc.id,
            "name": loc.name,
            "address": loc.address,
            "latitude": loc.latitude,
            "longitude": loc.longitude,
            "radius": loc.radius,
            "type": loc.type,
        }
        for loc in locations
    ]), 200


# 🔹 Ajouter une zone de travail
@work_locations_bp.route("/", methods=["POST"])
@jwt_required()
def add_work_location():
    data = request.get_json()
    location = WorkLocation(
        name=data.get("name"),
        address=data.get("address"),
        latitude=data.get("latitude"),
        longitude=data.get("longitude"),
        radius=data.get("radius"),
        type=data.get("type")
    )
    db.session.add(location)
    db.session.commit()
    return jsonify({"message": "Zone de travail ajoutée avec succès"}), 201


# 🔹 Supprimer une zone de travail
@work_locations_bp.route("/<int:location_id>", methods=["DELETE"])
@jwt_required()
def delete_work_location(location_id):
    location = WorkLocation.query.get(location_id)
    if not location:
        return jsonify({"error": "Zone de travail introuvable"}), 404

    db.session.delete(location)
    db.session.commit()
    return jsonify({"message": "Zone de travail supprimée avec succès"}), 200
