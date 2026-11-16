**Funkcja** to nazwany fragment kodu, który można wywoływać wiele razy. Dzięki funkcjom program jest krótszy, czytelniejszy i łatwiej go poprawiać — a rozwiązanie zadania maturalnego można podzielić na małe, sprawdzalne kroki.

## Definiowanie i wywoływanie

```python
def przywitaj(imie):
    print(f"Cześć, {imie}!")

przywitaj("Ola")     # Cześć, Ola!
przywitaj("Jan")     # Cześć, Jan!
```

- `def`, nazwa, **parametry** w nawiasach i dwukropek,
- wnętrze funkcji jest wcięte,
- funkcję trzeba **zdefiniować przed** jej wywołaniem.

## `return` — zwracanie wyniku

```python
def pole_prostokata(a, b):
    return a * b

p = pole_prostokata(3, 4)
print(p)                          # 12
print(pole_prostokata(2, 5) + 1)  # 11
```

`return` **kończy** działanie funkcji. Funkcja bez `return` zwraca `None`:

```python
wynik = przywitaj("Ola")   # wypisze powitanie
print(wynik)               # None
```

> Różnica: `print` **pokazuje** wartość na ekranie, a `return` **oddaje** ją do dalszych obliczeń. Funkcje liczące coś powinny zwracać wynik, a nie go wypisywać.

### Wiele wartości naraz

```python
def min_max(liczby):
    return min(liczby), max(liczby)    # zwraca krotkę

najmniejsza, najwieksza = min_max([4, 9, 1, 7])
print(najmniejsza, najwieksza)          # 1 9
```

### Wczesny `return`

```python
def czy_pierwsza(n):
    if n < 2:
        return False
    for d in range(2, int(n ** 0.5) + 1):
        if n % d == 0:
            return False      # znaleziono dzielnik — od razu koniec
    return True

print([x for x in range(20) if czy_pierwsza(x)])   # [2, 3, 5, 7, 11, 13, 17, 19]
```

## Parametry

### Wartości domyślne

```python
def potega(podstawa, wykladnik=2):
    return podstawa ** wykladnik

print(potega(5))       # 25
print(potega(2, 10))   # 1024
```

### Argumenty nazwane

```python
def opis(imie, wiek, miasto="Kraków"):
    return f"{imie}, {wiek} lat, {miasto}"

print(opis("Ola", 17))
print(opis(wiek=18, imie="Jan", miasto="Gdańsk"))   # kolejność dowolna
```

### Dowolna liczba argumentów: `*args`

```python
def srednia(*liczby):
    return sum(liczby) / len(liczby)

print(srednia(4, 5, 6))         # 5.0
print(srednia(2, 3, 4, 5, 6))   # 4.0
```

> **Pułapka:** nie używaj listy jako wartości domyślnej (`def f(x=[])`) — ta sama lista jest współdzielona przez wszystkie wywołania. Zamiast tego: `def f(x=None)` i w środku `if x is None: x = []`.

## Zasięg zmiennych

```python
licznik = 0             # zmienna globalna

def zwieksz():
    wynik = licznik + 1     # odczyt globalnej — działa
    return wynik

def zepsuj():
    licznik += 1            # UnboundLocalError — przypisanie tworzy zmienną lokalną

print(zwieksz())   # 1
```

Zmienne utworzone w funkcji są **lokalne** — znikają po jej zakończeniu. Zamiast modyfikować zmienne globalne (`global licznik`), lepiej przekazać wartość jako parametr i zwrócić wynik.

## Dokumentowanie: docstring i podpowiedzi typów

```python
def bmi(masa: float, wzrost: float) -> float:
    """Zwraca wskaźnik BMI. Masa w kg, wzrost w metrach."""
    return round(masa / wzrost ** 2, 1)

print(bmi(60, 1.70))   # 20.8
help(bmi)              # wyświetli opis funkcji
```

Podpowiedzi typów (`: float`, `-> float`) nie są sprawdzane przez Pythona — pomagają czytelnikowi i edytorowi.

## Funkcje wbudowane

Część funkcji jest dostępna od razu:

| Funkcja | Wynik |
|---|---|
| `len(x)` | długość tekstu / liczba elementów |
| `abs(-5)` | `5` |
| `min(3, 8, 1)`, `max([3, 8, 1])` | `1`, `8` |
| `sum([1, 2, 3])` | `6` |
| `round(3.14159, 2)` | `3.14` |
| `pow(2, 10)` | `1024` |
| `divmod(17, 5)` | `(3, 2)` — iloraz i reszta naraz |

## Funkcja `main`

Większe programy warto zbudować z funkcji i jednej funkcji startowej:

```python
def wczytaj_dane():
    return [3, 8, 1, 9]

def oblicz(dane):
    return sum(dane) / len(dane)

def main():
    dane = wczytaj_dane()
    print(f"Średnia: {oblicz(dane)}")

main()
```

## Zadanie

1. Napisz `czy_parzysta(n)` zwracającą `True` lub `False`.
2. Napisz `silnia(n)` z pętlą i sprawdź `silnia(10)` (= 3628800).
3. Napisz `nwd(a, b)` — największy wspólny dzielnik metodą odejmowania: dopóki `a != b`, od większej odejmij mniejszą.
4. Napisz `odwroc_liczbe(n)`, która dla `1234` zwraca `4321` (użyj `%` i `//`, bez zamiany na tekst).
5. Napisz `ocena(punkty, maks=100)` zwracającą ocenę 1–6 według progów procentowych z Twojej szkoły.
6. Sprawdź, co wypisze `print(print("A"))` — i wyjaśnij dlaczego.
