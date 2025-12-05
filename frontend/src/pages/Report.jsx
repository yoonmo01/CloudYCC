// src/pages/Report.jsx
import React from "react";
import { useLocation, useNavigate } from "react-router-dom";
import "./Report.css";

import JapanFlag from "../assets/flags/jp.svg";
import UKFlag from "../assets/flags/uk.svg";
import ThailandFlag from "../assets/flags/th.svg";

const COUNTRY_META = {
  japan: { label: "일본", flag: JapanFlag },
  uk: { label: "영국", flag: UKFlag },
  thailand: { label: "태국", flag: ThailandFlag },
};

export default function Report() {
  const location = useLocation();
  const navigate = useNavigate();

  const data = location.state;

  // Main에서 제대로 안 넘어온 경우(직접 주소 입력 등)
  if (!data) {
    return (
      <div className="report-page report-empty">
        <div className="report-empty-card">
          <h2>생성된 여행 일정이 없습니다.</h2>
          <p>메인 화면에서 나라, 지역, 날짜, 랜드마크를 선택한 후 다시 시도해 주세요.</p>
          <button onClick={() => navigate("/main")} className="report-back-btn">
            메인으로 돌아가기
          </button>
        </div>
      </div>
    );
  }

  const {
    countryCode,
    countryLabel,
    regionLabel,
    startDate,
    endDate,
    checklist,
  } = data;

  const meta = COUNTRY_META[countryCode] || {
    label: countryLabel,
    flag: null,
  };

  return (
    <div className="report-page">
      {/* 왼쪽 사이드바 (요약 정보) */}
      <aside className="report-sidebar">
        <div className="report-country-card">
          <div className="report-flag-wrap">
            {meta.flag && (
              <img
                src={meta.flag}
                alt={meta.label}
                className="report-flag-icon"
              />
            )}
          </div>
          <div className="report-country-name">{meta.label}</div>
        </div>

        <div className="report-info-block">
          <div className="report-label">지역</div>
          <div className="report-value">{regionLabel}</div>
        </div>

        <div className="report-info-block">
          <div className="report-label">여행 일정</div>
          <div className="report-value">
            {startDate} ~ {endDate}
          </div>
        </div>

        <div className="report-info-block">
          <div className="report-label">선택한 랜드마크</div>
          <ul className="report-landmark-list">
            {checklist.map((item) => (
              <li key={item.key}>{item.region} - {item.name}</li>
            ))}
          </ul>
        </div>

        <button
          className="report-back-btn"
          onClick={() => navigate("/main")}
        >
          다시 선택하기
        </button>
      </aside>

      {/* 오른쪽 결과 영역 */}
      <section className="report-main">
        <header className="report-header">
          <h1>{regionLabel} 여행 리포트</h1>
          <p>
            {startDate} ~ {endDate} · {meta.label}
          </p>
        </header>

        {/* 간단한 요약 섹션 (나중에 AI 결과 붙일 자리) */}
        <div className="report-section">
          <h2>여행 요약</h2>
          <p className="report-summary-text">
            선택한 랜드마크를 기준으로 1일차~N일차 일정을 구성하고,
            이동 동선과 추천 포인트를 여기에 표시할 예정입니다.
            현재는 프론트엔드 연결 단계라 더미 설명만 보여주고 있어요.
          </p>
        </div>

        {/* 선택 랜드마크 상세 리스트 */}
        <div className="report-section">
          <h2>선택한 랜드마크 목록</h2>
          <div className="report-landmark-grid">
            {checklist.map((item, idx) => (
              <div key={item.key} className="report-landmark-card">
                <div className="report-landmark-title">
                  Day {idx + 1}. {item.name}
                </div>
                <div className="report-landmark-desc">
                  {item.region}에 위치한 랜드마크입니다.  
                  (추후 백엔드/CSV에서 상세 설명과 이동 시간, 추천 동선을 불러와 채울 예정)
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
