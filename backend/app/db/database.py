from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from app.core.config import settings


#Engine - manages database connection with postgresql
engine = create_engine(
    settings.DATABASE_URL, #engine needs postgres location and credentials
    pool_pre_ping=True #this tells that before using pooled connection SQLAlchemy  checks  is the Connection alive or not

)

#sessionmaker - makes a session for database operations
SessionLocal = sessionmaker(
    bind = engine,
    autoflush=False,
    autocommit = False
)

def get_db():

    db = SessionLocal()

    try:
        yield db #yield is used here to end the session after ending the session
    finally:
        db.close()
