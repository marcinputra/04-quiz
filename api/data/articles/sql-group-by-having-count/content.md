Zwykłe zapytanie `SELECT` zwraca pojedyncze wiersze tabeli. Bardzo często potrzebujemy jednak **podsumowania**: ilu uczniów jest w każdej klasie? Jaka jest średnia ocen z każdego przedmiotu? Którzy uczniowie mają średnią powyżej 4,5? Do takich pytań służą **funkcje agregujące** (`COUNT`, `SUM`, `AVG`, `MIN`, `MAX`) oraz klauzule **`GROUP BY`** i **`HAVING`**. To jeden z najważniejszych tematów w zadaniach z baz danych na **maturze z informatyki**.

## Przykładowa baza danych

Wszystkie przykłady korzystają z dwóch tabel. Tabela **`uczniowie`**:

| id | imie | nazwisko | klasa | plec | miasto |
|---|---|---|---|---|---|
| 1 | Ola | Nowak | 3A | K | Kraków |
| 2 | Jan | Kowalski | 3A | M | Kraków |
| 3 | Ewa | Wiśniewska | 3B | K | Tarnów |
| 4 | Piotr | Zieliński | 3B | M | Kraków |
| 5 | Anna | Wójcik | 3A | K | Tarnów |
| 6 | Kacper | Lewandowski | 3C | M | Bochnia |
| 7 | Zofia | Kamińska | 3B | K | Kraków |
| 8 | Michał | Dąbrowski | 3C | M | *NULL* |

Tabela **`oceny`** — każdy wiersz to jedna ocena jednego ucznia (`id_ucznia` wskazuje na `uczniowie.id`):

| id_ucznia | przedmiot | ocena |
|---|---|---|
| 1 | informatyka | 6 |
| 1 | matematyka | 5 |
| 1 | matematyka | 4 |
| 2 | informatyka | 4 |
| 2 | matematyka | 3 |
| 3 | informatyka | 5 |
| 3 | matematyka | 5 |
| 3 | matematyka | 6 |
| 4 | informatyka | 3 |
| 4 | matematyka | 2 |
| 5 | informatyka | 5 |
| 6 | informatyka | 2 |
| 6 | matematyka | 3 |
| 6 | matematyka | 2 |
| 7 | matematyka | 4 |

Michał (id 8) nie ma jeszcze żadnej oceny, a jego miasto jest nieznane (`NULL`) — przyda się to do pokazania kilku pułapek.

Możesz przepisać te tabele do dowolnej bazy (SQLite, MySQL, PostgreSQL, Access) i sprawdzać zapytania na bieżąco — wszystkie wyniki w artykule pochodzą z prawdziwych zapytań.

### Kod SQL tworzący tabele (do skopiowania)

```sql
CREATE TABLE uczniowie (
  id INTEGER PRIMARY KEY, imie VARCHAR(30), nazwisko VARCHAR(40),
  klasa VARCHAR(5), plec CHAR(1), miasto VARCHAR(40)
);
INSERT INTO uczniowie VALUES
(1,'Ola','Nowak','3A','K','Kraków'),      (2,'Jan','Kowalski','3A','M','Kraków'),
(3,'Ewa','Wiśniewska','3B','K','Tarnów'), (4,'Piotr','Zieliński','3B','M','Kraków'),
(5,'Anna','Wójcik','3A','K','Tarnów'),    (6,'Kacper','Lewandowski','3C','M','Bochnia'),
(7,'Zofia','Kamińska','3B','K','Kraków'), (8,'Michał','Dąbrowski','3C','M',NULL);

CREATE TABLE oceny (
  id INTEGER PRIMARY KEY, id_ucznia INTEGER, przedmiot VARCHAR(30), ocena INTEGER
);
INSERT INTO oceny VALUES
(1,1,'informatyka',6),(2,1,'matematyka',5),(3,1,'matematyka',4),
(4,2,'informatyka',4),(5,2,'matematyka',3),
(6,3,'informatyka',5),(7,3,'matematyka',5),(8,3,'matematyka',6),
(9,4,'informatyka',3),(10,4,'matematyka',2),
(11,5,'informatyka',5),
(12,6,'informatyka',2),(13,6,'matematyka',3),(14,6,'matematyka',2),
(15,7,'matematyka',4);
```

## Funkcje agregujące

Funkcja agregująca bierze **wiele wierszy** i zwraca **jedną wartość**:

