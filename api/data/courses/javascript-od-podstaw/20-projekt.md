W ostatniej lekcji zbudujesz kompletną aplikację **„Lista zadań”**, która łączy wszystko z kursu: DOM, zdarzenia, formularze, metody tablic, klasy, moduły, `localStorage` i obsługę błędów. Poniżej jest działający szkielet — rozbuduj go według zadań na końcu.

## Struktura projektu

```text
lista-zadan/
├── index.html
├── style.css
└── js/
    ├── main.js       — start, obsługa zdarzeń
    ├── zadania.js    — klasa ListaZadan (logika, bez DOM)
    ├── magazyn.js    — zapis w localStorage (z lekcji 19)
    └── widok.js      — rysowanie listy
```

> Zasada: **logika** (co się dzieje z danymi) jest oddzielona od **widoku** (jak to wygląda). Klasę `ListaZadan` da się przetestować bez przeglądarki.

## `index.html`

```html
<!DOCTYPE html>
<html lang="pl">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Lista zadań</title>
  <link rel="stylesheet" href="style.css">
  <script type="module" src="js/main.js"></script>
</head>
<body>
  <main class="kontener">
    <h1>Lista zadań</h1>

    <form id="nowe-zadanie" novalidate>
      <label for="tresc">Nowe zadanie</label>
      <input id="tresc" name="tresc" required maxlength="120" autocomplete="off">
      <button type="submit">Dodaj</button>
      <p id="blad" class="blad" aria-live="polite"></p>
    </form>

    <div class="filtry" role="group" aria-label="Filtruj zadania">
      <button type="button" data-filtr="wszystkie" aria-pressed="true">Wszystkie</button>
      <button type="button" data-filtr="aktywne" aria-pressed="false">Do zrobienia</button>
      <button type="button" data-filtr="zrobione" aria-pressed="false">Zrobione</button>
    </div>

    <ul id="lista" class="lista"></ul>

    <p id="podsumowanie" aria-live="polite"></p>
    <button type="button" id="wyczysc">Usuń zrobione</button>
  </main>
</body>
</html>
```

## `js/zadania.js` — logika

```js
export class ListaZadan {
  #zadania;

  constructor(zadania = []) {
    this.#zadania = zadania;
  }

  get wszystkie() {
    return [...this.#zadania];
  }

  dodaj(tresc) {
    const tekst = tresc.trim();
    if (!tekst) throw new Error("Wpisz treść zadania.");
    if (this.#zadania.some((z) => z.tresc.toLowerCase() === tekst.toLowerCase())) {
      throw new Error("Takie zadanie już jest na liście.");
    }
    this.#zadania.push({ id: crypto.randomUUID(), tresc: tekst, zrobione: false, utworzono: Date.now() });
  }

  przelacz(id) {
    const zadanie = this.#zadania.find((z) => z.id === id);
    if (zadanie) zadanie.zrobione = !zadanie.zrobione;
  }

  usun(id) {
    this.#zadania = this.#zadania.filter((z) => z.id !== id);
  }

  usunZrobione() {
    this.#zadania = this.#zadania.filter((z) => !z.zrobione);
  }

  filtruj(filtr) {
    if (filtr === "aktywne") return this.#zadania.filter((z) => !z.zrobione);
    if (filtr === "zrobione") return this.#zadania.filter((z) => z.zrobione);
    return this.wszystkie;
  }

  get pozostalo() {
    return this.#zadania.filter((z) => !z.zrobione).length;
  }
}
```

## `js/widok.js` — rysowanie

```js
export function rysujListe(ul, zadania) {
  if (zadania.length === 0) {
    const li = document.createElement("li");
    li.className = "lista__pusta";
    li.textContent = "Brak zadań — dodaj pierwsze!";
    ul.replaceChildren(li);
    return;
  }

  ul.replaceChildren(
    ...zadania.map((z) => {
      const li = document.createElement("li");
      li.className = "lista__element";
      li.dataset.id = z.id;
      li.classList.toggle("lista__element--zrobione", z.zrobione);

      const etykieta = document.createElement("label");
      const pole = document.createElement("input");
      pole.type = "checkbox";
      pole.checked = z.zrobione;
      pole.dataset.akcja = "przelacz";
      etykieta.append(pole, ` ${z.tresc}`);   // tekst, nie HTML — bezpiecznie

      const usun = document.createElement("button");
      usun.type = "button";
      usun.dataset.akcja = "usun";
      usun.textContent = "Usuń";
      usun.setAttribute("aria-label", `Usuń zadanie: ${z.tresc}`);

      li.append(etykieta, usun);
      return li;
    })
  );
}

export function odmienZadania(n) {
  if (n === 1) return "1 zadanie";
  const r10 = n % 10, r100 = n % 100;
  if (r10 >= 2 && r10 <= 4 && (r100 < 12 || r100 > 14)) return `${n} zadania`;
  return `${n} zadań`;
}
```

