**Python** to jeden z najpopularniejszych języków programowania na świecie: prosty w zapisie, czytelny i bardzo wszechstronny. Używa się go w analizie danych, sztucznej inteligencji, automatyzacji, aplikacjach internetowych — i **na maturze z informatyki**, gdzie jest jednym z dostępnych języków (obok C++ i Javy). W tym kursie przejdziesz od pierwszej linijki kodu do rozwiązywania typowych zadań maturalnych.

## Instalacja

1. Pobierz Pythona ze strony [python.org](https://www.python.org/downloads/) (wersja **3.x** — Python 2 nie jest już rozwijany).
2. W systemie Windows zaznacz w instalatorze **„Add python.exe to PATH”**.
3. Sprawdź instalację w terminalu (Windows: `cmd` lub PowerShell, macOS/Linux: Terminal):

```bash
python --version      # Windows
python3 --version     # macOS i Linux
```

### Gdzie pisać kod?

| Narzędzie | Do czego |
|---|---|
| **IDLE** | instalowany razem z Pythonem; prosty edytor, dostępny też na maturze |
| **Visual Studio Code** + rozszerzenie *Python* | wygodny edytor do większych projektów |
| **PyCharm Community** | rozbudowane środowisko dla Pythona |
| tryb interaktywny (`python` w terminalu) | szybkie sprawdzenie pojedynczych poleceń |

> Na maturze dostępne środowiska zależą od szkoły — warto ćwiczyć w tym samym, w którym będziesz pisać egzamin (najczęściej IDLE, VS Code lub PyCharm).

## Pierwszy program

Utwórz plik `witaj.py`:

```python
print("Witaj, świecie!")
print("Uczę się Pythona.")
```

Uruchom go: w IDLE klawiszem **F5**, w VS Code przyciskiem ▶, a w terminalu poleceniem:

```bash
python witaj.py
```

## Tryb interaktywny

Po wpisaniu `python` w terminalu (lub w oknie *Shell* w IDLE) pojawia się znak zachęty `>>>`. Każde polecenie wykonuje się od razu, a wynik wyrażenia jest wypisywany automatycznie:

```python
>>> 2 + 3
5
>>> 7 * 6
42
>>> "ala" * 3
'alaalaala'
```

To świetny „kalkulator” do sprawdzania, jak działa dany fragment kodu.

## `print` — wypisywanie

```python
print("Wynik:", 42)              # Wynik: 42  — argumenty oddzielone spacją
print("a", "b", "c", sep="-")    # a-b-c      — własny separator
print("bez nowej linii", end="")  # end zmienia znak na końcu (domyślnie "\n")
print()                          # pusta linia
```

## `input` — wczytywanie danych

```python
imie = input("Jak masz na imię? ")
print("Cześć,", imie)
```

`input` zawsze zwraca **tekst** — jak zamienić go na liczbę, zobaczysz w następnej lekcji.

## Składnia Pythona

- **Wcięcia mają znaczenie.** Bloki kodu (np. wnętrze `if` czy pętli) oznacza się wcięciem — standardowo **4 spacjami**, a nie nawiasami klamrowymi jak w C++ czy JavaScripcie.
- Jedno polecenie = jedna linia; **nie trzeba średników**.
- Wielkość liter ma znaczenie: `print` to nie to samo co `Print`.
- **Komentarze** zaczynają się od `#`:

```python
# To jest komentarz — Python go pomija
wiek = 17  # komentarz na końcu linii

if wiek >= 18:
    print("Pełnoletni")      # wcięcie — wnętrze bloku if
print("Koniec")              # bez wcięcia — poza blokiem
```

Błędne wcięcie kończy się błędem `IndentationError`.

## Czytanie komunikatów o błędach

```text
Traceback (most recent call last):
  File "witaj.py", line 3, in <module>
    prnt("Hej")
    ^^^^
NameError: name 'prnt' is not defined. Did you mean: 'print'?
```

Czytaj komunikat **od dołu**: ostatnia linia mówi, **co** się stało (`NameError` — nieznana nazwa), a wyżej jest **plik i numer linii**. Nowsze wersje Pythona często podpowiadają poprawną nazwę.

## Zadanie

1. Zainstaluj Pythona i sprawdź wersję w terminalu.
2. Napisz program, który wypisze Twoje imię, klasę i ulubiony przedmiot — każde w osobnej linii.
3. W trybie interaktywnym oblicz: `2 ** 10`, `17 / 5`, `"-" * 20`.
4. Napisz program, który zapyta o imię i miasto, a potem wypisze: `Ola mieszka w Krakowie.`
5. Celowo zrób literówkę w `print` i błędne wcięcie — przeczytaj oba komunikaty o błędach.
