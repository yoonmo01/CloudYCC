# backend/app/services/planner_service.py

from typing import List, Dict, Any
import json

from app.schemas import ItineraryCreate
from app.services.gemini_service import GeminiService
from app.models import Landmark


class PlannerService:
    @staticmethod
    def _build_landmark_text(landmarks: List[Landmark]) -> str:
        """
        프롬프트에 넣을 '선택된 랜드마크 목록' 텍스트 생성.
        (사용자가 선택한 랜드마크가 있을 때만 사용)

        Landmark 모델에 theme/description 이 없어도 동작하도록
        id + name 정보만 전달한다.
        """
        if not landmarks:
            return "(선택된 랜드마크 없음)"

        lines = []
        for lm in landmarks:
            lines.append(
                f'- id: {lm.id}, name: "{lm.name}"'
            )
        return "\n".join(lines)

    @staticmethod
    def _ensure_selected_landmarks_in_plan(
        data: Dict[str, Any],
        selected_landmarks: List[Landmark],
    ) -> Dict[str, Any]:
        """
        daily_plan 안에 사용자가 선택한 랜드마크(id)가
        최소 1번씩은 반드시 들어가도록 강제로 보정하는 함수.

        - 이미 해당 landmark_id가 포함되어 있으면 그대로 둔다.
        - 없다면 day 1 ~ N에 골고루 분배해서 landmarks 리스트에 추가한다.
        """
        if not selected_landmarks:
            return data

        daily_plan = data.get("daily_plan")
        if not isinstance(daily_plan, list) or not daily_plan:
            return data

        # 이미 포함된 landmark_id들 수집
        present_ids: set[int] = set()
        for day in daily_plan:
            if not isinstance(day, dict):
                continue
            for lm in day.get("landmarks", []):
                if not isinstance(lm, dict):
                    continue
                lm_id = lm.get("landmark_id")
                if isinstance(lm_id, int):
                    present_ids.add(lm_id)

        day_count = len(daily_plan)
        day_idx = 0  # 분배용 인덱스

        for sel in selected_landmarks:
            # 이미 포함된 선택 랜드마크라면 건너뜀
            if sel.id in present_ids:
                continue

            day = daily_plan[day_idx % day_count]
            day_idx += 1

            if not isinstance(day, dict):
                continue

            landmarks_list = day.setdefault("landmarks", [])
            if not isinstance(landmarks_list, list):
                continue

            # order 계산: 기존 order 중 최대값 + 1
            next_order = 1
            try:
                if landmarks_list:
                    max_order = max(
                        lm.get("order", 0)
                        for lm in landmarks_list
                        if isinstance(lm, dict)
                    )
                    next_order = max_order + 1
            except Exception:
                next_order = len(landmarks_list) + 1

            # 선택 랜드마크 강제 삽입
            landmarks_list.append(
                {
                    "name": sel.name,
                    "order": next_order,
                    "reason": "사용자가 꼭 방문하고 싶어 한 랜드마크라서 일정에 포함했습니다.",
                    "is_user_selected": True,
                    "landmark_id": sel.id,
                }
            )

        return data

    @staticmethod
    def build_prompt(
        itinerary_in: ItineraryCreate,
        landmarks: List[Landmark],
    ) -> str:
        """
        선택한 국가/지역/테마/랜드마크 정보를 기반으로
        Gemini에 보낼 프롬프트를 만든다.

        ✅ 응답 형식은 반드시 ItineraryDetail JSON 스키마를 따르도록 강제한다.
        ✅ 랜드마크 선택 여부에 따라 두 가지 모드로 동작한다.
           - 선택된 랜드마크 O: 그 랜드마크들은 반드시 포함 + is_user_selected = true + landmark_id 포함
           - 선택된 랜드마크 X: 모델이 랜드마크를 전부 추천 + is_user_selected = false + landmark_id 필드 없음
        """
        country = itinerary_in.country_code
        region = itinerary_in.region_code
        days = itinerary_in.days
        theme = itinerary_in.theme or "일반 여행"

        has_selected_landmarks = len(landmarks) > 0
        landmark_text = PlannerService._build_landmark_text(landmarks)

        # ✅ JSON 구조를 매우 명확하게 정의 (유효한 JSON 예시 + 설명)
        schema_description = """
반드시 아래 구조의 JSON 한 개만 생성하세요. (키 이름과 계층 구조를 정확히 지키세요.)

{
  "overview": {
    "title": "문자열",
    "summary": "문자열",
    "highlights": ["문자열", "문자열"]
  },
  "daily_plan": [
    {
      "day": 1,
      "title": "문자열",
      "reason": "문자열",
      "landmarks": [
        {
          "name": "문자열",
          "order": 1,
          "reason": "문자열",
          "is_user_selected": true,
          "landmark_id": 123
        }
      ]
    }
  ],
  "tips": {
    "packing": ["문자열", "문자열"],
    "local": ["문자열", "문자열"]
  }
}

중요한 규칙:
- 최상위 키는 반드시 overview, daily_plan, tips 세 개만 있어야 합니다.
- daily_plan은 배열이며, 각 원소는 day, title, reason, landmarks를 가진 객체입니다.
- tips는 daily_plan 바깥, overview와 같은 최상위 레벨에 있어야 합니다.
- daily_plan 배열 안에는 "tips" 같은 다른 키를 절대 넣지 마세요.
- landmarks 배열의 각 원소는 name, order, reason, is_user_selected는 항상 포함해야 합니다.
- landmark_id는 "선택된 랜드마크"에만 포함되는 선택적(optional) 키입니다.
"""

        if has_selected_landmarks:
            # ✅ 사용자가 일부 랜드마크를 선택한 경우
            mode_block = f"""
[모드 정보]
- 사용자가 일부 랜드마크를 직접 선택한 상태입니다.

[사용자가 꼭 방문하고 싶어 하는 랜드마크 목록]
{landmark_text}

[모드별 추가 규칙]
1. 위의 '사용자가 선택한 랜드마크 목록'에 있는 랜드마크(id: 값 포함)는 여행 일정에 반드시 최소 1번 이상 등장해야 합니다.
2. 사용자가 선택한 랜드마크를 daily_plan[*].landmarks[*]에 넣을 때는:
   - is_user_selected: 반드시 true
   - landmark_id: 해당 id 값을 그대로 넣어야 합니다. (예: id가 35이면 "landmark_id": 35)
3. 사용자가 선택하지 않은 랜드마크(=AI가 새로 추천하는 랜드마크)는:
   - is_user_selected: 반드시 false
   - landmark_id 키를 절대 포함하지 마세요. (즉, "landmark_id": ... 를 쓰지 말 것)
4. 선택된 랜드마크와 AI 추천 랜드마크를 적절히 섞어서 Day 1 ~ Day {days} 전체 동선이 자연스럽게 이어지도록 구성하세요.
5. Day 1부터 Day {days}까지 모든 날짜에 대해 2~4개의 landmarks를 채워주세요.
"""
        else:
            # ✅ 사용자가 아무 랜드마크도 선택하지 않은 경우
            mode_block = f"""
[모드 정보]
- 사용자가 랜드마크를 직접 선택하지 않았습니다.

[모드별 추가 규칙]
1. 국가({country}), 지역({region}), 테마({theme})에 어울리는 대표적인 랜드마크/활동/맛집 등을 직접 추천하여 Day 1 ~ Day {days} 일정으로 구성하세요.
2. 이 모드에서는 모든 landmarks가 AI 추천입니다.
   - is_user_selected: 반드시 false
   - landmark_id 키를 절대 포함하지 마세요.
3. Day 1부터 Day {days}까지 각 날짜마다 2~4개의 landmarks를 배치하세요.
4. 이동 동선이 너무 비효율적이지 않도록 인접한 지역의 장소들을 순서대로 배치하세요.
"""

        prompt = f"""
당신은 여행 일정 플래너입니다.
아래 조건에 맞는 상세한 여행 일정을 한국어로 만들어 주세요.

[여행 조건]
- 국가 코드: {country}
- 지역 코드: {region}
- 여행 일수: {days}일
- 테마: {theme}

{mode_block}

[응답 형식 중요]
{schema_description}

[공통 추가 규칙]
1. 응답은 반드시 위에서 정의한 JSON 구조 한 개만 포함해야 합니다.
2. 마크다운, 자연어 설명, 주석, ```json 같은 코드를 절대 넣지 마세요.
3. daily_plan의 day 값은 1부터 {days}까지 연속된 정수여야 합니다.
4. overview, daily_plan, tips는 모두 반드시 포함해야 합니다.
5. 다시 한 번 강조합니다:
   - 선택된 랜드마크: is_user_selected = true, landmark_id 포함
   - AI 추천 랜드마크: is_user_selected = false, landmark_id 필드를 절대 생성하지 말 것
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

            # ✅ 선택 랜드마크가 일정에 반드시 포함되도록 후처리
            data = PlannerService._ensure_selected_landmarks_in_plan(
                data=data,
                selected_landmarks=landmarks,
            )

            # ✅ overview.title 기준으로 제목 추출
            overview = data.get("overview", {})
            if isinstance(overview, dict):
                title_candidate = overview.get("title")
                if isinstance(title_candidate, str) and title_candidate.strip():
                    title = title_candidate.strip()

            # ✅ 보정된 데이터를 다시 JSON 문자열로 직렬화
            json_text = json.dumps(data, ensure_ascii=False, indent=2)

        except Exception as e:
            print(f"[PlannerService] JSON 파싱 실패, 기본 제목 사용: {e}")

        # title: 문자열, json_text: 나중에 그대로 파싱해서 ItineraryDetail로 씀
        return title, json_text
