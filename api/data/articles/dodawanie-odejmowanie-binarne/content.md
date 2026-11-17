Komputer liczy wyłącznie na zerach i jedynkach, a mimo to dodaje, odejmuje, mnoży i dzieli. **Dodawanie i odejmowanie liczb binarnych** robimy dokładnie tak jak pisemnie w szkole podstawowej — tylko że cyfry są dwie, a „dziesiątka” pojawia się już przy **2**. Na maturze z informatyki to podstawa zadań o systemach liczbowych.

## Zasady dodawania

W systemie dwójkowym są tylko cztery przypadki (plus jeden z przeniesieniem):

| Działanie | Wynik | Zapisujemy | Przenosimy |
|---|---|---|---|
| 0 + 0 | 0 | 0 | 0 |
| 0 + 1 | 1 | 1 | 0 |
| 1 + 0 | 1 | 1 | 0 |
| 1 + 1 | **10** (czyli 2) | 0 | **1** |
| 1 + 1 + 1 | **11** (czyli 3) | 1 | **1** |

Najważniejsze: **1 + 1 = 10** — zapisujemy 0 i przenosimy 1 do następnej kolumny, tak jak 5 + 5 = 10 w systemie dziesiętnym.

## Dodawanie pisemne krok po kroku

Dodajmy **1011** (11) i **110** (6). Liczby piszemy jedna pod drugą, wyrównane do prawej, i liczymy od prawej strony:

```text
      1 1 1          ← przeniesienia
        1 0 1 1      (11)
    +   0 1 1 0      ( 6)
    -----------
      1 0 0 0 1      (17)
```

| Kolumna (od prawej) | Liczymy | Zapisujemy | Przeniesienie |
|---|---|---|---|
| 1. | 1 + 0 | 1 | 0 |
| 2. | 1 + 1 | 0 | 1 |
| 3. | 0 + 1 + **1** | 0 | 1 |
| 4. | 1 + 0 + **1** | 0 | 1 |
| 5. | **1** | 1 | — |

Wynik: **1011₂ + 110₂ = 10001₂**, czyli 11 + 6 = 17. Zgadza się.

Drugi przykład — tutaj w kolumnie spotykają się trzy jedynki:

```text
      1 1 1          ← przeniesienia
      0 1 1 1        ( 7)
    + 0 1 1 1        ( 7)
    ---------
      1 1 1 0        (14)
```

W drugiej i trzeciej kolumnie liczymy 1 + 1 + 1 = 11₂: zapisujemy **1** i przenosimy **1**.

> **Sprawdzaj wynik w systemie dziesiętnym.** Zamień obie liczby i wynik na dziesiętne — to zajmuje chwilę i wyłapuje większość pomyłek.

## Zasady odejmowania

| Działanie | Wynik | Uwagi |
|---|---|---|
| 0 − 0 | 0 | |
| 1 − 0 | 1 | |
| 1 − 1 | 0 | |
| 0 − 1 | **1** | z **pożyczką** 1 z następnej kolumny (liczymy 10₂ − 1 = 1) |

Pożyczka działa jak w systemie dziesiętnym: gdy od 0 trzeba odjąć 1, pożyczamy z kolumny po lewej. Pożyczona jedynka jest warta **2** w bieżącej kolumnie (a nie 10, jak w dziesiętnym).

## Odejmowanie pisemne krok po kroku

Odejmijmy **1101** (13) − **110** (6):

```text
      1 1 0 1        (13)
    − 0 1 1 0        ( 6)
    ---------
      0 1 1 1        ( 7)
```

| Kolumna (od prawej) | Liczymy | Zapisujemy | Pożyczka z następnej kolumny |
|---|---|---|---|
| 1. | 1 − 0 | 1 | nie |
| 2. | 0 − 1 → **10** − 1 | 1 | **tak** |
| 3. | (1 − **1**) − 1 → 0 − 1 → **10** − 1 | 1 | **tak** |
| 4. | (1 − **1**) − 0 | 0 | nie |

Wynik: **1101₂ − 110₂ = 111₂**, czyli 13 − 6 = 7.

Pożyczka potrafi „przejść” przez kilka zer. Na przykład **10000** (16) − **1** (1): w pierwszej kolumnie pożyczamy, ale sąsiad to 0, więc on też musi pożyczyć — i tak aż do jedynki na początku:

```text
      1 0 0 0 0      (16)
    − 0 0 0 0 1      ( 1)
    -----------
      0 1 1 1 1      (15)
```

To samo widać w systemie dziesiętnym: 10000 − 1 = 9999. W dwójkowym „dziewiątkami” są jedynki.

## Odejmowanie przez dodawanie — kod U2

Procesor nie ma osobnego układu do odejmowania. Zamiast liczyć **a − b**, liczy **a + (−b)**, a liczby ujemne zapisuje w **kodzie uzupełnień do dwóch (U2)**. Liczbę przeciwną w U2 dostajemy w dwóch krokach:

1. **odwracamy wszystkie bity** (0 ↔ 1),
2. **dodajemy 1**.

