W codziennej pracy wystarczy `sorted()`, ale na maturze trzeba **znać i rozumieć** klasyczne algorytmy sortowania i wyszukiwania oraz umieć ocenić ich **złożoność**.

## Złożoność obliczeniowa

Złożoność mówi, jak rośnie liczba operacji, gdy rośnie rozmiar danych `n`:

| Złożoność | Nazwa | Przykład | `n = 1 000 000` |
|---|---|---|---|
| `O(1)` | stała | odczyt `lista[i]`, `x in zbior` | 1 |
| `O(log n)` | logarytmiczna | wyszukiwanie binarne | ~20 |
| `O(n)` | liniowa | szukanie maksimum, `x in lista` | 10⁶ |
| `O(n log n)` | liniowo-logarytmiczna | `sorted()`, sortowanie przez scalanie | ~2·10⁷ |
| `O(n²)` | kwadratowa | sortowanie bąbelkowe, dwie zagnieżdżone pętle | 10¹² — za wolno! |

> Python wykonuje rzędu **10–50 milionów** prostych operacji na sekundę. Algorytm `O(n²)` dla 100 000 liczb (10¹⁰ operacji) liczyłby się kilka minut — trzeba wtedy szukać lepszego.

## Sortowanie bąbelkowe

Porównujemy sąsiednie elementy i zamieniamy je, jeśli są w złej kolejności. Po każdym przebiegu największy element „wypływa” na koniec.

```python
def babelkowe(t):
    t = t.copy()
    n = len(t)
    for i in range(n - 1):
        zamiana = False
        for j in range(n - 1 - i):
            if t[j] > t[j + 1]:
                t[j], t[j + 1] = t[j + 1], t[j]
                zamiana = True
        if not zamiana:         # brak zamian — już posortowane
            break
    return t

print(babelkowe([5, 2, 9, 1, 7]))    # [1, 2, 5, 7, 9]
```

Złożoność: **O(n²)**, dla posortowanych danych (z flagą `zamiana`) — **O(n)**.

## Sortowanie przez wybieranie

W każdym kroku znajdujemy najmniejszy element z nieposortowanej części i stawiamy go na początku:

```python
def wybieranie(t):
    t = t.copy()
    for i in range(len(t) - 1):
        m = i
        for j in range(i + 1, len(t)):
            if t[j] < t[m]:
                m = j
        t[i], t[m] = t[m], t[i]
    return t
```

Złożoność: zawsze **O(n²)**, ale tylko `n − 1` zamian.

## Sortowanie przez wstawianie

Jak przy układaniu kart w ręce: każdy kolejny element wstawiamy w odpowiednie miejsce posortowanej części.

```python
def wstawianie(t):
    t = t.copy()
    for i in range(1, len(t)):
        x = t[i]
        j = i - 1
        while j >= 0 and t[j] > x:
            t[j + 1] = t[j]       # przesuń większe w prawo
            j -= 1
        t[j + 1] = x
    return t
```

Złożoność: **O(n²)**, dla prawie posortowanych danych — prawie **O(n)**.

## Sortowanie przez scalanie (merge sort)

Metoda **„dziel i zwyciężaj”**: dzielimy listę na połowy, sortujemy każdą rekurencyjnie i **scalamy** dwie posortowane listy.

```python
def scalanie(t):
    if len(t) <= 1:
        return t
    srodek = len(t) // 2
    lewa = scalanie(t[:srodek])
    prawa = scalanie(t[srodek:])

    wynik = []
    i = j = 0
    while i < len(lewa) and j < len(prawa):
        if lewa[i] <= prawa[j]:
            wynik.append(lewa[i]); i += 1
        else:
            wynik.append(prawa[j]); j += 1
    return wynik + lewa[i:] + prawa[j:]

print(scalanie([38, 27, 43, 3, 9, 82, 10]))   # [3, 9, 10, 27, 38, 43, 82]
```

Złożoność: **O(n log n)** zawsze.

## Sortowanie przez zliczanie

Gdy wartości są **małymi liczbami całkowitymi** (np. oceny 1–6, punkty 0–100), można je po prostu policzyć:

```python
def zliczanie(t, maks):
    licz = [0] * (maks + 1)
    for x in t:
        licz[x] += 1
    wynik = []
    for wartosc, ile in enumerate(licz):
        wynik.extend([wartosc] * ile)
    return wynik

print(zliczanie([3, 6, 1, 3, 5, 1, 6], 6))   # [1, 1, 3, 3, 5, 6, 6]
```

Złożoność: **O(n + k)**, gdzie `k` to zakres wartości.

## Wyszukiwanie liniowe

```python
def szukaj(t, x):
    for i, el in enumerate(t):
        if el == x:
            return i
    return -1
```

Złożoność **O(n)** — działa dla dowolnej listy.

## Wyszukiwanie binarne

Działa tylko na **posortowanej** liście: sprawdzamy środek i odrzucamy połowę, w której szukanej wartości na pewno nie ma.

```python
def binarne(t, x):
    lewy, prawy = 0, len(t) - 1
    while lewy <= prawy:
        srodek = (lewy + prawy) // 2
        if t[srodek] == x:
            return srodek
        if t[srodek] < x:
            lewy = srodek + 1
        else:
            prawy = srodek - 1
    return -1

t = [2, 5, 8, 12, 16, 23, 38, 56, 72, 91]
print(binarne(t, 23), binarne(t, 7))    # 5 -1
```

Złożoność **O(log n)** — dla miliona elementów wystarczy około 20 porównań.

Moduł `bisect` robi to samo:

```python
import bisect
print(bisect.bisect_left(t, 23))   # 5 — pozycja, na której 23 jest / powinno być
print(bisect.bisect_left(t, 7))    # 2 — tu należałoby wstawić 7
```

### Wyszukiwanie binarne „po odpowiedzi”

Ta sama idea pozwala znaleźć np. pierwiastek całkowity albo najmniejszą wartość spełniającą warunek monotoniczny:

```python
def isqrt(n):
    lewy, prawy = 0, n
    while lewy < prawy:
        srodek = (lewy + prawy + 1) // 2
        if srodek * srodek <= n:
            lewy = srodek
        else:
            prawy = srodek - 1
    return lewy

print(isqrt(1000))    # 31
```

## Porównanie

| Algorytm | Najgorszy przypadek | Uwagi |
|---|---|---|
| bąbelkowe | O(n²) | proste, wolne |
| przez wybieranie | O(n²) | mało zamian |
| przez wstawianie | O(n²) | szybkie dla prawie posortowanych |
| przez scalanie | O(n log n) | rekurencja, dodatkowa pamięć |
| przez zliczanie | O(n + k) | tylko małe liczby całkowite |
| `sorted()` (Timsort) | O(n log n) | **używaj w praktyce** |

## Zadanie

1. Dodaj do `babelkowe` licznik porównań i zamian; porównaj wyniki dla listy losowej, posortowanej i odwrotnie posortowanej.
2. Zmierz `time.perf_counter()` czas sortowania 5000 losowych liczb bąbelkowo, przez scalanie i przez `sorted()`.
3. Napisz wyszukiwanie binarne zwracające **pierwsze** wystąpienie wartości, która może się powtarzać.
4. Posortuj listę napisów według długości własnym sortowaniem przez wstawianie.
5. Scal dwie posortowane listy w jedną posortowaną bez używania `sorted` — w czasie O(n).
6. W posortowanej liście znajdź parę liczb o sumie `S` metodą dwóch wskaźników (od początku i od końca).
