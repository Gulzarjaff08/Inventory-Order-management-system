from pydantic import BaseModel, Field
from typing import List
from datetime import datetime


# ── Request schemas ──────────────────────────────────────────────────

# One product line in an order
class OrderItemCreate(BaseModel):
    product_id: int = Field(..., description="ID of the product to order")
    quantity: int = Field(..., ge=1, description="Quantity must be at least 1")


# Full order creation request
class OrderCreate(BaseModel):
    customer_id: int = Field(..., description="ID of the customer placing the order")
    items: List[OrderItemCreate] = Field(..., min_length=1, description="At least one item is required")


# ── Response schemas ─────────────────────────────────────────────────

# Details of one line item in the order response
class OrderItemOut(BaseModel):
    id: int
    product_id: int
    product_name: str
    quantity: int
    unit_price: float
    subtotal: float

    class Config:
        from_attributes = True


# Full order response with nested items
class OrderOut(BaseModel):
    id: int
    customer_id: int
    customer_name: str
    total_amount: float
    items: List[OrderItemOut]
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True
        json_encoders = {
            datetime: lambda dt: dt.isoformat()
        }
