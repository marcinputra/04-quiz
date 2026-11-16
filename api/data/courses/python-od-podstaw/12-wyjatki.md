Gdy coś pójdzie nie tak — użytkownik wpisze literę zamiast liczby albo zabraknie pliku — Python zgłasza **wyjątek** i przerywa program. Wyjątki można jednak **przechwycić** i obsłużyć tak, żeby program działał dalej.

## Najczęstsze wyjątki

| Wyjątek | Przyczyna | Przykład |
|---|---|---|
| `SyntaxError` | błąd składni — program się nie uruchomi | brak `:` po `if` |
| `IndentationError` | złe wcięcie | pomieszane spacje i tabulatory |
| `NameError` | nieznana nazwa | literówka: `pirnt` |
| `TypeError` | operacja na złym typie | `"5" + 3` |
| `ValueError` | dobry typ, zła wartość | `int("abc")` |
| `ZeroDivisionError` | dzielenie przez zero | `10 / 0` |
| `IndexError` | indeks poza zakresem | `[1, 2][5]` |
| `KeyError` | brak klucza w słowniku | `{"a": 1}["b"]` |
| `FileNotFoundError` | brak pliku | `open("brak.txt")` |
| `AttributeError` | brak metody/atrybutu | `[1, 2].upper()` |

## `try` … `except`

```python
try:
    wiek = int(input("Ile masz lat? "))
    print(f"Za 10 lat będziesz mieć {wiek + 10} lat")
except ValueError:
    print("To nie jest liczba całkowita!")

print("Program działa dalej")
```

- kod w `try` wykonuje się do **pierwszego błędu**,
- jeśli błąd pasuje do `except`, wykonuje się blok obsługi,
- jeśli nie pasuje — program przerywa się jak zwykle.

### Kilka rodzajów błędów

```python
try:
    a = int(input("a = "))
    b = int(input("b = "))
    print(a / b)
except ValueError:
    print("Podaj liczby całkowite")
except ZeroDivisionError:
    print("Nie dziel przez zero")
```

Kilka wyjątków w jednym bloku: `except (ValueError, ZeroDivisionError):`.

### Treść błędu: `as`

```python
try:
    int("dwa")
except ValueError as e:
    print("Błąd:", e)       # Błąd: invalid literal for int() with base 10: 'dwa'
```

### `else` i `finally`

```python
try:
    plik = open("dane.txt")
except FileNotFoundError:
    print("Brak pliku dane.txt")
else:
    print(plik.read())       # tylko gdy NIE było błędu
    plik.close()
finally:
    print("Koniec próby")    # ZAWSZE — po błędzie i bez błędu
```

> Nie pisz samego `except:` bez nazwy wyjątku — przechwyci też Twoje literówki (`NameError`) i przerwanie Ctrl+C, a błąd będzie trudno znaleźć. Łap tylko to, co wiesz, jak obsłużyć.

## Wczytywanie do skutku

```python
def wczytaj_liczbe(komunikat, minimum, maksimum):
    while True:
        try:
            n = int(input(komunikat))
        except ValueError:
            print("To nie jest liczba.")
            continue
        if minimum <= n <= maksimum:
            return n
        print(f"Podaj liczbę od {minimum} do {maksimum}.")

ocena = wczytaj_liczbe("Ocena (1–6): ", 1, 6)
```

## Zgłaszanie własnych błędów: `raise`

```python
def pierwiastek(x):
    if x < 0:
        raise ValueError("Liczba nie może być ujemna")
    return x ** 0.5

try:
    pierwiastek(-4)
except ValueError as e:
    print(e)      # Liczba nie może być ujemna
```

### Własne klasy wyjątków

```python
class BrakSrodkow(Exception):
    pass

def wyplac(saldo, kwota):
    if kwota > saldo:
        raise BrakSrodkow(f"Brakuje {kwota - saldo} zł")
    return saldo - kwota
```

(Klasy i dziedziczenie omówimy w lekcji 14.)

## `assert` — sprawdzanie założeń

```python
def srednia(liczby):
    assert len(liczby) > 0, "Lista nie może być pusta"
    return sum(liczby) / len(liczby)
```

`assert` przydaje się do **testowania własnego kodu**:

```python
assert srednia([2, 4]) == 3
assert srednia([5]) == 5
print("Testy zaliczone")
```

## Debugowanie

- **`print` kontrolny** — `print(f"{i=} {suma=}")` w pętli pokazuje, jak zmieniają się wartości,
- **debugger** w IDLE (*Debug → Debugger*), VS Code lub PyCharm — punkt przerwania (*breakpoint*) przy numerze linii i wykonywanie krok po kroku,
- **test na małych danych** — na maturze najpierw uruchom program na pliku przykładowym (np. `przyklad.txt`), dla którego znasz odpowiedź, a dopiero potem na pełnych danych.

## Zadanie

1. Napisz kalkulator dzielenia, który obsługuje błędne dane i dzielenie przez zero.
2. Napisz funkcję `wczytaj_plik(nazwa)`, która zwraca listę linii albo pustą listę i komunikat, gdy pliku nie ma.
3. Z listy napisów `["4", "x", "7", "", "2.5", "10"]` utwórz listę liczb całkowitych, pomijając błędne wartości.
4. Napisz funkcję `ustaw_wiek(wiek)`, która zgłasza `TypeError` dla nie-liczb i `ValueError` dla wieku spoza 0–130.
5. Dopisz `assert`-y testujące funkcje `silnia` i `nwd` z lekcji 6.
