**Obiekt** grupuje powiązane dane pod nazwanymi **kluczami** (właściwościami). To podstawowa struktura w JavaScripcie — użytkownik, pytanie quizu, ustawienia aplikacji.

## Tworzenie i odczyt

```js
const uczen = {
  imie: "Ola",
  wiek: 17,
  klasa: "3A",
  zainteresowania: ["informatyka", "fotografia"],
  adres: { miasto: "Kraków", kod: "30-001" },
  "ulubiony-przedmiot": "matematyka",   // klucz ze znakami specjalnymi — w cudzysłowie
};

uczen.imie                    // "Ola" — notacja kropkowa
uczen["wiek"]                 // 17 — notacja nawiasowa
uczen.adres.miasto            // "Kraków"
uczen["ulubiony-przedmiot"]   // tylko nawiasy
uczen.telefon                 // undefined

const pole = "klasa";
uczen[pole]                   // "3A" — klucz ze zmiennej
```

## Dodawanie, zmiana, usuwanie

```js
uczen.email = "ola@example.com";   // dodanie
uczen.wiek = 18;                   // zmiana
delete uczen["ulubiony-przedmiot"];  // usunięcie

"email" in uczen                   // true
Object.hasOwn(uczen, "telefon")    // false
```

## Metody — funkcje w obiekcie

```js
const licznik = {
  wartosc: 0,
  zwieksz() {
    this.wartosc++;
    return this.wartosc;
  },
};

licznik.zwieksz();   // 1
licznik.zwieksz();   // 2
```

`this` wewnątrz metody oznacza **obiekt, na którym ją wywołano**. Szczegóły i pułapki — lekcja 14.

## Skróty przy tworzeniu obiektów

```js
const imie = "Jan";
const wiek = 18;

const osoba = { imie, wiek };            // to samo co { imie: imie, wiek: wiek }

const klucz = "punkty";
const wynik = { [klucz]: 95 };           // { punkty: 95 } — klucz obliczany
```

## Przechodzenie po obiekcie

```js
const ceny = { chleb: 4.5, mleko: 3.2, masło: 8.9 };

Object.keys(ceny)      // ["chleb", "mleko", "masło"]
Object.values(ceny)    // [4.5, 3.2, 8.9]
Object.entries(ceny)   // [["chleb", 4.5], ["mleko", 3.2], ["masło", 8.9]]

for (const [produkt, cena] of Object.entries(ceny)) {
  console.log(`${produkt}: ${cena.toFixed(2)} zł`);
}

const razem = Object.values(ceny).reduce((s, c) => s + c, 0);   // 16.6
```

## Destrukturyzacja

Wyciąganie wartości do zmiennych w jednej linii:

```js
const { imie: imieUcznia, klasa, telefon = "brak" } = uczen;
// imieUcznia = "Ola", klasa = "3A", telefon = "brak" (wartość domyślna)

const { adres: { miasto } } = uczen;   // zagnieżdżona — miasto = "Kraków"

// z tablic — według pozycji
const [pierwszy, drugi, ...reszta] = [10, 20, 30, 40];
// pierwszy = 10, drugi = 20, reszta = [30, 40]

// zamiana wartości
let a = 1, b = 2;
[a, b] = [b, a];   // a = 2, b = 1
```

Bardzo często w parametrach funkcji:

```js
function wizytowka({ imie, klasa = "?" }) {
  return `${imie}, klasa ${klasa}`;
}

wizytowka(uczen);   // "Ola, klasa 3A"
```

## Spread — kopiowanie i łączenie

```js
const domyslne = { motyw: "jasny", jezyk: "pl", powiadomienia: true };
const wybrane = { motyw: "ciemny" };

const ustawienia = { ...domyslne, ...wybrane };
// { motyw: "ciemny", jezyk: "pl", powiadomienia: true } — późniejsze nadpisują

const kopia = { ...uczen, wiek: 19 };   // kopia z jedną zmianą
```

> Spread robi **płytką kopię** — zagnieżdżone obiekty (np. `adres`) nadal są wspólne. Pełną (głęboką) kopię zrobisz przez `structuredClone(uczen)`.

## Porównywanie obiektów

```js
{ a: 1 } === { a: 1 }   // false — dwa różne obiekty w pamięci
const x = { a: 1 };
const y = x;
x === y                 // true — ta sama referencja
```

## Zadanie

1. Utwórz obiekt `ksiazka` (tytuł, autor, rok, gatunki — tablica, wypozyczona — boolean).
2. Dodaj metodę `opis()`, która zwraca „Tytuł — Autor (rok)” z użyciem `this`.
3. Wypisz wszystkie pola przez `Object.entries` i `for…of`.
4. Wyciągnij destrukturyzacją `tytul` i `autor`, a `wydawnictwo` z wartością domyślną „nieznane”.
5. Utwórz kopię z `wypozyczona: true`, nie zmieniając oryginału, i porównaj oba obiekty.