| Funkcja | Co liczy |
|---|---|
| `COUNT(*)` | liczbę wierszy |
| `COUNT(kolumna)` | liczbę wierszy, w których kolumna **nie jest `NULL`** |
| `COUNT(DISTINCT kolumna)` | liczbę **różnych** wartości (bez `NULL`) |
| `SUM(kolumna)` | sumę |
| `AVG(kolumna)` | średnią |
| `MIN(kolumna)`, `MAX(kolumna)` | najmniejszą i największą wartość |

Bez `GROUP BY` cała tabela tworzy **jedną grupę**, więc wynik ma jeden wiersz:

```sql
SELECT COUNT(*)            AS liczba,
       SUM(ocena)          AS suma,
       ROUND(AVG(ocena), 2) AS srednia,
       MIN(ocena)          AS najnizsza,
       MAX(ocena)          AS najwyzsza
FROM oceny;
```

| liczba | suma | srednia | najnizsza | najwyzsza |
|---|---|---|---|---|
| 15 | 59 | 3.93 | 2 | 6 |

`AS` nadaje kolumnie wyniku czytelną nazwę (alias), a `ROUND(…, 2)` zaokrągla średnią do dwóch miejsc po przecinku.

### `COUNT(*)`, `COUNT(kolumna)` i `COUNT(DISTINCT …)` — to nie to samo

```sql
SELECT COUNT(*)               AS wszyscy,
       COUNT(miasto)          AS z_miastem,
       COUNT(DISTINCT miasto) AS rozne_miasta
FROM uczniowie;
```

| wszyscy | z_miastem | rozne_miasta |
|---|---|---|
| 8 | 7 | 3 |

- `COUNT(*)` liczy **wszystkie wiersze** — 8 uczniów,
- `COUNT(miasto)` pomija wiersz Michała, bo jego miasto to `NULL` — 7,
- `COUNT(DISTINCT miasto)` liczy różne miasta: Kraków, Tarnów, Bochnia — 3.

> Ta różnica to częsta pułapka na maturze. Czytaj polecenie uważnie: „ilu uczniów” to `COUNT(*)`, „z ilu różnych miast” to `COUNT(DISTINCT miasto)`.

Pozostałe funkcje (`SUM`, `AVG`, `MIN`, `MAX`) również **pomijają `NULL`** — średnia liczy się tylko z istniejących wartości.

## `GROUP BY` — podsumowanie dla każdej grupy osobno

`GROUP BY` dzieli wiersze na **grupy o tej samej wartości** wskazanej kolumny, a funkcja agregująca liczy się **w każdej grupie osobno**.

Ilu uczniów jest w każdej klasie?

```sql
SELECT klasa, COUNT(*) AS liczba_uczniow
FROM uczniowie
GROUP BY klasa
ORDER BY klasa;
```

| klasa | liczba_uczniow |
|---|---|
| 3A | 3 |
| 3B | 3 |
| 3C | 2 |

Jak to działa krok po kroku:

1. baza zbiera wiersze z tą samą klasą w grupy: **3A** → Ola, Jan, Anna; **3B** → Ewa, Piotr, Zofia; **3C** → Kacper, Michał,
2. dla każdej grupy liczy `COUNT(*)`,
3. każda grupa daje **jeden wiersz** wyniku.

`GROUP BY` **nie gwarantuje kolejności** wierszy wyniku — np. PostgreSQL może zwrócić klasy w kolejności 3B, 3C, 3A. Jeśli kolejność ma znaczenie, zawsze dodaj `ORDER BY`.

### Średnia, minimum i maksimum z każdego przedmiotu

```sql
SELECT przedmiot,
       COUNT(*)             AS liczba_ocen,
       ROUND(AVG(ocena), 2) AS srednia,
       MIN(ocena)           AS min,
       MAX(ocena)           AS max
FROM oceny
GROUP BY przedmiot
ORDER BY przedmiot;
```

| przedmiot | liczba_ocen | srednia | min | max |
|---|---|---|---|---|
| informatyka | 6 | 4.17 | 2 | 6 |
| matematyka | 9 | 3.78 | 2 | 6 |

### Sortowanie wyników grupowania

Najczęściej chcemy wiedzieć, której grupy jest **najwięcej** — wtedy sortujemy po wyniku funkcji:

