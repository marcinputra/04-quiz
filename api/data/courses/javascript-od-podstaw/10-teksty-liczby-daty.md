## Metody tekstów (string)

Teksty są **niezmienne** — każda metoda zwraca **nowy** tekst.

```js
const t = "  JavaScript jest super  ";

t.length                    // 25
t.trim()                    // "JavaScript jest super" — bez spacji na brzegach
t.toUpperCase()             // "  JAVASCRIPT JEST SUPER  "
t.toLowerCase()             // "  javascript jest super  "

const s = "JavaScript";
s[0]                        // "J"
s.at(-1)                    // "t"
s.slice(0, 4)               // "Java"
s.slice(-6)                 // "Script"
s.includes("Script")        // true
s.startsWith("Java")        // true
s.endsWith(".js")           // false
s.indexOf("a")              // 1
s.replace("Java", "Type")   // "TypeScript"
"a-b-c".replaceAll("-", "/")  // "a/b/c"
"ha".repeat(3)              // "hahaha"
"7".padStart(3, "0")        // "007"
"Ala ma kota".split(" ")    // ["Ala", "ma", "kota"]
```

Przykład — pierwsza litera wielka:

```js
const wielka = (tekst) => tekst.charAt(0).toUpperCase() + tekst.slice(1).toLowerCase();
wielka("kRAKÓW");   // "Kraków"
```

### Porównywanie bez wielkości liter

```js
const odpowiedz = "  Warszawa ";
odpowiedz.trim().toLowerCase() === "warszawa"   // true
```

## Liczby

```js
const cena = 19.987;

cena.toFixed(2)           // "19.99" — TEKST z 2 miejscami po przecinku
Math.round(cena)          // 20
Math.floor(cena)          // 19 — w dół
Math.ceil(cena)           // 20 — w górę
Math.trunc(-4.7)          // -4 — odcina część ułamkową

Number.isInteger(5)       // true
Number.isNaN(Number("x")) // true
(1234567.891).toLocaleString("pl-PL")   // "1 234 567,891"
```

Formatowanie kwot:

```js
const zl = new Intl.NumberFormat("pl-PL", { style: "currency", currency: "PLN" });
zl.format(1299.5)   // "1299,50 zł"
```

## Obiekt `Math`

```js
Math.max(3, 8, 1)       // 8
Math.min(...[3, 8, 1])  // 1 — spread tablicy
Math.abs(-5)            // 5
Math.sqrt(16)           // 4
Math.PI                 // 3.141592653589793
Math.random()           // liczba z przedziału [0, 1)
```

Losowa liczba całkowita z zakresu **od `min` do `max` włącznie**:

```js
const losuj = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;

losuj(1, 6);   // rzut kostką
```

Losowe tasowanie tablicy (algorytm Fishera–Yatesa) — np. kolejność pytań w quizie:

```js
function tasuj(tablica) {
  const t = [...tablica];
  for (let i = t.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [t[i], t[j]] = [t[j], t[i]];
  }
  return t;
}
```

## Daty

```js
const teraz = new Date();
const matura = new Date(2027, 4, 5, 9, 0);   // 5 maja 2027, 9:00 — MIESIĄCE OD ZERA!
const zTekstu = new Date("2027-05-05T09:00:00");

teraz.getFullYear()   // np. 2026
teraz.getMonth()      // 0–11 (styczeń = 0)
teraz.getDate()       // dzień miesiąca 1–31
teraz.getDay()        // dzień tygodnia 0–6 (niedziela = 0)
teraz.getHours()
teraz.getTime()       // milisekundy od 1.01.1970 (tzw. timestamp)
Date.now()            // to samo, bez tworzenia obiektu
```

Ile dni do matury:

```js
const roznicaMs = matura - teraz;               // odejmowanie dat daje milisekundy
const dni = Math.ceil(roznicaMs / (1000 * 60 * 60 * 24));
console.log(`Do matury zostało ${dni} dni`);
```

Wyświetlanie po polsku:

```js
matura.toLocaleDateString("pl-PL")   // "5.05.2027"
matura.toLocaleDateString("pl-PL", { weekday: "long", day: "numeric", month: "long", year: "numeric" })
// "środa, 5 maja 2027"
matura.toLocaleTimeString("pl-PL", { hour: "2-digit", minute: "2-digit" })   // "09:00"
```

## Zadanie

1. Napisz `slug(tekst)`: „Kurs JavaScript od podstaw” → „kurs-javascript-od-podstaw” (małe litery, spacje na myślniki).
2. Napisz `czyPalindrom(tekst)`, ignorującą wielkość liter i spacje („Kobyła ma mały bok”).
3. Napisz `losujHaslo(dlugosc)` z liter i cyfr.
4. Wypisz dzisiejszą datę w formacie „poniedziałek, 16 listopada 2026”.
5. Oblicz, ile dni zostało do najbliższych wakacji (np. 27 czerwca).
