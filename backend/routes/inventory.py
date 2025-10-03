# routes/inventory.py
import os
from flask import Blueprint, request, jsonify, current_app
from flask_jwt_extended import jwt_required, get_jwt_identity
from werkzeug.utils import secure_filename
from functools import wraps
from models import InventoryItem, InventoryCategory, User
from extensions import db
from datetime import datetime

# Création du blueprint
inventory_bp = Blueprint('inventory_bp', __name__)

# Configuration upload
ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg', 'gif', 'webp'}
UPLOAD_FOLDER = 'uploads/inventory'

def allowed_file(filename):
    """Vérifie si l'extension du fichier est autorisée"""
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

def inventory_permission_required(f):
    """Décorateur pour vérifier la permission 'inventory'"""
    @wraps(f)
    @jwt_required()
    def decorated_function(*args, **kwargs):
        current_user = User.query.get(get_jwt_identity())
        if not current_user or not current_user.has_permission("inventory"):
            return jsonify({'success': False, 'message': 'Permission refusée'}), 403
        return f(*args, **kwargs)
    return decorated_function

# -------------------------
# GET : Liste des articles d'inventaire
# -------------------------
@inventory_bp.route('/', methods=['GET'])
@inventory_permission_required
def get_inventory_items():
    """Récupère la liste de tous les articles d'inventaire"""
    try:
        items = InventoryItem.query.order_by(InventoryItem.name).all()
        
        data = [{
            'id': item.id,
            'name': item.name,
            'description': item.description,
            'reference': item.reference,
            'category_id': item.category_id,
            'category_name': item.category.name if item.category else None,
            'quantity': item.quantity,
            'unit': item.unit,
            'prix_achat': item.prix_achat,
            'prix_vente': item.prix_vente,
            'seuil_alerte': item.seuil_alerte,
            'fournisseur': item.fournisseur,
            'emplacement': item.emplacement,
            'image_path': item.image_path,
            'is_low_stock': item.quantity <= item.seuil_alerte,
            'created_at': item.created_at.isoformat() if hasattr(item, 'created_at') else None
        } for item in items]
        
        return jsonify({'success': True, 'data': data}), 200
    except Exception as e:
        return jsonify({'success': False, 'message': f'Erreur: {str(e)}'}), 500

# -------------------------
# GET : Liste des catégories
# -------------------------
@inventory_bp.route('/categories', methods=['GET'])
@inventory_permission_required
def get_categories():
    """Récupère la liste de toutes les catégories"""
    try:
        categories = InventoryCategory.query.order_by(InventoryCategory.name).all()
        
        data = [{
            'id': cat.id,
            'name': cat.name,
            'description': cat.description if hasattr(cat, 'description') else None
        } for cat in categories]
        
        return jsonify({'success': True, 'data': data}), 200
    except Exception as e:
        return jsonify({'success': False, 'message': f'Erreur: {str(e)}'}), 500

# -------------------------
# POST : Créer un article
# -------------------------
@inventory_bp.route('/', methods=['POST'])
@inventory_permission_required
def create_inventory_item():
    """Crée un nouvel article d'inventaire avec upload d'image optionnel"""
    try:
        # Gestion de l'upload d'image
        image_path = None
        if 'image' in request.files:
            image_file = request.files['image']
            if image_file and image_file.filename and allowed_file(image_file.filename):
                # Création du dossier d'upload s'il n'existe pas
                upload_dir = os.path.join(current_app.config.get('UPLOAD_FOLDER', 'uploads'), 'inventory')
                os.makedirs(upload_dir, exist_ok=True)
                
                # Sécurisation du nom de fichier
                filename = secure_filename(image_file.filename)
                timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
                filename = f"{timestamp}_{filename}"
                
                file_path = os.path.join(upload_dir, filename)
                image_file.save(file_path)
                image_path = f"uploads/inventory/{filename}"
        
        # Récupération des données du formulaire
        item = InventoryItem(
            name=request.form.get('name'),
            description=request.form.get('description', ''),
            reference=request.form.get('reference', ''),
            category_id=int(request.form.get('category_id')) if request.form.get('category_id') else None,
            quantity=int(request.form.get('quantity', 0)),
            unit=request.form.get('unit', 'pièce'),
            prix_achat=float(request.form.get('prix_achat')) if request.form.get('prix_achat') else None,
            prix_vente=float(request.form.get('prix_vente')) if request.form.get('prix_vente') else None,
            seuil_alerte=int(request.form.get('seuil_alerte', 10)),
            fournisseur=request.form.get('fournisseur', ''),
            emplacement=request.form.get('emplacement', ''),
            image_path=image_path
        )
        
        db.session.add(item)
        db.session.commit()
        
        return jsonify({
            'success': True,
            'message': 'Article créé avec succès',
            'item_id': item.id
        }), 201
        
    except ValueError as e:
        db.session.rollback()
        return jsonify({'success': False, 'message': f'Erreur de format: {str(e)}'}), 400
    except Exception as e:
        db.session.rollback()
        current_app.logger.error(f"Erreur création article: {str(e)}")
        return jsonify({'success': False, 'message': f'Erreur création: {str(e)}'}), 500

