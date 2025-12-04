# backend/app/routers/__init__.py
from fastapi import APIRouter

from app.routers.country_router import router as country_router
from app.routers.region_router import router as region_router
from app.routers.landmark_router import router as landmark_router
from app.routers.itineraries_router import router as itineraries_router
from app.routers.checklist_router import router as checklist_router
from app.routers.weather_router import router as weather_router
from app.routers.gemini_router import router as gemini_router

api_router = APIRouter()

api_router.include_router(country_router, prefix="/countries", tags=["countries"])
api_router.include_router(region_router, prefix="/regions", tags=["regions"])
api_router.include_router(landmark_router, prefix="/landmarks", tags=["landmarks"])
api_router.include_router(itineraries_router, prefix="/itineraries", tags=["itineraries"])
api_router.include_router(checklist_router, prefix="/checklist", tags=["checklist"])
api_router.include_router(weather_router, prefix="/weather", tags=["weather"])
api_router.include_router(gemini_router, prefix="/gemini", tags=["gemini"])
