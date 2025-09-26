# models/__init__.py
# central import pour faciliter db.create_all() depuis app.py

# Import ordre logique pour éviter références avant définition
from .user import User, Role
from .attendance import Attendance, WorkLocation
from .client import Client, ClientImportHistory
from .intervention import Intervention, InterventionMaterial, autres_intervenants_assoc
from .inventory import InventoryCategory, InventoryItem, Product
from .expense import Expense, SalaryAdvance
from .billing import BillingClient, Invoice, InvoiceItem, Proforma, ProformaItem
from .message import Message, Notification
from .calendar_event import CalendarEvent
from .misc import Approvisionnement, Installation, QuoteRequest, Devis, Reminder
