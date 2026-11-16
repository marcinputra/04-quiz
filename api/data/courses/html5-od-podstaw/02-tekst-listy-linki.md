## Nagłówki

HTML ma sześć poziomów nagłówków — od `<h1>` (najważniejszy) do `<h6>`:

```html
<h1>Kurs HTML5</h1>
<h2>Rozdział 2</h2>
<h3>Nagłówki</h3>
```

Zasady:

- na stronie powinien być **jeden** `<h1>` — główny temat,
- nie pomijaj poziomów (po `<h2>` następuje `<h3>`, a nie `<h5>`),
- nagłówków **nie używaj** do powiększania tekstu — od wyglądu jest CSS. Nagłówki tworzą **spis treści** strony, z którego korzystają wyszukiwarki i czytniki ekranu.

## Akapity i formatowanie tekstu

```html
<p>Akapit to podstawowy blok tekstu.</p>
<p>
  Tekst może być <strong>ważny</strong> (pogrubiony),
  <em>wyróżniony</em> (kursywa) albo <mark>zaznaczony</mark>.
  Wzór chemiczny wody to H<sub>2</sub>O, a 2<sup>10</sup> = 1024.
</p>
<p>Pierwsza linia<br>druga linia w tym samym akapicie.</p>
<hr>
<p>Kod w tekście: <code>print("Hello")</code></p>
```

| Znacznik | Znaczenie |
|---|---|
| `<strong>` | tekst ważny (zwykle pogrubiony) |
| `<em>` | tekst akcentowany (zwykle kursywa) |
| `<mark>` | tekst zaznaczony |
| `<sub>`, `<sup>` | indeks dolny i górny |
| `<br>` | przejście do nowej linii (element pusty) |
| `<hr>` | zmiana tematu, pozioma linia (element pusty) |
| `<code>` | fragment kodu |

> Wiele spacji i nowych linii w kodzie przeglądarka zamienia na **jedną spację**. Nowy akapit to nowy `<p>`, a nie pusta linia w kodzie.

## Listy

**Lista nieuporządkowana** (punktowana) — kolejność nie ma znaczenia:

```html
<ul>
  <li>HTML</li>
  <li>CSS</li>
  <li>JavaScript</li>
</ul>
```

**Lista uporządkowana** (numerowana) — kolejność jest ważna:

```html
<ol>
  <li>Utwórz plik index.html</li>
  <li>Wpisz szkielet dokumentu</li>
  <li>Otwórz plik w przeglądarce</li>
</ol>
```

Listy można zagnieżdżać — wewnętrzna lista musi być **wewnątrz** elementu `<li>`:

```html
<ul>
  <li>Frontend
    <ul>
      <li>HTML</li>
      <li>CSS</li>
    </ul>
  </li>
  <li>Backend</li>
</ul>
```

## Linki

Link tworzy się znacznikiem `<a>` z atrybutem `href`:

```html
<!-- link do innej strony (adres bezwzględny) -->
<a href="https://developer.mozilla.org/pl/">Dokumentacja MDN</a>

<!-- link do pliku w tym samym folderze (adres względny) -->
<a href="kontakt.html">Kontakt</a>

<!-- link do pliku w podfolderze / folderze wyżej -->
<a href="galeria/zdjecia.html">Galeria</a>
<a href="../index.html">Strona główna</a>

<!-- otwarcie w nowej karcie -->
<a href="https://maturazinformatyki.it" target="_blank" rel="noopener">Matura z informatyki</a>

<!-- link e-mail i telefon -->
<a href="mailto:kontakt@example.com">Napisz do nas</a>
<a href="tel:+48123456789">Zadzwoń</a>
```

### Linki do miejsca na tej samej stronie

Nadaj elementowi atrybut `id`, a w linku użyj `#`:

```html
<a href="#zadanie">Przejdź do zadania</a>
...
<h2 id="zadanie">Zadanie</h2>
```

> **Dobra praktyka:** tekst linku powinien mówić, dokąd prowadzi. „Dokumentacja HTML” jest lepsze niż „kliknij tutaj”.

## Zadanie

Rozbuduj swoją stronę „O mnie”:

1. dodaj nagłówek `<h2>Moje zainteresowania</h2>` i **listę nieuporządkowaną** z co najmniej trzema zainteresowaniami,
2. dodaj nagłówek `<h2>Mój plan dnia</h2>` i **listę uporządkowaną** z pięcioma punktami,
3. w jednym akapicie użyj `<strong>` i `<em>`,
4. utwórz drugi plik `kontakt.html` i połącz obie strony linkami względnymi,
5. na górze `index.html` dodaj link `#`, który przenosi do sekcji „Mój plan dnia”.
