# backend/app/loader.py
import csv
from pathlib import Path

from sqlalchemy.orm import Session

from app.db.session import SessionLocal
from app import models

# backend/ 기준 경로
BASE_DIR = Path(__file__).resolve().parent.parent
DATA_DIR = BASE_DIR / "data"   # csv 파일들이 위치한 폴더 (Cloud_YCC.csv 등)


def load_landmarks(db: Session):
    csv_path = DATA_DIR / "CloudYCC_landmark.csv"
    print(f"[landmarks] Loading from {csv_path}")

    # ▶ 기존 데이터 지우기 (중복 적재 방지, 개발용)
    db.query(models.Landmark).delete()
    db.commit()

    # ❗ 여기서 csv.open → open 으로 수정
    with open(csv_path, "r", encoding="utf-8-sig") as f:
        reader = csv.DictReader(f)
        for row in reader:
            landmark = models.Landmark(
                country=row["국가"],
                region=row["지역"],
                name=row["랜드마크 이름"],
                description=row["설명"],
                lng=float(row["경도 (Lng)"]),
                lat=float(row["위도 (Lat)"]),
            )
            db.add(landmark)
    db.commit()
    print("[landmarks] Done.")


def load_japan_restaurants(db: Session):
    csv_path = DATA_DIR / "CloudYCC_Japan.csv"
    print(f"[japan_restaurants] Loading from {csv_path}")

    db.query(models.JapanRestaurant).delete()
    db.commit()

    with open(csv_path, "r", encoding="utf-8-sig") as f:
        reader = csv.DictReader(f)
        for row in reader:
            restaurant = models.JapanRestaurant(
                region=row["지역"],
                name=row["식당"],
                rating=float(row["평점"]) if row["평점"] else None,
                lng=float(row["경도"]) if row["경도"] else None,
                lat=float(row["위도"]) if row["위도"] else None,
                signature_menu=row["대표메뉴"],
                opening_hours=row["영업시간"],
            )
            db.add(restaurant)
    db.commit()
    print("[japan_restaurants] Done.")


def load_thailand_activities(db: Session):
    csv_path = DATA_DIR / "CloudYCC_Thailand.csv"
    print(f"[thailand_activities] Loading from {csv_path}")

    db.query(models.ThailandActivity).delete()
    db.commit()

    with open(csv_path, "r", encoding="utf-8-sig") as f:
        reader = csv.DictReader(f)
        for row in reader:
            activity = models.ThailandActivity(
                region=row["지역"],
                name=row["액티비티 이름"],
                description=row["설명"],
            )
            db.add(activity)
    db.commit()
    print("[thailand_activities] Done.")


def load_uk_museums(db: Session):
    csv_path = DATA_DIR / "CloudYCC_UK.csv"
    print(f"[uk_museums] Loading from {csv_path}")

    db.query(models.UkMuseum).delete()
    db.commit()

    with open(csv_path, "r", encoding="utf-8-sig") as f:
        reader = csv.DictReader(f)
        for row in reader:
            museum = models.UkMuseum(
                region=row["지역"],
                name=row["박물관 이름"],
                opening_info=row["운영시간 & 휴무일"],
                description=row["설명"],
            )
            db.add(museum)
    db.commit()
    print("[uk_museums] Done.")


def main():
    db = SessionLocal()
    try:
        load_landmarks(db)
        load_japan_restaurants(db)
        load_thailand_activities(db)
        load_uk_museums(db)
    finally:
        db.close()


if __name__ == "__main__":
    main()
