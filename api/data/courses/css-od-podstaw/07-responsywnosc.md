Ponad połowa ruchu w internecie pochodzi z telefonów. **Responsywna** strona dopasowuje układ do szerokości ekranu — od 320 px do monitora 4K.

## Warunek konieczny: `viewport`

Bez tego znacznika w `<head>` telefon wyświetli stronę jak na komputerze, tylko pomniejszoną:

```html
<meta name="viewport" content="width=device-width, initial-scale=1">
```

## Media queries

Reguły CSS stosowane tylko, gdy spełniony jest warunek:

```css
/* style dla wszystkich */
.kolumny { display: grid; gap: 1rem; }

/* od 768 px szerokości — dwie kolumny */
@media (min-width: 768px) {
  .kolumny { grid-template-columns: 1fr 1fr; }
}

/* od 1100 px — trzy kolumny */
@media (min-width: 1100px) {
  .kolumny { grid-template-columns: repeat(3, 1fr); }
}
```

Nowsza, czytelniejsza składnia zakresów:

```css
@media (width >= 768px) { … }
@media (480px <= width < 768px) { … }
```

## Mobile-first

Zaczynaj od wersji na **telefon** (najprostszej, jedna kolumna), a większe ekrany obsługuj przez `min-width`:

```css
/* telefon — domyślnie */
.menu { display: flex; flex-direction: column; }

/* tablet i większe */
@media (min-width: 768px) {
  .menu { flex-direction: row; }
}
```

Dlaczego tak?

- telefon pobiera mniej nadpisywanych reguł,
- prościej dodawać złożoność, niż ją potem usuwać,
- wymusza myślenie o tym, co na stronie najważniejsze.

> **Punkty przełamania** (*breakpoints*) dobieraj do **treści**, a nie do konkretnych modeli telefonów: zmniejszaj okno i dodaj media query tam, gdzie układ zaczyna wyglądać źle.

## Płynne wartości zamiast wielu media queries

```css
h1 {
  font-size: clamp(1.75rem, 1rem + 3vw, 3rem);   /* płynnie od 28 do 48 px */
}
.sekcja {
  padding-block: clamp(2rem, 6vw, 5rem);
}
.kontener {
  width: min(1100px, 100% - 2rem);
  margin-inline: auto;
}
```

W połączeniu z Gridem (`auto-fit` + `minmax`) i Flexboxem (`flex-wrap`) wiele układów nie potrzebuje media queries wcale.

## Responsywne obrazy i multimedia

```css
img,
video {
  max-width: 100%;   /* nigdy szersze niż kontener */
  height: auto;      /* zachowaj proporcje */
}

.okladka {
  width: 100%;
  aspect-ratio: 16 / 9;   /* stałe proporcje */
  object-fit: cover;      /* przytnij, zamiast zniekształcać */
}
```

## Container queries — reagowanie na rozmiar kontenera

Media queries patrzą na **okno**. Ale ta sama karta może być szeroka w treści i wąska w pasku bocznym. **Container queries** reagują na rozmiar **rodzica**:

```css
.lista-kart {
  container-type: inline-size;   /* ten element jest „kontenerem” */
}

.karta { display: grid; gap: 0.5rem; }

@container (min-width: 450px) {
  .karta {
    grid-template-columns: 150px 1fr;   /* obraz obok tekstu, gdy karta jest szeroka */
  }
}
```

## Inne przydatne zapytania o preferencje

```css
@media (prefers-color-scheme: dark) { … }     /* system w trybie ciemnym — lekcja 9 */
@media (prefers-reduced-motion: reduce) { … } /* użytkownik nie chce animacji — lekcja 8 */
@media (hover: hover) { … }                    /* urządzenie z myszą (nie dotykowe) */
@media print { … }                             /* wydruk strony */
```

```css
@media print {
  nav, footer, .przycisk { display: none; }
  body { color: #000; background: #fff; }
  a::after { content: " (" attr(href) ")"; }   /* pokaż adresy linków na wydruku */
}
```

## Testowanie

**F12 → ikona telefonu/tabletu** (*Device Toolbar*, Ctrl+Shift+M) — podgląd na różnych szerokościach i modelach urządzeń. Sprawdzaj zwłaszcza **320 px** (najmniejsze telefony) i czy strona **nigdzie nie przewija się w bok**.

## Zadanie

1. Przepisz style strony-wizytówki w podejściu **mobile-first**: domyślnie jedna kolumna, media queries tylko z `min-width`.
2. Menu: na telefonie w kolumnie, od 768 px w wierszu.
3. Nagłówki i odstępy sekcji przez `clamp()`.
4. Karty w galerii jako **container query**: przy szerokości karty ≥ 400 px obraz obok opisu.
5. Arkusz do druku: bez menu i stopki, czarny tekst na białym tle.
6. Sprawdź stronę przy 320, 768 i 1440 px — zero przewijania w poziomie.
