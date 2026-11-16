import { useEffect, useRef, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import StartScreen from "./StartScreen";
import Footer from "./Footer";
import { endReasonInfo } from "./endReason";
import { api } from "../api";
import { useAuth } from "../auth/AuthContext";
import "./Quiz.css";

// Rozwiązywanie quizu. Pytania przychodzą z API bez poprawnych odpowiedzi —
// po kliknięciu serwer sprawdza odpowiedź, zapisuje ją i zwraca, która była poprawna.
function Quiz() {
  const { id: slug } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  // metadane quizu (ekran startowy)
  const [meta, setMeta] = useState(null);
  const [metaError, setMetaError] = useState("");

  // podejście: { attemptId, questions: [{ id, question, code, options: [{ id, text }] }] }
  const [attempt, setAttempt] = useState(null);
  const [starting, setStarting] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  // { [questionId]: { selectedOptionId, correctOptionId, correct } }
  const [answers, setAnswers] = useState({});
  const [pendingOptionId, setPendingOptionId] = useState(null);
  const [finishing, setFinishing] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");
  // opcja quizu lockOnLeave: uczeń opuścił kartę / okno straciło fokus -> podejście zablokowane
  // (wynik może jeszcze się zapisywać); wartość = powód: "left_page" | "window_blur" | null
  const [leftPage, setLeftPage] = useState(null);
  const [leftSaveError, setLeftSaveError] = useState("");
  // true, gdy podejście jest już kończone (normalnie albo po opuszczeniu karty) — bez podwójnego /finish
  const endedRef = useRef(false);

  // nowy quiz -> czyścimy stan i pobieramy metadane
  useEffect(() => {
    let cancelled = false;
    setMeta(null);
    setMetaError("");
    setAttempt(null);
    setResult(null);
    setError("");
    setLeftPage(null);

    api(`/quizzes/${encodeURIComponent(slug)}`)
      .then((data) => !cancelled && setMeta(data))
      .catch((err) => !cancelled && setMetaError(err.message));

    return () => {
      cancelled = true;
    };
  }, [slug]);

  const attemptId = attempt?.attemptId;
  const lockActive = Boolean(meta?.lockOnLeave && attemptId && !result);

  // Zakończenie podejścia, bo uczeń opuścił kartę / okno. keepalive — zapytanie dojdzie nawet przy zamykaniu karty.
  const finishLeft = async (id, reason, { updateState = true } = {}) => {
    try {
      const res = await api(`/attempts/${id}/finish`, {
        method: "POST",
        body: { reason },
        keepalive: true,
      });
      if (updateState) setResult(res);
    } catch (err) {
      if (updateState) setLeftSaveError(err.message);
    }
  };

  // Opcja lockOnLeave kończy podejście, gdy:
  //  - karta zostanie ukryta (inna karta, minimalizacja, zamknięcie, odświeżenie) -> "left_page",
  //  - okno przeglądarki przestanie być aktywne (klik w inny program, pasek adresu, narzędzia F12) -> "window_blur",
  //  - uczeń wyjdzie z quizu w obrębie strony (odmontowanie komponentu) -> "left_page".
  useEffect(() => {
    if (!lockActive) return undefined;

    const leave = (reason, updateState = true) => {
      if (endedRef.current) return;
      endedRef.current = true;
      if (updateState) setLeftPage(reason); // blokada od razu, zanim odpowie serwer
      finishLeft(attemptId, reason, { updateState });
    };
    const onVisibility = () => {
      if (document.visibilityState === "hidden") leave("left_page");
    };
    // przy przełączeniu karty najpierw przychodzi blur, potem visibilitychange — chwilę czekamy,
    // żeby zapisać trafniejszy powód ("left_page"), blokada i tak następuje od razu po jednym z nich
    let blurTimer;
    const onBlur = () => {
      blurTimer = setTimeout(() => {
        leave(document.visibilityState === "hidden" ? "left_page" : "window_blur");
      }, 150);
    };

    document.addEventListener("visibilitychange", onVisibility);
    window.addEventListener("blur", onBlur);
    // okno nieaktywne już w chwili startu (np. kliknięto „Rozpocznij” i od razu inny program)
    if (!document.hasFocus()) onBlur();

    return () => {
      document.removeEventListener("visibilitychange", onVisibility);
      window.removeEventListener("blur", onBlur);
      clearTimeout(blurTimer);
      // sprzątanie przy aktywnym podejściu = uczeń wyszedł z quizu (link w menu, „wstecz”)
      leave("left_page", false);
    };
  }, [lockActive, attemptId]);

  const handleStart = async () => {
    setStarting(true);
    setError("");
    try {
      const data = await api(`/quizzes/${encodeURIComponent(slug)}/attempts`, { method: "POST" });
      endedRef.current = false;
      setLeftPage(null);
      setLeftSaveError("");
      setAttempt(data);
      setCurrentIndex(0);
      setAnswers({});
      setResult(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setStarting(false);
    }
  };

  if (metaError) {
    return (
      <div className="maturazinformatyki-quiz">
        <main className="maturazinformatyki-quiz-container maturazinformatyki-quiz-message">
          <p>{metaError}</p>
          <Link to="/quizy" className="maturazinformatyki-quiz-link">Wróć do listy quizów</Link>
        </main>
      </div>
    );
  }
  if (!meta) return <p className="mzi-auth-loading">Ładowanie quizu...</p>;

  // ekran startowy
  if (!attempt) {
    return (
      <StartScreen
        nameQuiz={meta.title}
        userName={user?.name}
        questionsCount={meta.questions}
        lockOnLeave={meta.lockOnLeave}
        onStart={handleStart}
        starting={starting}
        error={error}
      />
    );
  }

  // opuszczono kartę, wynik jeszcze się zapisuje (albo zapis się nie udał)
  if (leftPage && !result) {
    return (
      <div className="maturazinformatyki-quiz">
        <main className="maturazinformatyki-quiz-container maturazinformatyki-quiz-message">
          <h1 className="maturazinformatyki-quiz-start-title">{meta.title}</h1>
          <p className="maturazinformatyki-quiz-left" role="alert">
            Quiz został zakończony, ponieważ {endReasonInfo(leftPage)?.long}.
          </p>
          {leftSaveError ? (
            <>
              <p className="maturazinformatyki-quiz-error">Nie udało się zapisać wyniku: {leftSaveError}</p>
              <button
                type="button"
                className="maturazinformatyki-quiz-start-button"
                onClick={() => {
                  setLeftSaveError("");
                  finishLeft(attemptId, leftPage);
                }}
              >
                Zapisz wynik ponownie
              </button>
            </>
          ) : (
            <p>Zapisywanie wyniku...</p>
          )}
        </main>
        <Footer nameQuiz={meta.title} />
      </div>
    );
  }

  // wynik
  if (result) {
    return (
      <div className="maturazinformatyki-quiz">
        <main className="maturazinformatyki-quiz-container maturazinformatyki-quiz-message">
          <h1 className="maturazinformatyki-quiz-start-title">{meta.title}</h1>
          <p>Uczestnik: {user?.name}</p>

          {endReasonInfo(result.endReason) && (
            <p className="maturazinformatyki-quiz-left" role="alert">
              Quiz został zakończony, ponieważ {endReasonInfo(result.endReason).long}. Liczą się odpowiedzi udzielone do tej
              chwili — pytania bez odpowiedzi są niezaliczone.
            </p>
          )}
          <h2>Wynik</h2>
          <p className="maturazinformatyki-quiz-result-score">
            {result.score} / {result.total} ({result.percent}%)
          </p>

          <div className="maturazinformatyki-quiz-result-actions">
            <button type="button" onClick={handleStart} disabled={starting} className="maturazinformatyki-quiz-start-button">
              Rozwiąż ponownie
            </button>
            <button
              type="button"
              onClick={() => navigate(`/wyniki/${result.id}`)}
              className="maturazinformatyki-quiz-start-button"
            >
              Zobacz odpowiedzi
            </button>
            <button type="button" onClick={() => navigate("/quizy")} className="maturazinformatyki-quiz-start-button">
              Wróć do listy quizów
            </button>
          </div>
          {error && <p className="maturazinformatyki-quiz-error">{error}</p>}
        </main>
        <Footer nameQuiz={meta.title} />
      </div>
    );
  }

  const { questions } = attempt;
  const currentQuestion = questions[currentIndex];
  const answer = answers[currentQuestion.id]; // undefined, jeśli brak odpowiedzi
  const isLast = currentIndex >= questions.length - 1;

  const handleSelectAnswer = async (optionId) => {
    // bez cofania odpowiedzi; blokada podwójnego kliknięcia
    if (answer || pendingOptionId !== null) return;
    setPendingOptionId(optionId);
    setError("");
    try {
      const res = await api(`/attempts/${attemptId}/answer`, {
        method: "POST",
        body: { questionId: currentQuestion.id, optionId },
      });
      setAnswers((prev) => ({ ...prev, [currentQuestion.id]: res }));
    } catch (err) {
      setError(err.message);
    } finally {
      setPendingOptionId(null);
    }
  };

  const handleNext = async () => {
    if (!answer) return; // wymuś odpowiedź
    if (!isLast) {
      setCurrentIndex((i) => i + 1);
      return;
    }
    setFinishing(true);
    setError("");
    endedRef.current = true; // opuszczenie karty w trakcie zapisu nie zmienia już wyniku
    try {
      setResult(await api(`/attempts/${attemptId}/finish`, { method: "POST" }));
    } catch (err) {
      endedRef.current = false;
      setError(err.message);
    } finally {
      setFinishing(false);
    }
  };

  return (
    <div className="maturazinformatyki-quiz">
      <main className="maturazinformatyki-quiz-container">
        <h1 className="maturazinformatyki-quiz-start-title">{meta.title}</h1>

        <div style={{ margin: "10px 0" }}>
          <strong>Pytanie {currentIndex + 1}</strong> / {questions.length}
        </div>

        <div className="maturazinformatyki-quiz-question">
          {currentQuestion.question && <p>{currentQuestion.question}</p>}
          {currentQuestion.code ? (
            <pre className="maturazinformatyki-quiz-code">{currentQuestion.code}</pre>
          ) : null}
        </div>

        <div className="maturazinformatyki-quiz-question-answer">
          {currentQuestion.options.map((opt, idx) => {
            const answered = Boolean(answer);
            const isChosen = answer?.selectedOptionId === opt.id || pendingOptionId === opt.id;
            const isCorrect = answer?.correctOptionId === opt.id;
            const bg = !answered
              ? "#fff"
              : isCorrect
                ? "#68c797" // zielone tło dla poprawnej
                : isChosen
                  ? "#e17b7b" // czerwone tylko dla błędnie wybranej
                  : "#fff";
            const disabled = answered || pendingOptionId !== null;
            return (
              <button
                key={opt.id}
                type="button"
                onClick={() => handleSelectAnswer(opt.id)}
                disabled={disabled}
                style={{
                  padding: "12px 14px",
                  textAlign: "left",
                  cursor: disabled ? "default" : "pointer",
                  opacity: answered && !isChosen && !isCorrect ? 0.7 : 1,
                  border: isChosen ? "2px solid #111" : "1px solid #ddd",
                  borderRadius: 10,
                  background: bg,
                }}
                className="maturazinformatyki-quiz-question-btn"
              >
                <strong>{String.fromCharCode(65 + idx)}.</strong> {opt.text}
              </button>
            );
          })}
        </div>

        {error && <p className="maturazinformatyki-quiz-error">{error}</p>}

        <div>
          <button
            type="button"
            onClick={handleNext}
            disabled={!answer || finishing}
            className="maturazinformatyki-quiz-close-btn"
          >
            {isLast ? (finishing ? "Zapisywanie..." : "Zakończ") : "Dalej"}
          </button>
        </div>
      </main>

      <Footer nameQuiz={meta.title} />
    </div>
  );
}

export default Quiz;
