# CloudYCC
# TripTailor
* 여행 일정을 “재단사처럼 맞춤 제작”


```
.venv/Scripts.activate
pip install -r requirements.txt
cd CloudYCC
```

DB : PostgreSQL
backend: Fastapi
Front: React

## GET /api/landmarks

선택한 국가에 대한 랜드마크 목록을 반환하는 API.

### 요청

- Method: GET
- URL: `/api/landmarks`
- Query Params:
  - `country`: 국가 코드 (예: `JP`, `UK`, `TH`)

예시:

- `/api/landmarks?country=UK`
- `/api/landmarks?country=JP`

### 응답 (200 OK)

```json
{
  "country": "UK",
  "landmarks": [
    {
      "id": 1,
      "name": "빅벤",
      "lat": 51.5007,
      "lng": -0.1246,
      "description": "런던의 상징적인 시계탑."
    },
    {
      "id": 2,
      "name": "타워 브리지",
      "lat": 51.5055,
      "lng": -0.0754,
      "description": "템즈강을 가로지르는 대표적인 다리."
    }
  ]
}


