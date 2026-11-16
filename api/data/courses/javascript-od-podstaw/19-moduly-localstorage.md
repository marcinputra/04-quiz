Gdy program rośnie, jeden plik `app.js` z tysiącem linii staje się nieczytelny. **Moduły ES** pozwalają podzielić kod na małe pliki, a **Web Storage** — zapamiętać dane w przeglądarce między wizytami.

## Moduły ES

```html
<script type="module" src="js/main.js"></script>
```

Moduł:

- ma **własny zakres** — zmienne nie trafiają do zakresu globalnego,
- działa w **trybie ścisłym** automatycznie,
- ładuje się jak skrypt z `defer`,
- **wymaga serwera** — otwarty jako plik (`file://`) nie zadziała. Użyj np. rozszerzenia *Live Server* w VS Code lub `npx serve`.

### Eksport i import

```js
// js/matematyka.js
export const PI = 3.14159;

export function poleKola(r) {
  return PI * r * r;
}

export default function srednia(...liczby) {   // eksport domyślny — jeden na plik
  return liczby.reduce((s, n) => s + n, 0) / liczby.length;
}
```

```js
// js/main.js
import srednia, { poleKola, PI } from "./matematyka.js";   // ścieżka z rozszerzeniem!
import * as mat from "./matematyka.js";                     // wszystko jako obiekt
import { poleKola as pole } from "./matematyka.js";         // zmiana nazwy

console.log(srednia(4, 5, 6));   // 5
console.log(mat.poleKola(2));
```

| | Eksport nazwany | Eksport domyślny |
|---|---|---|
| zapis | `export function f()` | `export default function f()` |
| import | `import { f } from "…"` | `import dowolnaNazwa from "…"` |
| ile w pliku | dowolnie wiele | jeden |

### Przykładowy podział aplikacji

```text
js/
├── main.js          — start aplikacji, łączy moduły
├── api.js           — komunikacja z serwerem (fetch)
├── magazyn.js       — zapis i odczyt z localStorage
├── widok.js         — budowanie HTML (DOM)
└── narzedzia.js     — małe funkcje pomocnicze (formatowanie dat, debounce)
```

### Dynamiczny import

Moduł można wczytać dopiero wtedy, gdy jest potrzebny — tak ta strona ładuje panel administratora tylko administratorom:

```js
przycisk.addEventListener("click", async () => {
  const { otworzEdytor } = await import("./edytor.js");
  otworzEdytor();
});
```

## `localStorage` i `sessionStorage`

Przeglądarka udostępnia każdej domenie mały magazyn par **klucz → tekst** (zwykle ok. 5 MB):

```js
localStorage.setItem("motyw", "ciemny");
localStorage.getItem("motyw");          // "ciemny"
localStorage.getItem("nieistnieje");    // null
localStorage.removeItem("motyw");
localStorage.clear();                   // usuń wszystko z tej domeny
```

| | `localStorage` | `sessionStorage` |
|---|---|---|
| jak długo | **na stałe**, do usunięcia | do zamknięcia karty |
| widoczność | wszystkie karty tej domeny | tylko ta karta |
| zastosowanie | motyw, język, szkic notatki | stan formularza w trakcie wypełniania |

### Zapisywanie obiektów — przez JSON

Magazyn przechowuje **tylko tekst**, więc obiekty i tablice zamieniamy na JSON:

```js
const zadania = [{ id: 1, tresc: "Nauczyć się modułów", zrobione: false }];

localStorage.setItem("zadania", JSON.stringify(zadania));

const wczytane = JSON.parse(localStorage.getItem("zadania") ?? "[]");
```

### Bezpieczny moduł magazynu

Dane mogą być uszkodzone, a w trybie prywatnym lub przy zablokowanych ciasteczkach dostęp do `localStorage` może rzucić wyjątek — dlatego otaczamy go `try…catch`:

```js
// js/magazyn.js
export function wczytaj(klucz, domyslna) {
  try {
    const tekst = localStorage.getItem(klucz);
    return tekst === null ? domyslna : JSON.parse(tekst);
  } catch {
    return domyslna;
  }
}

export function zapisz(klucz, wartosc) {
  try {
    localStorage.setItem(klucz, JSON.stringify(wartosc));
    return true;
  } catch {
    return false;   // np. brak miejsca lub zablokowany magazyn
  }
}
```

### Synchronizacja między kartami

```js
window.addEventListener("storage", (e) => {
  if (e.key === "zadania") odswiezListe();   // zmiana w INNEJ karcie
});
```

## Bezpieczeństwo i prywatność

- **nie zapisuj** w `localStorage` haseł ani tokenów logowania — każdy skrypt na stronie może je odczytać (dlatego ta strona trzyma sesję w ciasteczku `HttpOnly`, niedostępnym dla JavaScriptu),
- dane z magazynu traktuj jak dane od użytkownika — wyświetlaj przez `textContent`,
- zapis ustawień potrzebnych do działania strony nie wymaga zgody, ale śledzenie użytkownika — już tak (zob. [Polityka cookies](/polityka-cookies)).

## Zadanie

1. Podziel kod z lekcji 18 (lista użytkowników) na moduły: `api.js`, `widok.js`, `main.js`.
2. Uruchom projekt przez lokalny serwer i sprawdź, że `file://` zgłasza błąd CORS.
3. Zapamiętaj wybrany motyw (jasny/ciemny) w `localStorage` i przywracaj go po odświeżeniu.
4. Notatnik: pole `<textarea>`, którego treść zapisuje się automatycznie (z `debounce`) i wraca po ponownym otwarciu.
5. Otwórz notatnik w dwóch kartach i zsynchronizuj treść zdarzeniem `storage`.
