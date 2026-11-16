Gdy potrzebujesz wielu obiektów **tego samego rodzaju** (wielu uczniów, wielu pytań, wielu postaci w grze), opisz je raz za pomocą **klasy** — „przepisu” na obiekt.

## Pierwsza klasa

```js
class Uczen {
  constructor(imie, klasa) {
    this.imie = imie;           // pola obiektu
    this.klasa = klasa;
    this.oceny = [];
  }

  dodajOcene(ocena) {           // metoda
    if (ocena < 1 || ocena > 6) throw new RangeError("Ocena musi być od 1 do 6");
    this.oceny.push(ocena);
    return this;                // pozwala łączyć wywołania
  }

  srednia() {
    if (this.oceny.length === 0) return 0;
    return this.oceny.reduce((s, o) => s + o, 0) / this.oceny.length;
  }
}

const ola = new Uczen("Ola", "3A");
ola.dodajOcene(5).dodajOcene(6).dodajOcene(4);
ola.srednia();               // 5
ola instanceof Uczen         // true
```

- `constructor` wywołuje się automatycznie przy `new`,
- `this` wskazuje tworzony obiekt,
- metody są **wspólne** dla wszystkich obiektów klasy (przechowywane w *prototypie*),
- nazwy klas piszemy **wielką literą** (PascalCase).

## Pola, gettery i settery

```js
class Prostokat {
  szerokosc = 1;              // pole z wartością domyślną
  wysokosc = 1;

  constructor(szerokosc, wysokosc) {
    this.szerokosc = szerokosc;
    this.wysokosc = wysokosc;
  }

  get pole() {                // odczyt jak właściwość: p.pole
    return this.szerokosc * this.wysokosc;
  }

  set bok(wartosc) {          // zapis jak właściwość: p.bok = 5
    this.szerokosc = this.wysokosc = wartosc;
  }
}

const p = new Prostokat(3, 4);
p.pole;      // 12 — bez nawiasów!
p.bok = 5;
p.pole;      // 25
```

## Pola prywatne `#`

```js
class KontoBankowe {
  #saldo = 0;                 // niedostępne spoza klasy

  wplac(kwota) {
    if (kwota <= 0) throw new Error("Kwota musi być dodatnia");
    this.#saldo += kwota;
  }

  get saldo() {
    return this.#saldo;
  }
}

const konto = new KontoBankowe();
konto.wplac(100);
konto.saldo;      // 100
konto.#saldo;     // SyntaxError — pole prywatne
konto.saldo = 1e6;   // nic nie zmieni — jest tylko getter
```

**Hermetyzacja**: obiekt sam pilnuje poprawności swoich danych, a na zewnątrz udostępnia tylko bezpieczne metody.

## Metody i pola statyczne

Należą do **klasy**, a nie do pojedynczych obiektów:

```js
class Ocena {
  static MIN = 1;
  static MAX = 6;

  static czyPoprawna(o) {
    return Number.isInteger(o) && o >= Ocena.MIN && o <= Ocena.MAX;
  }
}

Ocena.czyPoprawna(5);   // true
```

## Dziedziczenie: `extends` i `super`

```js
class Pytanie {
  constructor(tresc, punkty = 1) {
    this.tresc = tresc;
    this.punkty = punkty;
  }

  sprawdz(odpowiedz) {
    return false;
  }

  opis() {
    return `${this.tresc} (${this.punkty} pkt)`;
  }
}

class PytanieZamkniete extends Pytanie {
  constructor(tresc, opcje, poprawna, punkty) {
    super(tresc, punkty);        // MUSI być przed użyciem this
    this.opcje = opcje;
    this.poprawna = poprawna;
  }

  sprawdz(odpowiedz) {           // nadpisanie metody rodzica
    return odpowiedz === this.poprawna;
  }
}

class PytanieOtwarte extends Pytanie {
  constructor(tresc, wzorcowa, punkty) {
    super(tresc, punkty);
    this.wzorcowa = wzorcowa;
  }

  sprawdz(odpowiedz) {
    return odpowiedz.trim().toLowerCase() === this.wzorcowa.toLowerCase();
  }

  opis() {
    return `✍ ${super.opis()}`;  // wywołanie metody rodzica
  }
}

const test = [
  new PytanieZamkniete("2 + 2 =", ["3", "4", "5"], 1, 1),
  new PytanieOtwarte("Stolica Polski?", "Warszawa", 2),
];

const odpowiedzi = [1, " warszawa "];
const wynik = test.reduce((s, p, i) => s + (p.sprawdz(odpowiedzi[i]) ? p.punkty : 0), 0);
// 3
```

Każde pytanie ma metodę `sprawdz`, ale działa ona inaczej — to **polimorfizm**. Kod liczący wynik nie musi wiedzieć, jakiego typu jest pytanie.

## Kiedy klasa, a kiedy zwykły obiekt?

- **zwykły obiekt** `{ … }` — pojedyncze dane, ustawienia, odpowiedź z serwera,
- **klasa** — wiele obiektów z tym samym zachowaniem i regułami (gra, model danych, komponenty),
- nie buduj długich łańcuchów dziedziczenia — zwykle wystarczą 1–2 poziomy.

## Zadanie

1. Napisz klasę `Produkt` (nazwa, cena netto, VAT) z getterem `cenaBrutto`.
2. Napisz klasę `Koszyk` z prywatną tablicą `#pozycje` i metodami `dodaj(produkt, ilosc)`, `usun(nazwa)` i getterem `suma`.
3. Dodaj statyczną metodę `Produkt.zObiektu({ nazwa, cena })`, tworzącą produkt z danych JSON.
4. Rozbuduj przykład quizu o `PytanieWielokrotne` (kilka poprawnych odpowiedzi — tablica indeksów).
5. Wypisz `opis()` każdego pytania w teście — sprawdź, że `PytanieOtwarte` ma znaczek ✍.
