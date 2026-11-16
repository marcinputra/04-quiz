Obrazy to zwykle **największa część** danych pobieranych przez stronę. Wysyłanie zdjęcia o szerokości 3000 px na telefon z ekranem 400 px marnuje transfer i spowalnia stronę. HTML5 pozwala przeglądarce **wybrać najlepszy plik** dla danego urządzenia.

## `srcset` z deskryptorem gęstości (`x`)

Gdy obraz ma **stały rozmiar** (np. logo 200 px), a chcesz, żeby był ostry na ekranach o wysokiej gęstości pikseli (Retina):

```html
<img src="logo-200.png"
     srcset="logo-200.png 1x, logo-400.png 2x, logo-600.png 3x"
     alt="maturazinformatyki.it" width="200" height="60">
```

Przeglądarka na zwykłym ekranie pobierze `logo-200.png`, a na ekranie Retina — `logo-400.png`.

## `srcset` z szerokością (`w`) i `sizes`

Gdy obraz **zmienia rozmiar** razem ze stroną (np. zdjęcie na całą szerokość kolumny), podaj szerokości plików i informację, jak szeroki będzie obraz na ekranie:

```html
<img src="kot-800.jpg"
     srcset="kot-400.jpg 400w,
             kot-800.jpg 800w,
             kot-1600.jpg 1600w"
     sizes="(max-width: 600px) 100vw,
            (max-width: 1200px) 50vw,
            600px"
     alt="Rudy kot śpiący na parapecie"
     width="1600" height="1067">
```

Jak czytać `sizes`:

- na ekranie do 600 px obraz zajmuje **100% szerokości okna** (`100vw`),
- do 1200 px — **połowę** szerokości (`50vw`),
- powyżej — **600 px**.

Przeglądarka sama liczy, jakiego pliku potrzebuje (uwzględniając gęstość ekranu), i pobiera **najmniejszy wystarczający**. `src` zostaje dla bardzo starych przeglądarek.

> Atrybuty `width` i `height` podają **proporcje** obrazu — dzięki nim przeglądarka rezerwuje miejsce, zanim obraz się pobierze, i strona nie „skacze” (wskaźnik **CLS**).

## `<picture>` — nowoczesne formaty

Formaty **AVIF** i **WebP** dają pliki nawet o 30–50% mniejsze niż JPG. Element `<picture>` pozwala podać kilka formatów — przeglądarka wybierze pierwszy, który obsługuje:

```html
<picture>
  <source srcset="kot.avif" type="image/avif">
  <source srcset="kot.webp" type="image/webp">
  <img src="kot.jpg" alt="Rudy kot śpiący na parapecie" width="800" height="533">
</picture>
```

Element `<img>` wewnątrz `<picture>` jest **obowiązkowy** — to on jest wyświetlany, a `alt`, `width`, `height` i style ustawia się właśnie na nim.

## `<picture>` — inny kadr na różnych ekranach (art direction)

Czasem na telefonie zamiast pomniejszonego szerokiego zdjęcia lepiej pokazać **inny kadr** (np. zbliżenie):

```html
<picture>
  <source media="(max-width: 600px)" srcset="druzyna-kadr-pionowy.jpg">
  <source media="(min-width: 601px)" srcset="druzyna-panorama.jpg">
  <img src="druzyna-panorama.jpg" alt="Drużyna szkolna na podium zawodów informatycznych">
</picture>
```

## `srcset` + formaty + `sizes` razem

```html
<picture>
  <source type="image/avif"
          srcset="hero-800.avif 800w, hero-1600.avif 1600w"
          sizes="100vw">
  <img src="hero-1600.jpg"
       srcset="hero-800.jpg 800w, hero-1600.jpg 1600w"
       sizes="100vw"
       alt="Uczniowie przy komputerach w pracowni"
       width="1600" height="700"
       fetchpriority="high">
</picture>
```

## Ładowanie obrazów

| Atrybut | Kiedy |
|---|---|
| `loading="lazy"` | obrazy **poniżej** pierwszego ekranu — pobiorą się, gdy użytkownik przewinie |
| `loading="eager"` (domyślne) | obrazy widoczne od razu |
| `fetchpriority="high"` | **główny obraz** strony (np. baner) — pobierz go przed innymi |
| `decoding="async"` | dekodowanie obrazu nie blokuje wyświetlania reszty strony |

> **Nigdy** nie dawaj `loading="lazy"` głównemu obrazowi na górze strony — opóźnisz jego pojawienie się (gorszy wskaźnik **LCP**).

## Jak przygotować pliki

- **Squoosh** (squoosh.app) — konwersja do AVIF/WebP i zmiana rozmiaru w przeglądarce,
- w projektach z narzędziami (Vite, Astro, Next.js) obrazy w kilku rozmiarach i formatach generują się automatycznie,
- sprawdzaj w F12 → *Network*, który plik faktycznie został pobrany (zmieniaj szerokość okna i odświeżaj).

## Zadanie

1. Przygotuj jedno zdjęcie w trzech szerokościach (400, 800, 1600 px) i dwóch formatach (WebP, JPG).
2. Wstaw je w galerii jako `<picture>` z `srcset` i `sizes` — tak, by na telefonie zajmowało całą szerokość, a na komputerze 1/3 szerokości.
3. Dodaj `width`, `height` i sensowny `alt`.
4. Zdjęcia poniżej pierwszego ekranu oznacz `loading="lazy"`, a baner na górze `fetchpriority="high"`.
5. W zakładce *Network* sprawdź, który plik pobiera przeglądarka przy szerokości okna 400 px, a który przy 1400 px. Zapisz wnioski w komentarzu HTML.
