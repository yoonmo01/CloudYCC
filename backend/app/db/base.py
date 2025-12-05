# backend/app/db/base.py
from sqlalchemy.orm import declarative_base

Base = declarative_base()

# 👇 이 줄이 중요 – 모델들을 import 해서 Base.metadata에 등록
from app import models  # noqa: F401