from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    PROJECT_NAME: str = "STT Service"
    VERSION: str = "1.0.0"
    MODEL_ID: str = "facebook/mms-1b-all"
    # Supported languages: Wolof (wol), Pular (ful)
    SUPPORTED_LANGUAGES: list[str] = ["wol", "ful"]
    SAMPLE_RATE: int = 16000
    ANTHROPIC_API_KEY: str
    GEMINI_API_KEY: str

    class Config:
        env_file = ".env"

settings = Settings()
