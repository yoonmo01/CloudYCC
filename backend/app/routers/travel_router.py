# backend/app/routers/travel_router.py
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import List

from app.db.session import get_db
from app import models
from app.schemas import (
    TravelOverview,
    LandmarkOut,
    JapanRestaurantOut,
    ThailandActivityOut,
    UkMuseumOut,
)
from .landmark_router import (
    COUNTRY_CODE_TO_NAME,
    REGION_CODE_TO_NAME,
)

router = APIRouter()


@router.get("/overview", response_model=TravelOverview)
def get_travel_overview(
    country_code: str = Query(..., description="JP/TH/UK"),
    region_code: str = Query(..., description="tokyo / bangkok / london ..."),
    db: Session = Depends(get_db),
):
    """
    특정 국가/지역에 대한:
    - 랜드마크
    - (일본이면) 맛집
    - (태국이면) 액티비티
    - (영국이면) 박물관
    을 한 번에 내려주는 엔드포인트.
    """

    country_name = COUNTRY_CODE_TO_NAME.get(country_code)
    if not country_name:
        raise HTTPException(status_code=400, detail="지원하지 않는 country_code 입니다.")

    region_map = REGION_CODE_TO_NAME.get(country_code, {})
    region_name = region_map.get(region_code)
    if not region_name:
        raise HTTPException(status_code=400, detail="지원하지 않는 region_code 입니다.")

    # 랜드마크
    lm_q = (
        db.query(models.Landmark)
        .filter(models.Landmark.country == country_name)
        .filter(models.Landmark.region == region_name)
        .all()
    )
    landmarks = [
        LandmarkOut(
            id=lm.id,
            country=lm.country,
            region=lm.region,
            name=lm.name,
            description=lm.description,
            lng=lm.lng,
            lat=lm.lat,
        )
        for lm in lm_q
    ]

    restaurants: List[JapanRestaurantOut] = []
    activities: List[ThailandActivityOut] = []
    museums: List[UkMuseumOut] = []

    if country_code == "JP":
        rs_q = (
            db.query(models.JapanRestaurant)
            .filter(models.JapanRestaurant.region == region_name)
            .all()
        )
        restaurants = [JapanRestaurantOut.model_validate(r) for r in rs_q]

    elif country_code == "TH":
        ac_q = (
            db.query(models.ThailandActivity)
            .filter(models.ThailandActivity.region == region_name)
            .all()
        )
        activities = [ThailandActivityOut.model_validate(a) for a in ac_q]

    elif country_code == "UK":
        mu_q = (
            db.query(models.UkMuseum)
            .filter(models.UkMuseum.region == region_name)
            .all()
        )
        museums = [UkMuseumOut.model_validate(m) for m in mu_q]

    return TravelOverview(
        country_code=country_code,
        region_code=region_code,
        country_name=country_name,
        region_name=region_name,
        landmarks=landmarks,
        restaurants=restaurants,
        activities=activities,
        museums=museums,
    )
