export default function DateSelector({ disabled, dates, setDates }) {
  return (
    <div className="rd-date-wrapper">
      <h2 className="rd-section-title">여행 날짜를 선택하세요</h2>
      <p className="rd-section-sub">
        출발일과 도착일을 순서대로 선택해 주세요.
      </p>

      <div className={`rd-date-inputs ${disabled ? "rd-date-disabled" : ""}`}>
        <label className="rd-date-label">
          출발일
          <input
            type="date"
            disabled={disabled}
            value={dates.start || ""}
            onChange={(e) =>
              setDates((prev) => ({ ...prev, start: e.target.value }))
            }
          />
        </label>

        <label className="rd-date-label">
          도착일
          <input
            type="date"
            disabled={disabled}
            value={dates.end || ""}
            onChange={(e) =>
              setDates((prev) => ({ ...prev, end: e.target.value }))
            }
          />
        </label>
      </div>
    </div>
  );
}
