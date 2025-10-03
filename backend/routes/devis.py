# routes/devis.py
from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from functools import wraps
from models import Devis, User
from extensions import db
from datetime import datetime


devis_bp = Blueprint('devis_bp', __name__)

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
# GET : Liste des devis
# -------------------------
@devis_bp.route('/', methods=['GET'])
@jwt_required()
def get_devis():
    """Récupère la liste de tous les devis"""
    try:
        devis_list = Devis.query.order_by(Devis.created_at.desc()).all()
        data = [{
            'id': d.id,
            'nom': d.nom,
            'prenom': d.prenom,
            'telephone': d.telephone,
            'commentaire': d.commentaire,
            'created_at': d.created_at.isoformat(),
            'status': d.status,
            'user_id': d.user_id,
            'assigned_to': d.assigned_to,
            'assigned_user': {
                'id': d.assigned_user.id,
                'prenom': d.assigned_user.prenom,
                'nom': d.assigned_user.nom
            } if d.assigned_user else None
        } for d in devis_list]
        return jsonify({'success': True, 'data': data}), 200
    except Exception as e:
        return jsonify({'success': False, 'message': f'Erreur: {str(e)}'}), 500

# -------------------------
# POST : Créer un devis
# -------------------------
@devis_bp.route('/', methods=['POST'])
@jwt_required()
def create_devis():
    """Crée un nouveau devis"""
    current_user_id = get_jwt_identity()
    current_user = User.query.get(current_user_id)
    
    data = request.get_json()
    if not data:
        return jsonify({'success': False, 'message': 'Aucune donnée fournie'}), 400

    nom = data.get('nom')
    prenom = data.get('prenom')
    telephone = data.get('telephone')
    commentaire = data.get('commentaire', '')

    if not all([nom, prenom, telephone]):
        return jsonify({'success': False, 'message': 'Tous les champs obligatoires doivent être remplis'}), 400

    try:
        devis = Devis(
            nom=nom,
            prenom=prenom,
            telephone=telephone,
            commentaire=commentaire,
            user_id=current_user_id,
            status='en_attente',
            created_at=datetime.utcnow()
        )

        # Auto-assignation si l'utilisateur est technicien
        if current_user.role and current_user.role.name.lower() == 'technicien':
            devis.assigned_to = current_user_id
            devis.status = 'assigned'

        db.session.add(devis)
        db.session.commit()

        return jsonify({
            'success': True, 
            'message': 'Devis créé avec succès', 
            'devis_id': devis.id
        }), 201

    except Exception as e:
        db.session.rollback()
        return jsonify({'success': False, 'message': f'Erreur création: {str(e)}'}), 500

# -------------------------
# PUT : Mettre à jour un devis
# -------------------------
@devis_bp.route('/<int:devis_id>', methods=['PUT'])
@jwt_required()
def update_devis(devis_id):
    """Met à jour un devis existant"""
    current_user_id = get_jwt_identity()
    current_user = User.query.get(current_user_id)
    
    devis = Devis.query.get_or_404(devis_id)
    
    # Vérifier les permissions
    if not (current_user.has_permission("all") or current_user.id == devis.user_id):
        return jsonify({'success': False, 'message': 'Non autorisé'}), 403
    
    data = request.get_json()
    if not data:
        return jsonify({'success': False, 'message': 'Aucune donnée fournie'}), 400

    try:
        if 'nom' in data:
            devis.nom = data['nom']
        if 'prenom' in data:
            devis.prenom = data['prenom']
        if 'telephone' in data:
            devis.telephone = data['telephone']
        if 'commentaire' in data:
            devis.commentaire = data['commentaire']
        
        db.session.commit()
        return jsonify({'success': True, 'message': 'Devis mis à jour avec succès'}), 200
    
    except Exception as e:
        db.session.rollback()
        return jsonify({'success': False, 'message': f'Erreur mise à jour: {str(e)}'}), 500

# -------------------------
# PUT : Assigner un technicien
# -------------------------
@devis_bp.route('/<int:devis_id>/assign', methods=['PUT'])
@jwt_required()
def assign_devis(devis_id):
    """Assigne un technicien à un devis"""
    current_user_id = get_jwt_identity()
    current_user = User.query.get(current_user_id)
    
    devis = Devis.query.get_or_404(devis_id)
    data = request.get_json()
    
    if not data or 'assigned_to' not in data:
        return jsonify({'success': False, 'message': 'Technicien non sélectionné'}), 400

    technician_id = data['assigned_to']
    technician = User.query.get(technician_id)
    
    if not technician:
        return jsonify({'success': False, 'message': 'Technicien introuvable'}), 404

    # Vérifier les permissions
    if not (current_user.has_permission("all") or current_user.id == devis.user_id):
        return jsonify({'success': False, 'message': 'Non autorisé'}), 403

    try:
        devis.assigned_to = technician_id
        devis.status = 'assigned'
        db.session.commit()

        return jsonify({
            'success': True,
            'message': 'Devis assigné avec succès',
            'technician_name': f"{technician.prenom} {technician.nom}",
            'status': devis.status
        }), 200

    except Exception as e:
        db.session.rollback()
        return jsonify({'success': False, 'message': f'Erreur assignation: {str(e)}'}), 500

# -------------------------
# PUT : Compléter un devis
# -------------------------
@devis_bp.route('/<int:devis_id>/complete', methods=['PUT'])
@jwt_required()
def complete_devis(devis_id):
    """Marque un devis comme terminé"""
    current_user_id = get_jwt_identity()
    current_user = User.query.get(current_user_id)
    
    devis = Devis.query.get_or_404(devis_id)

    # Vérifier les permissions
    if not (current_user.has_permission("all") or current_user.id == devis.assigned_to):
        return jsonify({'success': False, 'message': 'Non autorisé'}), 403

    data = request.get_json()
    
    try:
        if data and 'commentaire' in data:
            devis.commentaire = data['commentaire']

        devis.status = 'completed'
        db.session.commit()

        return jsonify({'success': True, 'message': 'Devis terminé', 'status': devis.status}), 200

    except Exception as e:
        db.session.rollback()
        return jsonify({'success': False, 'message': f'Erreur mise à jour: {str(e)}'}), 500

# -------------------------
# DELETE : Supprimer un devis
# -------------------------
@devis_bp.route('/<int:devis_id>', methods=['DELETE'])
@admin_required
def delete_devis(devis_id):
    """Supprime un devis (admin uniquement)"""
    devis = Devis.query.get_or_404(devis_id)
    
    try:
        db.session.delete(devis)
        db.session.commit()
        return jsonify({'success': True, 'message': 'Devis supprimé avec succès'}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({'success': False, 'message': f'Erreur suppression: {str(e)}'}), 500