import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../api";
import { formatDateTime, ResultBadge } from "./resultsUtils";
import "./Auth.css";
import "./Results.css";
import { endReasonInfo } from "../component/endReason";
import AdminNav from "./admin/AdminNav";

// Panel admina, zakładka „Wyniki i konta”. Edytor quizów: admin/AdminQuizList.jsx.
// Artykuły, kursy i zapisy dojdą w krokach 6–7.
function AdminHome() {
  const [users, setUsers] = useState(null);
  const [attempts, setAttempts] = useState(null);
  const [error, setError] = useState("");
  const [quizFilter, setQuizFilter] = useState("");

  useEffect(() => {
    Promise.all([api("/admin/users"), api("/admin/attempts")])
      .then(([u, a]) => {
        setUsers(u);
        setAttempts(a);
      })
      .catch((err) => setError(err.message));
  }, []);

  const quizOptions = useMemo(() => {
    const map = new Map((attempts ?? []).map((a) => [a.quiz.slug, a.quiz.title]));
    return [...map.entries()].sort((a, b) => a[1].localeCompare(b[1], "pl"));
  }, [attempts]);

  const filtered = (attempts ?? []).filter((a) => !quizFilter || a.quiz.slug === quizFilter);

  return (
    <div className="mzi-auth-page mzi-auth-page-wide">
      <div className="mzi-auth-card mzi-admin-card">
        <h1 className="mzi-auth-title">Panel admina</h1>
        <AdminNav />

        {error && <p className="mzi-auth-error" role="alert">{error}</p>}
        {!users && !error && <p className="mzi-auth-muted">Ładowanie...</p>}

        {attempts && (
          <>
            <div className="mzi-admin-section-head">
              <h2 className="mzi-auth-subtitle">Wyniki uczniów</h2>
              {quizOptions.length > 1 && (
                <select
                  className="mzi-admin-select"
                  value={quizFilter}
                  onChange={(e) => setQuizFilter(e.target.value)}
                  aria-label="Filtruj po quizie"
                >
                  <option value="">Wszystkie quizy</option>
                  {quizOptions.map(([slug, title]) => (
                    <option key={slug} value={slug}>{title}</option>
                  ))}
                </select>
              )}
            </div>

            {filtered.length === 0 ? (
              <p className="mzi-auth-muted">Brak zakończonych quizów.</p>
            ) : (
              <div className="mzi-admin-table-wrap">
                <table className="mzi-admin-table">
                  <thead>
                    <tr>
                      <th>Data</th>
                      <th>Uczeń</th>
                      <th>Quiz</th>
                      <th>Wynik</th>
                      <th></th>
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map((a) => (
                      <tr key={a.id}>
                        <td>{formatDateTime(a.finishedAt)}</td>
                        <td title={a.user.email}>{a.user.name}</td>
                        <td className="mzi-results-title">{a.quiz.title}</td>
                        <td>
                          <ResultBadge percent={a.percent} /> {a.score}/{a.total}{" "}
                          {endReasonInfo(a.endReason) && (
                          <span className="mzi-results-left" title={`Quiz zakończony automatycznie: ${endReasonInfo(a.endReason).long}`}>
                            {endReasonInfo(a.endReason).short}
                          </span>
                        )}
                        </td>
                        <td>
                          <Link to={`/wyniki/${a.id}`} className="mzi-auth-link">Odpowiedzi</Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </>
        )}

        {users && (
          <>
            <h2 className="mzi-auth-subtitle mzi-results-gap">Użytkownicy ({users.length})</h2>
            <div className="mzi-admin-table-wrap">
              <table className="mzi-admin-table">
                <thead>
                  <tr>
                    <th>Imię i nazwisko</th>
                    <th>E-mail</th>
                    <th>Rola</th>
                    <th>Konto od</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((u) => (
                    <tr key={u.id}>
                      <td>{u.name}</td>
                      <td>{u.email}</td>
                      <td>{u.role === "admin" ? "admin" : "uczeń"}</td>
                      <td>{new Date(u.createdAt).toLocaleDateString("pl-PL")}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default AdminHome;
