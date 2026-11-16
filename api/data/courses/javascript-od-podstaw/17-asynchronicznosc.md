Niektóre operacje trwają: pobieranie danych z serwera, odliczanie czasu, wczytywanie pliku. JavaScript **nie czeka** na nie bezczynnie — zleca je i wykonuje dalszy kod, a wynik obsługuje, gdy będzie gotowy. To **asynchroniczność**.

## Timery

```js
console.log("1");

setTimeout(() => {
  console.log("3 — po 2 sekundach");
}, 2000);

console.log("2");
// wypisze: 1, 2, a po 2 s: 3
```

```js
const id = setInterval(() => console.log("tik"), 1000);   // co sekundę
setTimeout(() => clearInterval(id), 5000);                // zatrzymaj po 5 s

const t = setTimeout(zapisz, 3000);
clearTimeout(t);   // anuluj, zanim się wykona
```

### Odliczanie w quizie

```js
function odliczaj(sekundy, przyKazdej, naKoniec) {
  let zostalo = sekundy;
  przyKazdej(zostalo);
  const id = setInterval(() => {
    zostalo--;
    przyKazdej(zostalo);
    if (zostalo === 0) {
      clearInterval(id);
      naKoniec();
    }
  }, 1000);
  return () => clearInterval(id);   // funkcja do przerwania odliczania
}

const stop = odliczaj(30, (s) => (zegar.textContent = `${s} s`), () => zakonczQuiz());
```

## Pętla zdarzeń (event loop)

JavaScript wykonuje **jedną rzecz naraz** (jeden wątek). Działa to tak:

1. wykonuje cały bieżący kod (**stos wywołań**),
2. gotowe zadania asynchroniczne czekają w **kolejkach**,
3. gdy stos jest pusty — najpierw wykonuje **mikrozadania** (obietnice), potem kolejne **zadanie** (timer, zdarzenie).

```js
console.log("A");
setTimeout(() => console.log("B"), 0);
Promise.resolve().then(() => console.log("C"));
console.log("D");
// A, D, C, B — nawet setTimeout 0 czeka, a obietnica ma pierwszeństwo przed timerem
```

> Długie obliczenia (np. pętla na miliard obrotów) **blokują** stronę — nie da się wtedy klikać ani przewijać.

## Promise — obietnica wyniku

**Promise** to obiekt reprezentujący wynik, który będzie dostępny **później**. Ma trzy stany:

- **pending** — oczekuje,
- **fulfilled** — spełniona (jest wynik),
- **rejected** — odrzucona (jest błąd).

```js
function czekaj(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function rzutMoneta() {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      Math.random() < 0.5 ? resolve("orzeł") : reject(new Error("reszka"));
    }, 500);
  });
}

rzutMoneta()
  .then((wynik) => console.log("Wygrana:", wynik))
  .catch((blad) => console.log("Przegrana:", blad.message))
  .finally(() => console.log("Koniec rzutu"));
```

`.then` też zwraca obietnicę, więc kolejne kroki można łączyć w łańcuch.

## `async` / `await` — kod asynchroniczny, który czyta się jak zwykły

```js
async function pokazPowitanie() {
  console.log("Ładowanie…");
  await czekaj(1000);              // „poczekaj na obietnicę” — bez blokowania strony
  console.log("Witaj!");
}

async function zagraj() {
  try {
    const wynik = await rzutMoneta();
    console.log("Wygrana:", wynik);
  } catch (blad) {
    console.log("Przegrana:", blad.message);
  }
}
```

- `await` można używać tylko w funkcji `async` (oraz na najwyższym poziomie **modułu**),
- funkcja `async` **zawsze zwraca Promise**,
- błędy odrzuconych obietnic łapiemy zwykłym `try…catch`.

## Wiele operacji naraz

```js
// ŹLE — jedno po drugim, łącznie 3 s
const a = await czekajIZwroc(1000, "A");
const b = await czekajIZwroc(2000, "B");

// DOBRZE — równolegle, łącznie 2 s
const [x, y] = await Promise.all([czekajIZwroc(1000, "A"), czekajIZwroc(2000, "B")]);
```

| Metoda | Kończy się, gdy… |
|---|---|
| `Promise.all` | **wszystkie** się spełnią (lub pierwsza zostanie odrzucona) |
| `Promise.allSettled` | wszystkie się zakończą — dostajesz status każdej |
| `Promise.race` | **pierwsza** się zakończy (spełni lub odrzuci) |
| `Promise.any` | **pierwsza** się spełni |

Limit czasu dla operacji:

```js
const zLimitem = (obietnica, ms) =>
  Promise.race([obietnica, czekaj(ms).then(() => { throw new Error("Przekroczono czas"); })]);
```

## Zadanie

1. Przewidź kolejność komunikatów: `log("1")`, `setTimeout(log("2"), 0)`, `Promise.resolve().then(log("3"))`, `log("4")` — sprawdź w konsoli.
2. Napisz zegar cyfrowy aktualizowany co sekundę (`HH:MM:SS`).
3. Zrób odliczanie 10 s z przyciskami „Start”, „Pauza” i „Reset”.
4. Napisz `async function sekwencja()`, która co sekundę wypisuje „3”, „2”, „1”, „Start!” (z `czekaj`).
5. Uruchom trzy `czekaj` o różnych czasach przez `Promise.all` i zmierz łączny czas `console.time`.
