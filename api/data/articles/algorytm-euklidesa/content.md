**Algorytm Euklidesa** znajduje **największy wspólny dzielnik (NWD)** dwóch liczb. Ma ponad 2000 lat, mieści się w trzech linijkach kodu i jest jednym z najczęstszych algorytmów na maturze z informatyki.

## Idea

NWD liczb `a` i `b` jest taki sam jak NWD liczby mniejszej i **reszty z dzielenia** większej przez mniejszą. Powtarzamy to, aż reszta wyniesie **0** — wtedy wynikiem jest ostatni dzielnik.

Przykład: NWD(48, 18)

| a | b | a % b |
|---|---|---|
| 48 | 18 | 12 |
| 18 | 12 | 6 |
| 12 | 6 | **0** |

Reszta wynosi 0, więc **NWD(48, 18) = 6**.

## Kod w Pythonie

```python
def nwd(a, b):
    while b != 0:
        a, b = b, a % b
    return a

print(nwd(48, 18))   # 6
```

Wersja rekurencyjna — dosłowny zapis idei:

```python
def nwd(a, b):
    if b == 0:
        return a
    return nwd(b, a % b)
```

## Wersja z odejmowaniem

Pierwotna wersja Euklidesa zamiast reszty **odejmuje** mniejszą liczbę od większej, aż obie będą równe:

```python
def nwd_odejmowanie(a, b):
    while a != b:
        if a > b:
            a -= b
        else:
            b -= a
    return a
```

Działa, ale bywa bardzo wolna. Liczba kroków:

| Liczby | Odejmowanie | Reszta z dzielenia (`%`) |
|---|---|---|
| 48 i 18 | 4 | 3 |
| 1071 i 462 | 11 | 3 |
| 1 000 000 i 2 | **499 999** | **1** |

Wersja z `%` nawet dla liczb rzędu miliarda potrzebuje najwyżej kilkudziesięciu kroków — jej złożoność to **O(log n)**. Na maturze, jeśli zadanie nie wymaga wprost odejmowania, używaj wersji z resztą.

## NWW — najmniejsza wspólna wielokrotność

Mając NWD, NWW liczymy ze wzoru `NWW(a, b) = a · b / NWD(a, b)`:

```python
def nww(a, b):
    return a * b // nwd(a, b)

print(nww(12, 18))   # 36
```

Używamy `//`, żeby wynik był liczbą całkowitą.

## Gotowe funkcje

W Pythonie (od wersji 3.9) wszystko jest w module `math`:

```python
import math

print(math.gcd(48, 18))       # 6
print(math.lcm(12, 18))       # 36
print(math.gcd(12, 18, 30))   # 6 — także dla wielu liczb
```

Na maturze możesz z nich korzystać — ale warto umieć napisać algorytm samodzielnie, bo zadania często pytają o jego działanie lub liczbę kroków.

## Zastosowania

- **skracanie ułamków**: 18/48 → dzielimy licznik i mianownik przez NWD = 6 → 3/8,
- **liczby względnie pierwsze** — takie, których NWD = 1 (np. 8 i 15),
- **kryptografia** — rozszerzony algorytm Euklidesa jest częścią szyfru RSA.

Więcej algorytmów na liczbach — dzielniki, liczby pierwsze, sito Eratostenesa, systemy liczbowe — znajdziesz w lekcji 16 kursu [Python od podstaw do matury](/kursy/python-od-podstaw).
