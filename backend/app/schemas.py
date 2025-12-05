# backend/app/schemas.py
from typing import List, Optional
from datetime import date
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


class WeatherDaily(BaseModel):
    date: date
    temperature_max: float
    temperature_min: float
    status: str
    icon_type: str


class WeatherForecastResponse(BaseModel):
    lat: float
    lon: float
    start_date: date
    # end_date는 WeatherService에서 내려주면 채워짐, 실패 시 None 가능
    end_date: Optional[date] = None
    days: int
    daily: List[WeatherDaily]


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
    lat: float
    lon: float


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


class LandmarkOut(BaseModel):
    id: int
    country: str      # "일본", "태국", "영국"
    region: str       # "도쿄", "방콕", "런던" 등
    name: str
    description: Optional[str] = None
    lng: float
    lat: float

    class Config:
        from_attributes = True


# ─────────────────────────────
# 일정(Itinerary)
# ─────────────────────────────
class ItineraryCreate(BaseModel):
    country_code: str            # JP/TH/UK
    region_code: str             # tokyo/bangkok/london 등
    days: int                    # 일정 일수
    start_date: date             # 일정 시작일
    theme: Optional[str] = None  # "food", "activity", "museum" 등
    selected_landmark_ids: List[int] = []


class ItineraryOut(BaseModel):
    id: int
    country_code: str
    region_code: str
    days: int
    start_date: date             # 🔹 응답에도 시작일 포함
    theme: Optional[str] = None
    title: Optional[str] = None
    ai_summary: str              # 여기에는 Gemini가 만든 JSON 문자열이 들어간다고 보면 됨
    selected_landmark_ids: List[int]
    created_at: str

    class Config:
        from_attributes = True


# ─────────────────────────────
# 일정 상세(JSON 구조) - Gemini 응답 형식
# ─────────────────────────────
class ItineraryOverview(BaseModel):
    title: str
    summary: str
    highlights: List[str]


class ItineraryDayLandmark(BaseModel):
    landmark_id: int
    name: str
    order: int
    reason: str


class ItineraryDayPlan(BaseModel):
    day: int
    title: str
    reason: str
    landmarks: List[ItineraryDayLandmark]


class ItineraryTips(BaseModel):
    packing: List[str] = []
    local: List[str] = []


class ItineraryDetail(BaseModel):
    overview: ItineraryOverview
    daily_plan: List[ItineraryDayPlan]
    tips: ItineraryTips


# ─────────────────────────────
# 체크리스트 (간단 버전)
# ─────────────────────────────
class ChecklistItem(BaseModel):
    id: int
    text: str
    category: str  # "공통", "일본", "태국", "영국" 등


# ─────────────────────────────
# 국가별 부가 데이터 (맛집 / 액티비티 / 박물관)
# ─────────────────────────────
class JapanRestaurantOut(BaseModel):
    id: int
    region: str
    name: str
    rating: Optional[float]
    lng: Optional[float]
    lat: Optional[float]
    signature_menu: Optional[str]
    opening_hours: Optional[str]

    class Config:
        from_attributes = True


class ThailandActivityOut(BaseModel):
    id: int
    region: str
    name: str
    description: Optional[str]

    class Config:
        from_attributes = True


class UkMuseumOut(BaseModel):
    id: int
    region: str
    name: str
    opening_info: Optional[str]
    description: Optional[str]

    class Config:
        from_attributes = True


class TravelOverview(BaseModel):
    country_code: str
    region_code: str
    country_name: str
    region_name: str
    landmarks: List[LandmarkOut]
    restaurants: List[JapanRestaurantOut] = []
    activities: List[ThailandActivityOut] = []
    museums: List[UkMuseumOut] = []


# ─────────────────────────────
# 리포트 페이지용 응답 스키마
# ─────────────────────────────
class ItineraryReportResponse(BaseModel):
    """
    리포트 페이지에서 한 번에 쓸 전체 응답 구조
    """
    itinerary: ItineraryOut                 # 기본 메타 정보 (id, title, days, created_at 등)
    detail: ItineraryDetail                 # overview + daily_plan + tips (Gemini JSON)

    # 아직 백엔드에서 항상 채워넣지 않을 수 있으므로 Optional로 두고,
    # 나중에 날씨/오버뷰 로직이 완성되면 필수로 바꿔도 됨.
    travel_overview: Optional[TravelOverview] = None
    weather: Optional[WeatherForecastResponse] = None

    # 아래 세 개는 travel_overview 안에도 있지만,
    # 프론트에서 편하게 쓰라고 최상단에도 남겨둔 구조 (원하는 대로 유지/삭제 가능)
    restaurants: List[JapanRestaurantOut] = []
    activities: List[ThailandActivityOut] = []
    museums: List[UkMuseumOut] = []
