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
  const totalDays = Math.max(plan.length, 1);

  const hasPlan = plan.length > 0;

  return (
    <div
      style={{
        minHeight: '100vh',
        padding: '32px 80px',
        background: '#f9fafb',
        boxSizing: 'border-box',
      }}
    >
      {/* 상단 헤더 */}
      <header style={{ marginBottom: '24px' }}>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            marginBottom: '8px',
          }}
        >
          <h1
            style={{
              fontSize: '24px',
              fontWeight: '700',
              margin: 0,
            }}
          >
            여행 리포트
          </h1>
          <span
            style={{
              fontSize: '12px',
              padding: '4px 10px',
              borderRadius: '999px',
              background: '#e5e7eb',
              color: '#374151',
            }}
          >
            {countryLabel} · {hasPlan ? `${totalDays}일 예상` : '일정 미완성'}
          </span>
        </div>

        <p style={{ fontSize: '14px', color: '#6b7280', margin: 0 }}>
          선택한 랜드마크를 기반으로 {countryLabel} 여행 일정을 요약해 드렸어요.
          <br />
          아래 리포트는 시연용 기본 버전이며, 향후 AI 추천과 세부 일정이 추가될 예정입니다.
        </p>
      </header>

      {/* 상단 요약 카드 3개 */}
      <section
        style={{
          display: 'flex',
          gap: '16px',
          marginBottom: '32px',
          flexWrap: 'wrap',
        }}
      >
        {/* 여행 기본 정보 카드 */}
        <div
          style={{
            flex: '1 1 260px',
            borderRadius: '12px',
            border: '1px solid #e5e7eb',
            background: '#ffffff',
            padding: '16px 20px',
          }}
        >
          <h2
            style={{
              fontSize: '16px',
              fontWeight: 600,
              margin: '0 0 8px',
            }}
          >
            여행 기본 정보
          </h2>
          <p style={{ margin: '4px 0', fontSize: '14px' }}>
            • 여행 국가: <strong>{countryLabel}</strong>
          </p>
          <p style={{ margin: '4px 0', fontSize: '14px' }}>
            • 방문 예정 랜드마크: <strong>{plan.length}곳</strong>
          </p>
          <p style={{ margin: '4px 0', fontSize: '14px' }}>
            • 일정 길이(예상): <strong>{totalDays}일</strong>
          </p>
          <p style={{ margin: '8px 0 0', fontSize: '12px', color: '#9ca3af' }}>
            하루에 한 곳씩 여유 있게 방문하는 기준으로 계산했어요.
          </p>
        </div>

        {/* 여행 톤 & 페이스 카드 */}
        <div
          style={{
            flex: '1 1 260px',
            borderRadius: '12px',
            border: '1px solid #e5e7eb',
            background: '#ffffff',
            padding: '16px 20px',
          }}
        >
          <h2
            style={{
              fontSize: '16px',
              fontWeight: 600,
              margin: '0 0 8px',
            }}
          >
            여행 스타일 요약
          </h2>
          {hasPlan ? (
            <>
              <p style={{ margin: '4px 0', fontSize: '14px', color: '#4b5563' }}>
                선택하신 랜드마크 구성을 보면,
                <br />
                <strong>{countryLabel}</strong>의 대표 관광지를 중심으로 한
                <strong> 기본 관광 코스</strong>에 가깝습니다.
              </p>
              <p style={{ margin: '4px 0', fontSize: '13px', color: '#6b7280' }}>
                하루에 1~2곳 정도 방문하는 느낌으로,
                <br />
                이동 동선과 휴식 시간을 고려한 여유 있는 일정이에요.
              </p>
            </>
          ) : (
            <p style={{ margin: '4px 0', fontSize: '14px', color: '#6b7280' }}>
              아직 일정에 추가된 랜드마크가 없어서
              <br />
              여행 스타일을 분석할 수 없어요.
            </p>
          )}
        </div>

        {/* 간단 가이드 카드 */}
        <div
          style={{
            flex: '1 1 260px',
            borderRadius: '12px',
            border: '1px solid #e5e7eb',
            background: '#ffffff',
            padding: '16px 20px',
          }}
        >
          <h2
            style={{
              fontSize: '16px',
              fontWeight: 600,
              margin: '0 0 8px',
            }}
          >
            간단 가이드
          </h2>
          <ul
            style={{
              margin: 0,
              paddingLeft: '18px',
              fontSize: '13px',
              color: '#6b7280',
            }}
          >
            <li style={{ marginBottom: '4px' }}>
              동선이 겹치지 않도록 같은 지역의 랜드마크는 같은 날에 배치해 보세요.
            </li>
            <li style={{ marginBottom: '4px' }}>
              인기 명소는 오전 일찍 방문하면 대기 시간을 줄일 수 있어요.
            </li>
            <li>
              여유 시간을 남겨 두고, 현지 카페·음식점 탐방도 함께 넣어 보세요.
            </li>
          </ul>
        </div>
      </section>

      {/* 메인 영역: 왼쪽 타임라인 + 오른쪽 하이라이트 */}
      <section
        style={{
          display: 'flex',
          gap: '24px',
          marginBottom: '32px',
          flexWrap: 'wrap',
        }}
      >
        {/* 왼쪽: 일정 타임라인 */}
        <div
          style={{
            flex: '2 1 360px',
            borderRadius: '12px',
            border: '1px solid #e5e7eb',
            background: '#ffffff',
            padding: '16px 20px',
          }}
        >
          <h2
            style={{
              fontSize: '18px',
              margin: '0 0 12px',
            }}
          >
            일정 구성
          </h2>

          {hasPlan ? (
            <ol
              style={{
                listStyle: 'none',
                padding: 0,
                margin: 0,
              }}
            >
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
                      minWidth: '70px',
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
          ) : (
            <p style={{ fontSize: '14px', color: '#6b7280', margin: 0 }}>
              일정에 추가된 랜드마크가 없어서 타임라인을 만들 수 없어요.
              <br />
              메인 화면에서 랜드마크를 선택해 일정을 구성해 주세요.
            </p>
          )}
        </div>

        {/* 오른쪽: 하이라이트 & 메모 */}
        <div
          style={{
            flex: '1 1 260px',
            display: 'flex',
            flexDirection: 'column',
            gap: '16px',
          }}
        >
          <div
            style={{
              borderRadius: '12px',
              border: '1px solid #e5e7eb',
              background: '#ffffff',
              padding: '16px 20px',
            }}
          >
            <h3
              style={{
                fontSize: '16px',
                fontWeight: 600,
                margin: '0 0 8px',
              }}
            >
              여행 하이라이트
            </h3>
            {hasPlan ? (
              <p
                style={{
                  fontSize: '13px',
                  color: '#6b7280',
                  margin: 0,
                }}
              >
                이번 여행의 핵심 포인트는{' '}
                <strong>{plan[0].name}</strong>
                {plan.length > 1 && '을(를) 시작으로 한 대표 명소 탐방 코스'}입니다.
                <br />
                이동 동선을 고려해, 서로 가까운 랜드마크를 같은 날에 묶어 보세요.
              </p>
            ) : (
              <p
                style={{
                  fontSize: '13px',
                  color: '#6b7280',
                  margin: 0,
                }}
              >
                아직 하이라이트로 묶을 랜드마크가 없어요.
                <br />
                가고 싶은 장소를 몇 군데 추가하면, 여행의 핵심 동선을 잡는 데 도움이 됩니다.
              </p>
            )}
          </div>

          <div
            style={{
              borderRadius: '12px',
              border: '1px solid #e5e7eb',
              background: '#ffffff',
              padding: '16px 20px',
            }}
          >
            <h3
              style={{
                fontSize: '16px',
                fontWeight: 600,
                margin: '0 0 8px',
              }}
            >
              메모 공간
            </h3>
            <p
              style={{
                fontSize: '13px',
                color: '#6b7280',
                margin: 0,
              }}
            >
              - 꼭 먹어보고 싶은 음식,
              <br />
              - 체크인/체크아웃 시간,
              <br />
              - 교통 패스 정보 등을 적어 두면 좋아요.
              <br />
              실제 서비스에서는 이 영역에 사용자의 메모/AI 추천이 들어갈 예정입니다.
            </p>
          </div>
        </div>
      </section>

      {/* 버튼 영역 */}
      <div
        style={{
          display: 'flex',
          gap: '8px',
          marginTop: '8px',
        }}
      >
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

        <button
          type="button"
          onClick={() => navigate('/')}
          style={{
            padding: '10px 22px',
            borderRadius: '999px',
            border: '1px solid #d1d5db',
            background: '#ffffff',
            color: '#374151',
            fontSize: '13px',
            cursor: 'pointer',
          }}
        >
          다른 국가로 다시 계획하기
        </button>
      </div>
    </div>
  );
}

export default Report;
