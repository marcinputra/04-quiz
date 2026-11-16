**Sortowanie bąbelkowe** to najprostszy algorytm sortowania — i klasyk matury z informatyki. W praktyce się go nie używa, ale świetnie uczy, jak działa sortowanie i czym jest złożoność algorytmu.

## Idea

Przechodzimy po liście i **porównujemy sąsiednie elementy**. Jeśli są w złej kolejności — zamieniamy je. Po każdym przebiegu największy element „wypływa” na koniec listy jak bąbelek powietrza. Powtarzamy, aż lista będzie posortowana.

## Przykład krok po kroku

Sortujemy `[5, 1, 4, 2, 8]`:

| Przebieg | Co się dzieje | Lista po przebiegu |
|---|---|---|
| 1 | 5↔1, 5↔4, 5↔2, 5 i 8 bez zamiany | `[1, 4, 2, 5, 8]` — 8 na swoim miejscu |
| 2 | 1 i 4 bez zamiany, 4↔2 | `[1, 2, 4, 5, 8]` |
| 3 | brak zamian | `[1, 2, 4, 5, 8]` — koniec |

## Kod w Pythonie

```python
def sortowanie_babelkowe(t):
    t = t.copy()                     # nie zmieniamy oryginału
    n = len(t)
    for i in range(n - 1):
        zamiana = False
        for j in range(n - 1 - i):   # ostatnie i elementów są już na miejscu
            if t[j] > t[j + 1]:
                t[j], t[j + 1] = t[j + 1], t[j]
                zamiana = True
        if not zamiana:              # nic nie zamieniono — lista posortowana
            break
    return t

print(sortowanie_babelkowe([5, 1, 4, 2, 8]))   # [1, 2, 4, 5, 8]
```

Dwie optymalizacje, które warto znać:

- `range(n - 1 - i)` — po `i` przebiegach ostatnie `i` elementów są już posortowane, więc ich nie sprawdzamy,
- flaga `zamiana` — jeśli w całym przebiegu nic się nie zmieniło, kończymy wcześniej.

Sortowanie **malejące**? Wystarczy zmienić `>` na `<`.

## Złożoność

| Przypadek | Liczba porównań | Złożoność |
|---|---|---|
| lista losowa lub odwrócona | ok. n² / 2 | **O(n²)** |
| lista już posortowana (z flagą) | n − 1 | **O(n)** |

Dwukrotnie dłuższa lista oznacza około **czterokrotnie** dłuższe sortowanie.

## Bąbelkowe kontra `sorted()`

Pomiar na losowych liczbach (Python 3.14):

| Liczba elementów | Bąbelkowe | `sorted()` |
|---|---|---|
| 1 000 | 0,027 s | 0,00008 s |
| 5 000 | 0,72 s | 0,0004 s |

Przy 5000 elementów wbudowane `sorted()` jest około **1700 razy szybsze** — działa w czasie **O(n log n)** i jest napisane w C. W prawdziwych programach używaj więc zawsze:

```python
liczby = [5, 1, 4, 2, 8]
print(sorted(liczby))                 # nowa lista: [1, 2, 4, 5, 8]
liczby.sort(reverse=True)             # sortowanie na miejscu, malejąco
print(sorted(["kiwi", "ananas", "fig"], key=len))   # według długości: ['fig', 'kiwi', 'ananas']
```

## Podsumowanie

- bąbelkowe = porównuj sąsiadów i zamieniaj, aż nie będzie zamian,
- złożoność **O(n²)**, z flagą **O(n)** dla posortowanych danych,
- na maturze: umieć napisać, prześledzić i ocenić złożoność,
- w praktyce: `sorted()` i `list.sort()`.

Inne algorytmy sortowania (przez wybieranie, wstawianie, scalanie, zliczanie) znajdziesz w lekcji 18 kursu [Python od podstaw do matury](/kursy/python-od-podstaw).
