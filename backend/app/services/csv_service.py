# backend/app/services/csv_service.py
import csv
import io

from app.models import Itinerary


class CSVService:
    @staticmethod
    def itinerary_to_csv_string(itinerary: Itinerary) -> str:
        """
        Itinerary.ai_summary(텍스트)를 줄 단위로 쪼개서
        간단한 CSV 문자열로 변환한다.

        컬럼: index, line
        """
        output = io.StringIO()
        writer = csv.writer(output)

        writer.writerow(["index", "line"])

        lines = [line for line in itinerary.ai_summary.splitlines() if line.strip()]
        for idx, line in enumerate(lines, start=1):
            writer.writerow([idx, line])

        return output.getvalue()
