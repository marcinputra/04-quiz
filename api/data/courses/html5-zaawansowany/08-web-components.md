**Web Components** to zestaw standardów, które pozwalają tworzyć **własne znaczniki HTML** — np. `<karta-kursu>` czy `<licznik-czasu>` — działające w każdej przeglądarce i z każdym frameworkiem (albo bez żadnego). Składają się z trzech części: **szablonów** (`<template>`), **własnych elementów** (Custom Elements) i **Shadow DOM**.

## `<template>` — fragment HTML do powielania

Zawartość `<template>` **nie jest wyświetlana** ani wykonywana — to wzór, który kopiujesz z JavaScriptu:

```html
<template id="szablon-kursu">
  <article class="karta">
    <h3 class="tytul"></h3>
    <p class="opis"></p>
  </article>
</template>

<div id="lista"></div>

<script>
  const kursy = [
    { tytul: "HTML5 — część 1", opis: "Od podstaw" },
    { tytul: "HTML5 — część 2", opis: "Poziom zaawansowany" },
  ];
  const szablon = document.getElementById("szablon-kursu");

  for (const k of kursy) {
    const kopia = szablon.content.cloneNode(true);   // głęboka kopia zawartości
    kopia.querySelector(".tytul").textContent = k.tytul;
    kopia.querySelector(".opis").textContent = k.opis;
    document.getElementById("lista").append(kopia);
  }
</script>
```

> Używaj `textContent`, a nie `innerHTML`, gdy wstawiasz dane — dzięki temu tekst nigdy nie zostanie potraktowany jako kod (ochrona przed atakiem **XSS**).

## Custom Elements — własny znacznik

```html
<licznik-klikniec start="5"></licznik-klikniec>

<script>
  class LicznikKlikniec extends HTMLElement {
    connectedCallback() {
      // wywoływane, gdy element trafia na stronę
      this.wartosc = Number(this.getAttribute("start") ?? 0);
      this.innerHTML = `<button type="button"></button>`;
      this.przycisk = this.querySelector("button");
      this.przycisk.addEventListener("click", () => this.zwieksz());
      this.pokaz();
    }
    zwieksz() {
      this.wartosc++;
      this.pokaz();
    }
    pokaz() {
      this.przycisk.textContent = `Kliknięto ${this.wartosc} razy`;
    }
  }

  customElements.define("licznik-klikniec", LicznikKlikniec);
</script>
```

Zasady:

- nazwa własnego elementu **musi zawierać myślnik** (`licznik-klikniec`, nie `licznik`) — dzięki temu nigdy nie zderzy się z przyszłymi znacznikami HTML,
- klasa dziedziczy po `HTMLElement`,
- **cykl życia**: `connectedCallback` (dodanie do strony), `disconnectedCallback` (usunięcie), `attributeChangedCallback` (zmiana obserwowanego atrybutu).

### Reagowanie na zmianę atrybutów

```js
class OcenaGwiazdki extends HTMLElement {
  static observedAttributes = ["wartosc"];

  attributeChangedCallback(nazwa, stara, nowa) {
    this.textContent = "★".repeat(Number(nowa)) + "☆".repeat(5 - Number(nowa));
    this.setAttribute("aria-label", `Ocena: ${nowa} na 5`);
  }
}
customElements.define("ocena-gwiazdki", OcenaGwiazdki);
```

```html
<ocena-gwiazdki wartosc="4" role="img"></ocena-gwiazdki>
```

## Shadow DOM — izolacja stylów i struktury

Shadow DOM to „ukryte drzewo” wewnątrz elementu. Style z wnętrza **nie wyciekają** na stronę, a style strony **nie psują** komponentu:

```js
class KartaKursu extends HTMLElement {
  constructor() {
    super();
    const cien = this.attachShadow({ mode: "open" });
    cien.innerHTML = `
      <style>
        :host { display: block; border: 1px solid #facc15; border-radius: 12px; padding: 16px; }
        h3 { margin: 0 0 8px; color: #facc15; }      /* dotyczy tylko h3 w tej karcie */
        ::slotted(p) { color: #aab2c5; }
      </style>
      <h3><slot name="tytul">Kurs bez nazwy</slot></h3>
      <slot></slot>
    `;
  }
}
customElements.define("karta-kursu", KartaKursu);
```

```html
<karta-kursu>
  <span slot="tytul">HTML5 — część 2</span>
  <p>Dostępność, SVG, Canvas i Web Components.</p>
</karta-kursu>
```

## `<slot>` — miejsca na zawartość

- `<slot name="tytul">` — tu trafi element z atrybutem `slot="tytul"`,
- `<slot>` bez nazwy — tu trafi pozostała zawartość,
- tekst wewnątrz `<slot>` wyświetla się, gdy nic nie przekazano (wartość domyślna).

| Selektor w Shadow DOM | Działanie |
|---|---|
| `:host` | sam element-komponent |
| `:host([atrybut])` | komponent z danym atrybutem |
| `::slotted(p)` | elementy przekazane do slotu |

## Kiedy używać Web Components?

- **biblioteki komponentów** używane w wielu projektach (np. w różnych frameworkach),
- **widżety** osadzane na cudzych stronach (izolacja stylów),
- małe interaktywne elementy na stronach bez frameworka.

W dużych aplikacjach częściej używa się frameworków (React, Vue, Svelte), ale one same potrafią korzystać z Web Components.

## Zadanie

1. Utwórz element `<karta-kursu>` z Shadow DOM, slotami `tytul`, `poziom` i domyślnym slotem na opis.
2. Dodaj obserwowany atrybut `ukonczony` — gdy jest ustawiony, karta pokazuje znaczek „✓ Ukończony” (użyj `:host([ukonczony])`).
3. Wygeneruj listę 4 kart z tablicy danych przy pomocy `<template>`.
4. Sprawdź w F12, że style z komponentu nie wpływają na resztę strony (dodaj na stronie `h3 { color: red }` — karta ma pozostać żółta).
