// src/pages/Report.jsx
import { useLocation, useNavigate } from 'react-router-dom';

const COUNTRY_LABEL = {
  JP: '일본',
  UK: '영국',
  TH: '태국',
};

function Report() {
  const location = useLocation();
  const navigate = useNavigate();

  // Main에서 넘겨준 값
  const state = location.state || {};
  const countryCode = state.countryCode || 'UK';
  const plan = state.plan || [];

  const countryLabel = COUNTRY_LABEL[countryCode] || '여행지';

  const totalDays = Math.max(plan.length, 1);

  return (
    <div style={{ minHeight: '100vh', padding: '32px 80px', background: '#f9fafb' }}>
      {/* 상단 헤더 */}
      <header style={{ marginBottom: '24px' }}>
        <h1 style={{ fontSize: '24px', fontWeight: '700', marginBottom: '8px' }}>
          여행 리포트
        </h1>
        <p style={{ fontSize: '14px', color: '#6b7280', margin: 0 }}>
          선택한 랜드마크를 기반으로 {countryLabel} 여행 일정을 요약해 드렸어요.
        </p>
      </header>

      {/* 상단 요약 카드 2개 */}
      <section
        style={{
          display: 'flex',
          gap: '16px',
          marginBottom: '32px',
          flexWrap: 'wrap',
        }}
      >
        <div
          style={{
            flex: '1 1 260px',
            borderRadius: '12px',
            border: '1px solid #e5e7eb',
            background: '#ffffff',
            padding: '16px 20px',
          }}
        >
          <h2 style={{ fontSize: '16px', fontWeight: 600, margin: '0 0 8px' }}>
            여행 기본 정보
          </h2>
          <p style={{ margin: '4px 0', fontSize: '14px' }}>여행 국가: {countryLabel}</p>
          <p style={{ margin: '4px 0', fontSize: '14px' }}>
            방문 예정 랜드마크 수: {plan.length}곳
          </p>
          <p style={{ margin: '4px 0', fontSize: '14px' }}>
            예상 일정: {totalDays}일 (하루에 한 곳 방문 기준)
          </p>
        </div>

        <div
          style={{
            flex: '1 1 260px',
            borderRadius: '12px',
            border: '1px solid #e5e7eb',
            background: '#ffffff',
            padding: '16px 20px',
          }}
        >
          <h2 style={{ fontSize: '16px', fontWeight: 600, margin: '0 0 8px' }}>
            간단 요약
          </h2>
          {plan.length === 0 ? (
            <p style={{ margin: 0, fontSize: '14px', color: '#6b7280' }}>
              아직 일정에 추가된 랜드마크가 없습니다.
              <br />
              메인 화면에서 랜드마크를 선택하고 &quot;일정에 추가&quot;를 눌러보세요.
            </p>
          ) : (
            <p style={{ margin: 0, fontSize: '14px', color: '#6b7280' }}>
              총 {plan.length}개의 랜드마크를 방문하는 {totalDays}일 간의 여행이에요.
              <br />
              도시의 상징적인 랜드마크부터 대표 관광지까지 골고루 포함되어 있습니다.
            </p>
          )}
        </div>
      </section>

      {/* 일정 타임라인 영역 */}
      <section style={{ marginBottom: '32px', maxWidth: '640px' }}>
        <h2 style={{ fontSize: '18px', marginBottom: '8px' }}>일정 구성</h2>
        <div
          style={{
            borderRadius: '12px',
            border: '1px solid #e5e7eb',
            background: '#ffffff',
            padding: '16px 20px',
          }}
        >
          {plan.length === 0 ? (
            <p style={{ fontSize: '14px', color: '#6b7280', margin: 0 }}>
              일정에 추가된 랜드마크가 없어서 타임라인을 만들 수 없어요.
              <br />
              메인 화면에서 랜드마크를 선택해 일정을 구성해 주세요.
            </p>
          ) : (
            <ol style={{ listStyle: 'none', padding: 0, margin: 0 }}>
              {plan.map((lm, idx) => (
                <li
                  key={lm.id}
                  style={{
                    display: 'flex',
                    gap: '12px',
                    padding: '10px 0',
                    borderBottom:
                      idx === plan.length - 1 ? 'none' : '1px solid #e5e7eb',
                  }}
                >
                  <div
                    style={{
                      minWidth: '64px',
                      fontSize: '13px',
                      fontWeight: 600,
                      color: '#4b5563',
                    }}
                  >
                    {idx + 1}일차
                  </div>
                  <div>
                    <div
                      style={{
                        fontSize: '14px',
                        fontWeight: 600,
                        marginBottom: '4px',
                      }}
                    >
                      {lm.name}
                    </div>
                    <div
                      style={{
                        fontSize: '13px',
                        color: '#6b7280',
                        marginBottom: '4px',
                      }}
                    >
                      {lm.description}
                    </div>
                    <div
                      style={{
                        fontSize: '11px',
                        color: '#9ca3af',
                      }}
                    >
                      위도: {lm.lat} / 경도: {lm.lng}
                    </div>
                  </div>
                </li>
              ))}
            </ol>
          )}
        </div>
      </section>

      {/* 버튼 영역 */}
      <button
        type="button"
        onClick={() => navigate(-1)}
        style={{
          padding: '10px 22px',
          borderRadius: '999px',
          border: 'none',
          background: '#111827',
          color: 'white',
          fontSize: '13px',
          cursor: 'pointer',
        }}
      >
        메인으로 돌아가기
      </button>
    </div>
  );
}

export default Report;
