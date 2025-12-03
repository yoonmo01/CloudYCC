// src/pages/Main.jsx
import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import LandmarkPanel from '../components/LandmarkPanel';

// Leaflet 기본 아이콘 설정 (Vite 환경에서 경로 이슈 방지용)
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl:
    'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl:
    'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

// 색깔 있는 마커 아이콘 (나라별)
const baseMarkerSize = [25, 41];
const baseMarkerAnchor = [12, 41];

const COLORED_MARKERS = {
  JP: L.icon({
    iconUrl:
      'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-red.png',
    iconRetinaUrl:
      'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-red.png',
    shadowUrl:
      'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
    iconSize: baseMarkerSize,
    iconAnchor: baseMarkerAnchor,
    popupAnchor: [1, -34],
    shadowSize: [41, 41],
  }),
  UK: L.icon({
    iconUrl:
      'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-blue.png',
    iconRetinaUrl:
      'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-blue.png',
    shadowUrl:
      'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
    iconSize: baseMarkerSize,
    iconAnchor: baseMarkerAnchor,
    popupAnchor: [1, -34],
    shadowSize: [41, 41],
  }),
  TH: L.icon({
    iconUrl:
      'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-green.png',
    iconRetinaUrl:
      'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-green.png',
    shadowUrl:
      'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
    iconSize: baseMarkerSize,
    iconAnchor: baseMarkerAnchor,
    popupAnchor: [1, -34],
    shadowSize: [41, 41],
  }),
};

// 선택된 마커는 살짝 크게
const SELECTED_MARKER = L.icon({
  iconUrl:
    'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-yellow.png',
  iconRetinaUrl:
    'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-yellow.png',
  shadowUrl:
    'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [30, 49],
  iconAnchor: [15, 49],
  popupAnchor: [1, -40],
  shadowSize: [41, 41],
});

// 나라별 지도 중심 좌표
const MAP_CENTER_BY_COUNTRY = {
  JP: [35.6764, 139.65], // 도쿄 근처
  UK: [51.5074, -0.1278], // 런던
  TH: [13.7563, 100.5018], // 방콕
};

// 나라별 더미 랜드마크 데이터
const LANDMARKS_BY_COUNTRY = {
  JP: [
    {
      id: 1,
      name: '도쿄 타워',
      description: '도쿄를 한눈에 내려다볼 수 있는 전망 타워.',
      lat: 35.6586,
      lng: 139.7454,
    },
    {
      id: 2,
      name: '아사쿠사 센소지',
      description: '일본을 대표하는 고즈넉한 사찰.',
      lat: 35.7148,
      lng: 139.7967,
    },
  ],
  UK: [
    {
      id: 1,
      name: '빅벤',
      description: '런던의 상징적인 시계탑.',
      lat: 51.5007,
      lng: -0.1246,
    },
    {
      id: 2,
      name: '타워 브리지',
      description: '템즈강을 가로지르는 대표적인 다리.',
      lat: 51.5055,
      lng: -0.0754,
    },
  ],
  TH: [
    {
      id: 1,
      name: '왓 아룬',
      description: '방콕의 대표적인 강변 사원.',
      lat: 13.7437,
      lng: 100.4889,
    },
    {
      id: 2,
      name: '카오산 로드',
      description: '배낭여행자의 성지, 방콕 거리.',
      lat: 13.7596,
      lng: 100.497,
    },
  ],
};

const COUNTRY_LABEL = {
  JP: '일본',
  UK: '영국',
  TH: '태국',
};

// 쿼리스트링에서 country 읽어오는 훅
function useCountryFromQuery() {
  const { search } = useLocation();
  const params = new URLSearchParams(search);
  const code = params.get('country') || 'UK'; // 기본값: 영국
  return code;
}

