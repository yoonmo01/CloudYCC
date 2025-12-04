# backend/app/routers/landmark_router.py
from typing import List, Optional

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session

from app.db.session import get_db
from app import crud
from app.schemas import LandmarkCreate, LandmarkUpdate, LandmarkOut

router = APIRouter()


@router.get("/", response_model=List[LandmarkOut])
def list_landmarks(
    country_code: Optional[str] = Query(None),
    region_code: Optional[str] = Query(None),
    db: Session = Depends(get_db),
):
    landmarks = crud.get_landmarks(
        db,
        country_code=country_code,
        region_code=region_code,
    )
    return landmarks


@router.post("/", response_model=LandmarkOut)
def create_landmark(
    body: LandmarkCreate,
    db: Session = Depends(get_db),
):
    """
    (임시용) 단일 랜드마크 등록.
    나중에 CSV/시트로 대량 업로드해도 됨.
    """
    landmark = crud.create_landmark(db, body)
    return landmark


@router.put("/{landmark_id}", response_model=LandmarkOut)
def update_landmark(
    landmark_id: int,
    body: LandmarkUpdate,
    db: Session = Depends(get_db),
):
    landmark = crud.get_landmark(db, landmark_id)
    if not landmark:
        raise HTTPException(status_code=404, detail="랜드마크를 찾을 수 없습니다.")
    updated = crud.update_landmark(db, landmark, body)
    return updated


@router.delete("/{landmark_id}")
def delete_landmark(
    landmark_id: int,
    db: Session = Depends(get_db),
):
    landmark = crud.get_landmark(db, landmark_id)
    if not landmark:
        raise HTTPException(status_code=404, detail="랜드마크를 찾을 수 없습니다.")
    crud.delete_landmark(db, landmark)
    return {"ok": True}
