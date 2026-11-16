## Kombinatory — relacje między elementami

```css
article p { … }      /* potomek: każdy p wewnątrz article (na dowolnej głębokości) */
ul > li { … }        /* dziecko: tylko li bezpośrednio w ul */
h2 + p { … }         /* sąsiad: p tuż po h2 */
h2 ~ p { … }         /* wszystkie p po h2 na tym samym poziomie */
```

## Selektory atrybutów

```css
a[target="_blank"] { … }          /* linki otwierane w nowej karcie */
a[href^="https"] { … }            /* href ZACZYNA się od „https” */
a[href$=".pdf"] { … }             /* href KOŃCZY się na „.pdf” */
a[href*="maturazinformatyki"] { … } /* href ZAWIERA tekst */
input[type="email"] { … }
[data-status="aktywny"] { … }     /* własne atrybuty data-* */
```

## Pseudoklasy — stan elementu

### Interakcja

```css
a:hover { … }             /* kursor nad elementem */
a:active { … }            /* w momencie kliknięcia */
a:visited { … }           /* odwiedzony link */
input:focus { … }         /* element ma fokus */
button:focus-visible { … } /* fokus z klawiatury — tu rysuj wyraźną obwódkę */
```

> Nie usuwaj obwódki fokusu (`outline: none`) bez zastępstwa — osoby korzystające z klawiatury nie będą wiedziały, gdzie są. `:focus-visible` pokazuje obwódkę przy nawigacji klawiaturą, a nie przy kliknięciu myszą.

```css
:focus-visible {
  outline: 3px solid #facc15;
  outline-offset: 2px;
}
```

### Formularze

```css
input:required { … }
input:disabled { … }
input:checked + label { … }      /* etykieta zaznaczonego pola */
input:user-invalid { border-color: crimson; }   /* błąd po interakcji użytkownika */
input:placeholder-shown { … }
```

### Pozycja wśród rodzeństwa

```css
li:first-child { … }
li:last-child { … }
li:nth-child(2) { … }        /* drugi */
tr:nth-child(odd) { … }      /* nieparzyste — paski w tabeli */
li:nth-child(3n) { … }       /* co trzeci */
p:not(.wstep) { … }          /* wszystkie p bez klasy wstep */
```

### Nowoczesne: `:is()`, `:where()`, `:has()`

```css
/* zamiast: header a:hover, nav a:hover, footer a:hover */
:is(header, nav, footer) a:hover { … }

/* jak :is, ale zawsze z ZEROWĄ specyficznością — łatwo nadpisać (style bazowe) */
:where(ul, ol) { padding-left: 1.5rem; }

/* „selektor rodzica”: karta, która zawiera obraz */
.karta:has(img) { padding-top: 0; }

/* formularz z błędnym polem */
form:has(input:user-invalid) .przycisk { opacity: 0.5; }
```

## Pseudoelementy — części elementu

Zapisuje się je z **dwoma dwukropkami**:

```css
p::first-line { font-weight: 700; }
p::first-letter { font-size: 2em; float: left; }   /* inicjał */
::selection { background: #facc15; color: #000; }    /* zaznaczony tekst */
input::placeholder { color: #888; }
li::marker { color: #facc15; }                       /* punktor listy */
```

### `::before` i `::after`

Dodają wirtualny element **przed** lub **za** treścią. Wymagają właściwości `content`:

```css
.wymagane::after {
  content: " *";
  color: crimson;
}

a[href$=".pdf"]::after {
  content: " (PDF)";
  font-size: 0.85em;
}

.cytat::before {
  content: "„";
  font-size: 3rem;
  color: #facc15;
}
```

> Treść z `content` jest dekoracją — czytniki ekranu mogą jej nie przeczytać. Ważnych informacji nie wstawiaj przez CSS.

## Dziedziczenie i resetowanie wartości

```css
.przycisk { font: inherit; }        /* przyciski domyślnie nie dziedziczą czcionki */
.karta { all: unset; }              /* usuń wszystkie style (ostrożnie!) */
img { max-width: 100%; display: block; }   /* typowy reset obrazów */
```

## Zadanie

1. Dodaj styl `:hover` i wyraźny `:focus-visible` dla linków w menu i przycisków.
2. Paski w tabeli planu lekcji (`tr:nth-child(even)`).
3. Linki zewnętrzne (`[target="_blank"]`) oznacz strzałką „↗” przez `::after`.
4. W formularzu kontaktowym: gwiazdka przy etykietach wymaganych pól (`::after`) i czerwona ramka dla `:user-invalid`.
5. Użyj `:has()`, żeby karta zawierająca obraz miała inny układ niż karta bez obrazu.
