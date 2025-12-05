# backend/app/services/distance_service.py

import requests
from app.schemas import DistanceResponse


class DistanceService:
    """
    OSRM 기반 거리/시간 계산 서비스.

    - 현재는 두 지점 (start_lat, start_lon) → (end_lat, end_lon) 사이의
      자동차 주행 기준 거리/시간만 계산.
    - 추후에 '랜드마크 리스트'를 받아서 연속 구간 거리 합산 등으로 확장 가능.
    """

    BASE_URL = "http://router.project-osrm.org/route/v1/driving"

    @staticmethod
    def get_distance(
        start_lat: float,
        start_lon: float,
        end_lat: float,
        end_lon: float
    ) -> DistanceResponse:
        # OSRM API 요구사항: {경도},{위도} 순서
        coords = f"{start_lon},{start_lat};{end_lon},{end_lat}"
        url = f"{DistanceService.BASE_URL}/{coords}?overview=false"

        try:
            res = requests.get(url)
            res.raise_for_status()
            data = res.json()

            if data.get("code") == "Ok":
                route = data["routes"][0]
                return DistanceResponse(
                    distance_km=round(route["distance"] / 1000, 2),  # m -> km
                    duration_min=round(route["duration"] / 60, 1),   # sec -> min
                )

            # OSRM 응답이 비정상인 경우
            return DistanceResponse(distance_km=0.0, duration_min=0.0)

        except Exception as e:
            print(f"Distance Error: {e}")
            return DistanceResponse(distance_km=0.0, duration_min=0.0)
