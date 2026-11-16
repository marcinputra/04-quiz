Codziennie podejmujesz dziesiątki decyzji: **jeśli** pada — biorę parasol, **w przeciwnym razie** — okulary przeciwsłoneczne. Programy robią dokładnie to samo za pomocą **instrukcji warunkowej**. Pokazujemy, jak działa w Pythonie, na przykładach z życia.

## Parasol czy okulary? — `if` i `else`

```python
pada = True

if pada:
    print("Weź parasol")
else:
    print("Weź okulary przeciwsłoneczne")
```

Zasady zapisu:

- po warunku stawiamy **dwukropek** `:`,
- kod wykonywany w danym przypadku jest **wcięty** (4 spacje) — w Pythonie wcięcia wyznaczają bloki,
- `else` jest opcjonalny — gdy go nie ma, a warunek jest fałszywy, program po prostu idzie dalej.

## Bilet do kina — porównania

```python
wiek = 15

if wiek < 18:
    print("Bilet ulgowy: 18 zł")
else:
    print("Bilet normalny: 26 zł")
```

Warunkiem jest zwykle **porównanie**: `==` (równe), `!=` (różne), `<`, `>`, `<=`, `>=`. Uwaga: `=` to przypisanie, a `==` to porównanie — `if wiek = 18:` jest błędem.

## Ocena ze sprawdzianu — `elif`

Gdy możliwości jest więcej niż dwie, używamy `elif` („w przeciwnym razie, jeśli”):

```python
punkty = 78

if punkty >= 90:
    ocena = 5
elif punkty >= 75:
    ocena = 4
elif punkty >= 50:
    ocena = 3
elif punkty >= 30:
    ocena = 2
else:
    ocena = 1

print("Ocena:", ocena)   # Ocena: 4
```

Python sprawdza warunki **od góry** i wykonuje **tylko pierwszy** spełniony blok. Dla 78 punktów warunek `>= 50` też jest prawdziwy, ale nie ma znaczenia — ocena 4 została już przyznana. Dlatego **kolejność ma znaczenie**: gdyby `punkty >= 30` stało na początku, każdy dostałby dwójkę.

## Darmowa dostawa — `and`, `or`, `not`

Sklep internetowy: dostawa jest darmowa, gdy zamówienie wynosi co najmniej 150 zł **lub** klient ma kartę stałego klienta — ale **nie** przy wysyłce za granicę.

```python
kwota = 120
karta_klienta = True
za_granice = False

if (kwota >= 150 or karta_klienta) and not za_granice:
    print("Dostawa gratis")
else:
    print("Dostawa: 14,99 zł")
```

| Operator | Znaczenie | Prawdziwy, gdy… |
|---|---|---|
| `and` | i | **oba** warunki są prawdziwe |
| `or` | lub | **co najmniej jeden** jest prawdziwy |
| `not` | nie | warunek jest fałszywy |

Nawiasy mówią, co sprawdzamy najpierw — tak jak w matematyce.

Python pozwala też zapisać przedział jak na lekcji matematyki:

```python
temperatura = 22
if 18 <= temperatura <= 25:
    print("Idealna pogoda na rower")
```

## Logowanie — warunki zagnieżdżone

Warunek może być w środku innego warunku:

```python
login_ok = True
haslo_ok = False

if login_ok:
    if haslo_ok:
        print("Witaj z powrotem!")
    else:
        print("Błędne hasło")
else:
    print("Nie ma takiego użytkownika")
```

Głębokie zagnieżdżenia szybko stają się nieczytelne — często da się je zastąpić `and` lub `elif`.

## Rok przestępny — klasyk matury

Rok jest przestępny, gdy dzieli się przez 4 i nie dzieli przez 100 — **albo** dzieli się przez 400:

```python
def czy_przestepny(rok):
    return (rok % 4 == 0 and rok % 100 != 0) or rok % 400 == 0

for rok in [2024, 1900, 2000, 2026]:
    print(rok, "przestępny" if czy_przestepny(rok) else "zwykły")
# 2024 przestępny, 1900 zwykły, 2000 przestępny, 2026 zwykły
```

Zapis `"przestępny" if warunek else "zwykły"` to **wyrażenie warunkowe** — skrócony `if` mieszczący się w jednej linii, gdy wybieramy jedną z dwóch wartości.

## Pusta lista, pusty napis — „prawda” i „fałsz”

W warunku można użyć nie tylko porównania. Python traktuje jako **fałsz**: `0`, pusty napis `""`, pustą listę `[]`, `None`. Wszystko inne jest prawdą:

```python
koszyk = []

if koszyk:
    print(f"Produktów w koszyku: {len(koszyk)}")
else:
    print("Koszyk jest pusty")
```

## Dzień tygodnia — `match`

Gdy porównujemy jedną wartość z wieloma możliwościami, od Pythona 3.10 można użyć `match`:

```python
dzien = "sobota"

match dzien:
    case "sobota" | "niedziela":
        print("Weekend — śpimy dłużej")
    case "piątek":
        print("Jeszcze tylko jeden dzień")
    case _:
        print("Do szkoły!")
```

`|` oznacza „lub”, a `case _` łapie wszystkie pozostałe przypadki — jak `else`.

## Najczęstsze błędy

| Błąd | Poprawnie |
|---|---|
| `if wiek = 18:` | `if wiek == 18:` |
| brak dwukropka: `if pada` | `if pada:` |
| brak wcięcia pod `if` (`IndentationError`) | wcięcie 4 spacjami |
| `if x == 1 or 2:` — zawsze prawda! | `if x == 1 or x == 2:` albo `if x in (1, 2):` |
| porównanie liczby z tekstem z `input()` | `wiek = int(input())`, potem porównanie |

## Podsumowanie

- `if` — wykonaj, **jeśli** warunek jest prawdziwy,
- `elif` — kolejne możliwości, sprawdzane **po kolei**,
- `else` — wszystkie pozostałe przypadki,
- `and`, `or`, `not` łączą warunki, a `match` porządkuje wybór jednej z wielu wartości.

Więcej przykładów i zadania do samodzielnego rozwiązania znajdziesz w lekcji 4 kursu [Python od podstaw do matury](/kursy/python-od-podstaw).
