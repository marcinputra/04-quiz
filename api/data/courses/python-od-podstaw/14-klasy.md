**Programowanie obiektowe** łączy dane i działające na nich funkcje w jedną całość — **obiekt**. Przepis na obiekt to **klasa**. W Pythonie obiektem jest wszystko: liczba, napis, lista — a teraz także Twoje własne typy.

## Pierwsza klasa

```python
class Uczen:
    def __init__(self, imie, klasa):
        self.imie = imie          # atrybuty — dane obiektu
        self.klasa = klasa
        self.oceny = []

    def dodaj_ocene(self, ocena):  # metoda — funkcja obiektu
        self.oceny.append(ocena)

    def srednia(self):
        if not self.oceny:
            return 0
        return sum(self.oceny) / len(self.oceny)


ola = Uczen("Ola", "3A")          # tworzenie obiektu
ola.dodaj_ocene(5)
ola.dodaj_ocene(4)
print(ola.imie, ola.srednia())    # Ola 4.5

jan = Uczen("Jan", "3B")          # drugi, niezależny obiekt
print(jan.srednia())              # 0
```

- `__init__` to **konstruktor** — wykonuje się przy tworzeniu obiektu,
- `self` to **ten konkretny obiekt**; każda metoda dostaje go jako pierwszy parametr,
- `ola.dodaj_ocene(5)` Python zamienia na `Uczen.dodaj_ocene(ola, 5)`.

## Metody specjalne

Metody z dwoma podkreśleniami (*dunder*) pozwalają obiektom współpracować z wbudowanymi funkcjami:

```python
from math import gcd


class Ulamek:
    def __init__(self, licznik, mianownik):
        if mianownik == 0:
            raise ValueError("Mianownik nie może być zerem")
        d = gcd(licznik, mianownik)
        self.l = licznik // d
        self.m = mianownik // d

    def __str__(self):                # print(obiekt), str(obiekt)
        return f"{self.l}/{self.m}"

    def __add__(self, inny):          # obiekt + obiekt
        return Ulamek(self.l * inny.m + inny.l * self.m, self.m * inny.m)

    def __eq__(self, inny):           # obiekt == obiekt
        return self.l == inny.l and self.m == inny.m

    def __lt__(self, inny):           # obiekt < obiekt — umożliwia sorted()
        return self.l * inny.m < inny.l * self.m


a = Ulamek(1, 2)
b = Ulamek(1, 3)
print(a + b)                          # 5/6
print(Ulamek(2, 4) == a)              # True
print(*sorted([a, b, Ulamek(3, 4)]))  # 1/3 1/2 3/4
```

| Metoda | Kiedy jest wywoływana |
|---|---|
| `__init__` | `Klasa(...)` |
| `__str__` | `print(obj)`, `str(obj)`, f-string |
| `__repr__` | opis w konsoli i w listach |
| `__len__` | `len(obj)` |
| `__eq__`, `__lt__` | `==`, `<` |
| `__add__` | `+` |

## Atrybuty klasy

```python
class Uczen:
    szkola = "LO nr 1"      # wspólny dla wszystkich obiektów
    liczba = 0

    def __init__(self, imie):
        self.imie = imie
        Uczen.liczba += 1

Uczen("Ola"); Uczen("Jan")
print(Uczen.liczba, Uczen.szkola)    # 2 LO nr 1
```

## Hermetyzacja

W Pythonie nie ma prawdziwie prywatnych pól. Konwencja: nazwa z `_` oznacza „wewnętrzne — nie zmieniaj z zewnątrz”. Kontrolowany dostęp daje `@property`:

```python
class Konto:
    def __init__(self, wlasciciel):
        self.wlasciciel = wlasciciel
        self._saldo = 0

    @property
    def saldo(self):                 # odczyt jak atrybut: konto.saldo
        return self._saldo

    def wplac(self, kwota):
        if kwota <= 0:
            raise ValueError("Kwota musi być dodatnia")
        self._saldo += kwota

    def wyplac(self, kwota):
        if kwota > self._saldo:
            raise ValueError("Brak środków")
        self._saldo -= kwota


k = Konto("Ola")
k.wplac(100)
k.wyplac(30)
print(k.saldo)      # 70
k.saldo = 1000      # AttributeError — saldo można tylko odczytać
```

## Dziedziczenie

Klasa pochodna przejmuje atrybuty i metody klasy bazowej i może je rozszerzać:

```python
class Figura:
    def __init__(self, nazwa):
        self.nazwa = nazwa

    def pole(self):
        return 0

    def __str__(self):
        return f"{self.nazwa}: pole {self.pole():.2f}"


class Prostokat(Figura):
    def __init__(self, a, b):
        super().__init__("prostokąt")   # konstruktor klasy bazowej
        self.a, self.b = a, b

    def pole(self):                      # nadpisanie metody
        return self.a * self.b


class Kolo(Figura):
    def __init__(self, r):
        super().__init__("koło")
        self.r = r

    def pole(self):
        return 3.14159 * self.r ** 2


for f in [Prostokat(3, 4), Kolo(1)]:
    print(f)          # prostokąt: pole 12.00, koło: pole 3.14
```

Ta sama metoda `pole()` działa inaczej w każdej klasie — to **polimorfizm**.

```python
print(isinstance(Kolo(2), Figura))   # True
```

## `@dataclass` — klasa na dane w kilku liniach

```python
from dataclasses import dataclass

@dataclass
class Punkt:
    x: float
    y: float

    def odleglosc(self, inny):
        return ((self.x - inny.x) ** 2 + (self.y - inny.y) ** 2) ** 0.5

a = Punkt(0, 0)
b = Punkt(3, 4)
print(b)                 # Punkt(x=3, y=4) — __init__, __repr__ i __eq__ powstały same
print(a.odleglosc(b))    # 5.0
```

## Zadanie

1. Napisz klasę `Prostokat` z metodami `pole()`, `obwod()` i `czy_kwadrat()`.
2. Dodaj do klasy `Uczen` metodę `__str__` zwracającą np. `Ola (3A), średnia 4.50` i posortuj listę uczniów po średniej.
3. Napisz klasę `Licznik` z metodami `zwieksz()`, `reset()` i atrybutem tylko do odczytu `wartosc`.
4. Rozbuduj hierarchię figur o `Trojkat` (wzór Herona) i wypisz figurę o największym polu z listy.
5. Napisz `@dataclass Ksiazka` (tytuł, autor, rok) i klasę `Biblioteka` z metodami `dodaj`, `szukaj_autora`, `najstarsza`.
