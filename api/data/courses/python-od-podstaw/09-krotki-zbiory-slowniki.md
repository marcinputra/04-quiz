Oprócz list Python ma trzy inne kolekcje: **krotki**, **zbiory** i **słowniki**. Dobrze dobrana struktura potrafi skrócić rozwiązanie zadania z kilkunastu linii do kilku.

| Struktura | Zapis | Zmienna? | Kolejność | Duplikaty | Do czego |
|---|---|---|---|---|---|
| lista | `[1, 2, 2]` | tak | tak | tak | ciąg wartości |
| krotka | `(1, 2, 2)` | **nie** | tak | tak | stała grupa wartości (punkt, para) |
| zbiór | `{1, 2}` | tak | **nie** | **nie** | unikalne wartości, szybkie `in` |
| słownik | `{"a": 1}` | tak | tak (wstawiania) | klucze — nie | przypisanie klucz → wartość |

## Krotki (`tuple`)

```python
punkt = (3, 4)
print(punkt[0])          # 3
x, y = punkt             # rozpakowanie
punkt[0] = 5             # TypeError — krotki są niezmienne

jeden = (5,)             # krotka jednoelementowa wymaga przecinka
print(type((5)))         # <class 'int'> — to zwykła liczba w nawiasie
```

Krotki zwracają funkcje oddające kilka wartości (`return a, b`) i można ich używać jako kluczy słownika (lista się nie nadaje).

## Zbiory (`set`)

```python
liczby = [3, 1, 3, 2, 1, 3]
unikalne = set(liczby)
print(unikalne)          # {1, 2, 3}
print(len(unikalne))     # 3 — liczba RÓŻNYCH wartości

odwiedzone = set()       # pusty zbiór — {} to pusty SŁOWNIK!
odwiedzone.add("Kraków")
odwiedzone.add("Kraków") # duplikat — nic się nie zmienia
odwiedzone.discard("Gdańsk")   # usuwa, jeśli jest (bez błędu)
```

### Działania na zbiorach

```python
a = {1, 2, 3, 4}
b = {3, 4, 5}
print(a | b)     # {1, 2, 3, 4, 5} — suma
print(a & b)     # {3, 4} — część wspólna
print(a - b)     # {1, 2} — różnica
print(a ^ b)     # {1, 2, 5} — różnica symetryczna
print({1, 2} <= a)   # True — podzbiór
```

> Sprawdzanie `x in zbior` jest **bardzo szybkie** niezależnie od rozmiaru, a `x in lista` przegląda listę element po elemencie. Przy dziesiątkach tysięcy danych różnica jest ogromna.

## Słowniki (`dict`)

Słownik przechowuje pary **klucz → wartość**:

```python
uczen = {
    "imie": "Ola",
    "klasa": "3A",
    "oceny": [5, 4, 6],
}

print(uczen["imie"])              # Ola
uczen["wiek"] = 18                # dodanie nowego klucza
uczen["klasa"] = "4A"             # zmiana wartości
del uczen["wiek"]                 # usunięcie

print("oceny" in uczen)           # True — in sprawdza KLUCZE
print(uczen["email"])             # KeyError — brak klucza
print(uczen.get("email"))         # None — bezpieczny odczyt
print(uczen.get("email", "brak")) # brak — wartość domyślna
```

### Przechodzenie po słowniku

```python
ceny = {"chleb": 4.5, "mleko": 3.2, "masło": 8.9}

for produkt in ceny:                    # po kluczach
    print(produkt)

for produkt, cena in ceny.items():      # po parach
    print(f"{produkt}: {cena:.2f} zł")

print(sum(ceny.values()))               # 16.6
print(list(ceny.keys()))                # ['chleb', 'mleko', 'masło']
```

### Zliczanie — najważniejszy schemat

```python
tekst = "abrakadabra"
licznik = {}
for znak in tekst:
    licznik[znak] = licznik.get(znak, 0) + 1
print(licznik)     # {'a': 5, 'b': 2, 'r': 2, 'k': 1, 'd': 1}

najczestszy = max(licznik, key=licznik.get)
print(najczestszy)  # a
```

### Grupowanie

```python
uczniowie = [("Ola", "3A"), ("Jan", "3B"), ("Ewa", "3A")]
klasy = {}
for imie, klasa in uczniowie:
    if klasa not in klasy:
        klasy[klasa] = []
    klasy[klasa].append(imie)
print(klasy)    # {'3A': ['Ola', 'Ewa'], '3B': ['Jan']}
```

### Sortowanie słownika

```python
wyniki = {"Ola": 88, "Jan": 45, "Ewa": 72}
for imie, pkt in sorted(wyniki.items(), key=lambda para: para[1], reverse=True):
    print(imie, pkt)     # Ola 88, Ewa 72, Jan 45
```

Zapis `lambda para: para[1]` to krótka funkcja „weź drugi element pary” — więcej w następnej lekcji.

## Zadanie

1. Wczytaj zdanie i wypisz liczbę **różnych** słów (bez rozróżniania wielkości liter).
2. Dla dwóch list liczb wypisz liczby występujące w obu oraz te, które są tylko w pierwszej.
3. Policz wystąpienia każdego słowa w tekście i wypisz 3 najczęstsze.
4. Utwórz słownik „słowo angielskie → polskie” i napisz quiz: program losuje słowo i sprawdza tłumaczenie (`random.choice(list(slownik))`).
5. Mając listę krotek `(imię, punkty)`, utwórz słownik z najlepszym wynikiem każdej osoby (osoba może występować wiele razy).
6. Sprawdź, czy dwa słowa są anagramami (te same litery w innej kolejności), używając słownika liczników.
