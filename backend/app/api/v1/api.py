from fastapi import APIRouter
from app.api.v1.endpoints import weather_router 

api_router = APIRouter()

api_router.include_router(weather_router.router, prefix="/weather", tags=["weather"])