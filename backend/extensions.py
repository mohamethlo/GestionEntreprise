from flask_sqlalchemy import SQLAlchemy
from sqlalchemy.orm import DeclarativeBase
from flask_mail import Mail

class Base(DeclarativeBase):
    pass

# Initialise l'extension SQLAlchemy sans la lier immédiatement à l'application
db = SQLAlchemy(model_class=Base)

# LoginManager est supprimé.
# La gestion des utilisateurs sera effectuée par Flask-JWT-Extended.

# Initialise l'extension Mail
mail = Mail()
