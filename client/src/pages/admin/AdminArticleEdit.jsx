import { useCallback, useEffect, useRef, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { api } from "../../api";
import AdminNav from "./AdminNav";
import MarkdownEditor from "./MarkdownEditor";
import { formatDate } from "../Home";
import "../Auth.css";
import "./Admin.css";

const empty = { title: "", slug: "", excerpt: "", coverUrl: "", content: "" };
const pickForm = (a) => ({
  title: a.title ?? "",
  slug: a.slug ?? "",
  excerpt: a.excerpt ?? "",
  coverUrl: a.coverUrl ?? "",
  content: a.content ?? "",
});

// Edycja artykułu. /admin/artykuly/nowy tworzy nowy (szkic).
function AdminArticleEdit() {
  const { id } = useParams();
  const isNew = id === "nowy";
  const navigate = useNavigate();

  const [article, setArticle] = useState(null); // ostatnio zapisana wersja z serwera
  const [form, setForm] = useState(empty);
  const [loadError, setLoadError] = useState("");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [saving, setSaving] = useState(false);

  const savedForm = article ? pickForm(article) : empty;
  const dirty = JSON.stringify(form) !== JSON.stringify(savedForm);

  // id artykułu właśnie utworzonego — po zmianie adresu na /admin/artykuly/:id
  // nie wczytujemy go ponownie (zgubiłoby to komunikat „Szkic zapisany”)
  const justCreatedId = useRef(null);

  useEffect(() => {
    if (!isNew && justCreatedId.current === Number(id)) {
      justCreatedId.current = null;
      return;
    }
    setLoadError("");
    setError("");
    setMessage("");
    if (isNew) {
      setArticle(null);
      setForm(empty);
      return;
    }
    api(`/admin/articles/${encodeURIComponent(id)}`)
      .then((a) => {
        setArticle(a);
        setForm(pickForm(a));
      })
      .catch((err) => setLoadError(err.message));
  }, [id, isNew]);

  // ostrzeżenie przy zamykaniu karty z niezapisanymi zmianami
  useEffect(() => {
    if (!dirty) return;
    const handler = (e) => {
      e.preventDefault();
      e.returnValue = "";
    };
    window.addEventListener("beforeunload", handler);
    return () => window.removeEventListener("beforeunload", handler);
  }, [dirty]);

  const setField = (name) => (e) => {
    setForm((f) => ({ ...f, [name]: e.target.value }));
    setMessage("");
  };

  // status: undefined = bez zmiany, "published" / "draft" = zmiana statusu przy zapisie
  const save = useCallback(
    async (status) => {
      setSaving(true);
      setError("");
      setMessage("");
      try {
        const body = { ...form, ...(status ? { status } : {}) };
        if (isNew) {
          const created = await api("/admin/articles", { method: "POST", body });
          setArticle(created);
          setForm(pickForm(created));
          justCreatedId.current = created.id;
          navigate(`/admin/artykuly/${created.id}`, { replace: true });
          setMessage(status === "published" ? "Artykuł utworzony i opublikowany." : "Szkic zapisany.");
          return;
        }
        const updated = await api(`/admin/articles/${article.id}`, { method: "PATCH", body });
        setArticle(updated);
        setForm(pickForm(updated));
        setMessage(
          status === "published" ? "Opublikowano." : status === "draft" ? "Cofnięto publikację — artykuł jest szkicem." : "Zapisano."
        );
      } catch (err) {
        setError(err.message);
      } finally {
        setSaving(false);
      }
    },
    [form, isNew, article, navigate]
  );

  // Ctrl+S w edytorze treści
  const saveRef = useRef(save);
  saveRef.current = save;
  const handleShortcutSave = useCallback(() => {
    if (!saving) saveRef.current();
  }, [saving]);

  const remove = async () => {
    if (!window.confirm(`Usunąć artykuł „${article.title}”? Tej operacji nie można cofnąć.`)) return;
    try {
      await api(`/admin/articles/${article.id}`, { method: "DELETE" });
      navigate("/admin/artykuly", { replace: true });
    } catch (err) {
      setError(err.message);
    }
  };

  if (loadError) {
    return (
      <div className="mzi-auth-page mzi-auth-page-wide">
        <div className="mzi-auth-card">
          <p className="mzi-auth-error">{loadError}</p>
          <p className="mzi-auth-muted"><Link to="/admin/artykuly" className="mzi-auth-link">Wróć do listy artykułów</Link></p>
        </div>
      </div>
    );
  }
  if (!isNew && !article) return <p className="mzi-auth-loading">Ładowanie...</p>;

  const published = article?.status === "published";
  const canSave = form.title.trim() && !saving;

  return (
    <div className="mzi-auth-page mzi-auth-page-wide">
      <div className="mzi-auth-card mzi-admin-card mzi-admin-card-xl">
        <h1 className="mzi-auth-title">Panel admina</h1>
        <AdminNav />

        <p className="mzi-admin-breadcrumb">
          <Link to="/admin/artykuly" className="mzi-auth-link">← Lista artykułów</Link>
          {article && (
            <>
              {" · "}
              <Link to={`/artykuly/${article.slug}`} className="mzi-auth-link">
                {published ? "Zobacz na stronie" : "Podgląd szkicu"}
              </Link>
            </>
          )}
        </p>

        <form className="mzi-admin-form mzi-article-form" onSubmit={(e) => { e.preventDefault(); save(); }} noValidate>
          <div className="mzi-article-form-head">
            <h2 className="mzi-auth-subtitle">{isNew ? "Nowy artykuł" : "Edycja artykułu"}</h2>
            {article && (
              <span className={`mzi-status ${published ? "mzi-status-on" : "mzi-status-off"}`}>
                {published ? `Opublikowany ${formatDate(article.publishedAt)}` : "Szkic"}
              </span>
            )}
          </div>

          <label className="mzi-admin-label" htmlFor="art-title">Tytuł *</label>
          <input id="art-title" className="mzi-admin-input mzi-article-title-input" value={form.title} onChange={setField("title")} />

          <div className="mzi-admin-row">
            <div>
              <label className="mzi-admin-label" htmlFor="art-slug">
                Adres — {isNew ? "zostaw puste, utworzy się z tytułu" : "zmiana zmieni link"}
              </label>
              <div className="mzi-admin-slug-field">
                <span className="mzi-admin-slug">/artykuly/</span>
                <input id="art-slug" className="mzi-admin-input" value={form.slug} onChange={setField("slug")} placeholder="np. wstep-do-sql" />
              </div>
            </div>
            <div>
              <label className="mzi-admin-label" htmlFor="art-cover">Obrazek na górze (adres, opcjonalnie)</label>
              <input id="art-cover" className="mzi-admin-input" value={form.coverUrl} onChange={setField("coverUrl")} placeholder="https://..." />
            </div>
          </div>

          <label className="mzi-admin-label" htmlFor="art-excerpt">
            Zajawka na stronie głównej (opcjonalnie — puste = początek treści)
          </label>
          <textarea id="art-excerpt" className="mzi-admin-input" rows={2} value={form.excerpt} onChange={setField("excerpt")} />

          <label className="mzi-admin-label" htmlFor="art-content">Treść (Markdown)</label>
          <MarkdownEditor
            id="art-content"
            value={form.content}
            onChange={(content) => {
              setForm((f) => ({ ...f, content }));
              setMessage("");
            }}
            onSave={handleShortcutSave}
          />

          {error && <p className="mzi-auth-error" role="alert">{error}</p>}
          {message && <p className="mzi-auth-success" role="status">{message}</p>}

          <div className="mzi-form-actions mzi-article-actions">
            <button type="submit" className="mzi-btn mzi-btn-primary" disabled={!canSave}>
              {saving ? "Zapisywanie..." : published ? "Zapisz zmiany" : "Zapisz szkic"}
            </button>
            {!published && (
              <button type="button" className="mzi-btn mzi-btn-publish" disabled={!canSave || !form.content.trim()} onClick={() => save("published")}>
                Opublikuj
              </button>
            )}
            {published && (
              <button type="button" className="mzi-btn" disabled={!canSave} onClick={() => save("draft")}>
                Cofnij publikację
              </button>
            )}
            {dirty && <span className="mzi-unsaved">● Niezapisane zmiany</span>}
            {article && (
              <button type="button" className="mzi-btn mzi-btn-danger mzi-btn-right" onClick={remove} disabled={saving}>
                Usuń artykuł
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}

export default AdminArticleEdit;
