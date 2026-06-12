from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    PROJECT_NAME: str = "Inventory & Order Management System"
    DATABASE_URL: str = "postgresql://postgres:postgres@db:5432/inventory_db"
    
    class Config:
        env_file = ".env"
        case_sensitive = True

settings = Settings()
