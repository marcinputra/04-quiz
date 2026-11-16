## Operatory arytmetyczne

| Operator | Znaczenie | Przykład | Wynik |
|---|---|---|---|
| `+` | dodawanie | `7 + 3` | `10` |
| `-` | odejmowanie | `7 - 3` | `4` |
| `*` | mnożenie | `7 * 3` | `21` |
| `/` | dzielenie | `7 / 2` | `3.5` |
| `%` | reszta z dzielenia (modulo) | `7 % 3` | `1` |
| `**` | potęgowanie | `2 ** 10` | `1024` |

Modulo przydaje się bardzo często:

```js
liczba % 2 === 0   // czy liczba jest parzysta
rok % 4 === 0      // (uproszczony) rok przestępny
i % 3 === 0        // co trzeci element
```

> Liczby w JavaScripcie są zmiennoprzecinkowe: `0.1 + 0.2` daje `0.30000000000000004`. Kwoty pieniędzy przechowuj w **groszach** (liczbach całkowitych) albo zaokrąglaj przy wyświetlaniu.

## Przypisanie i skróty

```js
let punkty = 10;
punkty += 5;   // punkty = punkty + 5  → 15
punkty -= 3;   // → 12
punkty *= 2;   // → 24
punkty /= 4;   // → 6
punkty++;      // → 7 (zwiększ o 1)
punkty--;      // → 6 (zmniejsz o 1)
```

## Porównania

| Operator | Znaczenie |
|---|---|
| `===` | równe (wartość **i typ**) |
| `!==` | różne |
| `>` `<` `>=` `<=` | większe, mniejsze… |
| `==` `!=` | równe/różne **z konwersją typów** — unikaj |

```js
5 === 5      // true
5 === "5"    // false — inne typy
5 == "5"     // true  — "5" zamienione na liczbę
0 == false   // true  — pułapka
null == undefined  // true
```

> Zawsze używaj `===` i `!==`. Operator `==` stosuje zawiłe reguły konwersji i jest źródłem trudnych do znalezienia błędów.

## Operatory logiczne

| Operator | Nazwa | Działanie |
|---|---|---|
| `&&` | i (AND) | `true`, gdy **oba** warunki prawdziwe |
| `\|\|` | lub (OR) | `true`, gdy **co najmniej jeden** prawdziwy |
| `!` | nie (NOT) | odwraca wartość |

```js
const wiek = 17;
const maZgode = true;

wiek >= 18 || maZgode   // true
wiek >= 13 && wiek < 20 // true — nastolatek
!maZgode                // false
```

### Skrócone obliczanie

`&&` i `||` zwracają **jedną z wartości**, a nie zawsze `true`/`false`. Drugi argument jest liczony tylko wtedy, gdy to potrzebne:

```js
const nick = wpisanyNick || "Gość";    // gdy wpisanyNick jest pusty → "Gość"
zalogowany && pokazPanel();            // pokazPanel() wywoła się tylko dla zalogowanego
```

## `??` i `?.` — nowoczesne operatory

```js
const ilosc = 0;
ilosc || 10   // 10 — bo 0 jest „fałszywe”
ilosc ?? 10   // 0  — ?? zastępuje TYLKO null i undefined
```

**Operator `?.`** (*optional chaining*) bezpiecznie sięga do właściwości, które mogą nie istnieć:

```js
const uczen = { imie: "Ola" };
uczen.adres.miasto    // TypeError: Cannot read properties of undefined
uczen.adres?.miasto   // undefined — bez błędu
```

## Operator warunkowy (trójargumentowy)

```js
const wynik = punkty >= 50 ? "zdane" : "niezdane";
```

Składnia: `warunek ? wartośćGdyPrawda : wartośćGdyFałsz`. Dobry do prostych wyborów, przy złożonych użyj `if` (lekcja 4).

## Kolejność działań

Jak w matematyce: najpierw `**`, potem `*` `/` `%`, potem `+` `-`, dalej porównania, `&&`, a na końcu `||` i `??`. W razie wątpliwości **użyj nawiasów** — kod będzie czytelniejszy.

```js
2 + 3 * 4      // 14
(2 + 3) * 4    // 20
```

## Zadanie

1. Zamień 135 minut na godziny i minuty (`Math.floor` i `%`) — wynik: „2 h 15 min”.
2. Sprawdź, czy liczba `n` jest parzysta i podzielna przez 3 jednocześnie.
3. Przewidź wynik: `"3" === 3`, `"3" == 3`, `null ?? "brak"`, `"" || "pusto"`, `0 ?? 5`.
4. Napisz wyrażenie z `? :`, które dla temperatury `t` zwraca „mróz” (poniżej 0) albo „bez mrozu”.
5. Utwórz obiekt `const konto = {}` i wypisz `konto.ustawienia?.motyw ?? "jasny"`.
