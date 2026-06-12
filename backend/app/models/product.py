from sqlalchemy import Column, Integer, String, Float, DateTime, CheckConstraint
from datetime import datetime
from app.database import Base

class Product(Base):
    __tablename__ = "products"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    sku = Column(String, unique=True, index=True, nullable=False)
    price = Column(Float, nullable=False)
    quantity = Column(Integer, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    __table_args__ = (
        CheckConstraint('price >= 0', name='check_price_non_negative'),
        CheckConstraint('quantity >= 0', name='check_quantity_non_negative'),
    )
