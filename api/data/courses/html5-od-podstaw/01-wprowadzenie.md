## Czym jest HTML?

**HTML** (*HyperText Markup Language*) to język znaczników, w którym opisuje się **treść i strukturę** strony internetowej: co jest nagłówkiem, co akapitem, gdzie jest obrazek, a gdzie link. HTML **nie jest językiem programowania** — nie ma w nim pętli ani warunków. Wygląd strony (kolory, układ) opisuje CSS, a zachowanie — JavaScript.

**HTML5** to aktualna wersja standardu. Wprowadziła m.in. znaczniki semantyczne (`<header>`, `<article>`), wbudowane audio i wideo oraz nowe typy pól formularzy.

## Znaczniki i atrybuty

Treść oznacza się **znacznikami** (tagami) zapisanymi w nawiasach ostrych. Większość znaczników ma część otwierającą i zamykającą:

```html
<p>To jest akapit tekstu.</p>
```

- `<p>` — znacznik otwierający,
- `</p>` — znacznik zamykający (z ukośnikiem),
- całość to **element**.

Niektóre elementy są **puste** — nie mają treści ani znacznika zamykającego, np. `<br>` (nowa linia) czy `<img>` (obraz).

Znaczniki mogą mieć **atrybuty** — dodatkowe informacje zapisane w znaczniku otwierającym jako `nazwa="wartość"`:

```html
<a href="https://maturazinformatyki.it">Przejdź do strony</a>
```

Tutaj `href` to atrybut, który mówi, dokąd prowadzi link.

## Szkielet dokumentu HTML5

Każda strona HTML5 ma ten sam podstawowy szkielet:

```html
<!DOCTYPE html>
<html lang="pl">
  <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Moja pierwsza strona</title>
  </head>
  <body>
    <h1>Witaj na mojej stronie!</h1>
    <p>To jest mój pierwszy akapit w HTML5.</p>
  </body>
</html>
```

| Element | Znaczenie |
|---|---|
| `<!DOCTYPE html>` | informuje przeglądarkę, że to dokument HTML5 (zawsze pierwsza linia) |
| `<html lang="pl">` | główny element; `lang` podaje język strony (ważne dla czytników ekranu i wyszukiwarek) |
| `<head>` | informacje **o** stronie — nie są wyświetlane w oknie |
| `<meta charset="UTF-8">` | kodowanie znaków — dzięki niemu poprawnie wyświetlą się polskie litery |
| `<meta name="viewport" …>` | poprawne skalowanie na telefonach |
| `<title>` | tytuł widoczny na karcie przeglądarki i w wynikach wyszukiwania |
| `<body>` | **treść** strony widoczna dla użytkownika |

## Zagnieżdżanie i wcięcia

Elementy umieszcza się jeden w drugim (**zagnieżdża**). Zamykamy je w odwrotnej kolejności niż otwieramy:

```html
<!-- dobrze -->
<p>To jest <strong>ważne</strong> zdanie.</p>

<!-- źle: znaczniki się krzyżują -->
<p>To jest <strong>ważne zdanie.</p></strong>
```

Wcięcia nie mają znaczenia dla przeglądarki, ale bardzo ułatwiają czytanie kodu. Tekst między `<!--` a `-->` to **komentarz** — przeglądarka go pomija.

## Jak utworzyć i otworzyć pierwszą stronę

1. Utwórz folder `moja-strona`.
2. W edytorze (np. Visual Studio Code) utwórz w nim plik **`index.html`**.
3. Wklej szkielet z przykładu powyżej i zapisz plik.
4. Kliknij plik dwukrotnie — otworzy się w przeglądarce.
5. Po każdej zmianie zapisz plik i odśwież stronę (**F5**).

> **Wskazówka:** w VS Code wpisz w pustym pliku `!` i naciśnij **Tab** — edytor wstawi cały szkielet HTML5.

## Narzędzia deweloperskie

W przeglądarce naciśnij **F12** (lub prawy przycisk myszy → *Zbadaj*). Zobaczysz kod strony w postaci drzewa elementów — możesz klikać elementy, sprawdzać ich atrybuty i na próbę zmieniać treść.

## Zadanie

Utwórz plik `index.html` ze szkieletem HTML5, w którym:

1. tytuł karty przeglądarki to Twoje imię,
2. w treści jest nagłówek `<h1>` z tekstem „O mnie”,
3. pod nim są dwa akapity `<p>` z krótkim opisem Ciebie,
4. w kodzie jest jeden komentarz z dzisiejszą datą.

Otwórz stronę w przeglądarce i sprawdź w narzędziach deweloperskich (F12), czy struktura dokumentu jest poprawna.
