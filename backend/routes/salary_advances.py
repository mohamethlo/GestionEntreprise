# routes/salary_advances.py

from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from datetime import datetime, date
from extensions import db
from models import SalaryAdvance, User

salary_advances_bp = Blueprint("salary_advances_bp", __name__, url_prefix="/api/salary_advances")


# -------------------------
# Créer une nouvelle demande d’avance
# -------------------------
@salary_advances_bp.route("", methods=["POST"])
@jwt_required()
def create_salary_advance():
    user_id = get_jwt_identity()
    data = request.get_json()

    montant = data.get("montant")
    motif = data.get("motif")

    if not montant or not motif:
        return jsonify({"success": False, "message": "Montant et motif obligatoires"}), 400

    advance = SalaryAdvance(
        user_id=user_id,
        montant=montant,
        motif=motif,
        date_demande=date.today(),
        statut="en_attente",
        created_at=datetime.utcnow()
    )

    db.session.add(advance)
    db.session.commit()

    return jsonify({"success": True, "message": "Demande d'avance envoyée"}), 201


# -------------------------
# Lister les demandes
# -------------------------
@salary_advances_bp.route("", methods=["GET"])
@jwt_required()
def list_salary_advances():
    user_id = get_jwt_identity()
    current_user = User.query.get(user_id)

    # Si admin → voir tout, sinon → voir uniquement ses demandes
    if current_user.role.name == "admin":
        advances = SalaryAdvance.query.order_by(SalaryAdvance.created_at.desc()).all()
    else:
        advances = SalaryAdvance.query.filter_by(user_id=user_id).order_by(SalaryAdvance.created_at.desc()).all()

    data = [
        {
            "id": adv.id,
            "user_id": adv.user_id,
            "user_name": f"{adv.user.nom} {adv.user.prenom}" if adv.user else "Inconnu",
            "montant": adv.montant,
            "motif": adv.motif,
            "statut": adv.statut,
            "date_demande": adv.date_demande.isoformat(),
            "created_at": adv.created_at.isoformat(),
            "approved_at": adv.approved_at.isoformat() if adv.approved_at else None,
            "approved_by": adv.approved_by_id,
            "notes_admin": adv.notes_admin,
        }
        for adv in advances
    ]

    return jsonify({"success": True, "advances": data}), 200


# -------------------------
# Approuver une demande
# -------------------------
# Approuver une avance
@salary_advances_bp.route('/<int:advance_id>/approve', methods=['POST'])
@jwt_required()
def approve_salary_advance(advance_id):
    current_user_id = get_jwt_identity()
    current_user = User.query.get(current_user_id)

    if not current_user or not current_user.has_permission("salary_advances"):
        return jsonify({"error": "Accès refusé"}), 403

    advance = SalaryAdvance.query.get_or_404(advance_id)
    advance.statut = 'approuve'
    advance.approved_at = datetime.utcnow()
    advance.approved_by_id = current_user.id
    advance.notes_admin = request.json.get('notes_admin', '')

    db.session.commit()
    return jsonify({"success": True, "message": "Avance approuvée"}), 200



# -------------------------
# Refuser une demande
# -------------------------

# Refuser une avance
@salary_advances_bp.route('/<int:advance_id>/refuse', methods=['POST'])
@jwt_required()
def refuse_salary_advance(advance_id):
    current_user_id = get_jwt_identity()
    current_user = User.query.get(current_user_id)

    if not current_user or not current_user.has_permission("salary_advances"):
        return jsonify({"error": "Accès refusé"}), 403

    advance = SalaryAdvance.query.get_or_404(advance_id)
    advance.statut = 'refuse'
    advance.approved_at = datetime.utcnow()
    advance.approved_by_id = current_user.id
    advance.notes_admin = request.json.get('notes_admin', '')

    db.session.commit()
    return jsonify({"success": True, "message": "Avance refusée"}), 200