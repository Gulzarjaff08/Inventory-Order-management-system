from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    PROJECT_NAME: str = "Inventory & Order Management System"
    # Must be set via environment variable in production (Render dashboard)
    DATABASE_URL: str = "postgresql://postgres:postgres@localhost:5432/inventory_db"

    class Config:
        env_file = ".env"
        case_sensitive = True

settings = Settings()
