import requests
from app.schemas.distance import DistanceResponse

class DistanceService:
    BASE_URL = "http://router.project-osrm.org/route/v1/driving"

    @staticmethod
    def get_distance(start_lat: float, start_lon: float, end_lat: float, end_lon: float) -> DistanceResponse:
        # OSRM API 요구사항: {경도},{위도} 순서
        coords = f"{start_lon},{start_lat};{end_lon},{end_lat}"
        url = f"{DistanceService.BASE_URL}/{coords}?overview=false"

        try:
            res = requests.get(url)
            data = res.json()
            
            if data.get("code") == "Ok":
                route = data["routes"][0]
                return DistanceResponse(
                    distance_km=round(route["distance"] / 1000, 2),  # m -> km
                    duration_min=round(route["duration"] / 60, 1)    # sec -> min
                )
            return DistanceResponse(distance_km=0, duration_min=0)
            
        except Exception as e:
            print(f"Distance Error: {e}")
            return DistanceResponse(distance_km=0, duration_min=0)