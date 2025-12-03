// src/App.jsx
import { Routes, Route, Link, useLocation } from 'react-router-dom';
import Home from './pages/Home';
import Main from './pages/Main';
import Report from './pages/Report';

function AppHeader() {
  const location = useLocation();
  const path = location.pathname;

  return (
    <header
      style={{
        height: 56,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 24px',
        borderBottom: '1px solid #e5e7eb',
        background: 'rgba(255,255,255,0.9)',
        backdropFilter: 'blur(10px)',
        position: 'sticky',
        top: 0,
        zIndex: 20,
      }}
    >
      <Link
        to="/"
        style={{
          fontSize: 18,
          fontWeight: 700,
          letterSpacing: '0.08em',
        }}
      >
        TripTailor
      </Link>

      <nav
        style={{
          display: 'flex',
          gap: '16px',
          fontSize: 13,
        }}
      >
        <Link
          to="/"
          style={{
            padding: '6px 10px',
            borderRadius: 999,
            border: path === '/' ? '1px solid #111827' : '1px solid transparent',
            background: path === '/' ? '#111827' : 'transparent',
            color: path === '/' ? '#ffffff' : '#4b5563',
          }}
        >
          Home
        </Link>
        <Link
          to="/main"
          style={{
            padding: '6px 10px',
            borderRadius: 999,
            border: path === '/main' ? '1px solid #111827' : '1px solid transparent',
            background: path === '/main' ? '#111827' : 'transparent',
            color: path === '/main' ? '#ffffff' : '#4b5563',
          }}
        >
          Main
        </Link>
        <Link
          to="/report"
          style={{
            padding: '6px 10px',
            borderRadius: 999,
            border:
              path === '/report' ? '1px solid #111827' : '1px solid transparent',
            background: path === '/report' ? '#111827' : 'transparent',
            color: path === '/report' ? '#ffffff' : '#4b5563',
          }}
        >
          Report
        </Link>
      </nav>
    </header>
  );
}

function App() {
  return (
    <div>
      <AppHeader />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/main" element={<Main />} />
        <Route path="/report" element={<Report />} />
      </Routes>
    </div>
  );
}

export default App;
