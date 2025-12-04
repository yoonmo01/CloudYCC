# backend/app/schemas.py
from typing import List, Optional

from pydantic import BaseModel


# ─────────────────────────────
# 거리
# ─────────────────────────────
class DistanceResponse(BaseModel):
    distance_km: float      # 거리 (km)
    duration_min: float     # 소요 시간 (분)


# ─────────────────────────────
# 날씨
# ─────────────────────────────
class WeatherResponse(BaseModel):
    temperature: float      # 온도
    status: str             # 간단 상태 (맑음, 흐림, 비 등)
    description: str        # 상세 설명 (예: "활동하기 좋은 날씨입니다")
    icon_type: str          # 프론트에서 아이콘 띄울 때 쓸 구분값 (sunny, cloudy, rainy 등)


# ─────────────────────────────
# Gemini(AI) 관련 스키마
# ─────────────────────────────
class GeminiRequest(BaseModel):
    prompt: str             # 사용자가 보낼 질문


class GeminiResponse(BaseModel):
    answer: str             # AI의 답변


# ─────────────────────────────
# 국가 / 지역
# ─────────────────────────────
class Country(BaseModel):
    code: str   # JP, TH, UK
    name: str   # "일본", "태국", "영국"


class Region(BaseModel):
    code: str           # "tokyo", "osaka", ...
    name: str           # "도쿄", ...
    country_code: str   # JP/TH/UK


# ─────────────────────────────
# 랜드마크
# ─────────────────────────────
class LandmarkBase(BaseModel):
    country_code: str
    region_code: str
    name: str
    description: Optional[str] = None
    image_url: Optional[str] = None
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    theme: Optional[str] = None  # "food", "activity", "museum" 등


class LandmarkCreate(LandmarkBase):
    pass


class LandmarkUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    image_url: Optional[str] = None
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    theme: Optional[str] = None


class LandmarkOut(LandmarkBase):
    id: int

    class Config:
        from_attributes = True


# ─────────────────────────────
# 일정(Itinerary)
# ─────────────────────────────
class ItineraryCreate(BaseModel):
    country_code: str            # JP/TH/UK
    region_code: str             # tokyo/bangkok/london 등
    days: int                    # 일정 일수
    theme: Optional[str] = None  # "food", "activity", "museum" 등
    selected_landmark_ids: List[int] = []


class ItineraryOut(BaseModel):
    id: int
    country_code: str
    region_code: str
    days: int
    theme: Optional[str] = None
    title: Optional[str] = None
    ai_summary: str
    selected_landmark_ids: List[int]
    created_at: str

    class Config:
        from_attributes = True


# ─────────────────────────────
# 체크리스트 (간단 버전)
# ─────────────────────────────
class ChecklistItem(BaseModel):
    id: int
    text: str
    category: str  # "공통", "일본", "태국", "영국" 등
