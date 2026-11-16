import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../api";
import { formatDateTime, ResultBadge } from "./resultsUtils";
import "./Auth.css";
import "./Results.css";
import { endReasonInfo } from "../component/endReason";

// Moje wyniki: podsumowanie (najlepszy wynik w każdym quizie) + historia podejść
function MyResults() {
  const [attempts, setAttempts] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    api("/attempts")
      .then(setAttempts)
      .catch((err) => setError(err.message));
  }, []);

  // najlepszy wynik i liczba podejść dla każdego quizu
  const summary = useMemo(() => {
    const byQuiz = new Map();
    for (const a of attempts ?? []) {
      const s = byQuiz.get(a.quiz.slug) ?? { quiz: a.quiz, best: a, count: 0 };
      s.count += 1;
      if (a.percent > s.best.percent) s.best = a;
      byQuiz.set(a.quiz.slug, s);
    }
    return [...byQuiz.values()];
  }, [attempts]);

  return (
    <div className="mzi-auth-page mzi-auth-page-wide">
      <div className="mzi-auth-card">
        <h1 className="mzi-auth-title">Moje wyniki</h1>

        {error && <p className="mzi-auth-error" role="alert">{error}</p>}
        {!attempts && !error && <p className="mzi-auth-muted">Ładowanie...</p>}

        {attempts && attempts.length === 0 && (
          <p className="mzi-auth-muted">
            Nie masz jeszcze zakończonych quizów. <Link to="/quizy" className="mzi-auth-link">Wybierz quiz</Link>
          </p>
        )}

        {summary.length > 0 && (
          <>
            <h2 className="mzi-auth-subtitle">Najlepsze wyniki</h2>
            <div className="mzi-admin-table-wrap">
              <table className="mzi-admin-table">
                <thead>
                  <tr>
                    <th>Quiz</th>
                    <th>Najlepszy wynik</th>
                    <th>Podejść</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {summary.map((s) => (
                    <tr key={s.quiz.slug}>
                      <td className="mzi-results-title">{s.quiz.title}</td>
                      <td>
                        <ResultBadge percent={s.best.percent} /> {s.best.score}/{s.best.total}
                      </td>
                      <td>{s.count}</td>
                      <td>
                        <Link to={`/quiz/${s.quiz.slug}`} className="mzi-auth-link">
                          Rozwiąż ponownie
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <h2 className="mzi-auth-subtitle mzi-results-gap">Historia</h2>
            <div className="mzi-admin-table-wrap">
              <table className="mzi-admin-table">
                <thead>
                  <tr>
                    <th>Data</th>
                    <th>Quiz</th>
                    <th>Wynik</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {attempts.map((a) => (
                    <tr key={a.id}>
                      <td>{formatDateTime(a.finishedAt)}</td>
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
                        <Link to={`/wyniki/${a.id}`} className="mzi-auth-link">
                          Odpowiedzi
                        </Link>
                      </td>
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

export default MyResults;
