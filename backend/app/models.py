# backend/app/models.py
from datetime import datetime

from sqlalchemy import (
    Column,
    Integer,
    String,
    Float,
    Text,
    DateTime,
)
from app.db.base import Base


class Landmark(Base):
    __tablename__ = "landmarks"

    id = Column(Integer, primary_key=True, index=True)
    country_code = Column(String(2), index=True)    # JP, TH, UK
    region_code = Column(String(50), index=True)    # e.g. "tokyo", "bangkok"
    name = Column(String(200), nullable=False)
    description = Column(Text, nullable=True)
    image_url = Column(String(500), nullable=True)
    latitude = Column(Float, nullable=True)
    longitude = Column(Float, nullable=True)
    theme = Column(String(50), nullable=True)       # "food", "activity", "museum" 등


class Itinerary(Base):
    __tablename__ = "itineraries"

    id = Column(Integer, primary_key=True, index=True)
    country_code = Column(String(2), index=True)
    region_code = Column(String(50), index=True)
    days = Column(Integer, nullable=False)
    theme = Column(String(50), nullable=True)

    # 사용자가 선택한 랜드마크 id들을 콤마로 저장 (예: "1,5,8")
    selected_landmark_ids = Column(String(500), nullable=True)

    # AI가 생성한 일정(그냥 텍스트 통짜)
    title = Column(String(200), nullable=True)
    ai_summary = Column(Text, nullable=False)

    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
