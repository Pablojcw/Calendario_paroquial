import { useState } from 'react';
import { NavLink, Link, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.js';

export function AdminLayout() {
  const { user, logout } = useAuth();
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  return (
    <div className="admin-wrapper">
      <header className="site-header">
        <div className="site-header__inner">
          <Link to="/admin" className="site-header__brand">
            <img
              src="/images/brasao.png"
              alt="Brasão da Paróquia"
              className="site-header__logo"
            />
            <div className="site-header__titles">
              <span className="site-header__title">Administração Paroquial</span>
              <span className="site-header__subtitle">
                Gestão da Agenda & Comunidades <span className="site-header__badge-year">Admin</span>
              </span>
            </div>
          </Link>

          <button
            type="button"
            className="site-header__toggle"
            aria-label="Menu administrativo"
            onClick={() => setMobileNavOpen((o) => !o)}
          >
            {mobileNavOpen ? '✕' : '☰'}
          </button>

          <nav className={`site-header__nav ${mobileNavOpen ? 'is-open' : ''}`}>
            <NavLink to="/admin" end onClick={() => setMobileNavOpen(false)}>
              Painel
            </NavLink>
            <NavLink to="/admin/eventos" onClick={() => setMobileNavOpen(false)}>
              Eventos
            </NavLink>
            <NavLink to="/admin/eventos/novo" onClick={() => setMobileNavOpen(false)}>
              + Novo Evento
            </NavLink>
            <NavLink to="/admin/sequencia-nova" onClick={() => setMobileNavOpen(false)}>
              Sequência
            </NavLink>
            <NavLink to="/admin/categorias" onClick={() => setMobileNavOpen(false)}>
              Categorias
            </NavLink>
            <NavLink to="/admin/comunidades" onClick={() => setMobileNavOpen(false)}>
              Comunidades
            </NavLink>
            <NavLink to="/admin/institucional" onClick={() => setMobileNavOpen(false)}>
              Institucional
            </NavLink>
            <NavLink to="/admin/historico" onClick={() => setMobileNavOpen(false)}>
              Histórico
            </NavLink>
            <Link to="/" className="site-header__nav-login" title="Ver site público">
              🌐 Ver site
            </Link>
            <button
              type="button"
              className="btn btn--sm btn--danger"
              onClick={logout}
              title={`Sair (${user?.nome ?? ''})`}
              style={{ marginLeft: '0.4rem', fontWeight: 600 }}
            >
              Sair
            </button>
          </nav>
        </div>
        <div className="site-header__stripe" />
      </header>

      {/* SUB-BARRA COM STATUS DO USUÁRIO */}
      <div className="admin-subbar">
        <div className="admin-subbar__inner">
          <div className="admin-subbar__user">
            <span>👤</span> Conectado como <strong>{user?.nome}</strong>{' '}
            <span className="badge" style={{ background: '#e0f2fe', color: 'var(--primary)', fontWeight: 700, fontSize: '0.72rem' }}>
              {user?.papel}
            </span>
          </div>
          <Link to="/" className="admin-subbar__back">
            ← Voltar para o site público
          </Link>
        </div>
      </div>

      <main className="site-content">
        <Outlet />
      </main>
    </div>
  );
}