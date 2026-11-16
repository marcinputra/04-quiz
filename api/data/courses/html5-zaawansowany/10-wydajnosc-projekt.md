W ostatniej części połączysz wszystko w **profesjonalną stronę**: szybką, dobrze opisaną dla wyszukiwarek i dostępną. Na końcu czeka projekt końcowy całego kursu.

## Ładowanie skryptów: `defer`, `async`, `type="module"`

Zwykły `<script src="…">` w `<head>` **zatrzymuje budowanie strony**, dopóki skrypt się nie pobierze i nie wykona.

```html
<!-- blokuje — unikaj w <head> -->
<script src="app.js"></script>

<!-- pobiera równolegle, wykonuje PO zbudowaniu HTML, w kolejności -->
<script src="app.js" defer></script>

<!-- pobiera równolegle, wykonuje od razu po pobraniu, kolejność niegwarantowana -->
<script src="statystyki.js" async></script>

<!-- moduł ES — zachowuje się jak defer, pozwala używać import/export -->
<script type="module" src="main.js"></script>
```

| | blokuje HTML | kiedy wykonanie | kolejność |
|---|---|---|---|
| zwykły | tak | od razu | tak |
| `defer` | nie | po zbudowaniu HTML | tak |
| `async` | nie | zaraz po pobraniu | nie |
| `type="module"` | nie | jak `defer` | tak |

> Zasada: kod strony — `defer` lub `type="module"`; niezależne skrypty (np. statystyki) — `async`.

## Core Web Vitals — jak Google mierzy szybkość

| Wskaźnik | Co mierzy | Dobry wynik | Co pomaga (z tego kursu) |
|---|---|---|---|
| **LCP** (*Largest Contentful Paint*) | kiedy pojawia się największy element (np. baner) | ≤ 2,5 s | `fetchpriority="high"`, `preload`, AVIF/WebP, **bez** `loading="lazy"` na banerze |
| **CLS** (*Cumulative Layout Shift*) | „skakanie” strony podczas ładowania | ≤ 0,1 | `width` i `height` na obrazach i wideo, rezerwowanie miejsca na reklamy i osadzenia |
| **INP** (*Interaction to Next Paint*) | jak szybko strona reaguje na kliknięcie | ≤ 200 ms | `defer`, mniej JavaScriptu, natywne elementy (`dialog`, `details`) zamiast bibliotek |

Wyniki sprawdzisz w **Lighthouse** (F12) i w **PageSpeed Insights**.

## Dane strukturalne: JSON-LD

Dane strukturalne opisują treść w języku zrozumiałym dla wyszukiwarek (słownik **schema.org**). Dzięki nim strona może dostać w Google **rozszerzony wynik** — np. gwiazdki ocen, datę wydarzenia, informacje o kursie.

```html
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "Course",
  "name": "HTML5 — część 2: poziom zaawansowany",
  "description": "Dostępność, obrazy responsywne, formularze, SVG, Canvas i Web Components.",
  "inLanguage": "pl",
  "provider": {
    "@type": "Organization",
    "name": "maturazinformatyki.it",
    "url": "https://maturazinformatyki.it"
  }
}
</script>
```

Inne przydatne typy: `Article` (artykuł z datą i autorem), `FAQPage` (pytania i odpowiedzi), `BreadcrumbList` (okruszki), `Event`, `Organization`. Poprawność sprawdzisz w **Rich Results Test** Google.

## Okruszki (breadcrumbs)

```html
<nav aria-label="Okruszki">
  <ol>
    <li><a href="/">Strona główna</a></li>
    <li><a href="/kursy">Kursy</a></li>
    <li><a href="/kursy/html5-zaawansowany" aria-current="page">HTML5 — część 2</a></li>
  </ol>
</nav>
```

## Lista kontrolna profesjonalnej strony HTML5

**Struktura i SEO**
- [ ] `charset`, `viewport`, `lang`, unikalne `title` i `description`, `canonical`
- [ ] Open Graph i ikony, `theme-color`
- [ ] znaczniki semantyczne, jeden `h1`, logiczne nagłówki, okruszki
- [ ] dane strukturalne JSON-LD sprawdzone w Rich Results Test

**Dostępność**
- [ ] link „Przejdź do treści”, obsługa całej strony klawiaturą, widoczny fokus
- [ ] `alt` na obrazach, `label` przy polach, etykiety przycisków-ikon
- [ ] komunikaty w `aria-live`, kontrast min. 4,5:1
- [ ] Lighthouse *Accessibility* = 100, test czytnikiem ekranu

**Wydajność**
- [ ] obrazy responsywne (`srcset`/`sizes`, AVIF/WebP), `width`/`height`, `lazy` poniżej pierwszego ekranu
- [ ] skrypty z `defer` / `type="module"`
- [ ] Lighthouse *Performance* ≥ 90, LCP ≤ 2,5 s, CLS ≤ 0,1

**Jakość kodu**
- [ ] zero błędów w walidatorze W3C
- [ ] dane z zewnątrz wstawiane przez `textContent` (nie `innerHTML`)

## Projekt końcowy: strona wydarzenia „Dzień Informatyki”

Zbuduj jednostronicową (*one-page*) witrynę szkolnego wydarzenia, która wykorzystuje wszystkie części kursu:

1. **Head (cz. 1):** kompletne SEO, Open Graph z obrazem, ikony.
2. **Dostępność (cz. 2):** link do treści, landmarki, poprawna nawigacja klawiaturą.
3. **Baner (cz. 3):** responsywne zdjęcie w `<picture>` z AVIF/WebP i `fetchpriority="high"`.
4. **Zapisy (cz. 4):** formularz z `autocomplete`, `datalist` (szkoła), własną walidacją i `output` z ceną.
5. **FAQ i regulamin (cz. 5):** akordeon `<details name>` i regulamin w `<dialog>`.
6. **Mapa dojazdu i logo (cz. 6):** logo w SVG, wykres liczby uczestników z lat ubiegłych na Canvas.
7. **Zapowiedź (cz. 7):** film z napisami WebVTT i własnym sterowaniem.
8. **Prelegenci (cz. 8):** karty `<karta-prelegenta>` jako Web Component z Shadow DOM, generowane z `<template>`.
9. **Mój plan (cz. 9):** uczestnik zaznacza wykłady, które chce zobaczyć — wybór zapisany w `localStorage`, kolejność zmieniana przeciąganiem (z alternatywą klawiaturową).
10. **Jakość (cz. 10):** dane strukturalne `Event`, skrypty z `defer`, spełniona cała lista kontrolna powyżej.

**Kryteria zaliczenia:** Lighthouse ≥ 90 we wszystkich kategoriach (Accessibility = 100), zero błędów walidatora W3C, pełna obsługa klawiaturą.

Gratulacje — ukończyłeś kurs HTML5 na poziomie zaawansowanym! Sprawdź swoją wiedzę w **quizie** kursu. Kolejne kroki: [CSS od podstaw do layoutu](/kursy/css-od-podstaw) (Flexbox, Grid, responsywność, animacje) i [JavaScript od podstaw do aplikacji](/kursy/javascript-od-podstaw).
