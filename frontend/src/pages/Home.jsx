// src/pages/Home.jsx
import { useNavigate } from 'react-router-dom';
import './Home.css';

// 국기 이미지 import (경로/파일명 꼭 맞춰줘야 함)
import jpFlag from '../assets/flags/jp.svg';
import ukFlag from '../assets/flags/uk.svg';
import thFlag from '../assets/flags/th.svg';

const COUNTRIES = [
  { code: 'JP', name: '일본', flag: jpFlag },
  { code: 'UK', name: '영국', flag: ukFlag },
  { code: 'TH', name: '태국', flag: thFlag },
];

function Home() {
  const navigate = useNavigate();

  // 클릭 시 /main?country=코드 로 이동
  const handleSelectCountry = (code) => {
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
              <div className="home-country-circle">
                <img
                  src={c.flag}
                  alt={c.name}
                  style={{
                    width: '70%',
                    height: '70%',
                    borderRadius: '50%',
                    objectFit: 'cover',
                  }}
                />
              </div>
              <span className="home-country-label">{c.name}</span>
            </button>
          ))}
        </div>
      </main>
    </div>
  );
}

export default Home;
