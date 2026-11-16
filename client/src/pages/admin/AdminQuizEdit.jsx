import { useCallback, useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { api } from "../../api";
import AdminNav from "./AdminNav";
import QuestionForm from "./QuestionForm";
import "../Auth.css";
import "./Admin.css";
import "../../component/Quiz.css";

const letter = (i) => String.fromCharCode(65 + i);

const emptyMeta = { title: "", slug: "", description: "", topic: "", level: "", shuffle: true, lockOnLeave: false, isPublished: false, courseId: "" };

// Edycja quizu: dane quizu + lista pytań. Adres /admin/quizy/nowy tworzy nowy quiz.
function AdminQuizEdit() {
  const { id } = useParams();
  const isNew = id === "nowy";
  const navigate = useNavigate();

  const [quiz, setQuiz] = useState(null);
  const [meta, setMeta] = useState(emptyMeta);
  const [allQuizzes, setAllQuizzes] = useState([]);
  const [courses, setCourses] = useState([]);
  const [loadError, setLoadError] = useState("");
  const [metaError, setMetaError] = useState("");
  const [metaSaved, setMetaSaved] = useState(false);
  const [savingMeta, setSavingMeta] = useState(false);
  const [listError, setListError] = useState("");
  const [editing, setEditing] = useState(null); // id pytania | "new" | null
  const [busy, setBusy] = useState(false);

  const load = useCallback(async () => {
    if (isNew) return;
    try {
      const data = await api(`/admin/quizzes/${encodeURIComponent(id)}`);
      setQuiz(data);
      setMeta({
        title: data.title,
        slug: data.slug,
        description: data.description ?? "",
        topic: data.topic ?? "",
        level: data.level ?? "",
        shuffle: data.shuffle,
        lockOnLeave: data.lockOnLeave,
        isPublished: data.isPublished,
        courseId: data.courseId ?? "",
      });
    } catch (err) {
      setLoadError(err.message);
    }
  }, [id, isNew]);

  useEffect(() => {
    setQuiz(null);
    setMeta(emptyMeta);
    setLoadError("");
    setEditing(null);
    load();
    // tematy i poziomy z innych quizów — podpowiedzi w polach
    api("/admin/quizzes").then(setAllQuizzes).catch(() => {});
    api("/admin/courses").then(setCourses).catch(() => {});
  }, [load]);

  const topics = useMemo(() => [...new Set(allQuizzes.map((q) => q.topic).filter(Boolean))], [allQuizzes]);
  const levels = useMemo(() => [...new Set(allQuizzes.map((q) => q.level).filter(Boolean))], [allQuizzes]);

  const setField = (name) => (e) => {
    const value = e.target.type === "checkbox" ? e.target.checked : e.target.value;
    setMeta((m) => ({ ...m, [name]: value }));
    setMetaSaved(false);
  };

  const saveMeta = async (e) => {
    e.preventDefault();
    setSavingMeta(true);
    setMetaError("");
    setMetaSaved(false);
    try {
      if (isNew) {
        const { isPublished, ...data } = meta;
        const created = await api("/admin/quizzes", { method: "POST", body: data });
        navigate(`/admin/quizy/${created.id}`, { replace: true });
        return;
      }
      const updated = await api(`/admin/quizzes/${quiz.id}`, { method: "PATCH", body: meta });
      setQuiz(updated);
      setMeta((m) => ({ ...m, slug: updated.slug }));
      setMetaSaved(true);
    } catch (err) {
      setMetaError(err.message);
    } finally {
      setSavingMeta(false);
    }
  };

  // operacje na pytaniach: po każdej przeładowanie quizu
  const run = async (fn) => {
    setBusy(true);
    setListError("");
    try {
      await fn();
    } catch (err) {
      setListError(err.message);
    } finally {
      setBusy(false);
      await load();
    }
  };

  const saveQuestion = async (questionId, data) => {
    if (questionId === "new") {
      await api(`/admin/quizzes/${quiz.id}/questions`, { method: "POST", body: data });
    } else {
      await api(`/admin/questions/${questionId}`, { method: "PUT", body: data });
    }
    setEditing(null);
    await load();
  };

  const moveQuestion = (index, delta) => {
    const qs = quiz.questions;
    const target = index + delta;
    if (target < 0 || target >= qs.length) return;
    const ids = qs.map((q) => q.id);
    [ids[index], ids[target]] = [ids[target], ids[index]];
    run(() => api(`/admin/quizzes/${quiz.id}/questions/order`, { method: "PUT", body: { ids } }));
  };

  const deleteQuestion = (q, index) => {
    const extra = q._count.attemptAnswers
      ? `\n\nOdpowiedziało na nie już ${q._count.attemptAnswers} osób — ich odpowiedzi na to pytanie znikną ze szczegółów wyników.`
      : "";
    if (!window.confirm(`Usunąć pytanie ${index + 1}?${extra}`)) return;
    run(() => api(`/admin/questions/${q.id}`, { method: "DELETE" }));
  };

  if (loadError) {
    return (
      <div className="mzi-auth-page mzi-auth-page-wide">
        <div className="mzi-auth-card">
          <p className="mzi-auth-error">{loadError}</p>
          <p className="mzi-auth-muted">
            <Link to="/admin/quizy" className="mzi-auth-link">Wróć do listy quizów</Link>
          </p>
        </div>
      </div>
    );
  }
  if (!isNew && !quiz) return <p className="mzi-auth-loading">Ładowanie...</p>;

  const questions = quiz?.questions ?? [];

  return (
    <div className="mzi-auth-page mzi-auth-page-wide">
      <div className="mzi-auth-card mzi-admin-card">
        <h1 className="mzi-auth-title">Panel admina</h1>
        <AdminNav />

        <p className="mzi-admin-breadcrumb">
          <Link to="/admin/quizy" className="mzi-auth-link">← Lista quizów</Link>
          {quiz && (
            <>
              {" · "}
              <Link to={`/quiz/${quiz.slug}`} className="mzi-auth-link">Podgląd quizu</Link>
            </>
          )}
        </p>

        {/* ---------- dane quizu ---------- */}
        <form className="mzi-admin-form" onSubmit={saveMeta} noValidate>
          <h2 className="mzi-auth-subtitle">{isNew ? "Nowy quiz" : "Dane quizu"}</h2>

          <label className="mzi-admin-label" htmlFor="quiz-title">Tytuł *</label>
          <input id="quiz-title" className="mzi-admin-input" value={meta.title} onChange={setField("title")} required />

          <label className="mzi-admin-label" htmlFor="quiz-slug">
            Adres quizu (slug) — {isNew ? "zostaw puste, utworzy się z tytułu" : "zmiana zmieni link do quizu"}
          </label>
          <div className="mzi-admin-slug-field">
            <span className="mzi-admin-slug">/quiz/</span>
            <input
              id="quiz-slug"
              className="mzi-admin-input"
              value={meta.slug}
              onChange={setField("slug")}
              placeholder="np. python-petle-1"
            />
          </div>

          <label className="mzi-admin-label" htmlFor="quiz-desc">Opis (widoczny na liście quizów)</label>
          <textarea id="quiz-desc" className="mzi-admin-input" rows={2} value={meta.description} onChange={setField("description")} />

          <div className="mzi-admin-row">
            <div>
              <label className="mzi-admin-label" htmlFor="quiz-topic">Temat</label>
              <input id="quiz-topic" className="mzi-admin-input" list="quiz-topics" value={meta.topic} onChange={setField("topic")} placeholder="np. Python" />
              <datalist id="quiz-topics">{topics.map((t) => <option key={t} value={t} />)}</datalist>
            </div>
            <div>
              <label className="mzi-admin-label" htmlFor="quiz-level">Poziom</label>
              <input id="quiz-level" className="mzi-admin-input" list="quiz-levels" value={meta.level} onChange={setField("level")} placeholder="np. podstawowy" />
              <datalist id="quiz-levels">{levels.map((l) => <option key={l} value={l} />)}</datalist>
            </div>
          </div>

          <label className="mzi-admin-label" htmlFor="quiz-course">Kurs</label>
          <select id="quiz-course" className="mzi-admin-input" value={meta.courseId} onChange={setField("courseId")}>
            <option value="">— brak (quiz dla każdego zalogowanego) —</option>
            {courses.map((c) => (
              <option key={c.id} value={c.id}>{c.title}</option>
            ))}
          </select>
          {meta.courseId !== "" && (
            <p className="mzi-admin-slug">Quiz zobaczą tylko uczniowie z zatwierdzonym dostępem do tego kursu.</p>
          )}

          <label className="mzi-admin-check">
            <input type="checkbox" checked={meta.shuffle} onChange={setField("shuffle")} />
            Losowa kolejność pytań
          </label>
          <label className="mzi-admin-check">
            <input type="checkbox" checked={meta.lockOnLeave} onChange={setField("lockOnLeave")} />
            Zakończ quiz, gdy uczeń opuści kartę lub okno przeglądarki przestanie być aktywne
          </label>
          {meta.lockOnLeave && (
            <p className="mzi-admin-hint">
              Przejście na inną kartę, kliknięcie w inny program lub poza stronę (np. pasek adresu, narzędzia F12),
              zminimalizowanie okna albo wyjście ze strony quizu kończy podejście — liczą się odpowiedzi udzielone do tej chwili, pozostałe pytania są niezaliczone.
              Uczeń zobaczy to ostrzeżenie przed rozpoczęciem.
            </p>
          )}
          {!isNew && (
            <label className="mzi-admin-check">
              <input type="checkbox" checked={meta.isPublished} onChange={setField("isPublished")} disabled={!questions.length} />
              Opublikowany (widoczny dla uczniów){!questions.length && " — dodaj najpierw pytania"}
            </label>
          )}

          {metaError && <p className="mzi-auth-error" role="alert">{metaError}</p>}
          {metaSaved && <p className="mzi-auth-success" role="status">Zapisano.</p>}

          <div className="mzi-form-actions">
            <button type="submit" className="mzi-btn mzi-btn-primary" disabled={savingMeta || !meta.title.trim()}>
              {savingMeta ? "Zapisywanie..." : isNew ? "Utwórz quiz i dodaj pytania" : "Zapisz dane quizu"}
            </button>
          </div>
        </form>

        {/* ---------- pytania ---------- */}
        {!isNew && (
          <section className="mzi-admin-questions">
            <h2 className="mzi-auth-subtitle">Pytania ({questions.length})</h2>
            {quiz._count.attempts > 0 && (
              <p className="mzi-admin-note">
                Ten quiz ma {quiz._count.attempts} podejść uczniów. Zmiany w pytaniach nie zmieniają już zapisanych wyników.
              </p>
            )}
            {listError && <p className="mzi-auth-error" role="alert">{listError}</p>}

            <ol className="mzi-question-list">
              {questions.map((q, i) => (
                <li key={q.id} className="mzi-question-card">
                  {editing === q.id ? (
                    <QuestionForm initial={q} onSave={(data) => saveQuestion(q.id, data)} onCancel={() => setEditing(null)} />
                  ) : (
                    <>
                      <div className="mzi-question-card-head">
                        <span className="mzi-question-number">Pytanie {i + 1}</span>
                        <div className="mzi-admin-actions">
                          <button type="button" className="mzi-btn mzi-btn-icon" onClick={() => moveQuestion(i, -1)} disabled={busy || editing !== null || i === 0} aria-label={`Przesuń pytanie ${i + 1} w górę`}>↑</button>
                          <button type="button" className="mzi-btn mzi-btn-icon" onClick={() => moveQuestion(i, 1)} disabled={busy || editing !== null || i === questions.length - 1} aria-label={`Przesuń pytanie ${i + 1} w dół`}>↓</button>
                          <button type="button" className="mzi-btn mzi-btn-small" onClick={() => setEditing(q.id)} disabled={busy || editing !== null}>Edytuj</button>
                          <button type="button" className="mzi-btn mzi-btn-small mzi-btn-danger" onClick={() => deleteQuestion(q, i)} disabled={busy || editing !== null}>Usuń</button>
                        </div>
                      </div>
                      {q.question && <p className="mzi-question-text">{q.question}</p>}
                      {q.code && <pre className="maturazinformatyki-quiz-code mzi-question-code">{q.code}</pre>}
                      <ul className="mzi-question-preview-options">
                        {q.options.map((o, oi) => (
                          <li key={o.id} className={o.isCorrect ? "mzi-preview-correct" : ""}>
                            <strong>{letter(oi)}.</strong> {o.text}
                            {o.isCorrect && <span className="mzi-preview-tag"> ✓ poprawna</span>}
                          </li>
                        ))}
                      </ul>
                    </>
                  )}
                </li>
              ))}
            </ol>

            {editing === "new" ? (
              <div className="mzi-question-card">
                <QuestionForm initial={null} onSave={(data) => saveQuestion("new", data)} onCancel={() => setEditing(null)} />
              </div>
            ) : (
              <button type="button" className="mzi-btn mzi-btn-primary" onClick={() => setEditing("new")} disabled={busy || editing !== null}>
                + Dodaj pytanie
              </button>
            )}
          </section>
        )}
      </div>
    </div>
  );
}

export default AdminQuizEdit;
