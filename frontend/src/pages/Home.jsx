// src/pages/Home.jsx
import React from "react";
import { useNavigate } from "react-router-dom";   // ✅ 추가
import "./Home.css";

import JapanFlag from "../assets/flags/jp.svg";
import UKFlag from "../assets/flags/uk.svg";
import ThailandFlag from "../assets/flags/th.svg";

export default function Home() {
  const navigate = useNavigate();  // ✅ 훅 사용

  const countries = [
    { key: "japan", label: "일본", flag: JapanFlag },
    { key: "uk", label: "영국", flag: UKFlag },
    { key: "thailand", label: "태국", flag: ThailandFlag },
  ];

  // ✅ 클릭 시 main으로 이동 (나중에 country 정보도 같이 쓸 수 있음)
  const handleClick = (code) => {
    // 단순히 main으로만 가고 싶으면: navigate("/main");
    navigate(`/main?country=${code}`);
  };

  return (
    <div className="home-wrapper">
      <div className="home-content">
        <h1 className="home-title">TripTailor</h1>
        <p className="home-subtitle">“여행을 재단하듯, 나만의 맞춤 일정”</p>

        <p className="home-question">어디로 떠나시나요?</p>

        <div className="country-container">
          {countries.map((c) => (
            <div key={c.key} className="country-item">
              <button
                className="country-circle"
                onClick={() => handleClick(c.key)}   // ✅ 여기서 이동
              >
                <img src={c.flag} alt={c.label} className="country-flag" />
              </button>
              <p className="country-label">{c.label}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
