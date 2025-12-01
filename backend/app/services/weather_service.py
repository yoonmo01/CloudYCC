import requests
from app.schemas.weather import WeatherResponse # 위에서 만든 스키마 임포트

class WeatherService:
    BASE_URL = "https://api.open-meteo.com/v1/forecast"

    @staticmethod
    def get_current_weather(lat: float, lon: float) -> WeatherResponse:
        params = {
            "latitude": lat,
            "longitude": lon,
            "current_weather": "true"
        }

        try:
            response = requests.get(WeatherService.BASE_URL, params=params)
            response.raise_for_status() # 200 OK가 아니면 에러 발생
            
            data = response.json()
            current = data.get("current_weather", {})
            
            temp = current.get("temperature", 0.0)
            code = current.get("weathercode", 0)

            # --- 날씨 판별 로직 (이전에 설명한 내용 적용) ---
            status = "알 수 없음"
            description = ""
            icon_type = "unknown"

            if code == 0:
                status = "맑음"
                description = "날씨가 아주 좋습니다! ☀️"
                icon_type = "sunny"
            elif code in [1, 2, 3]:
                status = "흐림"
                description = "구름이 좀 있지만 활동하기 괜찮아요. ☁️"
                icon_type = "cloudy"
            elif code in [45, 48]:
                status = "안개"
                description = "앞이 잘 안 보여요. 조심하세요. 🌫️"
                icon_type = "foggy"
            elif 51 <= code <= 67 or 80 <= code <= 82:
                status = "비"
                description = "우산을 챙기세요. ☔"
                icon_type = "rainy"
            elif 71 <= code <= 77 or 85 <= code <= 86:
                status = "눈"
                description = "눈이 옵니다. 따뜻하게 입으세요. ☃️"
                icon_type = "snowy"
            else:
                status = "악천후"
                description = "날씨가 좋지 않습니다. 실내에 계세요. ⛈️"
                icon_type = "stormy"

            # 스키마에 맞춰서 데이터 리턴
            return WeatherResponse(
                temperature=temp,
                status=status,
                description=description,
                icon_type=icon_type
            )

        except Exception as e:
            print(f"Weather API Error: {e}")
            # 에러 발생 시 기본값 리턴 혹은 에러 처리
            return WeatherResponse(
                temperature=0.0, 
                status="Error", 
                description="날씨 정보를 가져올 수 없습니다.",
                icon_type="error"
            )