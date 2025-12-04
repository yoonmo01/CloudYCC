# backend/app/core/config.py
from functools import lru_cache
from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    project_name: str = "CloudYCC Project"

    # ▶ 반드시 .env에서 바꿔서 써줘
    # 예: postgresql+psycopg2://cloudycc:cloudycc@localhost:5432/cloudycc
    database_url: str = "postgresql+psycopg2://user:password@localhost:5432/cloudycc"

    class Config:
        env_file = ".env"


@lru_cache
def get_settings() -> Settings:
    return Settings()


settings = get_settings()
