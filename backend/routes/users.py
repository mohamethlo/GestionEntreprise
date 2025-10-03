# routes/users.py
from flask import Blueprint, jsonify, request
from flask_jwt_extended import jwt_required, get_jwt_identity
from werkzeug.security import generate_password_hash
from models import User, Role
from extensions import db

# Blueprint avec url_prefix clair
users_bp = Blueprint("users_bp", __name__, url_prefix="/api/users")

# -------------------------
# GET : Lister tous les utilisateurs (admin only)
# -------------------------
@users_bp.route("/", methods=["GET"])
@jwt_required()
def list_users():
    current_user = User.query.get(get_jwt_identity())
    if not current_user or not current_user.has_permission("all"):
        return jsonify({"msg": "Accès refusé"}), 403

    users = User.query.all()
    return jsonify([
        {
            "id": u.id,
            "username": u.username,
            "email": u.email,
            "nom": u.nom,
            "prenom": u.prenom,
            "role": u.role.name if u.role else "Aucun",
            "is_active": u.is_active,
            "site": u.site
        } for u in users
    ]), 200

# -------------------------
# POST : Créer un nouvel utilisateur (admin only)
# -------------------------
@users_bp.route("/", methods=["POST"])
@jwt_required()
def add_user():
    current_user = User.query.get(get_jwt_identity())
    if not current_user or not current_user.has_permission("all"):
        return jsonify({"msg": "Accès refusé"}), 403

    data = request.get_json()
    if not data:
        return jsonify({"msg": "Aucune donnée fournie"}), 400

    role = Role.query.get(data.get("role_id"))
    if not role:
        return jsonify({"msg": "Rôle introuvable"}), 400

    # Vérifie l'unicité username/email
    if User.query.filter((User.username == data["username"]) | (User.email == data["email"])).first():
        return jsonify({"msg": "Nom d'utilisateur ou email déjà utilisé"}), 400

    new_user = User(
        username=data["username"],
        email=data["email"],
        nom=data.get("nom", ""),
        prenom=data.get("prenom", ""),
        telephone=data.get("telephone", ""),
        site=data.get("site", "Dakar"),
        role=role,
        permissions=role.permissions,
        is_active=True
    )
    new_user.set_password(data["password"])
    db.session.add(new_user)
    db.session.commit()

    return jsonify({"msg": "Utilisateur créé avec succès", "id": new_user.id}), 201

# -------------------------
# PUT : Mettre à jour un utilisateur (admin only)
# -------------------------
@users_bp.route("/<int:user_id>", methods=["PUT"])
@jwt_required()
def update_user(user_id):
    current_user = User.query.get(get_jwt_identity())
    if not current_user or not current_user.has_permission("all"):
        return jsonify({"msg": "Accès refusé"}), 403

    user = User.query.get_or_404(user_id)
    data = request.get_json()
    if not data:
        return jsonify({"msg": "Aucune donnée fournie"}), 400

    if "username" in data:
        user.username = data["username"]
    if "email" in data:
        user.email = data["email"]
    if "nom" in data:
        user.nom = data["nom"]
    if "prenom" in data:
        user.prenom = data["prenom"]
    if "telephone" in data:
        user.telephone = data["telephone"]
    if "site" in data:
        user.site = data["site"]
    if "is_active" in data:
        user.is_active = data["is_active"]
    if "role_id" in data:
        role = Role.query.get(data["role_id"])
        if not role:
            return jsonify({"msg": "Rôle introuvable"}), 400
        user.role = role
        user.permissions = role.permissions
    if "password" in data and data["password"]:
        user.set_password(data["password"])

    db.session.commit()
    return jsonify({"msg": "Utilisateur mis à jour avec succès"}), 200

# -------------------------
# DELETE : Supprimer un utilisateur (admin only)
# -------------------------
@users_bp.route("/<int:user_id>", methods=["DELETE"])
@jwt_required()
def delete_user(user_id):
    current_user = User.query.get(get_jwt_identity())
    if not current_user or not current_user.has_permission("all"):
        return jsonify({"msg": "Accès refusé"}), 403

    user = User.query.get_or_404(user_id)
    db.session.delete(user)
    db.session.commit()
    return jsonify({"msg": "Utilisateur supprimé avec succès"}), 200


# -------------------------
# PATCH : Changer le mot de passe
# -------------------------
@users_bp.route("/<int:user_id>/password", methods=["PATCH"])
@jwt_required()
def change_password(user_id):
    """
    Permet à un utilisateur de changer son mot de passe ou à un admin de réinitialiser le mot de passe d'un autre utilisateur.
    Corps JSON attendu :
    {
        "current_password": "ancien_mdp",  # obligatoire si pas admin
        "new_password": "nouveau_mdp"
    }
    """
    current_user = User.query.get(get_jwt_identity())
    target_user = User.query.get_or_404(user_id)
    data = request.get_json()

    if not data or "new_password" not in data:
        return jsonify({"msg": "Nouveau mot de passe requis"}), 400

    new_password = data["new_password"]

    # Vérification si l'utilisateur est admin
    if current_user.has_permission("all"):
        # Admin peut changer le mot de passe de n'importe qui sans l'ancien
        target_user.set_password(new_password)
        db.session.commit()
        return jsonify({"msg": f"Mot de passe de l'utilisateur {target_user.username} mis à jour par l'admin"}), 200
    else:
        # Vérification de l'ancien mot de passe
        if current_user.id != target_user.id:
            return jsonify({"msg": "Accès refusé"}), 403
        current_password = data.get("current_password", "")
        if not current_user.check_password(current_password):
            return jsonify({"msg": "Mot de passe actuel incorrect"}), 403
        current_user.set_password(new_password)
        db.session.commit()
        return jsonify({"msg": "Mot de passe mis à jour avec succès"}), 200

@users_bp.route("/techniciens", methods=["GET"])
@jwt_required()
def get_techniciens():
    """
    Récupère la liste de tous les techniciens actifs.
    Utilisé pour l'assignation des devis.
    """
    try:
        # Récupérer le rôle "Technicien"
        technicien_role = Role.query.filter_by(name='Technicien').first()
        
        if not technicien_role:
            return jsonify({
                'success': True, 
                'data': [],
                'message': 'Aucun rôle Technicien trouvé'
            }), 200
        
        # Récupérer tous les utilisateurs actifs avec ce rôle
        techniciens = User.query.filter_by(
            role_id=technicien_role.id,
            is_active=True
        ).all()
        
        data = [{
            'id': str(t.id),
            'username': t.username,
            'nom': t.nom,
            'prenom': t.prenom,
            'email': t.email,
            'telephone': t.telephone,
            'site': t.site
        } for t in techniciens]
        
        return jsonify({
            'success': True, 
            'data': data
        }), 200
        
    except Exception as e:
        return jsonify({
            'success': False, 
            'message': f'Erreur lors de la récupération des techniciens: {str(e)}'
        }), 500