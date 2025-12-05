# backend/app/routers/region_router.py
from typing import List

from fastapi import APIRouter, Query, HTTPException

from app.schemas import Region

router = APIRouter()

# app/routers/region_router.py
REGION_DATA = {
    "JP": [
        Region(code="tokyo", name="도쿄", country_code="JP", lat=35.6764225, lon=139.650027),
        Region(code="osaka", name="오사카", country_code="JP", lat=34.6937249, lon=135.5022535),
        Region(code="fukuoka", name="후쿠오카", country_code="JP", lat=33.5901838, lon=130.4016888),
    ],
    "TH": [
        Region(code="bangkok", name="방콕", country_code="TH", lat=13.7563309, lon=100.5017651),
        Region(code="phuket", name="푸켓", country_code="TH", lat=7.9843109, lon=98.3307468),
        Region(code="chiangmai", name="치앙마이", country_code="TH", lat=18.7883439, lon=98.9853008),
    ],
    "UK": [
        Region(code="london", name="런던", country_code="UK", lat=51.5072178, lon=-0.1275862),
        Region(code="manchester", name="맨체스터", country_code="UK", lat=53.4807593, lon=-2.2426305),
        Region(code="liverpool", name="리버풀", country_code="UK", lat=53.4083714, lon=-2.9915726),
    ],
}


@router.get("/", response_model=List[Region])
def list_regions(country_code: str = Query(..., description="JP/TH/UK")):
    if country_code not in REGION_DATA:
        raise HTTPException(status_code=404, detail="지원하지 않는 국가입니다.")
    return REGION_DATA[country_code]
