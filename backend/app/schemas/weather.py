from pydantic import BaseModel

# 날씨 정보를 담을 데이터 구조 (DTO)
class WeatherResponse(BaseModel):
    temperature: float      # 온도
    status: str             # 간단 상태 (맑음, 흐림, 비 등)
    description: str        # 상세 설명 (예: "활동하기 좋은 날씨입니다")
    icon_type: str          # 프론트에서 아이콘 띄울 때 쓸 구분값 (sunny, cloudy, rainy 등)