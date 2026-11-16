Druga grupa typowych zadań maturalnych dotyczy **napisów**: palindromy, anagramy, szyfry, wyszukiwanie wzorca, najdłuższe fragmenty. Python ma do tego świetne narzędzia — ale warto też rozumieć, jak działają „ręczne” algorytmy.

## Palindromy

```python
def czy_palindrom(s):
    return s == s[::-1]

print(czy_palindrom("kajak"), czy_palindrom("python"))   # True False

# zdanie — bez spacji i wielkości liter
def palindrom_zdanie(zdanie):
    litery = [z.lower() for z in zdanie if z.isalpha()]
    return litery == litery[::-1]

print(palindrom_zdanie("Kobyła ma mały bok"))   # True
```

Wersja „ręczna” — dwa wskaźniki:

```python
def czy_palindrom2(s):
    i, j = 0, len(s) - 1
    while i < j:
        if s[i] != s[j]:
            return False
        i += 1
        j -= 1
    return True
```

## Anagramy

Dwa słowa są anagramami, gdy składają się z tych samych liter:

```python
def anagramy(a, b):
    return sorted(a) == sorted(b)

print(anagramy("klasa", "salak"), anagramy("kot", "tok"), anagramy("kot", "kto"))
# True True True

from collections import Counter
print(Counter("ratownik") == Counter("tworanik"))   # True — działa szybciej dla długich słów
```

### Grupowanie anagramów

```python
slowa = ["kot", "tok", "las", "sal", "kto", "pies"]
grupy = {}
for s in slowa:
    klucz = "".join(sorted(s))
    grupy.setdefault(klucz, []).append(s)
print(list(grupy.values()))    # [['kot', 'tok', 'kto'], ['las', 'sal'], ['pies']]
```

## Szyfr Cezara

Każdą literę przesuwamy o `k` pozycji w alfabecie; po `z` wracamy do `a` (stąd `% 26`):

```python
def cezar(tekst, k):
    wynik = ""
    for z in tekst:
        if "a" <= z <= "z":
            wynik += chr((ord(z) - ord("a") + k) % 26 + ord("a"))
        elif "A" <= z <= "Z":
            wynik += chr((ord(z) - ord("A") + k) % 26 + ord("A"))
        else:
            wynik += z            # inne znaki bez zmian
    return wynik

szyfr = cezar("Matura z informatyki", 3)
print(szyfr)                      # Pdwxud c lqirupdwbnl
print(cezar(szyfr, -3))           # Matura z informatyki — odszyfrowanie
```

Dzięki `% 26` działa także `k = 107` (tyle samo co `k = 3`) i ujemne przesunięcia.

### Łamanie szyfru

Gdy klucz jest nieznany, wystarczy sprawdzić 26 możliwości — albo założyć, że najczęstsza litera szyfrogramu to zaszyfrowane `a` lub `e`.

## Szyfr przestawieniowy

```python
def przestaw(tekst):
    """Zamienia miejscami sąsiednie znaki: 'informatyka' -> 'niofmrtakya'."""
    znaki = list(tekst)
    for i in range(0, len(znaki) - 1, 2):
        znaki[i], znaki[i + 1] = znaki[i + 1], znaki[i]
    return "".join(znaki)

print(przestaw("informatyka"))   # niofmrtakya
```

## Wyszukiwanie wzorca

```python
tekst = "abrakadabra"
print("kada" in tekst)          # True
print(tekst.find("bra"))        # 1
print(tekst.count("abra"))      # 2

# wszystkie pozycje (także nakładające się)
wzorzec = "aba"
s = "abababa"
pozycje = [i for i in range(len(s) - len(wzorzec) + 1) if s[i:i + len(wzorzec)] == wzorzec]
print(pozycje)                  # [0, 2, 4]
print(s.count(wzorzec))         # 2 — count NIE liczy nakładających się!
```

## Najdłuższy fragment spełniający warunek

Klasyczny schemat: przechodzimy po znakach i pamiętamy **bieżącą** oraz **najlepszą** długość.

```python
def najdluzszy_ciag_tej_samej_litery(s):
    najlepsza, biezaca = 1, 1
    znak_najlepszy = s[0]
    for i in range(1, len(s)):
        if s[i] == s[i - 1]:
            biezaca += 1
        else:
            biezaca = 1
        if biezaca > najlepsza:
            najlepsza = biezaca
            znak_najlepszy = s[i]
    return znak_najlepszy, najlepsza

print(najdluzszy_ciag_tej_samej_litery("aabbbbcaaa"))   # ('b', 4)
```

Ten sam schemat działa dla najdłuższego **rosnącego** fragmentu ciągu liczb — zmienia się tylko warunek.

## Kompresja RLE

```python
def rle(s):
    if not s:
        return ""
    wynik = []
    licznik = 1
    for i in range(1, len(s) + 1):
        if i < len(s) and s[i] == s[i - 1]:
            licznik += 1
        else:
            wynik.append(f"{licznik}{s[i - 1]}")
            licznik = 1
    return "".join(wynik)

print(rle("AAABBCDDDD"))    # 3A2B1C4D
```

## Słowa w tekście

```python
tekst = "Ala ma kota, a kot ma Alę."
slowa = [s.strip(".,!?").lower() for s in tekst.split()]
print(slowa)                     # ['ala', 'ma', 'kota', 'a', 'kot', 'ma', 'alę']
print(max(slowa, key=len))       # kota — pierwsze z najdłuższych
print(len(set(slowa)))           # 6 — różne słowa
```

## Zadanie

1. Wczytaj plik ze słowami i wypisz wszystkie palindromy oraz ich liczbę.
2. Znajdź w pliku pary słów, które są anagramami (słowa w parach, np. `kot tok` w jednej linii).
3. Odszyfruj tekst zaszyfrowany Cezarem nieznanym kluczem — wypisz wszystkie 26 wersji i znajdź sensowną.
4. Napisz dekompresję RLE: `"3A2B1C"` → `"AAABBC"`.
5. Dla napisu złożonego z cyfr znajdź najdłuższy fragment, w którym cyfry są niemalejące.
6. Sprawdź, czy słowo jest „rosnące” — litery w kolejności alfabetycznej (`abc`, `dlo`) — jedną linią z `all` i `zip`.