# -------------------------
# PUT : Mettre à jour un article
# -------------------------
@inventory_bp.route('/<int:item_id>', methods=['PUT'])
@inventory_permission_required
def update_inventory_item(item_id):
    """Met à jour un article d'inventaire existant"""
    item = InventoryItem.query.get_or_404(item_id)
    
    try:
        # Gestion de l'upload d'image
        if 'image' in request.files:
            image_file = request.files['image']
            if image_file and image_file.filename and allowed_file(image_file.filename):
                # Suppression de l'ancienne image
                if item.image_path:
                    old_image_path = os.path.join(current_app.config.get('UPLOAD_FOLDER', 'uploads'), 
                                                   item.image_path.replace('uploads/', ''))
                    if os.path.exists(old_image_path):
                        os.remove(old_image_path)
                
                # Sauvegarde de la nouvelle image
                upload_dir = os.path.join(current_app.config.get('UPLOAD_FOLDER', 'uploads'), 'inventory')
                os.makedirs(upload_dir, exist_ok=True)
                
                filename = secure_filename(image_file.filename)
                timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
                filename = f"{timestamp}_{filename}"
                
                file_path = os.path.join(upload_dir, filename)
                image_file.save(file_path)
                item.image_path = f"uploads/inventory/{filename}"
        
        # Mise à jour des champs
        if 'name' in request.form:
            item.name = request.form['name']
        if 'description' in request.form:
            item.description = request.form['description']
        if 'reference' in request.form:
            item.reference = request.form['reference']
        if 'category_id' in request.form:
            item.category_id = int(request.form['category_id']) if request.form['category_id'] else None
        if 'unit' in request.form:
            item.unit = request.form['unit']
        if 'prix_achat' in request.form:
            item.prix_achat = float(request.form['prix_achat']) if request.form['prix_achat'] else None
        if 'prix_vente' in request.form:
            item.prix_vente = float(request.form['prix_vente']) if request.form['prix_vente'] else None
        if 'seuil_alerte' in request.form:
            item.seuil_alerte = int(request.form['seuil_alerte'])
        if 'fournisseur' in request.form:
            item.fournisseur = request.form['fournisseur']
        if 'emplacement' in request.form:
            item.emplacement = request.form['emplacement']
        
        db.session.commit()
        
        return jsonify({
            'success': True,
            'message': 'Article mis à jour avec succès'
        }), 200
        
    except ValueError as e:
        db.session.rollback()
        return jsonify({'success': False, 'message': f'Erreur de format: {str(e)}'}), 400
    except Exception as e:
        db.session.rollback()
        current_app.logger.error(f"Erreur mise à jour article: {str(e)}")
        return jsonify({'success': False, 'message': f'Erreur mise à jour: {str(e)}'}), 500

# -------------------------
# DELETE : Supprimer un article
# -------------------------
@inventory_bp.route('/<int:item_id>', methods=['DELETE'])
@inventory_permission_required
def delete_inventory_item(item_id):
    """Supprime un article d'inventaire"""
    item = InventoryItem.query.get_or_404(item_id)
    
    try:
        # Suppression de l'image associée
        if item.image_path:
            image_path = os.path.join(current_app.config.get('UPLOAD_FOLDER', 'uploads'), 
                                     item.image_path.replace('uploads/', ''))
            if os.path.exists(image_path):
                os.remove(image_path)
        
        db.session.delete(item)
        db.session.commit()
        
        return jsonify({
            'success': True,
            'message': 'Article supprimé avec succès'
        }), 200
        
    except Exception as e:
        db.session.rollback()
        current_app.logger.error(f"Erreur suppression article: {str(e)}")
        return jsonify({'success': False, 'message': f'Erreur suppression: {str(e)}'}), 500

