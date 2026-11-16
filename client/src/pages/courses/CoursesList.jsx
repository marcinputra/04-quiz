import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../../api";
import { useAuth } from "../../auth/AuthContext";
import Footer from "../../component/Footer";
import { EnrollmentBadge, lessonsLabel, quizzesLabel } from "./courseUtils";
import { markdownPreview } from "./markdownPreview";
import "../Articles.css";
import "./Courses.css";

// /kursy — lista opublikowanych kursów
function CoursesList() {
  const { user } = useAuth();
  const [courses, setCourses] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    document.title = "Kursy — maturazinformatyki.it";
    api("/courses")
      .then(setCourses)
      .catch((err) => setError(err.message));
  }, [user?.id]);

  return (
    <div className="mzi-home">
      <main className="mzi-container mzi-articles">
        <h1 className="mzi-section-title mzi-courses-title">Kursy</h1>
        <p className="mzi-courses-intro">
          Kursy składają się z lekcji i quizów. Dostęp przyznaje prowadzący — {user ? "poproś o dostęp na stronie kursu." : "zaloguj się i poproś o dostęp na stronie kursu."}
        </p>

        {error && <p className="mzi-articles-error" role="alert">{error}</p>}
        {!courses && !error && <p className="mzi-articles-empty">Ładowanie...</p>}
        {courses && courses.length === 0 && <p className="mzi-articles-empty">Wkrótce pojawią się tu kursy.</p>}

        <div className="mzi-article-grid">
          {(courses ?? []).map((c) => (
            <article key={c.slug} className="mzi-article-card">
              <div className="mzi-article-body">
                <div className="mzi-course-meta">
                  <span>{lessonsLabel(c.lessons)} · {quizzesLabel(c.quizzes)}</span>
                  <EnrollmentBadge status={c.enrollmentStatus} />
                </div>
                <h2 className="mzi-article-title">
                  <Link to={`/kursy/${c.slug}`}>{c.title}</Link>
                </h2>
                {c.description && <p className="mzi-article-excerpt">{markdownPreview(c.description)}</p>}
                <Link to={`/kursy/${c.slug}`} className="mzi-article-more" aria-label={`Zobacz kurs: ${c.title}`}>
                  Zobacz kurs →
                </Link>
              </div>
            </article>
          ))}
        </div>
      </main>
      <Footer nameQuiz="Kursy" />
    </div>
  );
}

export default CoursesList;
