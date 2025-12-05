# backend/app/db/session.py
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

from app.core.config import settings

print(">>> DATABASE_URL from settings:", settings.database_url)  # 🔥 요 줄 추가

engine = create_engine(
    settings.database_url,
    future=True,
    echo=False,  # 디버깅할 때 True로
)

SessionLocal = sessionmaker(
    autocommit=False,
    autoflush=False,
    bind=engine,
    future=True,
)


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