function Main() {
  const countryCode = useCountryFromQuery();
  const navigate = useNavigate();

  const [selected, setSelected] = useState(null); // 패널에 보일 현재 선택
  const [plan, setPlan] = useState([]); // 일정에 담긴 랜드마크 목록

  const landmarks = LANDMARKS_BY_COUNTRY[countryCode] || [];
  const countryLabel = COUNTRY_LABEL[countryCode] || '여행지';

  const handleAddToPlan = (lm) => {
    setPlan((prev) => {
      if (prev.find((p) => p.id === lm.id)) return prev; // 중복 방지
      return [...prev, lm];
    });
  };

  const handleGoReport = () => {
    navigate('/report', {
      state: {
        countryCode,
        plan,
      },
    });
  };

  const countryMarkerIcon = COLORED_MARKERS[countryCode] || L.Icon.Default;

  return (
    <div style={{ display: 'flex', height: '100vh' }}>
      {/* 왼쪽: 상단 정보 + 지도 + 하단 랜드마크 리스트 */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        {/* 상단 헤더 */}
        <header
          style={{
            padding: '16px 24px',
            borderBottom: '1px solid #e5e7eb',
          }}
        >
          <h1 style={{ fontSize: '20px', fontWeight: 600, margin: 0 }}>
            TripTailor – {countryLabel}
          </h1>
          <p
            style={{
              fontSize: '13px',
              color: '#6b7280',
              marginTop: '4px',
            }}
          >
            지도를 보면서 방문하고 싶은 랜드마크를 선택해 보세요.
          </p>
          <p
            style={{
              fontSize: '12px',
              color: '#9ca3af',
              marginTop: '4px',
            }}
          >
            현재 일정에 담긴 랜드마크: {plan.length}곳
          </p>
        </header>

        {/* 지도 영역 */}
        <div
          style={{
            flex: 1,
            margin: '16px 24px 8px',
            borderRadius: '16px',
            border: '1px solid #e5e7eb',
            overflow: 'hidden',
          }}
        >
          <MapContainer
            center={MAP_CENTER_BY_COUNTRY[countryCode] || [51.505, -0.09]}
            zoom={12}
            style={{ width: '100%', height: '100%' }}
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />

            {landmarks.map((lm) => (
              <Marker
                key={lm.id}
                position={[lm.lat, lm.lng]}
                icon={
                  selected && selected.id === lm.id
                    ? SELECTED_MARKER
                    : countryMarkerIcon
                }
                eventHandlers={{
                  click: () => setSelected(lm),
                }}
              >
                <Popup>
                  <div style={{ fontSize: '13px' }}>
                    <strong>{lm.name}</strong>
                    <br />
                    {lm.description}
                  </div>
                </Popup>
              </Marker>
            ))}
          </MapContainer>
        </div>

        {/* 하단: 랜드마크 카드 리스트 + 리포트 버튼 */}
        <footer
          style={{
            padding: '12px 24px 16px',
            borderTop: '1px solid #e5e7eb',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '16px',
          }}
        >
          <ul
            style={{
              display: 'flex',
              gap: '12px',
              margin: 0,
              padding: 0,
              listStyle: 'none',
              overflowX: 'auto',
            }}
          >
            {landmarks.map((lm) => {
              const isSelected = selected && selected.id === lm.id;
              return (
                <li
                  key={lm.id}
                  onClick={() => setSelected(lm)}
                  style={{
                    minWidth: '160px',
                    padding: '10px 12px',
                    borderRadius: '12px',
                    border: isSelected
                      ? '2px solid #111827'
                      : '1px solid #e5e7eb',
                    background: isSelected ? '#f3f4ff' : '#ffffff',
                    cursor: 'pointer',
                    fontSize: '13px',
                    boxShadow: isSelected
                      ? '0 0 0 1px rgba(17,24,39,0.1)'
                      : 'none',
                    transition: 'background 0.15s, border 0.15s, box-shadow 0.15s',
                  }}
                >
                  <div style={{ fontWeight: 600, marginBottom: '4px' }}>
                    {lm.name}
                  </div>
                  <div style={{ fontSize: '12px', color: '#6b7280' }}>
                    {lm.description}
                  </div>
                </li>
              );
            })}
          </ul>

          <button
            type="button"
            onClick={handleGoReport}
            style={{
              padding: '10px 22px',
              borderRadius: '999px',
              border: 'none',
              background: '#111827',
              color: 'white',
              fontSize: '13px',
              cursor: 'pointer',
              whiteSpace: 'nowrap',
              flexShrink: 0,
            }}
          >
            여행 리포트 보기
          </button>
        </footer>
      </div>

      {/* 오른쪽: 상세 패널(Main – Panel 역할) */}
      <LandmarkPanel selected={selected} onAdd={handleAddToPlan} />
    </div>
  );
}

export default Main;
