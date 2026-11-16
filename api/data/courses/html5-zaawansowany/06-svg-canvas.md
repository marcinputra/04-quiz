HTML5 daje dwa sposoby rysowania grafiki: **SVG** — grafika wektorowa opisana znacznikami, oraz **Canvas** — „płótno”, na którym rysujesz pikselami z JavaScriptu.

## SVG — grafika wektorowa

**SVG** (*Scalable Vector Graphics*) opisuje kształty matematycznie, więc jest **ostre w każdym rozmiarze**. Można go wstawić jako plik (`<img src="logo.svg">`) albo **bezpośrednio w HTML**:

```html
<svg width="220" height="120" viewBox="0 0 220 120" role="img" aria-labelledby="svg-tytul">
  <title id="svg-tytul">Prostokąt, koło i linia</title>
  <rect x="10" y="10" width="80" height="60" rx="8" fill="#facc15" />
  <circle cx="150" cy="45" r="35" fill="none" stroke="#d88f2c" stroke-width="6" />
  <line x1="10" y1="100" x2="210" y2="100" stroke="#e5e7eb" stroke-width="3" stroke-dasharray="8 4" />
  <text x="110" y="118" text-anchor="middle" font-size="12" fill="#e5e7eb">SVG w HTML5</text>
</svg>
```

| Element | Kształt |
|---|---|
| `<rect>` | prostokąt (`rx` — zaokrąglenie) |
| `<circle>`, `<ellipse>` | koło, elipsa |
| `<line>`, `<polyline>`, `<polygon>` | linia, łamana, wielokąt |
| `<path d="…">` | dowolny kształt (polecenia `M` — przesuń, `L` — linia, `C` — krzywa, `Z` — zamknij) |
| `<text>` | tekst |
| `<g>` | grupa elementów (wspólne przesunięcie, kolor) |

### `viewBox` — układ współrzędnych

`viewBox="0 0 220 120"` definiuje **wewnętrzny** układ współrzędnych (x, y, szerokość, wysokość). Dzięki niemu rysunek skaluje się do dowolnych `width`/`height` bez zniekształceń — to klucz do responsywnego SVG.

### Ponowne użycie: `<symbol>` i `<use>`

```html
<svg hidden>
  <symbol id="ikona-gwiazda" viewBox="0 0 24 24">
    <path d="M12 2l3 7h7l-5.5 4.5 2 7.5L12 17l-6.5 4 2-7.5L2 9h7z" />
  </symbol>
</svg>

<svg width="24" height="24" aria-hidden="true"><use href="#ikona-gwiazda" fill="#facc15" /></svg>
<svg width="48" height="48" aria-hidden="true"><use href="#ikona-gwiazda" fill="#d88f2c" /></svg>
```

Tak buduje się **zestawy ikon** — jedna definicja, wiele użyć w różnych rozmiarach i kolorach.

### Dostępność SVG

- grafika z treścią: `role="img"` + `<title>` (i ewentualnie `<desc>`), powiązane przez `aria-labelledby`,
- grafika dekoracyjna lub ikona obok tekstu: `aria-hidden="true"`.

## Canvas — rysowanie z JavaScriptu

`<canvas>` to prostokątne płótno pikseli. Sam w sobie nic nie pokazuje — rysujesz na nim kodem:

```html
<canvas id="wykres" width="400" height="220">
  Wykres słupkowy: Python 45%, C++ 30%, Java 25%.
</canvas>

<script>
  const canvas = document.getElementById("wykres");
  const ctx = canvas.getContext("2d");

  const dane = [
    { nazwa: "Python", wartosc: 45 },
    { nazwa: "C++", wartosc: 30 },
    { nazwa: "Java", wartosc: 25 },
  ];

  ctx.font = "14px sans-serif";
  dane.forEach((d, i) => {
    const x = 40 + i * 120;
    const wysokosc = d.wartosc * 3;
    ctx.fillStyle = "#facc15";
    ctx.fillRect(x, 190 - wysokosc, 80, wysokosc);   // słupek
    ctx.fillStyle = "#e5e7eb";
    ctx.fillText(d.nazwa, x + 15, 210);               // podpis
    ctx.fillText(d.wartosc + "%", x + 25, 180 - wysokosc);
  });
</script>
```

Najważniejsze metody kontekstu `2d`:

| Metoda | Działanie |
|---|---|
| `fillRect`, `strokeRect`, `clearRect` | wypełniony / obrysowany / wyczyszczony prostokąt |
| `beginPath`, `moveTo`, `lineTo`, `arc`, `closePath` | budowanie ścieżki |
| `fill()`, `stroke()` | wypełnienie / obrys ścieżki |
| `fillText` | tekst |
| `drawImage` | obraz (także klatka z `<video>`) |
| `requestAnimationFrame` | płynna animacja (ok. 60 klatek na sekundę) |

> Treść wewnątrz `<canvas>` to **tekst zastępczy** — zobaczą go czytniki ekranu i przeglądarki bez obsługi Canvas. Dla wykresów warto dodatkowo podać dane w tabeli.

### Ostry obraz na ekranach Retina

Atrybuty `width`/`height` to rozdzielczość płótna w pikselach. Na ekranie o podwójnej gęstości ustaw płótno 2× większe i przeskaluj kontekst:

```js
const skala = window.devicePixelRatio || 1;
canvas.width = 400 * skala;
canvas.height = 220 * skala;
canvas.style.width = "400px";
canvas.style.height = "220px";
ctx.scale(skala, skala);
```

## SVG czy Canvas?

| | SVG | Canvas |
|---|---|---|
| rodzaj | wektory (elementy w DOM) | piksele (bitmapa) |
| skalowanie | ostre w każdym rozmiarze | rozmazuje się przy powiększeniu |
| zdarzenia (kliknięcie elementu) | wbudowane — każdy kształt to element | trzeba samemu liczyć, co kliknięto |
| dostępność | dobra (`title`, tekst w DOM) | wymaga tekstu zastępczego |
| wydajność przy tysiącach obiektów | spada | bardzo dobra |
| typowe zastosowania | ikony, logo, wykresy, mapy | gry, edytory zdjęć, wizualizacje na żywo |

## Zadanie

1. Narysuj w **SVG** logo swojej strony (min. 3 różne kształty i tekst) z poprawnym `viewBox`, `role="img"` i `<title>`; sprawdź, że jest ostre przy szerokości 50 px i 500 px.
2. Zrób zestaw 3 ikon jako `<symbol>` i użyj ich w menu.
3. Na **Canvas** narysuj wykres słupkowy z Twoimi ocenami z 5 przedmiotów (z podpisami i tekstem zastępczym).
4. *Dla chętnych:* animacja na Canvas — piłka odbijająca się od krawędzi płótna (`requestAnimationFrame`).
