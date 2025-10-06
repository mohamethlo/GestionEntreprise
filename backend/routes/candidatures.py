# routes/candidatures.py
from flask import Blueprint, request, jsonify, send_file
from flask_jwt_extended import jwt_required, get_jwt_identity
from functools import wraps
from models import Candidature, User
from extensions import db
from datetime import datetime
from werkzeug.utils import secure_filename
import os

candidatures_bp = Blueprint('candidatures_bp', __name__)

# Configuration du dossier de téléchargement
UPLOAD_FOLDER = 'uploads/cvs'
ALLOWED_EXTENSIONS = {'pdf', 'doc', 'docx'}

# Créer le dossier s'il n'existe pas
os.makedirs(UPLOAD_FOLDER, exist_ok=True)

# -------------------------
# Fonction utilitaire
# -------------------------
def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

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
# GET : Liste des candidatures
# -------------------------
@candidatures_bp.route('/', methods=['GET'])
@jwt_required()
def get_candidatures():
    """Récupère la liste de toutes les candidatures avec filtres par domaine et status"""
    try:
        # Filtre optionnel
        domaine = request.args.get('domaine')
        status = request.args.get('status')

        query = Candidature.query
        if domaine and domaine != 'Tous':
            query = query.filter_by(domaine=domaine)
        if status and status != 'Tous':
            query = query.filter_by(status=status)

        # Trier par date de dépôt ascendant (anciens en haut)
        candidatures_list = query.order_by(Candidature.date_depot.asc()).all()

        data = [{
            'id': c.id,
            'nom': c.nom,
            'poste': c.poste,
            'domaine': c.domaine,
            'email': c.email,
            'telephone': c.telephone,
            'fichier_nom': c.fichier_nom,
            'fichier_path': c.fichier_path,
            'date_depot': c.date_depot.isoformat(),
            'status': c.status,
            'user_id': c.user_id,
            'created_by': {
                'id': c.created_by_user.id,
                'prenom': c.created_by_user.prenom,
                'nom': c.created_by_user.nom
            } if c.created_by_user else None
        } for c in candidatures_list]

        return jsonify({'success': True, 'data': data}), 200

    except Exception as e:
        return jsonify({'success': False, 'message': f'Erreur: {str(e)}'}), 500


# -------------------------
# POST : Créer une candidature
# -------------------------
@candidatures_bp.route('/', methods=['POST'])
@jwt_required()
def create_candidature():
    """Crée une nouvelle candidature avec upload de CV"""
    current_user_id = get_jwt_identity()
    
    # Vérifier si un fichier est présent
    if 'fichier' not in request.files:
        return jsonify({'success': False, 'message': 'Aucun fichier CV fourni'}), 400
    
    file = request.files['fichier']
    
    if file.filename == '':
        return jsonify({'success': False, 'message': 'Aucun fichier sélectionné'}), 400
    
    if not allowed_file(file.filename):
        return jsonify({'success': False, 'message': 'Format de fichier non autorisé. Utilisez PDF, DOC ou DOCX'}), 400
    
    # Récupérer les données du formulaire
    nom = request.form.get('nom')
    poste = request.form.get('poste')
    domaine = request.form.get('domaine')
    email = request.form.get('email')
    telephone = request.form.get('telephone')
    
    if not all([nom, poste, domaine, email, telephone]):
        return jsonify({'success': False, 'message': 'Tous les champs obligatoires doivent être remplis'}), 400
    
    try:
        # Sécuriser le nom du fichier et le sauvegarder
        filename = secure_filename(file.filename)
        timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
        unique_filename = f"{timestamp}_{nom.replace(' ', '_')}_{filename}"
        file_path = os.path.join(UPLOAD_FOLDER, unique_filename)
        
        file.save(file_path)
        
        # Créer la candidature
        candidature = Candidature(
            nom=nom,
            poste=poste,
            domaine=domaine,
            email=email,
            telephone=telephone,
            fichier_nom=filename,
            fichier_path=file_path,
            user_id=current_user_id,
            status='nouveau',
            date_depot=datetime.utcnow()
        )
        
        db.session.add(candidature)
        db.session.commit()
        
        return jsonify({
            'success': True,
            'message': 'Candidature ajoutée avec succès',
            'candidature_id': candidature.id
        }), 201
    
    except Exception as e:
        db.session.rollback()
        # Supprimer le fichier si l'insertion échoue
        if os.path.exists(file_path):
            os.remove(file_path)
        return jsonify({'success': False, 'message': f'Erreur création: {str(e)}'}), 500

