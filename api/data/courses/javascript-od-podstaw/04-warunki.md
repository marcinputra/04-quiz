Program często musi **podjąć decyzję**: pokazać panel administratora tylko adminowi, wyświetlić „zdane” albo „niezdane”, ostrzec przed pustym polem formularza.

## `if`, `else if`, `else`

```js
const punkty = 72;

if (punkty >= 90) {
  console.log("celujący");
} else if (punkty >= 75) {
  console.log("bardzo dobry");
} else if (punkty >= 50) {
  console.log("dostateczny");
} else {
  console.log("niezdane");
}
// → "dostateczny"
```

- warunki sprawdzane są **od góry** — wykona się tylko **pierwszy** spełniony blok,
- `else` jest opcjonalny,
- zawsze używaj klamer `{ }`, nawet dla jednej instrukcji.

## Wartości „prawdziwe” i „fałszywe”

W warunku każda wartość jest zamieniana na `true` lub `false`. **Fałszywych** (*falsy*) jest tylko kilka:

| Falsy | |
|---|---|
| `false` | |
| `0`, `-0`, `0n` | zero |
| `""` | pusty tekst |
| `null`, `undefined` | brak wartości |
| `NaN` | nie-liczba |

**Wszystko inne jest prawdziwe** (*truthy*) — także `"0"`, `"false"`, `[]` i `{}`!

```js
const imie = "";
if (!imie) {
  console.log("Podaj imię");   // wykona się — pusty tekst jest falsy
}

const lista = [];
if (lista.length === 0) {       // NIE: if (!lista) — pusta tablica jest truthy
  console.log("Lista jest pusta");
}
```

## Łączenie warunków

```js
const wiek = 16;
const zgodaRodzica = true;

if (wiek >= 18 || (wiek >= 13 && zgodaRodzica)) {
  console.log("Możesz założyć konto");
}
```

## Wczesny powrót — mniej zagnieżdżeń

Zamiast piramidy `if` wewnątrz `if`:

```js
function zapisz(uzytkownik) {
  if (!uzytkownik) return "Brak użytkownika";
  if (!uzytkownik.emailPotwierdzony) return "Potwierdź adres e-mail";
  if (uzytkownik.zablokowany) return "Konto zablokowane";

  return "Zapisano na kurs";
}
```

Każdy warunek „odpada” wcześniej, a główna logika jest na końcu, bez wcięć. Funkcje poznasz w lekcji 6.

## `switch`

Gdy porównujesz **jedną wartość** z wieloma możliwościami:

```js
const dzien = 6;

switch (dzien) {
  case 6:
  case 7:
    console.log("weekend");
    break;
  case 5:
    console.log("piątek!");
    break;
  default:
    console.log("dzień roboczy");
}
```

- `switch` porównuje przez `===`,
- **`break` jest konieczny** — bez niego wykonają się też kolejne `case` (tu celowo: 6 i 7 dają „weekend”),
- `default` działa jak `else`.

## Obiekt zamiast długiego `switch`

```js
const ocenySlownie = { 6: "celujący", 5: "bardzo dobry", 4: "dobry", 3: "dostateczny", 2: "dopuszczający", 1: "niedostateczny" };

console.log(ocenySlownie[5] ?? "nieznana ocena");   // "bardzo dobry"
```

## Zadanie

1. Dla zmiennej `temperatura` wypisz: „mróz” (< 0), „zimno” (0–10), „przyjemnie” (11–24), „upał” (≥ 25).
2. Rok przestępny: podzielny przez 4 i niepodzielny przez 100 **albo** podzielny przez 400. Sprawdź lata 1900, 2000, 2024, 2026.
3. Przy pomocy `switch` wypisz nazwę miesiąca dla liczby 1–12, a dla innej — „błędny miesiąc”.
4. Sprawdź, które z wartości są truthy: `"0"`, `0`, `" "`, `[]`, `null`, `"false"`.
5. Przepisz zadanie 1 tak, aby zamiast `if` użyć funkcji z wczesnym `return`.
