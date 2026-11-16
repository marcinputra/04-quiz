## Pozycjonowanie: `position`

| Wartość | Zachowanie | Typowe użycie |
|---|---|---|
| `static` | domyślne — element w normalnym przepływie | — |
| `relative` | w przepływie, ale można go przesunąć (`top`, `left`…); staje się **punktem odniesienia** dla dzieci z `absolute` | rodzic dla plakietek |
| `absolute` | **wyjęty** z przepływu, pozycjonowany względem najbliższego przodka z `position` innym niż `static` | plakietki, ikony w rogu |
| `fixed` | przyklejony do **okna** — nie przewija się | przycisk „do góry”, pasek cookies |
| `sticky` | zwykły, dopóki nie dojdzie do krawędzi przy przewijaniu — wtedy się „przykleja” | nagłówek strony, nagłówki tabel |

```css
/* plakietka „NOWOŚĆ” w rogu karty */
.karta {
  position: relative;
}
.karta .plakietka {
  position: absolute;
  top: 0.75rem;
  right: 0.75rem;
}

/* nagłówek przyklejony do góry przy przewijaniu */
.naglowek {
  position: sticky;
  top: 0;
  z-index: 10;
}

/* przycisk w prawym dolnym rogu ekranu */
.do-gory {
  position: fixed;
  right: 1rem;
  bottom: 1rem;
}
```

`inset: 0` to skrót od `top: 0; right: 0; bottom: 0; left: 0` — element pokrywa całego rodzica (np. półprzezroczysta warstwa na zdjęciu).

### `z-index` — co jest na wierzchu

Elementy pozycjonowane z większym `z-index` są wyżej. Działa tylko dla elementów z `position` innym niż `static` (albo dzieci Flexa / Grida).

## Transformacje: `transform`

Zmieniają wygląd elementu **bez wpływu na układ** innych elementów (i są bardzo wydajne):

```css
.a { transform: translate(20px, -10px); }  /* przesunięcie */
.b { transform: scale(1.1); }              /* powiększenie o 10% */
.c { transform: rotate(45deg); }           /* obrót */
.d { transform: translateY(-4px) scale(1.02); }  /* kilka naraz */
```

## Przejścia: `transition`

Płynna zmiana wartości, np. po najechaniu kursorem:

```css
.przycisk {
  background: hsl(45 96% 53%);
  transition: background-color 200ms ease, transform 200ms ease;
}
.przycisk:hover {
  background: hsl(45 96% 63%);
  transform: translateY(-2px);
}
```

Składnia: `transition: właściwość czas funkcja-czasu opóźnienie`. Funkcje: `ease`, `linear`, `ease-in`, `ease-out`, `ease-in-out`, `cubic-bezier(…)`.

> Animuj głównie `transform` i `opacity` — przeglądarka robi to płynnie na karcie graficznej. Animowanie `width`, `height`, `top`, `margin` wymusza przeliczanie układu i może „klatkować”.

## Animacje: `@keyframes`

Animacja z wieloma krokami, która może działać sama (bez najechania kursorem):

```css
@keyframes pojawienie {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.karta {
  animation: pojawienie 600ms ease-out both;
}

@keyframes puls {
  0%, 100% { transform: scale(1); }
  50%      { transform: scale(1.08); }
}

.powiadomienie {
  animation: puls 1.5s ease-in-out infinite;
}
```

| Właściwość | Znaczenie |
|---|---|
| `animation-name` | nazwa `@keyframes` |
| `animation-duration` | czas trwania |
| `animation-iteration-count` | liczba powtórzeń (`infinite` — bez końca) |
| `animation-delay` | opóźnienie (np. kolejne karty pojawiają się po sobie) |
| `animation-fill-mode` | `both` — zachowaj styl z pierwszej/ostatniej klatki |

## Szacunek dla użytkownika: `prefers-reduced-motion`

Część osób ma w systemie włączone **ograniczenie ruchu** (np. z powodu zawrotów głowy). Szanuj to ustawienie:

```css
@media (prefers-reduced-motion: reduce) {
  *,
  *::before,
  *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
    scroll-behavior: auto !important;
  }
}
```

## Płynne przewijanie

```css
html { scroll-behavior: smooth; }   /* płynne przejście do kotwic #sekcja */
section { scroll-margin-top: 80px; } /* żeby przyklejony nagłówek nie zasłonił nagłówka sekcji */
```

## Zadanie

1. Przyklejony (`sticky`) nagłówek strony z cieniem.
2. Plakietka „NOWOŚĆ” w rogu jednej karty (`relative` + `absolute`).
3. Przycisk „↑ Do góry” w prawym dolnym rogu (`fixed`), prowadzący do `#top`, z płynnym przewijaniem.
4. Karty: przy `:hover` lekko się unoszą (`transform` + `transition`) i dostają większy cień.
5. Animacja `@keyframes` pojawiania się kart przy wczytaniu strony — każda kolejna z większym `animation-delay`.
6. Wyłącz animacje dla `prefers-reduced-motion: reduce` i sprawdź to w F12 (*Rendering* → *Emulate CSS media feature*).
