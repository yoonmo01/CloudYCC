export default function RegionSelector({ selected, onSelect }) {
  const regions = [
    { id: "london", name: "런던" },
    { id: "manchester", name: "맨체스터" },
    { id: "liverpool", name: "리버풀" },
  ];

  return (
    <div>
      <h2 className="rd-section-title">어디로 떠나시나요?</h2>
      <p className="rd-section-sub">
        도시를 선택하면, 해당 지역 지도로 이동해서 랜드마크를 고를 수 있어요.
      </p>

      <div className="rd-region-list">
        {regions.map((r) => (
          <button
            key={r.id}
            type="button"
            className={`rd-region-card ${
              selected === r.id ? "rd-region-card-selected" : ""
            }`}
            onClick={() => onSelect(r.id)}
          >
            {r.name}
          </button>
        ))}
      </div>
    </div>
  );
}
