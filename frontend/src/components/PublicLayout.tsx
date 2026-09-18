import { NavLink, Link, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.js';

export function PublicLayout() {
  const { user } = useAuth();

  return (
    <div>
      <header className="site-header">
        <div className="site-header__inner">
          <h1>
            <Link to="/" style={{ color: '#fff' }}>
              Paróquia Nossa Senhora de Fátima e São Francisco de Paula
            </Link>
            <small>Agenda Pastoral — Presidente Venceslau/SP</small>
          </h1>
          <nav>
            <NavLink to="/" end>
              Calendário
            </NavLink>
            <NavLink to="/proximos">Próximos eventos</NavLink>
            <NavLink to="/institucional">A paróquia</NavLink>
            {user ? (
              <NavLink to="/admin">Área administrativa</NavLink>
            ) : (
              <NavLink to="/login">Entrar</NavLink>
            )}
          </nav>
        </div>
      </header>

      <main className="site-content">
        <Outlet />
      </main>

      <footer className="site-footer">
        <Link to="/">Calendário Paroquial Digital</Link> · Agenda oficial da paróquia · Presidente Venceslau/SP
      </footer>
    </div>
  );
}