# -------------------------
# PATCH : Mettre à jour la quantité
# -------------------------
@inventory_bp.route('/<int:item_id>/quantity', methods=['PATCH'])
@inventory_permission_required
def update_inventory_quantity(item_id):
    """Met à jour la quantité d'un article"""
    item = InventoryItem.query.get_or_404(item_id)
    data = request.get_json()
    
    if not data or 'quantity' not in data:
        return jsonify({'success': False, 'message': 'Quantité non fournie'}), 400
    
    try:
        new_quantity = int(data['quantity'])
        if new_quantity < 0:
            return jsonify({'success': False, 'message': 'Quantité invalide'}), 400
        
        old_quantity = item.quantity
        item.quantity = new_quantity
        db.session.commit()
        
        # Log de l'opération
        current_user = User.query.get(get_jwt_identity())
        current_app.logger.info(
            f"Stock modifié - Article: {item.name}, "
            f"Ancienne qté: {old_quantity}, Nouvelle qté: {new_quantity}, "
            f"Par: {current_user.prenom} {current_user.nom}"
        )
        
        return jsonify({
            'success': True,
            'message': 'Quantité mise à jour',
            'new_quantity': new_quantity,
            'is_low_stock': new_quantity <= item.seuil_alerte
        }), 200
        
    except ValueError:
        return jsonify({'success': False, 'message': 'Format de quantité invalide'}), 400
    except Exception as e:
        db.session.rollback()
        return jsonify({'success': False, 'message': f'Erreur: {str(e)}'}), 500

# -------------------------
# POST : Sortie de stock
# -------------------------
@inventory_bp.route('/<int:item_id>/outbound', methods=['POST'])
@inventory_permission_required
def inventory_outbound(item_id):
    """Enregistre une sortie de stock"""
    item = InventoryItem.query.get_or_404(item_id)
    data = request.get_json()
    
    if not data or 'quantity' not in data:
        return jsonify({'success': False, 'message': 'Quantité non fournie'}), 400
    
    try:
        quantity = int(data['quantity'])
        reason = data.get('reason', 'Sortie de stock')
        
        if quantity <= 0:
            return jsonify({'success': False, 'message': 'Quantité invalide'}), 400
        
        if item.quantity < quantity:
            return jsonify({'success': False, 'message': 'Stock insuffisant'}), 400
        
        # Mise à jour du stock
        old_quantity = item.quantity
        item.quantity -= quantity
        db.session.commit()
        
        # Log de l'opération
        current_user = User.query.get(get_jwt_identity())
        current_app.logger.info(
            f"Sortie de stock - Article: {item.name}, "
            f"Quantité: {quantity}, Raison: {reason}, "
            f"Nouveau stock: {item.quantity}, "
            f"Par: {current_user.prenom} {current_user.nom}"
        )
        
        return jsonify({
            'success': True,
            'message': 'Sortie de stock enregistrée',
            'new_quantity': item.quantity,
            'is_low_stock': item.quantity <= item.seuil_alerte
        }), 200
        
    except ValueError:
        return jsonify({'success': False, 'message': 'Format de quantité invalide'}), 400
    except Exception as e:
        db.session.rollback()
        current_app.logger.error(f"Erreur sortie de stock: {str(e)}")
        return jsonify({'success': False, 'message': f'Erreur: {str(e)}'}), 500

# -------------------------
# GET : Obtenir la quantité d'un article
# -------------------------
@inventory_bp.route('/<int:item_id>/quantity', methods=['GET'])
@inventory_permission_required
def get_inventory_quantity(item_id):
    """Récupère la quantité actuelle d'un article"""
    item = InventoryItem.query.get_or_404(item_id)
    
    return jsonify({
        'success': True,
        'quantity': item.quantity,
        'item_name': item.name,
        'seuil_alerte': item.seuil_alerte,
        'is_low_stock': item.quantity <= item.seuil_alerte
    }), 200

# -------------------------
# GET : Articles en rupture ou stock bas
# -------------------------
@inventory_bp.route('/low-stock', methods=['GET'])
@inventory_permission_required
def get_low_stock_items():
    """Récupère les articles en stock bas ou en rupture"""
    try:
        items = InventoryItem.query.filter(
            InventoryItem.quantity <= InventoryItem.seuil_alerte
        ).order_by(InventoryItem.quantity).all()
        
        data = [{
            'id': item.id,
            'name': item.name,
            'reference': item.reference,
            'quantity': item.quantity,
            'seuil_alerte': item.seuil_alerte,
            'unit': item.unit,
            'fournisseur': item.fournisseur
        } for item in items]
        
        return jsonify({'success': True, 'data': data, 'count': len(data)}), 200
    except Exception as e:
        return jsonify({'success': False, 'message': f'Erreur: {str(e)}'}), 500