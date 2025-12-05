import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";
import { useLocation, useNavigate } from "react-router-dom";
import { useState, useMemo } from "react";
import "./MapPage.css";
import UKFlag from "../assets/flags/uk.svg";

// 🔥 Leaflet 기본 아이콘을 패키지 안에서 직접 가져오기
import markerIcon2x from "leaflet/dist/images/marker-icon-2x.png";
import markerIcon from "leaflet/dist/images/marker-icon.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";

L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
});


// 지역별 데이터 (위도/경도 기반)
const REGION_CONFIG = {
  london: {
    id: "london",
    name: "런던",
    center: [51.5074, -0.1278], // 런던 좌표
    zoom: 12,
    landmarks: [
      {
        id: 1,
        name: "버킹엄 궁전",
        description: "영국 군주의 공식 거처",
        lat: 51.501364,
        lng: -0.14189,
      },
      {
        id: 2,
        name: "빅벤",
        description: "런던의 상징적인 시계탑",
        lat: 51.500729,
        lng: -0.124625,
      },
      {
        id: 3,
        name: "타워 브리지",
        description: "템스 강을 가로지르는 도개교",
        lat: 51.505456,
        lng: -0.075356,
      },
    ],
  },

  manchester: {
    id: "manchester",
    name: "맨체스터",
    center: [53.483959, -2.244644],
    zoom: 12,
    landmarks: [
      {
        id: 1,
        name: "에티하드 스타디움",
        description: "맨체스터 시티 FC 홈구장",
        lat: 53.4831,
        lng: -2.2004,
      },
      {
        id: 2,
        name: "맨체스터 대성당",
        description: "고딕 양식의 영국 성당",
        lat: 53.4857,
        lng: -2.2445,
      },
    ],
  },

  liverpool: {
    id: "liverpool",
    name: "리버풀",
    center: [53.4084, -2.9916],
    zoom: 12,
    landmarks: [
      {
        id: 1,
        name: "앤필드",
        description: "리버풀 FC 홈구장",
        lat: 53.4308,
        lng: -2.9608,
      },
      {
        id: 2,
        name: "알버트 독",
        description: "리버풀의 대표적인 관광지",
        lat: 53.3993,
        lng: -2.9923,
      },
    ],
  },
};

export default function MapPage() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [selectedLandmark, setSelectedLandmark] = useState(null);

  const navigate = useNavigate();
  const location = useLocation();
  const params = new URLSearchParams(location.search);

  const region = params.get("region") || "london";
  const start = params.get("start");
  const end = params.get("end");

  const regionData = useMemo(() => REGION_CONFIG[region], [region]);

  return (
    <div className="map-page">
      {/* 헤더 */}
      <header className="map-header">
        <div className="map-header-left">
          <img src={UKFlag} alt="영국" className="map-header-flag" />
          <div>
            <div className="map-header-title">{regionData.name} 여행 지도</div>
            <div className="map-header-sub">
              여행 일정: {start} ~ {end}
            </div>
          </div>
        </div>

        <button className="map-header-back-btn" onClick={() => navigate(-1)}>
          지역/날짜 다시 선택
        </button>
      </header>

      {/* 지도 + 사이드바 */}
      <div className="map-content">
        {/* 🔥 실제 Leaflet 지도 */}
        <div className="map-container">
          <MapContainer
            center={regionData.center}
            zoom={regionData.zoom}
            style={{ width: "100%", height: "100%" }}
          >
            <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />

            {/* 랜드마크 마커 */}
            {regionData.landmarks.map((lm) => (
              <Marker
                key={lm.id}
                position={[lm.lat, lm.lng]}
                eventHandlers={{
                  click: () => {
                    setSelectedLandmark(lm);
                    setIsSidebarOpen(true);
                  },
                }}
              >
                <Popup>{lm.name}</Popup>
              </Marker>
            ))}
          </MapContainer>
        </div>

        {/* 🔥 우측 사이드바 */}
        <div className={`map-sidebar ${isSidebarOpen ? "open" : "closed"}`}>
          <div
            className="map-sidebar-handle"
            onClick={() => setIsSidebarOpen((prev) => !prev)}
          >
            {isSidebarOpen ? ">" : "<"}
          </div>

          {isSidebarOpen && (
            <div className="map-sidebar-content">
              <h2>랜드마크 정보</h2>

              {selectedLandmark ? (
                <>
                  <div className="sidebar-landmark-name">
                    {selectedLandmark.name}
                  </div>
                  <p className="sidebar-landmark-desc">
                    {selectedLandmark.description}
                  </p>
                </>
              ) : (
                <p className="sidebar-placeholder">
                  지도에서 마커를 클릭하세요.
                </p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
