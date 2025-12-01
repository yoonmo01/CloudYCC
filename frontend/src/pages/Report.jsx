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

  const state = location.state || {};
  const countryCode = state.countryCode || 'UK';
  const plan = state.plan || [];

  const countryLabel = COUNTRY_LABEL[countryCode] || '여행지';

  return (
    <div style={{ minHeight: '100vh', padding: '32px 80px', background: '#f9fafb' }}>
      <header style={{ marginBottom: '24px' }}>
        <h1 style={{ fontSize: '24px', fontWeight: '700', marginBottom: '8px' }}>
          여행 리포트
        </h1>
        <p style={{ fontSize: '14px', color: '#6b7280', margin: 0 }}>
          선택한 랜드마크를 기반으로 {countryLabel} 여행 일정을 요약해 보여드려요.
        </p>
      </header>

      <section style={{ marginBottom: '24px' }}>
        <h2 style={{ fontSize: '18px', marginBottom: '8px' }}>여행 기본 정보</h2>
        <div
          style={{
            borderRadius: '12px',
            border: '1px solid #e5e7eb',
            padding: '16px 20px',
            maxWidth: '520px',
            background: '#ffffff',
          }}
        >
          <p>여행 국가: {countryLabel}</p>
          <p>방문 예정 랜드마크 수: {plan.length}곳</p>
          <p>예상 일정: 1일차 ~ N일차 (추후 상세 로직 추가 예정)</p>
        </div>
      </section>

      <section style={{ marginBottom: '32px' }}>
        <h2 style={{ fontSize: '18px', marginBottom: '8px' }}>방문 예정 랜드마크</h2>
        <div
          style={{
            borderRadius: '12px',
            border: '1px solid #e5e7eb',
            padding: '16px 20px',
            maxWidth: '520px',
            background: '#ffffff',
          }}
        >
          {plan.length === 0 ? (
            <p style={{ fontSize: '14px', color: '#6b7280' }}>
              아직 일정에 추가된 랜드마크가 없습니다.
              <br />
              메인 화면에서 랜드마크를 선택하고 &quot;일정에 추가&quot; 버튼을 눌러 보세요.
            </p>
          ) : (
            <ol style={{ paddingLeft: '18px', margin: 0 }}>
              {plan.map((lm, idx) => (
                <li key={lm.id} style={{ marginBottom: '6px', fontSize: '14px' }}>
                  <strong>{idx + 1}일차:</strong> {lm.name} – {lm.description}
                </li>
              ))}
            </ol>
          )}
        </div>
      </section>

      <button
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
