Nowoczesny JavaScript rzadko używa zwykłej pętli `for` do pracy z tablicami. Zamiast tego stosuje **metody przyjmujące funkcję** (callback), która jest wywoływana dla każdego elementu.

W przykładach użyjemy tej tablicy:

```js
const uczniowie = [
  { imie: "Ola", klasa: "3A", punkty: 88 },
  { imie: "Jan", klasa: "3B", punkty: 45 },
  { imie: "Ewa", klasa: "3A", punkty: 72 },
  { imie: "Piotr", klasa: "3B", punkty: 95 },
];
```

## `forEach` — zrób coś dla każdego

```js
uczniowie.forEach((u, indeks) => {
  console.log(`${indeks + 1}. ${u.imie}`);
});
```

`forEach` niczego nie zwraca. Nie da się go przerwać `break` — wtedy użyj `for…of`.

## `map` — przekształć każdy element

Zwraca **nową tablicę tej samej długości**:

```js
const imiona = uczniowie.map((u) => u.imie);
// ["Ola", "Jan", "Ewa", "Piotr"]

const procenty = [0.5, 0.25, 1].map((x) => `${x * 100}%`);
// ["50%", "25%", "100%"]
```

## `filter` — wybierz pasujące

Zwraca **nową tablicę** z elementami, dla których callback zwrócił `true`:

```js
const zdali = uczniowie.filter((u) => u.punkty >= 50);
// Ola, Ewa, Piotr

const klasa3A = uczniowie.filter((u) => u.klasa === "3A");
```

## `find` i `findIndex` — znajdź pierwszy

```js
uczniowie.find((u) => u.punkty > 90)       // { imie: "Piotr", … }
uczniowie.find((u) => u.punkty > 100)      // undefined
uczniowie.findIndex((u) => u.imie === "Ewa")  // 2
```

## `some` i `every` — sprawdź warunek

```js
uczniowie.some((u) => u.punkty < 50)    // true — ktoś nie zdał
uczniowie.every((u) => u.punkty > 40)   // true — wszyscy powyżej 40
```

## `reduce` — zredukuj do jednej wartości

```js
const suma = uczniowie.reduce((akumulator, u) => akumulator + u.punkty, 0);
// 300

const srednia = suma / uczniowie.length;   // 75
```

- pierwszy argument callbacku (`akumulator`) to **wynik z poprzedniego kroku**,
- drugi argument `reduce` (`0`) to **wartość początkowa**.

Grupowanie z `reduce`:

```js
const wgKlas = uczniowie.reduce((grupy, u) => {
  (grupy[u.klasa] ??= []).push(u.imie);
  return grupy;
}, {});
// { "3A": ["Ola", "Ewa"], "3B": ["Jan", "Piotr"] }
```

## `sort` — sortowanie

```js
[10, 9, 1, 100].sort()                  // [1, 10, 100, 9] — sortuje jak TEKST!
[10, 9, 1, 100].sort((a, b) => a - b)   // [1, 9, 10, 100] — rosnąco
[10, 9, 1, 100].sort((a, b) => b - a)   // [100, 10, 9, 1] — malejąco

// po polu obiektu, bez zmiany oryginału
const ranking = uczniowie.toSorted((a, b) => b.punkty - a.punkty);

// teksty z polskimi znakami
["Żaneta", "Adam", "Łukasz"].sort((a, b) => a.localeCompare(b, "pl"));
// ["Adam", "Łukasz", "Żaneta"]
```

> `sort` **zmienia** oryginalną tablicę. Gdy chcesz zachować oryginał — `toSorted` albo `[...tablica].sort(...)`.

## Łączenie metod (łańcuch)

```js
const najlepsi = uczniowie
  .filter((u) => u.punkty >= 70)
  .toSorted((a, b) => b.punkty - a.punkty)
  .map((u) => `${u.imie} (${u.punkty} pkt)`);

// ["Piotr (95 pkt)", "Ola (88 pkt)", "Ewa (72 pkt)"]
```

## Inne przydatne

```js
[1, [2, [3]]].flat(Infinity)       // [1, 2, 3]
Array.from({ length: 5 }, (_, i) => i + 1)   // [1, 2, 3, 4, 5]
[...new Set([1, 2, 2, 3, 3])]      // [1, 2, 3] — bez duplikatów
```

## Zadanie

Dla tablicy `uczniowie` z tej lekcji:

1. Wypisz imiona uczniów klasy 3B (`filter` + `map`).
2. Oblicz średnią punktów klasy 3A (`filter` + `reduce`).
3. Sprawdź, czy wszyscy mają co najmniej 40 punktów (`every`).
4. Utwórz ranking „1. Piotr — 95 pkt”, … (sortowanie bez zmiany oryginału).
5. Dodaj każdemu uczniowi pole `ocena` (np. ≥ 90 → 5) przez `map`, nie zmieniając oryginalnych obiektów (`{ ...u, ocena }`).
