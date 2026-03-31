import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import StartScreen from "./StartScreen";
import Footer from "./Footer";
import "./Quiz.css";

function Quiz({ quizzes = [] }) {
  const { id } = useParams();
  const navigate = useNavigate();

  // Metadane quizu z quizList.json
  const quizMeta = useMemo(() => {
    return quizzes.find((q) => String(q.id) === String(id));
  }, [quizzes, id]);

  // Ekran startowy
  const [started, setStarted] = useState(false);
  const [studentName, setStudentName] = useState(() => {
    try {
      return window.localStorage.getItem("quiz_student_name") || "";
    } catch {
      return "";
    }
  });

  // Pytania ładowane z osobnego pliku
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [questions, setQuestions] = useState([]);

  // Stan quizu (logika)
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answersByIndex, setAnswersByIndex] = useState({}); // { [questionIndex]: selectedOptionIndex }
  const [score, setScore] = useState(0);
  const [finished, setFinished] = useState(false);

  // Reset stanu quizu po zmianie id
  useEffect(() => {
    setStarted(false);
    setCurrentIndex(0);
    setAnswersByIndex({});
    setScore(0);
    setFinished(false);
  }, [id]);

  // Pobierz pytania dla danego quizu: /{id}.json
  useEffect(() => {
    const loadQuestionsFile = async () => {
      try {
        setLoading(true);
        setError("");
        setQuestions([]);

        const res = await fetch(`/${id}.json`);
        if (!res.ok) {
          throw new Error(`Nie udało się pobrać pliku z pytaniami: /${id}.json (HTTP ${res.status})`);
        }

        const data = await res.json();

        // Walidacja minimalna formatu (Twoje pytania są tablicą)
        if (!Array.isArray(data)) {
          throw new Error(`Zły format danych w /${id}.json — oczekiwano tablicy pytań.`);
        }

        // Normalizacja do wspólnego formatu:
        // question: string
        // code: string
        // options: string[]
        // correctAnswer: number (0..3)
        // const normalized = data.map((q, idx) => ({
        //   id: q.id ?? idx + 1,
        //   question: q.question ?? "",
        //   code: q.code ?? "",
        //   options: Array.isArray(q.options) ? q.options : [],
        //   correctAnswer:
        //     typeof q.correctAnswer === "number" ? q.correctAnswer : -1,
        // }));

        const normalized = data.map((q, idx) => ({
          id: q.id ?? idx + 1,
          question: q.question ?? "",
          code: q.code ?? "",
          options: Array.isArray(q.options) ? q.options : [],
          correctAnswer:
          typeof q.correctAnswer === "number" ? q.correctAnswer : -1,
        }));

        const shuffledQuestions = shuffleArray(normalized);
        setQuestions(shuffledQuestions);

        // setQuestions(normalized);
      } catch (e) {
        setError(e?.message || "Błąd wczytywania pytań");
      } finally {
        setLoading(false);
      }
    };

    if (id) loadQuestionsFile();
  }, [id]);

  const shuffleArray = (array) => {
    const newArray = [...array];

    for (let i = newArray.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
    }

    return newArray;
  };

  if (!quizMeta) return <p>Nie znaleziono quizu o id: {id}</p>;
  if (loading) return <p>Ładowanie pytań...</p>;
  if (error) return <p style={{ color: "red" }}>{error}</p>;
  if (!questions.length) return <p>Brak pytań w tym quizie.</p>;

  // StartScreen
  if (!started) {
    return (
      <StartScreen
        nameQuiz={quizMeta.title}
        defaultName={studentName}
        onStart={(name) => {
          setStudentName(name);
          setStarted(true);
        }}
      />
    );
  }

  const currentQuestion = questions[currentIndex];
  const selected = answersByIndex[currentIndex]; // undefined jeśli brak odpowiedzi

  const handleSelectAnswer = (selectedIndex) => {
    // Bez cofania: jeśli już odpowiedziano, blokujemy zmianę
    if (selected !== undefined) return;

    setAnswersByIndex((prev) => ({
      ...prev,
      [currentIndex]: selectedIndex,
    }));

    if (selectedIndex === currentQuestion.correctAnswer) {
      setScore((s) => s + 1);
    }
  };

  const handleNext = () => {
    if (selected === undefined) return; // wymuś odpowiedź

    if (currentIndex >= questions.length - 1) {
      setFinished(true);
      return;
    }
    setCurrentIndex((i) => i + 1);
  };

  const handleBackToList = () => navigate("/");

  const handleRestart = () => {
    setCurrentIndex(0);
    setAnswersByIndex({});
    setScore(0);
    setFinished(false);
    setStarted(false); // wraca do StartScreen
  };

  if (finished) {
    const total = questions.length;
    const percent = Math.round((score / total) * 100);

    return (
      <div className="maturazinformatyki-quiz">
        <main className="maturazinformatyki-quiz-container"  style={{
        display: "flex",
        flexDirection: "column",
        justifyContent: "center"
      }}>
          <h1 className="maturazinformatyki-quiz-start-title">{quizMeta.title}</h1>
          <p>Uczestnik: {studentName || "Anonim"}</p>

          <h2>Wynik</h2>
          <p>
            {score} / {total} ({percent}%)
          </p>

          <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
            <button type="button" onClick={handleRestart} className="maturazinformatyki-quiz-start-button">
              Rozwiąż ponownie
            </button>
            <button type="button" onClick={handleBackToList} className="maturazinformatyki-quiz-start-button">
              Wróć do listy quizów
            </button>
          </div>
        </main>

        <Footer nameQuiz={quizMeta.title} />
      </div>
    );
  }

  return (
    <div className="maturazinformatyki-quiz">
      <main className="maturazinformatyki-quiz-container">
        <h1 className="maturazinformatyki-quiz-start-title">{quizMeta.title}</h1>

        <div style={{ margin: "10px 0" }}>
          <strong>Pytanie {currentIndex + 1}</strong> / {questions.length}
        </div>

        <div className="maturazinformatyki-quiz-question">
          <p>{currentQuestion.question}</p>

          {currentQuestion.code ? (
            <pre className="maturazinformatyki-quiz-code">
              {currentQuestion.code}
            </pre>
          ) : null}
        </div>

        <div className="maturazinformatyki-quiz-question-answer">
          {currentQuestion.options.map((opt, idx) => {
            const isChosen = selected === idx;
            const disabled = selected !== undefined;
            const succesCurrent = idx === currentQuestion.correctAnswer;
            const bg = !disabled ? "#fff" : 
                          succesCurrent ? "#68c797" : // zielone tło dla poprawnej
                          isChosen ? "#e17b7b" : "#fff"; // czerwone tylko dla błędnie wybranej
            return (
              <button
                key={idx}
                type="button"
                onClick={() => handleSelectAnswer(idx)}
                disabled={disabled}
                style={{
                  padding: "12px 14px",
                  textAlign: "left",
                  cursor: disabled ? "default" : "pointer",
                  opacity: disabled && !isChosen ? 0.7 : 1,
                  border: isChosen ? "2px solid #111" : "1px solid #ddd",
                  borderRadius: 10,
                  background: bg
                }}
                className="maturazinformatyki-quiz-question-btn"
              >
                <strong>{String.fromCharCode(65 + idx)}.</strong> {opt}
              </button>
            );
          })}
        </div>

        <div>
          <button 
            type="button" 
            onClick={handleNext} 
            disabled={selected === undefined}
            className="maturazinformatyki-quiz-close-btn"
          >
            {currentIndex === questions.length - 1 ? "Zakończ" : "Dalej"}
          </button>
        </div>
      </main>

      <Footer nameQuiz={quizMeta.title} />
    </div>
  );
}

export default Quiz;