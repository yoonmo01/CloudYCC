import google.generativeai as genai
from app.schemas import GeminiResponse

class GeminiService:
    API_KEY = "AIzaSyDOi4tp4nkTApsGshPyJDhEGmpUPNiYHRI" 

    @staticmethod
    def get_chat_response(prompt: str) -> GeminiResponse:
        try:
            # 1. API 키 설정
            genai.configure(api_key=GeminiService.API_KEY)
            
            # 2. 모델 설정 (gemini-1.5-flash 가 빠르고 무료로 쓰기 좋습니다)
            model = genai.GenerativeModel('gemini-1.5-flash')
            
            # 3. 질문 보내기
            response = model.generate_content(prompt)
            
            # 4. 답변 텍스트만 추출해서 반환
            return GeminiResponse(answer=response.text)

        except Exception as e:
            print(f"Gemini Error: {e}")
            return GeminiResponse(answer="죄송합니다. AI가 답변을 생성하는 중 오류가 발생했습니다.")