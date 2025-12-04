# backend/app/routers/checklist_router.py
from typing import List, Optional

from fastapi import APIRouter, Query

from app.schemas import ChecklistItem

router = APIRouter()

# 아주 간단한 하드코딩 버전
CHECKLIST_ITEMS = [
    ChecklistItem(id=1, text="여권 유효기간 확인", category="공통"),
    ChecklistItem(id=2, text="항공권/숙소 바우처 준비", category="공통"),
    ChecklistItem(id=3, text="현지 유심 또는 eSIM 준비", category="공통"),
    ChecklistItem(id=101, text="JR 패스/교통카드 확인", category="일본"),
    ChecklistItem(id=102, text="온천 이용 시 수건/슬리퍼 준비", category="일본"),
    ChecklistItem(id=201, text="야시장 방문 시 현금 여분 준비", category="태국"),
    ChecklistItem(id=202, text="사원 방문 복장(긴 바지, 어깨 가리는 옷)", category="태국"),
    ChecklistItem(id=301, text="영국식 플러그(3핀 어댑터) 준비", category="영국"),
    ChecklistItem(id=302, text="우산 또는 방수 재킷", category="영국"),
]


@router.get("/", response_model=List[ChecklistItem])
def list_checklist(
    country: Optional[str] = Query(None, description="일본/태국/영국 또는 None=공통+전체"),
):
    """
    country가 없으면 공통 + 전체,
    country가 '일본'이면 '공통' + '일본'만 반환.
    """
    if not country:
        return CHECKLIST_ITEMS

    target = []
    for item in CHECKLIST_ITEMS:
        if item.category == "공통" or item.category == country:
            target.append(item)
    return target
