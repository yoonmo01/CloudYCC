// src/pages/Main.jsx
import React, { useState, useEffect, useMemo } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import "./Main.css";

import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

import JapanFlag from "../assets/flags/jp.svg";
import UKFlag from "../assets/flags/uk.svg";
import ThailandFlag from "../assets/flags/th.svg";

// ✅ S3 이미지 베이스 URL
import { S3_LANDMARK_BASE_URL } from "../config/s3";

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:8000";

/** 🔥 PNG 대신 CSS로 그리는 동그라미 마커(icon 이미지 문제 완전 제거) */
const defaultMarkerIcon = L.divIcon({
  className: "custom-map-marker",
  iconSize: [18, 18],
  iconAnchor: [9, 9],
  popupAnchor: [0, -9],
});

// ===== 나라 정보 (백엔드 코드 기준: JP/TH/UK) =====
const COUNTRY_META = {
  JP: { label: "일본", flag: JapanFlag },
  UK: { label: "영국", flag: UKFlag },
  TH: { label: "태국", flag: ThailandFlag },
};

// ✅ 나라별 기본 테마
const DEFAULT_THEME_BY_COUNTRY = {
  JP: "food", // 음식
  TH: "activity", // 액티비티
  UK: "museum", // 박물관
};

// ✅ 선택 가능한 여행 테마 5가지
const THEME_OPTIONS = [
  { key: "food", label: "음식" },
  { key: "activity", label: "액티비티" },
  { key: "museum", label: "박물관" },
  { key: "shopping", label: "쇼핑" },
  { key: "nature", label: "자연/휴식" },
];

// 날씨 아이콘 타입 → 이모지 매핑 (백엔드 icon_type 기준)
const WEATHER_ICON_EMOJI = {
  sunny: "☀️",
  cloudy: "☁️",
  foggy: "🌫️",
  rainy: "☔",
  snowy: "❄️",
  stormy: "⛈️",
  error: "⚠️",
};

// 🔢 날짜 차이로 days 계산 (최소 1일)
function calcDays(startDate, endDate) {
  if (!startDate || !endDate) return 1;
  const start = new Date(startDate);
  const end = new Date(endDate);
  const diffMs = end.getTime() - start.getTime();
  const diffDays = Math.round(diffMs / (1000 * 60 * 60 * 24)) + 1;
  return diffDays > 0 ? diffDays : 1;
}

function MapResizer({ isDetailOpen }) {
  const map = useMap();

  useEffect(() => {
    if (!map) return;

    // 패널 열고/닫는 애니메이션이 끝난 뒤에 사이즈 다시 계산
    const timer = setTimeout(() => {
      map.invalidateSize();
    }, 250);

    return () => clearTimeout(timer);
  }, [isDetailOpen, map]);

  return null;
}

