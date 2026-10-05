import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Header from './Header';
import Sidebar from './Sidebar';

export default function MainLayout() {
  const [navOpen, setNavOpen] = useState(false);

  return (
    <div className={`app-shell${navOpen ? ' nav-open' : ''}`}>
      <a className="skip-link" href="#noi-dung">Bỏ qua đến nội dung</a>
      {navOpen && <button type="button" className="nav-scrim" aria-label="Đóng menu" onClick={() => setNavOpen(false)} />}
      <Sidebar onNavigate={() => setNavOpen(false)} />
      <div className="main-panel">
        <Header navOpen={navOpen} onToggleNav={() => setNavOpen((open) => !open)} />
        <main id="noi-dung" className="content">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
