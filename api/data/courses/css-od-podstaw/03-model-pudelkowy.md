Każdy element na stronie to **prostokątne pudełko**. Zrozumienie, z czego się składa, to klucz do panowania nad odstępami i rozmiarami.

## Warstwy pudełka

Od środka:

1. **content** — treść (tekst, obraz), rozmiar ustawiają `width` i `height`,
2. **padding** — wewnętrzny odstęp między treścią a ramką (ma kolor tła elementu),
3. **border** — ramka,
4. **margin** — zewnętrzny odstęp od innych elementów (zawsze przezroczysty).

```css
.karta {
  width: 300px;
  padding: 20px;
  border: 2px solid #facc15;
  margin: 16px;
  background: #1f2324;
}
```

W F12 (zakładka *Elements* → *Computed*) zobaczysz rysunek pudełka z dokładnymi wartościami każdej warstwy.

## `box-sizing` — ile naprawdę ma element?

Domyślnie (`content-box`) `width` dotyczy **tylko treści** — `padding` i `border` są **doliczane**. Karta z przykładu ma więc 300 + 2·20 + 2·2 = **344 px** szerokości. To częste źródło błędów.

Z `border-box` szerokość obejmuje treść, padding i ramkę — karta ma dokładnie **300 px**:

```css
/* standardowy początek każdego arkusza stylów */
*,
*::before,
*::after {
  box-sizing: border-box;
}
```

## Skróty: 1, 2, 3 lub 4 wartości

```css
margin: 10px;                 /* wszystkie strony */
margin: 10px 20px;            /* góra i dół | lewo i prawo */
margin: 10px 20px 30px;       /* góra | lewo i prawo | dół */
margin: 10px 20px 30px 40px;  /* góra | prawo | dół | lewo — zgodnie z ruchem wskazówek zegara */

margin-top: 10px;             /* pojedyncza strona */
margin-inline: auto;          /* lewo i prawo (zależne od kierunku tekstu) */
padding-block: 1rem;          /* góra i dół */
```

### Wyśrodkowanie elementu w poziomie

```css
.kontener {
  max-width: 1000px;
  margin-inline: auto;   /* równe automatyczne marginesy po bokach */
  padding-inline: 1rem;  /* odstęp od krawędzi na telefonie */
}
```

## Ramki i zaokrąglenia

```css
.karta {
  border: 1px solid hsl(0 0% 80%);   /* grubość | styl | kolor */
  border-left: 4px solid #facc15;    /* tylko lewa krawędź */
  border-radius: 12px;               /* zaokrąglone rogi */
}
.awatar {
  border-radius: 50%;                /* koło (dla kwadratowego elementu) */
}
.przycisk {
  outline: 2px solid transparent;    /* outline nie zajmuje miejsca w układzie */
}
```

Style ramki: `solid`, `dashed`, `dotted`, `double`, `none`.

## Łączenie marginesów pionowych

Gdy dwa elementy blokowe sąsiadują w pionie, ich marginesy górny i dolny **nie sumują się** — zostaje **większy** z nich:

```css
h2 { margin-bottom: 30px; }
p  { margin-top: 20px; }
/* odstęp między h2 a p wynosi 30px, nie 50px */
```

To zjawisko nie występuje we Flexboxie i Gridzie — tam odstępy ustawia się właściwością `gap`.

## `display` — jak element zachowuje się w układzie

| Wartość | Zachowanie | Przykłady domyślne |
|---|---|---|
| `block` | zajmuje całą szerokość, zaczyna się od nowej linii, respektuje `width`/`height` i wszystkie marginesy | `div`, `p`, `h1`, `section` |
| `inline` | płynie z tekstem, **ignoruje** `width`, `height` i marginesy pionowe | `a`, `span`, `strong` |
| `inline-block` | płynie z tekstem, ale respektuje wymiary i marginesy | przyciski, ikony |
| `none` | element znika (nie zajmuje miejsca) | — |
| `flex`, `grid` | układy — lekcje 5 i 6 | — |

```css
nav a {
  display: inline-block;
  padding: 0.5rem 1rem;   /* teraz padding pionowy zadziała poprawnie */
}
```

## Przepełnienie: `overflow`

```css
.ramka-kodu {
  max-height: 300px;
  overflow: auto;       /* pasek przewijania tylko, gdy treść się nie mieści */
}
.obciete {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;   /* długi tekst kończy się „…” */
}
```

## Cienie

```css
.karta {
  box-shadow: 0 4px 12px rgb(0 0 0 / 15%);   /* przesunięcie X | Y | rozmycie | kolor */
}
```

## Zadanie

1. Dodaj na początku `style.css` regułę `box-sizing: border-box` dla wszystkich elementów.
2. Utwórz klasę `.kontener` (maks. 1000 px, wyśrodkowany, z odstępem od krawędzi na telefonie) i użyj jej w `header`, `main` i `footer`.
3. Ostyluj sekcje jako karty: padding, ramka, zaokrąglenie, cień.
4. Zamień linki w menu na `inline-block` z paddingiem.
5. W F12 sprawdź model pudełkowy jednej karty i zapisz w komentarzu jej całkowitą szerokość z `content-box` i z `border-box`.
