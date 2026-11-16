import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { api } from "../../api";
import Markdown from "../../component/Markdown";
import Footer from "../../component/Footer";
import "../Articles.css";
import "./Courses.css";

// /kursy/:slug/lekcje/:id — treść lekcji ze spisem lekcji i nawigacją
function LessonPage() {
  const { slug, id } = useParams();
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;
    setData(null);
    setError(null);
    api(`/courses/${encodeURIComponent(slug)}/lessons/${encodeURIComponent(id)}`)
      .then((d) => {
        if (cancelled) return;
        setData(d);
        document.title = `${d.lesson.title} — ${d.course.title}`;
        window.scrollTo(0, 0);
      })
      .catch((err) => !cancelled && setError(err));
    return () => {
      cancelled = true;
    };
  }, [slug, id]);

  if (error) {
    return (
      <div className="mzi-home">
        <main className="mzi-container mzi-article-page">
          <p className="mzi-articles-error">{error.message}</p>
          <Link to={`/kursy/${slug}`} className="mzi-article-back">
            {error.code === "NO_ACCESS" ? "Przejdź do strony kursu, aby poprosić o dostęp →" : "← Wróć do kursu"}
          </Link>
        </main>
      </div>
    );
  }
  if (!data) return <p className="mzi-auth-loading">Ładowanie...</p>;

  const { lesson, course, lessons, prevId, nextId, number } = data;

  return (
    <div className="mzi-home">
      <div className="mzi-container mzi-lesson-layout">
        <nav className="mzi-lesson-nav" aria-label="Lekcje kursu">
          <Link to={`/kursy/${course.slug}`} className="mzi-lesson-nav-course">← {course.title}</Link>
          <ol>
            {lessons.map((l, i) => (
              <li key={l.id}>
                <Link
                  to={`/kursy/${course.slug}/lekcje/${l.id}`}
                  className={l.id === lesson.id ? "active" : ""}
                  aria-current={l.id === lesson.id ? "page" : undefined}
                >
                  {i + 1}. {l.title}
                </Link>
              </li>
            ))}
          </ol>
        </nav>

        <main className="mzi-lesson-main">
          <p className="mzi-article-date">Lekcja {number} z {lessons.length}</p>
          <h1 className="mzi-article-page-title">{lesson.title}</h1>
          {lesson.content ? <Markdown>{lesson.content}</Markdown> : <p className="mzi-articles-empty">Ta lekcja nie ma jeszcze treści.</p>}

          <div className="mzi-lesson-pager">
            {prevId ? (
              <Link to={`/kursy/${course.slug}/lekcje/${prevId}`} className="mzi-btn-hero">← Poprzednia</Link>
            ) : <span />}
            {nextId ? (
              <Link to={`/kursy/${course.slug}/lekcje/${nextId}`} className="mzi-btn-hero mzi-btn-hero-primary">Następna →</Link>
            ) : (
              <Link to={`/kursy/${course.slug}`} className="mzi-btn-hero mzi-btn-hero-primary">Koniec — wróć do kursu</Link>
            )}
          </div>
        </main>
      </div>
      <Footer nameQuiz={course.title} />
    </div>
  );
}

export default LessonPage;
