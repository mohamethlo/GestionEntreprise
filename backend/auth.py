from flask import Blueprint, request, jsonify
from werkzeug.security import check_password_hash, generate_password_hash
from flask_jwt_extended import (
    create_access_token,
    jwt_required,
    get_jwt_identity
)
from datetime import datetime, time, timedelta

from extensions import db
from models import User, Role

# --- Blueprint ---
auth_bp = Blueprint("auth", __name__)

# --- Utils ---
def is_valid_login_time():
    """Autorise la connexion entre 08h00 et 17h00"""
    now = datetime.now().time()
    return time(8, 0) <= now <= time(17, 00)

def admin_required(fn):
    """Décorateur pour limiter une route aux administrateurs"""
    from functools import wraps
    @wraps(fn)
    def wrapper(*args, **kwargs):
        user_id = int(get_jwt_identity())
        user = User.query.get(user_id)
        if not user or not user.role or user.role.name != "Administrateur":
            return jsonify({"status": "error", "msg": "Accès refusé. Administrateur uniquement."}), 403
        return fn(*args, **kwargs)
    return wrapper


# --- ROUTES AUTH ---
@auth_bp.route("/login", methods=["POST"])
def login():
    data = request.get_json()
    email = data.get("email")
    password = data.get("password")

    if not is_valid_login_time():
        return jsonify({"status": "error", "msg": "Connexion non autorisée à cette heure."}), 403

    user = User.query.filter_by(email=email).first()
    if not user or not check_password_hash(user.password_hash, password):
        return jsonify({"status": "error", "msg": "Email ou mot de passe incorrect."}), 401

    if not user.is_active:
        return jsonify({"status": "error", "msg": "Compte désactivé."}), 403

    user.last_login = datetime.utcnow()
    db.session.commit()

    access_token = create_access_token(
        identity=str(user.id),  # ⚠️ toujours string pour JWT
        expires_delta=timedelta(minutes=30)
    )

    return jsonify({
        "status": "success",
        "access_token": access_token,
        "user": {
            "id": user.id,
            "prenom": user.prenom,
            "nom": user.nom,
            "role": user.role.name if user.role else "Inconnu"
        }
    }), 200


@auth_bp.route("/logout", methods=["POST"])
@jwt_required()
def logout():
    # ⚠️ Le logout JWT est côté client (suppression du token)
    return jsonify({"status": "success", "msg": "Déconnexion réussie. Supprimez le token côté client."}), 200


@auth_bp.route("/verify", methods=["GET"])
@jwt_required()
def verify_token():
    user_id = get_jwt_identity()
    user = User.query.get(user_id)
    if not user or not user.is_active:
        return jsonify({"status": "error", "msg": "Utilisateur introuvable ou inactif."}), 401

    return jsonify({
        "status": "success",
        "user": {
            "id": user.id,
            "email": user.email,
            "prenom": user.prenom,
            "nom": user.nom,
            "role": user.role.name if user.role else "Inconnu",
            "last_login": user.last_login.strftime("%Y-%m-%d %H:%M:%S") if user.last_login else None
        },
        "is_login_time_valid": is_valid_login_time()
    }), 200


# --- ROUTES ADMIN ---
@auth_bp.route("/register", methods=["POST"])
@jwt_required()
@admin_required
def register_user():
    """Créer un utilisateur (Admin uniquement)."""
    data = request.get_json()
    username = data.get("username")
    email = data.get("email")
    password = data.get("password")
    prenom = data.get("prenom")
    nom = data.get("nom")
    role_name = data.get("role")

    if not all([username, email, password, prenom, nom, role_name]):
        return jsonify({"status": "error", "msg": "Champs manquants."}), 400

    if User.query.filter_by(email=email).first():
        return jsonify({"status": "error", "msg": "Un utilisateur avec cet email existe déjà."}), 400

    role = Role.query.filter_by(name=role_name).first()
    if not role:
        return jsonify({"status": "error", "msg": f"Le rôle '{role_name}' n’existe pas."}), 400

    try:
        new_user = User(
            username=username,
            email=email,
            prenom=prenom,
            nom=nom,
            password_hash=generate_password_hash(password),
            role=role,
            is_active=True
        )
        db.session.add(new_user)
        db.session.commit()
    except Exception as e:
        db.session.rollback()
        return jsonify({"status": "error", "msg": f"Erreur lors de la création : {str(e)}"}), 500

    return jsonify({
        "status": "success",
        "msg": "Utilisateur créé avec succès.",
        "user": {
            "id": new_user.id,
            "username": new_user.username,
            "email": new_user.email,
            "role": role.name
        }
    }), 201


@auth_bp.route('/users', methods=['GET'])
@jwt_required()
@admin_required
def list_users():
    """Lister tous les utilisateurs (Admin uniquement)."""
    users = User.query.all()
    results = [{
        "id": u.id,
        "username": u.username,
        "prenom": u.prenom,
        "nom": u.nom,
        "email": u.email,
        "role": u.role.name if u.role else "Inconnu",
        "is_active": u.is_active,
        "last_login": u.last_login.strftime("%Y-%m-%d %H:%M:%S") if u.last_login else None
    } for u in users]

    return jsonify({"status": "success", "count": len(results), "users": results}), 200


@auth_bp.route('/users/<int:user_id>', methods=['PUT'])
@jwt_required()
@admin_required
def update_user(user_id):
    """Modifier un utilisateur (Admin uniquement)."""
    user = User.query.get(user_id)
    if not user:
        return jsonify({"status": "error", "msg": "Utilisateur non trouvé."}), 404

    data = request.get_json()
    user.username = data.get("username", user.username)
    user.prenom = data.get("prenom", user.prenom)
    user.nom = data.get("nom", user.nom)
    user.email = data.get("email", user.email)
    user.is_active = data.get("is_active", user.is_active)

    if "role" in data:
        role = Role.query.filter_by(name=data["role"]).first()
        if not role:
            return jsonify({"status": "error", "msg": f"Rôle '{data['role']}' introuvable."}), 400
        user.role = role

    try:
        db.session.commit()
    except Exception as e:
        db.session.rollback()
        return jsonify({"status": "error", "msg": f"Erreur lors de la mise à jour : {str(e)}"}), 500

    return jsonify({
        "status": "success",
        "msg": f"Utilisateur {user.username} mis à jour avec succès.",
        "user": {
            "id": user.id,
            "username": user.username,
            "prenom": user.prenom,
            "nom": user.nom,
            "email": user.email,
            "role": user.role.name if user.role else "Inconnu",
            "is_active": user.is_active
        }
    }), 200


@auth_bp.route('/users/<int:user_id>', methods=['DELETE'])
@jwt_required()
@admin_required
def delete_user(user_id):
    """Supprimer un utilisateur (Admin uniquement)."""
    current_user_id = int(get_jwt_identity())
    user = User.query.get(user_id)

    if not user:
        return jsonify({"status": "error", "msg": "Utilisateur non trouvé."}), 404

    if user.id == current_user_id:
        return jsonify({"status": "error", "msg": "Vous ne pouvez pas supprimer votre propre compte."}), 400

    try:
        db.session.delete(user)
        db.session.commit()
    except Exception as e:
        db.session.rollback()
        return jsonify({"status": "error", "msg": f"Erreur lors de la suppression : {str(e)}"}), 500

    return jsonify({"status": "success", "msg": f"Utilisateur {user.username} supprimé avec succès."}), 200
