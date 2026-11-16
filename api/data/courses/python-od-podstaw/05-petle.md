Pętle pozwalają **powtarzać** kod: wypisać 100 liczb, przejść po wszystkich liniach pliku, szukać liczby spełniającej warunek. W Pythonie są dwie pętle: `for` i `while`.

## Pętla `for` i `range`

```python
for i in range(5):
    print(i)          # 0 1 2 3 4 — każda w osobnej linii
```

| Zapis | Liczby |
|---|---|
| `range(5)` | 0, 1, 2, 3, 4 |
| `range(2, 6)` | 2, 3, 4, 5 — **koniec nie wchodzi** |
| `range(1, 10, 2)` | 1, 3, 5, 7, 9 — krok 2 |
| `range(10, 0, -1)` | 10, 9, …, 1 — odliczanie w dół |
| `range(10, 0, -3)` | 10, 7, 4, 1 |

```python
suma = 0
for i in range(1, 101):
    suma += i
print(suma)    # 5050
```

### Pętla po elementach

`for` przechodzi po **dowolnej kolekcji** — liście, tekście, linii pliku:

```python
for litera in "kot":
    print(litera)          # k, o, t

for owoc in ["jabłko", "gruszka", "śliwka"]:
    print(owoc.upper())
```

Gdy potrzebny jest też numer elementu — `enumerate`:

```python
for nr, owoc in enumerate(["jabłko", "gruszka"], start=1):
    print(nr, owoc)         # 1 jabłko, 2 gruszka
```

## Pętla `while`

Wykonuje się, **dopóki warunek jest prawdziwy**. Używamy jej, gdy nie wiemy z góry, ile będzie powtórzeń:

```python
liczba = 1
while liczba < 1000:
    liczba *= 2
print(liczba)        # 1024 — pierwsza potęga 2 większa lub równa 1000
```

```python
n = 9875
suma_cyfr = 0
while n > 0:
    suma_cyfr += n % 10    # ostatnia cyfra
    n //= 10               # usuń ostatnią cyfrę
print(suma_cyfr)           # 29
```

> Pamiętaj, żeby w pętli `while` zmieniać zmienną z warunku — inaczej pętla będzie **nieskończona**. Przerwiesz ją klawiszami **Ctrl+C**.

### Wczytywanie do skutku

```python
haslo = ""
while haslo != "python":
    haslo = input("Hasło: ")
print("Zalogowano")
```

## `break` i `continue`

```python
for n in range(1, 100):
    if n % 7 == 0 and n % 5 == 0:
        print("Pierwsza liczba podzielna przez 5 i 7:", n)   # 35
        break            # przerwij całą pętlę

for n in range(10):
    if n % 3 == 0:
        continue         # pomiń resztę obrotu, przejdź do następnego
    print(n)             # 1 2 4 5 7 8
```

### `else` w pętli

Blok `else` po pętli wykonuje się, gdy pętla zakończyła się **bez `break`** — przydaje się przy wyszukiwaniu:

```python
for n in [4, 8, 15, 16]:
    if n % 2 == 1:
        print("Znaleziono nieparzystą:", n)
        break
else:
    print("Brak liczb nieparzystych")
```

## Pętle zagnieżdżone

```python
for i in range(1, 4):
    for j in range(1, 4):
        print(i * j, end="\t")
    print()
```

```text
1	2	3
2	4	6
3	6	9
```

Pętla wewnętrzna wykonuje się w całości przy **każdym** obrocie zewnętrznej (tu 3 × 3 = 9 razy).

## Typowe schematy

```python
liczby = [12, 7, 25, 3, 18]

# zliczanie
parzyste = 0
for x in liczby:
    if x % 2 == 0:
        parzyste += 1

# szukanie maksimum
najwieksza = liczby[0]
for x in liczby:
    if x > najwieksza:
        najwieksza = x

print(parzyste, najwieksza)    # 2 25
```

Te dwa schematy — **licznik** i **maksimum/minimum** — pojawiają się w prawie każdym zadaniu maturalnym.

## Zadanie

1. Wypisz liczby od 1 do 50 podzielne przez 3 lub 5.
2. Oblicz silnię liczby `n` wczytanej z klawiatury (`5! = 120`).
3. Wypisz tabliczkę mnożenia 10 × 10, wyrównując kolumny (`f"{x:4}"`).
4. Wczytuj liczby do momentu wpisania 0; potem wypisz ich sumę, liczbę i średnią.
5. Narysuj z gwiazdek trójkąt o wysokości `n`:

```text
*
**
***
****
```

6. Znajdź najmniejszą liczbę `n`, dla której `1 + 2 + … + n > 1000`.
