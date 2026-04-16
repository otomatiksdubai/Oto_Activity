import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useNavigate, useLocation } from 'react-router-dom';
import { Analytics } from '@vercel/analytics/react';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Students from './pages/Students';
import Staff from './pages/Staff';
import Sessions from './pages/Sessions';
import Attendance from './pages/Attendance';
import Fees from './pages/Fees';
import Reports from './pages/Reports';
import logo from './assets/logo.png';

import Landing from './pages/Landing';

import { GlobalBackground } from './components/GlobalAssets';
import { Analytics } from "@vercel/analytics/react"

function App() {
  const [user, setUser] = useState(null);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    // Check if user is logged in
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');
    if (token && userData) {
      setUser(JSON.parse(userData));
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    navigate('/login');
  };

  const isPublicPage = location.pathname === '/' || location.pathname === '/login';

  if (!user && !isPublicPage) {
    return <Login setUser={setUser} />;
  }

  // Dashboard Nav for Sidebar
  const allNavigation = [
    { name: 'Dashboard', path: '/dashboard', roles: ['admin', 'staff', 'trainer', 'parent'] },
    { name: 'Students', path: '/students', roles: ['admin', 'staff', 'trainer'] },
    { name: 'Staff', path: '/staff', roles: ['admin', 'staff'] },
    { name: 'Sessions', path: '/sessions', roles: ['admin', 'staff', 'trainer'] },
    { name: 'Attendance', path: '/attendance', roles: ['admin', 'staff', 'trainer'] },
    { name: 'Fees/Invoices', path: '/fees', roles: ['admin', 'staff', 'parent'] },
    { name: 'Reports', path: '/reports', roles: ['admin', 'staff'] }
  ];

  const navigation = user ? allNavigation.filter(item => item.roles.includes(user.role)) : [];

  // If on landing page, don't show the internal portal layout
  if (location.pathname === '/' && !user) {
    return (
      <>
        <Landing />
      </>
    );
  }

  // If user is logged in and tries to access landing, maybe redirect to dashboard?
  // Or just let them see the landing page. Let's redirect to dashboard if they are logged in and hit / login
  if (user && location.pathname === '/login') {
    navigate('/dashboard');
    return null;
  }

  return (
    <div className="container">
      {user && (
        <div className="topbar">
          <div className="brand">
            <img src={logo} alt="Otomatiks Logo" className="logo-img" />
            <div className="small muted" style={{ marginLeft: 'auto' }}>
              Logged in as {user.username} ({user.role})
            </div>
          </div>
          <div className="actions" style={{ marginLeft: '10px' }}>
            <button className="btn ghost" onClick={handleLogout}>Logout</button>
          </div>
        </div>
      )}

      <div className={user ? "layout" : ""}>
        {user && (
          <aside className="sidebar">
            <div className="badge">MENU</div>
            <nav className="nav" style={{ marginTop: '10px' }}>
              {navigation.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`nav-link ${location.pathname === item.path ? 'active' : ''}`}
                >
                  {item.name}
                </Link>
              ))}
            </nav>
          </aside>
        )}

        <main className={user ? "card" : ""}>
          <Routes>
            <Route path="/" element={<Landing />} />
            <Route path="/login" element={<Login setUser={setUser} />} />
            <Route path="/dashboard" element={<Dashboard user={user} />} />
            <Route path="/students" element={<Students />} />
            <Route path="/staff" element={<Staff />} />
            <Route path="/sessions" element={<Sessions />} />
            <Route path="/attendance" element={<Attendance />} />
            <Route path="/fees" element={<Fees />} />
            <Route path="/reports" element={<Reports />} />
          </Routes>
        </main>
      </div>
    </div>
  );
}

export default function AppWrapper() {
  return (
    <Router>
      <GlobalBackground />
      <Analytics />
      <App />
      <Analytics />
    </Router>
  );
}
