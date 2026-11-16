W ostatniej lekcji zbudujesz kompletny program konsolowy **„Dziennik ocen”**, który łączy wszystko z kursu: funkcje, kolekcje, pliki, wyjątki, moduły i klasy. Poniżej jest działający szkielet — rozbuduj go według zadań na końcu.

## Struktura projektu

```text
dziennik/
├── main.py         — menu i obsługa użytkownika
├── model.py        — klasy Uczen i Dziennik (logika, bez input/print)
├── magazyn.py      — odczyt i zapis pliku JSON
└── dziennik.json   — dane (powstaje automatycznie)
```

> Zasada: **logika** (co się dzieje z danymi) jest oddzielona od **interfejsu** (jak program rozmawia z użytkownikiem). Klasy z `model.py` da się przetestować bez wpisywania czegokolwiek z klawiatury.

## `model.py` — logika

```python
from dataclasses import dataclass, field

OCENY = (1, 2, 3, 4, 5, 6)


@dataclass
class Uczen:
    imie: str
    nazwisko: str
    oceny: dict[str, list[int]] = field(default_factory=dict)

    @property
    def pelne_imie(self):
        return f"{self.imie} {self.nazwisko}"

    def dodaj_ocene(self, przedmiot, ocena):
        if ocena not in OCENY:
            raise ValueError(f"Ocena musi być liczbą od 1 do 6, a jest: {ocena}")
        self.oceny.setdefault(przedmiot.lower(), []).append(ocena)

    def srednia(self, przedmiot=None):
        if przedmiot:
            lista = self.oceny.get(przedmiot.lower(), [])
        else:
            lista = [o for oceny in self.oceny.values() for o in oceny]
        return round(sum(lista) / len(lista), 2) if lista else None


class Dziennik:
    def __init__(self, uczniowie=None):
        self.uczniowie = uczniowie or []

    def dodaj_ucznia(self, imie, nazwisko):
        imie, nazwisko = imie.strip().capitalize(), nazwisko.strip().capitalize()
        if not imie or not nazwisko:
            raise ValueError("Imię i nazwisko nie mogą być puste.")
        if self.znajdz(imie, nazwisko):
            raise ValueError(f"{imie} {nazwisko} już jest w dzienniku.")
        uczen = Uczen(imie, nazwisko)
        self.uczniowie.append(uczen)
        return uczen

    def znajdz(self, imie, nazwisko):
        for u in self.uczniowie:
            if (u.imie.lower(), u.nazwisko.lower()) == (imie.strip().lower(), nazwisko.strip().lower()):
                return u
        return None

    def ranking(self):
        ze_srednia = [u for u in self.uczniowie if u.srednia() is not None]
        return sorted(ze_srednia, key=lambda u: (-u.srednia(), u.nazwisko, u.imie))

    def przedmioty(self):
        return sorted({p for u in self.uczniowie for p in u.oceny})
```

## `magazyn.py` — zapis w pliku JSON

```python
import json
from model import Uczen, Dziennik


def wczytaj(nazwa):
    try:
        with open(nazwa, encoding="utf-8") as f:
            dane = json.load(f)
    except FileNotFoundError:
        return Dziennik()                      # pierwsze uruchomienie
    except json.JSONDecodeError:
        print(f"Uwaga: plik {nazwa} jest uszkodzony — zaczynam od pustego dziennika.")
        return Dziennik()
    return Dziennik([Uczen(**u) for u in dane])


def zapisz(nazwa, dziennik):
    dane = [vars(u) for u in dziennik.uczniowie]
    with open(nazwa, "w", encoding="utf-8") as f:
        json.dump(dane, f, ensure_ascii=False, indent=2)
```

`json.dump` z `ensure_ascii=False` zapisuje polskie litery normalnie, a `indent=2` robi czytelne wcięcia. `vars(u)` zamienia obiekt na słownik jego atrybutów.

## `main.py` — menu

