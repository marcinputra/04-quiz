import { useCallback, useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import "./Slider.css";

const INTERVAL = 7000; // ms między slajdami

// Obrazy w client/public/ (ok. 1940 × 810 px). Lewa część obrazów to pusty granat — tam jest tekst.
// bg — kolor lewej krawędzi obrazu, żeby tło na szerokich ekranach przechodziło w obraz bez szwu.
const SLIDES = [
  {
    image: "/slider01.webp",
    bg: "#0c1422",
    label: "Nowy kurs",
    title: "Python",
    accent: "od podstaw do matury",
    text: "20 lekcji: od pierwszego programu, przez pliki i algorytmy, do zadań maturalnych krok po kroku.",
    link: "/kursy/python-od-podstaw",
    linkText: "Zobacz kurs",
  },
  {
    image: "/slider02.webp",
    bg: "#111c31",
    label: "Quizy",
    title: "Sprawdź swoją wiedzę",
    accent: "w quizach",
    text: "Pytania z Pythona, algorytmów, baz danych i SQL — z wynikiem i omówieniem odpowiedzi.",
    link: "/quizy",
    linkText: "Rozwiąż quiz",
  },
  {
    image: "/slider03.webp",
    bg: "#001138",
    label: "Kurs",
    title: "JavaScript",
    accent: "od podstaw do aplikacji",
    text: "Zmienne, DOM, zdarzenia, fetch i klasy — zbuduj własną aplikację w przeglądarce.",
    link: "/kursy/javascript-od-podstaw",
    linkText: "Zobacz kurs",
  },
];

function Slider({ slides = SLIDES }) {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const touchX = useRef(null);
  const count = slides.length;

  const go = useCallback((i) => setIndex((i + count) % count), [count]);
  const next = useCallback(() => go(index + 1), [go, index]);
  const prev = useCallback(() => go(index - 1), [go, index]);

  // automatyczne przewijanie — wyłączone przy pauzie i przy „ogranicz animacje” w systemie
  useEffect(() => {
    const reduce = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
    if (paused || reduce || count < 2) return;
    const id = setTimeout(next, INTERVAL);
    return () => clearTimeout(id);
  }, [index, paused, next, count]);

  if (count === 0) return null;

  const onKeyDown = (e) => {
    if (e.key === "ArrowRight") next();
    if (e.key === "ArrowLeft") prev();
  };
  const onTouchStart = (e) => {
    touchX.current = e.touches[0].clientX;
  };
  const onTouchEnd = (e) => {
    if (touchX.current === null) return;
    const dx = e.changedTouches[0].clientX - touchX.current;
    if (Math.abs(dx) > 50) (dx < 0 ? next : prev)();
    touchX.current = null;
  };

  return (
    <section
      className="mzi-slider"
      aria-roledescription="karuzela"
      aria-label="Polecane"
      style={{ backgroundColor: slides[index].bg }}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocus={() => setPaused(true)}
      onBlur={() => setPaused(false)}
      onKeyDown={onKeyDown}
      onTouchStart={onTouchStart}
      onTouchEnd={onTouchEnd}
    >
      {slides.map((s, i) => {
        const active = i === index;
        return (
          <div
            key={s.image}
            className={`mzi-slide${active ? " is-active" : ""}`}
            role="group"
            aria-roledescription="slajd"
            aria-label={`${i + 1} z ${count}`}
            aria-hidden={!active}
            style={{ backgroundColor: s.bg, "--mzi-slide-bg": s.bg }}
          >
            <img
              className="mzi-slide-image"
              src={s.image}
              alt=""
              loading={i === 0 ? "eager" : "lazy"}
              fetchPriority={i === 0 ? "high" : "auto"}
              draggable="false"
            />
            <div className="mzi-slide-inner">
              <div className="mzi-slide-content">
                {s.label && <span className="mzi-slide-label">{s.label}</span>}
                <h2 className="mzi-slide-title">
                  {s.title} {s.accent && <span className="mzi-yellow">{s.accent}</span>}
                </h2>
                {s.text && <p className="mzi-slide-text">{s.text}</p>}
                {s.link && (
                  <Link to={s.link} className="mzi-slide-btn" tabIndex={active ? 0 : -1}>
                    {s.linkText ?? "Zobacz"} →
                  </Link>
                )}
              </div>
            </div>
          </div>
        );
      })}

      {count > 1 && (
        <>
          <button type="button" className="mzi-slider-arrow mzi-slider-prev" onClick={prev} aria-label="Poprzedni slajd">
            ‹
          </button>
          <button type="button" className="mzi-slider-arrow mzi-slider-next" onClick={next} aria-label="Następny slajd">
            ›
          </button>
          <div className="mzi-slider-dots">
            {slides.map((s, i) => (
              <button
                key={s.image}
                type="button"
                className={`mzi-slider-dot${i === index ? " is-active" : ""}`}
                onClick={() => go(i)}
                aria-label={`Slajd ${i + 1}: ${s.title}`}
                aria-current={i === index}
              />
            ))}
          </div>
        </>
      )}
    </section>
  );
}

export default Slider;
