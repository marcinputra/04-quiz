import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../api";
import { useAuth } from "../auth/AuthContext";
import Footer from "../component/Footer";
import "./Articles.css";
import Slider from "../component/Slider";
import HomeCourses from "../component/HomeCourses";

const PAGE_SIZE = 8;

export const formatDate = (iso) =>
  iso ? new Date(iso).toLocaleDateString("pl-PL", { day: "numeric", month: "long", year: "numeric" }) : "";

// Strona główna: powitanie + najnowsze artykuły (z przyciskiem „Starsze artykuły”)
function Home() {
  const { user } = useAuth();
  const [articles, setArticles] = useState([]);
  const [page, setPage] = useState(0);
  const [pages, setPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadPage = useCallback(async (nextPage) => {
    setLoading(true);
    setError("");
    try {
      const data = await api(`/articles?page=${nextPage}&limit=${PAGE_SIZE}`);
      setArticles((prev) => (nextPage === 1 ? data.items : [...prev, ...data.items]));
      setPage(data.page);
      setPages(data.pages);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    document.title = "maturazinformatyki.it";
    loadPage(1);
  }, [loadPage]);

  return (
    <div className="mzi-home">
      <Slider />
      <HomeCourses />


      <main className="mzi-container mzi-articles">
        <h2 className="mzi-section-title">Artykuły</h2>

        {error && <p className="mzi-articles-error" role="alert">{error}</p>}

        {!loading && !error && articles.length === 0 && (
          <p className="mzi-articles-empty">
            Wkrótce pojawią się tu artykuły. Tymczasem sprawdź swoją wiedzę w{" "}
            <Link to="/quizy">quizach</Link>.
          </p>
        )}

        <div className="mzi-article-grid">
          {articles.map((a) => (
            <article key={a.id} className="mzi-article-card">
              {a.coverUrl && (
                <Link to={`/artykuly/${a.slug}`} className="mzi-article-cover" tabIndex={-1} aria-hidden="true">
                  <img src={a.coverUrl} alt="" loading="lazy" />
                </Link>
              )}
              <div className="mzi-article-body">
                <time className="mzi-article-date" dateTime={a.publishedAt}>{formatDate(a.publishedAt)}</time>
                <h3 className="mzi-article-title">
                  <Link to={`/artykuly/${a.slug}`}>{a.title}</Link>
                </h3>
                {a.excerpt && <p className="mzi-article-excerpt">{a.excerpt}</p>}
                <Link to={`/artykuly/${a.slug}`} className="mzi-article-more" aria-label={`Czytaj dalej: ${a.title}`}>
                  Czytaj dalej →
                </Link>
              </div>
            </article>
          ))}
        </div>

        {loading && <p className="mzi-articles-empty">Ładowanie...</p>}

        {!loading && page < pages && (
          <div className="mzi-articles-more">
            <button type="button" className="mzi-btn-hero" onClick={() => loadPage(page + 1)}>
              Starsze artykuły
            </button>
          </div>
        )}
      </main>

      <Footer nameQuiz="Artykuły" />
    </div>
  );
}

export default Home;
