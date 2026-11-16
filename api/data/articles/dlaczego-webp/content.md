Obrazy to zwykle **największa część** każdej strony internetowej — często ważą więcej niż cały HTML, CSS i JavaScript razem. Im cięższe obrazy, tym dłużej strona się ładuje, zwłaszcza na telefonie i słabym internecie. Format **WebP** pozwala zmniejszyć pliki graficzne kilkukrotnie bez widocznej utraty jakości. Wyjaśniamy, czym jest, dlaczego warto go używać i jak wstawić go na stronę.

## Czym jest WebP?

**WebP** to format plików graficznych opracowany przez **Google** i udostępniony w 2010 roku. Powstał specjalnie z myślą o internecie: ma dawać jak najmniejsze pliki przy dobrej jakości obrazu.

Jeden format zastępuje kilka starszych:

| Możliwość | JPEG | PNG | GIF | **WebP** |
|---|---|---|---|---|
| kompresja stratna (zdjęcia) | ✔ | ✘ | ✘ | **✔** |
| kompresja bezstratna (grafiki, zrzuty ekranu) | ✘ | ✔ | ✔ (256 kolorów) | **✔** |
| przezroczystość (kanał alfa) | ✘ | ✔ | tylko 1-bitowa | **✔** — także przy kompresji stratnej |
| animacja | ✘ | ✘ | ✔ | **✔** |

## Kompresja stratna i bezstratna — przypomnienie

To temat, który przydaje się także na **maturze z informatyki** (grafika rastrowa, formaty plików):

- **kompresja bezstratna** — po rozpakowaniu obraz jest **identyczny** z oryginałem, co do piksela (PNG, GIF, WebP bezstratny),
- **kompresja stratna** — część informacji, której oko i tak prawie nie zauważa, zostaje **usunięta na stałe**; plik jest dużo mniejszy (JPEG, WebP stratny).

WebP w trybie stratnym korzysta z technik znanych z kompresji wideo (kodek **VP8**): przewiduje zawartość bloku obrazu na podstawie sąsiednich bloków i zapisuje tylko różnice. Dzięki temu przy tej samej jakości plik jest zwykle mniejszy niż JPEG.

## Ile można zyskać? Pomiar na obrazie z tej strony

Sprawdziliśmy to na zdjęciu ze slidera na stronie głównej (1937 × 812 pikseli). Ten sam obraz zapisany w różnych formatach:

| Format | Rozmiar pliku | W porównaniu z PNG |
|---|---|---|
| PNG (bezstratny) | 811 KB | 100% |
| WebP bezstratny | 460 KB | 57% |
| JPEG, jakość 80 | 157 KB | 19% |
| **WebP stratny, jakość 80** | **49 KB** | **6%** |

Po zmniejszeniu do szerokości 800 pikseli: PNG — 228 KB, JPEG — 41 KB, **WebP — 14 KB**.

Kilka uczciwych zastrzeżeń:

- „jakość 80” w JPEG i WebP **nie oznacza dokładnie tej samej jakości** — to dwie różne skale,
- oryginał tego zdjęcia był już wcześniej zapisany jako WebP, co trochę pomaga temu formatowi,
- według pomiarów Google WebP stratny daje pliki **o 25–34% mniejsze niż JPEG** o porównywalnej jakości, a WebP bezstratny — **o ok. 26% mniejsze niż PNG**.

Nawet przy ostrożnym szacunku oszczędność jest więc wyraźna — a na stronie z kilkunastoma obrazami robi się z tego kilka megabajtów mniej do pobrania.

## Dlaczego to ważne?

### 1. Szybsze ładowanie strony

Mniejszy plik = krótszy czas pobierania. Na telefonie z internetem mobilnym różnica między 157 KB a 49 KB na **każdym** obrazie jest odczuwalna. Użytkownicy szybko opuszczają strony, które długo się ładują.

### 2. Lepsza pozycja w Google

Google ocenia szybkość stron wskaźnikami **Core Web Vitals**. Jeden z nich — **LCP** (*Largest Contentful Paint*) — mierzy, kiedy wyświetli się największy element na ekranie. Bardzo często jest nim właśnie duże zdjęcie u góry strony. Lżejszy obraz to lepszy wynik LCP, a szybkość strony wpływa na jej ocenę w wyszukiwarce.

Wynik swojej strony sprawdzisz w narzędziu **PageSpeed Insights** albo w zakładce **Lighthouse** w narzędziach przeglądarki (F12). Jedna z typowych rad brzmi tam: *„Wyświetlaj obrazy w formatach nowej generacji”* — czyli WebP lub AVIF.

### 3. Mniej danych dla użytkowników i serwera

Mniejsze pliki to mniejsze zużycie pakietu danych w telefonie i mniejszy transfer z serwera — co ma znaczenie, gdy hosting jest rozliczany za ruch.

### 4. Jeden format zamiast trzech

Zdjęcia, grafiki z przezroczystym tłem i proste animacje można zapisać w jednym formacie.

## Czy wszystkie przeglądarki obsługują WebP?

Tak — wszystkie współczesne: **Chrome, Edge, Firefox, Opera i Safari** (od wersji 14, czyli od 2020 roku), także na Androidzie i iPhone'ach. WebP działa w ok. 97% przeglądarek używanych na świecie. Nie obsługuje go tylko **Internet Explorer**, który nie jest już rozwijany.

