import { Routes, Route } from "react-router-dom";
import StartQuiz from "./component/StartQuiz";
import { useEffect, useState } from "react";
import Quiz from "./component/Quiz";

function App() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [quizzes, setQuizzes] = useState([]);

  const loadQuestions = async () => {
    try {
      setLoading(true);
      setError("");

      const res = await fetch("/quizList.json");
      console.log("STATUS:", res.status);
      console.log("CONTENT-TYPE:", res.headers.get("content-type"));

      if (!res.ok) {
        const raw = await res.text();
        console.log("RAW (first 200):", raw.slice(0, 200));
        throw new Error(`Nie udało się pobrać /quizList.json (HTTP ${res.status}).`);
      }

      const data = await res.json();
      console.log("DATA:", data);

      setQuizzes(data);
    } catch (err) {
      setError(err?.message || "Błąd podczas wczytywania danych");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadQuestions();
  }, []);

  if (loading) return <p>Ładowanie...</p>;
  if (error) return <p style={{ color: "red" }}>{error}</p>;

  return (
    <Routes>
      <Route path="/" element={<StartQuiz listQuiz={quizzes} />} />
      <Route path="/quiz/:id" element={<Quiz quizzes={quizzes} />} />
    </Routes>
  );
}

export default App;