```sql
SELECT miasto, COUNT(*) AS liczba
FROM uczniowie
GROUP BY miasto
ORDER BY liczba DESC;
```

| miasto | liczba |
|---|---|
| Kraków | 4 |
| Tarnów | 2 |
| Bochnia | 1 |
| *NULL* | 1 |

Zwróć uwagę, że uczniowie bez podanego miasta tworzą **osobną grupę `NULL`**. Jeśli nie powinna się liczyć, dodaj `WHERE miasto IS NOT NULL`. (Kolejność wierszy z tą samą liczbą może się różnić w różnych bazach — jeśli ma znaczenie, dodaj drugi klucz sortowania, np. `ORDER BY liczba DESC, miasto`.)

Tylko **najliczniejsze** miasto: `ORDER BY liczba DESC LIMIT 1` (w Accessie: `SELECT TOP 1 …`).

Rozkład ocen — ile jest szóstek, piątek itd.:

```sql
SELECT ocena, COUNT(*) AS ile
FROM oceny
GROUP BY ocena
ORDER BY ocena DESC;
```

| ocena | ile |
|---|---|
| 6 | 2 |
| 5 | 4 |
| 4 | 3 |
| 3 | 3 |
| 2 | 3 |

### Grupowanie po kilku kolumnach

Grupa to wtedy każda **kombinacja** wartości — np. ile dziewcząt i ilu chłopców jest w każdej klasie:

```sql
SELECT klasa, plec, COUNT(*) AS liczba
FROM uczniowie
GROUP BY klasa, plec
ORDER BY klasa, plec;
```

| klasa | plec | liczba |
|---|---|---|
| 3A | K | 2 |
| 3A | M | 1 |
| 3B | K | 2 |
| 3B | M | 1 |
| 3C | M | 2 |

W 3C nie ma dziewcząt, więc kombinacja „3C, K” w ogóle się nie pojawia — `GROUP BY` tworzy tylko grupy, które istnieją w danych.

### Złota zasada `GROUP BY`

W `SELECT` mogą być tylko:

- kolumny wymienione w `GROUP BY`,
- funkcje agregujące.

To zapytanie jest **błędne**:

```sql
SELECT klasa, imie, COUNT(*)
FROM uczniowie
GROUP BY klasa;
```

W grupie 3A są trzy różne imiona — baza nie wie, które z nich pokazać. PostgreSQL odpowie:

```text
ERROR: column "uczniowie.imie" must appear in the GROUP BY clause or be used in an aggregate function
```

Podobny błąd zgłosi Access i MySQL (w domyślnym trybie). Uwaga: **SQLite** takie zapytanie wykona i pokaże przypadkowe imię z grupy — wynik wygląda poprawnie, ale jest bez sensu. Nie daj się zwieść.

## `WHERE` czy `HAVING`?

Obie klauzule **filtrują**, ale w innym momencie:

| | `WHERE` | `HAVING` |
|---|---|---|
| filtruje | **pojedyncze wiersze** | **gotowe grupy** |
| działa | **przed** grupowaniem | **po** grupowaniu |
| może używać funkcji agregujących | **nie** | **tak** |
| przykład | `WHERE plec = 'K'` | `HAVING COUNT(*) >= 3` |

Klasy, w których jest co najmniej 3 uczniów:

```sql
SELECT klasa, COUNT(*) AS liczba_uczniow
FROM uczniowie
GROUP BY klasa
HAVING COUNT(*) >= 3
ORDER BY klasa;
```

| klasa | liczba_uczniow |
|---|---|
| 3A | 3 |
| 3B | 3 |

Próba zapisania tego w `WHERE` kończy się błędem, bo w chwili działania `WHERE` grup — i ich liczności — jeszcze nie ma:

```sql
SELECT klasa, COUNT(*) FROM uczniowie
WHERE COUNT(*) >= 3          -- BŁĄD: misuse of aggregate / aggregate functions are not allowed in WHERE
GROUP BY klasa;
```

### `WHERE` i `HAVING` razem

Klasy, w których są co najmniej 2 dziewczęta:

```sql
SELECT klasa, COUNT(*) AS liczba
FROM uczniowie
WHERE plec = 'K'             -- 1. zostaw tylko dziewczęta
GROUP BY klasa               -- 2. pogrupuj je według klasy
HAVING COUNT(*) >= 2         -- 3. zostaw klasy z co najmniej 2 dziewczętami
ORDER BY klasa;
```

