Python pozwala zapisać wiele typowych pętli w **jednej czytelnej linii**. Poznasz wyrażenia listowe, funkcje `lambda` i wbudowane narzędzia do pracy z kolekcjami: `sorted`, `enumerate`, `zip`, `any`, `all`.

## Wyrażenia listowe (list comprehensions)

Zamiast:

```python
kwadraty = []
for x in range(1, 6):
    kwadraty.append(x ** 2)
```

można napisać:

```python
kwadraty = [x ** 2 for x in range(1, 6)]
print(kwadraty)       # [1, 4, 9, 16, 25]
```

Schemat: `[wyrażenie for element in kolekcja if warunek]`

```python
liczby = [12, 7, 25, 3, 18, 40]

parzyste = [x for x in liczby if x % 2 == 0]          # [12, 18, 40]
podwojone = [x * 2 for x in liczby]                   # [24, 14, 50, 6, 36, 80]
opis = ["P" if x % 2 == 0 else "N" for x in liczby]   # ['P', 'N', 'N', 'N', 'P', 'P']

slowa = ["  Ala ", "kot\n", " PIES"]
czyste = [s.strip().lower() for s in slowa]           # ['ala', 'kot', 'pies']
liczby_z_tekstu = [int(x) for x in "3 8 1".split()]   # [3, 8, 1]
```

> Zwróć uwagę na kolejność: filtr `if` (bez `else`) jest **na końcu**, a wybór `… if … else …` — **na początku**.

### Wyrażenia słownikowe i zbiorowe

```python
kwadraty = {x: x ** 2 for x in range(1, 5)}    # {1: 1, 2: 4, 3: 9, 4: 16}
dlugosci = {s: len(s) for s in ["kot", "pies"]} # {'kot': 3, 'pies': 4}
reszty = {x % 3 for x in range(10)}             # {0, 1, 2}
```

### Wyrażenia generatorowe

Bez nawiasów kwadratowych — liczone „w locie”, bez tworzenia listy w pamięci:

```python
print(sum(x ** 2 for x in range(1, 101)))           # 338350
print(sum(1 for x in liczby if x > 10))             # 4 — zliczanie
```

## Funkcje `lambda`

`lambda` to krótka, jednowierszowa funkcja bez nazwy:

```python
podwoj = lambda x: x * 2
print(podwoj(5))     # 10
```

Najczęściej używa się jej jako **klucza** sortowania, `min` i `max`:

```python
uczniowie = [("Ola", 88), ("Jan", 45), ("Ewa", 72)]

print(sorted(uczniowie, key=lambda u: u[1]))
# [('Jan', 45), ('Ewa', 72), ('Ola', 88)]

print(max(uczniowie, key=lambda u: u[1]))     # ('Ola', 88)

# sortowanie po kilku kryteriach: malejąco po punktach, potem alfabetycznie
wyniki = [("Ola", 88), ("Ewa", 88), ("Jan", 45)]
print(sorted(wyniki, key=lambda u: (-u[1], u[0])))
# [('Ewa', 88), ('Ola', 88), ('Jan', 45)]
```

## `map` i `filter`

```python
print(list(map(int, ["1", "2", "3"])))                 # [1, 2, 3]
print(list(filter(lambda x: x > 0, [-2, 5, 0, 3])))    # [5, 3]
```

Wyrażenia listowe są zwykle czytelniejsze, ale `map(int, …)` to bardzo popularny skrót przy wczytywaniu danych.

## `enumerate` i `zip`

```python
dni = ["pon", "wt", "śr"]
temp = [12, 15, 9]

for i, dzien in enumerate(dni):
    print(i, dzien)                 # 0 pon, 1 wt, 2 śr

for dzien, t in zip(dni, temp):     # dwie listy równolegle
    print(f"{dzien}: {t} °C")

pary = list(zip(dni, temp))         # [('pon', 12), ('wt', 15), ('śr', 9)]
slownik = dict(zip(dni, temp))      # {'pon': 12, 'wt': 15, 'śr': 9}

# sąsiednie elementy
t = [3, 5, 4, 8]
roznice = [b - a for a, b in zip(t, t[1:])]    # [2, -1, 4]
```

`zip` kończy na **najkrótszej** z list.

## `any` i `all`

```python
liczby = [4, 8, 15, 16]
print(any(x > 10 for x in liczby))     # True  — czy KTÓRAKOLWIEK spełnia
print(all(x > 0 for x in liczby))      # True  — czy WSZYSTKIE spełniają
print(all(x % 2 == 0 for x in liczby)) # False

haslo = "Tajne123"
silne = (len(haslo) >= 8
         and any(z.isdigit() for z in haslo)
         and any(z.isupper() for z in haslo))
print(silne)     # True
```

## Rozpakowywanie z gwiazdką

```python
pierwszy, *reszta = [5, 3, 8, 1]
print(pierwszy, reszta)       # 5 [3, 8, 1]

*poczatek, ostatni = "abcd"
print(poczatek, ostatni)      # ['a', 'b', 'c'] d

print(*[1, 2, 3])             # 1 2 3 — elementy jako osobne argumenty print
```

## Zadanie

1. Jednym wyrażeniem listowym utwórz listę liczb od 1 do 100 podzielnych przez 7, ale niepodzielnych przez 2.
2. Z listy słów wybierz te dłuższe niż 4 litery i zamień je na wielkie litery.
3. Posortuj listę napisów według długości, a przy równej długości — alfabetycznie.
4. Mając listy `imiona` i `punkty`, wypisz osobę z najwyższym wynikiem (użyj `zip` i `max` z `key`).
5. Sprawdź `all`/`any`, czy lista liczb jest ściśle rosnąca.
6. Policz jednym wyrażeniem, ile liczb od 1 do 1000 ma sumę cyfr równą 10 (`sum(int(c) for c in str(n))`).
