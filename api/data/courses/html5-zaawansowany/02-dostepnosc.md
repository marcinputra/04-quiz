**Dostępność** (ang. *accessibility*, w skrócie **a11y**) oznacza, że ze strony mogą korzystać wszyscy — także osoby niewidome (czytniki ekranu), słabowidzące (powiększenie), osoby obsługujące komputer wyłącznie klawiaturą czy osoby z zaburzeniami poznawczymi. W Polsce strony instytucji publicznych **muszą** spełniać standard **WCAG 2.1 na poziomie AA**, a od 2025 r. wymagania obejmują też wiele usług komercyjnych (Europejski Akt o Dostępności).

## Zasada nr 1: najpierw natywny HTML

Najlepsza dostępność to **poprawne znaczniki**. Przycisk zrobiony z `<button>` od razu:

- można zaznaczyć klawiszem **Tab**,
- uruchomić **Enterem** i **spacją**,
- czytnik ekranu ogłosi jako „przycisk”.

```html
<!-- źle: wygląda jak przycisk, ale dla klawiatury i czytnika ekranu nim nie jest -->
<div class="btn" onclick="zapisz()">Zapisz</div>

<!-- dobrze -->
<button type="button" onclick="zapisz()">Zapisz</button>
```

> **Pierwsza zasada ARIA:** jeśli możesz użyć natywnego elementu HTML o potrzebnym znaczeniu — użyj go zamiast dodawać ARIA.

## Punkty orientacyjne (landmarks)

Czytniki ekranu pozwalają skakać między regionami strony. Tworzą je znaczniki semantyczne z części 1:

| Znacznik | Rola dla czytnika ekranu |
|---|---|
| `<header>` (na poziomie strony) | `banner` |
| `<nav>` | `navigation` |
| `<main>` | `main` |
| `<aside>` | `complementary` |
| `<footer>` (na poziomie strony) | `contentinfo` |
| `<form>` z nazwą | `form` |

Gdy na stronie jest kilka `<nav>`, rozróżnij je etykietą:

```html
<nav aria-label="Menu główne">…</nav>
<nav aria-label="Okruszki">…</nav>
```

## Link „Przejdź do treści”

Osoba używająca klawiatury nie powinna przechodzić Tabem przez całe menu na każdej podstronie:

```html
<body>
  <a href="#tresc" class="skip-link">Przejdź do treści</a>
  <header>…menu…</header>
  <main id="tresc">…</main>
</body>
```

Link zwykle ukrywa się stylami i pokazuje dopiero, gdy otrzyma fokus.

## ARIA — gdy HTML nie wystarcza

**ARIA** (*Accessible Rich Internet Applications*) to atrybuty, które opisują elementy dla technologii wspomagających. **Nie zmieniają wyglądu ani działania** — tylko to, co ogłosi czytnik ekranu.

### Etykiety

```html
<!-- przycisk z samą ikoną — bez etykiety czytnik powie tylko „przycisk” -->
<button type="button" aria-label="Zamknij okno">✕</button>

<!-- etykieta z istniejącego tekstu na stronie -->
<h2 id="tytul-koszyka">Twój koszyk</h2>
<ul aria-labelledby="tytul-koszyka">…</ul>

<!-- dodatkowy opis pola -->
<input type="password" id="haslo" aria-describedby="haslo-wskazowka">
<p id="haslo-wskazowka">Minimum 8 znaków, w tym cyfra.</p>
```

### Stany

```html
<!-- przycisk rozwijający menu -->
<button type="button" aria-expanded="false" aria-controls="menu">Menu</button>
<ul id="menu" hidden>…</ul>

<!-- przełącznik -->
<button type="button" aria-pressed="true">Tryb ciemny</button>

<!-- bieżąca strona w menu -->
<a href="/kursy" aria-current="page">Kursy</a>
```

Wartości stanów (`aria-expanded`, `aria-pressed`) trzeba **aktualizować w JavaScripcie** przy każdej zmianie.

### Ukrywanie elementów dekoracyjnych

```html
<span aria-hidden="true">🍪</span> Informacja o cookies
```

### Komunikaty na żywo

Zmiany na stronie (np. „Zapisano”, błąd formularza) czytnik ogłosi, jeśli pojawią się w regionie `aria-live`:

```html
<p role="status" aria-live="polite"></p>       <!-- ogłosi po zakończeniu bieżącej wypowiedzi -->
<p role="alert"></p>                             <!-- ogłosi natychmiast — tylko dla pilnych błędów -->
```

## Fokus i kolejność tabulacji

- kolejność **Tab** wynika z kolejności w kodzie — układaj HTML w logicznej kolejności,
- `tabindex="0"` — dodaje element do kolejności tabulacji (rzadko potrzebne, jeśli używasz natywnych elementów),
- `tabindex="-1"` — element można zaznaczyć z JavaScriptu (`element.focus()`), ale nie Tabem,
- **nigdy** nie używaj `tabindex` większego od 0 — psuje naturalną kolejność,
- nie usuwaj obramowania fokusu (`outline: none`) bez zastąpienia go innym wyraźnym wyróżnieniem.

## Język i teksty

```html
<html lang="pl">
…
<p>Popularny skrót to <span lang="en">Hypertext Markup Language</span>.</p>
```

Dzięki `lang` czytnik ekranu przeczyta fragment z właściwą wymową.

## Jak testować dostępność

1. **Tylko klawiatura** — odłóż mysz i przejdź stronę Tabem, Shift+Tab, Enterem i spacją. Czy wszystko działa i czy widać, gdzie jest fokus?
2. **Lighthouse** (F12 → zakładka *Lighthouse* → *Accessibility*) — automatyczny raport.
3. **Czytnik ekranu** — NVDA (Windows, darmowy), VoiceOver (macOS / iOS: Cmd+F5).
4. **Kontrast** — tekst musi mieć współczynnik kontrastu co najmniej **4,5:1** z tłem (WCAG AA).

> Testy automatyczne wychwytują tylko część problemów — test z klawiaturą jest obowiązkowy.

## Zadanie

Przeprowadź audyt dostępności swojej strony-wizytówki:

1. dodaj link „Przejdź do treści”,
2. nadaj etykiety (`aria-label`) wszystkim przyciskom zawierającym tylko ikonę,
3. w menu oznacz bieżącą podstronę atrybutem `aria-current="page"`,
4. dodaj do formularza kontaktowego region `role="status"` na komunikat „Wiadomość wysłana”,
5. przejdź całą stronę samą klawiaturą i wygeneruj raport Lighthouse — popraw wszystko, co da się poprawić, aż wynik *Accessibility* wyniesie 100.
