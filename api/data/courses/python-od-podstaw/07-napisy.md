Napisy (typ `str`) to jeden z najważniejszych typów na maturze: wiele zadań dotyczy słów, haseł, szyfrów czy zapisu liczb w różnych systemach. W tej lekcji poznasz indeksowanie, wycinki i najważniejsze metody.

## Indeksy

Każdy znak napisu ma swój numer — **indeks**, liczony **od zera**:

```text
 P   y   t   h   o   n
 0   1   2   3   4   5
-6  -5  -4  -3  -2  -1
```

```python
s = "Python"
print(s[0])        # P
print(s[5])        # n
print(s[-1])       # n — ostatni znak
print(s[-2])       # o
print(len(s))      # 6
print(s[6])        # IndexError — nie ma takiego indeksu
```

## Wycinki (slicing)

Zapis `s[start:stop:krok]` — **stop nie wchodzi** do wyniku (tak jak w `range`):

```python
s = "informatyka"
print(s[0:4])      # info
print(s[:4])       # info — od początku
print(s[6:])       # atyka — do końca
print(s[-3:])      # yka — trzy ostatnie znaki
print(s[::2])      # ifraya — co drugi znak
print(s[::-1])     # akytamrofni — odwrócony napis
```

Wycinek nigdy nie zgłasza błędu — `s[3:100]` zwróci po prostu tyle, ile jest.

## Napisy są niezmienne

```python
s = "kot"
s[0] = "K"         # TypeError — nie można zmienić znaku
s = "K" + s[1:]    # tworzymy NOWY napis: "Kot"
```

## Najważniejsze metody

| Metoda | Przykład | Wynik |
|---|---|---|
| `upper()`, `lower()` | `"Ala".upper()` | `"ALA"` |
| `capitalize()`, `title()` | `"ala ma kota".title()` | `"Ala Ma Kota"` |
| `strip()` | `"  tekst \n".strip()` | `"tekst"` — usuwa białe znaki z obu stron |
| `replace(a, b)` | `"2,5".replace(",", ".")` | `"2.5"` |
| `split()` | `"ala ma kota".split()` | `["ala", "ma", "kota"]` |
| `split(sep)` | `"1;2;3".split(";")` | `["1", "2", "3"]` |
| `sep.join(lista)` | `"-".join(["a", "b", "c"])` | `"a-b-c"` |
| `find(x)` | `"banan".find("an")` | `1` (`-1` gdy brak) |
| `count(x)` | `"banan".count("a")` | `2` |
| `startswith`, `endswith` | `"plik.txt".endswith(".txt")` | `True` |
| `isdigit()` | `"2024".isdigit()` | `True` |
| `isalpha()` | `"abc1".isalpha()` | `False` |
| `isupper()`, `islower()` | `"ABC".isupper()` | `True` |

Metody **zwracają nowy napis** — oryginał się nie zmienia:

```python
s = "python"
s.upper()
print(s)           # python
s = s.upper()
print(s)           # PYTHON
```

## Przechodzenie po znakach

```python
slowo = "programowanie"
samogloski = 0
for znak in slowo:
    if znak in "aeiouy":
        samogloski += 1
print(samogloski)    # 6

for i in range(len(slowo)):        # gdy potrzebny jest indeks
    if slowo[i] == "r":
        print("r na pozycji", i)   # 1 i 4
```

## Kody znaków: `ord` i `chr`

Każdy znak ma numer w tabeli **Unicode** (dla liter łacińskich taki sam jak w ASCII):

```python
print(ord("A"))     # 65
print(ord("a"))     # 97
print(chr(66))      # B
print(chr(ord("c") + 1))   # d — następna litera

# numer litery w alfabecie (a = 0, b = 1, …)
print(ord("e") - ord("a"))   # 4
```

Zależność `ord(znak) - ord("a")` to podstawa **szyfru Cezara** (lekcja 17).

## Porównywanie napisów

```python
print("ala" == "Ala")              # False
print("ala" == "Ala".lower())      # True — porównanie bez wielkości liter
print("abc" < "abd")               # True — kolejność słownikowa
print("10" < "9")                  # True! — porównanie znak po znaku, "1" < "9"
print(sorted(["kot", "Ala", "ząb", "bąk"]))   # ['Ala', 'bąk', 'kot', 'ząb']
```

Polskie litery mają kody większe niż `z` — `sorted(["ćma", "dom"])` da `['dom', 'ćma']`.

## Formatowanie f-stringów

```python
imie, wynik = "Ola", 0.8567
print(f"|{imie:<10}|")      # |Ola       | — do lewej, szerokość 10
print(f"|{imie:>10}|")      # |       Ola| — do prawej
print(f"|{imie:^10}|")      # |   Ola    | — wyśrodkowanie
print(f"{wynik:.2%}")       # 85.67%
print(f"{7:03}")            # 007
print(f"{1234567:,}")       # 1,234,567
```

## Zadanie

1. Wczytaj słowo i wypisz je odwrócone oraz informację, czy jest palindromem (`kajak`).
2. Policz w zdaniu liczbę słów, wielkich liter i cyfr.
3. Wczytaj imię i nazwisko (`jan kowalski`) i wypisz inicjały wielkimi literami: `J.K.`
4. Zamień w tekście wszystkie spacje na `_` i wypisz, ile ich było.
5. Wczytaj adres e-mail i sprawdź prosto jego poprawność: zawiera dokładnie jedno `@`, a po nim jest kropka.
6. Wypisz kody `ord` wszystkich znaków słowa `Matura` — co łączy kody wielkich i małych liter?
