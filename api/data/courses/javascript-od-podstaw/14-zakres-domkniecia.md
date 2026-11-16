Ta lekcja wyjaśnia mechanizmy, które sprawiają najwięcej kłopotów początkującym — i o które często pytają na rozmowach o pracę.

## Zakres (scope)

Zakres to obszar, w którym zmienna jest **widoczna**.

```js
const globalna = "G";               // zakres globalny

function zewnetrzna() {
  const wFunkcji = "F";             // zakres funkcji

  if (true) {
    const wBloku = "B";             // zakres bloku { }
    console.log(globalna, wFunkcji, wBloku);   // G F B — widać wszystko „na zewnątrz”
  }

  console.log(wBloku);              // ReferenceError — blok już się skończył
}
```

**Zasada:** kod widzi zmienne ze **swojego** zakresu i **wszystkich zakresów, w których jest zagnieżdżony** — nigdy odwrotnie. To tzw. **zakres leksykalny**: liczy się, *gdzie funkcja została zapisana* w kodzie.

### `var` — dlaczego go unikamy

```js
if (true) {
  var x = 1;    // var ignoruje bloki — ma zakres całej funkcji
  let y = 2;
}
console.log(x); // 1  — „wyciekło” z bloku
console.log(y); // ReferenceError

for (var i = 0; i < 3; i++) {
  setTimeout(() => console.log(i), 0);   // 3, 3, 3 — jedno wspólne i
}
for (let j = 0; j < 3; j++) {
  setTimeout(() => console.log(j), 0);   // 0, 1, 2 — każdy obrót ma swoje j
}
```

## Hoisting (podnoszenie)

Przed wykonaniem kodu JavaScript „rejestruje” deklaracje w danym zakresie:

```js
powitaj();                    // działa! deklaracje funkcji są podnoszone w całości
function powitaj() { console.log("Cześć"); }

console.log(a);               // undefined — var jest podnoszony, ale bez wartości
var a = 5;

console.log(b);               // ReferenceError — let/const istnieją, ale są w „martwej strefie” (TDZ)
let b = 5;

zegnaj();                     // ReferenceError — wyrażenie funkcyjne w const nie jest gotowe przed tą linią
const zegnaj = () => console.log("Pa");
```

> Praktyczna rada: deklaruj zmienne **przed** użyciem, a `let`/`const` same wykryją błąd.

## Domknięcia (closures)

Funkcja **pamięta zmienne z miejsca, w którym powstała** — nawet gdy tamta funkcja już się zakończyła.

```js
function utworzLicznik() {
  let stan = 0;                 // zmienna „prywatna”
  return {
    zwieksz: () => ++stan,
    zmniejsz: () => --stan,
    wartosc: () => stan,
  };
}

const licznikA = utworzLicznik();
const licznikB = utworzLicznik();

licznikA.zwieksz();   // 1
licznikA.zwieksz();   // 2
licznikB.zwieksz();   // 1 — osobny stan
licznikA.wartosc();   // 2
stan;                 // ReferenceError — z zewnątrz nie ma dostępu
```

Do czego się przydają:

- **prywatne dane** — nikt z zewnątrz nie zmieni `stan`,
- **fabryki funkcji**:

```js
const mnoznik = (x) => (y) => x * y;
const podwoj = mnoznik(2);
const potroj = mnoznik(3);
podwoj(5);   // 10
potroj(5);   // 15
```

- **obsługa zdarzeń**, która pamięta dane:

```js
document.querySelectorAll(".pytanie").forEach((el, nr) => {
  el.addEventListener("click", () => console.log(`Kliknięto pytanie ${nr + 1}`));
});
```

### Debounce — klasyczny przykład domknięcia

Wywołaj funkcję dopiero, gdy użytkownik **przestanie pisać** (np. wyszukiwarka):

```js
function debounce(fn, ms) {
  let timer;                       // pamiętane między wywołaniami
  return (...args) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), ms);
  };
}

pole.addEventListener("input", debounce((e) => szukaj(e.target.value), 300));
```

## `this`

Wartość `this` zależy od tego, **jak funkcja została wywołana**:

| Wywołanie | `this` |
|---|---|
| `obiekt.metoda()` | `obiekt` |
| `funkcja()` (tryb ścisły) | `undefined` |
| w obsłudze zdarzenia `function` | element, do którego przypięto nasłuch |
| `new Klasa()` | nowy obiekt (lekcja 15) |
| **funkcja strzałkowa** | `this` z **otaczającego** kodu — własnego nie ma |

```js
const gracz = {
  imie: "Ola",
  przywitaj() {
    console.log(`Cześć, ${this.imie}`);
  },
  przywitajPozniej() {
    setTimeout(function () {
      console.log(this?.imie);        // undefined — zwykła funkcja straciła this
    }, 100);
    setTimeout(() => {
      console.log(this.imie);         // "Ola" — strzałkowa bierze this z metody
    }, 100);
  },
};

gracz.przywitaj();            // "Cześć, Ola"
const f = gracz.przywitaj;
f();                          // TypeError w trybie ścisłym — wywołanie bez obiektu, this = undefined

const g = gracz.przywitaj.bind(gracz);   // bind „przykleja” this na stałe
g();                          // "Cześć, Ola"
```

> Metody obiektów pisz jako zwykłe funkcje (`metoda() { }`), a callbacki wewnątrz nich — jako **strzałkowe**.

## Zadanie

1. Przewidź, a potem sprawdź, co wypiszą obie pętle z `setTimeout` (z `var` i `let`).
2. Napisz `utworzKonto(saldoPoczatkowe)` z metodami `wplac`, `wyplac` (bez zejścia poniżej zera) i `saldo` — saldo ma być prywatne.
3. Napisz `licznikWywolan(fn)`, która zwraca funkcję działającą jak `fn` i zliczającą, ile razy ją wywołano.
4. Dodaj `debounce` do pola wyszukiwania, które filtruje listę miast.
5. Napraw `f()` z przykładu o `this` na dwa sposoby: przez `bind` i przez funkcję strzałkową `() => gracz.przywitaj()`.
