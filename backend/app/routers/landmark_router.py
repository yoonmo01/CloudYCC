# backend/app/routers/landmark_router.py
from typing import List, Optional

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session

from app.db.session import get_db
from app import models
from app.schemas import LandmarkOut, LandmarkCreate, LandmarkUpdate

router = APIRouter()

COUNTRY_CODE_TO_NAME = {
    "JP": "일본",
    "TH": "태국",
    "UK": "영국",
}

REGION_CODE_TO_NAME = {
    "JP": {
        "tokyo": "도쿄",
        "osaka": "오사카",
        "fukuoka": "후쿠오카",
    },
    "TH": {
        "bangkok": "방콕",
        "phuket": "푸켓",
        "chiangmai": "치앙마이",
    },
    "UK": {
        "london": "런던",
        "manchester": "맨체스터",
        "liverpool": "리버풀",
    },
}


@router.get("/", response_model=List[LandmarkOut])
def list_landmarks(
    country_code: Optional[str] = Query(None, description="JP/TH/UK"),
    region_code: Optional[str] = Query(None, description="tokyo / bangkok / london ..."),
    db: Session = Depends(get_db),
):
    """
    지도에서 쓸 랜드마크 리스트.
    - country_code만 주면: 해당 국가 전체 랜드마크
    - country_code + region_code: 해당 지역만
    - 둘 다 없으면 전체 반환 (개발용)
    """
    query = db.query(models.Landmark)

    if country_code:
        country_name = COUNTRY_CODE_TO_NAME.get(country_code)
        if not country_name:
            raise HTTPException(status_code=400, detail="지원하지 않는 country_code 입니다.")
        query = query.filter(models.Landmark.country == country_name)

        if region_code:
            region_map = REGION_CODE_TO_NAME.get(country_code, {})
            region_name = region_map.get(region_code)
            if not region_name:
                raise HTTPException(status_code=400, detail="지원하지 않는 region_code 입니다.")
            query = query.filter(models.Landmark.region == region_name)

    landmarks = query.all()
    return [
        LandmarkOut(
            id=lm.id,
            country=lm.country,
            region=lm.region,
            name=lm.name,
            description=lm.description,
            lng=lm.lng,
            lat=lm.lat,
            description_long=lm.description_long,
            highlight_points=(
                lm.highlight_points.split("\n") if lm.highlight_points else None
            ),
            best_time=lm.best_time,
            recommended_duration=lm.recommended_duration,
            local_tip=lm.local_tip,
        )
        for lm in landmarks
    ]


# 이하 CRUD는 필요하면 유지(관리용)

@router.post("/", response_model=LandmarkOut)
def create_landmark(
    body: LandmarkCreate,
    db: Session = Depends(get_db),
):
    lm = models.Landmark(
        country=body.country,
        region=body.region,
        name=body.name,
        description=body.description,
        lng=body.lng,
        lat=body.lat,
    )
    db.add(lm)
    db.commit()
    db.refresh(lm)
    return lm


@router.put("/{landmark_id}", response_model=LandmarkOut)
def update_landmark(
    landmark_id: int,
    body: LandmarkUpdate,
    db: Session = Depends(get_db),
):
    lm = db.query(models.Landmark).filter(models.Landmark.id == landmark_id).first()
    if not lm:
        raise HTTPException(status_code=404, detail="랜드마크를 찾을 수 없습니다.")

    for field, value in body.model_dump(exclude_unset=True).items():
        setattr(lm, field, value)

    db.commit()
    db.refresh(lm)
    return lm


@router.delete("/{landmark_id}")
def delete_landmark(
    landmark_id: int,
    db: Session = Depends(get_db),
):
    lm = db.query(models.Landmark).filter(models.Landmark.id == landmark_id).first()
    if not lm:
        raise HTTPException(status_code=404, detail="랜드마크를 찾을 수 없습니다.")

    db.delete(lm)
    db.commit()
    return {"ok": True}
