W części 1 wstawiałeś `<audio>` i `<video>` z przyciskami przeglądarki. Teraz dodasz **napisy**, zoptymalizujesz ładowanie i zbudujesz **własne sterowanie** odtwarzaczem.

## Napisy i ścieżki tekstowe: WebVTT

Napisy zapisuje się w pliku tekstowym w formacie **WebVTT** (`.vtt`):

```text
WEBVTT

00:00:01.000 --> 00:00:04.000
Cześć! W tym filmie pokażę, jak zbudować formularz.

00:00:04.500 --> 00:00:08.000
Zaczniemy od elementu <form> i atrybutu action.

00:00:08.500 --> 00:00:12.000 line:10%
Ten napis pojawi się u góry ekranu.
```

- pierwsza linia to zawsze `WEBVTT`,
- każdy fragment: czas początku `-->` czas końca, a pod spodem tekst,
- po czasie można podać ustawienia położenia (`line`, `position`, `align`).

Podłączenie do wideo:

```html
<video controls width="640" preload="metadata" poster="okladka.jpg">
  <source src="lekcja.mp4" type="video/mp4">
  <track src="napisy-pl.vtt" kind="subtitles" srclang="pl" label="Polski" default>
  <track src="napisy-en.vtt" kind="subtitles" srclang="en" label="English">
  <track src="rozdzialy.vtt" kind="chapters" srclang="pl" label="Rozdziały">
</video>
```

| `kind` | Znaczenie |
|---|---|
| `subtitles` | tłumaczenie dialogów |
| `captions` | napisy dla niesłyszących (z opisem dźwięków: „[muzyka]”, „[dzwonek]”) |
| `chapters` | podział filmu na rozdziały |
| `descriptions` | opisy obrazu dla osób niewidomych |

> Plik `.vtt` musi być serwowany z tej samej domeny (albo z odpowiednimi nagłówkami CORS) — otwarty jako plik z dysku często nie zadziała. Uruchom lokalny serwer, np. rozszerzenie *Live Server* w VS Code.

## Ładowanie: `preload`

| Wartość | Działanie |
|---|---|
| `none` | nic nie pobieraj, dopóki użytkownik nie kliknie „play” (oszczędza transfer) |
| `metadata` | pobierz tylko długość i wymiary (dobry kompromis) |
| `auto` | przeglądarka może pobrać cały plik z wyprzedzeniem |

## Media API — sterowanie z JavaScriptu

Elementy `<audio>` i `<video>` mają wspólne API:

```html
<video id="film" width="640" preload="metadata">
  <source src="lekcja.mp4" type="video/mp4">
</video>

<div class="sterowanie">
  <button type="button" id="play" aria-label="Odtwórz">▶</button>
  <input type="range" id="pasek" min="0" value="0" step="0.1" aria-label="Pozycja w filmie">
  <span id="czas">0:00 / 0:00</span>
  <button type="button" id="wycisz" aria-pressed="false">Wycisz</button>
  <select id="predkosc" aria-label="Prędkość odtwarzania">
    <option value="0.75">0,75×</option>
    <option value="1" selected>1×</option>
    <option value="1.5">1,5×</option>
    <option value="2">2×</option>
  </select>
</div>

<script>
  const film = document.getElementById("film");
  const play = document.getElementById("play");
  const pasek = document.getElementById("pasek");
  const czas = document.getElementById("czas");
  const format = (s) => `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, "0")}`;

  play.addEventListener("click", () => (film.paused ? film.play() : film.pause()));
  film.addEventListener("play", () => { play.textContent = "⏸"; play.setAttribute("aria-label", "Pauza"); });
  film.addEventListener("pause", () => { play.textContent = "▶"; play.setAttribute("aria-label", "Odtwórz"); });

  film.addEventListener("loadedmetadata", () => { pasek.max = film.duration; });
  film.addEventListener("timeupdate", () => {
    pasek.value = film.currentTime;
    czas.textContent = `${format(film.currentTime)} / ${format(film.duration)}`;
  });
  pasek.addEventListener("input", () => { film.currentTime = pasek.value; });

  document.getElementById("wycisz").addEventListener("click", (e) => {
    film.muted = !film.muted;
    e.target.setAttribute("aria-pressed", film.muted);
  });
  document.getElementById("predkosc").addEventListener("change", (e) => {
    film.playbackRate = Number(e.target.value);
  });
</script>
```

| Właściwość / metoda | Znaczenie |
|---|---|
| `play()`, `pause()` | odtwórz / pauza (`play()` zwraca obietnicę — może zostać zablokowane) |
| `paused`, `ended` | czy wstrzymane / zakończone |
| `currentTime`, `duration` | bieżąca pozycja i długość (w sekundach) |
| `volume` (0–1), `muted` | głośność, wyciszenie |
| `playbackRate` | prędkość odtwarzania |
| zdarzenia `play`, `pause`, `timeupdate`, `ended`, `loadedmetadata`, `volumechange` | reagowanie na zmiany |

## Zasady autoodtwarzania

Przeglądarki **blokują automatyczne odtwarzanie z dźwiękiem**. Działa tylko:

```html
<video autoplay muted loop playsinline src="tlo.mp4"></video>
```

- `muted` — bez dźwięku,
- `playsinline` — na iPhonie film nie otwiera się na pełnym ekranie.

`film.play()` wywołane bez kliknięcia użytkownika może zostać odrzucone — obsłuż błąd: `film.play().catch(() => pokazPrzyciskPlay())`.

## Pełny ekran i obraz w obrazie

```js
document.getElementById("pelny").addEventListener("click", () => film.requestFullscreen());
document.getElementById("pip").addEventListener("click", () => film.requestPictureInPicture());
```

## Zadanie

1. Przygotuj plik WebVTT z co najmniej 6 napisami do dowolnego krótkiego filmu i drugi plik z 3 rozdziałami (`kind="chapters"`).
2. Zbuduj **własny odtwarzacz**: przycisk play/pauza, pasek postępu, czas, wyciszenie, prędkość odtwarzania i pełny ekran.
3. Wszystkie przyciski muszą działać z klawiatury i mieć poprawne etykiety (`aria-label`, `aria-pressed`).
4. Dodaj skrót klawiszowy: spacja = play/pauza, strzałki w lewo/prawo = przewinięcie o 5 sekund.
