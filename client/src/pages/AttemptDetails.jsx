import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { api } from "../api";
import { useAuth } from "../auth/AuthContext";
import { formatDateTime, ResultBadge } from "./resultsUtils";
import "./Auth.css";
import "./Results.css";
import "../component/Quiz.css";
import { endReasonInfo } from "../component/endReason";

// Szczegóły zakończonego podejścia: każde pytanie z moją i poprawną odpowiedzią.
// Admin może tu oglądać wyniki dowolnego ucznia.
function AttemptDetails() {
  const { id } = useParams();
  const { isAdmin } = useAuth();
  const [data, setData] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    setData(null);
    setError("");
    api(`/attempts/${encodeURIComponent(id)}`)
      .then(setData)
      .catch((err) => setError(err.message));
  }, [id]);

  return (
    <div className="mzi-auth-page mzi-auth-page-wide">
      <div className="mzi-auth-card">
        {error && (
          <>
            <p className="mzi-auth-error" role="alert">{error}</p>
            <p className="mzi-auth-muted">
              <Link to="/moje-wyniki" className="mzi-auth-link">Wróć do moich wyników</Link>
            </p>
          </>
        )}
        {!data && !error && <p className="mzi-auth-muted">Ładowanie...</p>}

        {data && (
          <>
            <h1 className="mzi-auth-title">{data.quiz.title}</h1>
            <p className="mzi-results-summary">
              {isAdmin && <span>Uczeń: <strong>{data.user.name}</strong> ({data.user.email}) · </span>}
              {formatDateTime(data.finishedAt)} · wynik{" "}
              <strong>{data.score}/{data.total}</strong> <ResultBadge percent={data.percent} />
            </p>
            {endReasonInfo(data.endReason) && (
              <p className="maturazinformatyki-quiz-left">
                Quiz zakończony automatycznie, ponieważ {endReasonInfo(data.endReason).long}.
                Pytania bez odpowiedzi są niezaliczone.
              </p>
            )}

            <ol className="mzi-results-questions">
              {data.questions.map((q, qi) => (
                <li key={q.id} className="mzi-results-question">
                  <div className="mzi-results-question-head">
                    <span>Pytanie {qi + 1}</span>
                    <span className={q.selectedOptionId == null ? "mzi-results-none" : q.correct ? "mzi-results-ok" : "mzi-results-bad"}>
                      {q.selectedOptionId == null ? "brak odpowiedzi" : q.correct ? "dobrze" : "źle"}
                    </span>
                  </div>
                  {q.question && <p>{q.question}</p>}
                  {q.code && <pre className="maturazinformatyki-quiz-code mzi-results-code">{q.code}</pre>}
                  <ul className="mzi-results-options">
                    {q.options.map((o, oi) => {
                      const chosen = o.id === q.selectedOptionId;
                      const cls = o.isCorrect
                        ? "mzi-results-option-correct"
                        : chosen
                          ? "mzi-results-option-wrong"
                          : "";
                      return (
                        <li key={o.id} className={`mzi-results-option ${cls}`}>
                          <strong>{String.fromCharCode(65 + oi)}.</strong> {o.text}
                          {chosen && <em className="mzi-results-tag"> — Twoja odpowiedź</em>}
                          {o.isCorrect && !chosen && <em className="mzi-results-tag"> — poprawna</em>}
                        </li>
                      );
                    })}
                  </ul>
                </li>
              ))}
            </ol>

            <p className="mzi-auth-muted">
              <Link to={isAdmin ? "/admin" : "/moje-wyniki"} className="mzi-auth-link">
                {isAdmin ? "Wróć do panelu admina" : "Wróć do moich wyników"}
              </Link>
              {" · "}
              <Link to={`/quiz/${data.quiz.slug}`} className="mzi-auth-link">Rozwiąż ponownie</Link>
            </p>
          </>
        )}
      </div>
    </div>
  );
}

export default AttemptDetails;
