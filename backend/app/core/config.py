from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    APP_NAME: str = "DocuMind"
    APP_VERSION: str = "1.0.0"
    ENVIRONMENT: str = "development"
    DATABASE_URL:str
    GEMINI_API_KEY: str
    RAG_MAX_DISTANCE: float = 0.85

       # JWT authentication settings .env se load hongi
    JWT_SECRET_KEY: str
    JWT_ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30

    model_config = SettingsConfigDict(
        env_file=".env",
        extra="ignore"
    )


settings = Settings()