# -------------------------
# GET : Télécharger un CV
# -------------------------
@candidatures_bp.route('/<int:candidature_id>/download', methods=['GET'])
@jwt_required()
def download_cv(candidature_id):
    """Télécharge le CV d'une candidature"""
    try:
        candidature = Candidature.query.get_or_404(candidature_id)
        
        if not os.path.exists(candidature.fichier_path):
            return jsonify({'success': False, 'message': 'Fichier introuvable'}), 404
        
        return send_file(
            candidature.fichier_path,
            as_attachment=True,
            download_name=f"{candidature.nom}_CV.{candidature.fichier_nom.rsplit('.', 1)[1]}"
        )
    
    except Exception as e:
        return jsonify({'success': False, 'message': f'Erreur téléchargement: {str(e)}'}), 500

# -------------------------
# PUT : Mettre à jour une candidature
# -------------------------
@candidatures_bp.route('/<int:candidature_id>', methods=['PUT'])
@jwt_required()
def update_candidature(candidature_id):
    """Met à jour une candidature existante"""
    current_user_id = get_jwt_identity()
    current_user = User.query.get(current_user_id)
    
    candidature = Candidature.query.get_or_404(candidature_id)
    
    # Vérifier les permissions
    if not (current_user.has_permission("all") or current_user.id == candidature.user_id):
        return jsonify({'success': False, 'message': 'Non autorisé'}), 403
    
    data = request.get_json()
    if not data:
        return jsonify({'success': False, 'message': 'Aucune donnée fournie'}), 400
    
    try:
        if 'nom' in data:
            candidature.nom = data['nom']
        if 'poste' in data:
            candidature.poste = data['poste']
        if 'domaine' in data:
            candidature.domaine = data['domaine']
        if 'email' in data:
            candidature.email = data['email']
        if 'telephone' in data:
            candidature.telephone = data['telephone']
        if 'status' in data:
            candidature.status = data['status']
        
        db.session.commit()
        return jsonify({'success': True, 'message': 'Candidature mise à jour avec succès'}), 200
    
    except Exception as e:
        db.session.rollback()
        return jsonify({'success': False, 'message': f'Erreur mise à jour: {str(e)}'}), 500

# -------------------------
# PUT : Changer le statut d'une candidature
# -------------------------
@candidatures_bp.route('/<int:candidature_id>/status', methods=['PUT'])
@jwt_required()
def update_status(candidature_id):
    """Change le statut d'une candidature (nouveau, en_cours, accepte, refuse)"""
    current_user_id = get_jwt_identity()
    current_user = User.query.get(current_user_id)
    
    candidature = Candidature.query.get_or_404(candidature_id)
    data = request.get_json()
    
    if not data or 'status' not in data:
        return jsonify({'success': False, 'message': 'Statut non fourni'}), 400
    
    valid_statuses = ['nouveau', 'en_cours', 'accepte', 'refuse']
    new_status = data['status']
    
    if new_status not in valid_statuses:
        return jsonify({'success': False, 'message': 'Statut invalide'}), 400
    
    # Vérifier les permissions
    if not current_user.has_permission("all"):
        return jsonify({'success': False, 'message': 'Non autorisé'}), 403
    
    try:
        candidature.status = new_status
        db.session.commit()
        
        return jsonify({
            'success': True,
            'message': f'Statut changé en {new_status}',
            'status': candidature.status
        }), 200
    
    except Exception as e:
        db.session.rollback()
        return jsonify({'success': False, 'message': f'Erreur mise à jour: {str(e)}'}), 500

# -------------------------
# DELETE : Supprimer une candidature
# -------------------------
@candidatures_bp.route('/<int:candidature_id>', methods=['DELETE'])
@admin_required
def delete_candidature(candidature_id):
    """Supprime une candidature (admin uniquement)"""
    candidature = Candidature.query.get_or_404(candidature_id)
    
    try:
        # Supprimer le fichier physique
        if os.path.exists(candidature.fichier_path):
            os.remove(candidature.fichier_path)
        
        db.session.delete(candidature)
        db.session.commit()
        
        return jsonify({'success': True, 'message': 'Candidature supprimée avec succès'}), 200
    
    except Exception as e:
        db.session.rollback()
        return jsonify({'success': False, 'message': f'Erreur suppression: {str(e)}'}), 500

# -------------------------
# GET : Statistiques des candidatures
# -------------------------
@candidatures_bp.route('/stats', methods=['GET'])
@jwt_required()
def get_stats():
    """Récupère les statistiques des candidatures"""
    try:
        total = Candidature.query.count()
        par_domaine = db.session.query(
            Candidature.domaine, 
            db.func.count(Candidature.id)
        ).group_by(Candidature.domaine).all()
        
        par_status = db.session.query(
            Candidature.status,
            db.func.count(Candidature.id)
        ).group_by(Candidature.status).all()
        
        stats = {
            'total': total,
            'par_domaine': {domaine: count for domaine, count in par_domaine},
            'par_status': {status: count for status, count in par_status}
        }
        
        return jsonify({'success': True, 'data': stats}), 200
    
    except Exception as e:
        return jsonify({'success': False, 'message': f'Erreur: {str(e)}'}), 500

