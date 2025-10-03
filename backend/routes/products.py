# routes/products.py
import os
from flask import Blueprint, request, jsonify, current_app
from werkzeug.utils import secure_filename
from extensions import db
from models import Product

products_bp = Blueprint("products", __name__)

# Récupérer tous les produits
@products_bp.route("/", methods=["GET"])
def get_products():
    products = Product.query.order_by(Product.description).all()
    return jsonify([{
        "id": p.id,
        "name": p.name,
        "description": p.description,
        "quantity": p.quantity,
        "alert_quantity": p.alert_quantity,
        "unit_price": p.unit_price,
        "supplier": p.supplier,
        "image_path": p.image_path,
        "created_at": p.created_at.isoformat(),
        "updated_at": p.updated_at.isoformat()
    } for p in products])


# Ajouter un produit
@products_bp.route("/", methods=["POST"])
def add_product():
    try:
        data = request.form.to_dict()
        name = data.get("name")
        description = data.get("description")
        quantity = float(data.get("qty", 0))
        unit_price = float(data.get("prix", 0))
        supplier = data.get("fournisseur")
        alert_quantity = float(data.get("alert_quantity", 5))

        # Gestion fichier image
        image_path = None
        img_file = request.files.get("img")
        if img_file and img_file.filename:
            static_path = current_app.static_folder
            upload_folder = os.path.join(static_path, "uploads", "products")
            os.makedirs(upload_folder, exist_ok=True)

            filename = secure_filename(img_file.filename)
            file_path = os.path.join(upload_folder, filename)
            img_file.save(file_path)
            image_path = f"uploads/products/{filename}"

        new_product = Product(
            name=name,
            description=description,
            quantity=quantity,
            unit_price=unit_price,
            supplier=supplier,
            alert_quantity=alert_quantity,
            image_path=image_path,
        )
        db.session.add(new_product)
        db.session.commit()

        return jsonify({"message": "Produit ajouté avec succès", "id": new_product.id}), 201

    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 400


# Modifier un produit
@products_bp.route("/<int:product_id>", methods=["PUT"])
def edit_product(product_id):
    product = Product.query.get_or_404(product_id)
    try:
        data = request.form.to_dict()
        product.name = data.get("name")
        product.description = data.get("description")
        product.quantity = float(data.get("qty", product.quantity))
        product.unit_price = float(data.get("prix", product.unit_price))
        product.supplier = data.get("fournisseur")
        product.alert_quantity = float(data.get("alert_quantity", product.alert_quantity))

        img_file = request.files.get("img")
        if img_file and img_file.filename:
            static_path = current_app.static_folder
            upload_folder = os.path.join(static_path, "uploads", "products")
            os.makedirs(upload_folder, exist_ok=True)

            filename = secure_filename(img_file.filename)
            file_path = os.path.join(upload_folder, filename)

            # Supprimer l'ancienne image si existe
            if product.image_path:
                old_path = os.path.join(static_path, product.image_path)
                if os.path.exists(old_path):
                    os.remove(old_path)

            img_file.save(file_path)
            product.image_path = f"uploads/products/{filename}"

        db.session.commit()
        return jsonify({"message": "Produit mis à jour avec succès"})

    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 400


# Supprimer un produit
@products_bp.route("/<int:product_id>", methods=["DELETE"])
def delete_product(product_id):
    product = Product.query.get_or_404(product_id)
    try:
        if product.image_path:
            image_path = os.path.join(current_app.static_folder, product.image_path)
            if os.path.exists(image_path):
                os.remove(image_path)

        db.session.delete(product)
        db.session.commit()
        return jsonify({"message": "Produit supprimé avec succès"})
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 400