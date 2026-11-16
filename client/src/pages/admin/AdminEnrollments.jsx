import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../../api";
import AdminNav, { notifyPendingChanged } from "./AdminNav";
import { formatDateTime } from "../resultsUtils";
import "../Auth.css";
import "./Admin.css";

const TABS = [
  ["pending", "Oczekujące"],
  ["approved", "Zatwierdzone"],
  ["rejected", "Odrzucone"],
];

// /admin/zapisy — prośby o dostęp do kursów: zatwierdzanie i odrzucanie
function AdminEnrollments() {
  const [tab, setTab] = useState("pending");
  const [items, setItems] = useState(null);
  const [error, setError] = useState("");
  const [busyKey, setBusyKey] = useState(null);
  const [message, setMessage] = useState("");

  const load = useCallback(() => {
    setItems(null);
    api(`/admin/enrollments?status=${tab}`)
      .then(setItems)
      .catch((err) => setError(err.message));
  }, [tab]);

  useEffect(load, [load]);

  const key = (e) => `${e.user.id}-${e.course.id}`;

  const decide = async (e, status) => {
    setBusyKey(key(e));
    setError("");
    setMessage("");
    try {
      await api(`/admin/enrollments/${e.user.id}/${e.course.id}`, { method: "PATCH", body: { status } });
      setMessage(
        status === "approved"
          ? `Zatwierdzono: ${e.user.name} → „${e.course.title}”. Uczeń dostał e-mail.`
          : `Odrzucono: ${e.user.name} → „${e.course.title}”. Uczeń dostał e-mail.`
      );
      notifyPendingChanged();
      load();
    } catch (err) {
      setError(err.message);
    } finally {
      setBusyKey(null);
    }
  };

  const remove = async (e) => {
    if (!window.confirm(`Usunąć zapis ${e.user.name} na kurs „${e.course.title}”? Uczeń straci dostęp i będzie mógł poprosić od nowa.`)) return;
    setBusyKey(key(e));
    try {
      await api(`/admin/enrollments/${e.user.id}/${e.course.id}`, { method: "DELETE" });
      notifyPendingChanged();
      load();
    } catch (err) {
      setError(err.message);
    } finally {
      setBusyKey(null);
    }
  };

  return (
    <div className="mzi-auth-page mzi-auth-page-wide">
      <div className="mzi-auth-card mzi-admin-card">
        <h1 className="mzi-auth-title">Panel admina</h1>
        <AdminNav />

        <div className="mzi-admin-subtabs" role="tablist" aria-label="Status zapisów">
          {TABS.map(([value, label]) => (
            <button
              key={value}
              type="button"
              role="tab"
              aria-selected={tab === value}
              className={`mzi-admin-subtab ${tab === value ? "active" : ""}`}
              onClick={() => { setTab(value); setMessage(""); }}
            >
              {label}
            </button>
          ))}
        </div>

        {error && <p className="mzi-auth-error" role="alert">{error}</p>}
        {message && <p className="mzi-auth-success" role="status">{message}</p>}
        {!items && !error && <p className="mzi-auth-muted">Ładowanie...</p>}
        {items && items.length === 0 && (
          <p className="mzi-auth-muted">
            {tab === "pending" ? "Brak oczekujących próśb o dostęp." : "Brak zapisów w tej kategorii."}
          </p>
        )}

        {items && items.length > 0 && (
          <div className="mzi-admin-table-wrap">
            <table className="mzi-admin-table">
              <thead>
                <tr>
                  <th>Uczeń</th>
                  <th>Kurs</th>
                  <th>Prośba</th>
                  {tab !== "pending" && <th>Decyzja</th>}
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {items.map((e) => (
                  <tr key={key(e)}>
                    <td className="mzi-admin-wrap">
                      <strong>{e.user.name}</strong>
                      <div className="mzi-admin-slug">{e.user.email}</div>
                    </td>
                    <td className="mzi-admin-wrap">
                      <Link to={`/kursy/${e.course.slug}`} className="mzi-auth-link">{e.course.title}</Link>
                    </td>
                    <td>{formatDateTime(e.requestedAt)}</td>
                    {tab !== "pending" && (
                      <td>
                        {e.decidedAt ? formatDateTime(e.decidedAt) : "—"}
                        {e.decidedBy && <div className="mzi-admin-slug">{e.decidedBy}</div>}
                      </td>
                    )}
                    <td className="mzi-admin-actions">
                      {e.status !== "approved" && (
                        <button type="button" className="mzi-btn mzi-btn-small mzi-btn-publish" onClick={() => decide(e, "approved")} disabled={busyKey === key(e)}>
                          Zatwierdź
                        </button>
                      )}
                      {e.status !== "rejected" && (
                        <button type="button" className="mzi-btn mzi-btn-small mzi-btn-danger" onClick={() => decide(e, "rejected")} disabled={busyKey === key(e)}>
                          {e.status === "approved" ? "Odbierz dostęp" : "Odrzuć"}
                        </button>
                      )}
                      {e.status !== "pending" && (
                        <button type="button" className="mzi-btn mzi-btn-small" onClick={() => remove(e)} disabled={busyKey === key(e)}>
                          Usuń
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

export default AdminEnrollments;