Ważne: działamy na **stałej liczbie bitów**, np. 8.

**Przykład: 13 − 6 na 8 bitach**

```text
 6 =  00000110
odwracamy bity  →  11111001
dodajemy 1      →  11111010   (to jest −6 w U2)

      00001101    (13)
    + 11111010    (−6)
    ----------
    1 00000111    → odrzucamy 9. bit → 00000111 = 7
```

Jedynkę, która „wyszła” poza 8 bitów, po prostu **odrzucamy**.

**Przykład: 6 − 13 (wynik ujemny)**

```text
13 =  00001101
odwracamy bity  →  11110010
dodajemy 1      →  11110011   (−13 w U2)

      00000110    ( 6)
    + 11110011    (−13)
    ----------
      11111001    = −7
```

Pierwszy bit to **1**, więc wynik jest ujemny. W U2 najstarszy bit ma wagę ujemną: **11111001** = −128 + 64 + 32 + 16 + 8 + 1 = **−7**.

| Liczba | Zapis U2 (8 bitów) |
|---|---|
| 7 | 00000111 |
| 1 | 00000001 |
| 0 | 00000000 |
| −1 | 11111111 |
| −7 | 11111001 |
| −128 | 10000000 |

Na 8 bitach w U2 zmieszczą się liczby od **−128** do **127**.

## Przepełnienie

Gdy wynik nie mieści się w przewidzianej liczbie bitów, dostajemy **przepełnienie** (ang. *overflow*):

- **bez znaku, 8 bitów (0…255):** 200 + 100 = 300, ale zostaje tylko 300 − 256 = **44** (00101100), a dziewiąta jedynka przepada,
- **U2, 8 bitów (−128…127):** 100 + 50 = 150 daje **10010110**, co w U2 oznacza **−106** — suma dwóch liczb dodatnich wyszła ujemna.

Prosta reguła dla U2: przepełnienie wystąpiło, jeśli dodajemy dwie liczby **o tym samym znaku**, a wynik ma **znak przeciwny**.

## Sprawdzanie w Pythonie

Python sam zamienia systemy liczbowe — świetnie nadaje się do sprawdzania rachunków:

```python
a = int("1011", 2)        # 11
b = int("110", 2)         # 6
print(bin(a + b))         # 0b10001
print(format(a + b, "b")) # 10001 — bez przedrostka 0b

print(format(13 - 6, "08b"))        # 00000111
print(format((6 - 13) & 0xFF, "08b"))  # 11111001 — wynik ujemny w U2 na 8 bitach
```

Zapis `& 0xFF` zostawia tylko 8 ostatnich bitów — dokładnie tak, jak robi to 8-bitowy rejestr procesora.

Na maturze czasem trzeba jednak dodać liczby binarne **bez zamiany na dziesiętne**, np. gdy są bardzo długie. Oto dodawanie pisemne przeniesione do kodu:

```python
def dodaj_bin(x, y):
    n = max(len(x), len(y))
    x, y = x.zfill(n), y.zfill(n)   # wyrównanie zerami z lewej
    wynik = ""
    przeniesienie = 0
    for i in range(n - 1, -1, -1):  # od prawej do lewej
        suma = int(x[i]) + int(y[i]) + przeniesienie
        wynik = str(suma % 2) + wynik
        przeniesienie = suma // 2
    if przeniesienie:
        wynik = "1" + wynik
    return wynik

print(dodaj_bin("1011", "110"))   # 10001
print(dodaj_bin("111", "111"))    # 1110
```

`suma % 2` to cyfra, którą zapisujemy, a `suma // 2` — przeniesienie do następnej kolumny.

## Najczęstsze błędy

| Błąd | Jak powinno być |
|---|---|
| 1 + 1 = 2 | w systemie dwójkowym nie ma cyfry 2: **1 + 1 = 10** |
| zapomniane przeniesienie w ostatniej kolumnie | wynik może mieć **o jedną cyfrę więcej** niż składniki |
| liczby wyrównane do lewej | wyrównujemy **do prawej**, krótszą liczbę uzupełniamy zerami |
| w U2 tylko odwrócone bity | po odwróceniu trzeba jeszcze **dodać 1** |
| w U2 zostawiona dodatkowa jedynka z lewej | bit wychodzący poza ustaloną liczbę bitów **odrzucamy** |

## Zadania do samodzielnego rozwiązania

1. Oblicz **101101₂ + 11011₂**.
2. Oblicz **11001₂ − 1011₂**.
3. Ile wyniesie **11111111₂ + 1** w rejestrze 8-bitowym bez znaku?
4. Zapisz w U2 na 8 bitach wynik działania **5 − 12**.

**Odpowiedzi:** 1) 1001000₂ (45 + 27 = 72), 2) 1110₂ (25 − 11 = 14), 3) 00000000 — przepełnienie, dziewiąta jedynka przepada (255 + 1 = 256), 4) 11111001 (−7).

Zamianę liczb między systemami i więcej zadań z liczbami znajdziesz w lekcji 16 kursu [Python od podstaw do matury](/kursy/python-od-podstaw).
