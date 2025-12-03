from fastapi import APIRouter
from app.services.gemini_service import GeminiService
from app.schemas import GeminiRequest, GeminiResponse

router = APIRouter()

# 주소: POST /api/v1/gemini/chat
@router.post("/chat", response_model=GeminiResponse)
def chat_with_gemini(request: GeminiRequest):
    """
    Gemini에게 질문을 보내고 답변을 받습니다.
    """
    return GeminiService.get_chat_response(request.prompt)