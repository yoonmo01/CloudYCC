// src/components/LandmarkPanel.jsx

function LandmarkPanel({ selected, onAdd }) {
  // 아직 아무것도 선택 안 했을 때
  if (!selected) {
    return (
      <aside
        style={{
          width: '320px',
          borderLeft: '1px solid #e5e7eb',
          padding: '16px',
          background: '#fafafa',
          boxSizing: 'border-box',
        }}
      >
        <h2 style={{ fontSize: '16px', fontWeight: 600, marginBottom: '8px' }}>랜드마크 상세</h2>
        <p style={{ fontSize: '13px', color: '#6b7280' }}>
          지도 영역이나 아래 랜드마크 카드 중 하나를 선택하면
          <br />
          이 영역에 상세 정보가 표시됩니다.
        </p>
      </aside>
    );
  }

  // 선택된 랜드마크가 있을 때
  return (
    <aside
      style={{
        width: '320px',
        borderLeft: '1px solid #e5e7eb',
        padding: '16px',
        background: '#fafafa',
        boxSizing: 'border-box',
      }}
    >
      <h2 style={{ fontSize: '18px', fontWeight: 600, marginBottom: '8px' }}>
        {selected.name}
      </h2>
      <p style={{ fontSize: '13px', color: '#4b5563', marginBottom: '12px' }}>
        {selected.description}
      </p>

      <div style={{ fontSize: '12px', color: '#6b7280', marginBottom: '16px' }}>
        <p>위도: {selected.lat}</p>
        <p>경도: {selected.lng}</p>
      </div>

      <button
        type="button"
        onClick={() => onAdd && onAdd(selected)}
        style={{
          width: '100%',
          padding: '10px 0',
          borderRadius: '8px',
          border: 'none',
          background: '#111827',
          color: 'white',
          fontSize: '14px',
          cursor: 'pointer',
        }}
      >
        일정에 추가
      </button>
    </aside>
  );
}

export default LandmarkPanel;
