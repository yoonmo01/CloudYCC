# backend/app/services/csv_service.py
from __future__ import annotations

from io import StringIO
import csv
from typing import List

from app import models
from app.schemas import (
    ItineraryDetail,
    JapanRestaurantOut,
    ThailandActivityOut,
    UkMuseumOut,
)


class CSVService:
    @staticmethod
    def itinerary_to_csv_string(itinerary: models.Itinerary) -> str:
        """
        (구 버전) ai_summary 전체를 한 줄씩 쪼개서 CSV로 만드는 간단 버전.
        혹시 다른 곳에서 쓰고 있다면 유지.
        """
        output = StringIO()
        writer = csv.writer(output)

        writer.writerow(["line_no", "text"])
        text = (itinerary.ai_summary or "").replace("\r\n", "\n")
        for idx, line in enumerate(text.split("\n"), start=1):
            writer.writerow([idx, line])

        return output.getvalue()

    @staticmethod
    def itinerary_report_to_csv_string(
        itinerary: models.Itinerary,
        detail: ItineraryDetail,
        restaurants: List[JapanRestaurantOut],
        activities: List[ThailandActivityOut],
        museums: List[UkMuseumOut],
    ) -> str:
        """
        리포트 페이지에 나오는 모든 내용:
        - 기본 메타 정보
        - overview (title / summary / highlights)
        - daily_plan (day / title / reason / landmarks)
        - tips (packing / local)
        - 나라별 추가 추천(맛집 / 액티비티 / 박물관)
        을 한 개의 CSV로 평탄화해서 내려준다.
        """

        output = StringIO()
        writer = csv.writer(output)

        # 공통 헤더 (섹션/타입으로 구분)
        writer.writerow(
            [
                "section",      # meta / overview / daily / tips / extra
                "sub_section",  # summary / highlight / day / landmark / packing / local / restaurant ...
                "day",          # 일자 (daily / landmark)
                "name",         # 제목 / 장소명
                "type",         # 선택 랜드마크 / 추천 장소 / 맛집 / 액티비티 / 박물관 등
                "description",  # 본문/설명
                "extra",        # 기타 정보(추가 텍스트)
            ]
        )

        # 1) 메타 정보
        meta_desc = f"{itinerary.start_date}부터 {itinerary.days}일, 테마: {itinerary.theme or ''}"
        meta_extra = f"country={itinerary.country_code}, region={itinerary.region_code}"
        writer.writerow(
            [
                "meta",
                "basic",
                "",
                itinerary.title or "여행 일정",
                "",
                meta_desc,
                meta_extra,
            ]
        )

        # 2) overview
        ov = detail.overview
        if ov:
            # overview summary
            writer.writerow(
                [
                    "overview",
                    "summary",
                    "",
                    ov.title,
                    "",
                    ov.summary,
                    "",
                ]
            )

            # overview highlights
            if ov.highlights:
                for idx, h in enumerate(ov.highlights, start=1):
                    writer.writerow(
                        [
                            "overview",
                            "highlight",
                            "",
                            f"하이라이트 {idx}",
                            "",
                            h,
                            "",
                        ]
                    )

        # 3) daily_plan + landmarks
        for day in detail.daily_plan or []:
            # day 요약
            writer.writerow(
                [
                    "daily",
                    "day",
                    day.day,
                    day.title,
                    "",
                    day.reason,
                    "",
                ]
            )

            # day 안의 landmarks
            for lm in day.landmarks or []:
                lm_type = "선택 랜드마크" if lm.is_user_selected else "추천 장소"
                extra = ""
                if getattr(lm, "landmark_id", None) is not None:
                    extra = f"landmark_id={lm.landmark_id}"

                writer.writerow(
                    [
                        "daily",
                        "landmark",
                        day.day,
                        lm.name,
                        lm_type,
                        lm.reason,
                        extra,
                    ]
                )

        # 4) tips
        tips = detail.tips
        if tips:
            for t in (tips.packing or []):
                writer.writerow(
                    [
                        "tips",
                        "packing",
                        "",
                        "짐 챙기기",
                        "",
                        t,
                        "",
                    ]
                )
            for t in (tips.local or []):
                writer.writerow(
                    [
                        "tips",
                        "local",
                        "",
                        "현지 이용",
                        "",
                        t,
                        "",
                    ]
                )

        # 5) 나라별 추가 추천
        # --- 일본: 맛집 (번호,지역,식당,평점,경도,위도,대표메뉴,영업시간) ---
        for r in restaurants or []:
            # 스키마 예상 필드: id, region, name, rating, lng, lat,
            #                   signature_menu, opening_hours
            rating = getattr(r, "rating", None)
            signature_menu = getattr(r, "signature_menu", None)
            opening_hours = getattr(r, "opening_hours", None)

            extra_parts = []
            if signature_menu:
                extra_parts.append(f"대표메뉴: {signature_menu}")
            if opening_hours:
                extra_parts.append(f"영업시간: {opening_hours}")
            extra_str = " / ".join(extra_parts)

            type_str = "맛집"
            if rating is not None:
                type_str = f"맛집 (⭐ {rating})"

            writer.writerow(
                [
                    "extra",
                    "restaurant",
                    "",
                    r.name,
                    type_str,
                    "",          # 설명 컬럼은 비워두고
                    extra_str,   # 대표 메뉴 / 영업시간을 extra로
                ]
            )

        # --- 태국: 액티비티 (번호,지역,액티비티 이름,설명) ---
        for a in activities or []:
            description = getattr(a, "description", "") or ""

            writer.writerow(
                [
                    "extra",
                    "activity",
                    "",
                    a.name,
                    "액티비티",
                    description,
                    a.region,  # extra에는 지역 정도만 남겨둠
                ]
            )

        # --- 영국: 박물관 (번호,지역,박물관 이름,운영시간 & 휴무일,설명) ---
        for m in museums or []:
            opening_hours = getattr(m, "opening_hours", None)
            description = getattr(m, "description", "") or ""

            extra_parts = []
            if opening_hours:
                extra_parts.append(f"운영시간 & 휴무일: {opening_hours}")
            extra_str = " | ".join(extra_parts) if extra_parts else ""

            writer.writerow(
                [
                    "extra",
                    "museum",
                    "",
                    m.name,
                    "박물관",
                    description,
                    extra_str,
                ]
            )

        return output.getvalue()
