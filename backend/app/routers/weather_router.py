from fastapi import APIRouter, Query, HTTPException
from datetime import date
from app.services.weather_service import WeatherService
from app.services.distance_service import DistanceService

from app.schemas import WeatherResponse, DistanceResponse, WeatherForecastResponse

router = APIRouter()

# 날씨 확인: /api/v1/weather/check
@router.get("/check", response_model=WeatherResponse)
def check_weather(lat: float, lon: float):
    """
    단순 현재 날씨 (지금 시점)
    """
    return WeatherService.get_current_weather(lat, lon)

# 일정 기반 일별 예보: /api/v1/weather/forecast
@router.get("/forecast", response_model=WeatherForecastResponse, summary="여행 기간 날씨 예보 조회")
def get_weather_forecast(
    lat: float = Query(..., description="지역 중심 위도"),
    lon: float = Query(..., description="지역 중심 경도"),
    start_date: date = Query(..., description="여행 시작일 (YYYY-MM-DD)"),
    end_date: date = Query(..., description="여행 종료일 (YYYY-MM-DD, 포함)"),
):
    if end_date < start_date:
        raise HTTPException(status_code=400, detail="end_date는 start_date 이후여야 합니다.")

    days = (end_date - start_date).days + 1

    return WeatherService.get_forecast(
        lat=lat,
        lon=lon,
        start_date=start_date,
        days=days,
    )


# 거리 확인: /api/v1/weather/distance
@router.get("/distance", response_model=DistanceResponse)
def check_distance(
    slat: float = Query(..., description="출발 위도"),
    slon: float = Query(..., description="출발 경도"),
    elat: float = Query(..., description="도착 위도"),
    elon: float = Query(..., description="도착 경도")
):
    return DistanceService.get_distance(slat, slon, elat, elon)