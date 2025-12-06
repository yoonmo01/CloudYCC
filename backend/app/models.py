# backend/app/models.py
from datetime import datetime
from sqlalchemy.sql import func
from sqlalchemy import (
    Column,
    Integer,
    String,
    Float,
    Text,
    DateTime,
    Date
)
from app.db.base import Base


class Landmark(Base):
    __tablename__ = "landmarks"

    id = Column(Integer, primary_key=True, index=True)
    country = Column(String, nullable=False)
    region = Column(String, nullable=False)
    name = Column(String, nullable=False)
    description = Column(Text, nullable=True)
    lng = Column(Float, nullable=False)
    lat = Column(Float, nullable=False)

    # 🔥 새로 추가
    description_long = Column(Text, nullable=True)
    highlight_points = Column(Text, nullable=True)  # "\n"로 join한 텍스트
    best_time = Column(String(100), nullable=True)
    recommended_duration = Column(String(100), nullable=True)
    local_tip = Column(Text, nullable=True)


class Itinerary(Base):
    __tablename__ = "itineraries"

    id = Column(Integer, primary_key=True, index=True)
    country_code = Column(String, index=True)
    region_code = Column(String, index=True)
    days = Column(Integer)
    start_date = Column(Date, nullable=True)       # ✅ 새로 추가
    theme = Column(String, nullable=True)
    selected_landmark_ids = Column(String, nullable=True)  # "121,123,130"
    title = Column(String, nullable=True)
    ai_summary = Column(Text, nullable=False)      # 여기 안에 ItineraryDetail JSON 문자열
    created_at = Column(DateTime, server_default=func.now())

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
