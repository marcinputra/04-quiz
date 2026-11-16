import { useCallback, useEffect, useRef, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { api } from "../../api";
import AdminNav from "./AdminNav";
import MarkdownEditor from "./MarkdownEditor";
import "../Auth.css";
import "./Admin.css";

const emptyMeta = { title: "", slug: "", description: "", isPublished: false };

// Formularz lekcji: tytuł + treść w edytorze Markdown
function LessonForm({ initial, onSave, onCancel }) {
  const [title, setTitle] = useState(initial?.title ?? "");
  const [content, setContent] = useState(initial?.content ?? "");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const formRef = useRef(null);

  const submit = async (e) => {
    e?.preventDefault();
    if (!title.trim()) {
      setError("Podaj tytuł lekcji.");
      return;
    }
    setSaving(true);
    setError("");
    try {
      await onSave({ title, content });
    } catch (err) {
      setError(err.message);
      setSaving(false);
    }
  };

  return (
    <form ref={formRef} className="mzi-question-form" onSubmit={submit} noValidate>
      <label className="mzi-admin-label" htmlFor={`lesson-title-${initial?.id ?? "new"}`}>Tytuł lekcji</label>
      <input
        id={`lesson-title-${initial?.id ?? "new"}`}
        className="mzi-admin-input"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        autoFocus
      />
      <label className="mzi-admin-label" htmlFor={`lesson-content-${initial?.id ?? "new"}`}>Treść (Markdown)</label>
      <MarkdownEditor
        id={`lesson-content-${initial?.id ?? "new"}`}
        value={content}
        onChange={setContent}
        onSave={() => !saving && submit()}
      />
      {error && <p className="mzi-auth-error" role="alert">{error}</p>}
      <div className="mzi-form-actions">
        <button type="submit" className="mzi-btn mzi-btn-primary" disabled={saving}>
          {saving ? "Zapisywanie..." : initial ? "Zapisz lekcję" : "Dodaj lekcję"}
        </button>
        <button type="button" className="mzi-btn" onClick={onCancel} disabled={saving}>Anuluj</button>
      </div>
    </form>
  );
}

// /admin/kursy/:id (nowy: /admin/kursy/nowy) — dane kursu, lekcje, przypisane quizy
function AdminCourseEdit() {
  const { id } = useParams();
  const isNew = id === "nowy";
  const navigate = useNavigate();

  const [course, setCourse] = useState(null);
  const [meta, setMeta] = useState(emptyMeta);
  const [loadError, setLoadError] = useState("");
  const [metaError, setMetaError] = useState("");
  const [metaSaved, setMetaSaved] = useState(false);
  const [savingMeta, setSavingMeta] = useState(false);
  const [listError, setListError] = useState("");
  const [editing, setEditing] = useState(null); // id lekcji | "new" | null
  const [busy, setBusy] = useState(false);

  const load = useCallback(async () => {
    if (isNew) return;
    try {
      const data = await api(`/admin/courses/${encodeURIComponent(id)}`);
      setCourse(data);
      setMeta({ title: data.title, slug: data.slug, description: data.description ?? "", isPublished: data.isPublished });
    } catch (err) {
      setLoadError(err.message);
    }
  }, [id, isNew]);

  useEffect(() => {
    setCourse(null);
    setMeta(emptyMeta);
    setLoadError("");
    setEditing(null);
    load();
  }, [load]);

  const setField = (name) => (e) => {
    const value = e.target.type === "checkbox" ? e.target.checked : e.target.value;
    setMeta((m) => ({ ...m, [name]: value }));
    setMetaSaved(false);
  };

  const saveMeta = async (e) => {
    e?.preventDefault();
    setSavingMeta(true);
    setMetaError("");
    setMetaSaved(false);
    try {
      if (isNew) {
        const { isPublished, ...data } = meta;
        const created = await api("/admin/courses", { method: "POST", body: data });
        navigate(`/admin/kursy/${created.id}`, { replace: true });
        return;
      }
      const updated = await api(`/admin/courses/${course.id}`, { method: "PATCH", body: meta });
      setCourse(updated);
      setMeta((m) => ({ ...m, slug: updated.slug }));
      setMetaSaved(true);
    } catch (err) {
      setMetaError(err.message);
    } finally {
      setSavingMeta(false);
    }
  };

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

  const saveLesson = async (lessonId, data) => {
    if (lessonId === "new") await api(`/admin/courses/${course.id}/lessons`, { method: "POST", body: data });
    else await api(`/admin/lessons/${lessonId}`, { method: "PUT", body: data });
    setEditing(null);
    await load();
  };

  const moveLesson = (index, delta) => {
    const ids = course.lessons.map((l) => l.id);
    const target = index + delta;
    if (target < 0 || target >= ids.length) return;
    [ids[index], ids[target]] = [ids[target], ids[index]];
    run(() => api(`/admin/courses/${course.id}/lessons/order`, { method: "PUT", body: { ids } }));
  };

  const deleteLesson = (l, index) => {
    if (!window.confirm(`Usunąć lekcję ${index + 1}: „${l.title}”?`)) return;
    run(() => api(`/admin/lessons/${l.id}`, { method: "DELETE" }));
  };

  if (loadError) {
    return (
      <div className="mzi-auth-page mzi-auth-page-wide">
        <div className="mzi-auth-card">
          <p className="mzi-auth-error">{loadError}</p>
          <p className="mzi-auth-muted"><Link to="/admin/kursy" className="mzi-auth-link">Wróć do listy kursów</Link></p>
        </div>
      </div>
    );
  }
  if (!isNew && !course) return <p className="mzi-auth-loading">Ładowanie...</p>;

  const lessons = course?.lessons ?? [];

  return (
    <div className="mzi-auth-page mzi-auth-page-wide">
      <div className="mzi-auth-card mzi-admin-card mzi-admin-card-xl">
        <h1 className="mzi-auth-title">Panel admina</h1>
        <AdminNav />

        <p className="mzi-admin-breadcrumb">
          <Link to="/admin/kursy" className="mzi-auth-link">← Lista kursów</Link>
          {course && (
            <>
              {" · "}
              <Link to={`/kursy/${course.slug}`} className="mzi-auth-link">Podgląd kursu</Link>
            </>
          )}
        </p>

        {/* ---------- dane kursu ---------- */}
        <form className="mzi-admin-form" onSubmit={saveMeta} noValidate>
          <h2 className="mzi-auth-subtitle">{isNew ? "Nowy kurs" : "Dane kursu"}</h2>

          <label className="mzi-admin-label" htmlFor="course-title">Nazwa kursu *</label>
          <input id="course-title" className="mzi-admin-input mzi-article-title-input" value={meta.title} onChange={setField("title")} />

          <label className="mzi-admin-label" htmlFor="course-slug">
            Adres — {isNew ? "zostaw puste, utworzy się z nazwy" : "zmiana zmieni link do kursu"}
          </label>
          <div className="mzi-admin-slug-field">
            <span className="mzi-admin-slug">/kursy/</span>
            <input id="course-slug" className="mzi-admin-input" value={meta.slug} onChange={setField("slug")} placeholder="np. python-od-podstaw" />
          </div>

          <label className="mzi-admin-label" htmlFor="course-desc">Opis kursu (Markdown — widzą go wszyscy, także bez dostępu)</label>
          <MarkdownEditor
            id="course-desc"
            value={meta.description}
            onChange={(description) => {
              setMeta((m) => ({ ...m, description }));
              setMetaSaved(false);
            }}
            onSave={() => !savingMeta && saveMeta()}
          />

          {!isNew && (
            <label className="mzi-admin-check">
              <input type="checkbox" checked={meta.isPublished} onChange={setField("isPublished")} />
              Opublikowany (widoczny na liście kursów)
            </label>
          )}

          {metaError && <p className="mzi-auth-error" role="alert">{metaError}</p>}
          {metaSaved && <p className="mzi-auth-success" role="status">Zapisano.</p>}

          <div className="mzi-form-actions">
            <button type="submit" className="mzi-btn mzi-btn-primary" disabled={savingMeta || !meta.title.trim()}>
              {savingMeta ? "Zapisywanie..." : isNew ? "Utwórz kurs i dodaj lekcje" : "Zapisz dane kursu"}
            </button>
          </div>
        </form>

        {!isNew && (
          <>
            {/* ---------- lekcje ---------- */}
            <section className="mzi-admin-questions">
              <h2 className="mzi-auth-subtitle">Lekcje ({lessons.length})</h2>
              {listError && <p className="mzi-auth-error" role="alert">{listError}</p>}

              <ol className="mzi-question-list">
                {lessons.map((l, i) => (
                  <li key={l.id} className="mzi-question-card">
                    {editing === l.id ? (
                      <LessonForm initial={l} onSave={(data) => saveLesson(l.id, data)} onCancel={() => setEditing(null)} />
                    ) : (
                      <div className="mzi-question-card-head">
                        <span>
                          <span className="mzi-question-number">Lekcja {i + 1}</span>{" "}
                          <strong>{l.title}</strong>
                          {!l.content && <span className="mzi-admin-slug"> (bez treści)</span>}
                        </span>
                        <div className="mzi-admin-actions">
                          <button type="button" className="mzi-btn mzi-btn-icon" onClick={() => moveLesson(i, -1)} disabled={busy || editing !== null || i === 0} aria-label={`Przesuń lekcję ${i + 1} w górę`}>↑</button>
                          <button type="button" className="mzi-btn mzi-btn-icon" onClick={() => moveLesson(i, 1)} disabled={busy || editing !== null || i === lessons.length - 1} aria-label={`Przesuń lekcję ${i + 1} w dół`}>↓</button>
                          <button type="button" className="mzi-btn mzi-btn-small" onClick={() => setEditing(l.id)} disabled={busy || editing !== null}>Edytuj</button>
                          <button type="button" className="mzi-btn mzi-btn-small mzi-btn-danger" onClick={() => deleteLesson(l, i)} disabled={busy || editing !== null}>Usuń</button>
                        </div>
                      </div>
                    )}
                  </li>
                ))}
              </ol>

              {editing === "new" ? (
                <div className="mzi-question-card">
                  <LessonForm initial={null} onSave={(data) => saveLesson("new", data)} onCancel={() => setEditing(null)} />
                </div>
              ) : (
                <button type="button" className="mzi-btn mzi-btn-primary" onClick={() => setEditing("new")} disabled={busy || editing !== null}>
                  + Dodaj lekcję
                </button>
              )}
            </section>

            {/* ---------- quizy kursu ---------- */}
            <section className="mzi-admin-questions mzi-results-gap">
              <h2 className="mzi-auth-subtitle">Quizy w kursie ({course.quizzes.length})</h2>
              <p className="mzi-auth-muted">
                Quiz przypisujesz do kursu w edytorze quizu (pole „Kurs”). Quizy kursu widzą tylko uczniowie z zatwierdzonym dostępem.
              </p>
              {course.quizzes.length > 0 && (
                <ul className="mzi-question-preview-options">
                  {course.quizzes.map((q) => (
                    <li key={q.id}>
                      <Link to={`/admin/quizy/${q.id}`} className="mzi-auth-link">{q.title}</Link>
                      <span className="mzi-admin-slug"> {q.isPublished ? "· opublikowany" : "· szkic"}</span>
                    </li>
                  ))}
                </ul>
              )}
            </section>
          </>
        )}
      </div>
    </div>
  );
}

export default AdminCourseEdit;
