W części 1 poznałeś podstawowe pola i walidację atrybutami. Teraz zbudujesz formularze, które są **wygodne na telefonie**, **podpowiadają dane** i **czytelnie informują o błędach**.

## Podpowiedzi: `datalist`

Pole tekstowe z listą podpowiedzi — użytkownik może wybrać z listy albo wpisać własną wartość:

```html
<label for="jezyk">Ulubiony język programowania</label>
<input id="jezyk" name="jezyk" list="jezyki">
<datalist id="jezyki">
  <option value="Python">
  <option value="C++">
  <option value="Java">
  <option value="JavaScript">
</datalist>
```

## Autouzupełnianie: `autocomplete`

Atrybut `autocomplete` mówi przeglądarce, **jakie dane** wpisać automatycznie (z zapisanych adresów, haseł, kart):

```html
<input type="text" name="imie" autocomplete="given-name">
<input type="text" name="nazwisko" autocomplete="family-name">
<input type="email" name="email" autocomplete="email">
<input type="tel" name="telefon" autocomplete="tel">
<input type="text" name="kod" autocomplete="postal-code">
<input type="password" name="haslo" autocomplete="current-password">   <!-- logowanie -->
<input type="password" name="nowe" autocomplete="new-password">        <!-- rejestracja -->
<input type="text" name="kod2fa" autocomplete="one-time-code" inputmode="numeric">
```

> `one-time-code` pozwala telefonowi podpowiedzieć kod z SMS-a lub e-maila jednym dotknięciem.

## Klawiatura na telefonie: `inputmode` i `enterkeyhint`

```html
<!-- klawiatura numeryczna, ale pole tekstowe (np. kod pocztowy z myślnikiem) -->
<input type="text" inputmode="numeric" pattern="[0-9]{2}-[0-9]{3}" name="kod">

<!-- przycisk Enter na klawiaturze opisany jako „Szukaj” -->
<input type="search" enterkeyhint="search" name="q">
```

Wartości `inputmode`: `numeric`, `decimal`, `tel`, `email`, `url`, `search`, `text`, `none`.

## Wyniki i postęp: `output`, `progress`, `meter`

```html
<form oninput="wynik.value = Number(a.value) + Number(b.value)">
  <input type="number" id="a" value="2"> +
  <input type="number" id="b" value="3"> =
  <output name="wynik" for="a b">5</output>
</form>

<label for="upload">Wysyłanie pliku</label>
<progress id="upload" max="100" value="70">70%</progress>

<label for="dysk">Zajęte miejsce na dysku</label>
<meter id="dysk" min="0" max="100" low="60" high="85" optimum="20" value="91">91%</meter>
```

- `<progress>` — postęp zadania (ile już zrobiono),
- `<meter>` — wartość w znanym zakresie (poziom baterii, wynik testu); `low`, `high`, `optimum` zmieniają kolor.

## Pola poza formularzem i wiele przycisków

```html
<form id="zamowienie" action="/zamow" method="post">…</form>

<!-- pole w innym miejscu strony, ale należące do formularza -->
<input type="text" name="kod-rabatowy" form="zamowienie">

<form action="/artykul" method="post">
  <button type="submit">Opublikuj</button>
  <!-- ten przycisk wysyła formularz pod inny adres i bez walidacji -->
  <button type="submit" formaction="/artykul/szkic" formnovalidate>Zapisz szkic</button>
</form>
```

## Constraint Validation API — walidacja w JavaScripcie

Przeglądarka sprawdza pola na podstawie atrybutów (`required`, `type`, `pattern`, `min`…). Z JavaScriptu możesz odczytać wynik i ustawić **własne komunikaty**:

```html
<form id="rejestracja" novalidate>
  <label for="haslo">Hasło</label>
  <input type="password" id="haslo" required minlength="8" aria-describedby="haslo-blad">
  <p id="haslo-blad" class="blad" aria-live="polite"></p>

  <label for="haslo2">Powtórz hasło</label>
  <input type="password" id="haslo2" required>

  <button>Załóż konto</button>
</form>

<script>
  const form = document.getElementById("rejestracja");
  const haslo = document.getElementById("haslo");
  const haslo2 = document.getElementById("haslo2");

  // własna reguła: hasła muszą być takie same
  haslo2.addEventListener("input", () => {
    haslo2.setCustomValidity(haslo2.value === haslo.value ? "" : "Hasła nie są takie same.");
  });

  form.addEventListener("submit", (e) => {
    if (!form.checkValidity()) {
      e.preventDefault();
      const blad = document.getElementById("haslo-blad");
      if (haslo.validity.valueMissing) blad.textContent = "Podaj hasło.";
      else if (haslo.validity.tooShort) blad.textContent = `Hasło musi mieć co najmniej ${haslo.minLength} znaków.`;
      else blad.textContent = "";
      form.reportValidity(); // pokaż dymki przeglądarki przy błędnych polach
    }
  });
</script>
```

| Element API | Działanie |
|---|---|
| `form.checkValidity()` | `true`, jeśli wszystkie pola są poprawne |
| `form.reportValidity()` | sprawdza i **pokazuje** komunikaty |
| `pole.validity` | obiekt ze szczegółami: `valueMissing`, `typeMismatch`, `tooShort`, `patternMismatch`, `rangeOverflow`… |
| `pole.setCustomValidity("…")` | ustawia własny błąd (pusty tekst = poprawne) |
| `novalidate` na `<form>` | wyłącza dymki przeglądarki — sam decydujesz, jak pokazać błędy |

W CSS przydają się pseudoklasy `:valid`, `:invalid` i `:user-invalid` (błąd pokazywany dopiero po interakcji użytkownika).

## Zadanie

Zbuduj formularz rejestracji na wydarzenie:

1. pola: imię i nazwisko, e-mail, telefon, kod pocztowy (`pattern` + `inputmode="numeric"`), szkoła (`datalist` z 5 podpowiedziami), liczba osób (`number` 1–5),
2. poprawne wartości `autocomplete` dla każdego pola,
3. `<output>` pokazujący cenę: liczba osób × 25 zł, aktualizowaną na bieżąco,
4. własna walidacja w JavaScripcie z polskimi komunikatami pod polami (z `aria-live`),
5. drugi przycisk „Zapisz na później” z `formnovalidate`.
