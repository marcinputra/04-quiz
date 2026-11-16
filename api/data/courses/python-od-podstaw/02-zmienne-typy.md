**Zmienna** to nazwa, pod którą program zapamiętuje wartość. W Pythonie nie deklaruje się typu zmiennej — wystarczy przypisanie, a typ wynika z wartości.

## Przypisanie

```python
imie = "Ola"
wiek = 17
srednia = 4.75
zdala = True

wiek = wiek + 1      # nowa wartość: 18
wiek += 1            # skrót: 19
```

Kilka przypisań naraz:

```python
x, y = 3, 5
x, y = y, x          # zamiana wartości bez zmiennej pomocniczej
print(x, y)          # 5 3

a = b = 0            # obie zmienne równe 0
```

### Zasady nazywania

- litery, cyfry i `_`; **nie może zaczynać się od cyfry**: `liczba1` ✔, `1liczba` ✘,
- wielkość liter ma znaczenie: `wynik` i `Wynik` to dwie różne zmienne,
- nie wolno używać słów kluczowych (`if`, `for`, `class`, `def`…),
- konwencja w Pythonie: **snake_case** — `liczba_uczniow`, `max_wynik`,
- stałe (wartości, których nie zmieniamy) zapisuje się wielkimi literami: `MAX_PUNKTOW = 50`.

## Podstawowe typy danych

| Typ | Nazwa | Przykłady |
|---|---|---|
| `int` | liczba całkowita | `0`, `-7`, `1_000_000` |
| `float` | liczba zmiennoprzecinkowa | `3.14`, `-0.5`, `2e3` (= 2000.0) |
| `str` | tekst (napis) | `"Ala"`, `'ma kota'`, `""` |
| `bool` | wartość logiczna | `True`, `False` |
| `NoneType` | „brak wartości” | `None` |

```python
print(type(42))        # <class 'int'>
print(type(4.0))       # <class 'float'>
print(type("42"))      # <class 'str'>
print(type(True))      # <class 'bool'>
print(type(None))      # <class 'NoneType'>
```

Liczby całkowite w Pythonie **nie mają limitu wielkości** — `2 ** 200` policzy się dokładnie. To duża zaleta na maturze w porównaniu z C++.

## Napisy

```python
a = "cudzysłów podwójny"
b = 'pojedynczy — działa tak samo'
c = """tekst
w kilku liniach"""

print("Ala" + " ma kota")   # łączenie: Ala ma kota
print("ha" * 3)             # powtórzenie: hahaha
print(len("Python"))        # długość: 6
```

### f-stringi — wstawianie wartości do tekstu

```python
imie = "Ola"
punkty = 43
print(f"{imie} zdobyła {punkty} pkt")             # Ola zdobyła 43 pkt
print(f"Procent: {punkty / 50 * 100:.1f}%")      # Procent: 86.0%
print(f"{punkty=}")                             # punkty=43 — przydatne przy debugowaniu
```

Po dwukropku można podać format: `:.2f` — dwa miejsca po przecinku, `:5` — szerokość 5 znaków, `:05` — dopełnienie zerami.

## Konwersja typów

```python
int("17")        # 17
float("3.5")     # 3.5
str(42)          # "42"
int(3.99)        # 3  — obcina część ułamkową (nie zaokrągla!)
round(3.5)       # 4
bool(0)          # False
bool("tekst")    # True
int("3.5")       # ValueError — tekst nie jest liczbą całkowitą
```

### Wczytywanie liczb

`input` zawsze zwraca tekst, więc liczby trzeba zamienić:

```python
wiek = int(input("Ile masz lat? "))
wzrost = float(input("Wzrost w metrach: "))

print(f"Za 5 lat będziesz mieć {wiek + 5} lat")
```

Bez `int(...)` wynikiem `"17" + 5` byłby błąd `TypeError`, bo nie da się dodać tekstu i liczby.

Kilka liczb w jednej linii (np. `3 7`):

```python
a, b = map(int, input().split())
```

## Wartości logiczne

Każdą wartość da się zamienić na `bool`. **Fałszywe** są:

- `False`, `None`,
- zero: `0`, `0.0`,
- puste kolekcje: `""`, `[]`, `{}`, `()`, `set()`.

Wszystko inne jest **prawdziwe** — także `"0"` i `" "` (niepusty tekst).

## Zadanie

1. Utwórz zmienne z Twoim imieniem, rokiem urodzenia i średnią ocen; wypisz je jednym f-stringiem.
2. Wczytaj rok urodzenia i wypisz, ile lat skończysz w 2030 roku.
3. Sprawdź `type()` dla `7`, `7.0`, `"7"`, `7 > 3` i `None`.
4. Wczytaj dwie liczby w jednej linii i wypisz ich sumę oraz iloczyn.
5. Zamień wartości dwóch zmiennych na dwa sposoby: ze zmienną pomocniczą i przez `x, y = y, x`.
6. Wypisz `2 ** 100` i porównaj z wynikiem `2.0 ** 100` — czym się różnią?
