
# Database ka Base aur engine import karo
from app.db.base import Base
from app.db.database import engine
from app.models.document import Document
from app.models.document_chunk import DocumentChunk

# User model import karna zaroori hai,
# taaki SQLAlchemy uski table definition register kare.
from app.models.user import User


def create_tables():
    # Defined models ki missing tables database mein create hongi.
    Base.metadata.create_all(bind=engine)
