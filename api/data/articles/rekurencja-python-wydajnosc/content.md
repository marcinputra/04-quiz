**Rekurencja** to sytuacja, w której funkcja wywołuje samą siebie dla mniejszego problemu. Kod bywa dzięki niej krótki i elegancki — ale potrafi też być **katastrofalnie wolny**. Pokazujemy, skąd się to bierze i jak to naprawić, na pomiarach w Pythonie.

## Jak działa rekurencja

Każda funkcja rekurencyjna potrzebuje dwóch elementów:

1. **przypadku bazowego** — kiedy kończymy bez dalszych wywołań,
2. **kroku rekurencyjnego** — wywołania dla mniejszych danych.

```python
def silnia(n):
    if n <= 1:                 # przypadek bazowy
        return 1
    return n * silnia(n - 1)   # krok rekurencyjny

print(silnia(5))   # 120
```

`silnia(5)` wywołuje `silnia(4)`, ta `silnia(3)` itd. — razem **5 wywołań**, czyli tyle, ile wynosi `n`. To rekurencja **liniowa** i jest szybka.

## Problem: ciąg Fibonacciego

```python
def fib(n):
    if n < 2:
        return n
    return fib(n - 1) + fib(n - 2)
```

Zapis wygląda niewinnie, ale każde wywołanie uruchamia **dwa** kolejne. Te same wartości są liczone wiele razy — `fib(5)` liczy `fib(2)` aż trzy razy:

```text
                fib(5)
           /            \
       fib(4)          fib(3)
       /    \          /    \
   fib(3)  fib(2)   fib(2)  fib(1)
   /   \
fib(2) fib(1)
```

Pomiar (Python 3.14):

| n | liczba wywołań | czas |
|---|---|---|
| 20 | 21 891 | 0,001 s |
| 25 | 242 785 | 0,014 s |
| 30 | 2 692 537 | 0,15 s |
| 32 | 7 049 155 | 0,39 s |

Każde zwiększenie `n` o 1 to około **1,6 razy** więcej pracy — złożoność jest **wykładnicza**. Dla `n = 40` byłoby to już ponad **331 milionów** wywołań, a dla `n = 100` program nie skończyłby się do końca świata.

## Rozwiązanie 1: zapamiętywanie wyników (memoizacja)

Skoro te same wartości liczymy wielokrotnie — zapamiętajmy je. W Pythonie wystarczy jeden dekorator:

```python
from functools import lru_cache

@lru_cache(maxsize=None)
def fib(n):
    if n < 2:
        return n
    return fib(n - 1) + fib(n - 2)
```

Teraz każda wartość liczona jest **tylko raz**: `fib(30)` zajmuje ok. **0,00004 s** zamiast 0,15 s — kilka tysięcy razy szybciej. Złożoność spada z wykładniczej do **liniowej**.

## Rozwiązanie 2: pętla

Ciąg Fibonacciego można policzyć od dołu, pamiętając tylko dwie ostatnie liczby:

```python
def fib_iter(n):
    a, b = 0, 1
    for _ in range(n):
        a, b = b, a + b
    return a
```

`fib_iter(30)` trwa ok. **0,0000006 s**, a nawet `fib_iter(5000)` — liczba z 1045 cyframi — liczy się w **0,35 ms**.

## Limit głębokości rekurencji

Każde wywołanie zajmuje miejsce na **stosie wywołań**. Python domyślnie pozwala na około **1000** zagnieżdżonych wywołań:

```python
silnia(5000)
# RecursionError: maximum recursion depth exceeded
```

Ten sam błąd dostaniemy dla `fib(5000)` z `@lru_cache` — memoizacja przyspiesza, ale **nie zmniejsza głębokości**. Limit można podnieść (`sys.setrecursionlimit`), ale przy dużych danych lepiej po prostu użyć pętli. Python, w przeciwieństwie do niektórych języków, nie optymalizuje rekurencji ogonowej.

## Kiedy rekurencja jest szybka: dziel i zwyciężaj

Rekurencja nie jest z natury wolna. Jeśli każde wywołanie **dzieli problem na pół**, liczba kroków rośnie bardzo wolno. Przykład — szybkie potęgowanie, oparte na wzorze `aⁿ = (aⁿᐟ²)²`:

```python
def szybka_potega(a, n):
    if n == 0:
        return 1
    if n % 2 == 0:
        p = szybka_potega(a, n // 2)
        return p * p
    return a * szybka_potega(a, n - 1)
```

| Obliczenie | Zwykła rekurencja (`a * potega(a, n - 1)`) | Szybkie potęgowanie |
|---|---|---|
| 2 do potęgi 900 | 900 wywołań, ok. 150 µs | **14 wywołań**, ok. 1 µs |
| 3 do potęgi milion | przekroczony limit rekurencji | **27 wywołań** |

To złożoność **logarytmiczna** — tak samo działają wyszukiwanie binarne i sortowanie przez scalanie.

## Podsumowanie

| Algorytm | Złożoność | Uwagi |
|---|---|---|
| silnia rekurencyjna | O(n) | szybka, ale limit ~1000 wywołań |
| Fibonacci rekurencyjny | O(1,6ⁿ) | powtarza obliczenia — nie używać |
| Fibonacci z `@lru_cache` | O(n) | prosta poprawka, nadal limit głębokości |
| Fibonacci w pętli | O(n) | najszybszy, bez limitu |
| szybkie potęgowanie | O(log n) | rekurencja w najlepszym wydaniu |

Zasady na co dzień i na maturę:

- jeśli funkcja wywołuje się **więcej niż raz** — sprawdź, czy nie liczy tych samych wartości (wtedy memoizacja),
- jeśli głębokość może przekroczyć **~1000** — zamień rekurencję na pętlę,
- rekurencja jest najlepsza tam, gdzie problem **dzieli się na mniejsze części** (drzewa, dziel i zwyciężaj, przeszukiwanie z nawrotami).

Czasy pochodzą z jednego komputera — u Ciebie będą inne, ale **proporcje** pozostaną takie same. Sprawdź je sam, mierząc `time.perf_counter()`. Więcej przykładów znajdziesz w lekcji o rekurencji w kursie [Python od podstaw do matury](/kursy/python-od-podstaw).
