// src/pages/Main.jsx
import React, { useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import "./Main.css";

import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

import JapanFlag from "../assets/flags/jp.svg";
import UKFlag from "../assets/flags/uk.svg";
import ThailandFlag from "../assets/flags/th.svg";

/** 🔥 PNG 대신 CSS로 그리는 동그라미 마커(icon 이미지 문제 완전 제거) */
const defaultMarkerIcon = L.divIcon({
  className: "custom-map-marker",
  iconSize: [18, 18],
  iconAnchor: [9, 9],
  popupAnchor: [0, -9],
});

// ===== 나라 정보 (프론트 임시) =====
const COUNTRY_META = {
  japan: { label: "일본", flag: JapanFlag },
  uk: { label: "영국", flag: UKFlag },
  thailand: { label: "태국", flag: ThailandFlag },
};

// ===== 지역 / 랜드마크 정보 (임시 하드코딩) =====
const REGION_CONFIG = {
  london: {
    id: "london",
    label: "런던",
    center: [51.5074, -0.1278],
    zoom: 12,
    landmarks: [
      {
        id: 1,
        name: "버킹엄 궁전",
        description: "영국 군주의 공식 거처.",
        lat: 51.501364,
        lng: -0.14189,
      },
      {
        id: 2,
        name: "빅벤",
        description: "현대의 상징적인 시계탑.",
        lat: 51.500729,
        lng: -0.124625,
      },
      {
        id: 3,
        name: "타워 브리지",
        description: "템스 강을 가로지르는 도개교.",
        lat: 51.505456,
        lng: -0.075356,
      },
    ],
  },
  manchester: {
    id: "manchester",
    label: "맨체스터",
    center: [53.483959, -2.244644],
    zoom: 12,
    landmarks: [
      {
        id: 1,
        name: "에티하드 스타디움",
        description: "맨체스터 시티 FC 홈구장.",
        lat: 53.4831,
        lng: -2.2004,
      },
      {
        id: 2,
        name: "맨체스터 대성당",
        description: "고딕 양식의 영국 성당.",
        lat: 53.4857,
        lng: -2.2445,
      },
    ],
  },
  liverpool: {
    id: "liverpool",
    label: "리버풀",
    center: [53.4084, -2.9916],
    zoom: 12,
    landmarks: [
      {
        id: 1,
        name: "앤필드",
        description: "리버풀 FC 홈구장.",
        lat: 53.4308,
        lng: -2.9608,
      },
      {
        id: 2,
        name: "알버트 독",
        description: "리버풀의 대표적인 관광지.",
        lat: 53.3993,
        lng: -2.9923,
      },
    ],
  },
};

/** 🔎 월 → 계절 추출 */
function getSeasonFromMonth(month) {
  if (month === 12 || month === 1 || month === 2) return "winter";
  if (month >= 3 && month <= 5) return "spring";
  if (month >= 6 && month <= 8) return "summer";
  return "autumn";
}

/** 📌 나라 + 계절별 간단 날씨 설명 (대략값, 더미 가이드용) */
const WEATHER_RULES = {
  uk: {
    winter: {
      label: "겨울 (12~2월)",
      main: "기온 2~8℃, 비 자주 내리는 쌀쌀한 날씨예요.",
      detail: "두꺼운 외투와 우산이 필요해요. 비가 자주 오고, 바람도 강한 편이라 방수 가능한 겉옷이 있으면 좋아요.",
      icon: "🌧",
    },
    spring: {
      label: "봄 (3~5월)",
      main: "기온 7~15℃, 일교차가 크고 간헐적으로 비가 와요.",
      detail: "가벼운 겉옷 + 얇은 니트를 추천해요. 갑자기 추워질 수 있으니 겹쳐 입기 좋은 옷을 준비해 주세요.",
      icon: "🌦",
    },
    summer: {
      label: "여름 (6~8월)",
      main: "기온 15~23℃ 정도로 선선한 편이에요.",
      detail: "한국 여름보다 덜 덥지만, 햇빛이 강할 수 있어요. 얇은 상의와 가벼운 겉옷, 선크림을 챙기면 좋아요.",
      icon: "⛅",
    },
    autumn: {
      label: "가을 (9~11월)",
      main: "기온 8~15℃, 비와 흐린 날이 많아요.",
      detail: "트렌치코트나 두꺼운 가디건이 있으면 좋아요. 우산 또는 방수 재킷도 추천돼요.",
      icon: "🌥",
    },
  },
  japan: {
    winter: {
      label: "겨울 (12~2월)",
      main: "기온 0~8℃, 건조하고 찬 바람이 부는 편이에요.",
      detail: "목도리와 장갑까지 챙기면 좋아요. 실내는 난방이 잘 되어 있어 겹쳐 입기 좋은 옷이 편해요.",
      icon: "❄",
    },
    spring: {
      label: "봄 (3~5월)",
      main: "기온 8~18℃, 벚꽃 시즌엔 낮에는 포근하지만 아침·밤은 쌀쌀해요.",
      detail: "얇은 코트나 가디건이 있으면 좋고, 꽃가루가 심한 날엔 마스크도 도움이 돼요.",
      icon: "🌸",
    },
    summer: {
      label: "여름 (6~8월)",
      main: "기온 25~33℃, 습도가 높고 무더운 날씨예요.",
      detail: "반팔 티셔츠와 얇은 바지, 물 자주 마시기! 실내 에어컨을 대비해 얇은 겉옷도 하나 챙겨 주세요.",
      icon: "🌞",
    },
    autumn: {
      label: "가을 (9~11월)",
      main: "기온 10~20℃, 선선하고 여행하기 좋은 날씨예요.",
      detail: "긴팔 셔츠 + 가벼운 재킷 조합이 잘 맞아요. 아침저녁은 조금 쌀쌀할 수 있어요.",
      icon: "🍁",
    },
  },
  thailand: {
    winter: {
      label: "건기 (11~2월)",
      main: "기온 24~32℃, 비교적 덜 덥고 습도도 낮은 편이에요.",
      detail: "반팔, 반바지 등 가벼운 옷차림이 좋아요. 실내는 에어컨이 강해서 얇은 겉옷이 있으면 편해요.",
      icon: "🌤",
    },
    spring: {
      label: "더위 심한 시기 (3~5월)",
      main: "기온 28~35℃ 이상으로 매우 덥고 습해요.",
      detail: "통풍 잘 되는 옷, 모자, 선크림, 휴대용 선풍기까지 있으면 좋아요. 수분 섭취 필수!",
      icon: "🥵",
    },
    summer: {
      label: "우기 (6~10월)",
      main: "기온 26~32℃, 소나기와 스콜이 자주 와요.",
      detail: "슬리퍼나 샌들, 가벼운 우비가 있으면 편해요. 비가 갑자기 쏟아졌다 그치기를 반복해요.",
      icon: "🌧",
    },
    autumn: {
      label: "우기 후반 (9~11월)",
      main: "여전히 덥지만, 점점 건기로 넘어가는 시기예요.",
      detail: "여름 옷차림에 가벼운 우산 또는 우비 정도만 챙기면 돼요.",
      icon: "⛅",
    },
  },
};

/** 현재 선택값 기준 날씨 요약 얻기 */
function getWeatherSummary(countryCode, startDate) {
  if (!startDate) return null;
  const [year, monthStr] = startDate.split("-");
  const month = Number(monthStr);
  if (!month || !WEATHER_RULES[countryCode]) return null;

  const season = getSeasonFromMonth(month);
  const rules = WEATHER_RULES[countryCode][season];
  return rules || null;
}

export default function Main() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  // Home에서 넘어온 나라 (기본값: 영국)
  const countryCode = searchParams.get("country") || "uk";
  const countryMeta = COUNTRY_META[countryCode] || COUNTRY_META.uk;

  // 지역 상태
  const [regionKey, setRegionKey] = useState("london");
  const regionData = REGION_CONFIG[regionKey];

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

  const toggleDetail = () => setIsDetailOpen((prev) => !prev);

  const handleMarkerClick = (lm) => {
    setSelectedLandmark(lm);
    setIsDetailOpen(true);

    // 체크리스트에 없으면 추가
    setChecklist((prev) => {
      const key = `${regionKey}-${lm.id}`;
      const exists = prev.some((item) => item.key === key);
      if (exists) return prev;
      return [...prev, { key, name: lm.name, region: regionData.label }];
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
  };

  const handleDateButtonClick = () => {
    setIsDateOpen((prev) => !prev);
    setIsRegionOpen(false);
  };

  const dateLabel =
    startDate && endDate ? `${startDate} ~ ${endDate}` : "출발일 ~ 도착일";

  // 생성하기 버튼: 날짜 + 체크리스트 둘 다 있어야 활성화
  const canGenerate = startDate && endDate && checklist.length > 0;

  const handleGenerateClick = () => {
    if (!canGenerate) return;

    const payload = {
      countryCode,
      countryLabel: countryMeta.label,
      regionKey,
      regionLabel: regionData.label,
      startDate,
      endDate,
      checklist,
    };

    navigate("/report", { state: payload });
  };

  // 🌤 날씨 요약 (출발일 기준)
  const weatherSummary = getWeatherSummary(countryCode, startDate);

  return (
    <div className="main-page">
      {/* 왼쪽 사이드바 */}
      <aside className="main-sidebar">
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
              {Object.values(REGION_CONFIG).map((r) => (
                <button
                  key={r.id}
                  className={`region-item ${
                    r.id === regionKey ? "region-item-active" : ""
                  }`}
                  onClick={() => handleRegionSelect(r.id)}
                >
                  {r.label}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* 날짜 버튼 + date picker 패널 */}
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
                  onChange={(e) => setStartDate(e.target.value)}
                />
              </label>
              <label className="date-row">
                도착일
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                />
              </label>
            </div>
          )}
        </div>

        {/* 🌤 예상 날씨 카드 (출발일 & 도착일 모두 선택됐을 때만 표시) */}
        {startDate && endDate && weatherSummary && (
          <div className="sidebar-card weather-card">
            <div className="weather-title">
              예상 날씨 {weatherSummary.icon && (
                <span className="weather-icon">{weatherSummary.icon}</span>
              )}
            </div>
            <div className="weather-period">
              {startDate} ~ {endDate}
            </div>
            <div className="weather-season">{weatherSummary.label}</div>
            <div className="weather-main">{weatherSummary.main}</div>
            <div className="weather-detail">{weatherSummary.detail}</div>
          </div>
        )}

        {/* 체크리스트 */}
        <div className="sidebar-card checklist-card">
          <div className="checklist-title">체크리스트</div>
          <ul className="checklist-list">
            {checklist.length === 0 ? (
              <li>지도에서 랜드마크를 선택해 주세요.</li>
            ) : (
              checklist.map((item) => (
                <li key={item.key}>
                  {item.region} - {item.name}
                  <button
                    className="checklist-remove-btn"
                    onClick={() => handleChecklistRemove(item.key)}
                  >
                    ✕
                  </button>
                </li>
              ))
            )}
          </ul>
        </div>

        {/* 생성하기 버튼 */}
        <button
          className="generate-button"
          onClick={handleGenerateClick}
          disabled={!canGenerate}
        >
          생성하기
        </button>
      </aside>

      {/* 오른쪽: 지도 + 상세 패널 */}
      <section
        className={`main-map-area ${isDetailOpen ? "detail-open" : ""}`}
      >
        {/* 지도 */}
        <div className="map-placeholder">
          <MapContainer
            center={regionData.center}
            zoom={regionData.zoom}
            style={{ width: "100%", height: "100%" }}
          >
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
        <button
          className={`detail-toggle ${isDetailOpen ? "open" : ""}`}
          onClick={toggleDetail}
        >
          {isDetailOpen ? "▶" : "◀"}
        </button>

        {/* 상세 패널 */}
        {isDetailOpen && (
          <div className="detail-panel">
            <div className="detail-top">
              <div className="detail-photo-box">사진</div>
              <div className="detail-name-box">
                {selectedLandmark ? selectedLandmark.name : "랜드마크 이름"}
              </div>
            </div>
            <div className="detail-info-box">
              {selectedLandmark
                ? selectedLandmark.description
                : "지도의 마커를 클릭하면 선택한 랜드마크 정보가 여기에 표시됩니다."}
            </div>
          </div>
        )}
      </section>
    </div>
  );
}
