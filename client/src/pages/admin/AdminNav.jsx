import { useEffect, useState } from "react";
import { NavLink } from "react-router-dom";
import { api } from "../../api";
import "./Admin.css";

const PENDING_EVENT = "mzi-pending-enrollments-changed";

// wywołaj po zatwierdzeniu / odrzuceniu, żeby odświeżyć licznik w zakładce „Zapisy”
export const notifyPendingChanged = () => window.dispatchEvent(new Event(PENDING_EVENT));

// Zakładki panelu admina (przy „Zapisy” liczba oczekujących próśb)
function AdminNav() {
  const [pending, setPending] = useState(0);

  useEffect(() => {
    const load = () =>
      api("/admin/enrollments/pending-count")
        .then((d) => setPending(d.count))
        .catch(() => {});
    load();
    window.addEventListener(PENDING_EVENT, load);
    return () => window.removeEventListener(PENDING_EVENT, load);
  }, []);

  return (
    <nav className="mzi-admin-nav" aria-label="Panel admina">
      <NavLink to="/admin" end className="mzi-admin-tab">Wyniki i konta</NavLink>
      <NavLink to="/admin/quizy" className="mzi-admin-tab">Quizy</NavLink>
      <NavLink to="/admin/kursy" className="mzi-admin-tab">Kursy</NavLink>
      <NavLink to="/admin/zapisy" className="mzi-admin-tab">
        Zapisy
        {pending > 0 && (
          <span className="mzi-admin-count" aria-label={`${pending} oczekujących`}>{pending}</span>
        )}
      </NavLink>
      <NavLink to="/admin/artykuly" className="mzi-admin-tab">Artykuły</NavLink>
    </nav>
  );
}

export default AdminNav;
