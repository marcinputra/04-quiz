Instrukcje warunkowe pozwalają programowi **podejmować decyzje**: wykonać inny kod w zależności od danych.

## `if`, `elif`, `else`

```python
punkty = int(input("Liczba punktów (0–100): "))

if punkty >= 90:
    print("Ocena: 5")
elif punkty >= 75:
    print("Ocena: 4")
elif punkty >= 50:
    print("Ocena: 3")
elif punkty >= 30:
    print("Ocena: 2")
else:
    print("Ocena: 1")
```

- po warunku jest **dwukropek** `:`,
- wnętrze bloku jest **wcięte** (4 spacje),
- `elif` (skrót od *else if*) sprawdza się tylko wtedy, gdy poprzednie warunki były fałszywe,
- `elif` i `else` są opcjonalne; `elif` może być dowolnie wiele.

> Kolejność `elif` ma znaczenie. Gdyby pierwszy był warunek `punkty >= 30`, każdy wynik od 30 w górę dawałby ocenę 2.

## Warunki złożone

```python
wiek = 17
ma_zgode = True

if wiek >= 18 or ma_zgode:
    print("Możesz wziąć udział w wycieczce")

if 6 <= godzina < 22:
    print("Dzień")

if not haslo:          # pusty tekst jest fałszywy
    print("Podaj hasło!")
```

## Warunki zagnieżdżone

```python
if zalogowany:
    if rola == "admin":
        print("Panel administratora")
    else:
        print("Panel ucznia")
else:
    print("Zaloguj się")
```

Zbyt głębokie zagnieżdżanie utrudnia czytanie — często da się je zastąpić `and` lub `elif`.

## Wyrażenie warunkowe (operator trójargumentowy)

Krótki zapis wyboru jednej z dwóch wartości:

```python
n = 7
opis = "parzysta" if n % 2 == 0 else "nieparzysta"
print(opis)        # nieparzysta

wieksza = a if a > b else b
```

## `pass` — pusty blok

Blok w Pythonie nie może być pusty. Gdy chcesz go uzupełnić później, wpisz `pass`:

```python
if punkty > 100:
    pass   # TODO: obsłużyć błędne dane
```

## `match` — wybór jednej z wielu wartości

Od Pythona 3.10 można użyć `match` zamiast długiego łańcucha `elif`:

```python
dzien = input("Dzień tygodnia: ").lower()

match dzien:
    case "sobota" | "niedziela":
        print("Weekend!")
    case "piątek":
        print("Prawie weekend")
    case _:
        print("Dzień nauki")
```

- `|` oznacza „lub”,
- `case _:` łapie wszystkie pozostałe przypadki (jak `else`),
- wykonuje się **tylko jeden** pasujący `case` — nie trzeba `break` jak w C++.

## Przykład: rozwiązywanie równania kwadratowego

```python
import math

a, b, c = 1, -3, 2
delta = b ** 2 - 4 * a * c

if delta > 0:
    x1 = (-b - math.sqrt(delta)) / (2 * a)
    x2 = (-b + math.sqrt(delta)) / (2 * a)
    print(f"Dwa rozwiązania: {x1}, {x2}")      # 1.0, 2.0
elif delta == 0:
    print(f"Jedno rozwiązanie: {-b / (2 * a)}")
else:
    print("Brak rozwiązań rzeczywistych")
```

## Zadanie

1. Wczytaj liczbę i wypisz, czy jest dodatnia, ujemna, czy jest zerem.
2. Wczytaj trzy liczby i wypisz największą — bez użycia funkcji `max`.
3. Wczytaj długości trzech odcinków i sprawdź, czy da się z nich zbudować trójkąt (każdy bok krótszy od sumy dwóch pozostałych).
4. Napisz kalkulator: wczytaj dwie liczby i znak działania (`+ - * /`) i wykonaj je przez `match`. Obsłuż dzielenie przez zero.
5. Wczytaj rok i wypisz, czy jest przestępny — jednym wyrażeniem warunkowym.
