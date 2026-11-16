**CSS Grid** układa elementy w **dwóch wymiarach** — w wierszach i kolumnach jednocześnie. Najlepszy do układu całej strony, galerii i wszystkiego, co przypomina siatkę.

| Flexbox | Grid |
|---|---|
| jeden wymiar (wiersz **albo** kolumna) | dwa wymiary (wiersze **i** kolumny) |
| rozmiar wynika z zawartości | zawartość dopasowuje się do siatki |
| menu, paski, wyrównanie elementów | układ strony, galerie, kalendarze |

W praktyce używa się obu: Grid do układu strony, Flexbox do elementów w środku.

## Definiowanie siatki

```css
.siatka {
  display: grid;
  grid-template-columns: 200px 1fr 1fr;   /* 3 kolumny */
  gap: 1rem;                              /* odstęp między wierszami i kolumnami */
}
```

### Jednostka `fr`

`fr` (*fraction*) to **część wolnego miejsca**. `1fr 2fr` — druga kolumna jest dwa razy szersza od pierwszej.

```css
grid-template-columns: repeat(3, 1fr);          /* 3 równe kolumny */
grid-template-columns: 250px 1fr;               /* stały pasek boczny + reszta */
grid-template-columns: repeat(12, 1fr);         /* klasyczna siatka 12 kolumn */
grid-template-rows: auto 1fr auto;              /* nagłówek, treść, stopka */
```

### Responsywna galeria bez media queries

```css
.galeria {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 1rem;
}
```

- `minmax(220px, 1fr)` — kolumna ma co najmniej 220 px, a resztę miejsca dzieli równo,
- `auto-fit` — zmieść tyle kolumn, ile się da.

Na telefonie powstanie 1 kolumna, na tablecie 2–3, na monitorze 4–5 — **bez jednego media query**.

## Umieszczanie elementów

Linie siatki są numerowane od 1. Element może zajmować kilka komórek:

```css
.wyrozniony {
  grid-column: 1 / 3;        /* od linii 1 do linii 3 = 2 kolumny */
  grid-row: span 2;          /* zajmij 2 wiersze */
}
.na-cala-szerokosc {
  grid-column: 1 / -1;       /* od pierwszej do ostatniej linii */
}
```

## Nazwane obszary — układ strony

Najczytelniejszy sposób na układ całej strony:

```css
.strona {
  display: grid;
  grid-template-columns: 250px 1fr;
  grid-template-rows: auto 1fr auto;
  grid-template-areas:
    "naglowek naglowek"
    "boczny   tresc"
    "stopka   stopka";
  min-height: 100dvh;
  gap: 1rem;
}

header { grid-area: naglowek; }
aside  { grid-area: boczny; }
main   { grid-area: tresc; }
footer { grid-area: stopka; }
```

Na telefonie wystarczy zmienić mapę obszarów:

```css
@media (max-width: 700px) {
  .strona {
    grid-template-columns: 1fr;
    grid-template-areas:
      "naglowek"
      "tresc"
      "boczny"
      "stopka";
  }
}
```

## Wyrównywanie w Gridzie

| Właściwość | Dotyczy |
|---|---|
| `justify-items` / `align-items` | wszystkich elementów w ich komórkach (poziomo / pionowo) |
| `justify-self` / `align-self` | jednego elementu |
| `place-items: center` | skrót: wyśrodkuj w obu osiach |
| `justify-content` / `align-content` | całej siatki w kontenerze |

```css
/* najkrótsze wyśrodkowanie w CSS */
.srodek {
  display: grid;
  place-items: center;
  min-height: 100dvh;
}
```

## `subgrid` — wyrównanie zawartości kart

Gdy karty w rzędzie mają tytuły różnej długości, przyciski „Czytaj dalej” nie są w jednej linii. `subgrid` pozwala wnętrzu karty korzystać z wierszy siatki rodzica:

```css
.karty {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1rem;
}
.karta {
  display: grid;
  grid-row: span 3;                  /* tytuł, opis, przycisk */
  grid-template-rows: subgrid;
}
```

## Narzędzia

W F12 kliknij plakietkę **grid** przy elemencie — przeglądarka narysuje linie siatki z numerami i nazwami obszarów. Do ćwiczeń: gra **Grid Garden** (cssgridgarden.com).

## Zadanie

1. Układ strony-wizytówki w Gridzie z nazwanymi obszarami: nagłówek, treść, pasek boczny, stopka.
2. Na ekranach poniżej 700 px — jedna kolumna (zmień tylko `grid-template-areas` i `grid-template-columns`).
3. Galeria zdjęć z `repeat(auto-fit, minmax(…, 1fr))` — jedno zdjęcie wyróżnione na 2 kolumny i 2 wiersze.
4. Karty artykułów z `subgrid`, tak by przyciski były w jednej linii.
5. Porównaj w komentarzu: co w Twoim projekcie lepiej zrobić Flexboxem, a co Gridem?
