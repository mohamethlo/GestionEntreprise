# routes/inventory.py
import os
from flask import Blueprint, request, jsonify, current_app
from werkzeug.utils import secure_filename
from extensions import db
from models import InventoryItem, InventoryCategory

inventory_bp = Blueprint("inventory", __name__)

# 📌 Récupérer tous les items + catégories
@inventory_bp.route("/", methods=["GET"])
def get_inventory():
    items = InventoryItem.query.order_by(InventoryItem.name).all()
    categories = InventoryCategory.query.order_by(InventoryCategory.name).all()

    return jsonify({
        "items": [
            {
                "id": i.id,
                "name": i.name,
                "description": i.description,
                "reference": i.reference,
                "category_id": i.category_id,
                "quantity": i.quantity,
                "unit": i.unit,
                "prix_achat": i.prix_achat,
                "prix_vente": i.prix_vente,
                "seuil_alerte": i.seuil_alerte,
                "fournisseur": i.fournisseur,
                "emplacement": i.emplacement,
                "image_path": i.image_path
            } for i in items
        ],
        "categories": [
            {"id": c.id, "name": c.name} for c in categories
        ]
    })


# 📌 Ajouter un item
@inventory_bp.route("/", methods=["POST"])
def add_inventory_item():
    try:
        data = request.form.to_dict()
        image_path = None
        image_file = request.files.get("image")

        if image_file and image_file.filename:
            static_path = current_app.static_folder
            upload_folder = os.path.join(static_path, "uploads", "inventory")
            os.makedirs(upload_folder, exist_ok=True)

            filename = secure_filename(image_file.filename)
            file_path = os.path.join(upload_folder, filename)
            image_file.save(file_path)
            image_path = f"uploads/inventory/{filename}"

        item = InventoryItem(
            name=data.get("name"),
            description=data.get("description"),
            reference=data.get("reference"),
            category_id=int(data.get("category_id")) if data.get("category_id") else None,
            quantity=int(data.get("quantity", 0)),
            unit=data.get("unit", "pièce"),
            prix_achat=float(data.get("prix_achat")) if data.get("prix_achat") else None,
            prix_vente=float(data.get("prix_vente")) if data.get("prix_vente") else None,
            seuil_alerte=int(data.get("seuil_alerte", 10)),
            fournisseur=data.get("fournisseur"),
            emplacement=data.get("emplacement"),
            image_path=image_path
        )

        db.session.add(item)
        db.session.commit()

        return jsonify({"message": "Article ajouté avec succès", "id": item.id}), 201

    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 400


# 📌 Modifier un item
@inventory_bp.route("/<int:item_id>", methods=["PUT"])
def edit_inventory_item(item_id):
    item = InventoryItem.query.get_or_404(item_id)

    try:
        data = request.form.to_dict()

        image_file = request.files.get("image")
        if image_file and image_file.filename:
            # Suppression ancienne image si existe
            if item.image_path:
                old_path = os.path.join(current_app.static_folder, item.image_path)
                if os.path.exists(old_path):
                    os.remove(old_path)

            static_path = current_app.static_folder
            upload_folder = os.path.join(static_path, "uploads", "inventory")
            os.makedirs(upload_folder, exist_ok=True)

            filename = secure_filename(image_file.filename)
            file_path = os.path.join(upload_folder, filename)
            image_file.save(file_path)
            item.image_path = f"uploads/inventory/{filename}"

        # Mise à jour des champs
        item.name = data.get("name", item.name)
        item.reference = data.get("reference", item.reference)
        item.description = data.get("description", item.description)
        item.category_id = int(data.get("category_id")) if data.get("category_id") else item.category_id
        item.unit = data.get("unit", item.unit)
        item.prix_achat = float(data.get("prix_achat")) if data.get("prix_achat") else item.prix_achat
        item.prix_vente = float(data.get("prix_vente")) if data.get("prix_vente") else item.prix_vente
        item.seuil_alerte = int(data.get("seuil_alerte", item.seuil_alerte))
        item.fournisseur = data.get("fournisseur", item.fournisseur)
        item.emplacement = data.get("emplacement", item.emplacement)

        db.session.commit()
        return jsonify({"message": "Article mis à jour avec succès"})

    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 400


# 📌 Supprimer un item
@inventory_bp.route("/<int:item_id>", methods=["DELETE"])
def delete_inventory_item(item_id):
    item = InventoryItem.query.get_or_404(item_id)

    try:
        if item.image_path:
            image_path = os.path.join(current_app.static_folder, item.image_path)
            if os.path.exists(image_path):
                os.remove(image_path)

        db.session.delete(item)
        db.session.commit()
        return jsonify({"message": "Article supprimé avec succès"})

    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 500
