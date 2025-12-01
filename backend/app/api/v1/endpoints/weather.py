from fastapi import APIRouter, Query
from app.services.weather_service import WeatherService
from app.services.distance_service import DistanceService
from app.schemas.weather import WeatherResponse
from app.schemas.distance import DistanceResponse

router = APIRouter()

# 날씨 확인: /api/v1/weather/check
@router.get("/check", response_model=WeatherResponse)
def check_weather(lat: float, lon: float):
    return WeatherService.get_weather(lat, lon)

# 거리 확인: /api/v1/weather/distance
@router.get("/distance", response_model=DistanceResponse)
def check_distance(
    slat: float = Query(..., description="출발 위도"),
    slon: float = Query(..., description="출발 경도"),
    elat: float = Query(..., description="도착 위도"),
    elon: float = Query(..., description="도착 경도")
):
    return DistanceService.get_distance(slat, slon, elat, elon)