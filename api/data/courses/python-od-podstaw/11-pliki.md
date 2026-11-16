Na maturze z informatyki dane do zadań programistycznych są w **plikach tekstowych** (np. `liczby.txt`, `slowa.txt`), a odpowiedzi często zapisuje się do pliku `wyniki….txt`. Ta lekcja jest jedną z najważniejszych w kursie.

## Otwieranie pliku: `with open`

```python
with open("dane.txt") as plik:
    tresc = plik.read()
print(tresc)
```

- `with` **automatycznie zamyka** plik po wyjściu z bloku — nawet przy błędzie,
- plik powinien leżeć **w tym samym folderze co program** (albo podaj pełną ścieżkę),
- `FileNotFoundError` oznacza złą nazwę lub zły folder — sprawdź, z jakiego katalogu uruchamiasz program.

### Tryby otwarcia

| Tryb | Znaczenie |
|---|---|
| `"r"` | odczyt (domyślny) |
| `"w"` | zapis — **usuwa** dotychczasową zawartość albo tworzy plik |
| `"a"` | dopisywanie na końcu |

Przy polskich znakach podawaj kodowanie: `open("dane.txt", encoding="utf-8")`.

## Sposoby odczytu

Przykładowy plik `liczby.txt`:

```text
12
7
25
3
```

```python
# 1. linia po linii — najczęściej używany sposób
with open("liczby.txt") as plik:
    for linia in plik:
        print(linia.strip())        # strip() usuwa znak nowej linii "\n"

# 2. wszystkie linie jako lista
with open("liczby.txt") as plik:
    linie = plik.readlines()        # ['12\n', '7\n', '25\n', '3\n']

# 3. od razu lista liczb
with open("liczby.txt") as plik:
    liczby = [int(linia) for linia in plik]   # int() ignoruje "\n" i spacje
print(liczby)                                  # [12, 7, 25, 3]

# 4. cała treść jako jeden napis
with open("liczby.txt") as plik:
    tresc = plik.read()
```

> Zapomniany `strip()` to najczęstszy błąd: `"kajak\n" == "kajak"` daje `False`, a `"kajak\n"[::-1]` zaczyna się od znaku nowej linii.

## Kilka wartości w linii

Plik `pary.txt`:

```text
3 8
15 4
7 7
```

```python
with open("pary.txt") as plik:
    for linia in plik:
        a, b = map(int, linia.split())
        print(a + b)          # 11, 19, 14
```

Gdy liczba wartości w linii jest różna:

```python
with open("dane.txt") as plik:
    wiersze = [list(map(int, linia.split())) for linia in plik]
```

Inny separator (np. średnik w pliku CSV) podaje się w `split`:

```python
linia = "Kowalska;Ola;3A;88\n"
nazwisko, imie, klasa, punkty = linia.strip().split(";")
punkty = int(punkty)
```

## Zapis do pliku

```python
wyniki = [("Ola", 88), ("Jan", 45)]

with open("wyniki.txt", "w", encoding="utf-8") as plik:
    plik.write("Wyniki sprawdzianu\n")        # write NIE dodaje "\n" sam
    for imie, pkt in wyniki:
        plik.write(f"{imie} {pkt}\n")

    print("Koniec", file=plik)                # print też potrafi pisać do pliku
```

Dopisywanie (np. dziennik zdarzeń):

```python
with open("log.txt", "a", encoding="utf-8") as plik:
    plik.write("Uruchomiono program\n")
```

### Zapis odpowiedzi na maturze

Typowe polecenie: *„Odpowiedzi do zadań 4.1–4.3 zapisz w pliku `wyniki4.txt`, każdą poprzedzoną numerem zadania.”*

```python
odp1 = 17
odp2 = "kajak"
odp3 = [3, 9, 27]

with open("wyniki4.txt", "w") as plik:
    print("4.1.", odp1, file=plik)
    print("4.2.", odp2, file=plik)
    print("4.3.", *odp3, file=plik)     # 4.3. 3 9 27
```

## Przykład: kompletne zadanie

Plik `temperatury.txt` zawiera w każdej linii datę i temperaturę: `2026-01-05 -3.5`. Znajdź najcieplejszy dzień i średnią temperaturę.

```python
dane = []
with open("temperatury.txt") as plik:
    for linia in plik:
        data, temp = linia.split()
        dane.append((data, float(temp)))

najcieplejszy = max(dane, key=lambda d: d[1])
srednia = sum(t for _, t in dane) / len(dane)

print("Najcieplej:", najcieplejszy[0], najcieplejszy[1])
print(f"Średnia: {srednia:.2f}")
```

Zmienna `_` to konwencja oznaczająca „ta wartość mnie nie interesuje”.

## Puste linie i końcówki plików

Plik może kończyć się pustą linią. Bezpieczny odczyt:

```python
with open("slowa.txt") as plik:
    slowa = [linia.strip() for linia in plik if linia.strip()]
```

Albo krócej: `slowa = open("slowa.txt").read().split()` — `split()` bez argumentu dzieli po dowolnych białych znakach i pomija puste fragmenty.

## Zadanie

1. Utwórz w edytorze plik `liczby.txt` z 10 liczbami (każda w osobnej linii). Wczytaj je i wypisz sumę, minimum i maksimum.
2. Policz, ile liczb w pliku jest parzystych, i zapisz odpowiedź do `wyniki.txt`.
3. Utwórz plik `slowa.txt` ze słowami i wypisz najdłuższe słowo oraz liczbę słów zaczynających się i kończących tą samą literą.
4. Wczytaj plik z parami liczb i zapisz do `nwd.txt` NWD każdej pary (funkcja z lekcji 6).
5. Napisz program, który do pliku `dziennik.txt` dopisuje linię z bieżącą datą i tekstem wpisanym przez użytkownika.
6. Celowo podaj złą nazwę pliku i przeczytaj komunikat błędu. Obsłużysz go w następnej lekcji.
