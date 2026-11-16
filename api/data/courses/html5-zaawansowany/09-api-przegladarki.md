Razem z HTML5 przeglądarki dostały zestaw interfejsów (API) dostępnych z JavaScriptu. W tej części poznasz te najbliżej związane z HTML: **atrybuty danych**, **przechowywanie danych w przeglądarce** i **przeciąganie elementów**.

## Atrybuty `data-*` i `dataset`

Własne dane można przypiąć do dowolnego elementu atrybutami zaczynającymi się od `data-`:

```html
<button type="button" data-produkt-id="42" data-cena="19.99" data-kategoria="ksiazki">
  Dodaj do koszyka
</button>

<script>
  document.querySelector("[data-produkt-id]").addEventListener("click", (e) => {
    const { produktId, cena, kategoria } = e.currentTarget.dataset;
    console.log(produktId, Number(cena), kategoria);   // "42" 19.99 "ksiazki"
  });
</script>
```

- `data-produkt-id` w JavaScripcie to `dataset.produktId` (myślniki → *camelCase*),
- wartości są zawsze **tekstem** — liczby zamieniaj `Number(...)`,
- w CSS: `[data-kategoria="ksiazki"] { … }`.

> Nie wymyślaj własnych atrybutów bez `data-` (np. `<div cena="10">`) — to niepoprawny HTML.

## Web Storage: `localStorage` i `sessionStorage`

Proste przechowywanie par **klucz → wartość** w przeglądarce:

```js
// zapis i odczyt
localStorage.setItem("motyw", "ciemny");
const motyw = localStorage.getItem("motyw");   // "ciemny" albo null, jeśli nie ma
localStorage.removeItem("motyw");

// obiekty trzeba zamienić na tekst (JSON)
const ustawienia = { rozmiarCzcionki: 18, powiadomienia: true };
localStorage.setItem("ustawienia", JSON.stringify(ustawienia));
const wczytane = JSON.parse(localStorage.getItem("ustawienia") ?? "{}");
```

| | `localStorage` | `sessionStorage` | ciasteczko (cookie) |
|---|---|---|---|
| jak długo | do usunięcia | do zamknięcia karty | do daty wygaśnięcia |
| pojemność | ok. 5 MB | ok. 5 MB | ok. 4 KB |
| wysyłane do serwera | nie | nie | **tak**, z każdym żądaniem |
| dostęp z JavaScriptu | tak | tak | tak, chyba że `HttpOnly` |

Dobre praktyki:

- **nie przechowuj** w `localStorage` haseł ani tokenów logowania — każdy skrypt na stronie (także złośliwy, wstrzyknięty przez XSS) może je odczytać. Do sesji służą ciasteczka `HttpOnly`,
- owijaj odczyt w `try…catch` — w trybie prywatnym lub przy wyłączonej pamięci przeglądarka może rzucić błąd,
- dane przechowywane na urządzeniu użytkownika mogą wymagać informacji w polityce prywatności / cookies.

### Synchronizacja między kartami

```js
window.addEventListener("storage", (e) => {
  if (e.key === "motyw") zastosujMotyw(e.newValue);   // zmieniono w innej karcie
});
```

## Drag and Drop — przeciąganie elementów

```html
<ul id="lista">
  <li draggable="true" data-id="1">HTML</li>
  <li draggable="true" data-id="2">CSS</li>
  <li draggable="true" data-id="3">JavaScript</li>
</ul>
<div id="kosz" class="strefa">Upuść tutaj, aby usunąć</div>

<script>
  document.querySelectorAll("[draggable=true]").forEach((el) => {
    el.addEventListener("dragstart", (e) => {
      e.dataTransfer.setData("text/plain", el.dataset.id);   // co przenosimy
      e.dataTransfer.effectAllowed = "move";
    });
  });

  const kosz = document.getElementById("kosz");
  kosz.addEventListener("dragover", (e) => e.preventDefault());   // bez tego upuszczenie nie zadziała!
  kosz.addEventListener("drop", (e) => {
    e.preventDefault();
    const id = e.dataTransfer.getData("text/plain");
    document.querySelector(`[data-id="${id}"]`)?.remove();
  });
</script>
```

Kolejność zdarzeń: `dragstart` → `dragenter` / `dragover` (nad strefą) → `drop` → `dragend`.

### Upuszczanie plików z dysku

```js
strefa.addEventListener("drop", (e) => {
  e.preventDefault();
  for (const plik of e.dataTransfer.files) {
    console.log(plik.name, plik.type, Math.round(plik.size / 1024) + " KB");
  }
});
```

> **Dostępność:** przeciąganie myszą jest niedostępne dla osób korzystających z klawiatury i czytników ekranu. Zawsze daj **alternatywę** — np. przyciski „w górę / w dół / usuń” albo zwykłe pole `<input type="file">` obok strefy upuszczania.

## Inne przydatne API (do samodzielnego poznania)

| API | Do czego |
|---|---|
| `IntersectionObserver` | wykrywanie, że element pojawił się na ekranie (animacje przy przewijaniu, doładowywanie listy) |
| `navigator.clipboard.writeText()` | kopiowanie do schowka (przycisk „Kopiuj kod”) |
| `navigator.share()` | systemowe okno udostępniania na telefonie |
| `navigator.geolocation` | położenie użytkownika (zawsze za jego zgodą) |
| `Notification` | powiadomienia systemowe (za zgodą) |

## Zadanie

Zbuduj **listę zadań (to-do)**:

1. dodawanie zadania z pola tekstowego; każde zadanie ma `data-id` i `data-wykonane`,
2. zadania zapisują się w `localStorage` (jako JSON) i wczytują po odświeżeniu strony,
3. zmiana kolejności zadań przez **przeciąganie** oraz — jako alternatywa dostępna z klawiatury — przyciskami „↑” i „↓”,
4. przycisk „Wyczyść wykonane” i licznik „Zostało: N zadań” w regionie `aria-live`,
5. otwórz stronę w dwóch kartach i sprawdź, czy zdarzenie `storage` synchronizuje listę.
