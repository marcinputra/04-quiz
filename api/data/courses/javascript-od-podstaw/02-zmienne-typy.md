**Zmienna** to nazwane „pudełko” na wartość. Dzięki zmiennym program pamięta dane: imię użytkownika, wynik gry, listę zakupów.

## `let` i `const`

```js
let wynik = 0;        // wartość może się zmieniać
wynik = 10;           // OK

const PI = 3.14159;   // stała — nie można przypisać nowej wartości
PI = 3;               // TypeError: Assignment to constant variable.
```

| Słowo | Zmiana wartości | Kiedy używać |
|---|---|---|
| `const` | nie | **domyślnie** — większość zmiennych się nie zmienia |
| `let` | tak | liczniki, wartości zmieniane w pętli |
| `var` | tak | **nie używaj** — stary sposób z dziwnym zakresem (lekcja 14) |

> Zasada: pisz `const`, a na `let` zmieniaj dopiero wtedy, gdy naprawdę musisz przypisać nową wartość.

### Nazwy zmiennych

- mogą zawierać litery, cyfry, `_` i `$`, ale **nie mogą zaczynać się od cyfry**,
- nie mogą być słowami kluczowymi (`let`, `if`, `class`…),
- stosuj **camelCase**: `liczbaPunktow`, `czyZalogowany`, `imieUcznia`,
- nazwy mają mówić, **co** przechowują: `cenaBrutto` zamiast `x`.

## Typy danych

JavaScript ma **7 typów prostych** (*prymitywnych*) i **obiekty**:

| Typ | Przykład | Opis |
|---|---|---|
| `number` | `42`, `3.14`, `-7`, `NaN`, `Infinity` | liczby — całkowite i ułamkowe to ten sam typ |
| `string` | `"tekst"`, `'tekst'`, `` `tekst` `` | tekst |
| `boolean` | `true`, `false` | prawda / fałsz |
| `undefined` | `undefined` | zmienna bez przypisanej wartości |
| `null` | `null` | „celowo pusto” |
| `bigint` | `123n` | bardzo duże liczby całkowite |
| `symbol` | `Symbol("id")` | unikalny identyfikator |
| `object` | `{ imie: "Ola" }`, `[1, 2, 3]` | obiekty, tablice, funkcje, daty… |

### Operator `typeof`

```js
typeof 42           // "number"
typeof "Ala"        // "string"
typeof true         // "boolean"
typeof undefined    // "undefined"
typeof { a: 1 }     // "object"
typeof [1, 2]       // "object"  — tablica to obiekt!
typeof null         // "object"  — znany, historyczny błąd języka
typeof function(){} // "function"
```

Tablicę rozpoznasz przez `Array.isArray([1, 2])` → `true`.

## Teksty i szablony

```js
const imie = "Ola";
const wiek = 17;

// łączenie operatorem +
console.log("Mam na imię " + imie + " i mam " + wiek + " lat.");

// szablon (template literal) — czytelniej
console.log(`Mam na imię ${imie} i mam ${wiek} lat.`);
console.log(`Za rok będę mieć ${wiek + 1} lat.`);
```

W `${ … }` możesz wstawić **dowolne wyrażenie**. Szablony mogą też mieć wiele linii.

## `undefined` a `null`

```js
let adres;              // undefined — nic jeszcze nie przypisano
let telefon = null;     // null — wiemy, że telefonu nie ma
```

## Konwersja typów

```js
Number("42")      // 42
Number("42px")    // NaN — „Not a Number”
parseInt("42px")  // 42 — czyta cyfry do pierwszego innego znaku
parseFloat("3.5") // 3.5
String(42)        // "42"
Boolean(0)        // false
Boolean("tekst")  // true
```

> Uwaga na **automatyczną konwersję**: `"5" + 2` daje `"52"` (tekst!), ale `"5" - 2` daje `3`. Operator `+` z tekstem zawsze skleja. Dane z formularzy to zawsze **tekst** — zamieniaj je na liczby przez `Number()`.

## Zadanie

1. Utwórz stałe `imie`, `nazwisko`, `rokUrodzenia` i zmienną `klasa`.
2. Wypisz przy pomocy szablonu: „Jan Kowalski, ur. 2008, klasa 3B”.
3. Oblicz i wypisz wiek na podstawie `new Date().getFullYear()`.
4. Sprawdź w konsoli `typeof` dla każdej zmiennej.
5. Przewidź, a potem sprawdź wynik: `"10" + 5`, `"10" - 5`, `"10" * "2"`, `Number("abc")`.
