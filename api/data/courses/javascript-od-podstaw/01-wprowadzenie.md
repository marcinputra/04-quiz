**JavaScript** to jedyny język programowania, który przeglądarki wykonują bezpośrednio. Działa też poza przeglądarką — na serwerach (**Node.js**), w aplikacjach mobilnych i desktopowych. Ta strona też korzysta z JavaScriptu: quizy, logowanie i panel administratora działają dzięki niemu.

## Co potrafi JavaScript na stronie

- reagować na działania użytkownika (kliknięcia, wpisywanie, przewijanie),
- zmieniać treść i wygląd strony **bez przeładowania**,
- sprawdzać formularze, zanim trafią na serwer,
- pobierać i wysyłać dane (np. wyniki quizu),
- zapamiętywać ustawienia w przeglądarce.

## Pierwszy skrypt

Utwórz dwa pliki w jednym folderze:

```html
<!-- index.html -->
<!DOCTYPE html>
<html lang="pl">
<head>
  <meta charset="UTF-8">
  <title>Mój pierwszy skrypt</title>
  <script src="app.js" defer></script>
</head>
<body>
  <h1>Witaj!</h1>
</body>
</html>
```

```js
// app.js
console.log("Cześć, świecie!");
alert("JavaScript działa!");
```

Otwórz `index.html` w przeglądarce — pojawi się okienko z komunikatem.

> Atrybut `defer` sprawia, że skrypt wykona się **po zbudowaniu całego HTML**. Dzięki temu skrypt „widzi” wszystkie elementy strony. Szczegóły — w kursie [HTML5 — część 2](/kursy/html5-zaawansowany).

## Konsola przeglądarki — najważniejsze narzędzie

Naciśnij **F12** (lub Ctrl+Shift+I, na Macu Cmd+Option+I) i przejdź do zakładki **Console**. Zobaczysz tam napis z `console.log`. W konsoli możesz też pisać kod i od razu go wykonywać:

```js
2 + 2          // 4
"Ala" + " ma kota"   // 'Ala ma kota'
Math.max(3, 9, 5)    // 9
```

Różne rodzaje komunikatów:

```js
console.log("zwykła informacja");
console.warn("ostrzeżenie — żółte");
console.error("błąd — czerwony");
console.table([{ imie: "Ola", wiek: 17 }, { imie: "Jan", wiek: 18 }]);
```

> Jeśli coś nie działa — **zawsze zajrzyj najpierw do konsoli**. Czerwony komunikat wskazuje plik i numer linii z błędem.

## Składnia — podstawowe zasady

```js
// komentarz jednoliniowy

/*
  komentarz
  wieloliniowy
*/

console.log("Instrukcje kończymy średnikiem");
console.log("Wielkość liter ma znaczenie"); // Console.log() nie zadziała!
```

- każda **instrukcja** to jedno polecenie; zwykle kończymy je średnikiem `;`,
- JavaScript **rozróżnia wielkość liter** (`wiek` i `Wiek` to dwie różne nazwy),
- **bloki kodu** zamykamy w nawiasach klamrowych `{ … }`,
- tekst zapisujemy w cudzysłowach: `"…"`, `'…'` lub odwrotnych apostrofach `` `…` ``.

## Gdzie umieszczać skrypt

| Sposób | Przykład | Kiedy |
|---|---|---|
| plik zewnętrzny | `<script src="app.js" defer></script>` | **zawsze w prawdziwych projektach** |
| w HTML | `<script>console.log("hej")</script>` | małe testy |
| w atrybucie | `<button onclick="…">` | **unikaj** — miesza HTML z kodem |

## Tryb ścisły

Nowoczesny kod działa w **trybie ścisłym** (*strict mode*), który zamienia ciche pomyłki na wyraźne błędy. Moduły ES (lekcja 19) włączają go automatycznie, a w zwykłym skrypcie dopisz na początku:

```js
"use strict";
```

## Zadanie

1. Utwórz `index.html` i `app.js`, podłącz skrypt z `defer`.
2. Wypisz w konsoli swoje imię, wiek i ulubiony przedmiot — każde przez `console.log`.
3. Wypisz ostrzeżenie (`console.warn`) i błąd (`console.error`) — sprawdź, jak wyglądają.
4. W konsoli przeglądarki oblicz, ile sekund ma doba (`24 * 60 * 60`).
5. Celowo napisz `Console.log("test")` i przeczytaj komunikat błędu — w której linii jest błąd?
