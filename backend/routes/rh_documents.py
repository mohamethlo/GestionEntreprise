# routes/rh_documents.py
from flask import Blueprint, request, jsonify, send_file
from flask_jwt_extended import jwt_required, get_jwt_identity
from functools import wraps
from models import RhDocument, RhFolder, User
from extensions import db
from datetime import datetime
from werkzeug.utils import secure_filename
import os


rh_documents_bp = Blueprint('rh_documents_bp', __name__)

# Configuration upload
UPLOAD_FOLDER = 'uploads/rh_documents'
ALLOWED_EXTENSIONS = {'pdf', 'doc', 'docx', 'xls', 'xlsx', 'txt', 'png', 'jpg', 'jpeg'}
MAX_FILE_SIZE = 16 * 1024 * 1024  # 16 MB

# Créer le dossier d'upload s'il n'existe pas
os.makedirs(UPLOAD_FOLDER, exist_ok=True)

# -------------------------
# Décorateur admin_required
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

def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

# -------------------------
# FOLDERS - GET : Liste des dossiers
# -------------------------
@rh_documents_bp.route('/folders', methods=['GET'])
@jwt_required()
def get_folders():
    """Récupère la liste de tous les dossiers"""
    try:
        folders = RhFolder.query.all()
        data = [folder.to_dict() for folder in folders]
        return jsonify({'success': True, 'data': data}), 200
    except Exception as e:
        return jsonify({'success': False, 'message': f'Erreur: {str(e)}'}), 500

# -------------------------
# FOLDERS - POST : Créer un dossier
# -------------------------
@rh_documents_bp.route('/folders', methods=['POST'])
@admin_required
def create_folder():
    """Crée un nouveau dossier"""
    current_user_id = get_jwt_identity()
    data = request.get_json()
    
    if not data or not data.get('name'):
        return jsonify({'success': False, 'message': 'Le nom du dossier est requis'}), 400
    
    try:
        folder = RhFolder(
            name=data['name'],
            description=data.get('description', ''),
            color=data.get('color', 'bg-gray-100 text-gray-600'),
            icon=data.get('icon', 'Folder'),
            created_by=current_user_id,
            created_at=datetime.utcnow()
        )
        
        db.session.add(folder)
        db.session.commit()
        
        return jsonify({
            'success': True,
            'message': 'Dossier créé avec succès',
            'folder_id': folder.id
        }), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({'success': False, 'message': f'Erreur création: {str(e)}'}), 500

