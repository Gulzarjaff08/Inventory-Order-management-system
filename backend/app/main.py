from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.config import settings
from app.database import engine, Base
# Import all models so SQLAlchemy registers them before create_all
from app.models import Product, Customer, Order, OrderItem
from app.routers.product import router as product_router
from app.routers.customer import router as customer_router
from app.routers.order import router as order_router

# Create all database tables
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title=settings.PROJECT_NAME,
    description="Containerized Inventory & Order Management API",
    version="1.0.0"
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register all routers
app.include_router(product_router)
app.include_router(customer_router)
app.include_router(order_router)

@app.get("/")
def read_root():
    return {
        "message": f"Welcome to the {settings.PROJECT_NAME} API",
        "status": "online",
        "docs_url": "/docs"
    }
