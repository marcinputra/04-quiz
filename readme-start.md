# Uruchomienie lokalne i wdrożenie na VPS

Instrukcja dla aplikacji **maturazinformatyki.it** (frontend `client/`, backend `api/`, baza PostgreSQL).
Adresy `www.maturazinformatyki.it` i dawny `quiz.maturazinformatyki.it` przekierowują (301) na `maturazinformatyki.it`.

---

## Część 1: uruchomienie lokalne

Potrzebujesz Node.js 20+ i Docker Desktop (baza działa w kontenerze).

### 1. Baza danych i testowa poczta

Najpierw uruchom Docker Desktop, potem:

```bash
cd Quiz
docker compose -f docker-compose.dev.yml up -d
```

Wstają dwa kontenery:

- **Postgres** na porcie **5433**, bo 5432 zajmuje inny kontener (`psql-db-1`),
- **Mailpit** — testowa skrzynka pocztowa. Wszystkie e-maile wysyłane przez aplikację (link potwierdzający konto, kody logowania dwuetapowego, powiadomienia o kursach) trafiają tutaj, a nie do prawdziwych adresatów. Podgląd: **http://localhost:8025**.

### 2. Backend (pierwszy terminal)

```bash
cd Quiz/api
cp .env.example .env          # tylko za pierwszym razem
npm install
npx prisma migrate deploy     # tworzy tabele
npm run import:quizzes        # wczytuje quizy z api/data/quizzes do bazy
npm run create-admin          # zakłada konto admina (zapyta o e-mail, imię, hasło)
npm run dev                   # API na http://localhost:4000
```

Migrację, import i zakładanie admina robisz raz. Przy kolejnych uruchomieniach wystarczy `npm run dev`.
Po pobraniu nowej wersji kodu uruchom ponownie `npx prisma migrate deploy` (dochodzą nowe tabele).

Jeśli masz starszy plik `api/.env` (sprzed kroku 7), dopisz do niego z `api/.env.example` zmienne `APP_URL` i `SMTP_*`.
Bez `SMTP_HOST` e-maile lokalnie nie są wysyłane, tylko wypisywane w konsoli backendu.

Rejestracja nowego konta: po wypełnieniu formularza otwórz http://localhost:8025 i kliknij link w e-mailu „Potwierdź adres e-mail”.

### 3. Frontend (drugi terminal)

```bash
cd Quiz/client
npm install
npm run dev                   # http://localhost:3000
```

Vite przekazuje `/api/*` do backendu na porcie 4000.
Sprawdzenie: http://localhost:4000/api/health powinno zwrócić `{"status":"ok","db":"ok"}`.

### Zatrzymanie

`Ctrl+C` w obu terminalach, a bazę zatrzymujesz przez:

```bash
docker compose -f docker-compose.dev.yml down
```

Dane zostają w wolumenie i nie znikają.

---

## Część 2: przeniesienie na VPS

Na serwerze działają już Traefik z siecią `traefik-net` i stara wersja quizu. Nowy `docker-compose.yml` używa tej samej nazwy usługi i kontenera frontendu, więc nowa wersja zastąpi starą. Strona działa pod **`maturazinformatyki.it`**, a `www.maturazinformatyki.it` i `quiz.maturazinformatyki.it` przekierowują na ten adres (ze zachowaniem ścieżki — stare linki do quizów dalej działają).

Wymagania DNS (już spełnione — wszystkie trzy nazwy wskazują na serwer 46.248.186.18): rekordy A dla `maturazinformatyki.it`, `www` i `quiz`. Certyfikaty Let's Encrypt dla każdej nazwy Traefik pobierze sam przy pierwszym wejściu (może to potrwać kilkadziesiąt sekund).

### Krok A: wypchnij zmiany z komputera

Wiele plików zostało przeniesionych do `client/`, więc przed commitem przejrzyj `git status`:

```bash
cd Quiz
git checkout -b nowa-wersja          # osobna gałąź, stara wersja zostaje na main
git add -A
git status                           # sprawdź, czy NIE ma tu plików .env ani node_modules
git commit -m "Backend API, baza PostgreSQL, Vite, logowanie"
git push -u origin nowa-wersja
```

Pliki `.env` są w `.gitignore`, więc hasła nie trafią na GitHuba.

### Krok B: pobierz kod na serwerze

```bash
ssh uzytkownik@twoj-vps
cd /sciezka/do/Quiz                  # katalog, z którego teraz działa quiz
git fetch
git checkout nowa-wersja
git pull
```

Utwórz plik `.env` obok `docker-compose.yml`. Nie trafia on do gita, więc zakładasz go ręcznie:

```bash
cp .env.example .env
nano .env
```

Ustaw w nim:

```env
POSTGRES_USER=quiz
POSTGRES_PASSWORD=<długie losowe hasło>
POSTGRES_DB=quiz
JWT_SECRET=<długi losowy ciąg>

APP_URL=https://maturazinformatyki.it

# poczta — dane z panelu hostingu poczty
SMTP_HOST=smtp.twoj-serwer-poczty.pl
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=no-reply@maturazinformatyki.it
SMTP_PASS=<hasło do skrzynki>
MAIL_FROM="maturazinformatyki.it <no-reply@maturazinformatyki.it>"
```

