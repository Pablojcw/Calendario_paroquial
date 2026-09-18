import { NavLink, Link, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.js';

export function AdminLayout() {
  const { user, logout } = useAuth();

  return (
    <div className="site-content">
      <header className="site-header" style={{ margin: '-1.2rem -1rem 0' }}>
        <div className="site-header__inner">
          <h1>Área administrativa</h1>
          <nav>
            <NavLink to="/admin" end>
              Painel
            </NavLink>
            <NavLink to="/admin/eventos">Eventos</NavLink>
            <NavLink to="/admin/eventos/novo">Novo evento</NavLink>
            <NavLink to="/admin/sequencia-nova">Nova sequência</NavLink>
            <NavLink to="/admin/categorias">Categorias</NavLink>
            <NavLink to="/admin/comunidades">Comunidades</NavLink>
            <NavLink to="/admin/institucional">Institucional</NavLink>
            <NavLink to="/admin/historico">Histórico</NavLink>
            <NavLink to="/">Ver site</NavLink>
            <button
              type="button"
              onClick={logout}
              title={`Sair (${user?.nome ?? ''})`}
              style={{ background: 'rgba(255,255,255,0.15)', color: '#fff', border: 'none' }}
            >
              Sair
            </button>
          </nav>
        </div>
      </header>

      <div className="admin-bar" style={{ background: 'transparent' }}>
        <span style={{ color: 'var(--muted)', fontSize: '0.9rem' }}>
          Conectado como <strong>{user?.nome}</strong> ({user?.papel})
        </span>
        <Link to="/">← Voltar ao site</Link>
      </div>

      <main>
        <Outlet />
      </main>
    </div>
  );
}