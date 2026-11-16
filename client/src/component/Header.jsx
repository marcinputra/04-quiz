import { useEffect, useRef, useState } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";
import "./Header.css";

const Header = () => {
  const { user, isAdmin, loading, logout } = useAuth();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false); // menu mobilne (burger)
  const headerRef = useRef(null);

  // zamykanie menu mobilnego: Escape, kliknięcie poza nagłówkiem, przejście do widoku komputerowego
  useEffect(() => {
    if (!open) return;
    const onKey = (e) => {
      if (e.key === "Escape") {
        setOpen(false);
        headerRef.current?.querySelector(".mzi-header-burger")?.focus();
      }
    };
    const onClick = (e) => {
      if (!headerRef.current?.contains(e.target)) setOpen(false);
    };
    const desktop = window.matchMedia("(min-width: 861px)");
    const onDesktop = (e) => e.matches && setOpen(false);
    document.addEventListener("keydown", onKey);
    document.addEventListener("mousedown", onClick);
    desktop.addEventListener("change", onDesktop);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.removeEventListener("mousedown", onClick);
      desktop.removeEventListener("change", onDesktop);
    };
  }, [open]);

  // kliknięcie linku lub przycisku w menu zamyka je
  const closeOnNavigate = (e) => {
    if (e.target.closest("a, button")) setOpen(false);
  };

  const handleLogout = async () => {
    // najpierw wyjście ze strony chronionej — inaczej RequireAuth zdąży
    // przekierować na /logowanie (z powrotem do strony admina po zalogowaniu)
    navigate("/", { replace: true });
    await logout();
  };

  return (
    <header className={`mzi-header${open ? " is-open" : ""}`} ref={headerRef}>
      <div className="mzi-header-inner">
        <Link to="/" className="mzi-header-logo" onClick={() => setOpen(false)}>
          maturazinformatyki<span className="mzi-header-yellow">.it</span>
        </Link>

        <button
          type="button"
          className="mzi-header-burger"
          aria-expanded={open}
          aria-controls="mzi-header-nav"
          aria-label={open ? "Zamknij menu" : "Otwórz menu"}
          onClick={() => setOpen((o) => !o)}
        >
          <span className="mzi-header-burger-bar" />
          <span className="mzi-header-burger-bar" />
          <span className="mzi-header-burger-bar" />
        </button>

        <nav id="mzi-header-nav" className="mzi-header-nav" aria-label="Menu główne" onClick={closeOnNavigate}>
          <NavLink to="/" end className="mzi-header-link">
            Artykuły
          </NavLink>
          <NavLink to="/kursy" className="mzi-header-link">
            Kursy
          </NavLink>
          <NavLink to="/quizy" className="mzi-header-link">
            Quizy
          </NavLink>

          {!loading && isAdmin && (
            <NavLink to="/admin" className="mzi-header-link">
              Panel admina
            </NavLink>
          )}

          {!loading && user && (
            <>
              <NavLink to="/moje-wyniki" className="mzi-header-link">
                Moje wyniki
              </NavLink>
              <NavLink to="/konto" className="mzi-header-link mzi-header-user" title={user.email}>
                {user.name}
              </NavLink>
              <button type="button" onClick={handleLogout} className="mzi-header-btn">
                Wyloguj
              </button>
            </>
          )}

          {!loading && !user && (
            <>
              <NavLink to="/logowanie" className="mzi-header-link">
                Zaloguj
              </NavLink>
              <NavLink to="/rejestracja" className="mzi-header-btn">
                Załóż konto
              </NavLink>
            </>
          )}
        </nav>
      </div>
    </header>
  );
};

export default Header;
