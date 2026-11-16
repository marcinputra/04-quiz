Błędy zdarzają się każdemu programiście. Ważne, żeby umieć je **szybko znaleźć** i żeby program **nie przestawał działać**, gdy coś pójdzie nie tak (np. zabraknie internetu).

## Rodzaje błędów

| Błąd | Przyczyna | Przykład |
|---|---|---|
| `SyntaxError` | zła składnia — skrypt w ogóle się nie uruchomi | brak nawiasu `)` |
| `ReferenceError` | użycie nieistniejącej zmiennej | literówka: `licznk++` |
| `TypeError` | operacja na złym typie | `null.textContent`, `undefined()` |
| `RangeError` | wartość spoza zakresu | `new Array(-1)`, `(1).toFixed(200)` |
| błąd logiczny | kod działa, ale daje zły wynik | `<` zamiast `<=` |

Najczęstszy błąd na stronach:

```text
Uncaught TypeError: Cannot read properties of null (reading 'addEventListener')
    at app.js:12:9
```

Oznacza, że `querySelector` nic nie znalazł (literówka w selektorze albo skrypt bez `defer` wykonał się przed zbudowaniem HTML). **Plik i numer linii** są podane na końcu komunikatu — kliknij je w konsoli.

## `try…catch…finally`

```js
try {
  const dane = JSON.parse('{"imie": "Ola"');   // brak klamry — błąd
  console.log(dane.imie);
} catch (blad) {
  console.error("Nie udało się odczytać danych:", blad.message);
} finally {
  console.log("To wykona się zawsze");
}

console.log("Program działa dalej");
```

- kod w `try` jest wykonywany do pierwszego błędu,
- `catch` dostaje obiekt błędu (`name`, `message`, `stack`),
- `finally` wykonuje się **zawsze** — np. ukrycie wskaźnika ładowania.

> Nie otaczaj `try` całego programu „na wszelki wypadek”. Łap błędy tam, gdzie **wiesz, co z nimi zrobić**: pokazać komunikat, użyć wartości zapasowej, spróbować ponownie.

## Rzucanie własnych błędów: `throw`

```js
function podziel(a, b) {
  if (typeof a !== "number" || typeof b !== "number") {
    throw new TypeError("Argumenty muszą być liczbami");
  }
  if (b === 0) {
    throw new RangeError("Nie można dzielić przez zero");
  }
  return a / b;
}

try {
  podziel(10, 0);
} catch (e) {
  if (e instanceof RangeError) console.warn(e.message);
  else throw e;   // nieznany błąd — przekaż dalej
}
```

### Własne klasy błędów

```js
class BladWalidacji extends Error {
  constructor(pole, message) {
    super(message);
    this.name = "BladWalidacji";
    this.pole = pole;
  }
}

try {
  throw new BladWalidacji("email", "Niepoprawny adres e-mail");
} catch (e) {
  if (e instanceof BladWalidacji) {
    document.getElementById(`${e.pole}-blad`).textContent = e.message;
  }
}
```

## Debugowanie w przeglądarce

### `console` — więcej niż `log`

```js
console.log({ imie, wiek });     // obiekt z nazwami — widać, która zmienna to która
console.table(uczniowie);        // tabela
console.group("Logowanie");      // grupowanie komunikatów
console.log("krok 1");
console.groupEnd();
console.time("sortowanie");
duzaTablica.sort();
console.timeEnd("sortowanie");   // sortowanie: 12.3 ms
console.assert(wynik > 0, "Wynik powinien być dodatni");
```

### Debugger — zatrzymanie programu

1. **F12 → Sources** (Chrome) lub **Debugger** (Firefox), otwórz plik `.js`.
2. Kliknij **numer linii** — pojawi się **punkt przerwania** (*breakpoint*).
3. Wykonaj akcję na stronie — program **zatrzyma się** na tej linii.
4. Najedź na zmienną, aby zobaczyć jej wartość; panel **Scope** pokazuje wszystkie zmienne.
5. Przyciski: **Step over** (następna linia), **Step into** (wejdź do funkcji), **Resume** (dalej).

Możesz też zatrzymać program z kodu:

```js
function obliczWynik(odpowiedzi) {
  debugger;   // przy otwartych narzędziach F12 program się tu zatrzyma
  // …
}
```

Inne przydatne narzędzia:

- **warunkowy breakpoint** (prawy klik na numer linii) — zatrzymaj, gdy np. `i === 99`,
- **Event Listener Breakpoints** — zatrzymaj przy każdym `click`,
- zakładka **Network** — czy zapytanie do serwera się udało (lekcja 18).

## Metoda „gumowej kaczki”

Gdy utkniesz — **wytłumacz kod linijka po linijce** komuś (albo gumowej kaczce na biurku). Bardzo często błąd zauważysz w trakcie tłumaczenia.

## Globalna obsługa błędów

```js
window.addEventListener("error", (e) => {
  console.error("Nieobsłużony błąd:", e.message);
});

window.addEventListener("unhandledrejection", (e) => {
  console.error("Nieobsłużona obietnica:", e.reason);   // lekcja 17
});
```

## Zadanie

1. Napisz `bezpiecznyJSON(tekst, zapasowa)` — zwraca sparsowane dane albo wartość zapasową, gdy JSON jest błędny.
2. Napisz `ustawWiek(wiek)`, która rzuca `TypeError` dla nie-liczb i `RangeError` dla wieku poza 0–130.
3. Utwórz klasę `BladWalidacji` i pokaż jej komunikat pod polem formularza z lekcji 13.
4. Ustaw breakpoint w pętli liczącej średnią i prześledź wartości zmiennych krok po kroku.
5. W gotowym kodzie (np. z lekcji 8) celowo zrób trzy błędy różnych typów i odczytaj komunikaty w konsoli.
