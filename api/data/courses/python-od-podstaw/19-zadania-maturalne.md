Czas połączyć wszystko w całość. W tej lekcji przećwiczysz **sposób pracy** nad zadaniem programistycznym z matury i rozwiążesz zadanie w stylu maturalnym od początku do końca.

## Jak wygląda zadanie programistyczne

Typowe zadanie składa się z:

- **opisu danych** — np. „W pliku `liczby.txt` znajduje się 1000 liczb naturalnych z zakresu 1–100 000, każda w osobnym wierszu”,
- **pliku przykładowego** (np. `przyklad.txt`) z odpowiedziami podanymi w treści — do sprawdzenia programu,
- kilku **podpunktów** (np. 4.1, 4.2, 4.3) o rosnącej trudności,
- polecenia, gdzie zapisać **odpowiedzi** (np. `wyniki4.txt`) i **programy** (pliki z kodem do oddania).

## Plan pracy

1. **Przeczytaj uważnie** treść i format danych — co jest w wierszu, jakie są zakresy, czy dane są posortowane.
2. Zacznij od **pliku przykładowego** — znasz dla niego poprawne odpowiedzi.
3. Napisz **wczytywanie danych raz** i sprawdź je `print(dane[:5], len(dane))`.
4. Każdy podpunkt rozwiąż w **osobnej funkcji**.
5. Porównaj wyniki z przykładem, dopiero potem zmień plik na pełne dane.
6. Zapisz odpowiedzi w wymaganym formacie i **zapisz program** w odpowiednim pliku.

> Zostaw w programie zmienną z nazwą pliku na początku — przełączenie z `przyklad.txt` na `liczby.txt` to wtedy zmiana jednej linii.

## Szablon rozwiązania

```python
PLIK = "przyklad.txt"     # potem: "liczby.txt"


def wczytaj(nazwa):
    with open(nazwa) as f:
        return [int(linia) for linia in f if linia.strip()]


def zadanie_1(liczby):
    ...


def zadanie_2(liczby):
    ...


dane = wczytaj(PLIK)
odp1 = zadanie_1(dane)
odp2 = zadanie_2(dane)
print(odp1, odp2)

with open("wyniki4.txt", "w") as f:
    print("4.1.", odp1, file=f)
    print("4.2.", odp2, file=f)
```

## Zadanie przykładowe: „Liczby”

> W pliku `liczby.txt` jest 1000 liczb naturalnych z zakresu [1, 100 000], każda w osobnym wierszu. Poniżej plik przykładowy `przyklad.txt` (10 liczb):
>
> ```text
> 121
> 36
> 997
> 1024
> 56
> 49
> 81
> 2026
> 64
> 13
> ```
>
> **4.1.** Podaj, ile liczb z pliku jest kwadratami liczb naturalnych. *(Dla przykładu: 6)*
>
> **4.2.** Podaj największą liczbę pierwszą z pliku i jej numer wiersza. *(Dla przykładu: 997 w wierszu 3)*
>
> **4.3.** Znajdź najdłuższy fragment ciągu, w którym kolejne liczby są **malejące**. Podaj jego długość i pierwszą liczbę. *(Dla przykładu: długość 3, zaczyna się od 1024)*
>
> **4.4.** Podaj, ile jest par liczb (na dowolnych pozycjach), których NWD jest większy od 1. *(Dla przykładu: 12)*

### Rozwiązanie

```python
from math import isqrt, gcd
from itertools import combinations

PLIK = "przyklad.txt"


def wczytaj(nazwa):
    with open(nazwa) as f:
        return [int(linia) for linia in f if linia.strip()]


def czy_pierwsza(n):
    if n < 2:
        return False
    return all(n % d != 0 for d in range(2, isqrt(n) + 1))


# 4.1
def kwadraty(liczby):
    return sum(1 for x in liczby if isqrt(x) ** 2 == x)


# 4.2
def najwieksza_pierwsza(liczby):
    najlepsza, wiersz = None, None
    for nr, x in enumerate(liczby, start=1):
        if czy_pierwsza(x) and (najlepsza is None or x > najlepsza):
            najlepsza, wiersz = x, nr
    return najlepsza, wiersz


# 4.3
def najdluzszy_malejacy(liczby):
    najlepsza_dl, najlepszy_start = 1, 0
    dl, start = 1, 0
    for i in range(1, len(liczby)):
        if liczby[i] < liczby[i - 1]:
            dl += 1
        else:
            dl, start = 1, i
        if dl > najlepsza_dl:
            najlepsza_dl, najlepszy_start = dl, start
    return najlepsza_dl, liczby[najlepszy_start]


# 4.4
def pary_nwd(liczby):
    return sum(1 for a, b in combinations(liczby, 2) if gcd(a, b) > 1)


dane = wczytaj(PLIK)
odp1 = kwadraty(dane)
odp2 = najwieksza_pierwsza(dane)
odp3 = najdluzszy_malejacy(dane)
odp4 = pary_nwd(dane)

with open("wyniki4.txt", "w") as f:
    print("4.1.", odp1, file=f)
    print("4.2.", *odp2, file=f)
    print("4.3.", *odp3, file=f)
    print("4.4.", odp4, file=f)

print(odp1, odp2, odp3, odp4)    # 6 (997, 3) (3, 1024) 12
```

