## Czym jest semantyczny HTML?

**Semantyka** to znaczenie. Znaczniki semantyczne mówią, **czym jest** dana część strony, a nie tylko jak wygląda. Porównaj:

```html
<!-- bez semantyki: same <div>, nic nie wiadomo -->
<div class="gora">…</div>
<div class="menu">…</div>
<div class="tresc">…</div>

<!-- semantycznie: od razu wiadomo, co jest czym -->
<header>…</header>
<nav>…</nav>
<main>…</main>
```

Dla przeglądarki oba zapisy wyglądają tak samo, ale znaczniki semantyczne:

- pomagają **czytnikom ekranu** (użytkownik może przeskoczyć od razu do menu albo treści),
- pomagają **wyszukiwarkom** zrozumieć stronę (lepsze SEO),
- sprawiają, że kod jest **czytelniejszy** dla innych programistów i dla Ciebie za pół roku.

## Najważniejsze znaczniki semantyczne HTML5

| Znacznik | Znaczenie |
|---|---|
| `<header>` | nagłówek strony lub sekcji (logo, tytuł) |
| `<nav>` | główne menu nawigacyjne |
| `<main>` | **główna treść** strony — tylko jeden na stronie |
| `<article>` | samodzielna treść, którą można by opublikować osobno (wpis, artykuł, komentarz) |
| `<section>` | tematyczna część strony, zwykle z własnym nagłówkiem |
| `<aside>` | treść poboczna (ramka „zobacz też”, reklama, pasek boczny) |
| `<footer>` | stopka strony lub sekcji (autor, prawa, kontakt) |
| `<time>` | data lub godzina zrozumiała dla maszyn: `<time datetime="2026-05-08">8 maja</time>` |
| `<address>` | dane kontaktowe |

`<div>` i `<span>` to znaczniki **bez znaczenia** — używaj ich tylko wtedy, gdy żaden znacznik semantyczny nie pasuje (np. do grupowania elementów na potrzeby CSS).

## Przykładowy układ strony

```html
<!DOCTYPE html>
<html lang="pl">
  <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta name="description" content="Strona-wizytówka Jana Kowalskiego — maturzysty, który uczy się programowania.">
    <title>Jan Kowalski — wizytówka</title>
  </head>
  <body>
    <header>
      <h1>Jan Kowalski</h1>
      <nav>
        <ul>
          <li><a href="index.html">O mnie</a></li>
          <li><a href="galeria.html">Galeria</a></li>
          <li><a href="kontakt.html">Kontakt</a></li>
        </ul>
      </nav>
    </header>

    <main>
      <article>
        <h2>Jak przygotowuję się do matury z informatyki</h2>
        <p>Opublikowano <time datetime="2026-05-08">8 maja 2026</time></p>
        <section>
          <h3>Programowanie</h3>
          <p>Codziennie rozwiązuję jedno zadanie w Pythonie…</p>
        </section>
        <section>
          <h3>Bazy danych</h3>
          <p>Ćwiczę zapytania SQL…</p>
        </section>
      </article>

      <aside>
        <h2>Polecane</h2>
        <p><a href="https://maturazinformatyki.it">Quizy z informatyki</a></p>
      </aside>
    </main>

    <footer>
      <address>Kontakt: <a href="mailto:jan@example.com">jan@example.com</a></address>
      <p>&copy; 2026 Jan Kowalski</p>
    </footer>
  </body>
</html>
```

## Znaki specjalne (encje)

Niektórych znaków nie można wpisać wprost, bo HTML używa ich w składni. Zapisuje się je jako **encje**:

| Encja | Znak |
|---|---|
| `&lt;` | `<` |
| `&gt;` | `>` |
| `&amp;` | `&` |
| `&quot;` | `"` |
| `&nbsp;` | twarda spacja (nie łamie linii, np. `5&nbsp;zł`) |
| `&copy;` | © |

## Dobre praktyki — lista kontrolna

- [ ] `<!DOCTYPE html>`, `lang="pl"`, `<meta charset="UTF-8">` i `viewport` na każdej stronie
- [ ] unikalny `<title>` i `<meta name="description">` na każdej podstronie
- [ ] jeden `<h1>`, nagłówki bez przeskakiwania poziomów
- [ ] każdy obraz ma sensowny `alt`
- [ ] każde pole formularza ma `<label>`
- [ ] znaczniki semantyczne zamiast samych `<div>`
- [ ] małe litery w nazwach znaczników i plików, bez polskich znaków i spacji w nazwach plików (`o-mnie.html`, nie `O mnie.html`)
- [ ] kod sprawdzony **walidatorem** W3C: [validator.w3.org](https://validator.w3.org/)

## Projekt końcowy: strona-wizytówka

Połącz wszystko, czego się nauczyłeś, w jedną witrynę z trzech podstron:

1. **`index.html` — O mnie:** nagłówek z menu (`<header>` + `<nav>`), artykuł o Tobie z dwiema sekcjami, lista zainteresowań, tabela z planem dnia, stopka z danymi kontaktowymi.
2. **`galeria.html`:** co najmniej trzy zdjęcia w `<figure>` z podpisami i opisem `alt`, jeden plik audio lub wideo.
3. **`kontakt.html`:** formularz kontaktowy z rozdziału 4 i mapa w `<iframe>`.

Wymagania:

- ten sam nagłówek z menu i ta sama stopka na każdej podstronie,
- poprawne linki między podstronami,
- wszystkie punkty z listy kontrolnej powyżej,
- **zero błędów** w walidatorze W3C.

Gratulacje — po wykonaniu projektu znasz podstawy HTML5! Sprawdź swoją wiedzę w **quizie** kursu, a potem przejdź do [części 2: poziom zaawansowany](/kursy/html5-zaawansowany) — dostępność, SEO, obrazy responsywne, SVG, Canvas, Web Components i wydajność. Równolegle warto przejść kurs [CSS od podstaw do layoutu](/kursy/css-od-podstaw) — w jego projekcie końcowym ostylujesz właśnie tę stronę-wizytówkę.
