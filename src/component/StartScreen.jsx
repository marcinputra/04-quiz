import { useState } from "react";
import "./StartScreen.css";
import Footer from "./Footer";

const StartScreen = ({ onStart, defaultName = "", nameQuiz }) => {
  const [name, setName] = useState(defaultName);
  const [consent, setConsent] = useState(false);

  const handleStart = () => {
    // Zapamiętaj imię lokalnie (opcjonalne mozemy zapisywac do bazy)
    try {
      window.localStorage.setItem("quiz_student_name", name || "");
    } catch {}
    onStart(name || "");
  };

  return (
    <div className="maturazinformatyki-quiz-start">
      <div className="maturazinformatyki-quiz-start-container">
        <h1 className="maturazinformatyki-quiz-start-title">
          Quiz: 
          <span className="maturazinformatyki-quiz-start-title-yellow">
            {" " + nameQuiz}
          </span>
        </h1>
        <p className="maturazinformatyki-quiz-start-p">
          <div>Instrukcja:</div>
          <ul className="maturazinformatyki-quiz-start-p-ul">
            <li>odpowiedzieć na pytanie wystarczy zaznaczyć odpowiedzi A-D</li>
            <li>
              przed zaznaczeniem odpowiedzi dobrze się zastanów, brak jest
              możliwości cofnięcia odpowedzi
            </li>
            <li>czas wykonania quizu nie jest oceniany</li>
          </ul>
        </p>
        <h2 className="maturazinformatyki-quiz-start-h2">Powodzenia!</h2>

        <label className="maturazinformatyki-quiz-start-label">
          Imię i nazwisko (opcjonalnie)
        </label>
        <input
          value={name}
          type="text"
          onChange={(e) => setName(e.target.value)}
          placeholder="np. Jan Kowalski"
          className="maturazinformatyki-quiz-start-input"
        />

        <label className="maturazinformatyki-quiz-start-label">
          <input
            type="checkbox"
            checked={consent}
            onChange={(e) => setConsent(e.target.checked)}
            className="maturazinformatyki-quiz-start-checkbox"
          />
          <span>Rozpoczynając, potwierdzam gotowość do rozwiązania testu.</span>
        </label>

        <button
          onClick={handleStart}
          disabled={!consent}
          className="maturazinformatyki-quiz-start-button"
        >
          Rozpocznij quiz
        </button>
      </div>
      <Footer nameQuiz={nameQuiz} />
    </div>
  );
};

export default StartScreen;