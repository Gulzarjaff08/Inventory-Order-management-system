from sqlalchemy import create_engine
from sqlalchemy.orm import declarative_base, sessionmaker
from app.config import settings

# Add SSL support for cloud databases like Neon (require sslmode=require in URL)
connect_args = {}
if "sslmode=require" in settings.DATABASE_URL:
    connect_args = {"sslmode": "require"}

# Create engine
engine = create_engine(settings.DATABASE_URL, connect_args=connect_args)

# Create session factory
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Declarative base class for models
Base = declarative_base()

# Dependency to get the database session
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
