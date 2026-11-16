import { useLayoutEffect, useRef, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import "./CookieNotice.css";

const STORAGE_KEY = "mzi_cookie_notice";

function wasDismissed() {
  try {
    return localStorage.getItem(STORAGE_KEY) === "1";
  } catch {
    return false; // brak dostępu do pamięci przeglądarki — pokażemy informację
  }
}

// Pasek z informacją o ciasteczkach (dół ekranu). Strona używa wyłącznie ciasteczek
// niezbędnych do działania, więc nie jest potrzebna zgoda — tylko informacja.
// Po kliknięciu „Rozumiem” pasek nie pokazuje się więcej na tym urządzeniu.
function CookieNotice() {
  const [visible, setVisible] = useState(() => !wasDismissed());
  const location = useLocation();
  const boxRef = useRef(null);
  const [spacer, setSpacer] = useState(0);
  const shown = visible && location.pathname !== "/polityka-cookies";

  // pasek jest przyklejony do dołu ekranu — pod treścią strony (stopką) rezerwujemy
  // tyle miejsca, ile zajmuje, żeby niczego nie zasłaniał; po zamknięciu odstęp znika
  useLayoutEffect(() => {
    const box = boxRef.current;
    if (!shown || !box) return;
    const update = () => setSpacer(box.offsetHeight + 24);
    update();
    const ro = new ResizeObserver(update);
    ro.observe(box);
    return () => ro.disconnect();
  }, [shown]);

  if (!shown) return null;

  const dismiss = () => {
    try {
      localStorage.setItem(STORAGE_KEY, "1");
    } catch {
      // nie da się zapamiętać — schowamy tylko do odświeżenia strony
    }
    setVisible(false);
  };

  return (
    <>
    <div className="mzi-cookie-spacer" style={{ height: spacer }} aria-hidden="true" />
    <div ref={boxRef} className="mzi-cookie" role="region" aria-label="Informacja o plikach cookies">
      <p className="mzi-cookie-text">
        🍪 Ta strona używa <strong>wyłącznie niezbędnych plików cookies</strong> — do logowania i bezpieczeństwa konta.
        Nie używamy ciasteczek reklamowych ani analitycznych.{" "}
        <Link to="/polityka-cookies" className="mzi-cookie-link">Więcej informacji</Link>
      </p>
      <button type="button" className="mzi-cookie-btn" onClick={dismiss}>
        Rozumiem
      </button>
    </div>
    </>
  );
}

export default CookieNotice;