| klasa | liczba |
|---|---|
| 3A | 2 |
| 3B | 2 |

> Zasada praktyczna: jeśli warunek dotyczy **pojedynczego wiersza** (płeć, przedmiot, ocena) — `WHERE`. Jeśli dotyczy **wyniku funkcji** (liczby, średniej, sumy w grupie) — `HAVING`. Filtrowanie w `WHERE` jest też szybsze, bo baza grupuje mniej wierszy.

## Kolejność wykonywania zapytania

Piszemy w jednej kolejności, a baza wykonuje w innej:

| Kolejność zapisu | Kolejność wykonania |
|---|---|
| 1. `SELECT` | 1. `FROM` (i `JOIN`) — skąd dane |
| 2. `FROM` | 2. `WHERE` — filtr wierszy |
| 3. `WHERE` | 3. `GROUP BY` — tworzenie grup |
| 4. `GROUP BY` | 4. `HAVING` — filtr grup |
| 5. `HAVING` | 5. `SELECT` — obliczenie kolumn wyniku |
| 6. `ORDER BY` | 6. `ORDER BY` — sortowanie |

To wyjaśnia, dlaczego w `WHERE` nie da się użyć `COUNT(*)` (grup jeszcze nie ma), a w `ORDER BY` można użyć aliasu z `SELECT` (np. `ORDER BY liczba`). W `HAVING` bezpieczniej powtórzyć całą funkcję (`HAVING COUNT(*) >= 3`) — nie wszystkie bazy pozwalają tam na alias.

## Grupowanie danych z dwóch tabel

W praktyce dane są w kilku tabelach i łączymy je przez `JOIN`, a potem grupujemy.

### Średnia każdego ucznia

```sql
SELECT u.imie, u.nazwisko,
       COUNT(o.id)            AS liczba_ocen,
       ROUND(AVG(o.ocena), 2) AS srednia
FROM uczniowie u
JOIN oceny o ON o.id_ucznia = u.id
GROUP BY u.id, u.imie, u.nazwisko
ORDER BY srednia DESC, u.nazwisko;
```

| imie | nazwisko | liczba_ocen | srednia |
|---|---|---|---|
| Ewa | Wiśniewska | 3 | 5.33 |
| Ola | Nowak | 3 | 5.00 |
| Anna | Wójcik | 1 | 5.00 |
| Zofia | Kamińska | 1 | 4.00 |
| Jan | Kowalski | 2 | 3.50 |
| Piotr | Zieliński | 2 | 2.50 |
| Kacper | Lewandowski | 3 | 2.33 |

Grupujemy po `u.id`, a nie tylko po imieniu i nazwisku — dwóch uczniów mogłoby mieć te same dane osobowe, a `id` jest zawsze unikalne. Imię i nazwisko dopisujemy do `GROUP BY`, żeby móc je pokazać w `SELECT` (złota zasada).

### Uczniowie ze średnią co najmniej 4,5

```sql
SELECT u.imie, u.nazwisko, ROUND(AVG(o.ocena), 2) AS srednia
FROM uczniowie u
JOIN oceny o ON o.id_ucznia = u.id
GROUP BY u.id, u.imie, u.nazwisko
HAVING AVG(o.ocena) >= 4.5
ORDER BY srednia DESC, u.nazwisko;
```

| imie | nazwisko | srednia |
|---|---|---|
| Ewa | Wiśniewska | 5.33 |
| Ola | Nowak | 5.00 |
| Anna | Wójcik | 5.00 |

### Średnia z matematyki w każdej klasie

`WHERE` zostawia tylko oceny z matematyki, `GROUP BY` dzieli je według klasy ucznia:

```sql
SELECT u.klasa, ROUND(AVG(o.ocena), 2) AS srednia_matematyka
FROM uczniowie u
JOIN oceny o ON o.id_ucznia = u.id
WHERE o.przedmiot = 'matematyka'
GROUP BY u.klasa
ORDER BY srednia_matematyka DESC;
```

| klasa | srednia_matematyka |
|---|---|
| 3B | 4.25 |
| 3A | 4.00 |
| 3C | 2.50 |

### `LEFT JOIN` — nie zgub uczniów bez ocen

Zwykły `JOIN` pomija uczniów, którzy nie mają ani jednej oceny. Jeśli Michał ma się pojawić z wynikiem 0, potrzebny jest `LEFT JOIN` i **`COUNT(o.id)`**:

