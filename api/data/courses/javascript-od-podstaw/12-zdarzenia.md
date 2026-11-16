**Zdarzenie** (*event*) to sygnał, że coś się stało: kliknięcie, naciśnięcie klawisza, wysłanie formularza, przewinięcie strony. Program może **nasłuchiwać** zdarzeń i reagować na nie.

## `addEventListener`

```html
<button type="button" id="przycisk">Kliknij mnie</button>
<p id="licznik">Kliknięto 0 razy</p>
```

```js
const przycisk = document.getElementById("przycisk");
const licznik = document.getElementById("licznik");
let klikniecia = 0;

przycisk.addEventListener("click", () => {
  klikniecia++;
  licznik.textContent = `Kliknięto ${klikniecia} razy`;
});
```

Składnia: `element.addEventListener("nazwa", funkcja)`. Funkcję podajemy **bez nawiasów** — przeglądarka wywoła ją sama, gdy zdarzenie zajdzie.

```js
przycisk.addEventListener("click", powitaj);     // ✔ przekazujemy funkcję
przycisk.addEventListener("click", powitaj());   // ✘ wywołujemy ją od razu!
```

## Najczęstsze zdarzenia

| Zdarzenie | Kiedy |
|---|---|
| `click` | kliknięcie (także Enter/Spacja na przycisku) |
| `dblclick` | dwuklik |
| `input` | każda zmiana wartości pola (przy wpisywaniu) |
| `change` | zatwierdzenie zmiany (np. wybór w `<select>`, opuszczenie pola) |
| `submit` | wysłanie formularza |
| `keydown`, `keyup` | naciśnięcie / puszczenie klawisza |
| `focus`, `blur` | pole dostało / straciło fokus |
| `mouseenter`, `mouseleave` | kursor wjechał / wyjechał nad element |
| `scroll` | przewijanie |
| `DOMContentLoaded` | HTML w pełni zbudowany |

## Obiekt zdarzenia

Funkcja obsługi dostaje obiekt z informacjami o zdarzeniu:

```js
document.addEventListener("keydown", (e) => {
  console.log(e.key);           // "a", "Enter", "ArrowLeft", "Escape"…
  if (e.key === "Escape") zamknijOkno();
  if (e.ctrlKey && e.key === "s") {
    e.preventDefault();         // zablokuj domyślne „Zapisz stronę”
    zapiszSzkic();
  }
});

pole.addEventListener("input", (e) => {
  console.log(e.target.value);  // e.target — element, na którym zaszło zdarzenie
});
```

## `preventDefault` — blokowanie domyślnej akcji

```js
const formularz = document.querySelector("form");

formularz.addEventListener("submit", (e) => {
  e.preventDefault();   // strona się nie przeładuje
  // tu sprawdzamy i wysyłamy dane przez JavaScript (lekcje 13 i 18)
});
```

## Propagacja i delegacja zdarzeń

Zdarzenie **„bąbelkuje”** w górę drzewa: kliknięcie w `<li>` jest też kliknięciem w `<ul>`, `<body>` i `document`.

Dzięki temu zamiast dodawać obsługę do każdego elementu, można dodać **jedną** do rodzica — to **delegacja zdarzeń**:

```html
<ul id="zadania">
  <li>Nauczyć się JS <button type="button" data-akcja="usun">Usuń</button></li>
  <li>Zrobić projekt <button type="button" data-akcja="usun">Usuń</button></li>
</ul>
```

```js
document.getElementById("zadania").addEventListener("click", (e) => {
  const przycisk = e.target.closest("[data-akcja='usun']");
  if (!przycisk) return;                 // kliknięto gdzie indziej
  przycisk.closest("li").remove();
});
```

Zalety delegacji:

- jedna funkcja zamiast setek,
- działa też dla elementów **dodanych później** (np. nowych zadań).

`e.stopPropagation()` zatrzymuje bąbelkowanie — stosuj rzadko.

## Opcje nasłuchiwania i usuwanie

```js
przycisk.addEventListener("click", powitaj, { once: true });   // tylko raz

window.addEventListener("scroll", obsluzScroll, { passive: true });  // nie blokuje przewijania

przycisk.removeEventListener("click", powitaj);   // wymaga TEJ SAMEJ funkcji (nie strzałkowej „w locie”)
```

## Dostępność

- do klikania używaj **`<button>`**, a nie `<div>` — przycisk działa z klawiatury i czytnikiem ekranu,
- `click` na przycisku zadziała także po naciśnięciu Enter lub Spacji,
- przy własnych skrótach klawiszowych pamiętaj o osobach bez myszy (i odwrotnie — bez klawiatury).

## Zadanie

1. Przycisk „Tryb ciemny” przełączający klasę `ciemny` na `<body>` (`classList.toggle`).
2. Pole tekstowe i licznik znaków pod nim, aktualizowany przy zdarzeniu `input` (np. „23 / 200”).
3. Galeria: kliknięcie miniatury zmienia duże zdjęcie — z **delegacją** na kontenerze.
4. Klawisze strzałek ← → przełączają zdjęcia w galerii, `Escape` je zamyka.
5. Przycisk „Do góry”, który pojawia się (klasa `widoczny`) dopiero po przewinięciu 300 px (`window.scrollY`).
