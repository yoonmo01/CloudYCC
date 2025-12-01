// src/pages/Home.jsx
import { useNavigate } from 'react-router-dom';
import './Home.css';

const COUNTRIES = [
  { code: 'JP', name: '일본' },
  { code: 'UK', name: '영국' },
  { code: 'TH', name: '태국' },
];

function Home() {
  const navigate = useNavigate();

  const handleSelectCountry = (code) => {
  // 선택한 국가 코드 쿼리스트링으로 전달
  navigate(`/main?country=${code}`);
};


  return (
    <div className="home-root">
      <header className="home-header">
        <h1 className="home-logo">TripTailor</h1>
        <p className="home-tagline">“여행을 재단하듯, 나만의 맞춤 일정”</p>
      </header>

      <main className="home-main">
        <p className="home-question">어디로 떠나시나요?</p>

        <div className="home-country-row">
          {COUNTRIES.map((c) => (
            <button
              key={c.code}
              type="button"
              className="home-country-item"
              onClick={() => handleSelectCountry(c.code)}
            >
              <div className="home-country-circle">국기</div>
              <span className="home-country-label">{c.name}</span>
            </button>
          ))}
        </div>
      </main>
    </div>
  );
}

export default Home;
