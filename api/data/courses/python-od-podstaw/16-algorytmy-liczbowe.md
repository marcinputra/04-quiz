Algorytmy na liczbach to „żelazny zestaw” matury z informatyki: dzielniki, liczby pierwsze, NWD, cyfry i systemy liczbowe. Warto umieć je napisać z pamięci.

## Cyfry liczby

```python
def cyfry(n):
    wynik = []
    while n > 0:
        wynik.append(n % 10)
        n //= 10
    return wynik[::-1]

print(cyfry(2026))                  # [2, 0, 2, 6]
print([int(c) for c in str(2026)])  # to samo przez zamianę na tekst
print(sum(map(int, str(9875))))     # 29 — suma cyfr
```

Oba sposoby są poprawne; wersja przez `str` jest krótsza, wersja z `%` i `//` bywa wymagana w zadaniach „bez zamiany na tekst”.

## Dzielniki

```python
def dzielniki(n):
    wynik = []
    d = 1
    while d * d <= n:
        if n % d == 0:
            wynik.append(d)
            if d != n // d:
                wynik.append(n // d)
        d += 1
    return sorted(wynik)

print(dzielniki(36))    # [1, 2, 3, 4, 6, 9, 12, 18, 36]
```

Wystarczy sprawdzać `d` do **√n** — każdy dzielnik większy od pierwiastka ma „parę” mniejszą od niego. Dla `n = 10⁹` to 31 623 kroki zamiast miliarda.

### Liczba doskonała

```python
def czy_doskonala(n):
    return sum(dzielniki(n)) - n == n

print([n for n in range(1, 10000) if czy_doskonala(n)])   # [6, 28, 496, 8128]
```

## Liczby pierwsze

```python
def czy_pierwsza(n):
    if n < 2:
        return False
    if n < 4:
        return True
    if n % 2 == 0:
        return False
    d = 3
    while d * d <= n:
        if n % d == 0:
            return False
        d += 2              # tylko dzielniki nieparzyste
    return True
```

### Sito Eratostenesa — wszystkie pierwsze do `n`

```python
def sito(n):
    pierwsza = [True] * (n + 1)
    pierwsza[0] = pierwsza[1] = False
    for i in range(2, int(n ** 0.5) + 1):
        if pierwsza[i]:
            for k in range(i * i, n + 1, i):
                pierwsza[k] = False     # wykreśl wielokrotności i
    return [i for i in range(n + 1) if pierwsza[i]]

print(sito(30))          # [2, 3, 5, 7, 11, 13, 17, 19, 23, 29]
print(len(sito(10**6)))  # 78498
```

Gdy w zadaniu trzeba sprawdzić **wiele** liczb z ograniczonego zakresu, sito liczone raz jest dużo szybsze niż `czy_pierwsza` dla każdej liczby.

### Rozkład na czynniki pierwsze

```python
def czynniki(n):
    wynik = []
    d = 2
    while d * d <= n:
        while n % d == 0:
            wynik.append(d)
            n //= d
        d += 1
    if n > 1:
        wynik.append(n)
    return wynik

print(czynniki(360))    # [2, 2, 2, 3, 3, 5]
print(czynniki(97))     # [97]
```

## NWD i NWW — algorytm Euklidesa

```python
def nwd(a, b):
    while b != 0:
        a, b = b, a % b
    return a

def nww(a, b):
    return a * b // nwd(a, b)

print(nwd(48, 18), nww(4, 6))    # 6 12
```

Kroki dla `nwd(48, 18)`: `(48, 18) → (18, 12) → (12, 6) → (6, 0)` → wynik **6**. W bibliotece: `math.gcd`, `math.lcm`.

Liczby **względnie pierwsze** to takie, których NWD wynosi 1, np. 8 i 15.

## Systemy liczbowe

### Funkcje wbudowane

```python
print(bin(13))           # 0b1101
print(oct(64))           # 0o100
print(hex(255))          # 0xff
print(bin(13)[2:])       # 1101 — bez przedrostka
print(f"{13:b}", f"{255:X}", f"{5:08b}")   # 1101 FF 00000101

print(int("1101", 2))    # 13 — z dowolnego systemu 2–36 na dziesiętny
print(int("ff", 16))     # 255
print(int("210", 3))     # 21
```

### Algorytm zamiany — dziesiętny na system o podstawie `p`

Dzielimy przez `p` i zapisujemy reszty **od końca**:

```python
CYFRY = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ"

def na_system(n, p):
    if n == 0:
        return "0"
    wynik = ""
    while n > 0:
        wynik = CYFRY[n % p] + wynik
        n //= p
    return wynik

print(na_system(13, 2), na_system(255, 16), na_system(100, 8))   # 1101 FF 144
```

### Z systemu `p` na dziesiętny — schemat Hornera

```python
def z_systemu(s, p):
    wynik = 0
    for znak in s:
        wynik = wynik * p + CYFRY.index(znak.upper())
    return wynik

print(z_systemu("1101", 2), z_systemu("FF", 16))   # 13 255
```

Schemat Hornera służy też do szybkiego obliczania wartości wielomianu: `((a·x + b)·x + c)·x + d`.

## Inne klasyczne problemy

```python
# Palindrom liczbowy
print(str(12321) == str(12321)[::-1])     # True

# Liczba Armstronga (suma cyfr do potęgi liczby cyfr = liczba): 153 = 1³ + 5³ + 3³
def armstrong(n):
    s = str(n)
    return n == sum(int(c) ** len(s) for c in s)
print([n for n in range(100, 1000) if armstrong(n)])   # [153, 370, 371, 407]

# Pierwiastek metodą Newtona (Herona)
def pierwiastek(x, dokladnosc=1e-10):
    p = x
    while abs(p * p - x) > dokladnosc:
        p = (p + x / p) / 2
    return p
print(round(pierwiastek(2), 6))           # 1.414214
```

## Zadanie

1. Wypisz liczby z zakresu 1–1000, które mają dokładnie 3 dzielniki (wskazówka: to kwadraty liczb pierwszych).
2. Znajdź wszystkie pary **liczb bliźniaczych** (pierwsze różniące się o 2) mniejsze od 1000.
3. Sprawdź hipotezę Goldbacha dla parzystych liczb 4–1000: każda jest sumą dwóch liczb pierwszych.
4. Wczytaj liczbę binarną i zamień ją na system ósemkowy i szesnastkowy — raz własnymi funkcjami, raz wbudowanymi.
5. Policz, ile liczb od 1 do 10 000 ma w zapisie dwójkowym więcej jedynek niż zer (`bin(n).count("1")`).
6. Zmierz czas: `czy_pierwsza` dla wszystkich liczb do 10⁶ kontra jedno wywołanie `sito(10**6)`.
