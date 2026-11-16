**Tablica** (*array*) przechowuje **uporządkowaną listę** wartości: pytania quizu, oceny ucznia, zadania do zrobienia.

## Tworzenie i odczyt

```js
const oceny = [5, 4, 6, 3];
const imiona = ["Ola", "Jan", "Ewa"];
const mieszana = [1, "dwa", true, null];   // możliwe, ale rzadko potrzebne
const pusta = [];

oceny[0]                 // 5 — numeracja od ZERA
oceny[3]                 // 3
oceny[10]                // undefined — brak elementu
oceny.length             // 4
oceny[oceny.length - 1]  // 3 — ostatni element
oceny.at(-1)             // 3 — to samo, krócej
```

## Zmiana zawartości

```js
const lista = ["mleko", "chleb"];

lista.push("masło");       // dodaj na KOŃCU   → ["mleko", "chleb", "masło"]
lista.unshift("jajka");    // dodaj na POCZĄTKU → ["jajka", "mleko", "chleb", "masło"]
lista.pop();               // usuń z końca      → zwraca "masło"
lista.shift();             // usuń z początku   → zwraca "jajka"
lista[1] = "bułki";        // podmień element   → ["mleko", "bułki"]
```

> Tablica zapisana w `const` **może się zmieniać** — `const` zabrania tylko przypisania nowej tablicy (`lista = []`), a nie zmiany jej zawartości.

## `splice` — wstawianie i usuwanie w środku

```js
const litery = ["a", "b", "c", "d", "e"];

litery.splice(1, 2);         // od indeksu 1 usuń 2 elementy → litery: ["a", "d", "e"]
litery.splice(1, 0, "X");    // na indeksie 1 wstaw "X"      → ["a", "X", "d", "e"]
```

## Szukanie

```js
const kolory = ["czerwony", "zielony", "niebieski"];

kolory.includes("zielony")   // true
kolory.indexOf("niebieski")  // 2
kolory.indexOf("żółty")      // -1 — brak
```

## Metody, które NIE zmieniają tablicy

```js
const liczby = [1, 2, 3, 4, 5];

liczby.slice(1, 3)        // [2, 3] — kopia fragmentu (od 1 do 3, bez 3)
liczby.slice(-2)          // [4, 5] — dwa ostatnie
liczby.concat([6, 7])     // [1, 2, 3, 4, 5, 6, 7]
liczby.join(", ")         // "1, 2, 3, 4, 5" — tekst
"a-b-c".split("-")        // ["a", "b", "c"] — z tekstu do tablicy
[...liczby].reverse()     // [5, 4, 3, 2, 1] — odwrócona kopia
```

| Zmienia oryginał | Zwraca nową wartość |
|---|---|
| `push`, `pop`, `shift`, `unshift` | `slice`, `concat`, `join` |
| `splice`, `reverse`, `sort` | `map`, `filter`, `toSorted`, `toReversed` |

> **`slice`** — kopia fragmentu, **`splice`** — operacja na oryginale. Łatwo pomylić!

## Kopiowanie tablicy

```js
const a = [1, 2, 3];
const b = a;          // NIE kopia — dwie nazwy tej samej tablicy
b.push(4);
console.log(a);       // [1, 2, 3, 4] — zmieniła się też a!

const c = [...a];     // prawdziwa kopia (operator spread)
c.push(5);
console.log(a);       // [1, 2, 3, 4] — a bez zmian
```

Tablice i obiekty są przekazywane **przez referencję** — zmienna przechowuje „adres”, a nie samą zawartość.

## Tablice wielowymiarowe

```js
const plansza = [
  ["X", "O", "X"],
  ["O", "X", " "],
  [" ", " ", "O"],
];

plansza[1][0]   // "O" — wiersz 1, kolumna 0

for (const wiersz of plansza) {
  console.log(wiersz.join(" | "));
}
```

## Zadanie

1. Utwórz tablicę 5 ulubionych filmów; wypisz pierwszy, ostatni i liczbę elementów.
2. Dodaj film na początek i na koniec, usuń drugi element przez `splice`.
3. Sprawdź `includes`, czy na liście jest „Matrix”; jeśli nie — dodaj go.
4. Z tekstu `"Ala,Ola,Jan,Ewa"` zrób tablicę, a potem tekst „Ala • Ola • Jan • Ewa”.
5. Udowodnij w konsoli, że `const b = a` nie kopiuje tablicy, a `[...a]` — tak.
