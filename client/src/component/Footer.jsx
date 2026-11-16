import { Link } from "react-router-dom";
import "./Footer.css";

export const CONTACT_EMAIL = "kontakt@maturazinformatyki.it";

const MENU = [
  { to: "/", label: "Artykuły" },
  { to: "/kursy", label: "Kursy" },
  { to: "/quizy", label: "Quizy" },
  { to: "/polityka-cookies", label: "Polityka cookies" },
];

// Stopka strony: nazwa, krótkie menu i kontakt.
// nameQuiz — nazwa bieżącej sekcji (np. „Kursy”, tytuł quizu), pokazywana obok nazwy strony.
const Footer = ({ nameQuiz }) => {
  const year = new Date().getFullYear();

  return (
    <footer className="mzi-footer">
      <div className="mzi-footer-inner">
        <div className="mzi-footer-brand">
          <Link to="/" className="mzi-footer-logo">
            maturazinformatyki<span className="mzi-footer-yellow">.it</span>
          </Link>
          <p className="mzi-footer-tagline">
            Artykuły, kursy i quizy przygotowujące do matury z informatyki.
          </p>
        </div>

        <nav className="mzi-footer-nav" aria-label="Menu w stopce">
          <h2 className="mzi-footer-heading">Na stronie</h2>
          <ul>
            {MENU.map((m) => (
              <li key={m.to}>
                <Link to={m.to}>{m.label}</Link>
              </li>
            ))}
          </ul>
        </nav>

        <div className="mzi-footer-contact">
          <h2 className="mzi-footer-heading">Kontakt</h2>
          <a href={`mailto:${CONTACT_EMAIL}`} className="mzi-footer-mail">
            {CONTACT_EMAIL}
          </a>
          <p className="mzi-footer-note">Pytania o kursy, dostęp i błędy na stronie.</p>
        </div>
      </div>

      <div className="mzi-footer-bottom">
        <p>
          © {year} maturazinformatyki.it
          {nameQuiz && (
            <>
              {" "}· <span className="mzi-footer-yellow">{nameQuiz}</span>
            </>
          )}
        </p>
      </div>
    </footer>
  );
};

export default Footer;
