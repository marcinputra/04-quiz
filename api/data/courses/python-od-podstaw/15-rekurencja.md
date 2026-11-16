**Rekurencja** to sytuacja, w której funkcja **wywołuje samą siebie**, rozwiązując mniejszą wersję tego samego problemu. Zadania z rekurencją regularnie pojawiają się na maturze — zarówno do zaprogramowania, jak i do „prześledzenia na kartce”.

## Dwa elementy każdej rekurencji

1. **Przypadek bazowy** — kiedy funkcja kończy działanie bez dalszych wywołań.
2. **Krok rekurencyjny** — wywołanie samej siebie dla **mniejszych** danych.

```python
def silnia(n):
    if n <= 1:                    # przypadek bazowy
        return 1
    return n * silnia(n - 1)      # krok rekurencyjny

print(silnia(5))    # 120
```

Jak to się liczy:

```text
silnia(5) = 5 * silnia(4)
          = 5 * 4 * silnia(3)
          = 5 * 4 * 3 * silnia(2)
          = 5 * 4 * 3 * 2 * silnia(1)
          = 5 * 4 * 3 * 2 * 1 = 120
```

Brak przypadku bazowego kończy się błędem `RecursionError: maximum recursion depth exceeded` — Python domyślnie pozwala na około **1000** zagnieżdżonych wywołań.

## Przykłady

```python
def suma_cyfr(n):
    if n < 10:
        return n
    return n % 10 + suma_cyfr(n // 10)

def potega(a, n):
    if n == 0:
        return 1
    return a * potega(a, n - 1)

def odwroc(s):
    if len(s) <= 1:
        return s
    return odwroc(s[1:]) + s[0]

def nwd(a, b):                     # algorytm Euklidesa
    if b == 0:
        return a
    return nwd(b, a % b)

print(suma_cyfr(9875), potega(2, 10), odwroc("python"), nwd(48, 18))
# 29 1024 nohtyp 6
```

## Ciąg Fibonacciego — pułapka wydajności

```python
def fib(n):
    if n < 2:
        return n
    return fib(n - 1) + fib(n - 2)

print(fib(10))    # 55
```

Kod jest poprawny, ale **bardzo wolny**: `fib(5)` wywołuje `fib(3)` dwa razy, `fib(2)` trzy razy… Liczba wywołań rośnie wykładniczo — `fib(35)` liczy się kilka sekund, a `fib(50)` nie doczekałby się końca.

### Zapamiętywanie wyników (memoizacja)

```python
from functools import lru_cache

@lru_cache(maxsize=None)
def fib(n):
    if n < 2:
        return n
    return fib(n - 1) + fib(n - 2)

print(fib(100))    # 354224848179261915075 — natychmiast
```

### Wersja iteracyjna

Każdą rekurencję da się zamienić na pętlę — często jest szybsza i nie ma limitu głębokości:

```python
def fib_iter(n):
    a, b = 0, 1
    for _ in range(n):
        a, b = b, a + b
    return a
```

## Szybkie potęgowanie

Zamiast mnożyć `n` razy, korzystamy z: `a^n = (a^(n/2))²` dla parzystego `n`:

```python
def szybka_potega(a, n):
    if n == 0:
        return 1
    if n % 2 == 0:
        p = szybka_potega(a, n // 2)
        return p * p
    return a * szybka_potega(a, n - 1)

print(szybka_potega(3, 13))    # 1594323 — tylko kilka mnożeń
```

Liczba kroków rośnie jak `log₂ n` — dla `n = 1 000 000` to około 20–40 mnożeń zamiast miliona. Wbudowane `pow(a, n, m)` liczy tak potęgę **modulo** `m`.

## Wieże Hanoi

Przenieś `n` krążków z kołka A na C, używając B, nigdy nie kładąc większego na mniejszym:

```python
def hanoi(n, skad, dokad, przez):
    if n == 0:
        return
    hanoi(n - 1, skad, przez, dokad)
    print(f"krążek {n}: {skad} → {dokad}")
    hanoi(n - 1, przez, dokad, skad)

hanoi(3, "A", "C", "B")    # 7 ruchów; dla n krążków: 2ⁿ − 1
```

## Śledzenie rekurencji „na kartce”

Typowe zadanie maturalne: *Co zwróci `f(5)`? Ile razy zostanie wywołana funkcja?*

```python
def f(n):
    if n <= 2:
        return 1
    return f(n - 1) + f(n - 2) + 1
```

Rozpisz wartości **od dołu**: `f(1) = 1`, `f(2) = 1`, `f(3) = 1 + 1 + 1 = 3`, `f(4) = 3 + 1 + 1 = 5`, `f(5) = 5 + 3 + 1 = 9`.

Liczbę wywołań sprawdzisz, dodając licznik:

```python
wywolania = 0
def f(n):
    global wywolania
    wywolania += 1
    if n <= 2:
        return 1
    return f(n - 1) + f(n - 2) + 1

print(f(5), wywolania)    # 9 9
```

## Zadanie

1. Napisz rekurencyjnie `suma(lista)` — suma elementów listy.
2. Napisz rekurencyjnie `czy_palindrom(s)`: porównaj pierwszy i ostatni znak, a potem sprawdź środek.
3. Napisz `na_binarny(n)` zwracającą zapis dwójkowy liczby jako tekst (`na_binarny(13)` → `"1101"`).
4. Zmierz `time.perf_counter()` czas `fib(30)` bez i z `@lru_cache`.
5. Rozpisz na kartce wartość `f(6)` z przykładu powyżej, a potem sprawdź programem.
6. Wypisz wszystkie podzbiory zbioru `[1, 2, 3]` rekurencyjnie (dla każdego elementu: „bierzemy” albo „nie bierzemy”).
