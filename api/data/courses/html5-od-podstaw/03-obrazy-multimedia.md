## Obrazy

Obraz wstawia się pustym elementem `<img>`:

```html
<img src="zdjecia/kot.jpg" alt="Rudy kot śpiący na parapecie" width="400" height="300">
```

| Atrybut | Znaczenie |
|---|---|
| `src` | ścieżka do pliku (względna albo pełny adres) |
| `alt` | **tekst alternatywny** — opis obrazu (wymagany!) |
| `width`, `height` | wymiary w pikselach — przeglądarka rezerwuje miejsce, więc strona nie „skacze” podczas ładowania |
| `loading="lazy"` | obraz ładuje się dopiero, gdy użytkownik do niego przewinie |

### Dlaczego `alt` jest tak ważny?

- czytają go **czytniki ekranu** osób niewidomych,
- wyświetla się, gdy obraz się nie załaduje,
- pomaga **wyszukiwarkom** zrozumieć, co jest na obrazie.

Opisz, **co przedstawia** obraz („Wykres sprzedaży rosnącej od stycznia do czerwca”), a nie „obrazek” czy „zdjęcie1.jpg”. Obraz czysto dekoracyjny dostaje pusty `alt=""`.

### Formaty plików

| Format | Kiedy używać |
|---|---|
| **JPG** | zdjęcia |
| **PNG** | grafiki z przezroczystością, zrzuty ekranu |
| **SVG** | logo, ikony — grafika wektorowa, ostra w każdym rozmiarze |
| **WebP / AVIF** | nowoczesne formaty — mniejsze pliki przy tej samej jakości |

## Obraz z podpisem: `figure` i `figcaption`

```html
<figure>
  <img src="wykres.png" alt="Wykres liczby uczniów w latach 2020–2025">
  <figcaption>Rys. 1. Liczba uczniów zdających maturę z informatyki.</figcaption>
</figure>
```

## Obraz jako link

```html
<a href="galeria.html">
  <img src="miniatura.jpg" alt="Przejdź do galerii zdjęć">
</a>
```

## Dźwięk: `audio`

HTML5 odtwarza dźwięk bez żadnych wtyczek:

```html
<audio controls>
  <source src="nagranie.mp3" type="audio/mpeg">
  <source src="nagranie.ogg" type="audio/ogg">
  Twoja przeglądarka nie obsługuje odtwarzania dźwięku.
</audio>
```

- `controls` — pokazuje przyciski odtwarzania,
- kilka `<source>` — przeglądarka wybierze pierwszy format, który obsługuje,
- tekst w środku wyświetli się tylko w bardzo starych przeglądarkach.

## Wideo: `video`

```html
<video controls width="640" poster="okladka.jpg">
  <source src="film.mp4" type="video/mp4">
  <source src="film.webm" type="video/webm">
  <track src="napisy-pl.vtt" kind="subtitles" srclang="pl" label="Polski">
  Twoja przeglądarka nie obsługuje odtwarzania wideo.
</video>
```

| Atrybut / element | Znaczenie |
|---|---|
| `poster` | obraz wyświetlany przed uruchomieniem filmu |
| `autoplay muted` | automatyczne odtwarzanie (przeglądarki pozwalają na nie tylko bez dźwięku) |
| `loop` | odtwarzanie w pętli |
| `<track>` | napisy — ważne dla osób niesłyszących |

## Osadzanie treści z innych stron: `iframe`

Mapy czy filmy z serwisów zewnętrznych wstawia się elementem `<iframe>` — gotowy kod dają same serwisy (opcja *Udostępnij → Umieść*):

```html
<iframe src="https://www.openstreetmap.org/export/embed.html?bbox=21.0,52.2,21.03,52.24"
        width="600" height="400" title="Mapa centrum Warszawy"></iframe>
```

> Atrybut `title` opisuje zawartość ramki dla czytników ekranu. Pamiętaj, że osadzone treści z innych serwisów mogą zapisywać własne ciasteczka.

## Zadanie

Utwórz stronę `galeria.html`:

1. dodaj nagłówek `<h1>Moja galeria</h1>`,
2. wstaw trzy zdjęcia (z folderu `zdjecia/`) — każde w `<figure>` z podpisem `<figcaption>` i sensownym `alt`,
3. jedno zdjęcie zrób linkiem do jego pełnej wersji,
4. dodaj element `<audio controls>` albo `<video controls>` z dowolnym plikiem,
5. połącz galerię linkami z poprzednimi stronami.
