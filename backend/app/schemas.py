from pydantic import BaseModel
#거리
class DistanceResponse(BaseModel):
    distance_km: float      # 거리 (km)
    duration_min: float     # 소요 시간 (분)
#날씨
class WeatherResponse(BaseModel):
    temperature: float      # 온도
    status: str             # 간단 상태 (맑음, 흐림, 비 등)
    description: str        # 상세 설명 (예: "활동하기 좋은 날씨입니다")
    icon_type: str          # 프론트에서 아이콘 띄울 때 쓸 구분값 (sunny, cloudy, rainy 등)
# --- Gemini(AI) 관련 스키마 ---
class GeminiRequest(BaseModel):
    prompt: str             # 사용자가 보낼 질문

class GeminiResponse(BaseModel):
    answer: str             # AI의 답변