export default function Main() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  // ✅ 쿼리 파라미터에서 country 읽기
  const countryParam = searchParams.get("country");

  // ✅ country가 없는 상태로 /main에 들어오면 홈으로 돌려보내기
  useEffect(() => {
    if (!countryParam) {
      navigate("/", { replace: true });
    }
  }, [countryParam, navigate]);

  // Home에서 넘어온 나라 코드 (JP/TH/UK) - 기본값: UK
  const countryCode = countryParam || "UK";
  const countryMeta = COUNTRY_META[countryCode] || COUNTRY_META.UK;

  // 백엔드에서 불러온 지역 목록
  const [regions, setRegions] = useState([]);
  const [regionKey, setRegionKey] = useState(null); // region_code (london, tokyo, ...)

  // overview(랜드마크 + 맛집/액티비티/박물관)
  const [overview, setOverview] = useState(null);

  // 지역 드롭다운 상태
  const [isRegionOpen, setIsRegionOpen] = useState(false);

  // 날짜 상태
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [isDateOpen, setIsDateOpen] = useState(false);

  // 상세 패널 / 선택된 랜드마크
  const [isDetailOpen, setIsDetailOpen] = useState(false); // 기본: 접혀있음
  const [selectedLandmark, setSelectedLandmark] = useState(null);

  // 체크리스트: 선택한 랜드마크 목록
  const [checklist, setChecklist] = useState([]);

  // 날씨 예보 상태
  const [weatherForecast, setWeatherForecast] = useState(null);
  const [weatherLoading, setWeatherLoading] = useState(false);
  const [weatherError, setWeatherError] = useState("");

  // 🔥 일정 생성 로딩/에러 상태
  const [isGenerating, setIsGenerating] = useState(false);
  const [generateError, setGenerateError] = useState("");

  // ✅ 여행 테마 상태
  const [theme, setTheme] = useState(
    DEFAULT_THEME_BY_COUNTRY[countryCode] || "food"
  );

  // 나라가 바뀔 때 기본 테마도 같이 변경
  useEffect(() => {
    setTheme(DEFAULT_THEME_BY_COUNTRY[countryCode] || "food");
  }, [countryCode]);

  // 🔒 출발일 & 도착일이 둘 다 채워지면 date 패널 자동 닫기
  useEffect(() => {
    if (startDate && endDate) {
      setIsDateOpen(false);
    }
  }, [startDate, endDate]);

  // 1) 국가 변경 시, 해당 국가의 지역 목록 로딩
  useEffect(() => {
    const fetchRegions = async () => {
      try {
        const res = await fetch(
          `${API_BASE_URL}/api/regions?country_code=${countryCode}`
        );
        if (!res.ok) {
          console.error("Failed to fetch regions", res.status);
          return;
        }
        const data = await res.json(); // [{ code, name, lat, lon, country_code }, ...]
        setRegions(data);

        // 아직 regionKey가 없으면 첫 번째 지역으로 기본 설정
        if (!regionKey && data.length > 0) {
          setRegionKey(data[0].code);
        } else if (regionKey && !data.some((r) => r.code === regionKey)) {
          // 기존 regionKey가 현재 국가에 없으면 리셋
          if (data.length > 0) {
            setRegionKey(data[0].code);
          } else {
            setRegionKey(null);
          }
        }
      } catch (err) {
        console.error("Error fetching regions:", err);
      }
    };

    fetchRegions();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [countryCode]);

  // 2) 국가/지역이 선택되면, overview(랜드마크+맛집/액티비티/박물관) 로딩
  useEffect(() => {
    if (!countryCode || !regionKey) return;

    const fetchOverview = async () => {
      try {
        const params = new URLSearchParams({
          country_code: countryCode,
          region_code: regionKey,
        }).toString();

        const res = await fetch(
          `${API_BASE_URL}/api/travel/overview?${params}`
        );
        if (!res.ok) {
          console.error("Failed to fetch travel overview", res.status);
          return;
        }
        const data = await res.json(); // TravelOverview
        setOverview(data);
      } catch (err) {
        console.error("Error fetching travel overview:", err);
      }
    };

    fetchOverview();
  }, [countryCode, regionKey]);

  // 3) 기존 JSX를 그대로 쓰기 위해 regionData를 예전 형태로 가공
  const regionData = useMemo(() => {
    // regionKey에 해당하는 region 선택
    const region = regions.find((r) => r.code === regionKey) || null;
    const label = region ? region.name : "지역 선택";
    const center = region ? [region.lat, region.lon] : [51.5074, -0.1278]; // 기본 런던
    const zoom = 12;

    // overview에서 랜드마크 배열만 추출
    const landmarks =
      overview?.landmarks?.map((lm) => ({
        id: lm.id,
        name: lm.name,
        description: lm.description,
        // 🔥 새로 채운 필드들도 함께 내려받아서 보관
        description_long: lm.description_long,
        highlight_points: lm.highlight_points,
        best_time: lm.best_time,
        recommended_duration: lm.recommended_duration,
        local_tip: lm.local_tip,
        lat: lm.lat,
        lng: lm.lng,
      })) || [];

    return {
      id: regionKey || "",
      label,
      center,
      zoom,
      landmarks,
    };
  }, [regions, regionKey, overview]);

  const toggleDetail = () => setIsDetailOpen((prev) => !prev);

  const handleMarkerClick = (lm) => {
    // ✅ 이제는 "정보만 열기"
    setSelectedLandmark(lm);
    setIsDetailOpen(true);
  };

  // ✅ 상세 패널의 "여행 일정에 추가하기" 버튼
  const handleAddSelectedToChecklist = () => {
    if (!selectedLandmark || !regionKey) return;

    const key = `${regionKey}-${selectedLandmark.id}`;
    setChecklist((prev) => {
      const exists = prev.some((item) => item.key === key);
      if (exists) return prev;
      return [
        ...prev,
        {
          key,
          id: selectedLandmark.id,
          name: selectedLandmark.name,
          region: regionData.label,
        },
      ];
    });
  };

  const handleChecklistRemove = (keyToRemove) => {
    setChecklist((prev) => prev.filter((item) => item.key !== keyToRemove));
  };

  const handleRegionButtonClick = () => {
    setIsRegionOpen((prev) => !prev);
    setIsDateOpen(false);
  };

  const handleRegionSelect = (key) => {
    setRegionKey(key);
    setSelectedLandmark(null);
    setIsRegionOpen(false);
    // 지역 바뀌면 이전 날씨 예보는 리셋
    setWeatherForecast(null);
    setWeatherError("");
  };

  const handleDateButtonClick = () => {
    setIsDateOpen((prev) => !prev);
    setIsRegionOpen(false);
  };

  const dateLabel =
    startDate && endDate ? `${startDate} ~ ${endDate}` : "출발일 ~ 도착일";

  // 생성하기 버튼: 날짜 + 체크리스트 둘 다 있어야 활성화
  const canGenerate = startDate && endDate && checklist.length > 0;

  // ✅ 선택된 랜드마크의 이미지 URL (S3)
  const landmarkImageUrl = selectedLandmark
    ? `${S3_LANDMARK_BASE_URL}/${selectedLandmark.id}.png`
    : null;

  // ✅ 일정 생성하기 → 백엔드 /itineraries/generate 호출
  const handleGenerateClick = async () => {
    if (!canGenerate || isGenerating) return;

    setGenerateError("");
    setIsGenerating(true);

    // 🔢 날짜 차이로 days 계산
    const diffDays = calcDays(startDate, endDate);

    // 🔎 선택한 랜드마크 id만 추출
    const selectedLandmarkIds = checklist.map((item) => item.id);

    // 🔥 ItineraryCreate 바디 구성
    const body = {
      country_code: countryCode, // JP / TH / UK
      region_code: regionKey, // tokyo / bangkok / london ...
      days: diffDays,
      start_date: startDate, // "YYYY-MM-DD"
      // ✅ 사용자가 선택한 테마를 그대로 전송
      theme: theme || DEFAULT_THEME_BY_COUNTRY[countryCode] || "food",
      selected_landmark_ids: selectedLandmarkIds,
    };

    try {
      const res = await fetch(`${API_BASE_URL}/api/itineraries/generate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        console.error("Failed to generate itinerary", res.status);
        setGenerateError("일정 생성에 실패했습니다. 잠시 후 다시 시도해 주세요.");
        return;
      }

      const data = await res.json(); // ItineraryOut

      // 🔁 Report로 이동할 때, 기존에 쓰던 state도 그대로 넘겨주고 + itineraryId 추가
      navigate("/report", {
        state: {
          itineraryId: data.id, // ✅ 백엔드에서 생성된 일정 ID
          countryCode,
          countryLabel: countryMeta.label,
          regionKey,
          regionLabel: regionData.label,
          startDate,
          endDate,
          checklist,
          theme, // 선택한 테마도 넘겨주면 나중에 리포트 페이지에서 보여줄 수 있음
        },
      });
    } catch (e) {
      console.error("Error generating itinerary", e);
      setGenerateError("AI 일정을 생성하는 중 오류가 발생했습니다.");
    } finally {
      setIsGenerating(false);
    }
  };

  // ✅ 날씨 확인 버튼 핸들러: /api/weather/forecast 호출
  const handleWeatherCheck = async () => {
    setWeatherError("");
    setWeatherForecast(null);

    // 지역/날짜가 모두 선택되어 있어야 함
    const region = regions.find((r) => r.code === regionKey);
    if (!region) {
      setWeatherError("지역 정보를 먼저 선택해 주세요.");
      return;
    }
    if (!startDate || !endDate) {
      setWeatherError("출발일과 도착일을 먼저 선택해 주세요.");
      return;
    }

    const { lat, lon } = region;

    try {
      setWeatherLoading(true);

      const params = new URLSearchParams({
        lat: String(lat),
        lon: String(lon),
        start_date: startDate,
        end_date: endDate,
      }).toString();

      const res = await fetch(
        `${API_BASE_URL}/api/weather/forecast?${params}`
      );
      if (!res.ok) {
        console.error("Failed to fetch weather forecast", res.status);
        setWeatherError("날씨 정보를 가져오지 못했습니다.");
        return;
      }

      const data = await res.json(); // WeatherForecastResponse
      setWeatherForecast(data);
    } catch (err) {
      console.error("Error fetching weather forecast:", err);
      setWeatherError("날씨 정보를 가져오는 중 오류가 발생했습니다.");
    } finally {
      setWeatherLoading(false);
    }
  };

  return (
    <div className="main-page">
      {/* 왼쪽 사이드바 */}
      <aside className="main-sidebar">
        {/* 🔙 나라 다시 선택하기 버튼 */}
        <div className="sidebar-block">
          <button
            className="sidebar-button"
            onClick={() => navigate("/")}
            type="button"
          >
            나라 다시 선택하기
          </button>
        </div>

        {/* 국기 + 나라명 */}
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

        {/* 지역명 버튼 + 드롭다운 */}
        <div className="sidebar-block">
          <button
            className="sidebar-button"
            onClick={handleRegionButtonClick}
          >
            {regionData.label}
          </button>

          {isRegionOpen && (
            <div className="region-dropdown">
              {regions.map((r) => (
                <button
                  key={r.code}
                  className={`region-item ${
                    r.code === regionKey ? "region-item-active" : ""
                  }`}
                  onClick={() => handleRegionSelect(r.code)}
                >
                  {r.name}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* ✅ 여행 테마 선택 카드 */}
        <div className="sidebar-card theme-card">
          <div className="theme-title">여행 테마</div>
          <div className="theme-chip-wrap">
            {THEME_OPTIONS.map((opt) => (
              <button
                key={opt.key}
                type="button"
                className={`theme-chip ${
                  theme === opt.key ? "theme-chip-active" : ""
                }`}
                onClick={() => setTheme(opt.key)}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        {/* 날짜 버튼 + date picker 패널 + 날씨 확인 버튼 */}
        <div className="sidebar-block">
          <button
            className="sidebar-button date-button"
            onClick={handleDateButtonClick}
          >
            {dateLabel}
          </button>

          {isDateOpen && (
            <div className="date-panel">
              <label className="date-row">
                출발일
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => {
                    setStartDate(e.target.value);
                    setWeatherForecast(null);
                    setWeatherError("");
                  }}
                />
              </label>
              <label className="date-row">
                도착일
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => {
                    setEndDate(e.target.value);
                    setWeatherForecast(null);
                    setWeatherError("");
                  }}
                />
              </label>
            </div>
          )}

          {/* 🔘 날씨 확인 버튼 */}
          <button
            className="sidebar-button"
            onClick={handleWeatherCheck}
            disabled={!startDate || !endDate || !regionKey || weatherLoading}
            style={{ marginTop: "8px" }}
          >
            {weatherLoading ? "날씨 확인 중..." : "날씨 확인"}
          </button>

          {/* 에러 메시지 (필요 시) */}
          {weatherError && (
            <div
              style={{
                marginTop: "6px",
                fontSize: "12px",
                color: "#dc2626",
                lineHeight: 1.4,
              }}
            >
              {weatherError}
            </div>
          )}
        </div>

        {/* 🌤 날씨 예보 카드 (백엔드 데이터 기반) */}
        {weatherForecast && weatherForecast.daily && (
          <div className="sidebar-card weather-card">
            <div className="weather-title">예상 날씨</div>
            <div className="weather-period">
              {weatherForecast.start_date} ~ {weatherForecast.end_date}
            </div>

            <div
              style={{
                marginTop: "8px",
                fontSize: "12px",
                maxHeight: "180px",
                overflowY: "auto",
              }}
            >
              {weatherForecast.daily.map((day) => (
                <div
                  key={day.date}
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    marginBottom: "6px",
                  }}
                >
                  <div>
                    <div style={{ fontWeight: 500 }}>{day.date}</div>
                    <div style={{ fontSize: "11px", color: "#4b5563" }}>
                      {WEATHER_ICON_EMOJI[day.icon_type] || ""} {day.status}
                    </div>
                  </div>
                  <div
                    style={{
                      fontSize: "11px",
                      textAlign: "right",
                      color: "#111827",
                    }}
                  >
                    최고 {day.temperature_max}℃<br />
                    최저 {day.temperature_min}℃
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 체크리스트 */}
        <div className="sidebar-card checklist-card">
          <div className="checklist-header">
            <div>
              <div className="checklist-title">체크리스트</div>
              <div className="checklist-subtitle">
                선택한 랜드마크를 한눈에 관리해요
              </div>
            </div>
            <div className="checklist-count-badge">{checklist.length}</div>
          </div>

          {checklist.length === 0 ? (
            <div className="checklist-empty">
              <span className="checklist-empty-icon">🗺️</span>
              <p>
                지도의 랜드마크를 선택해서
                <br />
                나만의 여행 코스를 만들어 보세요.
              </p>
            </div>
          ) : (
            <ul className="checklist-list">
              {checklist.map((item) => (
                <li className="checklist-item" key={item.key}>
                  <div className="checklist-item-main">
                    <div className="checklist-item-name">{item.name}</div>
                    <div className="checklist-item-region-pill">
                      {item.region}
                    </div>
                  </div>
                  <button
                    className="checklist-remove-btn"
                    onClick={() => handleChecklistRemove(item.key)}
                    type="button"
                    aria-label={`${item.name} 삭제`}
                  >
                    ✕
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* 생성하기 버튼 + 에러 표시 */}
        <button
          className="generate-button"
          onClick={handleGenerateClick}
          disabled={!canGenerate || isGenerating}
        >
          {isGenerating ? "일정 생성 중..." : "생성하기"}
        </button>

        {generateError && (
          <div
            style={{
              marginTop: "6px",
              fontSize: "12px",
              color: "#dc2626",
              lineHeight: 1.4,
            }}
          >
            {generateError}
          </div>
        )}
      </aside>

      {/* 오른쪽: 지도 + 상세 패널 */}
      <section
        className={`main-map-area ${isDetailOpen ? "detail-open" : ""}`}
      >
        {/* 지도 */}
        <div className="map-placeholder">
          {/* 🔑 나라 + 지역이 바뀔 때마다 재마운트되도록 key 부여 */}
          <MapContainer
            key={`${countryCode}-${regionData.id}`}
            center={regionData.center}
            zoom={regionData.zoom}
            style={{ width: "100%", height: "100%" }}
          >
            <MapResizer isDetailOpen={isDetailOpen} />
            <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />

            {regionData.landmarks.map((lm) => (
              <Marker
                key={lm.id}
                position={[lm.lat, lm.lng]}
                icon={defaultMarkerIcon}
                eventHandlers={{
                  click: () => handleMarkerClick(lm),
                }}
              >
                <Popup>{lm.name}</Popup>
              </Marker>
            ))}
          </MapContainer>
        </div>

        {/* 오른쪽 토글 바 */}
        {isDetailOpen && (
          <button className="detail-toggle open" onClick={toggleDetail}>
            ▶
          </button>
        )}
        {!isDetailOpen && (
          <button className="detail-toggle" onClick={toggleDetail}>
            ◀
          </button>
        )}

        {/* 상세 패널 */}
        {isDetailOpen && (
          <div className="detail-panel">
            {/* 상단: 사진 + 제목 */}
            <div className="detail-header">
              <div className="detail-photo-box">
                {landmarkImageUrl ? (
                  <img
                    src={landmarkImageUrl}
                    alt={selectedLandmark?.name || "랜드마크 사진"}
                    onError={(e) => {
                      e.currentTarget.onerror = null;
                      e.currentTarget.src = "/fallback-landmark.png";
                    }}
                  />
                ) : (
                  <span>사진 없음</span>
                )}
              </div>

              <div className="detail-header-text">
                <div className="detail-name-box">
                  {selectedLandmark ? selectedLandmark.name : "랜드마크 이름"}
                </div>
                {selectedLandmark && (
                  <div className="detail-chip-row">
                    <span className="detail-chip-region">{regionData.label}</span>
                  </div>
                )}
              </div>
            </div>

            {/* 가운데: 스크롤 가능한 정보 영역 */}
            <div className="detail-scroll">
              <div className="detail-info-box">
                {!selectedLandmark && (
                  <p className="detail-empty-text">
                    지도의 마커를 클릭하면 선택한 랜드마크 정보가 여기에 표시됩니다.
                  </p>
                )}

                {selectedLandmark && (
                  <>
                    {/* 🔹 메인 상세 설명 */}
                    <section className="detail-section">
                      <h3 className="detail-section-title">소개</h3>
                      <p className="detail-main-text">
                        {selectedLandmark.description_long ||
                          selectedLandmark.description ||
                          "상세 설명이 준비 중입니다."}
                      </p>
                    </section>

                    {/* 🔹 하이라이트 포인트 리스트 */}
                    {(() => {
                      const raw = selectedLandmark.highlight_points;
                      const points = Array.isArray(raw)
                        ? raw
                        : (raw || "")
                            .split("\n")
                            .map((s) => s.trim())
                            .filter(Boolean);

                      if (!points.length) return null;

                      return (
                        <section className="detail-section">
                          <h3 className="detail-section-title">주요 포인트</h3>
                          <ul className="detail-point-list">
                            {points.map((p, idx) => (
                              <li key={idx}>{p}</li>
                            ))}
                          </ul>
                        </section>
                      );
                    })()}

                    {/* 🔹 방문 시간 / 추천 체류 시간 */}
                    {(selectedLandmark.best_time ||
                      selectedLandmark.recommended_duration) && (
                      <section className="detail-section">
                        <h3 className="detail-section-title">방문 정보</h3>
                        <div className="detail-visit-box">
                          {selectedLandmark.best_time && (
                            <div>
                              <span className="detail-visit-label">
                                추천 방문 시간대
                              </span>
                              <span className="detail-visit-value">
                                {selectedLandmark.best_time}
                              </span>
                            </div>
                          )}
                          {selectedLandmark.recommended_duration && (
                            <div>
                              <span className="detail-visit-label">
                                권장 체류 시간
                              </span>
                              <span className="detail-visit-value">
                                {selectedLandmark.recommended_duration}
                              </span>
                            </div>
                          )}
                        </div>
                      </section>
                    )}

                    {/* 🔹 로컬 팁 */}
                    {selectedLandmark.local_tip && (
                      <section className="detail-section">
                        <h3 className="detail-section-title">현지 꿀팁</h3>
                        <p className="detail-tip-text">
                          {selectedLandmark.local_tip}
                        </p>
                      </section>
                    )}
                  </>
                )}
              </div>
            </div>

            {/* 하단: 버튼 영역 */}
            <div className="detail-actions">
              <button
                className="detail-add-button"
                type="button"
                onClick={handleAddSelectedToChecklist}
                disabled={!selectedLandmark}
              >
                여행 일정에 추가하기
              </button>
            </div>
          </div>
        )}
      </section>

      {/* 🔥 전체 페이지 로딩 오버레이 */}
      {isGenerating && (
        <div className="generate-overlay">
          <div className="generate-overlay-box">
            <div className="generate-spinner" />
            <div className="generate-overlay-text">
              AI가 일정을 생성하는 중입니다...
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
