Prawie każda aplikacja internetowa rozmawia z **serwerem**: pobiera artykuły, wysyła odpowiedzi z quizu, loguje użytkownika. W przeglądarce służy do tego **Fetch API**, a dane najczęściej przesyła się w formacie **JSON**.

## JSON

**JSON** (*JavaScript Object Notation*) to tekstowy zapis danych, bardzo podobny do obiektów JavaScriptu:

```json
{
  "id": 7,
  "tytul": "Kurs JavaScript",
  "opublikowany": true,
  "tagi": ["js", "front-end"],
  "autor": { "imie": "Ola" },
  "ocena": null
}
```

Różnice względem obiektów JS:

- klucze i teksty **zawsze w podwójnych cudzysłowach**,
- brak funkcji, `undefined`, dat i komentarzy,
- brak przecinka po ostatnim elemencie.

```js
const obiekt = { imie: "Ola", punkty: [5, 4] };

const tekst = JSON.stringify(obiekt);           // '{"imie":"Ola","punkty":[5,4]}'
JSON.stringify(obiekt, null, 2);                // ładnie sformatowany, z wcięciami
const zPowrotem = JSON.parse(tekst);            // znów obiekt

JSON.parse("{'imie': 'Ola'}");                  // SyntaxError — pojedyncze cudzysłowy
```

## Pobieranie danych: GET

```js
async function pobierzPosty() {
  const odpowiedz = await fetch("https://jsonplaceholder.typicode.com/posts?_limit=5");

  if (!odpowiedz.ok) {
    throw new Error(`Błąd serwera: ${odpowiedz.status}`);
  }

  const posty = await odpowiedz.json();   // odczytaj treść jako JSON
  return posty;
}
```

Dwa `await`:

1. `fetch(...)` — czeka na **nagłówki** odpowiedzi (status),
2. `odpowiedz.json()` — czeka na **całą treść** i zamienia ją na obiekt.

> **Ważne:** `fetch` **nie rzuca błędu** przy kodach 404 czy 500 — odrzuca obietnicę tylko przy braku połączenia. Zawsze sprawdzaj `odpowiedz.ok` (true dla statusów 200–299).

### Najważniejsze kody HTTP

| Kod | Znaczenie |
|---|---|
| `200` OK, `201` Created | sukces / utworzono |
| `400` Bad Request | błędne dane |
| `401` Unauthorized | niezalogowany |
| `403` Forbidden | brak uprawnień (np. brak dostępu do kursu) |
| `404` Not Found | nie ma takiego zasobu |
| `429` Too Many Requests | za dużo prób (np. logowania) |
| `500`, `502`, `503` | błąd lub niedostępność serwera |

## Wyświetlanie danych ze stanami ładowania i błędu

```html
<button type="button" id="wczytaj">Wczytaj posty</button>
<p id="status" aria-live="polite"></p>
<ul id="posty"></ul>
```

```js
const przycisk = document.getElementById("wczytaj");
const status = document.getElementById("status");
const lista = document.getElementById("posty");

przycisk.addEventListener("click", async () => {
  przycisk.disabled = true;
  status.textContent = "Ładowanie…";
  lista.replaceChildren();

  try {
    const posty = await pobierzPosty();
    for (const post of posty) {
      const li = document.createElement("li");
      li.textContent = post.title;          // textContent — dane z internetu!
      lista.append(li);
    }
    status.textContent = `Wczytano ${posty.length} postów.`;
  } catch (blad) {
    status.textContent = "Nie udało się wczytać danych. Sprawdź połączenie i spróbuj ponownie.";
    console.error(blad);
  } finally {
    przycisk.disabled = false;
  }
});
```

Każde pobieranie danych powinno mieć **trzy stany**: ładowanie, sukces, błąd.

## Wysyłanie danych: POST

```js
async function wyslijOdpowiedz(dane) {
  const odpowiedz = await fetch("/api/odpowiedzi", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(dane),
    credentials: "include",          // dołącz ciasteczka (np. sesję logowania)
  });

  const wynik = await odpowiedz.json().catch(() => ({}));
  if (!odpowiedz.ok) throw new Error(wynik.error ?? `Błąd ${odpowiedz.status}`);
  return wynik;
}

await wyslijOdpowiedz({ pytanieId: 12, odpowiedz: 2 });
```

Inne metody: `PUT`/`PATCH` (zmiana), `DELETE` (usunięcie).

> Tak działa quiz na tej stronie: przeglądarka wysyła odpowiedzi przez `fetch`, a **serwer** sprawdza, które są poprawne — dzięki temu nie da się podejrzeć prawidłowych odpowiedzi w kodzie strony.

## Parametry w adresie

```js
const parametry = new URLSearchParams({ szukaj: "html i css", strona: 2 });
fetch(`/api/artykuly?${parametry}`);   // /api/artykuly?szukaj=html+i+css&strona=2
```

## Przerwanie zapytania i limit czasu

```js
const odpowiedz = await fetch(adres, { signal: AbortSignal.timeout(5000) });   // maks. 5 s
```

## CORS — dlaczego zapytanie się nie udało?

Przeglądarka domyślnie blokuje odczyt odpowiedzi z **innej domeny**, chyba że serwer na to pozwoli (nagłówek `Access-Control-Allow-Origin`). Komunikat „blocked by CORS policy” w konsoli oznacza, że to **serwer** musi zezwolić na dostęp — nie naprawisz tego w kodzie przeglądarki.

## Zadanie

1. Zamień obiekt ucznia na JSON z wcięciami i z powrotem; sprawdź, co dzieje się z polem o wartości `undefined` i z datą.
2. Pobierz 10 użytkowników z `https://jsonplaceholder.typicode.com/users` i pokaż ich w tabeli (imię, e-mail, miasto).
3. Dodaj stany „Ładowanie…”, błąd i przycisk „Spróbuj ponownie”. Przetestuj błąd, zmieniając adres na nieistniejący.
4. Dodaj pole wyszukiwania filtrujące użytkowników po imieniu (z `debounce` z lekcji 14).
5. Wyślij POST z nowym postem na `https://jsonplaceholder.typicode.com/posts` i wypisz odpowiedź serwera. Obejrzyj zapytanie w zakładce **Network** (F12).
