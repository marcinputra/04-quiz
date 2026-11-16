Python ma ogromną **bibliotekę standardową** — gotowe moduły do matematyki, losowania, dat, zliczania i wielu innych rzeczy. Na maturze można z niej korzystać, co często bardzo skraca rozwiązanie.

## Importowanie

```python
import math
print(math.sqrt(16))          # 4.0

from math import sqrt, pi     # import wybranych nazw
print(sqrt(2) * pi)

import random as r            # skrócona nazwa
print(r.randint(1, 6))
```

> Unikaj `from modul import *` — nie wiadomo wtedy, skąd pochodzą nazwy, a import może nadpisać Twoje zmienne.

## `math` — matematyka

```python
import math

math.sqrt(25)        # 5.0
math.isqrt(26)       # 5 — pierwiastek całkowity (bez błędów zaokrągleń)
math.floor(3.7)      # 3 — w dół
math.ceil(3.2)       # 4 — w górę
math.gcd(12, 18)     # 6 — NWD
math.lcm(4, 6)       # 12 — NWW
math.factorial(5)    # 120
math.log2(1024)      # 10.0
math.log10(1000)     # 3.0
math.pi, math.e
math.sin(math.radians(30))   # 0.49999999999999994 — funkcje trygonometryczne biorą radiany
math.isclose(0.1 + 0.2, 0.3) # True
```

## `random` — losowanie

```python
import random

random.randint(1, 6)              # liczba całkowita z [1, 6] — OBA końce włącznie
random.random()                   # float z [0, 1)
random.uniform(1.5, 2.5)          # float z zakresu
random.choice(["a", "b", "c"])    # losowy element
random.sample(range(1, 50), 6)    # 6 różnych liczb — „lotto”
talia = list(range(1, 11))
random.shuffle(talia)             # tasowanie na miejscu
random.seed(42)                   # ustalone „losowanie” — te same wyniki przy każdym uruchomieniu
```

### Przykład: symulacja

```python
import random

proby = 100_000
szostki = sum(1 for _ in range(proby) if random.randint(1, 6) == 6)
print(f"Szóstka wypadła w {szostki / proby:.1%} rzutów")   # około 16.7%
```

## `collections` — wygodne kolekcje

### `Counter` — zliczanie

```python
from collections import Counter

c = Counter("abrakadabra")
print(c)                      # Counter({'a': 5, 'b': 2, 'r': 2, 'k': 1, 'd': 1})
print(c["a"])                 # 5
print(c["z"])                 # 0 — brak klucza nie daje błędu
print(c.most_common(2))       # [('a', 5), ('b', 2)]

slowa = "ala ma kota a kot ma ale".split()
print(Counter(slowa).most_common(1))   # [('ma', 2)]

print(Counter("kajak") == Counter("jakak"))   # True — anagramy
```

### `defaultdict` — słownik z wartością domyślną

```python
from collections import defaultdict

klasy = defaultdict(list)
for imie, klasa in [("Ola", "3A"), ("Jan", "3B"), ("Ewa", "3A")]:
    klasy[klasa].append(imie)      # nie trzeba sprawdzać, czy klucz istnieje
print(dict(klasy))                 # {'3A': ['Ola', 'Ewa'], '3B': ['Jan']}
```

## `datetime` — daty i czas

```python
from datetime import date, datetime, timedelta

dzis = date.today()
matura = date(2027, 5, 4)
print((matura - dzis).days, "dni do matury")

d = date(2026, 11, 16)
print(d.weekday())              # 0 — poniedziałek (0 = pon, 6 = nd)
print(d + timedelta(days=30))   # 2026-12-16
print(d.strftime("%d.%m.%Y"))   # 16.11.2026

teraz = datetime.now()
print(teraz.strftime("%H:%M"))

data = datetime.strptime("2026-03-15", "%Y-%m-%d").date()   # tekst → data
```

## Inne przydatne moduły

| Moduł | Do czego |
|---|---|
| `itertools` | `permutations`, `combinations`, `product` — wszystkie układy i podzbiory |
| `string` | `string.ascii_lowercase` — `"abcdefghijklmnopqrstuvwxyz"` |
| `functools` | `lru_cache` — zapamiętywanie wyników funkcji (lekcja 15) |
| `statistics` | `mean`, `median`, `mode` |
| `time` | `time.perf_counter()` — pomiar czasu działania |
| `json`, `csv` | odczyt i zapis plików JSON i CSV |

```python
from itertools import combinations, permutations
print(list(combinations([1, 2, 3], 2)))   # [(1, 2), (1, 3), (2, 3)]
print(len(list(permutations("abcd"))))     # 24
```

## Własne moduły

Każdy plik `.py` jest modułem. Plik `narzedzia.py`:

```python
def czy_pierwsza(n):
    if n < 2:
        return False
    return all(n % d != 0 for d in range(2, int(n ** 0.5) + 1))

if __name__ == "__main__":
    # wykona się tylko przy uruchomieniu TEGO pliku, nie przy imporcie
    print(czy_pierwsza(97))
```

Plik `main.py` w tym samym folderze:

```python
from narzedzia import czy_pierwsza
print([n for n in range(30) if czy_pierwsza(n)])
```

> Nie nazywaj swoich plików tak jak moduły standardowe (`random.py`, `math.py`) — Python zaimportuje Twój plik zamiast biblioteki.

## Biblioteki zewnętrzne: `pip`

```bash
pip install requests        # Windows
pip3 install requests       # macOS/Linux
```

Tysiące gotowych bibliotek (np. `requests`, `pandas`, `matplotlib`) są w repozytorium **PyPI**. Na maturze dostępna jest tylko biblioteka standardowa — nie licz na zewnętrzne pakiety.

## Zadanie

1. Napisz grę „zgadnij liczbę”: program losuje liczbę 1–100 i podpowiada „za mało / za dużo”; na końcu wypisuje liczbę prób.
2. Za pomocą `Counter` znajdź najczęstszą literę w tekście (bez spacji).
3. Policz, ile dni minęło od Twoich urodzin, i w jaki dzień tygodnia się urodziłeś/urodziłaś.
4. Wypisz wszystkie trzyliterowe „słowa” z liter `a`, `b`, `c` (`itertools.product`).
5. Przenieś funkcje `czy_pierwsza`, `nwd` i `silnia` do modułu `narzedzia.py` i użyj ich w innym pliku.
6. Zasymuluj 10 000 rzutów dwiema kostkami i za pomocą `Counter` pokaż, jak często wypada każda suma 2–12.
