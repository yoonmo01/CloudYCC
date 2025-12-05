# backend/app/services/weather_service.py

import requests
from datetime import date, timedelta

from app.schemas import (
    WeatherResponse,
    WeatherDaily,
    WeatherForecastResponse,
)


class WeatherService:
    BASE_URL = "https://api.open-meteo.com/v1/forecast"

    @staticmethod
    def _code_to_status_icon(code: int) -> tuple[str, str]:
        """
        Open-Meteo weathercode → (status, icon_type)
        """
        if code == 0:
            return "맑음", "sunny"
        elif code in [1, 2, 3]:
            return "흐림", "cloudy"
        elif code in [45, 48]:
            return "안개", "foggy"
        elif 51 <= code <= 67 or 80 <= code <= 82:
            return "비", "rainy"
        elif 71 <= code <= 77 or 85 <= code <= 86:
            return "눈", "snowy"
        else:
            return "악천후", "stormy"

    @staticmethod
    def get_current_weather(lat: float, lon: float) -> WeatherResponse:
        """
        위도/경도 기준 현재 날씨만 가져오는 간단 버전
        """
        params = {
            "latitude": lat,
            "longitude": lon,
            "current_weather": "true",
        }

        try:
            response = requests.get(WeatherService.BASE_URL, params=params)
            response.raise_for_status()

            data = response.json()
            current = data.get("current_weather", {})

            temp = current.get("temperature", 0.0)
            code = current.get("weathercode", 0)

            # 공통 날씨 코드 -> 상태/아이콘 변환
            status, icon_type = WeatherService._code_to_status_icon(code)

            description_map = {
                "sunny": "날씨가 아주 좋습니다! ☀️",
                "cloudy": "구름이 좀 있지만 활동하기 괜찮아요. ☁️",
                "foggy": "앞이 잘 안 보여요. 조심하세요. 🌫️",
                "rainy": "우산을 챙기세요. ☔",
                "snowy": "눈이 옵니다. 따뜻하게 입으세요. ☃️",
                "stormy": "날씨가 좋지 않습니다. 실내에 계세요. ⛈️",
            }
            description = description_map.get(icon_type, "날씨 정보를 확인했습니다.")

            return WeatherResponse(
                temperature=temp,
                status=status,
                description=description,
                icon_type=icon_type,
            )

        except Exception as e:
            print(f"Weather API Error: {e}")
            return WeatherResponse(
                temperature=0.0,
                status="Error",
                description="날씨 정보를 가져올 수 없습니다.",
                icon_type="error",
            )

    @staticmethod
    def get_forecast(
        lat: float,
        lon: float,
        start_date: date,
        days: int,
    ) -> WeatherForecastResponse:
        """
        일정 시작일(start_date)부터 days 일수만큼
        일별(최고/최저기온 + 날씨상태) 예보 가져오기.
        """
        # 예: start=2025-02-10, days=3 → 10, 11, 12일까지
        end_date = start_date + timedelta(days=days - 1)

        params = {
            "latitude": lat,
            "longitude": lon,
            "timezone": "auto",
            "daily": "weathercode,temperature_2m_max,temperature_2m_min",
            "start_date": start_date.isoformat(),
            "end_date": end_date.isoformat(),
        }

        try:
            resp = requests.get(WeatherService.BASE_URL, params=params)
            resp.raise_for_status()

            data = resp.json()
            daily = data.get("daily", {})

            dates = daily.get("time", [])
            max_temps = daily.get("temperature_2m_max", [])
            min_temps = daily.get("temperature_2m_min", [])
            codes = daily.get("weathercode", [])

            items: list[WeatherDaily] = []

            for d, tmax, tmin, code in zip(dates, max_temps, min_temps, codes):
                status, icon = WeatherService._code_to_status_icon(int(code))

                items.append(
                    WeatherDaily(
                        date=date.fromisoformat(d),
                        temperature_max=float(tmax),
                        temperature_min=float(tmin),
                        status=status,
                        icon_type=icon,
                    )
                )

            return WeatherForecastResponse(
                lat=lat,
                lon=lon,
                start_date=start_date,
                end_date=end_date,
                days=len(items),
                daily=items,
            )

        except Exception as e:
            print(f"Weather Forecast API Error: {e}")
            return WeatherForecastResponse(
                lat=lat,
                lon=lon,
                start_date=start_date,
                days=0,
                daily=[],
            )
