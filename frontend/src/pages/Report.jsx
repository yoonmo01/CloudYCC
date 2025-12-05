// src/pages/Report.jsx
import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import "./Report.css";

import JapanFlag from "../assets/flags/jp.svg";
import UKFlag from "../assets/flags/uk.svg";
import ThailandFlag from "../assets/flags/th.svg";

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:8000";

const COUNTRY_META = {
  JP: { label: "일본", flag: JapanFlag },
  UK: { label: "영국", flag: UKFlag },
  TH: { label: "태국", flag: ThailandFlag },
  // 예전 코드 호환
  japan: { label: "일본", flag: JapanFlag },
  uk: { label: "영국", flag: UKFlag },
  thailand: { label: "태국", flag: ThailandFlag },
};

export default function Report() {
  const location = useLocation();
  const navigate = useNavigate();

  const data = location.state;

  const [reportData, setReportData] = useState(null);
  const [reportLoading, setReportLoading] = useState(false);
  const [reportError, setReportError] = useState("");

  const itineraryId = data?.itineraryId ?? null;

  // Main에서 제대로 안 넘어온 경우
  if (!data) {
    return (
      <div className="report-page report-empty">
        <div className="report-empty-card">
          <h2>생성된 여행 일정이 없습니다.</h2>
          <p>
            메인 화면에서 나라, 지역, 날짜, 랜드마크를 선택한 후 다시 시도해
            주세요.
          </p>
          <button onClick={() => navigate("/")} className="report-back-btn">
            처음으로 돌아가기
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

  useEffect(() => {
    if (!itineraryId) return;

    const fetchReport = async () => {
      try {
        setReportLoading(true);
        setReportError("");

        const res = await fetch(
          `${API_BASE_URL}/api/itineraries/${itineraryId}/report`
        );

        if (!res.ok) {
          console.error("Failed to fetch itinerary report", res.status);
          setReportError("AI 리포트 정보를 가져오지 못했습니다.");
          return;
        }

        const json = await res.json(); // ItineraryReportResponse
        setReportData(json);
      } catch (e) {
        console.error("Error fetching itinerary report", e);
        setReportError("AI 리포트 정보를 가져오는 중 오류가 발생했습니다.");
      } finally {
        setReportLoading(false);
      }
    };

    fetchReport();
  }, [itineraryId]);

  const detail = reportData?.detail || null;
  const overview = detail?.overview || null;
  const dailyPlan = detail?.daily_plan || [];
  const tips = detail?.tips || {};

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
              <li key={item.key}>
                {item.region} - {item.name}
              </li>
            ))}
          </ul>
        </div>

        <button className="report-back-btn" onClick={() => navigate("/")}>
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

        {/* ✅ 여행 요약 섹션 (AI overview 있으면 그걸 쓰고, 없으면 기존 더미) */}
        <div className="report-section">
          <h2>여행 요약</h2>

          {reportLoading && (
            <p className="report-summary-text">AI 여행 요약을 불러오는 중입니다...</p>
          )}

          {reportError && (
            <p className="report-summary-text">{reportError}</p>
          )}

          {!reportLoading && !reportError && overview && (
            <>
              <div
                className="report-overview-title"
                style={{ fontWeight: 600, marginBottom: "8px" }}
              >
                {overview.title}
              </div>
              <p className="report-summary-text">{overview.summary}</p>

              {overview.highlights && overview.highlights.length > 0 && (
                <ul
                  style={{
                    marginTop: "8px",
                    paddingLeft: "20px",
                    fontSize: "13px",
                    lineHeight: 1.5,
                  }}
                >
                  {overview.highlights.map((h, idx) => (
                    <li key={idx}>{h}</li>
                  ))}
                </ul>
              )}
            </>
          )}

          {!reportLoading && !reportError && !overview && (
            <p className="report-summary-text">
              선택한 랜드마크를 기준으로 1일차~N일차 일정을 구성하고,
              이동 동선과 추천 포인트를 여기에 표시할 예정입니다.
              현재는 프론트엔드 연결 단계라 더미 설명만 보여주고 있어요.
            </p>
          )}
        </div>

        {/* ✅ 일자별 상세 일정 (daily_plan) */}
        {dailyPlan.length > 0 && (
          <div className="report-section">
            <h2>일자별 상세 일정</h2>
            <div className="report-landmark-grid">
              {dailyPlan.map((day) => (
                <div key={day.day} className="report-landmark-card">
                  <div className="report-landmark-title">
                    Day {day.day}. {day.title}
                  </div>
                  <div
                    className="report-landmark-desc"
                    style={{ marginBottom: "8px" }}
                  >
                    {day.reason}
                  </div>

                  {day.landmarks && day.landmarks.length > 0 && (
                    <ul
                      style={{
                        margin: 0,
                        paddingLeft: "18px",
                        fontSize: "12px",
                        lineHeight: 1.5,
                      }}
                    >
                      {day.landmarks.map((lm) => (
                        <li key={`${day.day}-${lm.name}`}>
                          <span style={{ fontWeight: 600 }}>{lm.name}</span>{" "}
                          {lm.is_user_selected && (
                            <span
                              style={{
                                fontSize: "11px",
                                marginLeft: "6px",
                                padding: "2px 6px",
                                borderRadius: "999px",
                                backgroundColor: "#ecfdf3",
                                color: "#166534",
                              }}
                            >
                              선택 랜드마크
                            </span>
                          )}
                          {!lm.is_user_selected && (
                            <span
                              style={{
                                fontSize: "11px",
                                marginLeft: "6px",
                                padding: "2px 6px",
                                borderRadius: "999px",
                                backgroundColor: "#eff6ff",
                                color: "#1d4ed8",
                              }}
                            >
                              추천 장소
                            </span>
                          )}
                          <div style={{ marginTop: "2px" }}>{lm.reason}</div>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ✅ 여행 팁 섹션 */}
        {(tips.packing?.length || tips.local?.length) && (
          <div className="report-section">
            <h2>여행 팁</h2>
            <div className="report-landmark-grid">
              {tips.packing && tips.packing.length > 0 && (
                <div className="report-landmark-card">
                  <div className="report-landmark-title">짐 챙기기 팁</div>
                  <ul
                    style={{
                      marginTop: "6px",
                      paddingLeft: "18px",
                      fontSize: "12px",
                      lineHeight: 1.5,
                    }}
                  >
                    {tips.packing.map((t, idx) => (
                      <li key={idx}>{t}</li>
                    ))}
                  </ul>
                </div>
              )}

              {tips.local && tips.local.length > 0 && (
                <div className="report-landmark-card">
                  <div className="report-landmark-title">현지 이용 팁</div>
                  <ul
                    style={{
                      marginTop: "6px",
                      paddingLeft: "18px",
                      fontSize: "12px",
                      lineHeight: 1.5,
                    }}
                  >
                    {tips.local.map((t, idx) => (
                      <li key={idx}>{t}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        )}

        {/* 선택 랜드마크 상세 리스트 (그대로 유지) */}
        <div className="report-section">
          <h2>선택한 랜드마크 목록</h2>
          <div className="report-landmark-grid">
            {checklist.map((item, idx) => (
              <div key={item.key} className="report-landmark-card">
                <div className="report-landmark-title">
                  Day {idx + 1}. {item.name}
                </div>
                <div className="report-landmark-desc">
                  {item.region}에 위치한 랜드마크입니다. (추후 백엔드/CSV에서
                  상세 설명과 이동 시간, 추천 동선을 불러와 채울 예정)
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
