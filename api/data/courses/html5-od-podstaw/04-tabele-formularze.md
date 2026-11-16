## Tabele

Tabel używa się do **danych tabelarycznych** (plan lekcji, wyniki, cennik) — **nie** do układania strony.

```html
<table>
  <caption>Plan lekcji — poniedziałek</caption>
  <thead>
    <tr>
      <th scope="col">Godzina</th>
      <th scope="col">Przedmiot</th>
      <th scope="col">Sala</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>8:00</td>
      <td>Informatyka</td>
      <td>12</td>
    </tr>
    <tr>
      <td>8:55</td>
      <td>Matematyka</td>
      <td>5</td>
    </tr>
  </tbody>
</table>
```

| Element | Znaczenie |
|---|---|
| `<table>` | tabela |
| `<caption>` | tytuł tabeli |
| `<thead>`, `<tbody>`, `<tfoot>` | nagłówek, treść i stopka tabeli |
| `<tr>` | wiersz (*table row*) |
| `<th>` | komórka nagłówkowa; `scope="col"` / `"row"` mówi, czego dotyczy |
| `<td>` | zwykła komórka z danymi |

### Łączenie komórek

```html
<tr>
  <td colspan="2">Komórka zajmuje dwie kolumny</td>
</tr>
<tr>
  <td rowspan="3">Komórka zajmuje trzy wiersze</td>
  <td>…</td>
</tr>
```

## Formularze

Formularz zbiera dane od użytkownika. Atrybut `action` mówi, dokąd wysłać dane, a `method` — jak (`get` albo `post`).

```html
<form action="/kontakt" method="post">
  <label for="imie">Imię</label>
  <input type="text" id="imie" name="imie" required>

  <label for="email">E-mail</label>
  <input type="email" id="email" name="email" placeholder="jan@example.com" required>

  <label for="wiadomosc">Wiadomość</label>
  <textarea id="wiadomosc" name="wiadomosc" rows="5"></textarea>

  <button type="submit">Wyślij</button>
</form>
```

### Etykiety `label` — zawsze!

`<label for="email">` łączy się z polem o `id="email"`. Dzięki temu:

- kliknięcie etykiety ustawia kursor w polu,
- czytnik ekranu odczyta, czego dotyczy pole.

Atrybut `name` to nazwa, pod którą wartość pola trafi na serwer.

### Nowe typy pól w HTML5

HTML5 dodał typy pól, które same sprawdzają dane i pokazują wygodną klawiaturę na telefonie:

| Typ | Do czego |
|---|---|
| `email` | adres e-mail (sprawdza `@`) |
| `url` | adres strony |
| `tel` | numer telefonu (klawiatura numeryczna na telefonie) |
| `number` | liczba; `min`, `max`, `step` |
| `range` | suwak |
| `date`, `time` | wybór daty i godziny z kalendarza |
| `color` | wybór koloru |
| `search` | pole wyszukiwania |
| `password` | hasło (znaki ukryte) |

```html
<label for="wiek">Wiek</label>
<input type="number" id="wiek" name="wiek" min="13" max="120">

<label for="termin">Termin egzaminu</label>
<input type="date" id="termin" name="termin">

<label for="glosnosc">Głośność</label>
<input type="range" id="glosnosc" name="glosnosc" min="0" max="100" value="50">
```

### Walidacja bez JavaScriptu

| Atrybut | Działanie |
|---|---|
| `required` | pole wymagane |
| `minlength`, `maxlength` | minimalna i maksymalna długość tekstu |
| `min`, `max` | zakres liczb i dat |
| `pattern` | wyrażenie regularne, np. `pattern="[0-9]{2}-[0-9]{3}"` dla kodu pocztowego |
| `placeholder` | podpowiedź w pustym polu (**nie zastępuje** etykiety!) |

> Walidacja w przeglądarce jest wygodna dla użytkownika, ale **serwer i tak musi sprawdzić dane** — przeglądarkę łatwo obejść.

### Wybór z listy, pola wyboru i przyciski opcji

```html
<label for="klasa">Klasa</label>
<select id="klasa" name="klasa">
  <option value="">— wybierz —</option>
  <option value="3a">3a</option>
  <option value="3b">3b</option>
</select>

<fieldset>
  <legend>Poziom matury</legend>
  <input type="radio" id="podst" name="poziom" value="podstawowy">
  <label for="podst">podstawowy</label>
  <input type="radio" id="rozsz" name="poziom" value="rozszerzony">
  <label for="rozsz">rozszerzony</label>
</fieldset>

<input type="checkbox" id="zgoda" name="zgoda" required>
<label for="zgoda">Akceptuję regulamin</label>
```

- przyciski `radio` z tym samym `name` tworzą grupę — można wybrać **jeden**,
- `checkbox` — każde pole zaznacza się niezależnie,
- `<fieldset>` i `<legend>` grupują powiązane pola.

## Zadanie

1. Na stronie „O mnie” dodaj **tabelę** z Twoim planem lekcji na jeden dzień (z `<caption>`, `<thead>` i `<th>`).
2. Na stronie `kontakt.html` zbuduj **formularz kontaktowy** z polami: imię (wymagane), e-mail (`type="email"`, wymagane), temat (`select` z trzema opcjami), wiadomość (`textarea`, minimum 20 znaków), zgoda (`checkbox`, wymagana) i przyciskiem „Wyślij”.
3. Każde pole połącz z etykietą `label`.
4. Spróbuj wysłać pusty formularz i formularz z błędnym e-mailem — sprawdź, jak reaguje przeglądarka.
