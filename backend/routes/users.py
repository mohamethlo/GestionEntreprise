from flask import Blueprint, jsonify, request
from flask_jwt_extended import jwt_required, get_jwt_identity
from models import User, Role
from extensions import db

users_bp = Blueprint("users", __name__)

# GET : Lister les utilisateurs
@users_bp.route("/", methods=["GET"])
@jwt_required()
def list_users():
    users = User.query.all()
    return jsonify([
        {
            "id": u.id,
            "username": u.username,
            "email": u.email,
            "role": u.role.name if u.role else "Aucun",
            "is_active": u.is_active
        } for u in users
    ]), 200


# PUT : Modifier un utilisateur
@users_bp.route("/<int:user_id>", methods=["PUT"])
@jwt_required()
def update_user(user_id):
    user = User.query.get_or_404(user_id)
    data = request.get_json()

    if "username" in data:
        user.username = data["username"]
    if "email" in data:
        user.email = data["email"]
    if "is_active" in data:
        user.is_active = data["is_active"]
    if "role_id" in data:
        role = Role.query.get(data["role_id"])
        if not role:
            return jsonify({"msg": "Rôle introuvable"}), 400
        user.role = role

    db.session.commit()
    return jsonify({"msg": "Utilisateur mis à jour avec succès"}), 200
