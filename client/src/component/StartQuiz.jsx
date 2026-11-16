import React, { useMemo, useState } from 'react';
import { useNavigate } from "react-router-dom";
import Footer from './Footer';
import { useAuth } from '../auth/AuthContext';
import './StartQuiz.css';

function StartQuiz({listQuiz}) {

  const navigate = useNavigate();
  const { user } = useAuth();

  // aktualnie wybrane filtry (temat i poziom)
  const [selectedLevel, setSelectedLevel] = useState("");
  const [selectedTopic, setSelectedTopic] = useState("");

  // dodawnie wyboru listy
  const topicOptions = useMemo( () => {
    return Array.from(
      new Set((listQuiz ?? []).map((q)=>q.topic).filter(Boolean))
    );
  }, [listQuiz])

  // dodawnie wyboru poziomu
  const levelOptions = useMemo( () => {
    return Array.from(
      new Set((listQuiz ?? []).map((q)=>q.level).filter(Boolean))
    );
  }, [listQuiz])

  // filtrowanie quizów
  const filteredQuizzes = useMemo(() => {
    return (listQuiz ?? []).filter((q) => {
      const topicOk = selectedTopic ? q.topic === selectedTopic : true;
      const levelOk = selectedLevel ? q.level === selectedLevel : true;
      return topicOk && levelOk;
    });
  }, [listQuiz, selectedTopic, selectedLevel]);

  return (
    <div className='maturazinformatyki-quiz'>
      <header className='maturazinformatyki-quiz-app-header'>
        <div className='maturazinformatyki-quiz-container'>
          <h1>Wybierz quiz</h1>
          <p className='maturazinformatyki-quiz-subtitle'>
            Zacznij od wyboru tematu (poziomu), a potem rozpocznij quiz.
          </p>
        </div>
      </header>
      <main className='maturazinformatyki-quiz-container'>
        <section id="view-picker" className="maturazinformatyki-quiz-card-list">
          <div className="maturazinformatyki-quiz-card-header">
            <h2>Dostępne quizy:</h2>
          </div>
          <div className='maturazinformatyki-quiz-filter'>
            <select 
              value={selectedTopic}
              onChange={(e) => setSelectedTopic(e.target.value)}
              className='maturazinformatyki-quiz-filter-select'
            >
              <option 
                value="hiden" 
                className='maturazinformatyki-quiz-filter-select-hidden'
              >Wszystkie tematy</option>
              {topicOptions.map( (quiz, index) => (
                <option 
                  key={index} 
                  onChange={(e) => setSelectedTopic(e.target.value)}
                  className='maturazinformatyki-quiz-filter-select-styled'
                >
                  {quiz}
                </option>
              ))}
            </select>
            <select 
              value={selectedLevel}
              onChange={(e) => setSelectedLevel(e.target.value)}
              className='maturazinformatyki-quiz-filter-select'
            >
              <option value="">Wszystkie poziomy</option>
              {levelOptions.map( (quiz, index) => (
                <option 
                  key={index} 
                  onChange={(e) => setSelectedLevel(e.target.value)}
                >
                  {quiz}
                </option>
              ))}
            </select>
          </div>
          {filteredQuizzes.length > 0 ? (
            <div 
              id="maturazinformatyki-quiz-quizList" 
              className="maturazinformatyki-quiz-quizList" 
            >
              {/* list quiz */}
              {filteredQuizzes.map( (quiz, index)=>(
                <div className='maturazinformatyki-quiz-grid-quiz' key={quiz.id}>
                  <div className="maturazinformatyki-quiz-grid-quiz-header">
                    {quiz.title}
                  </div>
                  <div className="maturazinformatyki-quiz-grid-quiz-content">
                    <p><span className='maturazinformatyki-quiz-grid-quiz-header-span'>Opis:</span> {quiz.content}</p>
                    <p><span className='maturazinformatyki-quiz-grid-quiz-header-span'>Poziom:</span> {quiz.level}</p>
                    <p><span className='maturazinformatyki-quiz-grid-quiz-header-span'>Ilość pytań:</span> {quiz.questions}</p>
                  </div>
                  <div className='maturazinformatyki-quiz-grid-quiz-btn'>
                    <button 
                      type="button" 
                      className='maturazinformatyki-quiz-grid-quiz-btn-btn'
                      onClick={()=>navigate(`/quiz/${quiz.id}`)}
                    >
                      {user ? "Rozpocznij quiz" : "Zaloguj się i rozpocznij"}
                    </button>
                  </div>
                </div>   
              ))}
              
            </div>
          ) : (
          <p id="emptyState" className="maturazinformatyki-quiz-no-filter">
            Brak wyników dla podanych filtrów.
          </p>
          ) }
        </section>
      </main>
      <Footer nameQuiz={"Lista quizów"} />
    </div>
  )
}

export default StartQuiz;