**Poczta jest wymagana** — bez `SMTP_HOST` kontener `api` nie wystartuje (nikt nie mógłby potwierdzić konta). Port 587 + `SMTP_SECURE=false` to STARTTLS (najczęściej), port 465 + `SMTP_SECURE=true` to SSL. Żeby e-maile nie trafiały do SPAM-u, ustaw dla domeny rekordy SPF i DKIM (instrukcja w panelu hostingu poczty).

Losowe wartości wygenerujesz poleceniem `openssl rand -hex 32` (każdą osobno). Zabezpiecz plik:

```bash
chmod 600 .env
```

> **Ważne:** nie zmieniaj później `POSTGRES_PASSWORD`. Postgres ustawia hasło tylko przy pierwszym utworzeniu wolumenu, więc po zmianie API straci połączenie z bazą. Zmiana `JWT_SECRET` tylko wyloguje wszystkich użytkowników.

### Krok C: uruchomienie

```bash
docker compose up -d --build
docker compose ps                    # db, api i frontend powinny mieć stan "running"/"healthy"
docker compose logs api              # powinno być: "API nasłuchuje na porcie 4000"
```

Migracje bazy wykonują się automatycznie przy starcie kontenera `api`.

### Krok D: dane (tylko za pierwszym razem)

```bash
# import quizów z plików JSON (api/data/quizzes, są w obrazie api) do bazy
docker compose exec api node scripts/import-quizzes.js

# konto admina
docker compose exec api node scripts/create-admin.js
```

### Krok E: sprawdzenie

- <https://maturazinformatyki.it/api/health> zwraca `{"status":"ok","db":"ok"}`,
- <https://quiz.maturazinformatyki.it> i <https://www.maturazinformatyki.it> przekierowują na <https://maturazinformatyki.it>,
- strona się otwiera i lista quizów działa,
- logujesz się kontem admina i widzisz link „Panel admina”.

Gdy wszystko działa, połącz gałąź `nowa-wersja` z `main`.

---

## Aktualizacje w przyszłości

```bash
# na komputerze
git push

# na serwerze
cd /sciezka/do/Quiz && git pull && docker compose up -d --build
```

Nowe migracje bazy wchodzą same przy restarcie `api`.

---

## Kopia zapasowa bazy

```bash
# kopia
docker compose exec -T db pg_dump -U quiz quiz | gzip > backup-$(date +%F).sql.gz

# przywrócenie
gunzip -c backup-2026-11-15.sql.gz | docker compose exec -T db psql -U quiz -d quiz
```

Kopię możesz robić codziennie przez `crontab -e` na serwerze.
Dane bazy leżą w wolumenie `quiz_db_data`. Polecenie `docker compose down` ich nie usuwa, ale `docker compose down -v` usunie je bezpowrotnie.

---

## Gdy coś nie działa

| Objaw | Przyczyna |
|---|---|
| `docker compose up` zgłasza błąd o `JWT_SECRET` | brak tej wartości w `.env` |
| `/api/health` zwraca 502 / 503 „Serwer chwilowo niedostępny” | kontener `api` nie wstał — zobacz „Diagnostyka 502” poniżej |
| `api` w logach: błąd uwierzytelnienia do bazy | `POSTGRES_PASSWORD` zmieniony po pierwszym uruchomieniu |
| logowanie „nie trzyma” sesji | strona otwarta po `http://` zamiast `https://` (ciasteczko ma flagę `Secure`) |
| błąd `network traefik-net not found` | Traefik na serwerze używa sieci o innej nazwie, sprawdź `docker network ls` |
| `docker compose up` zgłasza błąd o `SMTP_HOST` | brak danych poczty w `.env` |
| rejestracja działa, ale e-mail nie przychodzi | złe dane SMTP — sprawdź `docker compose logs api` (komunikat „Nie udało się wysłać”) i folder SPAM |
| link z e-maila prowadzi na zły adres | popraw `APP_URL` w `.env` i zrób `docker compose up -d` |


### Diagnostyka 502 / 503

```bash
docker compose ps                     # który kontener nie ma stanu "Up"? (Restarting = pada przy starcie)
docker compose logs --tail 50 api     # najczęściej tu jest przyczyna
docker compose logs --tail 20 matutrazinformatyki_frontend
docker compose exec matutrazinformatyki_frontend wget -qO- http://api:4000/api/health   # czy frontend widzi api
```

Najczęstsze przyczyny w logach `api`:

| Komunikat w `docker compose logs api` | Co zrobić |
|---|---|
| `Brak JWT_SECRET` / `Brak SMTP_HOST` | uzupełnij `.env`, potem `docker compose up -d` |
| `Authentication failed against database server` | `POSTGRES_PASSWORD` w `.env` różni się od tego, z którym baza została utworzona — przywróć pierwotne hasło |
| `P3009` / `migrate found failed migrations` | migracja przerwana — `docker compose run --rm api npx prisma migrate status`, w razie wątpliwości zrób kopię bazy i napisz |
| `Can't reach database server at db:5432` | baza jeszcze startuje albo nie działa — `docker compose logs db` |

Od tej wersji awaria `api` **nie wyłącza całej strony**: artykuły i strony się ładują, tylko funkcje wymagające serwera pokazują „Serwer chwilowo niedostępny”. Wcześniej nginx frontendu nie startował bez `api` i Traefik zwracał 502 dla wszystkiego.
