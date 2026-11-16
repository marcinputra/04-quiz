W części 1 sekcja `<head>` miała tylko kodowanie, `viewport` i tytuł. W profesjonalnej stronie to miejsce, które decyduje o tym, **jak strona wygląda w Google, na Facebooku, w Messengerze i na ekranie telefonu**.

## Tytuł i opis — podstawa SEO

```html
<title>Kurs HTML5 dla zaawansowanych — dostępność, SVG, Web Components | maturazinformatyki.it</title>
<meta name="description" content="Darmowy kurs HTML5 na poziomie zaawansowanym: dostępność, obrazy responsywne, formularze, SVG, Canvas i Web Components. 10 części z zadaniami.">
```

- `<title>` — najważniejszy element dla wyszukiwarki: ok. **50–60 znaków**, najważniejsze słowa na początku, **unikalny dla każdej podstrony**,
- `description` — tekst pod tytułem w wynikach wyszukiwania: ok. **150–160 znaków**, zachęcający do kliknięcia. Nie wpływa bezpośrednio na pozycję, ale na liczbę kliknięć.

## Adres kanoniczny i roboty

```html
<link rel="canonical" href="https://maturazinformatyki.it/kursy/html5-zaawansowany">
<meta name="robots" content="index, follow">
```

- `canonical` — gdy ta sama treść jest dostępna pod kilkoma adresami (np. z `?utm_source=…`), wskazuje wyszukiwarce **adres główny**, żeby nie traktowała kopii jako duplikatów,
- `robots` — `noindex` ukrywa stronę w wynikach (np. panel logowania, strony testowe), `nofollow` — wyszukiwarka nie podąża za linkami.

## Open Graph — podgląd w mediach społecznościowych

Gdy ktoś wkleja link na Facebooku, LinkedInie czy w Messengerze, serwis pobiera dane z tagów **Open Graph**:

```html
<meta property="og:type" content="website">
<meta property="og:title" content="Kurs HTML5 — część 2: poziom zaawansowany">
<meta property="og:description" content="10 części: dostępność, SVG, Canvas, Web Components i więcej.">
<meta property="og:image" content="https://maturazinformatyki.it/img/og-html5.png">
<meta property="og:url" content="https://maturazinformatyki.it/kursy/html5-zaawansowany">
<meta property="og:locale" content="pl_PL">

<!-- X (Twitter) -->
<meta name="twitter:card" content="summary_large_image">
```

> Obraz `og:image` powinien mieć **1200 × 630 px** i pełny adres (z `https://`). Podgląd sprawdzisz w narzędziu *Sharing Debugger* Facebooka.

## Ikony strony (favicony)

```html
<link rel="icon" href="/favicon.ico" sizes="32x32">
<link rel="icon" href="/icon.svg" type="image/svg+xml">
<link rel="apple-touch-icon" href="/apple-touch-icon.png">  <!-- 180 × 180 px -->
<link rel="manifest" href="/site.webmanifest">
<meta name="theme-color" content="#262a2b">
```

- `icon.svg` — ostra ikona w każdym rozmiarze (nowoczesne przeglądarki),
- `apple-touch-icon` — ikona po dodaniu strony do ekranu głównego iPhone'a,
- `manifest` — plik JSON z nazwą i ikonami aplikacji (podstawa **PWA**),
- `theme-color` — kolor paska przeglądarki na telefonie.

## Wskazówki dla przeglądarki — szybsze ładowanie

```html
<!-- nawiąż połączenie z serwerem czcionek zawczasu -->
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>

<!-- pobierz od razu kluczowy zasób (np. główny obraz strony) -->
<link rel="preload" href="/img/hero.avif" as="image" type="image/avif">

<!-- pobierz w wolnej chwili stronę, na którą użytkownik prawdopodobnie przejdzie -->
<link rel="prefetch" href="/kursy/html5-zaawansowany/lekcje/2">
```

Do wydajności wrócimy w części 10.

## Kolejność w `<head>`

Dobra praktyka: najpierw `charset` (musi być w pierwszych 1024 bajtach), potem `viewport`, `title`, opisy i dopiero później style, skrypty i pozostałe znaczniki.

```html
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>…</title>
  <meta name="description" content="…">
  <link rel="canonical" href="…">
  <!-- Open Graph, ikony, preconnect, style… -->
</head>
```

## Zadanie

Przygotuj kompletny `<head>` dla strony-wizytówki z projektu końcowego części 1:

1. unikalny `title` (do 60 znaków) i `description` (do 160 znaków) dla każdej z trzech podstron,
2. `canonical` dla każdej podstrony,
3. komplet tagów Open Graph z obrazem 1200 × 630 px,
4. favicon w SVG i `apple-touch-icon`,
5. podstrona `kontakt.html` z `noindex`? Zastanów się i uzasadnij w komentarzu w kodzie, czy to dobry pomysł.
