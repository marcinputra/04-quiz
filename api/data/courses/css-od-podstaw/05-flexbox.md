**Flexbox** układa elementy w **jednym wymiarze** — w wierszu albo w kolumnie — i rozdziela między nimi wolne miejsce. Idealny do menu, pasków narzędzi, wyrównywania elementów i list kart.

## Kontener i elementy

Flexbox włącza się na **rodzicu** — jego bezpośrednie dzieci stają się elementami *flex*:

```html
<nav class="menu">
  <a href="/">Start</a>
  <a href="/kursy">Kursy</a>
  <a href="/kontakt">Kontakt</a>
</nav>
```

```css
.menu {
  display: flex;
  gap: 1rem;            /* odstęp między elementami */
}
```

## Oś główna i poprzeczna

- `flex-direction: row` (domyślnie) — elementy w **wierszu**, oś główna poziomo,
- `flex-direction: column` — w **kolumnie**, oś główna pionowo.

| Właściwość kontenera | Działa wzdłuż | Wartości |
|---|---|---|
| `justify-content` | osi **głównej** | `flex-start`, `center`, `flex-end`, `space-between`, `space-around`, `space-evenly` |
| `align-items` | osi **poprzecznej** | `stretch` (domyślnie), `flex-start`, `center`, `flex-end`, `baseline` |

### Typowe przepisy

```css
/* logo po lewej, menu po prawej */
.naglowek {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

/* idealne wyśrodkowanie w obu osiach */
.srodek {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100dvh;
}

/* elementy jeden pod drugim z odstępem */
.formularz {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}
```

## Zawijanie: `flex-wrap`

Domyślnie elementy ściskają się w jednym wierszu. Z `flex-wrap: wrap` przechodzą do kolejnego:

```css
.karty {
  display: flex;
  flex-wrap: wrap;
  gap: 1.5rem;
}
.karta {
  flex: 1 1 280px;   /* rośnij, kurcz się, bazowo 280px */
}
```

Karty mają ok. 280 px, a gdy się nie mieszczą — przechodzą do nowego wiersza. Na telefonie zajmą całą szerokość, na komputerze ustawią się po 3–4 w rzędzie.

## Właściwości elementów: `flex-grow`, `flex-shrink`, `flex-basis`

| Właściwość | Znaczenie |
|---|---|
| `flex-grow` | jaką część **wolnego** miejsca element zabiera (0 = żadną) |
| `flex-shrink` | czy element może się **kurczyć**, gdy brakuje miejsca (0 = nie) |
| `flex-basis` | rozmiar **wyjściowy** przed podziałem miejsca |
| `flex` | skrót: `flex: grow shrink basis` |

```css
.pasek-boczny { flex: 0 0 250px; }   /* stałe 250px — nie rośnie, nie kurczy się */
.tresc        { flex: 1; }           /* zabiera całe pozostałe miejsce */
```

```css
/* pole wyszukiwania rozciąga się, przycisk ma swój rozmiar */
.szukaj { display: flex; gap: 0.5rem; }
.szukaj input { flex: 1; }
```

## Pojedynczy element: `align-self`, `order`, `margin: auto`

```css
.wyjatek { align-self: flex-end; }   /* inne wyrównanie tylko dla tego elementu */
.pierwszy { order: -1; }             /* zmiana kolejności wyświetlania */

/* „wypchnij” ostatni element na prawo */
.menu .zaloguj { margin-left: auto; }
```

> `order` zmienia tylko **wygląd** — czytnik ekranu i klawisz Tab nadal idą w kolejności z HTML. Nie używaj go do zmiany logicznej kolejności treści.

## Stopka zawsze na dole strony

```css
body {
  display: flex;
  flex-direction: column;
  min-height: 100dvh;
}
main { flex: 1; }    /* main rośnie i wypycha footer na dół */
```

## Gra do ćwiczeń

Na stronie **Flexbox Froggy** (flexboxfroggy.com) w 24 poziomach przećwiczysz wszystkie właściwości Flexboxa — warto przejść całą.

## Zadanie

1. Nagłówek strony: logo po lewej, menu po prawej, wyrównane w pionie (`space-between`, `align-items`).
2. Menu jako Flexbox z `gap`; link „Kontakt” wypchnięty na prawo (`margin-left: auto`).
3. Lista kart w galerii: `flex-wrap` i `flex: 1 1 250px` — sprawdź zachowanie przy zmianie szerokości okna.
4. Formularz kontaktowy: etykiety i pola w kolumnie z `gap`.
5. Stopka przyklejona do dołu, nawet gdy treści jest mało.
