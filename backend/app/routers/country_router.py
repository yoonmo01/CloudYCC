# backend/app/routers/country_router.py
from typing import List

from fastapi import APIRouter

from app.schemas import Country

router = APIRouter()


@router.get("/", response_model=List[Country])
def list_countries():
    """
    클라우드 팀플에서 사용할 국가 3개 고정 반환
    """
    return [
        Country(code="JP", name="일본"),
        Country(code="TH", name="태국"),
        Country(code="UK", name="영국"),
    ]