### Na co zwrócić uwagę

- **4.1** — `isqrt` zamiast `x ** 0.5`: przy dużych liczbach pierwiastek zmiennoprzecinkowy może dać błąd zaokrąglenia.
- **4.2** — numer wiersza liczymy **od 1** (`enumerate(…, start=1)`), bo tak numeruje treść zadania.
- **4.3** — fragment „malejący” oznacza **ściśle** malejący (`<`); przy „nierosnącym” byłoby `<=`. Takie szczegóły decydują o punktach.
- **4.4** — 1000 liczb to około 500 000 par — O(n²) jest tu w porządku. Przy 100 000 liczb trzeba by szukać sprytniejszego sposobu.

## Inne typowe motywy zadań

| Motyw | Narzędzia |
|---|---|
| liczby w różnych systemach (np. `liczby8.txt`) | `int(s, 8)`, `bin()`, własna zamiana |
| słowa / hasła / szyfry | wycinki, `ord`/`chr`, `Counter`, `sorted(s)` |
| ciągi i najdłuższe fragmenty | schemat „bieżąca / najlepsza” |
| plansze i obrazy (np. 200 × 320 pikseli) | listy dwuwymiarowe, sąsiedzi `[i±1][j±1]` |
| symulacje krok po kroku | pętla `while`, stan w zmiennych lub klasie |
| dane z wielu plików (relacje) | słowniki, `defaultdict`, grupowanie |
| dane z datami | `datetime`, `timedelta`, sortowanie po dacie |

### Plansza dwuwymiarowa — sąsiedzi

```python
def sasiedzi(plansza, i, j):
    wynik = []
    for di, dj in [(-1, 0), (1, 0), (0, -1), (0, 1)]:
        ni, nj = i + di, j + dj
        if 0 <= ni < len(plansza) and 0 <= nj < len(plansza[0]):
            wynik.append(plansza[ni][nj])
    return wynik

obraz = [[1, 2, 3], [4, 5, 6], [7, 8, 9]]
print(sasiedzi(obraz, 0, 0), sasiedzi(obraz, 1, 1))   # [4, 2] [2, 8, 4, 6]
```

## Ostatnie rady przed egzaminem

- ćwicz na **arkuszach z poprzednich lat** — są dostępne na stronie CKE i w [quizach na tej stronie](/quizy),
- pilnuj **formatu odpowiedzi** — dokładnie taki, jak w poleceniu,
- **zapisuj program często** (Ctrl+S) i nie nadpisuj działającej wersji eksperymentami,
- zadanie nierozwiązane w całości warto zacząć — punkty bywają za częściowe rozwiązania,
- część zadań szybciej rozwiążesz w **arkuszu kalkulacyjnym** lub **bazie danych** — wybieraj narzędzie do zadania.

## Zadanie

1. Utwórz plik `przyklad.txt` z danymi powyżej i uruchom rozwiązanie — sprawdź, czy wyniki są zgodne.
2. Wygeneruj `liczby.txt` z 1000 losowymi liczbami (`random.randint(1, 100000)`) i uruchom na nim program.
3. Dodaj podpunkt **4.5**: liczby, których suma cyfr jest liczbą pierwszą — zapisz je do pliku `liczby_45.txt`.
4. Dodaj **4.6**: podaj liczbę, która ma najwięcej dzielników (przy remisie — najmniejszą).
5. Przerób 4.4 tak, żeby działało szybko dla 100 000 liczb z zakresu do 1000 (wskazówka: zlicz wystąpienia wartości `Counter`).
6. Znajdź na stronie CKE arkusz maturalny z informatyki i rozwiąż jedno zadanie programistyczne w Pythonie.
