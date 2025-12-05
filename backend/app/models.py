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
    country = Column(String(20), index=True)   # "태국", "일본", "영국"
    region = Column(String(20), index=True)    # "방콕", "도쿄" 등
    name = Column(String(200), nullable=False)
    description = Column(Text, nullable=True)
    lng = Column(Float, nullable=False)
    lat = Column(Float, nullable=False)


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

class JapanRestaurant(Base):
    __tablename__ = "japan_restaurants"

    id = Column(Integer, primary_key=True, index=True)
    region = Column(String(20), index=True)
    name = Column(String(200), nullable=False)
    rating = Column(Float, nullable=True)
    lng = Column(Float, nullable=True)
    lat = Column(Float, nullable=True)
    signature_menu = Column(String(200), nullable=True)
    opening_hours = Column(String(200), nullable=True)


class ThailandActivity(Base):
    __tablename__ = "thailand_activities"

    id = Column(Integer, primary_key=True, index=True)
    region = Column(String(20), index=True)
    name = Column(String(200), nullable=False)
    description = Column(Text, nullable=True)


class UkMuseum(Base):
    __tablename__ = "uk_museums"

    id = Column(Integer, primary_key=True, index=True)
    region = Column(String(20), index=True)
    name = Column(String(200), nullable=False)
    opening_info = Column(String(200), nullable=True)
    description = Column(Text, nullable=True)
