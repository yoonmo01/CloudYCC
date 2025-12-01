from fastapi import APIRouter
from app.api.v1.endpoints import weather

api_router = APIRouter()

# weather 엔드포인트 등록
api_router.include_router(weather.router, prefix="/weather", tags=["weather"])