```sql
SELECT u.imie, COUNT(o.id) AS liczba_ocen
FROM uczniowie u
LEFT JOIN oceny o ON o.id_ucznia = u.id
GROUP BY u.id, u.imie
ORDER BY liczba_ocen, u.imie;
```

| imie | liczba_ocen |
|---|---|
| Michał | 0 |
| Anna | 1 |
| Zofia | 1 |
| Jan | 2 |
| Piotr | 2 |
| Ewa | 3 |
| Kacper | 3 |
| Ola | 3 |

> Gdyby zamiast `COUNT(o.id)` użyć `COUNT(*)`, Michał dostałby **1**, a nie 0. `LEFT JOIN` tworzy dla niego jeden wiersz z pustymi (`NULL`) kolumnami z tabeli `oceny` — `COUNT(*)` liczy ten wiersz, a `COUNT(o.id)` pomija `NULL`.

## SQL na maturze — w Accessie i LibreOffice Base

Na maturze zadania z baz danych rozwiązuje się zwykle w **MS Access** lub **LibreOffice Base** — w widoku projektu albo bezpośrednio w SQL. Grupowanie działa tak samo, z kilkoma różnicami:

- w widoku projektu Accessa grupowanie włącza przycisk **Sumy** (Σ) — w wierszu „Podsumowanie” wybierasz `Grupuj według`, `Policz`, `Średnia`, `Suma`, `Minimum`, `Maksimum`; warunek w kolumnie z funkcją trafia do `HAVING`, a w kolumnie z „Gdzie” — do `WHERE`,
- Access **nie obsługuje `COUNT(DISTINCT …)`** — różne wartości policzysz przez zapytanie w zapytaniu:

```sql
SELECT COUNT(*) AS rozne_miasta
FROM (SELECT DISTINCT miasto FROM uczniowie WHERE miasto IS NOT NULL) AS m;
```

- zamiast `LIMIT 1` w Accessie piszemy `SELECT TOP 1 …` (uwaga: przy remisie `TOP 1` zwróci wszystkie remisujące wiersze),
- teksty w Accessie można ujmować w cudzysłów `"…"` lub apostrof `'…'`.

**Na co uważać w odpowiedziach:**

- czy pytanie dotyczy **wierszy**, czy **różnych wartości** (`COUNT(*)` vs `COUNT(DISTINCT …)`),
- czy grupy z wartością `NULL` (puste pola) mają być liczone,
- czy w wyniku mają się znaleźć obiekty **bez** powiązanych danych (`LEFT JOIN`),
- czy przy „najwięcej / najmniej” może wystąpić **remis** — wtedy podaj wszystkie remisujące wartości.

## Ściąga

```sql
SELECT kolumna_grupy, FUNKCJA(kolumna) AS alias   -- tylko kolumny z GROUP BY + funkcje
FROM tabela
WHERE warunek_na_wiersze                         -- przed grupowaniem, bez funkcji
GROUP BY kolumna_grupy                           -- jeden wiersz wyniku na grupę
HAVING warunek_na_FUNKCJE                        -- po grupowaniu
ORDER BY alias DESC;                             -- sortowanie wyniku
```

## Zadania do samodzielnego rozwiązania

Rozwiąż na przykładowej bazie (odpowiedzi w nawiasach — sprawdź się):

1. Ile ocen ma każdy przedmiot? *(informatyka 6, matematyka 9)*
2. Z ilu różnych miast pochodzą uczniowie każdej klasy? *(3A — 2, 3B — 2, 3C — 1)*
3. Ile ocen (z obu przedmiotów) zebrali łącznie uczniowie każdej klasy? *(3A — 6, 3B — 6, 3C — 3)*
4. Którzy uczniowie mają co najmniej jedną ocenę 2 i ile ich mają? *(Piotr Zieliński — 1, Kacper Lewandowski — 2)*
5. Podaj klasy, w których średnia wszystkich ocen jest wyższa niż 4. *(3A — 4,5; 3B — 4,17)*
6. Ile jest ocen niedostatecznych i dopuszczających (1 i 2) w całej tabeli? *(3)*

Chcesz sprawdzić swoją wiedzę? Rozwiąż **quizy** z SQL i baz danych na tej stronie, a jeśli dopiero zaczynasz programować — zajrzyj do kursu [Python od podstaw do matury](/kursy/python-od-podstaw).
