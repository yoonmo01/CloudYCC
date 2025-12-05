# backend/app/services/gemini_service.py
import google.generativeai as genai

from app.schemas import GeminiResponse
from app.core.config import settings


class GeminiService:
    @staticmethod
    def get_chat_response(prompt: str) -> GeminiResponse:
        try:
            # 1. API 키 설정 (.env의 GOOGLE_API_KEY 사용)
            if not settings.google_api_key:
                # 키가 없으면 바로 에러 메시지 리턴
                return GeminiResponse(
                    answer="서버에 GOOGLE_API_KEY가 설정되어 있지 않아 AI 응답을 생성할 수 없습니다."
                )

            genai.configure(api_key=settings.google_api_key)

            # 2. 모델 설정
            model = genai.GenerativeModel("gemini-2.5-flash")

            # 3. 질문 보내기
            response = model.generate_content(prompt)

            # 4. 답변 텍스트만 추출해서 반환
            return GeminiResponse(answer=response.text)

        except Exception as e:
            print(f"Gemini Error: {e}")
            return GeminiResponse(answer="죄송합니다. AI가 답변을 생성하는 중 오류가 발생했습니다.")
