# models/attendance.py
from datetime import datetime, date
from extensions import db

class WorkLocation(db.Model):
    __tablename__ = 'work_location'
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    type = db.Column(db.String(20), default="bureau")  # "bureau" ou "chantier"
    address = db.Column(db.String(255))
    latitude = db.Column(db.Float, nullable=True)
    longitude = db.Column(db.Float, nullable=True)
    radius = db.Column(db.Integer, default=100)  # meters
    is_active = db.Column(db.Boolean, default=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    def __repr__(self):
        return f'<WorkLocation {self.name}>'

class Attendance(db.Model):
    __tablename__ = 'attendance'
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    date = db.Column(db.Date, default=date.today)
    check_in = db.Column(db.DateTime)
    check_out = db.Column(db.DateTime)
    check_in_location = db.Column(db.String(255))
    check_out_location = db.Column(db.String(255))
    check_in_lat = db.Column(db.Float)
    check_in_lng = db.Column(db.Float)
    check_out_lat = db.Column(db.Float)
    check_out_lng = db.Column(db.Float)
    work_location_id = db.Column(db.Integer, db.ForeignKey('work_location.id'))
    status = db.Column(db.String(20), default='present')  # present, absent, late
    notes = db.Column(db.Text)

    work_location = db.relationship('WorkLocation', backref='attendances')

    @property
    def total_hours(self):
        if self.check_in and self.check_out:
            return (self.check_out - self.check_in).total_seconds() / 3600
        return 0

    def __repr__(self):
        # user relationship is available via backref from User model
        return f'<Attendance {self.user_id} - {self.date}>'
