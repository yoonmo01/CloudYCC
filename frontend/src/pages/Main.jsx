// src/pages/Main.jsx
import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import LandmarkPanel from '../components/LandmarkPanel';

const LANDMARKS_BY_COUNTRY = {
  JP: [
    { id: 1, name: '도쿄 타워', description: '도쿄를 한눈에 내려다볼 수 있는 전망 타워.', lat: 35.6586, lng: 139.7454 },
    { id: 2, name: '아사쿠사 센소지', description: '일본을 대표하는 고즈넉한 사찰.', lat: 35.7148, lng: 139.7967 },
  ],
  UK: [
    { id: 1, name: '빅벤', description: '런던의 상징적인 시계탑.', lat: 51.5007, lng: -0.1246 },
    { id: 2, name: '타워 브리지', description: '템즈강을 가로지르는 대표적인 다리.', lat: 51.5055, lng: -0.0754 },
  ],
  TH: [
    { id: 1, name: '왓 아룬', description: '방콕의 대표적인 강변 사원.', lat: 13.7437, lng: 100.4889 },
    { id: 2, name: '카오산 로드', description: '배낭여행자의 성지, 방콕 거리.', lat: 13.7596, lng: 100.4970 },
  ],
};

const COUNTRY_LABEL = {
  JP: '일본',
  UK: '영국',
  TH: '태국',
};

function useCountryFromQuery() {
  const { search } = useLocation();
  const params = new URLSearchParams(search);
  const code = params.get('country') || 'UK'; // 기본값: 영국
  return code;
}

function Main() {
  const countryCode = useCountryFromQuery();
  const [selected, setSelected] = useState(null);    // 패널에 보여줄 현재 선택
  const [plan, setPlan] = useState([]);              // 일정에 담긴 랜드마크 목록
  const navigate = useNavigate();

  const landmarks = LANDMARKS_BY_COUNTRY[countryCode] || [];
  const countryLabel = COUNTRY_LABEL[countryCode] || '여행지';

  const handleAddToPlan = (lm) => {
    // 중복 방지
    setPlan((prev) => {
      if (prev.find((p) => p.id === lm.id)) return prev;
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

  return (
    <div style={{ display: 'flex', height: '100vh' }}>
      {/* 왼쪽: 상단 정보 + 지도 + 하단 랜드마크 카드 */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        {/* 상단 bar */}
        <header style={{ padding: '16px 24px', borderBottom: '1px solid #e5e7eb' }}>
          <h1 style={{ fontSize: '20px', fontWeight: '600', margin: 0 }}>
            TripTailor – {countryLabel}
          </h1>
          <p style={{ fontSize: '13px', color: '#6b7280', marginTop: '4px' }}>
            지도를 확인하고 방문하고 싶은 랜드마크를 선택해 여행을 구성해 보세요.
          </p>
          <p style={{ fontSize: '12px', color: '#9ca3af', marginTop: '4px' }}>
            현재 일정에 담긴 랜드마크: {plan.length}곳
          </p>
        </header>

        {/* 지도 영역 (위쪽 큰 박스) */}
        <div
          style={{
            flex: 1,
            margin: '16px 24px 8px',
            borderRadius: '16px',
            border: '1px solid #e5e7eb',
            background: '#f3f4f6',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '13px',
            color: '#6b7280',
          }}
        >
          여기 지도(Map API) 들어갈 예정입니다.
        </div>

        {/* 하단: 랜드마크 카드 + 리포트 이동 버튼 */}
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
            {landmarks.map((lm) => (
              <li
                key={lm.id}
                onClick={() => setSelected(lm)}
                style={{
                  minWidth: '160px',
                  padding: '10px 12px',
                  borderRadius: '12px',
                  border: '1px solid #e5e7eb',
                  background: '#ffffff',
                  cursor: 'pointer',
                  fontSize: '13px',
                }}
              >
                <div style={{ fontWeight: 600, marginBottom: '4px' }}>{lm.name}</div>
                <div style={{ fontSize: '12px', color: '#6b7280' }}>{lm.description}</div>
              </li>
            ))}
          </ul>

          <button
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

      {/* 오른쪽: 상세 패널 (Main – Panel 역할) */}
      <LandmarkPanel selected={selected} onAdd={handleAddToPlan} />
    </div>
  );
}

export default Main;
