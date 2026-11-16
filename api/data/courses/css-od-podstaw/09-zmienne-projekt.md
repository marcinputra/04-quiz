## Zmienne CSS (custom properties)

Wartości używane w wielu miejscach (kolory, odstępy, zaokrąglenia) zapisz **raz** jako zmienne:

```css
:root {
  --kolor-glowny: hsl(45 96% 53%);
  --kolor-tla: hsl(200 6% 16%);
  --kolor-tekstu: hsl(220 14% 91%);
  --odstep: 1rem;
  --promien: 12px;
  --cien: 0 6px 20px rgb(0 0 0 / 25%);
}

.przycisk {
  background: var(--kolor-glowny);
  padding: calc(var(--odstep) / 2) var(--odstep);
  border-radius: var(--promien);
}

.karta {
  background: var(--kolor-tla);
  color: var(--kolor-tekstu);
  box-shadow: var(--cien);
  padding: var(--odstep);
}
```

- nazwa zaczyna się od **dwóch myślników**,
- `:root` to element `html` — zmienne z niego są dostępne wszędzie,
- `var(--nazwa, wartość-zapasowa)` — wartość, gdy zmiennej nie ma.

### Zmienne są „żywe” i dziedziczone

W przeciwieństwie do zmiennych w preprocesorach (Sass) zmienne CSS można **nadpisać w części strony** albo zmienić z JavaScriptu:

```css
.sekcja-wyrozniona {
  --kolor-glowny: hsl(160 60% 45%);   /* przyciski w tej sekcji będą zielone */
}
```

```js
document.documentElement.style.setProperty("--kolor-glowny", "tomato");
```

## Tryb ciemny

### Według ustawień systemu

```css
:root {
  --tlo: #ffffff;
  --tekst: #1f2937;
  --karta: #f3f4f6;
  color-scheme: light dark;   /* przeglądarka dopasuje paski przewijania i pola formularzy */
}

@media (prefers-color-scheme: dark) {
  :root {
    --tlo: #1f2324;
    --tekst: #e5e7eb;
    --karta: #2a2f30;
  }
}

body {
  background: var(--tlo);
  color: var(--tekst);
}
```

Dzięki zmiennym tryb ciemny to tylko **podmiana kilku wartości** — reszta stylów zostaje bez zmian.

### Przełącznik na stronie

```html
<button type="button" id="motyw" aria-pressed="false">Tryb ciemny</button>
```

```css
:root[data-motyw="ciemny"] {
  --tlo: #1f2324;
  --tekst: #e5e7eb;
  --karta: #2a2f30;
}
```

```js
const przycisk = document.getElementById("motyw");
const ustaw = (ciemny) => {
  document.documentElement.dataset.motyw = ciemny ? "ciemny" : "jasny";
  przycisk.setAttribute("aria-pressed", ciemny);
  localStorage.setItem("motyw", ciemny ? "ciemny" : "jasny");
};
ustaw(localStorage.getItem("motyw") === "ciemny");
przycisk.addEventListener("click", () => ustaw(document.documentElement.dataset.motyw !== "ciemny"));
```

## Organizacja kodu

### Kolejność w arkuszu

1. **reset / ustawienia bazowe** (`box-sizing`, `img`, `body`),
2. **zmienne** (`:root`),
3. **typografia i elementy** (`h1`, `a`, `p`),
4. **układ** (`.kontener`, `.strona`, siatki),
5. **komponenty** (`.karta`, `.przycisk`, `.menu`),
6. **narzędzia / wyjątki** (`.ukryty`, `.tekst-srodek`),
7. **media queries** — przy komponentach albo na końcu.

### Nazewnictwo BEM

**BEM** (*Block, Element, Modifier*) pomaga uniknąć konfliktów nazw:

```html
<article class="karta karta--wyrozniona">
  <h3 class="karta__tytul">…</h3>
  <p class="karta__opis">…</p>
  <a class="karta__przycisk" href="…">Czytaj</a>
</article>
```

- `karta` — blok (samodzielny komponent),
- `karta__tytul` — element bloku,
- `karta--wyrozniona` — wariant bloku.

### Zagnieżdżanie (natywne w CSS)

Nowoczesne przeglądarki pozwalają zagnieżdżać reguły bez preprocesorów:

```css
.karta {
  padding: var(--odstep);

  & h3 { margin-top: 0; }
  &:hover { transform: translateY(-2px); }
  &.karta--wyrozniona { border-color: var(--kolor-glowny); }

  @media (min-width: 768px) {
    padding: calc(var(--odstep) * 2);
  }
}
```

## Projekt końcowy: ostylowanie strony-wizytówki

Weź stronę-wizytówkę z projektu końcowego kursu [HTML5 — część 1](/kursy/html5-od-podstaw) (trzy podstrony: O mnie, Galeria, Kontakt) i nadaj jej kompletny wygląd, wykorzystując wszystkie lekcje:

1. **Lekcja 1–2:** jeden plik `style.css`, paleta kolorów w HSL, czcionka z `@font-face` lub Google Fonts, rozmiary w `rem`, `h1` z `clamp()`.
2. **Lekcja 3:** `box-sizing: border-box`, klasa `.kontener`, karty z paddingiem, ramką i cieniem.
3. **Lekcja 4:** wyraźne `:hover` i `:focus-visible`, paski w tabeli, oznaczenie linków zewnętrznych, style błędów formularza.
4. **Lekcja 5:** nagłówek i menu we Flexboxie, formularz w kolumnie, stopka zawsze na dole.
5. **Lekcja 6:** układ strony w Gridzie z nazwanymi obszarami, galeria z `auto-fit` + `minmax`.
6. **Lekcja 7:** mobile-first, menu przechodzące z kolumny do wiersza, arkusz do druku.
7. **Lekcja 8:** przyklejony nagłówek, przycisk „do góry”, animacje kart z obsługą `prefers-reduced-motion`.
8. **Lekcja 9:** wszystkie kolory i odstępy w zmiennych, tryb ciemny według systemu **i** przełącznik zapamiętywany w `localStorage`, nazwy klas w BEM.

**Kryteria zaliczenia:**

- poprawny wygląd przy 320, 768 i 1440 px, bez przewijania w poziomie,
- cała strona obsługiwana klawiaturą z widocznym fokusem,
- kontrast tekstu co najmniej 4,5 : 1 w obu motywach,
- zero błędów w walidatorze CSS W3C (jigsaw.w3.org/css-validator),
- Lighthouse: *Accessibility* 100, *Performance* ≥ 90.

Gratulacje — umiesz już tworzyć nowoczesne, responsywne strony! Sprawdź wiedzę w **quizie** kursu, a jeśli chcesz pogłębić HTML, przejdź do [HTML5 — część 2: poziom zaawansowany](/kursy/html5-zaawansowany). Następny krok to [JavaScript od podstaw do aplikacji](/kursy/javascript-od-podstaw) — dzięki niemu Twoje strony zaczną reagować na użytkownika.
