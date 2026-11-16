import { useCallback, useEffect, useState } from "react";
import { Link, useLocation, useParams } from "react-router-dom";
import { api } from "../../api";
import { useAuth } from "../../auth/AuthContext";
import Markdown from "../../component/Markdown";
import Footer from "../../component/Footer";
import { EnrollmentBadge, lessonsLabel } from "./courseUtils";
import "../Articles.css";
import "./Courses.css";

// /kursy/:slug — opis kursu, prośba o dostęp, lekcje i quizy
function CoursePage() {
  const { slug } = useParams();
  const location = useLocation();
  const { user, isAdmin } = useAuth();
  const [course, setCourse] = useState(null);
  const [error, setError] = useState("");
  const [actionError, setActionError] = useState("");
  const [sending, setSending] = useState(false);

  const load = useCallback(() => {
    api(`/courses/${encodeURIComponent(slug)}`)
      .then((data) => {
        setCourse(data);
        document.title = `${data.title} — kursy — maturazinformatyki.it`;
      })
      .catch((err) => setError(err.message));
  }, [slug]);

  useEffect(() => {
    setCourse(null);
    setError("");
    load();
  }, [load, user?.id]);

  const requestAccess = async () => {
    setSending(true);
    setActionError("");
    try {
      await api(`/courses/${encodeURIComponent(slug)}/enroll`, { method: "POST" });
      load();
    } catch (err) {
      setActionError(err.message);
    } finally {
      setSending(false);
    }
  };

  if (error) {
    return (
      <div className="mzi-home">
        <main className="mzi-container mzi-article-page">
          <p className="mzi-articles-error">{error}</p>
          <Link to="/kursy" className="mzi-article-back">← Wszystkie kursy</Link>
        </main>
      </div>
    );
  }
  if (!course) return <p className="mzi-auth-loading">Ładowanie...</p>;

  const status = course.enrollment?.status ?? null;

  return (
    <div className="mzi-home">
      <main className="mzi-container mzi-article-page">
        <Link to="/kursy" className="mzi-article-back">← Wszystkie kursy</Link>
        {!course.isPublished && <p className="mzi-article-draft">Szkic — ten kurs widzisz tylko Ty jako administrator.</p>}

        <header className="mzi-article-header">
          <h1 className="mzi-article-page-title">{course.title}</h1>
          <p className="mzi-article-meta">
            {lessonsLabel(course.lessons.length)} · quizy: {course.quizzes.length} <EnrollmentBadge status={status} />
          </p>
        </header>

        {course.description && <Markdown>{course.description}</Markdown>}

        {/* ---------- dostęp ---------- */}
        {!course.hasAccess && (
          <aside className="mzi-course-access" aria-live="polite">
            {!user && (
              <>
                <p>Aby korzystać z kursu, zaloguj się i poproś o dostęp. Prowadzący zatwierdza każdą prośbę ręcznie.</p>
                <Link to="/logowanie" state={{ from: location }} className="mzi-btn-hero mzi-btn-hero-primary">
                  Zaloguj się
                </Link>
              </>
            )}
            {user && !status && (
              <>
                <p>Kurs wymaga zatwierdzenia przez prowadzącego. Po zatwierdzeniu dostaniesz e-mail.</p>
                <button type="button" className="mzi-btn-hero mzi-btn-hero-primary" onClick={requestAccess} disabled={sending}>
                  {sending ? "Wysyłanie..." : "Poproś o dostęp"}
                </button>
              </>
            )}
            {status === "pending" && (
              <p>
                <strong>Prośba wysłana.</strong> Czeka na zatwierdzenie przez prowadzącego — dostaniesz e-mail, gdy
                dostęp zostanie przyznany.
              </p>
            )}
            {status === "rejected" && (
              <>
                <p>Twoja prośba o dostęp nie została zatwierdzona. Możesz wysłać ją ponownie.</p>
                <button type="button" className="mzi-btn-hero" onClick={requestAccess} disabled={sending}>
                  {sending ? "Wysyłanie..." : "Poproś ponownie"}
                </button>
              </>
            )}
            {actionError && <p className="mzi-articles-error" role="alert">{actionError}</p>}
          </aside>
        )}

        {/* ---------- lekcje ---------- */}
        <section className="mzi-course-section">
          <h2 className="mzi-course-section-title">Lekcje</h2>
          {course.lessons.length === 0 && <p className="mzi-articles-empty">Lekcje pojawią się wkrótce.</p>}
          <ol className="mzi-lesson-list">
            {course.lessons.map((l, i) => (
              <li key={l.id}>
                <span className="mzi-lesson-number">{i + 1}</span>
                {course.hasAccess ? (
                  <Link to={`/kursy/${course.slug}/lekcje/${l.id}`}>{l.title}</Link>
                ) : (
                  <span className="mzi-lesson-locked" title="Dostępne po zatwierdzeniu">{l.title} 🔒</span>
                )}
              </li>
            ))}
          </ol>
          {course.hasAccess && course.lessons.length > 0 && (
            <Link to={`/kursy/${course.slug}/lekcje/${course.lessons[0].id}`} className="mzi-btn-hero mzi-btn-hero-primary">
              Zacznij od pierwszej lekcji
            </Link>
          )}
        </section>

        {/* ---------- quizy ---------- */}
        {course.quizzes.length > 0 && (
          <section className="mzi-course-section">
            <h2 className="mzi-course-section-title">Quizy w kursie</h2>
            <ul className="mzi-course-quizzes">
              {course.quizzes.map((q) => (
                <li key={q.slug}>
                  <div>
                    <strong>{q.title}</strong>
                    <span className="mzi-article-date"> · pytań: {q.questions}</span>
                  </div>
                  {course.hasAccess ? (
                    <Link to={`/quiz/${q.slug}`} className="mzi-btn-hero">Rozwiąż</Link>
                  ) : (
                    <span className="mzi-lesson-locked">🔒</span>
                  )}
                </li>
              ))}
            </ul>
          </section>
        )}

        {isAdmin && (
          <p className="mzi-article-admin"><Link to="/admin/kursy">Zarządzaj kursami w panelu admina</Link></p>
        )}
      </main>
      <Footer nameQuiz="Kursy" />
    </div>
  );
}

export default CoursePage;
