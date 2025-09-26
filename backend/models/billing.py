# models/billing.py
from datetime import datetime
from extensions import db

class BillingClient(db.Model):
    __tablename__ = 'billing_client'
    id = db.Column(db.Integer, primary_key=True)
    company_name = db.Column(db.String(120))
    contact_name = db.Column(db.String(80))
    email = db.Column(db.String(120))
    phone = db.Column(db.String(20))
    address = db.Column(db.Text)
    tax_id = db.Column(db.String(50))
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    invoices = db.relationship('Invoice', backref='billing_client', lazy=True)
    proformas = db.relationship('Proforma', backref='billing_client', lazy=True)

class Invoice(db.Model):
    __tablename__ = 'invoice'
    id = db.Column(db.Integer, primary_key=True)
    invoice_number = db.Column(db.String(50), unique=True, nullable=True)
    billing_client_id = db.Column(db.Integer, db.ForeignKey('billing_client.id'), nullable=True)
    date = db.Column(db.Date, default=datetime.utcnow)
    due_date = db.Column(db.Date)
    tax_rate = db.Column(db.Float, default=0.18)
    status = db.Column(db.String(20), default='draft')  # draft, sent, paid, cancelled
    notes = db.Column(db.Text)
    domaine = db.Column(db.String(50), nullable=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    discount_percent = db.Column(db.Float, default=0.0)
    discount_amount = db.Column(db.Float, default=0.0)

    items = db.relationship('InvoiceItem', backref='invoice', lazy=True, cascade="all, delete-orphan")

    def total_amount(self):
        return sum(item.subtotal() for item in self.items or [])

    def tax_amount(self):
        return self.total_amount() * (self.tax_rate or 0)

    def total_before_discount(self):
        return self.total_amount() * (1 + (self.tax_rate or 0))

    def discount_value(self):
        if self.discount_percent and self.discount_percent > 0:
            return self.total_before_discount() * (self.discount_percent / 100)
        return self.discount_amount or 0

    def total_with_tax_and_discount(self):
        return self.total_before_discount() - self.discount_value()

class InvoiceItem(db.Model):
    __tablename__ = 'invoice_item'
    id = db.Column(db.Integer, primary_key=True)
    invoice_id = db.Column(db.Integer, db.ForeignKey('invoice.id', ondelete='CASCADE'), nullable=False)
    description = db.Column(db.String(200), nullable=True)
    quantity = db.Column(db.Float, default=1)
    unit_price = db.Column(db.Float, nullable=False)
    tax_rate = db.Column(db.Float)
    product_id = db.Column(db.Integer, db.ForeignKey('product.id'))
    discount_percent = db.Column(db.Float, default=0.0)

    def subtotal(self):
        return (self.quantity or 0) * (self.unit_price or 0)

    def subtotal_after_discount(self):
        subtotal = self.subtotal()
        return subtotal * (1 - (self.discount_percent or 0)/100)

class Proforma(db.Model):
    __tablename__ = 'proforma'
    id = db.Column(db.Integer, primary_key=True)
    proforma_number = db.Column(db.String(50), unique=True)
    billing_client_id = db.Column(db.Integer, db.ForeignKey('billing_client.id'), nullable=False)
    date = db.Column(db.Date, default=datetime.utcnow)
    valid_until = db.Column(db.Date)
    tax_rate = db.Column(db.Float, default=0.18)
    status = db.Column(db.String(20), default='draft')
    notes = db.Column(db.Text)
    domaine = db.Column(db.String(50), nullable=True)
    converted_to_invoice = db.Column(db.Boolean, default=False)
    invoice_id = db.Column(db.Integer, db.ForeignKey('invoice.id'))
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    discount_percent = db.Column(db.Float, default=0.0)
    discount_amount = db.Column(db.Float, default=0.0)

    items = db.relationship('ProformaItem', backref='proforma', lazy=True, cascade="all, delete-orphan")

    def total_amount(self):
        return sum(item.subtotal() for item in self.items or [])

    def total_before_discount(self):
        return self.total_amount() * (1 + (self.tax_rate or 0))

    def discount_value(self):
        if self.discount_percent and self.discount_percent > 0:
            return self.total_before_discount() * (self.discount_percent / 100)
        return self.discount_amount or 0

    def total_with_tax_and_discount(self):
        return self.total_before_discount() - self.discount_value()

class ProformaItem(db.Model):
    __tablename__ = 'proforma_item'
    id = db.Column(db.Integer, primary_key=True)
    proforma_id = db.Column(db.Integer, db.ForeignKey('proforma.id'))
    description = db.Column(db.String(200))
    quantity = db.Column(db.Float, default=1)
    unit_price = db.Column(db.Float, nullable=False)
    tax_rate = db.Column(db.Float)
    product_id = db.Column(db.Integer, db.ForeignKey('product.id'))
    discount_percent = db.Column(db.Float, default=0.0)

    def subtotal(self):
        return (self.quantity or 0) * (self.unit_price or 0)

    def subtotal_after_discount(self):
        subtotal = self.subtotal()
        return subtotal * (1 - (self.discount_percent or 0)/100)
