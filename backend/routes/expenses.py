# routes/expenses.py
import os
from datetime import datetime, date
from flask import Blueprint, request, jsonify, current_app
from flask_jwt_extended import jwt_required, get_jwt_identity
from werkzeug.utils import secure_filename
from functools import wraps
from models import Expense, User, Approvisionnement
from extensions import db

expenses_bp = Blueprint('expenses_bp', __name__)

# -------------------------
# Décorateur admin_required adapté pour JWT
# -------------------------
def admin_required(f):
    @wraps(f)
    @jwt_required()
    def decorated_function(*args, **kwargs):
        current_user = User.query.get(get_jwt_identity())
        if not current_user or not current_user.has_permission("all"):
            return jsonify({'success': False, 'message': 'Accès non autorisé'}), 403
        return f(*args, **kwargs)
    return decorated_function

# -------------------------
# GET : Liste des dépenses
# -------------------------
@expenses_bp.route('/', methods=['GET'])
@jwt_required()
def get_expenses():
    current_user = User.query.get(get_jwt_identity())
    site = request.args.get('site')
    month = request.args.get('month', type=int)
    category = request.args.get('category')
    employee = request.args.get('employee', type=int)

    try:
        expenses_query = Expense.query.filter(Expense.deleted_at.is_(None))

        # Permissions et filtres
        if current_user.role.name.lower() == 'administrateur':
            if site:
                expenses_query = expenses_query.filter(Expense.site == site)
        elif current_user.role.name.lower() == 'administration':
            expenses_query = expenses_query.filter(Expense.site == current_user.site)
        else:  # employé
            expenses_query = expenses_query.filter(Expense.user_id == current_user.id)

        if month:
            expenses_query = expenses_query.filter(db.extract('month', Expense.date_depense) == month)
        if category:
            expenses_query = expenses_query.filter(Expense.categorie == category)
        if employee:
            expenses_query = expenses_query.filter(Expense.user_id == employee)

        expenses = expenses_query.order_by(Expense.created_at.desc()).all()

        data = [{
            'id': e.id,
            'titre': e.titre,
            'description': e.description,
            'montant': float(e.montant),
            'categorie': e.categorie,
            'date_depense': e.date_depense.isoformat(),
            'statut': e.statut,
            'site': e.site,
            'user_id': e.user_id,
            'justificatif': e.justificatif
        } for e in expenses]

        return jsonify({'success': True, 'data': data}), 200

    except Exception as e:
        return jsonify({'success': False, 'message': f'Erreur: {str(e)}'}), 500

# -------------------------
# POST : Créer une dépense
# -------------------------
@expenses_bp.route('/', methods=['POST'])
@jwt_required()
def create_expense():
    current_user = User.query.get(get_jwt_identity())
    if not current_user.has_permission('expenses'):
        return jsonify({'success': False, 'message': 'Accès non autorisé'}), 403

    data = request.form
    titre = data.get('titre')
    description = data.get('description')
    montant = data.get('montant')
    categorie = data.get('categorie')
    site = data.get('site') or getattr(current_user, 'site', None)
    date_depense = data.get('date_depense')
    
    if not all([titre, montant, categorie, site]):
        return jsonify({'success': False, 'message': 'Champs obligatoires manquants'}), 400

    # Gestion fichier justificatif
    justificatif = None
    facture_file = request.files.get('facture')
    if facture_file and facture_file.filename:
        upload_folder = os.path.join(current_app.static_folder, 'uploads', 'factures')
        os.makedirs(upload_folder, exist_ok=True)
        filename = secure_filename(facture_file.filename)
        file_path = os.path.join(upload_folder, filename)
        facture_file.save(file_path)
        justificatif = f"uploads/factures/{filename}"

    try:
        expense = Expense(
            user_id=current_user.id,
            titre=titre,
            description=description,
            montant=float(montant),
            categorie=categorie,
            date_depense=datetime.strptime(date_depense, '%Y-%m-%d').date() if date_depense else date.today(),
            site=site,
            statut='en_attente',
            justificatif=justificatif
        )
        db.session.add(expense)
        db.session.commit()
        return jsonify({'success': True, 'message': 'Dépense créée', 'expense_id': expense.id}), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({'success': False, 'message': f'Erreur création: {str(e)}'}), 500

