## Kolory

```css
.przyklad {
  color: tomato;                    /* nazwa koloru */
  color: #1e3a8a;                   /* HEX: czerwony, zielony, niebieski (00–ff) */
  color: #1e3a8a80;                 /* HEX z przezroczystością (80 ≈ 50%) */
  color: rgb(30 58 138);            /* RGB: 0–255 */
  color: rgb(30 58 138 / 50%);      /* RGB z przezroczystością */
  color: hsl(224 64% 33%);          /* HSL: odcień 0–360°, nasycenie, jasność */
}
```

**HSL** jest najwygodniejszy do tworzenia palety: zmieniając tylko jasność, dostajesz jaśniejsze i ciemniejsze odcienie tego samego koloru.

```css
.przycisk       { background: hsl(45 96% 53%); }   /* żółty */
.przycisk:hover { background: hsl(45 96% 63%); }   /* ten sam, jaśniejszy */
```

Właściwości związane z kolorem: `color` (tekst), `background-color`, `border-color`, `opacity` (przezroczystość całego elementu).

### Kontrast

Tekst musi być czytelny: współczynnik kontrastu z tłem co najmniej **4,5 : 1** dla zwykłego tekstu (WCAG). Sprawdzisz go w F12 — kliknij kolor w panelu stylów.

## Jednostki

| Jednostka | Względem czego | Kiedy używać |
|---|---|---|
| `px` | piksel ekranu | obramowania, drobne detale |
| `%` | rozmiaru rodzica | szerokości elementów |
| `em` | rozmiaru czcionki **elementu** | odstępy zależne od tekstu (np. padding przycisku) |
| `rem` | rozmiaru czcionki **elementu `html`** (zwykle 16 px) | **czcionki i odstępy** — szanuje ustawienia użytkownika |
| `vw`, `vh` | 1% szerokości / wysokości okna | elementy na cały ekran |
| `dvh` | 1% wysokości widocznej części okna (uwzględnia paski na telefonie) | sekcje „na cały ekran” na telefonie |
| `ch` | szerokość znaku „0” | maksymalna długość wiersza tekstu |

```css
html  { font-size: 100%; }          /* = ustawienie przeglądarki, zwykle 16px */
body  { font-size: 1rem; }          /* 16px */
h1    { font-size: 2.5rem; }        /* 40px */
p     { max-width: 65ch; }          /* wygodna długość wiersza: 60–75 znaków */
.hero { min-height: 100dvh; }
```

> Czcionek **nie ustawiaj w `px`** — osoba, która w przeglądarce powiększyła domyślny rozmiar tekstu, nie zobaczy zmiany. `rem` to uwzględnia.

### Funkcje `calc()`, `min()`, `max()`, `clamp()`

```css
.kolumna  { width: calc(100% - 2rem); }
.kontener { width: min(1000px, 100% - 2rem); }       /* najwyżej 1000px, ale z marginesem na telefonie */
h1        { font-size: clamp(1.75rem, 5vw, 3rem); }   /* rośnie z oknem, ale w granicach 28–48px */
```

## Typografia

```css
body {
  font-family: "Inter", system-ui, -apple-system, "Segoe UI", sans-serif;
  font-size: 1rem;
  font-weight: 400;       /* 100–900; 400 = normal, 700 = bold */
  line-height: 1.6;       /* bez jednostki — mnożnik rozmiaru czcionki */
}

h1 {
  font-weight: 800;
  letter-spacing: -0.02em;
  line-height: 1.15;
}

.podpis {
  font-style: italic;
  text-transform: uppercase;
  text-decoration: underline;
  text-align: center;
}
```

- `font-family` to **lista zapasowa**: przeglądarka użyje pierwszej dostępnej czcionki, a na końcu zawsze podaj ogólną rodzinę (`sans-serif`, `serif`, `monospace`),
- `line-height` dla tekstu ciągłego: **1.5–1.7**, dla dużych nagłówków mniej.

### Własne czcionki

Z Google Fonts (link w `<head>`):

```html
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;700&display=swap" rel="stylesheet">
```

Albo z własnego serwera (lepiej dla prywatności i szybkości):

```css
@font-face {
  font-family: "Inter";
  src: url("fonty/inter.woff2") format("woff2");
  font-weight: 400 700;
  font-display: swap;   /* pokaż tekst od razu czcionką zapasową, podmień po pobraniu */
}
```

## Zadanie

1. Wybierz dla swojej strony paletę: kolor główny, akcent i dwa odcienie szarości — zapisz je w HSL.
2. Ustaw rozmiary czcionek w `rem` (`body`, `h1`, `h2`, `small`) i `h1` z `clamp()`.
3. Ogranicz szerokość akapitów do `65ch`.
4. Podłącz czcionkę z Google Fonts albo przez `@font-face`.
5. Sprawdź kontrast tekstu do tła w F12 i popraw kolory, jeśli wynik jest poniżej 4,5 : 1.