## `js/main.js` — połączenie wszystkiego

```js
import { ListaZadan } from "./zadania.js";
import { wczytaj, zapisz } from "./magazyn.js";
import { rysujListe, odmienZadania } from "./widok.js";

const KLUCZ = "lista-zadan";
const lista = new ListaZadan(wczytaj(KLUCZ, []));
let filtr = "wszystkie";

const form = document.getElementById("nowe-zadanie");
const blad = document.getElementById("blad");
const ul = document.getElementById("lista");
const podsumowanie = document.getElementById("podsumowanie");

function odswiez() {
  rysujListe(ul, lista.filtruj(filtr));
  podsumowanie.textContent = `Do zrobienia: ${odmienZadania(lista.pozostalo)}`;
  zapisz(KLUCZ, lista.wszystkie);
}

form.addEventListener("submit", (e) => {
  e.preventDefault();
  try {
    lista.dodaj(form.elements.tresc.value);
    form.reset();
    blad.textContent = "";
    odswiez();
  } catch (err) {
    blad.textContent = err.message;
  }
  form.elements.tresc.focus();
});

// delegacja zdarzeń — jedna obsługa dla wszystkich zadań
ul.addEventListener("click", (e) => {
  const akcja = e.target.dataset.akcja;
  const id = e.target.closest("[data-id]")?.dataset.id;
  if (!akcja || !id) return;

  if (akcja === "przelacz") lista.przelacz(id);
  if (akcja === "usun") lista.usun(id);
  odswiez();
});

document.querySelector(".filtry").addEventListener("click", (e) => {
  const przycisk = e.target.closest("[data-filtr]");
  if (!przycisk) return;
  filtr = przycisk.dataset.filtr;
  document.querySelectorAll("[data-filtr]").forEach((b) => b.setAttribute("aria-pressed", b === przycisk));
  odswiez();
});

document.getElementById("wyczysc").addEventListener("click", () => {
  lista.usunZrobione();
  odswiez();
});

window.addEventListener("storage", (e) => {
  if (e.key === KLUCZ) location.reload();   // zmiana w innej karcie
});

odswiez();
```

`js/magazyn.js` to moduł z lekcji 19 (`wczytaj`, `zapisz`), a `style.css` przygotuj sam — wykorzystaj kurs [CSS od podstaw do layoutu](/kursy/css-od-podstaw).

## Rozbudowa — zadania projektowe

1. **Edycja** (lekcje 11–12): dwuklik na treści zamienia ją w pole tekstowe; Enter zapisuje, Escape anuluje.
2. **Termin** (lekcje 10, 13): pole `type="date"` przy dodawaniu; zadania po terminie wyróżnione na czerwono, obok napis „za 3 dni” / „2 dni temu”.
3. **Sortowanie** (lekcja 8): według daty utworzenia, terminu lub alfabetycznie (`localeCompare`) — bez zmiany oryginalnej tablicy.
4. **Wyszukiwarka** (lekcja 14): filtrowanie po treści z `debounce`.
5. **Kategorie** (lekcje 9, 15): każde zadanie ma kategorię (szkoła, dom, inne); licznik zadań w każdej kategorii przez `reduce`.
6. **Eksport i import** (lekcje 16, 18): przycisk pobierający listę jako plik JSON i wczytujący ją z pliku — z obsługą błędnego pliku.
7. **Cytat dnia** (lekcje 17–18): przy starcie pobierz cytat z publicznego API ze stanami ładowania i błędu oraz limitem 5 s.
8. **Dostępność**: cała aplikacja obsługiwana klawiaturą, komunikaty w `aria-live`, widoczny fokus.

**Kryteria zaliczenia:**

- zero błędów i ostrzeżeń w konsoli,
- dane przetrwają odświeżenie strony i nie da się „zepsuć” aplikacji, wpisując HTML (np. `<img src=x onerror=alert(1)>`) jako treść zadania,
- kod podzielony na moduły; klasa `ListaZadan` nie używa `document`,
- poprawne działanie przy 320 px szerokości i z samą klawiaturą.

Gratulacje — ukończyłeś kurs JavaScript! Znasz już język, DOM, zdarzenia, asynchroniczność i pracę z serwerem. Sprawdź swoją wiedzę w **quizie** kursu. Kolejne kroki: framework (np. **React** — w nim zbudowana jest ta strona), **TypeScript** lub programowanie serwerowe w **Node.js**.
