from flask import Blueprint, jsonify
from flask_jwt_extended import jwt_required
from models import Role

roles_bp = Blueprint("roles", __name__)

# GET : Lister les rôles
@roles_bp.route("/", methods=["GET"])
@jwt_required()
def list_roles():
    roles = Role.query.all()
    return jsonify([
        {"id": r.id, "name": r.name, "permissions": r.permissions}
        for r in roles
    ]), 200
