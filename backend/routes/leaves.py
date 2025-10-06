# routes/leaves.py
from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from functools import wraps
from models import Leave, User
from extensions import db
from datetime import datetime


leaves_bp = Blueprint('leaves_bp', __name__)

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
# GET : Liste des demandes de congés
# -------------------------
@leaves_bp.route('/', methods=['GET'])
@jwt_required()
def get_leaves():
    """Récupère la liste de toutes les demandes de congés"""
    try:
        current_user_id = get_jwt_identity()
        current_user = User.query.get(current_user_id)
        
        # Admin voit tout, employé voit ses propres demandes
        if current_user.has_permission("all"):
            leaves_list = Leave.query.order_by(Leave.created_at.desc()).all()
        else:
            leaves_list = Leave.query.filter_by(user_id=current_user_id).order_by(Leave.created_at.desc()).all()
        
        data = [{
            'id': leave.id,
            'user_id': leave.user_id,
            'user_name': f"{leave.user.prenom} {leave.user.nom}" if leave.user else "Inconnu",
            'leave_type': leave.leave_type,
            'start_date': leave.start_date.isoformat() if leave.start_date else None,
            'end_date': leave.end_date.isoformat() if leave.end_date else None,
            'duration': leave.duration,
            'reason': leave.reason,
            'status': leave.status,
            'created_at': leave.created_at.isoformat(),
            'approved_by': leave.approved_by,
            'approved_at': leave.approved_at.isoformat() if leave.approved_at else None,
            'approver_name': f"{leave.approver.prenom} {leave.approver.nom}" if leave.approver else None
        } for leave in leaves_list]
        
        return jsonify({'success': True, 'data': data}), 200
    except Exception as e:
        return jsonify({'success': False, 'message': f'Erreur: {str(e)}'}), 500

# -------------------------
# GET : Demandes en attente
# -------------------------
@leaves_bp.route('/pending', methods=['GET'])
@admin_required
def get_pending_leaves():
    """Récupère uniquement les demandes en attente (admin uniquement)"""
    try:
        pending_leaves = Leave.query.filter_by(status='pending').order_by(Leave.created_at.desc()).all()
        
        data = [{
            'id': leave.id,
            'user_id': leave.user_id,
            'user_name': f"{leave.user.prenom} {leave.user.nom}" if leave.user else "Inconnu",
            'leave_type': leave.leave_type,
            'start_date': leave.start_date.isoformat() if leave.start_date else None,
            'end_date': leave.end_date.isoformat() if leave.end_date else None,
            'duration': leave.duration,
            'reason': leave.reason,
            'status': leave.status,
            'created_at': leave.created_at.isoformat()
        } for leave in pending_leaves]
        
        return jsonify({'success': True, 'data': data}), 200
    except Exception as e:
        return jsonify({'success': False, 'message': f'Erreur: {str(e)}'}), 500

# -------------------------
# GET : Solde de congés d'un utilisateur
# -------------------------
@leaves_bp.route('/balance/<int:user_id>', methods=['GET'])
@jwt_required()
def get_leave_balance(user_id):
    """Récupère le solde de congés d'un utilisateur"""
    try:
        current_user_id = get_jwt_identity()
        current_user = User.query.get(current_user_id)
        
        # Vérifier les permissions
        if not (current_user.has_permission("all") or current_user_id == user_id):
            return jsonify({'success': False, 'message': 'Non autorisé'}), 403
        
        user = User.query.get_or_404(user_id)
        
        # Calculer les congés utilisés par type
        current_year = datetime.now().year
        leaves = Leave.query.filter(
            Leave.user_id == user_id,
            Leave.status == 'approved',
            db.extract('year', Leave.start_date) == current_year
        ).all()
        
        balance = {
            'conges_payes': {'used': 0, 'total': 25},
            'rtt': {'used': 0, 'total': 10},
            'maladie': {'used': 0, 'total': 15}
        }
        
        for leave in leaves:
            if leave.leave_type == 'vacances':
                balance['conges_payes']['used'] += leave.duration
            elif leave.leave_type == 'rtt':
                balance['rtt']['used'] += leave.duration
            elif leave.leave_type == 'maladie':
                balance['maladie']['used'] += leave.duration
        
        return jsonify({'success': True, 'data': balance}), 200
    except Exception as e:
        return jsonify({'success': False, 'message': f'Erreur: {str(e)}'}), 500

