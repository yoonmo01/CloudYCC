# backend/app/crud.py
from typing import List, Optional

from sqlalchemy.orm import Session

from app import models
from app.schemas import LandmarkCreate, LandmarkUpdate, ItineraryCreate


# ─────────────────────────────
# Landmark
# ─────────────────────────────
def create_landmark(db: Session, landmark_in: LandmarkCreate) -> models.Landmark:
    landmark = models.Landmark(**landmark_in.dict())
    db.add(landmark)
    db.commit()
    db.refresh(landmark)
    return landmark


def get_landmark(db: Session, landmark_id: int) -> Optional[models.Landmark]:
    return db.query(models.Landmark).filter(models.Landmark.id == landmark_id).first()


def get_landmarks(
    db: Session,
    country_code: Optional[str] = None,
    region_code: Optional[str] = None,
) -> List[models.Landmark]:
    q = db.query(models.Landmark)
    if country_code:
        q = q.filter(models.Landmark.country_code == country_code)
    if region_code:
        q = q.filter(models.Landmark.region_code == region_code)
    return q.all()


def update_landmark(
    db: Session,
    landmark: models.Landmark,
    landmark_in: LandmarkUpdate,
) -> models.Landmark:
    for field, value in landmark_in.dict(exclude_unset=True).items():
        setattr(landmark, field, value)
    db.add(landmark)
    db.commit()
    db.refresh(landmark)
    return landmark


def delete_landmark(db: Session, landmark: models.Landmark) -> None:
    db.delete(landmark)
    db.commit()


# ─────────────────────────────
# Itinerary
# ─────────────────────────────
def create_itinerary(
    db: Session,
    itinerary_in: ItineraryCreate,
    ai_title: str,
    ai_summary: str,
) -> models.Itinerary:
    selected_ids_str = ",".join(str(i) for i in itinerary_in.selected_landmark_ids)

    itinerary = models.Itinerary(
        country_code=itinerary_in.country_code,
        region_code=itinerary_in.region_code,
        days=itinerary_in.days,
        theme=itinerary_in.theme,
        selected_landmark_ids=selected_ids_str,
        title=ai_title,
        ai_summary=ai_summary,
    )
    db.add(itinerary)
    db.commit()
    db.refresh(itinerary)
    return itinerary


def get_itinerary(db: Session, itinerary_id: int) -> Optional[models.Itinerary]:
    return db.query(models.Itinerary).filter(models.Itinerary.id == itinerary_id).first()


def list_itineraries(
    db: Session,
    country_code: Optional[str] = None,
    region_code: Optional[str] = None,
) -> List[models.Itinerary]:
    q = db.query(models.Itinerary)
    if country_code:
        q = q.filter(models.Itinerary.country_code == country_code)
    if region_code:
        q = q.filter(models.Itinerary.region_code == region_code)
    return q.order_by(models.Itinerary.created_at.desc()).all()
