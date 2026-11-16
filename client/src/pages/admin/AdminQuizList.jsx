import { useCallback, useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../../api";
import AdminNav from "./AdminNav";
import "../Auth.css";
import "./Admin.css";

// Lista wszystkich quizów (także szkiców): kolejność, publikacja, edycja, usuwanie
function AdminQuizList() {
  const [quizzes, setQuizzes] = useState(null);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [search, setSearch] = useState("");

  const load = useCallback(() => {
    api("/admin/quizzes")
      .then(setQuizzes)
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

  const move = (index, delta) => {
    const target = index + delta;
    if (target < 0 || target >= quizzes.length) return;
    const next = [...quizzes];
    [next[index], next[target]] = [next[target], next[index]];
    setQuizzes(next); // od razu na ekranie, potem zapis
    run(() => api("/admin/quizzes/order", { method: "PUT", body: { ids: next.map((q) => q.id) } }));
  };

  const togglePublished = (quiz) =>
    run(() => api(`/admin/quizzes/${quiz.id}`, { method: "PATCH", body: { isPublished: !quiz.isPublished } }));

  const remove = (quiz) =>
    run(async () => {
      if (!window.confirm(`Usunąć quiz „${quiz.title}” razem ze wszystkimi pytaniami?`)) return;
      try {
        await api(`/admin/quizzes/${quiz.id}`, { method: "DELETE" });
      } catch (err) {
        // są wyniki uczniów — drugie, wyraźne potwierdzenie
        if (err.status !== 409) throw err;
        if (!window.confirm(`${err.message}\n\nCzy na pewno usunąć?`)) return;
        await api(`/admin/quizzes/${quiz.id}?force=1`, { method: "DELETE" });
      }
    });

  const query = search.trim().toLowerCase();
  const visible = useMemo(
    () =>
      (quizzes ?? [])
        .map((q, index) => ({ ...q, index }))
        .filter((q) => !query || `${q.title} ${q.slug} ${q.topic ?? ""}`.toLowerCase().includes(query)),
    [quizzes, query]
  );

  return (
    <div className="mzi-auth-page mzi-auth-page-wide">
      <div className="mzi-auth-card mzi-admin-card">
        <h1 className="mzi-auth-title">Panel admina</h1>
        <AdminNav />

        <div className="mzi-admin-toolbar">
          <input
            type="search"
            className="mzi-admin-input mzi-admin-search"
            placeholder="Szukaj quizu..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            aria-label="Szukaj quizu"
          />
          <Link to="/admin/quizy/nowy" className="mzi-btn mzi-btn-primary">
            + Nowy quiz
          </Link>
        </div>

        {error && <p className="mzi-auth-error" role="alert">{error}</p>}
        {!quizzes && !error && <p className="mzi-auth-muted">Ładowanie...</p>}

        {quizzes && (
          <div className="mzi-admin-table-wrap">
            <table className="mzi-admin-table mzi-admin-quiz-table">
              <thead>
                <tr>
                  <th aria-label="Kolejność"></th>
                  <th>Quiz</th>
                  <th>Temat / poziom</th>
                  <th>Pytań</th>
                  <th>Wyników</th>
                  <th>Status</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {visible.map((q) => (
                  <tr key={q.id}>
                    <td className="mzi-admin-order">
                      <button
                        type="button"
                        className="mzi-btn mzi-btn-icon"
                        onClick={() => move(q.index, -1)}
                        disabled={busy || query !== "" || q.index === 0}
                        aria-label={`Przesuń w górę: ${q.title}`}
                      >
                        ↑
                      </button>
                      <button
                        type="button"
                        className="mzi-btn mzi-btn-icon"
                        onClick={() => move(q.index, 1)}
                        disabled={busy || query !== "" || q.index === quizzes.length - 1}
                        aria-label={`Przesuń w dół: ${q.title}`}
                      >
                        ↓
                      </button>
                    </td>
                    <td className="mzi-admin-wrap">
                      <Link to={`/admin/quizy/${q.id}`} className="mzi-admin-quiz-title">
                        {q.title}
                      </Link>
                      <div className="mzi-admin-slug">/quiz/{q.slug}</div>
                    </td>
                    <td className="mzi-admin-wrap">
                      {q.topic || "—"}
                      {q.level && <div className="mzi-admin-slug">{q.level}</div>}
                      {q.course && <div className="mzi-admin-slug">kurs: {q.course.title}</div>}
                    </td>
                    <td>{q.questions}</td>
                    <td>{q.attempts}</td>
                    <td>
                      <button
                        type="button"
                        className={`mzi-status ${q.isPublished ? "mzi-status-on" : "mzi-status-off"}`}
                        onClick={() => togglePublished(q)}
                        disabled={busy}
                        title={q.isPublished ? "Kliknij, aby cofnąć publikację" : "Kliknij, aby opublikować"}
                      >
                        {q.isPublished ? "Opublikowany" : "Szkic"}
                      </button>
                    </td>
                    <td className="mzi-admin-actions">
                      <Link to={`/admin/quizy/${q.id}`} className="mzi-btn mzi-btn-small">
                        Edytuj
                      </Link>
                      <Link to={`/quiz/${q.slug}`} className="mzi-btn mzi-btn-small">
                        Podgląd
                      </Link>
                      <button
                        type="button"
                        className="mzi-btn mzi-btn-small mzi-btn-danger"
                        onClick={() => remove(q)}
                        disabled={busy}
                      >
                        Usuń
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {visible.length === 0 && <p className="mzi-auth-muted">Brak quizów pasujących do wyszukiwania.</p>}
            {query && <p className="mzi-auth-muted">Zmiana kolejności jest dostępna po wyczyszczeniu wyszukiwania.</p>}
          </div>
        )}
      </div>
    </div>
  );
}

export default AdminQuizList;
