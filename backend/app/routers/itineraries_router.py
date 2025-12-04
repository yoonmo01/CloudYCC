# backend/app/routers/itineraries_router.py
from typing import List

from fastapi import APIRouter, Depends, HTTPException, Response
from sqlalchemy.orm import Session

from app.db.session import get_db
from app import crud, models
from app.schemas import ItineraryCreate, ItineraryOut
from app.services.planner_service import PlannerService
from app.services.csv_service import CSVService

router = APIRouter()


def _parse_selected_ids(selected_ids_str: str) -> List[int]:
    if not selected_ids_str:
        return []
    return [int(x) for x in selected_ids_str.split(",") if x]


@router.post("/generate", response_model=ItineraryOut)
def generate_itinerary(
    body: ItineraryCreate,
    db: Session = Depends(get_db),
):
    """
    1. 선택된 랜드마크들을 DB에서 조회
    2. PlannerService로 프롬프트 생성 후 Gemini 호출
    3. 결과를 Itinerary 테이블에 저장
    4. 저장된 일정 정보 반환
    """
    landmarks: List[models.Landmark] = []
    if body.selected_landmark_ids:
        landmarks = (
            db.query(models.Landmark)
            .filter(models.Landmark.id.in_(body.selected_landmark_ids))
            .all()
        )

    title, full_text = PlannerService.generate_itinerary_text(body, landmarks)
    itinerary = crud.create_itinerary(db, body, ai_title=title, ai_summary=full_text)

    return ItineraryOut(
        id=itinerary.id,
        country_code=itinerary.country_code,
        region_code=itinerary.region_code,
        days=itinerary.days,
        theme=itinerary.theme,
        title=itinerary.title,
        ai_summary=itinerary.ai_summary,
        selected_landmark_ids=_parse_selected_ids(itinerary.selected_landmark_ids or ""),
        created_at=itinerary.created_at.isoformat(),
    )


@router.get("/{itinerary_id}", response_model=ItineraryOut)
def get_itinerary(
    itinerary_id: int,
    db: Session = Depends(get_db),
):
    itinerary = crud.get_itinerary(db, itinerary_id)
    if not itinerary:
        raise HTTPException(status_code=404, detail="일정을 찾을 수 없습니다.")

    return ItineraryOut(
        id=itinerary.id,
        country_code=itinerary.country_code,
        region_code=itinerary.region_code,
        days=itinerary.days,
        theme=itinerary.theme,
        title=itinerary.title,
        ai_summary=itinerary.ai_summary,
        selected_landmark_ids=_parse_selected_ids(itinerary.selected_landmark_ids or ""),
        created_at=itinerary.created_at.isoformat(),
    )


@router.get("/{itinerary_id}/csv")
def download_itinerary_csv(
    itinerary_id: int,
    db: Session = Depends(get_db),
):
    """
    AI가 만든 일정 텍스트를 간단하게 줄 단위로 CSV로 내려주는 엔드포인트.
    """
    itinerary = crud.get_itinerary(db, itinerary_id)
    if not itinerary:
        raise HTTPException(status_code=404, detail="일정을 찾을 수 없습니다.")

    csv_str = CSVService.itinerary_to_csv_string(itinerary)

    filename = f"itinerary_{itinerary_id}.csv"
    headers = {
        "Content-Disposition": f'attachment; filename="{filename}"'
    }

    return Response(
        content=csv_str,
        media_type="text/csv; charset=utf-8",
        headers=headers,
    )
