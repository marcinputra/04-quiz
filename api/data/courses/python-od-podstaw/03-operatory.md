Operatory pozwalają liczyć, porównywać i łączyć warunki. W zadaniach maturalnych najczęściej przydają się **dzielenie całkowite** `//` i **reszta z dzielenia** `%`.

## Operatory arytmetyczne

| Operator | Działanie | Przykład | Wynik |
|---|---|---|---|
| `+` | dodawanie | `7 + 2` | `9` |
| `-` | odejmowanie | `7 - 2` | `5` |
| `*` | mnożenie | `7 * 2` | `14` |
| `/` | dzielenie (zawsze `float`) | `7 / 2` | `3.5` |
| `//` | dzielenie całkowite | `7 // 2` | `3` |
| `%` | reszta z dzielenia (modulo) | `7 % 2` | `1` |
| `**` | potęgowanie | `7 ** 2` | `49` |

```python
print(10 / 2)      # 5.0 — wynik / to zawsze float
print(10 // 3)     # 3
print(10 % 3)      # 1
print(2 ** 0.5)    # 1.4142135623730951 — pierwiastek kwadratowy
```

> Uwaga na liczby ujemne: `//` zaokrągla **w dół** (do minus nieskończoności), więc `-7 // 2` to `-4`, a `-7 % 2` to `1`.

### Typowe zastosowania `//` i `%`

```python
n = 12345
print(n % 10)        # 5    — ostatnia cyfra
print(n // 10)       # 1234 — liczba bez ostatniej cyfry
print(n % 2 == 0)    # False — czy parzysta?

minuty = 135
print(minuty // 60, minuty % 60)   # 2 15 — 2 godziny i 15 minut
```

### Kolejność działań

Najpierw `**`, potem `*`, `/`, `//`, `%`, na końcu `+` i `-`. W razie wątpliwości używaj nawiasów:

```python
print(2 + 3 * 4)      # 14
print((2 + 3) * 4)    # 20
print(-2 ** 2)        # -4 — potęgowanie przed minusem!
print((-2) ** 2)      # 4
```

### Operatory przypisania

```python
x = 10
x += 5     # x = x + 5   → 15
x -= 3     # → 12
x *= 2     # → 24
x //= 5    # → 4
x **= 3    # → 64
x %= 10    # → 4
```

W Pythonie **nie ma** `x++` ani `x--`.

## Liczby zmiennoprzecinkowe

```python
print(0.1 + 0.2)            # 0.30000000000000004
print(0.1 + 0.2 == 0.3)     # False!
print(round(0.1 + 0.2, 2))  # 0.3
```

Komputer zapisuje ułamki w systemie dwójkowym, więc niektóre są przybliżone. Do porównań używaj zaokrąglenia albo `math.isclose(a, b)`.

`round` stosuje **zaokrąglenie bankierskie** — połówki zaokrągla do liczby parzystej: `round(2.5)` → `2`, `round(3.5)` → `4`.

## Operatory porównania

| Operator | Znaczenie |
|---|---|
| `==` | równe |
| `!=` | różne |
| `<`, `>` | mniejsze, większe |
| `<=`, `>=` | mniejsze lub równe, większe lub równe |

```python
print(5 == 5.0)        # True
print("a" < "b")       # True — teksty porównywane alfabetycznie (kodami znaków)
print("Z" < "a")       # True — wielkie litery mają mniejsze kody niż małe

x = 5
print(1 < x < 10)      # łączenie porównań — jak w matematyce
```

Łańcuch `1 < x < 10` oznacza `1 < x and x < 10` — w wielu innych językach tak się nie da.

## Operatory logiczne

| Operator | Znaczenie | Przykład |
|---|---|---|
| `and` | i — oba warunki prawdziwe | `wiek >= 18 and ma_dowod` |
| `or` | lub — co najmniej jeden | `dzien == "sob" or dzien == "nd"` |
| `not` | zaprzeczenie | `not zalogowany` |

```python
x = 15
print(x % 3 == 0 and x % 5 == 0)   # True — podzielna przez 3 i przez 5
print(not x > 10)                  # False
```

Python oblicza warunki **leniwie**: w `a and b`, gdy `a` jest fałszywe, `b` nie jest już sprawdzane. Dlatego bezpieczny jest zapis `y != 0 and x / y > 2`.

## Operatory `in` i `is`

```python
print("a" in "kot")         # False — czy tekst zawiera fragment
print(3 in [1, 2, 3])       # True  — czy lista zawiera element
wynik = None
print(wynik is None)        # True — sprawdzanie None zawsze przez is
```

## Zadanie

1. Wczytaj liczbę sekund i wypisz ją w formacie `godziny:minuty:sekundy` (użyj `//` i `%`).
2. Wczytaj liczbę trzycyfrową i wypisz sumę jej cyfr.
3. Sprawdź, czy rok jest przestępny: podzielny przez 4 i niepodzielny przez 100 **lub** podzielny przez 400. Przetestuj lata 2024, 1900, 2000.
4. Przewidź, a potem sprawdź wyniki: `17 // 5`, `17 % 5`, `-17 // 5`, `2 ** 3 ** 2`, `7 / 7`.
5. Oblicz pole koła o promieniu wczytanym z klawiatury i wypisz je z dokładnością do 2 miejsc po przecinku.
