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
    """
    country_code(JP/TH/UK), region_code(tokyo/bangkok/london)를
    실제 DB에 저장된 한글 country/region으로 매핑해서 필터링.
    """
    q = db.query(models.Landmark)

    # 코드 → 한글 국가명 매핑
    country_map = {
        "JP": "일본",
        "TH": "태국",
        "UK": "영국",
    }
    region_map = {
        # 일본
        "tokyo": "도쿄",
        "osaka": "오사카",
        "fukuoka": "후쿠오카",
        # 태국
        "bangkok": "방콕",
        "phuket": "푸켓",
        "chiangmai": "치앙마이",
        # 영국
        "london": "런던",
        "edinburgh": "에든버러",
        "manchester": "맨체스터",
        "liverpool": "리버풀",
    }

    if country_code:
        country_name = country_map.get(country_code, country_code)
        q = q.filter(models.Landmark.country == country_name)

    if region_code:
        region_name = region_map.get(region_code, region_code)
        q = q.filter(models.Landmark.region == region_name)

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
    """
    ai_summary 에는 Gemini가 만들어준 JSON 문자열(= ItineraryDetail 구조)이 들어간다고 보면 됨.
    """
    selected_ids_str = ",".join(str(i) for i in itinerary_in.selected_landmark_ids)

    itinerary = models.Itinerary(
        country_code=itinerary_in.country_code,
        region_code=itinerary_in.region_code,
        days=itinerary_in.days,
        start_date=itinerary_in.start_date,    # ✅ 추가
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


# ─────────────────────────────
# 국가별 추가 데이터
#  - 일본: 맛집 (JapanRestaurant)
#  - 태국: 액티비티 (ThailandActivity)
#  - 영국: 박물관 (UkMuseum)
# ─────────────────────────────
def get_japan_restaurants_by_region(
    db: Session,
    region_code: str,
) -> List[models.JapanRestaurant]:
    """
    region_code (tokyo/osaka/fukuoka) -> CSV에 들어간 실제 '지역' 이름 매핑
    """
    region_map = {
        "tokyo": "도쿄",
        "osaka": "오사카",
        "fukuoka": "후쿠오카",
    }
    region_name = region_map.get(region_code)

    q = db.query(models.JapanRestaurant)
    if region_name:
        q = q.filter(models.JapanRestaurant.region == region_name)
    return q.all()


def get_thailand_activities_by_region(
    db: Session,
    region_code: str,
) -> List[models.ThailandActivity]:
    """
    region_code (bangkok/phuket/chiangmai) -> CSV의 지역 이름 매핑
    """
    region_map = {
        "bangkok": "방콕",
        "phuket": "푸켓",
        "chiangmai": "치앙마이",
    }
    region_name = region_map.get(region_code)

    q = db.query(models.ThailandActivity)
    if region_name:
        q = q.filter(models.ThailandActivity.region == region_name)
    return q.all()


def get_uk_museums_by_region(
    db: Session,
    region_code: str,
) -> List[models.UkMuseum]:
    """
    region_code (london/manchester/liverpool) -> CSV의 지역 이름 매핑
    """
    region_map = {
        "london": "런던",
        "manchester": "맨체스터",
        "liverpool": "리버풀",
    }
    region_name = region_map.get(region_code)

    q = db.query(models.UkMuseum)
    if region_name:
        q = q.filter(models.UkMuseum.region == region_name)
    return q.all()
