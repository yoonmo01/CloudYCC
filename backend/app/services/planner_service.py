# backend/app/services/planner_service.py
from typing import List

from app.schemas import ItineraryCreate
from app.services.gemini_service import GeminiService
from app.models import Landmark


class PlannerService:
    @staticmethod
    def build_prompt(
        itinerary_in: ItineraryCreate,
        landmarks: List[Landmark],
    ) -> str:
        """
        선택한 국가/지역/테마/랜드마크 정보를 기반으로
        Gemini에 보낼 프롬프트를 만든다.
        """
        country = itinerary_in.country_code
        region = itinerary_in.region_code
        days = itinerary_in.days
        theme = itinerary_in.theme or "일반 여행"

        landmark_text = ""
        if landmarks:
            lines = []
            for lm in landmarks:
                lines.append(
                    f"- {lm.name} ({lm.theme or '기타'}) : {lm.description or ''}"
                )
            landmark_text = "\n".join(lines)
        else:
            landmark_text = "(선택된 랜드마크 없음)"

        prompt = f"""
당신은 여행 일정 플래너입니다.
아래 조건에 맞는 상세한 여행 일정을 한국어로 만들어 주세요.

[여행 조건]
- 국가: {country}
- 지역: {region}
- 여행 일수: {days}일
- 테마: {theme}

[사용자가 꼭 방문하고 싶어 하는 랜드마크 목록]
{landmark_text}

[요구사항]
1. 일자별로 Day 1, Day 2 형식으로 구분해서 작성해 주세요.
2. 각 Day마다 시간대(예: 오전/오후/저녁)를 나눠 추천 코스를 제안해 주세요.
3. 선택된 랜드마크는 일정 안에 꼭 포함해 주세요.
4. 이동 동선이 너무 비효율적이지 않게 구성해 주세요.
5. 마지막에 전체 여행을 한 줄로 요약한 간단한 제목도 함께 제안해 주세요.
"""
        return prompt

    @staticmethod
    def generate_itinerary_text(
        itinerary_in: ItineraryCreate,
        landmarks: List[Landmark],
    ) -> tuple[str, str]:
        """
        프롬프트를 만들고, Gemini에게 던져서
        (제목, 전체 일정 텍스트)를 반환.
        """
        prompt = PlannerService.build_prompt(itinerary_in, landmarks)
        res = GeminiService.get_chat_response(prompt)

        full_text = res.answer or ""

        # 맨 마지막 줄에 제목을 붙여달라고 했으니,
        # 임시로 "제목:" 같은 키워드를 찾아서 title 추출하는 방식으로.
        lines = [line.strip() for line in full_text.splitlines() if line.strip()]
        title = ""
        for line in reversed(lines):
            if "제목" in line or "여행 제목" in line:
                title = line
                break

        if not title:
            # 없으면 첫 줄을 그냥 제목 비슷하게 사용
            title = lines[0] if lines else "여행 일정"

        return title, full_text