# -------------------------
# POST : Créer une demande de congé
# -------------------------
@leaves_bp.route('/', methods=['POST'])
@jwt_required()
def create_leave():
    """Crée une nouvelle demande de congé"""
    current_user_id = get_jwt_identity()
    
    data = request.get_json()
    if not data:
        return jsonify({'success': False, 'message': 'Aucune donnée fournie'}), 400

    leave_type = data.get('leave_type')
    start_date = data.get('start_date')
    end_date = data.get('end_date')
    duration = data.get('duration')
    reason = data.get('reason', '')

    if not all([leave_type, start_date, end_date, duration]):
        return jsonify({'success': False, 'message': 'Tous les champs obligatoires doivent être remplis'}), 400

    try:
        # Convertir les dates
        start_date_obj = datetime.fromisoformat(start_date.replace('Z', '+00:00'))
        end_date_obj = datetime.fromisoformat(end_date.replace('Z', '+00:00'))
        
        leave = Leave(
            user_id=current_user_id,
            leave_type=leave_type,
            start_date=start_date_obj,
            end_date=end_date_obj,
            duration=duration,
            reason=reason,
            status='pending',
            created_at=datetime.utcnow()
        )

        db.session.add(leave)
        db.session.commit()

        return jsonify({
            'success': True, 
            'message': 'Demande de congé créée avec succès', 
            'leave_id': leave.id
        }), 201

    except Exception as e:
        db.session.rollback()
        return jsonify({'success': False, 'message': f'Erreur création: {str(e)}'}), 500

# -------------------------
# PUT : Mettre à jour une demande de congé
# -------------------------
@leaves_bp.route('/<int:leave_id>', methods=['PUT'])
@jwt_required()
def update_leave(leave_id):
    """Met à jour une demande de congé existante"""
    current_user_id = get_jwt_identity()
    current_user = User.query.get(current_user_id)
    
    leave = Leave.query.get_or_404(leave_id)
    
    # Vérifier les permissions (seul le créateur ou admin peut modifier)
    if not (current_user.has_permission("all") or current_user.id == leave.user_id):
        return jsonify({'success': False, 'message': 'Non autorisé'}), 403
    
    # Ne pas modifier si déjà approuvée ou refusée
    if leave.status != 'pending':
        return jsonify({'success': False, 'message': 'Impossible de modifier une demande déjà traitée'}), 400
    
    data = request.get_json()
    if not data:
        return jsonify({'success': False, 'message': 'Aucune donnée fournie'}), 400

    try:
        if 'leave_type' in data:
            leave.leave_type = data['leave_type']
        if 'start_date' in data:
            leave.start_date = datetime.fromisoformat(data['start_date'].replace('Z', '+00:00'))
        if 'end_date' in data:
            leave.end_date = datetime.fromisoformat(data['end_date'].replace('Z', '+00:00'))
        if 'duration' in data:
            leave.duration = data['duration']
        if 'reason' in data:
            leave.reason = data['reason']
        
        db.session.commit()
        return jsonify({'success': True, 'message': 'Demande mise à jour avec succès'}), 200
    
    except Exception as e:
        db.session.rollback()
        return jsonify({'success': False, 'message': f'Erreur mise à jour: {str(e)}'}), 500

