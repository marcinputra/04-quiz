## Jak podłączyć CSS do strony

Są trzy sposoby — w praktyce używa się głównie pierwszego:

```html
<!-- 1. Zewnętrzny plik (zalecane) — jeden plik stylów dla wszystkich podstron -->
<head>
  <link rel="stylesheet" href="style.css">
</head>

<!-- 2. Styl wewnętrzny — tylko dla tej jednej strony -->
<head>
  <style>
    h1 { color: navy; }
  </style>
</head>

<!-- 3. Styl w linii — unikaj, trudno go utrzymać i nadpisać -->
<p style="color: red;">Uwaga!</p>
```

## Składnia reguły CSS

```css
selektor {
  właściwość: wartość;
  inna-właściwość: wartość;
}
```

```css
h1 {
  color: #1e3a8a;      /* kolor tekstu */
  font-size: 32px;     /* rozmiar czcionki */
  text-align: center;  /* wyrównanie */
}
```

- **selektor** mówi, *które* elementy stylujemy,
- w nawiasach klamrowych są **deklaracje** `właściwość: wartość;` — każda zakończona średnikiem,
- komentarze zapisuje się jako `/* … */`.

## Podstawowe selektory

```css
p { … }              /* wszystkie akapity (selektor elementu) */
.ostrzezenie { … }   /* elementy z class="ostrzezenie" (selektor klasy) */
#logo { … }          /* element z id="logo" (selektor id) */
* { … }              /* wszystkie elementy */
h1, h2, h3 { … }     /* grupa selektorów — te same style dla kilku */
nav a { … }          /* linki wewnątrz nav (selektor potomka) */
```

```html
<p class="ostrzezenie">Ten akapit będzie wyróżniony.</p>
<p class="ostrzezenie duzy">Element może mieć kilka klas naraz.</p>
```

> **Dobra praktyka:** styluj głównie przez **klasy**. Id są unikalne na stronie i mają bardzo wysoką specyficzność — trudno je potem nadpisać.

## Kaskada — który styl wygrywa?

Gdy kilka reguł ustawia tę samą właściwość, przeglądarka wybiera zwycięzcę w tej kolejności:

1. **Ważność** — `!important` wygrywa ze wszystkim (używaj tylko w wyjątkowych sytuacjach),
2. **Specyficzność** selektora — bardziej szczegółowy wygrywa,
3. **Kolejność** — przy równej specyficzności wygrywa reguła zapisana **później**.

### Specyficzność

Liczy się ją jako trzy liczby **(id, klasy, elementy)**:

| Selektor | Specyficzność |
|---|---|
| `p` | (0, 0, 1) |
| `.menu a` | (0, 1, 1) |
| `nav .menu a:hover` | (0, 2, 2) — pseudoklasa liczy się jak klasa |
| `#naglowek .logo` | (1, 1, 0) |
| `style="…"` | wyższa niż każdy selektor |

Porównuje się od lewej: jedno `id` wygrywa z dowolną liczbą klas.

```css
p { color: black; }
.wazny { color: red; }     /* wygra z p — klasa jest bardziej szczegółowa */
p { color: blue; }         /* nadal czerwony! kolejność nie pomoże przy niższej specyficzności */
```

## Dziedziczenie

Niektóre właściwości są **dziedziczone** przez elementy w środku — głównie te związane z tekstem: `color`, `font-family`, `font-size`, `line-height`. Dlatego ustawia się je na `body`:

```css
body {
  font-family: system-ui, sans-serif;
  color: #1f2937;
  line-height: 1.6;
}
```

Właściwości układu (`margin`, `padding`, `border`, `width`) **nie** są dziedziczone.

## Narzędzia deweloperskie

**F12 → zakładka *Elements* (Elementy)** — kliknij element, a po prawej zobaczysz wszystkie reguły CSS, które go dotyczą. Reguły przegrane w kaskadzie są **przekreślone**. Wartości można zmieniać na żywo — najszybszy sposób na eksperymenty.

## Zadanie

1. Do strony-wizytówki z kursu HTML dodaj plik `style.css` i podłącz go `<link>` na wszystkich podstronach.
2. Ustaw dla `body` czcionkę, kolor tekstu i `line-height`.
3. Nadaj kolor nagłówkom `h1` i `h2` (jednym selektorem grupowym).
4. Utwórz klasę `.wyroznienie` z innym kolorem tła i użyj jej w dwóch miejscach.
5. Celowo stwórz konflikt dwóch reguł i w F12 sprawdź, która wygrała i dlaczego — zapisz wyjaśnienie w komentarzu CSS.
