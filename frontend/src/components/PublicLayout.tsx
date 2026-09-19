import { useState } from 'react';
import { NavLink, Link, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.js';

export function PublicLayout() {
  const { user } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Fecha o menu mobile ao trocar de rota
  const handleNavClick = () => {
    setMobileMenuOpen(false);
  };

  return (
    <div className="site-wrapper">
      <header className="site-header">
        <div className="site-header__inner">
          <Link to="/" className="site-header__brand" onClick={handleNavClick}>
            <img
              src="/images/brasao.png"
              alt="Brasão da Paróquia Nossa Senhora de Fátima e São Francisco de Paula"
              className="site-header__logo"
            />
            <div className="site-header__titles">
              <span className="site-header__title">
                Paróquia Nossa Senhora de Fátima
              </span>
              <span className="site-header__subtitle">
                e São Francisco de Paula <span className="site-header__badge-year">1931</span>
              </span>
            </div>
          </Link>

          <button
            type="button"
            className="site-header__toggle"
            aria-label="Abrir menu de navegação"
            aria-expanded={mobileMenuOpen}
            onClick={() => setMobileMenuOpen((open) => !open)}
          >
            {mobileMenuOpen ? '✕' : '☰'}
          </button>

          <nav className={`site-header__nav ${mobileMenuOpen ? 'is-open' : ''}`}>
            <NavLink to="/" end onClick={handleNavClick}>
              Calendário
            </NavLink>
            <NavLink to="/proximos" onClick={handleNavClick}>
              Próximos
            </NavLink>
            <NavLink to="/missas" onClick={handleNavClick}>
              Missas
            </NavLink>
            <NavLink to="/capelas" onClick={handleNavClick}>
              Capelas
            </NavLink>
            <NavLink to="/atividades" onClick={handleNavClick}>
              Atividades Pastorais
            </NavLink>
            <NavLink to="/sacramentos" onClick={handleNavClick}>
              Sacramentos
            </NavLink>
            <NavLink to="/institucional" onClick={handleNavClick}>
              A Paróquia
            </NavLink>

            {user ? (
              <NavLink to="/admin" className="site-header__nav-login" onClick={handleNavClick}>
                Painel Admin
              </NavLink>
            ) : (
              <NavLink to="/login" className="site-header__nav-login" onClick={handleNavClick}>
                Entrar
              </NavLink>
            )}
          </nav>
        </div>
        <div className="site-header__stripe" />
      </header>

      <main className="site-content">
        <Outlet />
      </main>

      <footer className="site-footer">
        <div className="site-footer__inner">
          <div>
            <h4>Paróquia Nossa Senhora de Fátima e São Francisco de Paula</h4>
            <p>Diocese de Presidente Prudente</p>
            <p>Presidente Venceslau — SP · Fundada em 05 de outubro de 1931</p>
            <p><em>"Paróquia de gente feliz — Quase um século de história, fé e missão."</em></p>
          </div>

          <div>
            <h4>Secretaria Paroquial</h4>
            <p><strong>Endereço:</strong> Av. João Pessoa, nº 488, Centro</p>
            <p><strong>CEP:</strong> 19400-065 · Presidente Venceslau (SP)</p>
            <p><strong>Expediente:</strong></p>
            <p>Segunda a sexta-feira: 7h30 às 17h</p>
            <p>Sábado: 8h às 12h</p>
          </div>

          <div>
            <h4>Contatos Oficiais</h4>
            <p><strong>Telefone:</strong> (18) 3271-3785</p>
            <p><strong>WhatsApp:</strong> (18) 99713-3785</p>
            <p><strong>E-mail:</strong> pvparoquiansfatima@hotmail.com</p>
            <p><strong>Instagram:</strong> <a href="https://instagram.com/paroquia_fatima" target="_blank" rel="noopener noreferrer">@paroquia_fatima</a></p>
          </div>
        </div>

        <div className="site-footer__bottom">
          <p>© 2026 Paróquia Nossa Senhora de Fátima e São Francisco de Paula. Todos os direitos reservados.</p>
        </div>
      </footer>
    </div>
  );
}