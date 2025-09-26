# models/calendar_event.py
from datetime import datetime
from extensions import db

class CalendarEvent(db.Model):
    __tablename__ = 'calendar_event'
    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(255), nullable=False)
    start = db.Column(db.String(50), nullable=False)  # iso string or date
    allDay = db.Column(db.Boolean, default=False)
    notified = db.Column(db.Boolean, default=False)
    commercial_id = db.Column(db.Integer, db.ForeignKey('user.id'))
    commercial = db.relationship('User', foreign_keys=[commercial_id])

    def __repr__(self):
        return f'<CalendarEvent {self.title}>'
