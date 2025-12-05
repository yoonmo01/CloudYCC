// src/App.jsx
import { Routes, Route } from "react-router-dom";
import Home from "./pages/Home.jsx";
import Main from "./pages/Main.jsx";
import Report from "./pages/Report.jsx";

export default function App() {
  return (
    <Routes>
      {/* 국기 선택 / 시작 화면 */}
      <Route path="/" element={<Home />} />

      {/* 지도 + 체크리스트 메인 화면 */}
      <Route path="/main" element={<Main />} />

      {/* 리포트 화면 */}
      <Route path="/report" element={<Report />} />
    </Routes>
  );
}