# -------------------------
# PUT : Mettre à jour une dépense
# -------------------------
@expenses_bp.route('/<int:expense_id>', methods=['PUT'])
@jwt_required()
def update_expense(expense_id):
    current_user = User.query.get(get_jwt_identity())
    expense = Expense.query.get_or_404(expense_id)

    if not (current_user.has_permission("all") or current_user.id == expense.user_id):
        return jsonify({'success': False, 'message': 'Non autorisé'}), 403

    data = request.get_json()
    try:
        if 'titre' in data: expense.titre = data['titre']
        if 'description' in data: expense.description = data['description']
        if 'montant' in data: expense.montant = float(data['montant'])
        if 'categorie' in data: expense.categorie = data['categorie']
        if 'statut' in data: expense.statut = data['statut']
        db.session.commit()
        return jsonify({'success': True, 'message': 'Dépense mise à jour'}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({'success': False, 'message': f'Erreur mise à jour: {str(e)}'}), 500

# -------------------------
# DELETE : Supprimer une dépense (soft delete)
# -------------------------
@expenses_bp.route('/<int:expense_id>', methods=['DELETE'])
@jwt_required()
def delete_expense(expense_id):
    current_user = User.query.get(get_jwt_identity())
    expense = Expense.query.get_or_404(expense_id)

    if not (current_user.has_permission("all") or current_user.id == expense.user_id):
        return jsonify({'success': False, 'message': 'Non autorisé'}), 403

    try:
        expense.deleted_at = datetime.utcnow()
        db.session.commit()
        return jsonify({'success': True, 'message': 'Dépense supprimée'}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({'success': False, 'message': f'Erreur suppression: {str(e)}'}), 500

# -------------------------
# GET : Dépenses supprimées
# -------------------------
@expenses_bp.route('/trash', methods=['GET'])
@jwt_required()
def get_trashed_expenses():
    current_user = User.query.get(get_jwt_identity())
    trashed_query = Expense.query.filter(Expense.deleted_at.isnot(None))

    if current_user.role.name.lower() == 'administration':
        trashed_query = trashed_query.filter(Expense.site == current_user.site)
    elif current_user.role.name.lower() not in ['administrateur', 'administration']:
        trashed_query = trashed_query.filter(Expense.user_id == current_user.id)

    trashed = trashed_query.order_by(Expense.deleted_at.desc()).all()
    data = [{
        'id': e.id,
        'titre': e.titre,
        'montant': float(e.montant),
        'categorie': e.categorie,
        'statut': e.statut,
        'date_depense': e.date_depense.isoformat(),
        'deleted_at': e.deleted_at.isoformat() if e.deleted_at else None
    } for e in trashed]

    return jsonify({'success': True, 'data': data}), 200

# -------------------------
# PUT : Approuver une dépense
# -------------------------
@expenses_bp.route('/<int:expense_id>/approve', methods=['PUT'])
@jwt_required()
def approve_expense(expense_id):
    current_user = User.query.get(get_jwt_identity())
    expense = Expense.query.get_or_404(expense_id)

    if not current_user.has_permission("all"):
        return jsonify({'success': False, 'message': 'Non autorisé'}), 403

    try:
        expense.statut = 'approuve'
        db.session.commit()
        return jsonify({'success': True, 'message': 'Dépense approuvée', 'status': expense.statut}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({'success': False, 'message': f'Erreur approbation: {str(e)}'}), 500

# -------------------------
# PUT : Rejeter une dépense
# -------------------------
@expenses_bp.route('/<int:expense_id>/reject', methods=['PUT'])
@jwt_required()
def reject_expense(expense_id):
    current_user = User.query.get(get_jwt_identity())
    expense = Expense.query.get_or_404(expense_id)

    if not current_user.has_permission("all"):
        return jsonify({'success': False, 'message': 'Non autorisé'}), 403

    try:
        expense.statut = 'rejetee'
        db.session.commit()
        return jsonify({'success': True, 'message': 'Dépense rejetée', 'status': expense.statut}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({'success': False, 'message': f'Erreur rejet: {str(e)}'}), 500
