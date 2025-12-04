# backend/app/routers/region_router.py
from typing import List

from fastapi import APIRouter, Query, HTTPException

from app.schemas import Region

router = APIRouter()

REGION_DATA = {
    "JP": [
        Region(code="tokyo", name="도쿄", country_code="JP"),
        Region(code="osaka", name="오사카", country_code="JP"),
        Region(code="fukuoka", name="후쿠오카", country_code="JP"),
    ],
    "TH": [
        Region(code="bangkok", name="방콕", country_code="TH"),
        Region(code="phuket", name="푸켓", country_code="TH"),
        Region(code="chiangmai", name="치앙마이", country_code="TH"),
    ],
    "UK": [
        Region(code="london", name="런던", country_code="UK"),
        Region(code="edinburgh", name="에든버러", country_code="UK"),
        Region(code="manchester", name="맨체스터", country_code="UK"),
    ],
}


@router.get("/", response_model=List[Region])
def list_regions(country_code: str = Query(..., description="JP/TH/UK")):
    if country_code not in REGION_DATA:
        raise HTTPException(status_code=404, detail="지원하지 않는 국가입니다.")
    return REGION_DATA[country_code]
