import { useState } from "react";
import { useNavigate } from "react-router-dom";
import RegionSelector from "../components/RegionSelector.jsx";
import DateSelector from "../components/DateSelector.jsx";
import "./RegionDatePage.css";

export default function RegionDatePage() {
  const [region, setRegion] = useState(null);
  const [dates, setDates] = useState({ start: null, end: null });
  const navigate = useNavigate();

  const isValid = region && dates.start && dates.end;

  const handleNext = () => {
    if (!isValid) return;
    navigate(`/map?region=${region}&start=${dates.start}&end=${dates.end}`);
  };

  return (
    <div className="region-date-page">
      <header className="rd-header">
        <h1 className="rd-title">여행 지역 & 날짜 선택</h1>
        <p className="rd-sub">
          여행할 도시와 기간을 선택하면, 다음 화면에서 해당 지역 지도가 열려요.
        </p>
      </header>

      <main className="rd-main">
        <section className="rd-left">
          <RegionSelector selected={region} onSelect={setRegion} />
        </section>

        <section className="rd-right">
          <DateSelector disabled={!region} dates={dates} setDates={setDates} />
        </section>
      </main>

      <footer className="rd-footer">
        <button
          className="rd-next-btn"
          disabled={!isValid}
          onClick={handleNext}
        >
          다음으로
        </button>
      </footer>
    </div>
  );
}
