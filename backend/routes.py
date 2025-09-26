from flask import Blueprint, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from models import User
from extensions import db
import logging

main_bp = Blueprint('main', __name__)
billing = Blueprint('billing', __name__)

# --- Test connexion DB ---
@main_bp.route('/users/test', methods=['GET'])
def get_test_users():
    print("🔍 Test connexion DB via /users/test")
    try:
        users = User.query.limit(5).all()
        results = [
            {
                "id": u.id,
                "username": u.username,
                "email": u.email,
                "role": u.role.name if u.role else "Inconnu",
                "is_active": u.is_active
            }
            for u in users
        ]

        return jsonify({
            "status": "success",
            "message": f"{len(results)} utilisateurs trouvés.",
            "data": results
        }), 200

    except Exception as e:
        logging.error(f"❌ Erreur DB: {e}")
        return jsonify({"status": "error", "message": str(e)}), 500


# --- Route protégée Dashboard ---
@main_bp.route('/dashboard/data', methods=['GET'])
@jwt_required()
def get_dashboard_data():
    user_id = get_jwt_identity()
    user = User.query.get(user_id)

    if not user:
        return jsonify({"msg": "Utilisateur introuvable."}), 404

    return jsonify({
        "welcome_message": f"Bienvenue, {user.prenom} {user.nom}!",
        "user_role": user.role.name if user.role else "Inconnu",
        "secured_info": "Données sécurisées accessibles uniquement avec JWT.",
        "last_login": user.last_login.strftime("%Y-%m-%d %H:%M:%S") if user.last_login else "Jamais"
    }), 200


# --- Factures ---
@billing.route('/invoices', methods=['GET'])
@jwt_required()
def list_invoices():
    user_id = get_jwt_identity()
    return jsonify({
        "status": "success",
        "message": f"Factures récupérées pour l'utilisateur ID: {user_id}",
        "invoices": [
            {"id": 1, "amount": 150.00, "status": "Payé"},
            {"id": 2, "amount": 220.50, "status": "En attente"}
        ]
    }), 200
