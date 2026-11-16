**Funkcja** to nazwany fragment kodu, który możesz wywołać wiele razy. Funkcje dzielą program na małe, zrozumiałe kawałki i pozwalają nie powtarzać kodu.

## Deklaracja funkcji

```js
function przywitaj(imie) {
  return `Cześć, ${imie}!`;
}

console.log(przywitaj("Ola"));   // "Cześć, Ola!"
console.log(przywitaj("Jan"));   // "Cześć, Jan!"
```

- `imie` to **parametr** — zmienna dostępna wewnątrz funkcji,
- `"Ola"` to **argument** — konkretna wartość przekazana przy wywołaniu,
- `return` **zwraca wynik** i natychmiast kończy funkcję.

Funkcja bez `return` zwraca `undefined`.

## Wyrażenie funkcyjne i funkcja strzałkowa

```js
// wyrażenie funkcyjne
const kwadrat = function (x) {
  return x * x;
};

// funkcja strzałkowa (arrow function)
const szescian = (x) => {
  return x ** 3;
};

// krótka forma — jedno wyrażenie, return jest domyślny
const podwoj = (x) => x * 2;
const suma = (a, b) => a + b;
const losowa = () => Math.random();

console.log(podwoj(21));   // 42
```

> Gdy krótka funkcja strzałkowa ma zwrócić **obiekt**, otocz go nawiasami: `const utworz = (imie) => ({ imie, punkty: 0 });`

## Parametry domyślne i reszta parametrów

```js
function powitanie(imie = "Gość", jezyk = "pl") {
  return jezyk === "pl" ? `Witaj, ${imie}` : `Hello, ${imie}`;
}

powitanie();             // "Witaj, Gość"
powitanie("Ola", "en");  // "Hello, Ola"

// dowolna liczba argumentów
function srednia(...liczby) {
  let suma = 0;
  for (const n of liczby) suma += n;
  return liczby.length ? suma / liczby.length : 0;
}

srednia(4, 5, 6);   // 5
```

## Funkcje jako wartości

Funkcja to zwykła wartość — możesz ją zapisać w zmiennej, przekazać jako argument albo zwrócić z innej funkcji:

```js
function powtorz(ile, akcja) {
  for (let i = 0; i < ile; i++) akcja(i);
}

powtorz(3, (i) => console.log(`krok ${i}`));
```

Funkcję przekazaną jako argument nazywamy **callbackiem** (*funkcją zwrotną*). Na tej zasadzie działają zdarzenia (lekcja 12) i metody tablic (lekcja 8).

## Zakres zmiennych — wstęp

```js
const globalna = "widoczna wszędzie";

function test() {
  const lokalna = "widoczna tylko w funkcji";
  console.log(globalna);   // OK
}

test();
console.log(lokalna);      // ReferenceError: lokalna is not defined
```

Zmienne utworzone wewnątrz funkcji (i wewnątrz każdego bloku `{ }`) **nie są widoczne na zewnątrz**. Więcej — w lekcji 14.

## Dobre funkcje

- robią **jedną rzecz** i mają nazwę z czasownikiem: `obliczSrednia`, `pokazBlad`, `czyPelnoletni`,
- funkcje zwracające `true`/`false` nazywaj od `czy…`/`is…`,
- zamiast zmieniać zmienne globalne — **przyjmują parametry i zwracają wynik** (tzw. *funkcje czyste*),
- są krótkie — jeśli funkcja ma 50 linii, podziel ją.

```js
// czysta funkcja — ten sam argument zawsze daje ten sam wynik
const brutto = (netto, vat = 0.23) => Math.round(netto * (1 + vat) * 100) / 100;

brutto(100);   // 123
```

## Rekurencja

Funkcja może wywołać **samą siebie**. Musi mieć warunek zakończenia:

```js
function silnia(n) {
  if (n <= 1) return 1;          // warunek stopu
  return n * silnia(n - 1);
}

silnia(5);   // 120
```

## Zadanie

1. Napisz `czyPelnoletni(wiek)`, zwracającą `true` lub `false`.
2. Napisz `poleKola(r)` jako funkcję strzałkową; wynik zaokrąglij do 2 miejsc (`toFixed(2)` lub `Math.round`).
3. Napisz `maksimum(...liczby)` bez użycia `Math.max`.
4. Napisz `ocena(punkty, maks = 100)`, zwracającą ocenę szkolną według progów procentowych.
5. Napisz rekurencyjną funkcję `fibonacci(n)` i wypisz pierwsze 10 wyrazów ciągu.
