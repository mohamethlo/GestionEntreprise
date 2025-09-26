from flask import Blueprint, request, jsonify
from werkzeug.security import check_password_hash
from flask_jwt_extended import create_access_token, jwt_required, get_jwt_identity
from models import User
from extensions import db
from datetime import datetime, time, timedelta
from werkzeug.security import generate_password_hash
from models import Role

auth_bp = Blueprint("auth", __name__)

def is_valid_login_time():
    now = datetime.now().time()
    return time(8, 0) <= now <= time(23, 59)

@auth_bp.route("/login", methods=["POST"])
def login():
    data = request.get_json()
    email = data.get("email")
    password = data.get("password")

    if not is_valid_login_time():
        return jsonify({"msg": "Connexion non autorisée à cette heure."}), 403

    user = User.query.filter_by(email=email).first()
    if not user or not check_password_hash(user.password_hash, password):
        return jsonify({"msg": "Email ou mot de passe incorrect."}), 401

    if not user.is_active:
        return jsonify({"msg": "Compte désactivé."}), 403

    user.last_login = datetime.utcnow()
    db.session.commit()

    access_token = create_access_token(
    identity=str(user.id),  # convertit l’ID en string
    expires_delta=timedelta(minutes=30)
)

    return jsonify({
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
    return jsonify({"msg": "Déconnexion réussie (supprimez le token côté client)."}), 200

@auth_bp.route("/verify", methods=["GET"])
@jwt_required()
def verify_token():
    user_id = get_jwt_identity()
    user = User.query.get(user_id)
    if not user or not user.is_active:
        return jsonify({"msg": "Utilisateur introuvable ou inactif."}), 401

    return jsonify({
        "status": "active",
        "user_id": user.id,
        "email": user.email,
        "prenom": user.prenom,
        "role": user.role.name if user.role else "Inconnu",
        "is_login_time_valid": is_valid_login_time()
    }), 200


from werkzeug.security import generate_password_hash
from models import Role

@auth_bp.route("/register", methods=["POST"])
@jwt_required()  # Seul un admin peut créer des utilisateurs
def register_user():
    current_user_id = get_jwt_identity()
    current_user = User.query.get(current_user_id)

    # Vérif si l’utilisateur est admin
    if not current_user or not current_user.role or current_user.role.name != "Administrateur":
        return jsonify({"msg": "Accès refusé : seuls les administrateurs peuvent créer des utilisateurs."}), 403

    data = request.get_json()
    username = data.get("username")
    email = data.get("email")
    password = data.get("password")
    prenom = data.get("prenom")
    nom = data.get("nom")
    role_name = data.get("role")  # ex: "Technicien"

    if not all([username, email, password, prenom, nom, role_name]):
        return jsonify({"msg": "Champs manquants."}), 400

    # Vérif si email déjà pris
    if User.query.filter_by(email=email).first():
        return jsonify({"msg": "Un utilisateur avec cet email existe déjà."}), 400

    # Vérif si le rôle existe
    role = Role.query.filter_by(name=role_name).first()
    if not role:
        return jsonify({"msg": f"Le rôle '{role_name}' n’existe pas."}), 400

    # Création utilisateur
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

    return jsonify({
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
def list_users():
    """Lister tous les utilisateurs (réservé à l'administrateur)."""
    current_user_id = int(get_jwt_identity())
    user = User.query.get(current_user_id)

    if not user or not user.role or user.role.name != "Administrateur":
        return jsonify({"msg": "Accès refusé. Administrateur uniquement."}), 403

    # Récupérer tous les utilisateurs
    users = User.query.all()
    results = []
    for u in users:
        results.append({
            "id": u.id,
            "username": u.username,
            "prenom": u.prenom,
            "nom": u.nom,
            "email": u.email,
            "role": u.role.name if u.role else "Inconnu",
            "is_active": u.is_active,
            "last_login": u.last_login.strftime("%Y-%m-%d %H:%M:%S") if u.last_login else None
        })

    return jsonify({
        "status": "success",
        "count": len(results),
        "users": results
    }), 200

@auth_bp.route('/users/<int:user_id>', methods=['PUT'])
@jwt_required()
def update_user(user_id):
    """Modifier un utilisateur (Administrateur uniquement)."""
    current_user_id = int(get_jwt_identity())
    admin_user = User.query.get(current_user_id)

    if not admin_user or not admin_user.role or admin_user.role.name != "Administrateur":
        return jsonify({"msg": "Accès refusé. Administrateur uniquement."}), 403

    user = User.query.get(user_id)
    if not user:
        return jsonify({"msg": "Utilisateur non trouvé."}), 404

    data = request.get_json()
    # Champs modifiables
    user.username = data.get("username", user.username)
    user.prenom = data.get("prenom", user.prenom)
    user.nom = data.get("nom", user.nom)
    user.email = data.get("email", user.email)
    user.is_active = data.get("is_active", user.is_active)

    # Changement de rôle si fourni
    new_role_name = data.get("role")
    if new_role_name:
        from models import Role
        role = Role.query.filter_by(name=new_role_name).first()
        if not role:
            return jsonify({"msg": f"Rôle '{new_role_name}' introuvable."}), 400
        user.role = role

    from extensions import db
    db.session.commit()

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
def delete_user(user_id):
    """Supprimer un utilisateur (Administrateur uniquement)."""
    current_user_id = int(get_jwt_identity())
    admin_user = User.query.get(current_user_id)

    if not admin_user or not admin_user.role or admin_user.role.name != "Administrateur":
        return jsonify({"msg": "Accès refusé. Administrateur uniquement."}), 403

    user = User.query.get(user_id)
    if not user:
        return jsonify({"msg": "Utilisateur non trouvé."}), 404

    # Prévention de la suppression de soi-même
    if user.id == admin_user.id:
        return jsonify({"msg": "Vous ne pouvez pas supprimer votre propre compte."}), 400

    from extensions import db
    db.session.delete(user)
    db.session.commit()

    return jsonify({
        "status": "success",
        "msg": f"Utilisateur {user.username} supprimé avec succès."
    }), 200