```python
from magazyn import wczytaj, zapisz

PLIK = "dziennik.json"


def wczytaj_ocene():
    while True:
        try:
            return int(input("Ocena (1–6): "))
        except ValueError:
            print("Wpisz liczbę.")


def pokaz_ranking(dziennik):
    ranking = dziennik.ranking()
    if not ranking:
        print("Brak ocen.")
        return
    for miejsce, u in enumerate(ranking, start=1):
        print(f"{miejsce:>2}. {u.pelne_imie:<25} {u.srednia():.2f}")


def main():
    dziennik = wczytaj(PLIK)
    print(f"Wczytano uczniów: {len(dziennik.uczniowie)}")

    while True:
        print("\n1 — dodaj ucznia   2 — dodaj ocenę   3 — ranking   4 — średnie z przedmiotu   0 — koniec")
        wybor = input("> ").strip()

        try:
            match wybor:
                case "1":
                    u = dziennik.dodaj_ucznia(input("Imię: "), input("Nazwisko: "))
                    print(f"Dodano: {u.pelne_imie}")
                case "2":
                    u = dziennik.znajdz(input("Imię: "), input("Nazwisko: "))
                    if u is None:
                        print("Nie ma takiego ucznia.")
                        continue
                    u.dodaj_ocene(input("Przedmiot: "), wczytaj_ocene())
                    print("Zapisano ocenę.")
                case "3":
                    pokaz_ranking(dziennik)
                case "4":
                    przedmiot = input(f"Przedmiot {dziennik.przedmioty()}: ")
                    for u in dziennik.uczniowie:
                        s = u.srednia(przedmiot)
                        if s is not None:
                            print(f"{u.pelne_imie:<25} {s:.2f}")
                case "0":
                    break
                case _:
                    print("Nieznana opcja.")
        except ValueError as e:
            print("Błąd:", e)

        zapisz(PLIK, dziennik)     # zapis po każdej operacji

    print("Do zobaczenia!")


if __name__ == "__main__":
    main()
```

Uruchom: `python main.py`. Dane przetrwają zamknięcie programu, bo po każdej operacji trafiają do `dziennik.json`.

## Testy logiki

Plik `testy.py` — sprawdza klasy bez menu i bez plików:

```python
from model import Dziennik

d = Dziennik()
ola = d.dodaj_ucznia("ola", "nowak")
jan = d.dodaj_ucznia("Jan", "Kowalski")

ola.dodaj_ocene("Matematyka", 5)
ola.dodaj_ocene("matematyka", 6)
ola.dodaj_ocene("Informatyka", 6)
jan.dodaj_ocene("Informatyka", 4)

assert ola.pelne_imie == "Ola Nowak"
assert ola.srednia("MATEMATYKA") == 5.5
assert ola.srednia() == 5.67
assert [u.imie for u in d.ranking()] == ["Ola", "Jan"]
assert d.przedmioty() == ["informatyka", "matematyka"]

try:
    jan.dodaj_ocene("Fizyka", 7)
    assert False, "powinien być błąd"
except ValueError:
    pass

try:
    d.dodaj_ucznia("OLA", "Nowak")
    assert False, "powinien być błąd"
except ValueError:
    pass

print("Wszystkie testy zaliczone")
```

## Rozbudowa — zadania projektowe

1. **Usuwanie** (lekcje 8, 14): usuwanie ucznia i ostatniej oceny z przedmiotu — z potwierdzeniem `t/n`.
2. **Wagi ocen** (lekcja 9): ocena z wagą (sprawdzian 3, kartkówka 2, odpowiedź 1) i średnia ważona.
3. **Statystyki** (lekcje 10, 13): najczęstsza ocena (`Counter`), mediana (`statistics.median`), rozkład ocen 1–6 narysowany gwiazdkami.
4. **Import z CSV** (lekcja 11): wczytanie listy uczniów z pliku `klasa.csv` w formacie `nazwisko;imię` — z pominięciem błędnych wierszy i raportem, ile ich było.
5. **Raport do pliku** (lekcja 11): zapis rankingu do `raport.txt` z wyrównanymi kolumnami i datą wygenerowania (`datetime`).
6. **Zagrożeni** (lekcja 10): lista uczniów ze średnią poniżej 2,0 z dowolnego przedmiotu — jednym wyrażeniem listowym.
7. **Wyszukiwarka** (lekcja 17): szukanie ucznia po fragmencie nazwiska, bez rozróżniania wielkości liter i polskich znaków (`ą` → `a`).
8. **Sortowanie własne** (lekcja 18): ranking posortowany Twoją implementacją sortowania przez scalanie zamiast `sorted`.

**Kryteria zaliczenia:**

- program nie kończy się błędem przy żadnych danych wpisanych z klawiatury (litery zamiast liczb, puste pola, nieistniejący uczeń),
- uszkodzony lub brakujący plik `dziennik.json` nie zatrzymuje programu,
- `model.py` nie używa `input` ani `print`, a `testy.py` przechodzi bez błędów,
- kod jest podzielony na funkcje i moduły; nazwy zmiennych mówią, co przechowują.

Gratulacje — ukończyłeś kurs Pythona! Znasz już składnię, struktury danych, pliki, wyjątki, klasy, rekurencję i najważniejsze algorytmy maturalne. Sprawdź swoją wiedzę w **quizie** kursu, a potem ćwicz na arkuszach maturalnych. Kolejne kroki: analiza danych (**pandas**, **matplotlib**), aplikacje internetowe (**Flask**, **Django**) albo automatyzacja codziennych zadań.