# -------------------------
# PUT : Approuver une demande de congé
# -------------------------
@leaves_bp.route('/<int:leave_id>/approve', methods=['PUT'])
@admin_required
def approve_leave(leave_id):
    """Approuve une demande de congé (admin uniquement)"""
    current_user_id = get_jwt_identity()
    leave = Leave.query.get_or_404(leave_id)
    
    if leave.status != 'pending':
        return jsonify({'success': False, 'message': 'Cette demande a déjà été traitée'}), 400

    try:
        leave.status = 'approved'
        leave.approved_by = current_user_id
        leave.approved_at = datetime.utcnow()
        
        db.session.commit()

        return jsonify({
            'success': True,
            'message': 'Demande de congé approuvée',
            'status': leave.status
        }), 200

    except Exception as e:
        db.session.rollback()
        return jsonify({'success': False, 'message': f'Erreur approbation: {str(e)}'}), 500

# -------------------------
# PUT : Refuser une demande de congé
# -------------------------
@leaves_bp.route('/<int:leave_id>/reject', methods=['PUT'])
@admin_required
def reject_leave(leave_id):
    """Refuse une demande de congé (admin uniquement)"""
    current_user_id = get_jwt_identity()
    leave = Leave.query.get_or_404(leave_id)
    
    if leave.status != 'pending':
        return jsonify({'success': False, 'message': 'Cette demande a déjà été traitée'}), 400

    data = request.get_json()
    rejection_reason = data.get('rejection_reason', '') if data else ''

    try:
        leave.status = 'rejected'
        leave.approved_by = current_user_id
        leave.approved_at = datetime.utcnow()
        
        if rejection_reason:
            leave.reason += f"\n[REFUS] {rejection_reason}"
        
        db.session.commit()

        return jsonify({
            'success': True,
            'message': 'Demande de congé refusée',
            'status': leave.status
        }), 200

    except Exception as e:
        db.session.rollback()
        return jsonify({'success': False, 'message': f'Erreur refus: {str(e)}'}), 500

# -------------------------
# DELETE : Supprimer une demande de congé
# -------------------------
@leaves_bp.route('/<int:leave_id>', methods=['DELETE'])
@jwt_required()
def delete_leave(leave_id):
    """Supprime une demande de congé"""
    current_user_id = get_jwt_identity()
    current_user = User.query.get(current_user_id)
    
    leave = Leave.query.get_or_404(leave_id)
    
    # Vérifier les permissions
    if not (current_user.has_permission("all") or current_user.id == leave.user_id):
        return jsonify({'success': False, 'message': 'Non autorisé'}), 403
    
    # Ne peut supprimer que les demandes en attente
    if leave.status != 'pending' and not current_user.has_permission("all"):
        return jsonify({'success': False, 'message': 'Impossible de supprimer une demande déjà traitée'}), 400
    
    try:
        db.session.delete(leave)
        db.session.commit()
        return jsonify({'success': True, 'message': 'Demande supprimée avec succès'}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({'success': False, 'message': f'Erreur suppression: {str(e)}'}), 500

# -------------------------
# GET : Statistiques des congés
# -------------------------
@leaves_bp.route('/statistics', methods=['GET'])
@admin_required
def get_leave_statistics():
    """Récupère les statistiques des congés (admin uniquement)"""
    try:
        current_year = datetime.now().year
        
        # Total des demandes par statut
        total_pending = Leave.query.filter_by(status='pending').count()
        total_approved = Leave.query.filter(
            Leave.status == 'approved',
            db.extract('year', Leave.start_date) == current_year
        ).count()
        total_rejected = Leave.query.filter(
            Leave.status == 'rejected',
            db.extract('year', Leave.start_date) == current_year
        ).count()
        
        # Jours de congés utilisés par type
        leaves_by_type = db.session.query(
            Leave.leave_type,
            db.func.sum(Leave.duration)
        ).filter(
            Leave.status == 'approved',
            db.extract('year', Leave.start_date) == current_year
        ).group_by(Leave.leave_type).all()
        
        stats = {
            'pending_requests': total_pending,
            'approved_requests': total_approved,
            'rejected_requests': total_rejected,
            'days_by_type': {leave_type: int(total) for leave_type, total in leaves_by_type}
        }
        
        return jsonify({'success': True, 'data': stats}), 200
    except Exception as e:
        return jsonify({'success': False, 'message': f'Erreur: {str(e)}'}), 500