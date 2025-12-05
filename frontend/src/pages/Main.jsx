// src/pages/Main.jsx
import React, { useState } from "react";
import { useSearchParams } from "react-router-dom";
import "./Main.css";

// 홈에서 쓰던 국기 그대로 가져오기
import JapanFlag from "../assets/flags/jp.svg";
import UKFlag from "../assets/flags/uk.svg";
import ThailandFlag from "../assets/flags/th.svg";

const COUNTRY_META = {
  japan: { label: "일본", flag: JapanFlag },
  uk: { label: "영국", flag: UKFlag },
  thailand: { label: "태국", flag: ThailandFlag },
};

export default function Main() {
  const [searchParams] = useSearchParams();
  const countryCode = searchParams.get("country") || "japan";
  const countryMeta = COUNTRY_META[countryCode] || COUNTRY_META.japan;

  // 오른쪽 상세 패널 열림 상태
  const [isDetailOpen, setIsDetailOpen] = useState(false);

  const toggleDetail = () => {
    setIsDetailOpen((prev) => !prev);
  };

  return (
    <div className="main-page">
      {/* 왼쪽 사이드바 */}
      <aside className="main-sidebar">
        {/* 국기 + 나라명 박스 */}
        <div className="sidebar-card country-card">
          <div className="country-flag-wrap">
            <img
              src={countryMeta.flag}
              alt={countryMeta.label}
              className="country-flag-icon"
            />
          </div>
          <div className="country-name">{countryMeta.label}</div>
        </div>

        {/* 지역명 (지금은 버튼, 나중에 지역 선택 로직 연결) */}
        <button className="sidebar-button">지역명</button>

        {/* 출발일 ~ 도착일 (개인이 설정하는 영역, 나중에 date picker 연결 예정) */}
        <button className="sidebar-button date-button">
          출발일 ~ 도착일
        </button>

        {/* 체크리스트 영역 */}
        <div className="sidebar-card checklist-card">
          <div className="checklist-title">체크리스트</div>
          <ul className="checklist-list">
            <li></li>
            <li></li>
            <li></li>
            <li></li>
            <li></li>
            <li></li>
          </ul>
        </div>

        {/* 생성하기 버튼 */}
        <button className="generate-button">생성하기</button>
      </aside>

      {/* 오른쪽 지도 + 상세 패널 영역 */}
      <section className="main-map-area">
        {/* 지도 자리(지금은 placeholder) */}
        <div className="map-placeholder">
          <span className="map-placeholder-text">지도 영역 (추후 구현)</span>
        </div>

        {/* 🔸 오른쪽 작은 바 (토글 버튼) - 패널이 열려도 항상 보이게 */}
        <button
          className={`detail-toggle ${isDetailOpen ? "open" : ""}`}
          onClick={toggleDetail}
        >
          {isDetailOpen ? "▶" : "◀"}
        </button>

        {/* 🔸 상세 패널 */}
        {isDetailOpen && (
          <div className="detail-panel">
            <div className="detail-top">
              <div className="detail-photo-box">사진</div>
              <div className="detail-name-box">이름</div>
            </div>
            <div className="detail-info-box">정보</div>
          </div>
        )}
      </section>
    </div>
  );
}
