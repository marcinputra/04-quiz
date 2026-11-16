Formularze to główny sposób, w jaki użytkownik przekazuje dane: logowanie, rejestracja, odpowiedzi w quizie. JavaScript pozwala je **sprawdzać na bieżąco** i wysyłać bez przeładowania strony.

```html
<form id="rejestracja" novalidate>
  <label for="email">E-mail</label>
  <input id="email" name="email" type="email" required autocomplete="email">
  <p class="blad" id="email-blad" aria-live="polite"></p>

  <label for="haslo">Hasło (min. 8 znaków)</label>
  <input id="haslo" name="haslo" type="password" required minlength="8" autocomplete="new-password">
  <p class="blad" id="haslo-blad" aria-live="polite"></p>

  <label for="klasa">Klasa</label>
  <select id="klasa" name="klasa">
    <option value="">— wybierz —</option>
    <option>1</option><option>2</option><option>3</option><option>4</option>
  </select>

  <label><input type="checkbox" name="regulamin" required> Akceptuję regulamin</label>

  <button type="submit">Załóż konto</button>
</form>
```

## Odczyt wartości pól

```js
const form = document.getElementById("rejestracja");

form.elements.email.value            // tekst z pola
form.elements.klasa.value            // wybrana opcja
form.elements.regulamin.checked      // true / false dla checkboxa

// przy radio — wartość zaznaczonej opcji
form.querySelector('input[name="odpowiedz"]:checked')?.value
```

> Wartość pola to **zawsze tekst** — także w `type="number"`. Zamieniaj przez `Number(pole.value)` lub `pole.valueAsNumber`.

## `FormData` — wszystkie pola naraz

```js
form.addEventListener("submit", (e) => {
  e.preventDefault();

  const dane = new FormData(form);
  dane.get("email");                       // wartość jednego pola
  const obiekt = Object.fromEntries(dane); // { email: "…", haslo: "…", klasa: "2", regulamin: "on" }
  console.log(obiekt);
});
```

`FormData` bierze pola po atrybucie **`name`** — bez `name` pole zostanie pominięte.

## Walidacja wbudowana (Constraint Validation API)

Atrybuty HTML (`required`, `type="email"`, `minlength`, `pattern`, `min`, `max`) działają też w JavaScripcie:

```js
const email = form.elements.email;

email.checkValidity()        // true / false
email.validity.valueMissing  // puste, a jest required
email.validity.typeMismatch  // zły format e-maila
email.validity.tooShort      // za krótkie (minlength)
email.validationMessage      // komunikat przeglądarki
```

`novalidate` na `<form>` wyłącza dymki przeglądarki — komunikaty pokażemy sami, w stylu strony.

## Własna walidacja z komunikatami

```js
function sprawdzPole(pole) {
  const blad = document.getElementById(`${pole.id}-blad`);
  let komunikat = "";

  if (pole.validity.valueMissing) komunikat = "To pole jest wymagane.";
  else if (pole.validity.typeMismatch) komunikat = "Podaj poprawny adres e-mail.";
  else if (pole.validity.tooShort) komunikat = `Minimum ${pole.minLength} znaków (teraz ${pole.value.length}).`;

  blad.textContent = komunikat;
  pole.setAttribute("aria-invalid", komunikat ? "true" : "false");
  pole.setAttribute("aria-describedby", blad.id);
  return !komunikat;
}

// walidacja przy opuszczeniu pola, a potem na bieżąco
for (const pole of [form.elements.email, form.elements.haslo]) {
  pole.addEventListener("blur", () => sprawdzPole(pole));
  pole.addEventListener("input", () => {
    if (pole.getAttribute("aria-invalid") === "true") sprawdzPole(pole);
  });
}

form.addEventListener("submit", (e) => {
  e.preventDefault();
  const pola = [form.elements.email, form.elements.haslo];
  const poprawne = pola.map(sprawdzPole).every(Boolean);

  if (!poprawne) {
    pola.find((p) => p.getAttribute("aria-invalid") === "true").focus();   // fokus na pierwszym błędzie
    return;
  }
  wyslij(Object.fromEntries(new FormData(form)));   // lekcja 18
});
```

### Własne reguły: `setCustomValidity`

```js
const haslo2 = document.getElementById("haslo2");
haslo2.addEventListener("input", () => {
  haslo2.setCustomValidity(haslo2.value === form.elements.haslo.value ? "" : "Hasła się różnią");
});
```

Pusty tekst oznacza „poprawne”; każdy inny — błąd (`validity.customError`).

## Dobre praktyki

- walidacja w przeglądarce to **wygoda dla użytkownika**, a nie zabezpieczenie — **serwer zawsze sprawdza dane ponownie** (tak działa logowanie na tej stronie),
- komunikat mówi, **jak poprawić** błąd, a nie tylko, że jest błąd,
- nie pokazuj błędów, zanim użytkownik zacznie wypełniać pole,
- zablokuj przycisk na czas wysyłania, by nie wysłać formularza dwa razy:

```js
const przycisk = form.querySelector('[type="submit"]');
przycisk.disabled = true;
przycisk.textContent = "Wysyłanie…";
```

## Zadanie

1. Zbuduj formularz rejestracji z tej lekcji i wypisz dane w konsoli przez `FormData`.
2. Dodaj własne komunikaty błędów pod polami, z `aria-invalid` i `aria-live`.
3. Dodaj pole „Powtórz hasło” z `setCustomValidity`.
4. Pokaż wskaźnik siły hasła (słabe / średnie / silne) — długość, cyfry, wielkie litery, znaki specjalne.
5. Po poprawnym wysłaniu ukryj formularz i pokaż komunikat „Konto założone, sprawdź skrzynkę e-mail”.
