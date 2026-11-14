from pydantic_settings import BaseSettings, SettingsConfigDict

class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", extra="ignore")
    mongodb_uri: str
    mongodb_db: str = "inkloom"
    jwt_secret: str
    jwt_expire_minutes: int = 480
    gemini_api_key: str = ""
    gemini_model: str = "gemini-2.5-flash"
    cors_origins: str = "http://localhost:5173"
    demo_mode: bool = True

settings = Settings()
