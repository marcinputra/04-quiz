import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../../api";
import AdminNav from "./AdminNav";
import "../Auth.css";
import "./Admin.css";

// /admin/kursy — lista kursów
function AdminCourseList() {
  const [courses, setCourses] = useState(null);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const load = useCallback(() => {
    api("/admin/courses")
      .then(setCourses)
      .catch((err) => setError(err.message));
  }, []);

  useEffect(load, [load]);

  const run = async (fn) => {
    setBusy(true);
    setError("");
    try {
      await fn();
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
      load();
    }
  };

  const togglePublished = (c) =>
    run(() => api(`/admin/courses/${c.id}`, { method: "PATCH", body: { isPublished: !c.isPublished } }));

  const remove = (c) => {
    const extra = c.quizzes
      ? `\n\nQuizy kursu (${c.quizzes}) NIE zostaną usunięte — zostaną odpięte i ukryte jako szkice.`
      : "";
    if (!window.confirm(`Usunąć kurs „${c.title}” razem z lekcjami i zapisami uczniów?${extra}`)) return;
    run(() => api(`/admin/courses/${c.id}`, { method: "DELETE" }));
  };

  return (
    <div className="mzi-auth-page mzi-auth-page-wide">
      <div className="mzi-auth-card mzi-admin-card">
        <h1 className="mzi-auth-title">Panel admina</h1>
        <AdminNav />

        <div className="mzi-admin-toolbar">
          <p className="mzi-auth-muted mzi-admin-toolbar-text">
            Uczniowie widzą opis i spis lekcji; treść lekcji i quizy kursu — dopiero po zatwierdzeniu w zakładce „Zapisy”.
          </p>
          <Link to="/admin/kursy/nowy" className="mzi-btn mzi-btn-primary">+ Nowy kurs</Link>
        </div>

        {error && <p className="mzi-auth-error" role="alert">{error}</p>}
        {!courses && !error && <p className="mzi-auth-muted">Ładowanie...</p>}
        {courses && courses.length === 0 && <p className="mzi-auth-muted">Nie ma jeszcze kursów. Kliknij „+ Nowy kurs”.</p>}

        {courses && courses.length > 0 && (
          <div className="mzi-admin-table-wrap">
            <table className="mzi-admin-table">
              <thead>
                <tr>
                  <th>Kurs</th>
                  <th>Lekcji</th>
                  <th>Quizów</th>
                  <th>Uczniów</th>
                  <th>Status</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {courses.map((c) => (
                  <tr key={c.id}>
                    <td className="mzi-admin-wrap">
                      <Link to={`/admin/kursy/${c.id}`} className="mzi-admin-quiz-title">{c.title}</Link>
                      <div className="mzi-admin-slug">/kursy/{c.slug}</div>
                    </td>
                    <td>{c.lessons}</td>
                    <td>{c.quizzes}</td>
                    <td>
                      {c.approved}
                      {c.pending > 0 && (
                        <Link to="/admin/zapisy" className="mzi-admin-pending" title="Oczekujące prośby">
                          +{c.pending} czeka
                        </Link>
                      )}
                    </td>
                    <td>
                      <button
                        type="button"
                        className={`mzi-status ${c.isPublished ? "mzi-status-on" : "mzi-status-off"}`}
                        onClick={() => togglePublished(c)}
                        disabled={busy}
                        title={c.isPublished ? "Kliknij, aby cofnąć publikację" : "Kliknij, aby opublikować"}
                      >
                        {c.isPublished ? "Opublikowany" : "Szkic"}
                      </button>
                    </td>
                    <td className="mzi-admin-actions">
                      <Link to={`/admin/kursy/${c.id}`} className="mzi-btn mzi-btn-small">Edytuj</Link>
                      <Link to={`/kursy/${c.slug}`} className="mzi-btn mzi-btn-small">Podgląd</Link>
                      <button type="button" className="mzi-btn mzi-btn-small mzi-btn-danger" onClick={() => remove(c)} disabled={busy}>
                        Usuń
                      </button>
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

export default AdminCourseList;