# -------------------------
# FOLDERS - PUT : Mettre à jour un dossier
# -------------------------
@rh_documents_bp.route('/folders/<int:folder_id>', methods=['PUT'])
@admin_required
def update_folder(folder_id):
    """Met à jour un dossier"""
    folder = RhFolder.query.get_or_404(folder_id)
    data = request.get_json()
    
    if not data:
        return jsonify({'success': False, 'message': 'Aucune donnée fournie'}), 400
    
    try:
        if 'name' in data:
            folder.name = data['name']
        if 'description' in data:
            folder.description = data['description']
        if 'color' in data:
            folder.color = data['color']
        if 'icon' in data:
            folder.icon = data['icon']
        
        db.session.commit()
        return jsonify({'success': True, 'message': 'Dossier mis à jour'}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({'success': False, 'message': f'Erreur: {str(e)}'}), 500

# -------------------------
# FOLDERS - DELETE : Supprimer un dossier
# -------------------------
@rh_documents_bp.route('/folders/<int:folder_id>', methods=['DELETE'])
@admin_required
def delete_folder(folder_id):
    """Supprime un dossier (si vide)"""
    folder = RhFolder.query.get_or_404(folder_id)
    
    if len(folder.documents) > 0:
        return jsonify({
            'success': False,
            'message': 'Impossible de supprimer un dossier contenant des documents'
        }), 400
    
    try:
        db.session.delete(folder)
        db.session.commit()
        return jsonify({'success': True, 'message': 'Dossier supprimé'}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({'success': False, 'message': f'Erreur: {str(e)}'}), 500

# -------------------------
# DOCUMENTS - GET : Liste des documents
# -------------------------
@rh_documents_bp.route('/documents', methods=['GET'])
@jwt_required()
def get_documents():
    """Récupère la liste de tous les documents"""
    try:
        folder_id = request.args.get('folder_id', type=int)
        is_archived = request.args.get('is_archived', 'false').lower() == 'true'
        
        query = RhDocument.query
        
        if folder_id:
            query = query.filter_by(folder_id=folder_id)
        
        query = query.filter_by(is_archived=is_archived)
        documents = query.order_by(RhDocument.created_at.desc()).all()
        
        data = [doc.to_dict() for doc in documents]
        return jsonify({'success': True, 'data': data}), 200
    except Exception as e:
        return jsonify({'success': False, 'message': f'Erreur: {str(e)}'}), 500

# -------------------------
# DOCUMENTS - GET : Documents récents
# -------------------------
@rh_documents_bp.route('/documents/recent', methods=['GET'])
@jwt_required()
def get_recent_documents():
    """Récupère les documents les plus récents"""
    try:
        limit = request.args.get('limit', 5, type=int)
        documents = RhDocument.query.filter_by(is_archived=False).order_by(
            RhDocument.created_at.desc()
        ).limit(limit).all()
        
        data = [doc.to_dict() for doc in documents]
        return jsonify({'success': True, 'data': data}), 200
    except Exception as e:
        return jsonify({'success': False, 'message': f'Erreur: {str(e)}'}), 500

# -------------------------
# DOCUMENTS - POST : Upload un document
# -------------------------
@rh_documents_bp.route('/documents/upload', methods=['POST'])
@jwt_required()
def upload_document():
    """Upload un nouveau document"""
    current_user_id = get_jwt_identity()
    
    if 'file' not in request.files:
        return jsonify({'success': False, 'message': 'Aucun fichier fourni'}), 400
    
    file = request.files['file']
    
    if file.filename == '':
        return jsonify({'success': False, 'message': 'Nom de fichier vide'}), 400
    
    if not allowed_file(file.filename):
        return jsonify({
            'success': False,
            'message': 'Type de fichier non autorisé'
        }), 400
    
    try:
        # Sécuriser le nom de fichier
        filename = secure_filename(file.filename)
        timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
        unique_filename = f"{timestamp}_{filename}"
        file_path = os.path.join(UPLOAD_FOLDER, unique_filename)
        
        # Sauvegarder le fichier
        file.save(file_path)
        file_size = os.path.getsize(file_path)
        file_type = filename.rsplit('.', 1)[1].upper()
        
        # Créer l'entrée en base de données
        document = RhDocument(
            name=request.form.get('name', filename),
            file_path=file_path,
            file_type=file_type,
            file_size=file_size,
            folder_id=request.form.get('folder_id', type=int),
            uploaded_by=current_user_id,
            description=request.form.get('description', ''),
            created_at=datetime.utcnow()
        )
        
        db.session.add(document)
        db.session.commit()
        
        return jsonify({
            'success': True,
            'message': 'Document uploadé avec succès',
            'document': document.to_dict()
        }), 201
    except Exception as e:
        db.session.rollback()
        # Supprimer le fichier si l'insertion en base a échoué
        if os.path.exists(file_path):
            os.remove(file_path)
        return jsonify({'success': False, 'message': f'Erreur upload: {str(e)}'}), 500

# -------------------------
# DOCUMENTS - GET : Télécharger un document
# -------------------------
@rh_documents_bp.route('/documents/<int:document_id>/download', methods=['GET'])
@jwt_required()
def download_document(document_id):
    """Télécharge un document"""
    try:
        document = RhDocument.query.get_or_404(document_id)
        
        # Incrémenter le compteur de téléchargements
        document.downloads += 1
        db.session.commit()
        
        return send_file(
            document.file_path,
            as_attachment=True,
            download_name=document.name
        )
    except Exception as e:
        return jsonify({'success': False, 'message': f'Erreur: {str(e)}'}), 500

# -------------------------
# DOCUMENTS - PUT : Mettre à jour un document
# -------------------------
@rh_documents_bp.route('/documents/<int:document_id>', methods=['PUT'])
@jwt_required()
def update_document(document_id):
    """Met à jour les métadonnées d'un document"""
    current_user_id = get_jwt_identity()
    current_user = User.query.get(current_user_id)
    
    document = RhDocument.query.get_or_404(document_id)
    
    # Vérifier les permissions
    if not (current_user.has_permission("all") or current_user.id == document.uploaded_by):
        return jsonify({'success': False, 'message': 'Non autorisé'}), 403
    
    data = request.get_json()
    if not data:
        return jsonify({'success': False, 'message': 'Aucune donnée fournie'}), 400
    
    try:
        if 'name' in data:
            document.name = data['name']
        if 'description' in data:
            document.description = data['description']
        if 'folder_id' in data:
            document.folder_id = data['folder_id']
        if 'is_archived' in data:
            document.is_archived = data['is_archived']
        
        document.updated_at = datetime.utcnow()
        db.session.commit()
        
        return jsonify({'success': True, 'message': 'Document mis à jour'}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({'success': False, 'message': f'Erreur: {str(e)}'}), 500

# -------------------------
# DOCUMENTS - DELETE : Supprimer un document
# -------------------------
@rh_documents_bp.route('/documents/<int:document_id>', methods=['DELETE'])
@admin_required
def delete_document(document_id):
    """Supprime un document"""
    document = RhDocument.query.get_or_404(document_id)
    
    try:
        # Supprimer le fichier physique
        if os.path.exists(document.file_path):
            os.remove(document.file_path)
        
        # Supprimer l'entrée en base
        db.session.delete(document)
        db.session.commit()
        
        return jsonify({'success': True, 'message': 'Document supprimé'}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({'success': False, 'message': f'Erreur: {str(e)}'}), 500

# -------------------------
# STATISTICS - GET : Statistiques
# -------------------------
@rh_documents_bp.route('/statistics', methods=['GET'])
@jwt_required()
def get_statistics():
    """Récupère les statistiques des documents"""
    try:
        total_documents = RhDocument.query.filter_by(is_archived=False).count()
        total_size = db.session.query(db.func.sum(RhDocument.file_size)).filter_by(
            is_archived=False
        ).scalar() or 0
        
        # Documents ce mois
        from datetime import timedelta
        current_month = datetime.now().replace(day=1, hour=0, minute=0, second=0)
        documents_this_month = RhDocument.query.filter(
            RhDocument.created_at >= current_month
        ).count()
        
        # Formater la taille totale
        size_gb = total_size / (1024 ** 3)
        
        stats = {
            'total_documents': total_documents,
            'total_size': total_size,
            'total_size_formatted': f"{size_gb:.2f} GB",
            'documents_this_month': documents_this_month
        }
        
        return jsonify({'success': True, 'data': stats}), 200
    except Exception as e:
        return jsonify({'success': False, 'message': f'Erreur: {str(e)}'}), 500