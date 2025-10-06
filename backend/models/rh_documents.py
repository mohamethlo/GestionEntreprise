# models/rh_documents.py
from extensions import db
from datetime import datetime

class RhFolder(db.Model):
    __tablename__ = 'rh_folders'
    
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(255), nullable=False)
    description = db.Column(db.Text, nullable=True)
    color = db.Column(db.String(50), default='bg-gray-100 text-gray-600')
    icon = db.Column(db.String(50), default='Folder')
    created_by = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    def __repr__(self):
        return f'<RhFolder {self.id} - {self.name}>'
    
    def to_dict(self):
        from models.user import User
        creator = User.query.get(self.created_by)
        return {
            'id': self.id,
            'name': self.name,
            'description': self.description,
            'color': self.color,
            'icon': self.icon,
            'document_count': RhDocument.query.filter_by(folder_id=self.id).count(),
            'created_by': self.created_by,
            'creator_name': f"{creator.prenom} {creator.nom}" if creator else "Inconnu",
            'created_at': self.created_at.isoformat()
        }


class RhDocument(db.Model):
    __tablename__ = 'rh_documents'
    
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(255), nullable=False)
    file_path = db.Column(db.String(500), nullable=False)
    file_type = db.Column(db.String(50), nullable=False)
    file_size = db.Column(db.Integer, nullable=False)
    folder_id = db.Column(db.Integer, db.ForeignKey('rh_folders.id'), nullable=True)
    uploaded_by = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    description = db.Column(db.Text, nullable=True)
    downloads = db.Column(db.Integer, default=0)
    is_archived = db.Column(db.Boolean, default=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    folder = db.relationship('RhFolder', backref='documents', lazy=True)
    
    def __repr__(self):
        return f'<RhDocument {self.id} - {self.name}>'
    
    @property
    def uploader(self):
        from models.user import User
        return User.query.get(self.uploaded_by)
    
    def to_dict(self):
        from models.user import User
        uploader = User.query.get(self.uploaded_by)
        folder = RhFolder.query.get(self.folder_id) if self.folder_id else None
        
        return {
            'id': self.id,
            'name': self.name,
            'file_path': self.file_path,
            'file_type': self.file_type,
            'file_size': self.file_size,
            'file_size_formatted': self.format_file_size(),
            'folder_id': self.folder_id,
            'folder_name': folder.name if folder else None,
            'uploaded_by': self.uploaded_by,
            'uploader_name': f"{uploader.prenom} {uploader.nom}" if uploader else "Inconnu",
            'description': self.description,
            'downloads': self.downloads,
            'is_archived': self.is_archived,
            'created_at': self.created_at.isoformat(),
            'updated_at': self.updated_at.isoformat()
        }
    
    def format_file_size(self):
        size = self.file_size
        for unit in ['B', 'KB', 'MB', 'GB']:
            if size < 1024.0:
                return f"{size:.1f} {unit}"
            size /= 1024.0
        return f"{size:.1f} TB"