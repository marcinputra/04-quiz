import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../../api";
import AdminNav from "./AdminNav";
import { formatDate } from "../Home";
import "../Auth.css";
import "./Admin.css";

// Lista artykułów w panelu admina (także szkice), najnowiej zmieniane pierwsze
function AdminArticleList() {
  const [articles, setArticles] = useState(null);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const load = useCallback(() => {
    api("/admin/articles")
      .then(setArticles)
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

  const togglePublished = (a) =>
    run(() =>
      api(`/admin/articles/${a.id}`, {
        method: "PATCH",
        body: { status: a.status === "published" ? "draft" : "published" },
      })
    );

  const remove = (a) => {
    if (!window.confirm(`Usunąć artykuł „${a.title}”? Tej operacji nie można cofnąć.`)) return;
    run(() => api(`/admin/articles/${a.id}`, { method: "DELETE" }));
  };

  return (
    <div className="mzi-auth-page mzi-auth-page-wide">
      <div className="mzi-auth-card mzi-admin-card">
        <h1 className="mzi-auth-title">Panel admina</h1>
        <AdminNav />

        <div className="mzi-admin-toolbar">
          <p className="mzi-auth-muted mzi-admin-toolbar-text">
            Opublikowane artykuły wyświetlają się na stronie głównej, od najnowszego.
          </p>
          <Link to="/admin/artykuly/nowy" className="mzi-btn mzi-btn-primary">
            + Nowy artykuł
          </Link>
        </div>

        {error && <p className="mzi-auth-error" role="alert">{error}</p>}
        {!articles && !error && <p className="mzi-auth-muted">Ładowanie...</p>}
        {articles && articles.length === 0 && (
          <p className="mzi-auth-muted">Nie ma jeszcze artykułów. Kliknij „+ Nowy artykuł”.</p>
        )}

        {articles && articles.length > 0 && (
          <div className="mzi-admin-table-wrap">
            <table className="mzi-admin-table">
              <thead>
                <tr>
                  <th>Artykuł</th>
                  <th>Status</th>
                  <th>Opublikowany</th>
                  <th>Ostatnia zmiana</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {articles.map((a) => (
                  <tr key={a.id}>
                    <td className="mzi-admin-wrap">
                      <Link to={`/admin/artykuly/${a.id}`} className="mzi-admin-quiz-title">
                        {a.title}
                      </Link>
                      <div className="mzi-admin-slug">/artykuly/{a.slug}</div>
                    </td>
                    <td>
                      <button
                        type="button"
                        className={`mzi-status ${a.status === "published" ? "mzi-status-on" : "mzi-status-off"}`}
                        onClick={() => togglePublished(a)}
                        disabled={busy}
                        title={a.status === "published" ? "Kliknij, aby cofnąć publikację" : "Kliknij, aby opublikować"}
                      >
                        {a.status === "published" ? "Opublikowany" : "Szkic"}
                      </button>
                    </td>
                    <td>{a.publishedAt ? formatDate(a.publishedAt) : "—"}</td>
                    <td>{formatDate(a.updatedAt)}</td>
                    <td className="mzi-admin-actions">
                      <Link to={`/admin/artykuly/${a.id}`} className="mzi-btn mzi-btn-small">Edytuj</Link>
                      <Link to={`/artykuly/${a.slug}`} className="mzi-btn mzi-btn-small">Podgląd</Link>
                      <button type="button" className="mzi-btn mzi-btn-small mzi-btn-danger" onClick={() => remove(a)} disabled={busy}>
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

export default AdminArticleList;
