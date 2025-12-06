# backend/app/scripts/enrich_landmarks.py

import json
from sqlalchemy.orm import Session

from app.db.session import SessionLocal
from app.models import Landmark
from app.services.gemini_service import GeminiService
from app.services.planner_service import PlannerService   # 🔥 추가


PROMPT_TEMPLATE = """
너는 여행 가이드를 작성하는 역할이야.
아래 랜드마크 정보를 바탕으로 한국어로 상세 설명을 만들어줘.

[입력 정보]
- 국가: {country}
- 지역: {region}
- 랜드마크 이름: {name}
- 기존 한 줄 설명: {desc}

[출력 형식 - 반드시 JSON 하나로만]
{{
  "description_long": "문장 3~5개로, 이곳의 역사, 분위기, 뷰 포인트, 어떤 여행자에게 어울리는지 등을 포함해서 자세히.",
  "highlight_points": [
    "핵심 포인트 1",
    "핵심 포인트 2",
    "핵심 포인트 3"
  ],
  "best_time": "방문하기 좋은 시간대 또는 계절 (예: '해질 무렵', '봄 벚꽃 시즌')",
  "recommended_duration": "평균 체류 시간 (예: '1~2시간')",
  "local_tip": "현지인/여행자에게 유용한 팁 1~3문장 (줄 피하는 시간, 교통, 복장 등)"
}}

규칙:
- 출력은 반드시 위 JSON 형식 하나만 포함해야 한다.
- 한국어 존댓말로 작성한다.
- 기존 설명을 그대로 반복하지 말고, 그것을 확장/보완하는 느낌으로 쓴다.
- JSON 바깥에 다른 텍스트(설명, 마크다운, ```json 등)를 절대 넣지 말 것.
"""


def build_prompt(lm: Landmark) -> str:
    return PROMPT_TEMPLATE.format(
        country=lm.country,
        region=lm.region,
        name=lm.name,
        desc=lm.description or "",
    )


def main():
    db: Session = SessionLocal()

    # 아직 description_long이 비어있는 랜드마크만 대상
    landmarks = (
        db.query(Landmark)
        .filter(Landmark.description_long.is_(None))
        .all()
    )

    print(f"총 {len(landmarks)}개 랜드마크 상세 정보 생성 시작")

    for lm in landmarks:
        prompt = build_prompt(lm)
        res = GeminiService.get_chat_response(prompt)

        raw = (res.answer or "").strip()
        # 🔥 코드블럭 처리
        json_text = PlannerService._extract_json_text(raw)

        try:
            data = json.loads(json_text)
        except Exception as e:
            print(
                f"[ERROR] JSON 파싱 실패: id={lm.id}, name={lm.name}, err={e}"
            )
            print("raw snippet:", raw[:200])
            continue

        lm.description_long = data.get("description_long")
        hp_list = data.get("highlight_points") or []
        if isinstance(hp_list, list):
            lm.highlight_points = "\n".join(hp_list)
        else:
            lm.highlight_points = None

        lm.best_time = data.get("best_time")
        lm.recommended_duration = data.get("recommended_duration")
        lm.local_tip = data.get("local_tip")

        db.add(lm)
        db.commit()

        print(f"[OK] {lm.id} - {lm.name}")

    db.close()


if __name__ == "__main__":
    main()
