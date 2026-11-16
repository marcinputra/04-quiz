import { useState } from "react";
import "./StartScreen.css";
import Footer from "./Footer";

// Ekran przed rozpoczęciem quizu. Imię bierzemy z konta — nie trzeba go wpisywać.
const StartScreen = ({ onStart, nameQuiz, userName, questionsCount, lockOnLeave = false, starting = false, error = "" }) => {
  const [consent, setConsent] = useState(false);

  return (
    <div className="maturazinformatyki-quiz-start">
      <div className="maturazinformatyki-quiz-start-container">
        <h1 className="maturazinformatyki-quiz-start-title">
          Quiz:
          <span className="maturazinformatyki-quiz-start-title-yellow">{" " + nameQuiz}</span>
        </h1>
        <div className="maturazinformatyki-quiz-start-p">
          <div>Instrukcja:</div>
          <ul className="maturazinformatyki-quiz-start-p-ul">
            <li>odpowiedzieć na pytanie wystarczy zaznaczyć odpowiedzi A-D</li>
            <li>
              przed zaznaczeniem odpowiedzi dobrze się zastanów, brak jest możliwości cofnięcia
              odpowiedzi
            </li>
            <li>czas wykonania quizu nie jest oceniany</li>
            <li>wynik zapisze się na Twoim koncie (zakładka „Moje wyniki”)</li>
            {lockOnLeave && (
              <li className="maturazinformatyki-quiz-start-warning">
                <strong>Nie opuszczaj tej karty i tego okna!</strong> Przejście na inną kartę, kliknięcie w inny
                program lub poza stronę (np. w pasek adresu), zminimalizowanie okna albo wyjście ze strony quizu
                natychmiast go zakończy — liczą się tylko odpowiedzi udzielone do tej chwili.
              </li>
            )}
          </ul>
        </div>
        <h2 className="maturazinformatyki-quiz-start-h2">Powodzenia!</h2>

        <p className="maturazinformatyki-quiz-start-user">
          Rozwiązujesz jako: <strong>{userName}</strong>
          {questionsCount ? ` · pytań: ${questionsCount}` : ""}
        </p>

        <label className="maturazinformatyki-quiz-start-label">
          <input
            type="checkbox"
            checked={consent}
            onChange={(e) => setConsent(e.target.checked)}
            className="maturazinformatyki-quiz-start-checkbox"
          />
          <span>Rozpoczynając, potwierdzam gotowość do rozwiązania testu.</span>
        </label>

        {error && <p className="maturazinformatyki-quiz-error">{error}</p>}

        <button
          onClick={onStart}
          disabled={!consent || starting}
          className="maturazinformatyki-quiz-start-button"
        >
          {starting ? "Ładowanie pytań..." : "Rozpocznij quiz"}
        </button>
      </div>
      <Footer nameQuiz={nameQuiz} />
    </div>
  );
};

export default StartScreen;
