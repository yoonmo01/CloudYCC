# backend/app/services/planner_service.py

from typing import List
import json

from app.schemas import ItineraryCreate
from app.services.gemini_service import GeminiService
from app.models import Landmark


class PlannerService:
    @staticmethod
    def _build_landmark_text(landmarks: List[Landmark]) -> str:
        """
        프롬프트에 넣을 '선택된 랜드마크 목록' 텍스트 생성.
        """
        if not landmarks:
            return "(선택된 랜드마크 없음)"

        lines = []
        for lm in landmarks:
            lines.append(
                f'- id: {lm.id}, name: "{lm.name}", theme: "{lm.theme or "기타"}", '
                f'description: "{(lm.description or "").replace("\"", "\'")}"'
            )
        return "\n".join(lines)

    @staticmethod
    def build_prompt(
        itinerary_in: ItineraryCreate,
        landmarks: List[Landmark],
    ) -> str:
        """
        선택한 국가/지역/테마/랜드마크 정보를 기반으로
        Gemini에 보낼 프롬프트를 만든다.

        ✅ 응답 형식은 반드시 ItineraryDetail JSON 스키마를 따르도록 강제한다.
        """
        country = itinerary_in.country_code
        region = itinerary_in.region_code
        days = itinerary_in.days
        theme = itinerary_in.theme or "일반 여행"

        landmark_text = PlannerService._build_landmark_text(landmarks)

        # ItineraryDetail 스키마 설명
        schema_description = """
다음 JSON 스키마를 반드시 그대로 따르세요.

{
  "overview": {
    "title": "여행 전체를 잘 표현하는 짧은 제목 (문자열)",
    "summary": "전체 일정을 3~5문장 정도로 요약한 설명 (문자열)",
    "highlights": [
      "핵심 하이라이트 1",
      "핵심 하이라이트 2"
    ]
  },
  "daily_plan": [
    {
      "day": 1,
      "title": "Day 1의 한 줄 제목",
      "reason": "이 날의 전체 컨셉/동선을 이렇게 구성한 이유",
      "landmarks": [
        {
          "landmark_id": 123,
          "name": "실제 랜드마크 이름",
          "order": 1,
          "reason": "이 순서/장소를 넣은 이유"
        }
      ]
    }
  ],
  "tips": {
    "packing": [
      "준비물 팁 1",
      "준비물 팁 2"
    ],
    "local": [
      "현지에서 유용한 팁 1",
      "현지에서 유용한 팁 2"
    ]
  }
}
"""

        prompt = f"""
당신은 여행 일정 플래너입니다.
아래 조건에 맞는 상세한 여행 일정을 한국어로 만들어 주세요.

[여행 조건]
- 국가 코드: {country}
- 지역 코드: {region}
- 여행 일수: {days}일
- 테마: {theme}

[사용자가 꼭 방문하고 싶어 하는 랜드마크 목록]
{landmark_text}

[응답 형식 중요]
{schema_description}

[추가 규칙]
1. 응답은 반드시 위에서 정의한 JSON 구조만 포함해야 합니다.
2. 마크다운, 자연어 설명, 주석, ```json 같은 코드는 절대 넣지 마세요.
3. daily_plan의 day는 1부터 {days}까지 채워 주세요.
4. 사용자가 선택한 랜드마크 id는 daily_plan[*].landmarks[*].landmark_id 안에 모두 최소 1번 이상 포함되도록 해주세요.
5. 이동 동선이 너무 비효율적이지 않게 랜드마크 순서를 정리해 주세요.
"""
        return prompt

    @staticmethod
    def _extract_json_text(raw: str) -> str:
        """
        모델이 혹시라도 ```json ... ``` 으로 감싸서 줄 경우를 대비해서
        안쪽의 JSON 텍스트만 뽑아내는 함수.
        """
        text = raw.strip()

        # ```json ... ``` 형태 처리
        if "```" in text:
            # 첫 번째 ```와 마지막 ``` 사이를 추출
            parts = text.split("```")
            # parts 예: ["", "json", "{ ... }", ""]
            candidates = [p for p in parts if "{" in p and "}" in p]
            if candidates:
                text = candidates[0].strip()
                # "json" 같은 언어 태그 제거
                if text.lower().startswith("json"):
                    text = text[4:].strip()

        return text

    @staticmethod
    def generate_itinerary_text(
        itinerary_in: ItineraryCreate,
        landmarks: List[Landmark],
    ) -> tuple[str, str]:
        """
        프롬프트를 만들고, Gemini에게 던져서
        (제목, ItineraryDetail JSON 문자열)을 반환.

        - title: overview.title 에서 추출
        - full_json_text: ai_summary 컬럼에 그대로 저장할 JSON 문자열
        """
        prompt = PlannerService.build_prompt(itinerary_in, landmarks)
        res = GeminiService.get_chat_response(prompt)

        raw_answer = (res.answer or "").strip()
        json_text = PlannerService._extract_json_text(raw_answer)

        title = "여행 일정"

        try:
            data = json.loads(json_text)
            overview = data.get("overview", {})
            if isinstance(overview, dict):
                title_candidate = overview.get("title")
                if isinstance(title_candidate, str) and title_candidate.strip():
                    title = title_candidate.strip()
        except Exception as e:
            print(f"[PlannerService] JSON 파싱 실패, 기본 제목 사용: {e}")

        # title: 문자열, json_text: 나중에 그대로 파싱해서 ItineraryDetail로 씀
        return title, json_text
