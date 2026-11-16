**Pętla** powtarza fragment kodu: dla każdego pytania w quizie, dla każdej liczby od 1 do 100, dopóki użytkownik nie zgadnie hasła.

## Pętla `for`

```js
for (let i = 1; i <= 5; i++) {
  console.log(`Powtórzenie nr ${i}`);
}
```

Trzy części w nawiasie:

1. `let i = 1` — **start** (wykonywany raz),
2. `i <= 5` — **warunek** sprawdzany przed każdym obrotem,
3. `i++` — **krok** wykonywany po każdym obrocie.

```js
// odliczanie
for (let i = 10; i > 0; i--) console.log(i);

// co druga liczba
for (let i = 0; i <= 20; i += 2) console.log(i);

// suma liczb od 1 do 100
let suma = 0;
for (let i = 1; i <= 100; i++) {
  suma += i;
}
console.log(suma);   // 5050
```

## Pętla `while`

Gdy **nie wiesz z góry**, ile będzie powtórzeń:

```js
let liczba = 1;
while (liczba < 1000) {
  liczba *= 2;
}
console.log(liczba);   // 1024
```

## Pętla `do…while`

Wykona się **co najmniej raz**, bo warunek sprawdzany jest na końcu:

```js
let haslo;
do {
  haslo = prompt("Podaj hasło:");
} while (haslo !== "tajne");
```

## `for…of` — po elementach

Najwygodniejszy sposób na przejście po tablicy lub tekście:

```js
const owoce = ["jabłko", "gruszka", "śliwka"];

for (const owoc of owoce) {
  console.log(owoc);
}

for (const litera of "JS") {
  console.log(litera);   // "J", potem "S"
}
```

Gdy potrzebujesz też numeru elementu:

```js
for (const [indeks, owoc] of owoce.entries()) {
  console.log(`${indeks + 1}. ${owoc}`);
}
```

## `for…in` — po kluczach obiektu

```js
const uczen = { imie: "Ola", klasa: "3B", srednia: 4.8 };

for (const klucz in uczen) {
  console.log(`${klucz}: ${uczen[klucz]}`);
}
```

> `for…in` służy do obiektów. Do tablic używaj `for…of` lub metod tablic (lekcja 8).

## `break` i `continue`

```js
for (let i = 1; i <= 10; i++) {
  if (i % 2 === 0) continue;   // pomiń parzyste — przejdź do następnego obrotu
  if (i > 7) break;            // przerwij całą pętlę
  console.log(i);              // 1, 3, 5, 7
}
```

## Pętle zagnieżdżone

```js
// tabliczka mnożenia 1–5
for (let w = 1; w <= 5; w++) {
  let wiersz = "";
  for (let k = 1; k <= 5; k++) {
    wiersz += String(w * k).padStart(4);
  }
  console.log(wiersz);
}
```

## Uwaga na pętlę nieskończoną

```js
let i = 0;
while (i < 5) {
  console.log(i);
  // zapomniane i++ — pętla nigdy się nie skończy i zawiesi kartę!
}
```

Upewnij się, że warunek kiedyś przestanie być spełniony.

## Zadanie

1. Wypisz liczby od 1 do 30, ale zamiast podzielnych przez 3 — „Fizz”, przez 5 — „Buzz”, przez 3 i 5 — „FizzBuzz”.
2. Policz sumę cyfr liczby `98765` pętlą `while` (wskazówka: `% 10` i `Math.floor(n / 10)`).
3. Narysuj w konsoli choinkę z gwiazdek o wysokości 5 (`"*".repeat(n)`).
4. Dla tablicy ocen `[5, 3, 4, 6, 2, 5]` oblicz średnią pętlą `for…of`.
5. Znajdź pierwszą liczbę większą od 100, która jest podzielna przez 7 i 13 — użyj `break`.
