**DOM** (*Document Object Model*) to drzewo obiektów, które przeglądarka buduje z kodu HTML. Każdy znacznik staje się **węzłem**, który JavaScript może odczytać, zmienić, dodać lub usunąć — a strona od razu się aktualizuje.

```html
<body>
  <h1 id="tytul">Lista zakupów</h1>
  <ul class="lista">
    <li>mleko</li>
    <li class="pilne">chleb</li>
  </ul>
</body>
```

```text
document
└── html
    └── body
        ├── h1#tytul
        └── ul.lista
            ├── li
            └── li.pilne
```

## Wyszukiwanie elementów

```js
const tytul = document.getElementById("tytul");          // po id
const lista = document.querySelector(".lista");           // PIERWSZY pasujący selektor CSS
const pilne = document.querySelector("li.pilne");
const wszystkie = document.querySelectorAll(".lista li"); // WSZYSTKIE pasujące

wszystkie.length            // 2
wszystkie.forEach((li) => console.log(li.textContent));

lista.querySelector("li")   // szukanie wewnątrz elementu
```

- `querySelector` zwraca element albo **`null`**, gdy nic nie pasuje,
- `querySelectorAll` zwraca **NodeList** (zawsze, nawet pustą) — ma `forEach` i `length`; tablicę zrobisz przez `[...lista]`.

> Selektory są takie same jak w CSS: `#id`, `.klasa`, `nav a`, `[type="email"]`, `li:first-child`.

## Zmiana treści

```js
tytul.textContent = "Moja lista";                  // bezpieczny — wstawia czysty tekst
lista.innerHTML = "<li>jajka</li><li>ser</li>";    // interpretuje HTML
```

> **Bezpieczeństwo:** nigdy nie wstawiaj przez `innerHTML` danych wpisanych przez użytkownika lub pobranych z internetu. Ktoś może wpisać `<img src=x onerror="…">` i wykonać własny kod na Twojej stronie (atak **XSS**). Dla tekstu używaj `textContent`.

## Atrybuty i style

```js
const link = document.querySelector("a");
link.href = "https://maturazinformatyki.it";
link.getAttribute("target");
link.setAttribute("target", "_blank");
link.removeAttribute("title");

const obraz = document.querySelector("img");
obraz.src = "kot.webp";
obraz.alt = "Rudy kot na parapecie";

// atrybuty data-*
// <button data-id="42" data-akcja="usun">
przycisk.dataset.id      // "42"
przycisk.dataset.akcja   // "usun"
```

### Klasy — najlepszy sposób na zmianę wyglądu

```js
const el = document.querySelector(".karta");

el.classList.add("aktywna");
el.classList.remove("ukryta");
el.classList.toggle("rozwinieta");      // dodaj, jeśli nie ma; usuń, jeśli jest
el.classList.contains("aktywna");       // true
```

```js
el.style.color = "crimson";           // styl inline — tylko gdy wartość jest obliczana w JS
el.style.setProperty("--postep", "75%");   // zmienna CSS (kurs CSS, lekcja 9)
```

> Wygląd trzymaj w CSS, a w JavaScripcie tylko **przełączaj klasy**. Kod jest wtedy czytelniejszy i łatwiejszy do zmiany.

## Tworzenie i usuwanie elementów

```js
const nowy = document.createElement("li");
nowy.textContent = "masło";
nowy.classList.add("pilne");

lista.append(nowy);          // na koniec
lista.prepend(nowy);         // na początek (przeniesie istniejący element)
tytul.after(nowy);           // za elementem
tytul.before(nowy);          // przed elementem

nowy.remove();               // usuń z drzewa
lista.replaceChildren();     // usuń wszystkie dzieci
```

Budowanie listy z tablicy:

```js
const produkty = ["mleko", "chleb", "jajka"];

lista.replaceChildren(
  ...produkty.map((nazwa) => {
    const li = document.createElement("li");
    li.textContent = nazwa;
    return li;
  })
);
```

## Poruszanie się po drzewie

```js
el.parentElement            // rodzic
el.children                 // dzieci (elementy)
el.firstElementChild
el.nextElementSibling       // następny „brat”
el.closest(".karta")        // najbliższy przodek (lub on sam) pasujący do selektora
```

## Szablon `<template>`

Złożone fragmenty HTML wygodnie jest trzymać w `<template>` i klonować:

```html
<template id="szablon-karty">
  <article class="karta">
    <h3 class="karta__tytul"></h3>
    <p class="karta__opis"></p>
  </article>
</template>
```

```js
const szablon = document.getElementById("szablon-karty");
const karta = szablon.content.cloneNode(true);
karta.querySelector(".karta__tytul").textContent = "JavaScript";
karta.querySelector(".karta__opis").textContent = "Kurs od podstaw";
document.querySelector("main").append(karta);
```

## Zadanie

1. Zmień tekst nagłówka `h1` strony na swoje imię.
2. Pobierz wszystkie akapity i dodaj co drugiemu klasę `wyrozniony` (ostyluj ją w CSS).
3. Z tablicy `["HTML", "CSS", "JavaScript"]` zbuduj listę `<ul>` i dodaj ją do strony.
4. Wszystkim linkom zewnętrznym (`a[href^="http"]`) ustaw `target="_blank"` i `rel="noopener"`.
5. Zbuduj trzy karty kursów z jednego `<template>` na podstawie tablicy obiektów.
