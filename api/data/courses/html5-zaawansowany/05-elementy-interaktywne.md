Rozwijane sekcje, okna dialogowe i wyskakujące podpowiedzi przez lata wymagały bibliotek JavaScript. Dziś HTML5 ma je **wbudowane** — z obsługą klawiatury i dostępnością w standardzie.

## `<details>` i `<summary>` — rozwijana sekcja

```html
<details>
  <summary>Ile trwa egzamin maturalny z informatyki?</summary>
  <p>Część pisemna na poziomie rozszerzonym trwa 210 minut.</p>
</details>

<details open>
  <summary>Ta sekcja jest domyślnie rozwinięta</summary>
  <p>Atrybut <code>open</code> rozwija ją od początku.</p>
</details>
```

- działa **bez JavaScriptu**, z klawiaturą (Enter/spacja) i czytnikiem ekranu,
- idealne do sekcji FAQ, „pokaż rozwiązanie”, dodatkowych szczegółów.

### Akordeon — tylko jedna sekcja otwarta

Sekcje `<details>` z tym samym atrybutem `name` tworzą grupę — otwarcie jednej zamyka pozostałe:

```html
<details name="faq"><summary>Pytanie 1</summary><p>…</p></details>
<details name="faq"><summary>Pytanie 2</summary><p>…</p></details>
<details name="faq"><summary>Pytanie 3</summary><p>…</p></details>
```

## `<dialog>` — okno dialogowe

```html
<button type="button" id="otworz">Usuń konto</button>

<dialog id="potwierdz" aria-labelledby="dialog-tytul">
  <h2 id="dialog-tytul">Na pewno usunąć konto?</h2>
  <p>Tej operacji nie można cofnąć.</p>
  <form method="dialog">
    <button value="anuluj" autofocus>Anuluj</button>
    <button value="usun">Usuń</button>
  </form>
</dialog>

<script>
  const dialog = document.getElementById("potwierdz");
  document.getElementById("otworz").addEventListener("click", () => dialog.showModal());

  dialog.addEventListener("close", () => {
    if (dialog.returnValue === "usun") {
      console.log("Usuwanie konta…");
    }
  });
</script>
```

Co daje `showModal()` za darmo:

- przyciemnione tło (w CSS: pseudoelement `::backdrop`),
- **reszta strony jest nieaktywna** — nie da się kliknąć ani przejść do niej Tabem,
- fokus trafia do okna (na element z `autofocus`), a po zamknięciu **wraca** na przycisk, który je otworzył,
- **Escape** zamyka okno,
- `<form method="dialog">` zamyka okno, a wartość klikniętego przycisku trafia do `dialog.returnValue`.

`dialog.show()` (bez *Modal*) otwiera okno **bez** blokowania strony.

## Atrybut `popover` — wyskakujące elementy bez JavaScriptu

```html
<button type="button" popovertarget="pomoc">Pomoc</button>

<div id="pomoc" popover>
  <h3>Jak zdobyć punkty?</h3>
  <p>Rozwiązuj quizy i zadania z kursów.</p>
</div>
```

- kliknięcie przycisku pokazuje/ukrywa element — **zero JavaScriptu**,
- kliknięcie poza nim albo **Escape** go zamyka (*light dismiss*),
- element wyświetla się **nad całą stroną** (w tzw. *top layer*), więc nie zasłonią go inne elementy,
- `popovertargetaction="show"` / `"hide"` — przycisk tylko otwiera albo tylko zamyka,
- `popover="manual"` — element nie zamyka się sam (np. powiadomienie, które zamykasz przyciskiem).

| | `<dialog>` + `showModal()` | `popover` |
|---|---|---|
| blokuje resztę strony | tak | nie |
| zastosowanie | potwierdzenia, formularze w oknie | menu, podpowiedzi, powiadomienia |
| JavaScript | potrzebny do otwarcia | niepotrzebny |

## Atrybut `inert`

Element z atrybutem `inert` (i cała jego zawartość) staje się **nieaktywny**: nie da się go kliknąć, zaznaczyć Tabem ani znaleźć czytnikiem ekranu.

```html
<main inert>…</main>  <!-- np. gdy otwarty jest własny panel boczny -->
```

Przydaje się przy własnych panelach i menu wysuwanych — `showModal()` robi to automatycznie.

## `contenteditable` — edycja treści na stronie

```html
<div contenteditable="true">Kliknij i edytuj ten tekst.</div>
<div contenteditable="plaintext-only">Tu można wpisać tylko zwykły tekst.</div>
```

To podstawa edytorów tekstu w przeglądarce (np. notatek czy edytorów artykułów).

## Zadanie

Dodaj do swojej strony:

1. sekcję **FAQ** z pięcioma pytaniami jako akordeon (`<details name="…">`),
2. przycisk „Zapisz się na newsletter” otwierający `<dialog>` z formularzem (`method="dialog"`), z przyciskami „Anuluj” i „Zapisz”; po zamknięciu wypisz w konsoli wybraną opcję,
3. ikonę „?” przy formularzu kontaktowym, która otwiera `popover` z instrukcją,
4. sprawdź wszystko **samą klawiaturą**: czy Escape zamyka okno i czy fokus wraca na przycisk.