Aktualne dane sprawdzisz na stronie [caniuse.com/webp](https://caniuse.com/webp).

## Jak zamienić obraz na WebP?

| Narzędzie | Jak |
|---|---|
| [Squoosh](https://squoosh.app) | w przeglądarce, bez instalacji; podgląd „przed i po” z suwakiem — najlepsze na początek |
| GIMP | *Plik → Eksportuj jako…* i rozszerzenie `.webp` |
| Photoshop | *Plik → Zapisz jako… → WebP* (nowsze wersje) |
| `cwebp` (Google) | w terminalu: `cwebp -q 80 zdjecie.jpg -o zdjecie.webp` |
| Python (biblioteka Pillow) | `Image.open("zdjecie.jpg").save("zdjecie.webp", quality=80)` |

Przy zdjęciach dobrym punktem wyjścia jest **jakość 75–85**. Porównaj wynik z oryginałem przy powiększeniu — jeśli nie widać różnicy, możesz spróbować niższej jakości.

Przykład w Pythonie — zamiana wszystkich zdjęć JPG w folderze:

```python
from pathlib import Path
from PIL import Image          # pip install pillow

for plik in Path("zdjecia").glob("*.jpg"):
    with Image.open(plik) as obraz:
        obraz.save(plik.with_suffix(".webp"), quality=80)
        print(plik.name, "→", plik.with_suffix(".webp").name)
```

## Jak wstawić WebP na stronę?

### Najprościej — zwykły `<img>`

Skoro WebP obsługują wszystkie współczesne przeglądarki, wystarczy:

```html
<img
  src="/obrazy/laptop.webp"
  alt="Laptop z kodem w Pythonie na biurku"
  width="800"
  height="450"
  loading="lazy"
>
```

- `alt` — opis obrazu dla osób niewidomych i dla wyszukiwarki,
- `width` i `height` — przeglądarka rezerwuje miejsce, zanim obraz się wczyta, więc strona „nie skacze” podczas ładowania,
- `loading="lazy"` — obraz pobiera się dopiero, gdy użytkownik do niego przewinie. **Nie używaj** tego dla głównego obrazu na samej górze strony — ten ma się wczytać jak najszybciej (można mu nawet dodać `fetchpriority="high"`).

### Z zapasowym formatem — `<picture>`

Jeśli chcesz mieć pewność, że obraz wyświetli się także w bardzo starej przeglądarce:

```html
<picture>
  <source srcset="/obrazy/laptop.avif" type="image/avif">
  <source srcset="/obrazy/laptop.webp" type="image/webp">
  <img src="/obrazy/laptop.jpg" alt="Laptop z kodem w Pythonie" width="800" height="450">
</picture>
```

Przeglądarka bierze **pierwszy** format, który rozumie — kolejność ma znaczenie. Element `<img>` na końcu jest obowiązkowy: to on wyświetla obraz i na nim ustawia się `alt` i wymiary.

### Różne rozmiary dla różnych ekranów — `srcset`

Telefon nie potrzebuje obrazu o szerokości 2000 pikseli. Możesz przygotować kilka wersji i pozwolić przeglądarce wybrać:

```html
<img
  src="/obrazy/laptop-800.webp"
  srcset="/obrazy/laptop-400.webp 400w,
          /obrazy/laptop-800.webp 800w,
          /obrazy/laptop-1600.webp 1600w"
  sizes="(max-width: 600px) 100vw, 800px"
  alt="Laptop z kodem w Pythonie"
  width="800"
  height="450"
>
```

Połączenie **WebP + odpowiedni rozmiar** daje największą oszczędność. Więcej o `srcset` i `<picture>` znajdziesz w kursie [HTML5 — część 2](/kursy/html5-zaawansowany).

### W CSS

```css
.naglowek {
  background-image: url("/obrazy/tlo.webp");
}
```

## Kiedy WebP nie jest najlepszym wyborem?

- **logo, ikony, proste rysunki** — lepszy jest **SVG**: grafika wektorowa jest ostra w każdym rozmiarze i zwykle waży bardzo mało,
- **zdjęcia do druku i archiwum** — zachowaj oryginał (np. RAW, TIFF lub PNG), a WebP traktuj jako wersję **do internetu**,
- **pliki do pobrania przez użytkownika** — nie każdy program graficzny lub starszy system otworzy WebP; tu JPEG i PNG są bezpieczniejsze,
- **maksymalna oszczędność** — nowszy format **AVIF** bywa jeszcze mniejszy od WebP, ale wolniej się koduje; można podać oba w `<picture>`.

## Podsumowanie

- WebP to format stworzony dla internetu: **mniejsze pliki** przy podobnej jakości, przezroczystość i animacje w jednym formacie,
- w naszym pomiarze zdjęcie zajęło **49 KB** zamiast 157 KB (JPEG) i 811 KB (PNG),
- mniejsze obrazy to **szybsza strona**, lepsze wyniki w Google i mniej danych do pobrania na telefonie,
- WebP działa we wszystkich współczesnych przeglądarkach — wystarczy zwykły `<img>` z `alt`, `width` i `height`,
- logo i ikony zapisuj jako SVG, a oryginały zdjęć zachowaj w pełnej jakości.

Wszystkie zdjęcia w sliderze na stronie głównej maturazinformatyki.it — i okładka tego artykułu — są w formacie WebP.

Chcesz wiedzieć więcej o grafice na stronach? Zajrzyj do kursów [HTML5 — część 1](/kursy/html5-od-podstaw) i [CSS od podstaw](/kursy/css-od-podstaw).
