# models/inventory.py
from datetime import datetime
from extensions import db

class InventoryCategory(db.Model):
    __tablename__ = 'inventory_category'
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False, unique=True)
    description = db.Column(db.Text)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    items = db.relationship('InventoryItem', backref='category', lazy=True)

    def __repr__(self):
        return f'<InventoryCategory {self.name}>'

class InventoryItem(db.Model):
    __tablename__ = 'inventory_item'
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(200), nullable=False)
    description = db.Column(db.Text)
    reference = db.Column(db.String(100), unique=True)
    category_id = db.Column(db.Integer, db.ForeignKey('inventory_category.id'))
    quantity = db.Column(db.Integer, default=0)
    unit = db.Column(db.String(20), default='pièce')
    prix_achat = db.Column(db.Float)
    prix_vente = db.Column(db.Float)
    seuil_alerte = db.Column(db.Integer, default=10)
    fournisseur = db.Column(db.String(100))
    emplacement = db.Column(db.String(100))
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    image_path = db.Column(db.String(255))

    def is_low_stock(self):
        return self.quantity <= (self.seuil_alerte or 0)

    def __repr__(self):
        return f'<InventoryItem {self.name}>'

class Product(db.Model):
    __tablename__ = 'product'
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(120))
    description = db.Column(db.Text)
    quantity = db.Column(db.Float, default=0)
    alert_quantity = db.Column(db.Float, default=5)
    unit_price = db.Column(db.Float, nullable=False)
    supplier = db.Column(db.String(120))
    image_path = db.Column(db.String(255))
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    invoice_items = db.relationship('InvoiceItem', backref='product', lazy=True)
    proforma_items = db.relationship('ProformaItem', backref='product', lazy=True)

    def __repr__(self):
        return f'<Product {self.name}>'
