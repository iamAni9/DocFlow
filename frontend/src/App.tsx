import { useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Login from './components/Login';
import Dashboard from './components/Dashboard';
import Editor from './components/Editor';
import './index.css';

const App = () => {
  const [userId, setUserId] = useState<string | null>(localStorage.getItem('userId'));

  const handleLogin = (id: string, username: string) => {
    localStorage.setItem('userId', id);
    localStorage.setItem('username', username);
    setUserId(id);
  };

  const handleLogout = () => {
    localStorage.removeItem('userId');
    localStorage.removeItem('username');
    setUserId(null);
  };

  return (
    <BrowserRouter>
      {userId && (
        <header className="navbar">
          <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            <img src="/logo_symbol.svg" alt="DocFlow Logo" style={{ width: 30, height: 30, objectFit: 'contain' }} />
            <h1 style={{ fontSize: '16px', fontWeight: 600, color: 'var(--ink)', letterSpacing: '-0.3px' }}>DocFlow</h1>
          </div>
          <div style={{ display: 'flex', gap: '4px', alignItems: 'center' }}>
            <span style={{ fontSize: '14px', color: 'var(--charcoal)', fontWeight: 500 }}>{localStorage.getItem('username')}</span>
            <button className="btn-secondary btn" onClick={handleLogout} style={{ padding: '6px 12px' }}>Log out</button>
          </div>
        </header>
      )}

      <main>
        <Routes>
          <Route path="/login" element={!userId ? <Login onLogin={handleLogin} /> : <Navigate to="/" />} />
          <Route path="/" element={userId ? <Dashboard /> : <Navigate to="/login" />} />
          <Route path="/doc/:id" element={userId ? <Editor /> : <Navigate to="/login" />} />
        </Routes>
      </main>
    </BrowserRouter>
  );
};

export default App;
