from pydantic import BaseModel, Field, EmailStr
from typing import Optional
from datetime import datetime

class CustomerBase(BaseModel):
    full_name: str = Field(..., min_length=1, max_length=100, description="Customer full name")
    email: EmailStr = Field(..., description="Unique email address")
    phone: str = Field(..., min_length=5, max_length=20, description="Contact phone number")

class CustomerCreate(CustomerBase):
    pass

class CustomerOut(CustomerBase):
    id: int
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True
        json_encoders = {
            datetime: lambda dt: dt.isoformat()
        }
