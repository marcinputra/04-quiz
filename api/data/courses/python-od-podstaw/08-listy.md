**Lista** przechowuje wiele wartości pod jedną nazwą — np. wszystkie liczby z pliku z danymi. To najczęściej używana struktura danych w Pythonie.

## Tworzenie i indeksy

```python
oceny = [5, 4, 3, 5, 6]
imiona = ["Ola", "Jan", "Ewa"]
mieszana = [1, "dwa", 3.0, True]    # dozwolone, ale rzadko potrzebne
pusta = []

print(oceny[0])      # 5
print(oceny[-1])     # 6
print(len(oceny))    # 5
print(oceny[1:3])    # [4, 3] — wycinki działają jak w napisach
```

W przeciwieństwie do napisów, listy są **zmienne**:

```python
oceny[2] = 4
print(oceny)         # [5, 4, 4, 5, 6]
```

## Dodawanie i usuwanie

```python
liczby = [3, 1, 4]

liczby.append(1)        # na koniec:          [3, 1, 4, 1]
liczby.insert(0, 9)     # na pozycję 0:       [9, 3, 1, 4, 1]
liczby.extend([5, 9])   # wiele na koniec:    [9, 3, 1, 4, 1, 5, 9]

ostatni = liczby.pop()  # usuń i zwróć ostatni: 9
liczby.pop(0)           # usuń element o indeksie 0
liczby.remove(1)        # usuń PIERWSZE wystąpienie wartości 1
print(liczby)           # [3, 4, 1, 5]

del liczby[1]           # usuń po indeksie: [3, 1, 5]
liczby.clear()          # []
```

## Wyszukiwanie

```python
t = [7, 2, 9, 2, 5]
print(9 in t)          # True
print(t.index(2))      # 1 — indeks pierwszego wystąpienia (ValueError, gdy brak)
print(t.count(2))      # 2
print(min(t), max(t), sum(t))   # 2 9 25
```

## Sortowanie

```python
t = [7, 2, 9, 2, 5]

posortowana = sorted(t)          # NOWA lista: [2, 2, 5, 7, 9]; t bez zmian
t.sort()                         # sortuje NA MIEJSCU; zwraca None
t.sort(reverse=True)             # malejąco: [9, 7, 5, 2, 2]
t.reverse()                      # odwraca kolejność na miejscu

slowa = ["banan", "Kiwi", "ananas"]
print(sorted(slowa, key=len))         # ['Kiwi', 'banan', 'ananas'] — według długości
print(sorted(slowa, key=str.lower))   # ['ananas', 'banan', 'Kiwi'] — bez wielkości liter
```

> Częsty błąd: `t = t.sort()` — po tym `t` ma wartość `None`. Albo `t.sort()`, albo `t = sorted(t)`.

## Pętla po liście

```python
temperatury = [12.5, 14.0, 9.5, 16.0]

for t in temperatury:
    print(f"{t} °C")

for i in range(len(temperatury)):              # z indeksem
    print(f"Dzień {i + 1}: {temperatury[i]}")

for i in range(1, len(temperatury)):           # porównanie z poprzednim
    if temperatury[i] > temperatury[i - 1]:
        print(f"Wzrost w dniu {i + 1}")
```

### Budowanie nowej listy

```python
liczby = [4, 7, 10, 13, 16]
parzyste = []
for x in liczby:
    if x % 2 == 0:
        parzyste.append(x)
print(parzyste)    # [4, 10, 16]
```

Krótszy zapis takich pętli poznasz w lekcji 10 (wyrażenia listowe).

## Kopiowanie — uwaga na referencje

```python
a = [1, 2, 3]
b = a            # b to TA SAMA lista, nie kopia
b.append(4)
print(a)         # [1, 2, 3, 4]

c = a.copy()     # lub a[:] albo list(a) — prawdziwa kopia
c.append(5)
print(a)         # [1, 2, 3, 4] — oryginał bez zmian
```

Tak samo działa przekazywanie listy do funkcji: funkcja, która zmienia listę (`append`, `sort`), zmienia oryginał.

## Łączenie i powtarzanie

```python
print([1, 2] + [3, 4])   # [1, 2, 3, 4]
print([0] * 5)           # [0, 0, 0, 0, 0] — np. tablica liczników
```

## Listy dwuwymiarowe

Lista list to tabela (np. plansza, macierz, obraz z pikseli):

```python
plansza = [
    [1, 2, 3],
    [4, 5, 6],
    [7, 8, 9],
]
print(plansza[1][2])     # 6 — wiersz 1, kolumna 2

for wiersz in plansza:
    print(sum(wiersz))   # 6, 15, 24

# tworzenie tablicy 3 × 4 wypełnionej zerami
siatka = [[0] * 4 for _ in range(3)]
```

> Nie twórz tabeli przez `[[0] * 4] * 3` — powstaną trzy odwołania do **tego samego** wiersza i zmiana jednego zmieni wszystkie.

## Lista z danych wejściowych

```python
liczby = list(map(int, input("Podaj liczby: ").split()))
# "3 8 1" → [3, 8, 1]
```

## Zadanie

1. Wczytaj 10 liczb do listy i wypisz: sumę, średnią, największą i najmniejszą.
2. Bez `max` i `index` znajdź **indeks** największego elementu listy.
3. Usuń z listy wszystkie wystąpienia wybranej wartości (uwaga: nie usuwaj elementów w trakcie pętli po tej samej liście).
4. Sprawdź, czy lista jest posortowana rosnąco, porównując sąsiednie elementy.
5. Utwórz tablicę 10 liczników `[0] * 10` i policz, ile razy każda cyfra 0–9 występuje w liczbie `2026111698765`.
6. Utwórz macierz 5 × 5, w której element `[i][j]` ma wartość `i * j`, i wypisz sumę elementów na przekątnej.
