import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../api";
import { useAuth } from "../auth/AuthContext";
import { EnrollmentBadge, lessonsLabel, quizzesLabel } from "../pages/courses/courseUtils";
import { markdownPreview } from "../pages/courses/markdownPreview";
import "../pages/courses/Courses.css";
import "./HomeCourses.css";

// Znak technologii na karcie kursu — rozpoznawany po adresie (slug) kursu
const TECH = [
  { match: /python/, label: "PY", className: "is-python" },
  { match: /javascript|js-/, label: "JS", className: "is-js" },
  { match: /css/, label: "CSS", className: "is-css" },
  { match: /html/, label: "HTML", className: "is-html" },
  { match: /sql|baz/, label: "SQL", className: "is-sql" },
];

function techOf(course) {
  const found = TECH.find((t) => t.match.test(course.slug));
  if (found) return found;
  const initials = course.title.replace(/[^\p{L}\p{N} ]/gu, "").split(/\s+/).slice(0, 2).map((w) => w[0]).join("");
  return { label: initials.toUpperCase() || "K", className: "is-other" };
}

// Strona główna: lista dostępnych (opublikowanych) kursów
function HomeCourses() {
  const { user } = useAuth();
  const [courses, setCourses] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    api("/courses")
      .then(setCourses)
      .catch((err) => setError(err.message));
  }, [user?.id]); // po zalogowaniu odśwież plakietki dostępu

  // brak kursów albo błąd — sekcja się nie pokazuje (strona główna ma działać dalej)
  if (error || (courses && courses.length === 0)) return null;

  return (
    <section className="mzi-container mzi-home-courses" aria-labelledby="mzi-home-courses-title">
      <div className="mzi-home-courses-head">
        <h2 id="mzi-home-courses-title" className="mzi-section-title">Kursy</h2>
        <Link to="/kursy" className="mzi-home-courses-all">Wszystkie kursy →</Link>
      </div>

      {!courses && <p className="mzi-articles-empty">Ładowanie...</p>}

      <ul className="mzi-home-courses-list">
        {(courses ?? []).map((c) => {
          const tech = techOf(c);
          return (
            <li key={c.slug} className="mzi-home-course">
              <span className={`mzi-home-course-tech ${tech.className}`} aria-hidden="true">{tech.label}</span>
              <div className="mzi-home-course-body">
                <h3 className="mzi-home-course-title">
                  {/* link rozciągnięty na całą kartę (::after w CSS) */}
                  <Link to={`/kursy/${c.slug}`}>{c.title}</Link>
                </h3>
                <p className="mzi-home-course-meta">
                  {lessonsLabel(c.lessons)} · {quizzesLabel(c.quizzes)}
                  <EnrollmentBadge status={c.enrollmentStatus} />
                </p>
                {c.description && <p className="mzi-home-course-text">{markdownPreview(c.description, 120)}</p>}
              </div>
            </li>
          );
        })}
      </ul>
    </section>
  );
}

export default HomeCourses;
