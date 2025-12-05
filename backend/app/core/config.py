# backend/app/core/config.py
from functools import lru_cache
from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    project_name: str = "CloudYCC Project"

    # .env 에서 읽어올 값들
    database_url: str                    # DATABASE_URL=...
    google_api_key: str | None = None    # GOOGLE_API_KEY=...

    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"


@lru_cache
def get_settings() -> Settings:
    return Settings()


settings = get_settings()
