# backend/app/routers/itineraries_router.py

from typing import List
import json

from fastapi import APIRouter, Depends, HTTPException, Response
from sqlalchemy.orm import Session

from app.db.session import get_db
from app import crud, models
from app.schemas import (
    ItineraryCreate,
    ItineraryOut,
    ItineraryDetail,
    ItineraryReportResponse,
    JapanRestaurantOut,
    ThailandActivityOut,
    UkMuseumOut,
)
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
    일정 생성하기 버튼 → 호출되는 엔드포인트.

    1. 선택된 랜드마크들을 DB에서 조회
    2. PlannerService로 프롬프트 생성 후 Gemini 호출
       - Gemini는 ItineraryDetail 구조(JSON)로 응답 (문자열)
    3. 결과(JSON 문자열)를 Itinerary 테이블에 저장
    4. 저장된 일정 메타 정보(ItineraryOut)를 반환
    """
    landmarks: List[models.Landmark] = []
    if body.selected_landmark_ids:
        landmarks = (
            db.query(models.Landmark)
            .filter(models.Landmark.id.in_(body.selected_landmark_ids))
            .all()
        )

    # 여기서 full_text 는 "ItineraryDetail JSON 문자열" 이라고 가정
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
    """
    단일 일정 기본 정보 조회용 (리포트 페이지 말고 간단 조회용)
    """
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
    (현재는 ai_summary 전체를 텍스트로 간주해서 CSV로 변환하는 용도)
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


@router.get("/{itinerary_id}/report", response_model=ItineraryReportResponse)
def get_itinerary_report(
    itinerary_id: int,
    db: Session = Depends(get_db),
):
    """
    리포트 페이지 전용 엔드포인트.

    내려주는 내용:
    - itinerary: 기본 일정 메타 정보(ItineraryOut)
    - detail: Gemini가 만든 상세 일정(ItineraryDetail)
    - restaurants / activities / museums:
        - 일본(JP): 해당 region의 맛집 리스트
        - 태국(TH): 액티비티 리스트
        - 영국(UK): 박물관 리스트
    """
    itinerary = crud.get_itinerary(db, itinerary_id)
    if not itinerary:
        raise HTTPException(status_code=404, detail="일정을 찾을 수 없습니다.")

    if not itinerary.ai_summary:
        raise HTTPException(status_code=400, detail="이 일정에는 AI 요약 데이터가 없습니다.")

    # 1) ai_summary(JSON 문자열) -> ItineraryDetail 파싱
    try:
        detail_raw = json.loads(itinerary.ai_summary)
        detail = ItineraryDetail(**detail_raw)
    except Exception as e:
        print(f"[ItineraryReport] ItineraryDetail 파싱 오류: {e}")
        raise HTTPException(status_code=500, detail="AI 일정 데이터 파싱에 실패했습니다.")

    # 2) 국가/지역 코드에 따라 추가 데이터 조회
    restaurants: List[JapanRestaurantOut] = []
    activities: List[ThailandActivityOut] = []
    museums: List[UkMuseumOut] = []

    if itinerary.country_code == "JP":
        jp_items = crud.get_japan_restaurants_by_region(db, itinerary.region_code)
        restaurants = [JapanRestaurantOut.model_validate(item) for item in jp_items]

    elif itinerary.country_code == "TH":
        th_items = crud.get_thailand_activities_by_region(db, itinerary.region_code)
        activities = [ThailandActivityOut.model_validate(item) for item in th_items]

    elif itinerary.country_code == "UK":
        uk_items = crud.get_uk_museums_by_region(db, itinerary.region_code)
        museums = [UkMuseumOut.model_validate(item) for item in uk_items]

    # 3) 기본 ItineraryOut 구성
    itinerary_out = ItineraryOut(
        id=itinerary.id,
        country_code=itinerary.country_code,
        region_code=itinerary.region_code,
        days=itinerary.days,
        start_date=itinerary.start_date,
        theme=itinerary.theme,
        title=itinerary.title,
        ai_summary=itinerary.ai_summary,
        selected_landmark_ids=_parse_selected_ids(itinerary.selected_landmark_ids or ""),
        created_at=itinerary.created_at.isoformat(),
    )

    return ItineraryReportResponse(
        itinerary=itinerary_out,
        detail=detail,
        restaurants=restaurants,
        activities=activities,
        museums=museums,
    )
