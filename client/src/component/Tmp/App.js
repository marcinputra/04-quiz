import React, { useEffect, useMemo, useState } from "react";
import "./App.css";
import StartScreen from "../StartScreen";
import Loading from "./Loading";
import ErrorBox from "./ErrorBox";

export default function App({ nameQuiz }) {
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [started, setStarted] = useState(false);
  const [studentName, setStudentName] = useState("");

  const [current, setCurrent] = useState(0);
  const [score, setScore] = useState(0);
  const [finished, setFinished] = useState(false);

  // Wczytanie pytań z public/questions.json
  const fetchQuestions = async () => {
    try {
      setLoading(true);
      setError("");
      const res = await fetch("/quiz01.json", { cache: "no-store" });
      if (!res.ok)
        throw new Error(
          `Nie udało się pobrać questions.json (HTTP ${res.status}).`
        );
      const data = await res.json();

      // Prosta walidacja struktury
      if (!Array.isArray(data))
        throw new Error("Plik JSON musi zawierać tablicę pytań.");
      data.forEach((q, i) => {
        if (typeof q.question !== "string")
          throw new Error(`Pytanie #${i + 1}: brak pola 'question' (string).`);
        if (!Array.isArray(q.options) || q.options.length !== 4)
          throw new Error(
            `Pytanie #${i + 1}: 'options' musi mieć 4 odpowiedzi.`
          );
        if (
          typeof q.correctAnswer !== "number" ||
          q.correctAnswer < 0 ||
          q.correctAnswer > 3
        )
          throw new Error(
            `Pytanie #${i + 1}: 'correctAnswer' musi być liczbą 0–3.`
          );
      });

      setQuestions(data);
      setCurrent(0);
      setScore(0);
      setFinished(false);
    } catch (e) {
      setError(e.message || "Nieznany błąd podczas wczytywania pytań.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQuestions();
    try {
      const saved = window.localStorage.getItem("quiz_student_name");
      if (saved) setStudentName(saved);
    } catch {}
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const progress = useMemo(() => {
    if (!questions.length) return 0;
    return Math.round((current / questions.length) * 100);
  }, [current, questions.length]);

  const handleAnswer = (index) => {
    if (!questions.length) return;
    if (index === questions[current].correctAnswer) setScore((s) => s + 1);

    const next = current + 1;
    if (next < questions.length) setCurrent(next);
    else setFinished(true);
  };

  const restart = () => {
    setScore(0);
    setCurrent(0);
    setFinished(false);
    setStarted(false);
  };

  if (loading) return <Loading />;
  if (error) return <ErrorBox message={error} onRetry={fetchQuestions} />;
  if (!questions.length)
    return (
      <ErrorBox message={"Brak pytań w pliku JSON."} onRetry={fetchQuestions} />
    );

  if (!started) {
    return (
      <StartScreen
        onStart={(name) => {
          setStudentName(name);
          setStarted(true);
        }}
        defaultName={studentName}
        nameQuiz={nameQuiz}
      />
    );
  }

  if (finished) {
    const percent = Math.round((score / questions.length) * 100);
    return (
      <div className="maturazinformatyki-quiz-result">
        <div className="maturazinformatyki-quiz-result-container">
          <h1 className="text-3xl font-bold mb-1">Twój wynik</h1>
          {studentName && (
            <p className="maturazinformatyki-quiz-result-name">
              Rozwiązujący: <strong>{studentName}</strong>
            </p>
          )}
          <p className="maturazinformatyki-quiz-result-result">
            {score} / {questions.length} poprawnych ({percent}%)
          </p>
          <div className="flex gap-3 justify-center">
            <button
              onClick={restart}
              className="maturazinformatyki-quiz-close-btn"
            >
              Zagraj ponownie
            </button>
            <button
              onClick={fetchQuestions}
              className="maturazinformatyki-quiz-close-btn"
            >
              Wczytaj pytania ponownie
            </button>
          </div>
        </div>
      </div>
    );
  }

  const q = questions[current];

  return (
    <div className="maturazinformatyki-quiz-start">
      <div className="maturazinformatyki-quiz-start-container">
        <div className="maturazinformatyki-quiz-start-title">
          <div>
            <h1 className="maturazinformatyki-quiz-start-title">
              Pytanie {current + 1} z {questions.length}
            </h1>
            {studentName && (
              <p className="maturazinformatyki-quiz-start-title">
                Rozwiązujący: {studentName}
              </p>
            )}
          </div>
          <span className="maturazinformatyki-quiz-start-progress">
            {progress}%
          </span>
        </div>
        <div className="maturazinformatyki-quiz-start-progress">
          <div
            className="maturazinformatyki-quiz-start-progress-line"
            style={{ width: `${progress}%` }}
          />
        </div>
        <p className="maturazinformatyki-quiz-question">{q.question}</p>
        {q.code && q.cade?.trim() !== "" && (
          <pre className="maturazinformatyki-quiz-code">
            <code>{q.code}</code>
          </pre>
        )}
        <div className="grid gap-3">
          {q.options.map((opt, i) => (
            <button
              key={i}
              onClick={() => handleAnswer(i)}
              className="maturazinformatyki-quiz-question-btn hover:bg-blue-200 text-left p-3 rounded-lg transition"
            >
              {String.fromCharCode(65 + i)}. {opt}
            </button>
          ))}
        </div>
        <div className="flex items-center justify-between mt-6 text-sm text-gray-500">
          <button
            onClick={restart}
            className="maturazinformatyki-quiz-close-btn"
          >
            Zakończ
          </button>
        </div>
      </div>
    </div>
  );
}
