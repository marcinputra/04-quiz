import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { api } from "../api";
import { useAuth } from "../auth/AuthContext";
import Markdown from "../component/Markdown";
import Footer from "../component/Footer";
import { formatDate } from "./Home";
import "./Articles.css";

// Pojedynczy artykuł. Admin widzi też szkice (podgląd przed publikacją).
function ArticlePage() {
  const { slug } = useParams();
  const { isAdmin } = useAuth();
  const [article, setArticle] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;
    setArticle(null);
    setError("");
    api(`/articles/${encodeURIComponent(slug)}`)
      .then((data) => {
        if (cancelled) return;
        setArticle(data);
        document.title = `${data.title} — maturazinformatyki.it`;
      })
      .catch((err) => !cancelled && setError(err.message));
    window.scrollTo(0, 0);
    return () => {
      cancelled = true;
    };
  }, [slug, isAdmin]);

  if (error) {
    return (
      <div className="mzi-home">
        <main className="mzi-container mzi-article-page">
          <p className="mzi-articles-error">{error}</p>
          <Link to="/" className="mzi-article-back">← Wszystkie artykuły</Link>
        </main>
      </div>
    );
  }
  if (!article) return <p className="mzi-auth-loading">Ładowanie...</p>;

  return (
    <div className="mzi-home">
      <main className="mzi-container mzi-article-page">
        <Link to="/" className="mzi-article-back">← Wszystkie artykuły</Link>

        {article.status !== "published" && (
          <p className="mzi-article-draft">
            Szkic — ten artykuł widzisz tylko Ty jako administrator.
          </p>
        )}
        {isAdmin && (
          <p className="mzi-article-admin">
            <Link to={`/admin/artykuly/${article.id}`}>Edytuj artykuł</Link>
          </p>
        )}

        <article>
          <header className="mzi-article-header">
            <h1 className="mzi-article-page-title">{article.title}</h1>
            <p className="mzi-article-meta">
              {article.publishedAt && <time dateTime={article.publishedAt}>{formatDate(article.publishedAt)}</time>}
              {article.author && <span> · {article.author}</span>}
            </p>
          </header>

          {article.coverUrl && <img className="mzi-article-page-cover" src={article.coverUrl} alt="" />}

          <Markdown>{article.content}</Markdown>
        </article>

        <aside className="mzi-article-cta">
          <p>Sprawdź, ile zapamiętałeś — rozwiąż quiz.</p>
          <Link to="/quizy" className="mzi-btn-hero mzi-btn-hero-primary">Przejdź do quizów</Link>
        </aside>
      </main>
      <Footer nameQuiz="Artykuły" />
    </div>
  );
}

export default ArticlePage;
