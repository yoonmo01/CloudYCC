// src/pages/Home.jsx
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Home.css";

import JapanFlag from "../assets/flags/jp.svg";
import UKFlag from "../assets/flags/uk.svg";
import ThailandFlag from "../assets/flags/th.svg";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000";

// 백엔드에서 오는 코드(JP/TH/UK)에 맞춰 국기/라벨 매핑
const COUNTRY_FLAG_META = {
  JP: { label: "일본", flag: JapanFlag },
  TH: { label: "태국", flag: ThailandFlag },
  UK: { label: "영국", flag: UKFlag },
};

export default function Home() {
  const navigate = useNavigate();

  // UI 구조는 그대로 두고, 데이터만 상태로 관리
  const [countries, setCountries] = useState([
    // 초기 로딩 전에 보여줄 기본 값 (백엔드 실패 시에도 fallback)
    { key: "JP", label: "일본", flag: JapanFlag },
    { key: "UK", label: "영국", flag: UKFlag },
    { key: "TH", label: "태국", flag: ThailandFlag },
  ]);

  useEffect(() => {
    const fetchCountries = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/api/countries`);
        if (!res.ok) {
          console.error("Failed to fetch countries", res.status);
          return;
        }
        const data = await res.json(); // [{ code: "JP", name: "일본" }, ...]

        const mapped = data
          .map((c) => {
            const meta = COUNTRY_FLAG_META[c.code];
            if (!meta) return null;
            return {
              key: c.code,          // JP / TH / UK
              label: c.name,        // "일본" 등 (백엔드에서 온 name 사용)
              flag: meta.flag,
            };
          })
          .filter(Boolean);

        if (mapped.length > 0) {
          setCountries(mapped);
        }
      } catch (err) {
        console.error("Error fetching countries:", err);
      }
    };

    fetchCountries();
  }, []);

  // 클릭 시 main으로 이동
  const handleClick = (countryCode) => {
    // 백엔드는 JP/TH/UK 코드 사용
    navigate(`/main?country=${countryCode}`);
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
                onClick={() => handleClick(c.key)}
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
