# Aplikacja APPS

1. Architektura

```txt
Quiz/
├── client/        ← obecna aplikacja React (przeniesiona)
├── api/           ← Express + Prisma (nowy)
└── docker-compose.yml   ← client (nginx) + api + postgres
```

## Baza danych

PostgreSQL. Jest darmowa, łatwo ją postawić w Dockerze obok Traefika i dobrze sobie radzi z relacjami (użytkownicy ↔ kursy ↔ quizy ↔ wyniki).

## Backend

Express + Prisma (ORM z migracjami), bcrypt do haseł, sesja jako JWT w ciasteczku httpOnly.
nginx w kontenerze klienta przekazuje /api/* do kontenera api, więc wszystko działa pod jedną domeną i nie trzeba konfigurować CORS.

Ważne: dziś correctAnswer trafia do przeglądarki, więc każdy może podejrzeć poprawne odpowiedzi w DevTools. Po zmianie poprawność sprawdza serwer, a wynik zapisuje się w bazie.

2. Schemat bazy (PostgreSQL)

```sql
-- UŻYTKOWNICY
CREATE TABLE users (
  id            SERIAL PRIMARY KEY,
  email         VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  name          VARCHAR(120) NOT NULL,
  role          VARCHAR(10) NOT NULL DEFAULT 'user' CHECK (role IN ('user','admin')),
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ARTYKUŁY (strona główna)
CREATE TABLE articles (
  id           SERIAL PRIMARY KEY,
  slug         VARCHAR(200) UNIQUE NOT NULL,      -- /artykuly/wstep-do-sql
  title        VARCHAR(255) NOT NULL,
  excerpt      TEXT,                              -- zajawka na stronę główną
  content      TEXT NOT NULL,                     -- Markdown
  cover_url    VARCHAR(500),
  status       VARCHAR(10) NOT NULL DEFAULT 'draft' CHECK (status IN ('draft','published')),
  author_id    INT REFERENCES users(id),
  published_at TIMESTAMPTZ,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at   TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- KURSY
CREATE TABLE courses (
  id           SERIAL PRIMARY KEY,
  slug         VARCHAR(200) UNIQUE NOT NULL,
  title        VARCHAR(255) NOT NULL,
  description  TEXT,
  is_published BOOLEAN NOT NULL DEFAULT false,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE lessons (                            -- treść kursu
  id        SERIAL PRIMARY KEY,
  course_id INT NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
  title     VARCHAR(255) NOT NULL,
  content   TEXT NOT NULL,                        -- Markdown
  position  INT NOT NULL DEFAULT 0
);

-- ZAPISY NA KURS: użytkownik prosi o dostęp, Ty zatwierdzasz
CREATE TABLE enrollments (
  user_id      INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  course_id    INT NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
  status       VARCHAR(10) NOT NULL DEFAULT 'pending'
               CHECK (status IN ('pending','approved','rejected')),
  requested_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  decided_at   TIMESTAMPTZ,
  decided_by   INT REFERENCES users(id),
  PRIMARY KEY (user_id, course_id)
);

-- QUIZY
CREATE TABLE quizzes (
  id           SERIAL PRIMARY KEY,
  slug         VARCHAR(200) UNIQUE NOT NULL,      -- obecne "sql-podstawy-1"
  title        VARCHAR(255) NOT NULL,
  description  TEXT,
  level        VARCHAR(50),                       -- podstawowy / rozszerzony / ...
  topic        VARCHAR(100),                      -- Python / Bazy danych / ...
  course_id    INT REFERENCES courses(id) ON DELETE SET NULL, -- NULL = quiz ogólnodostępny po zalogowaniu
  is_published BOOLEAN NOT NULL DEFAULT false,
  shuffle      BOOLEAN NOT NULL DEFAULT true
);

CREATE TABLE questions (
  id       SERIAL PRIMARY KEY,
  quiz_id  INT NOT NULL REFERENCES quizzes(id) ON DELETE CASCADE,
  question TEXT NOT NULL,
  code     TEXT,                                  -- jak obecne pole "code"
  position INT NOT NULL DEFAULT 0
);

CREATE TABLE answer_options (
  id          SERIAL PRIMARY KEY,
  question_id INT NOT NULL REFERENCES questions(id) ON DELETE CASCADE,
  text        TEXT NOT NULL,
  is_correct  BOOLEAN NOT NULL DEFAULT false,
  position    INT NOT NULL DEFAULT 0
);

-- WYNIKI
CREATE TABLE quiz_attempts (
  id          SERIAL PRIMARY KEY,
  user_id     INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  quiz_id     INT NOT NULL REFERENCES quizzes(id) ON DELETE CASCADE,
  score       INT NOT NULL DEFAULT 0,
  total       INT NOT NULL,
  started_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  finished_at TIMESTAMPTZ
);

CREATE TABLE attempt_answers (
  attempt_id  INT NOT NULL REFERENCES quiz_attempts(id) ON DELETE CASCADE,
  question_id INT NOT NULL REFERENCES questions(id) ON DELETE CASCADE,
  option_id   INT NOT NULL REFERENCES answer_options(id),
  is_correct  BOOLEAN NOT NULL,
  PRIMARY KEY (attempt_id, question_id)           -- jedna odpowiedź na pytanie, bez możliwości zmiany
);
```

Odpowiedzi trzymam w osobnej tabeli answer_options (zamiast tablicy i indeksu correctAnswer). Dzięki temu łatwo je edytować w panelu, a w przyszłości można dodać pytania z kilkoma poprawnymi odpowiedziami.

## Reguły dostępu

1. Kto Co widzi?

|---|---|
| Gość | Stronę główną z artykułami, listę kursów (tylko opisy), rejestrację i logowanie
| Zalogowany | Quizy bez przypisanego kursu, przycisk „Poproś o dostęp” przy kursie, swoje wyniki

Zalogowany z enrollment.status = 'approved'	Lekcje i quizy tego kursu
Admin (role = 'admin')	Panel /admin

1. API (Express)

POST /api/auth/register | login | logout     GET /api/auth/me
GET  /api/articles            GET /api/articles/:slug
GET  /api/courses             GET /api/courses/:slug        (lekcje tylko z dostępem)
POST /api/courses/:slug/enroll                              → status 'pending'
GET  /api/quizzes             (wymaga logowania)
POST /api/quizzes/:slug/attempts                            → pytania BEZ is_correct
POST /api/attempts/:id/answer  {questionId, optionId}       → {correct, correctOptionId}
POST /api/attempts/:id/finish                               → wynik

/api/admin/*  (tylko admin)
  articles      CRUD
  courses       CRUD + lessons CRUD
  enrollments   GET ?status=pending,  PATCH :userId/:courseId {status}
  quizzes       CRUD + questions/options CRUD
  attempts      GET (wyniki uczniów)
Endpoint answer zwraca poprawną odpowiedź od razu, więc obecne zielone i czerwone podświetlanie po kliknięciu nadal zadziała.

5. Strony we frontendzie

/                    strona główna: lista artykułów
/artykuly/:slug      artykuł (Markdown → react-markdown)
/rejestracja, /logowanie
/kursy, /kursy/:slug  opis, przycisk „Poproś o dostęp”, lekcje po zatwierdzeniu
/quizy               obecny StartQuiz (filtry zostają)
/quiz/:slug          obecny Quiz.jsx, dane z API zamiast plików .json
/moje-wyniki
/admin               panel:
  ├ artykuly        lista i edytor Markdown (np. @uiw/react-md-editor)
  ├ kursy           kursy i lekcje
  ├ zapisy          oczekujące prośby: [Zatwierdź] [Odrzuć]
  ├ quizy           lista quizów → edytor pytań (treść, kod, odpowiedzi A–D, zaznaczenie poprawnej)
  └ wyniki
Dostęp do tras chronią komponenty <RequireAuth> i <RequireAdmin>, a do tego AuthContext pobierający /api/auth/me.

6. Kolejność prac
Struktura client/ i api/, Postgres w docker-compose.yml, schemat Prisma i migracja.
Skrypt importu obecnych quizList.json i plików pytań do bazy, żeby nic nie przepadło.
Rejestracja, logowanie i konto admina (zakładane skryptem seed).
Przepięcie quizów na API z wymaganym logowaniem i zapisem wyników.
Panel admina z edytorem quizów i pytań.
Artykuły i strona główna.
Kursy, prośby o dostęp i zatwierdzanie.

Przy okazji warto rozważyć przejście z Create React App na Vite, bo CRA nie jest już rozwijane, a @tailwindcss/vite masz już w zależnościach. Nie jest to jednak konieczne.

---

# Dziennik zmian

## Krok 1 i 2 — struktura client/api, baza PostgreSQL, przejście na Vite, import quizów (2026-11-14)

### Nowa struktura katalogów

```txt
Quiz/
├── client/                    ← frontend React (wcześniej w katalogu głównym)
│   ├── index.html             ← przeniesiony z public/ (wymóg Vite), dodany <script type="module">
│   ├── vite.config.js         ← proxy /api → localhost:4000 w trybie dev
│   ├── src/main.jsx           ← dawny src/index.js
│   ├── public/                ← style.css, favicony, pliki JSON z quizami (bez zmian)
│   ├── Dockerfile             ← build Vite (dist/) + nginx
│   └── nginx.conf             ← dodane przekierowanie /api/ → kontener api:4000
├── api/                       ← NOWY backend Express + Prisma
│   ├── prisma/schema.prisma   ← schemat bazy (tabele z punktu 2 powyżej)
│   ├── prisma/migrations/     ← migracja początkowa 20261114000000_init
│   ├── scripts/import-quizzes.js
│   ├── src/server.js, src/db.js
│   ├── .env.example
│   └── Dockerfile
├── docker-compose.yml         ← produkcja: frontend + api + db (Postgres 17)
├── docker-compose.dev.yml     ← lokalnie: sama baza na porcie 5433
├── .env.example               ← hasło do bazy na produkcji
└── .gitignore
```

### Frontend: Create React App → Vite

- Usunięte `react-scripts`, `web-vitals`, biblioteki testowe Jest, `reportWebVitals.js`, `setupTests.js`, zbędne `npm` w zależnościach, `autoprefixer`, `postcss`.
- Dodane `vite` i `@vitejs/plugin-react`; `tailwindcss` i `@tailwindcss/vite` zostały w `devDependencies`, ale nie są jeszcze włączone (obecny CSS z nich nie korzysta).
- `npm start` / `npm run dev` uruchamia serwer na http://localhost:3000, `npm run build` buduje do `client/dist/` (wcześniej `build/`).
- Ścieżki w `index.html` zmienione na absolutne (`/style.css`, `/favicon/...`), żeby działały też pod adresami typu `/quiz/sql-podstawy-1`.
- Kod komponentów się nie zmienił — aplikacja nadal czyta `quizList.json` i pliki pytań z `public/`. Przepięcie na API to krok 4.
- Folder `src/component/Tmp` nie jest nigdzie importowany — został bez zmian.
- Stary `node_modules/` (był zapisany w git) został usunięty i zainstalowany na nowo w `client/`. Warto usunąć go z repozytorium: `git rm -r --cached node_modules`.

### Backend (api/)

- Express 5 + Prisma 6 + PostgreSQL.
- Schemat w `api/prisma/schema.prisma` odpowiada SQL z punktu 2 (nazwy w bazie w snake_case). Dodatkowo `quizzes.position` — kolejność quizów na liście.
- Na razie dwa endpointy:
  - `GET /api/health` — sprawdza połączenie z bazą,
  - `GET /api/quizzes` — lista opublikowanych quizów w tym samym formacie co `quizList.json` (`id` = slug), liczba pytań liczona z bazy.
- Kontener `api` przy każdym starcie wykonuje `prisma migrate deploy`, więc nowe migracje wchodzą automatycznie.

### Import quizów (krok 2)

`api/scripts/import-quizzes.js` przenosi quizy z plików JSON do bazy:

- quizy z `quizList.json` → opublikowane, w tej samej kolejności,
- pozostałe pliki z pytaniami (`quiz04`, `quiz05`, `plik_z_zadaniami`, `sql-zajecia-10`) → **nieopublikowane szkice** z tytułem `[szkic] nazwa-pliku`, do uzupełnienia w panelu admina,
- `correctAnswer` zamieniany na `answer_options.is_correct`,
- skrypt można uruchamiać wielokrotnie — quiz dopasowywany po slug, pytania podmieniane (bez duplikatów),
- quizy, które mają już zapisane wyniki uczniów, nie są nadpisywane (chyba że z `--force`),
- błędne pytanie nie przerywa importu — jest pomijane i wypisywane na końcu.

Wynik pierwszego importu: **15 quizów, 181 pytań, 724 odpowiedzi**, każde pytanie ma dokładnie jedną poprawną odpowiedź.

**Do poprawienia ręcznie:** w `plik_z_zadaniami.json` pominięto 7 pytań (#13, 14, 15, 16, 18, 19, 20) — mają klucze z wielkiej litery i wszystkie odpowiedzi sklejone w jeden napis, np. `["Sean,Jeffrey,Marcin,Stuart"]`. Nie dało się ich rozdzielić automatycznie, bo przecinki występują też w treści odpowiedzi. Po poprawieniu pliku wystarczy ponownie uruchomić import.

Uwaga: w `quizList.json` pole `questions` nie zawsze zgadza się z plikiem (np. `python-podstawy-2`: 10 w liście, 17 w pliku) — API podaje teraz faktyczną liczbę.

### Uruchomienie lokalne

```bash
# 1. baza (port 5433, bo 5432 bywa zajęty przez inne projekty)
docker compose -f docker-compose.dev.yml up -d

# 2. backend
cd api
cp .env.example .env
npm install
npx prisma migrate deploy        # tworzy tabele
npm run import:quizzes           # import quizów (opcje: --dry-run, --force, ścieżka do katalogu z JSON)
npm run dev                      # http://localhost:4000/api/health

# 3. frontend (w drugim terminalu)
cd client
npm install
npm run dev                      # http://localhost:3000
```

Przy zmianie schematu: edytuj `api/prisma/schema.prisma`, potem `npm run db:migrate -- --name opis_zmiany`. Podgląd danych w przeglądarce: `npm run db:studio`.

### Wdrożenie na serwer

```bash
cp .env.example .env             # ustaw POSTGRES_PASSWORD
docker compose up -d --build

# jednorazowo — import quizów do bazy produkcyjnej
docker compose run --rm -v ./client/public:/data api node scripts/import-quizzes.js /data
```

Baza (`db`) i `api` są tylko w sieci wewnętrznej `internal`; z zewnątrz (Traefik) widoczny jest wyłącznie frontend, który przekazuje `/api/*` do backendu. Dane bazy leżą w wolumenie `quiz_db_data`.

### Sprawdzone

- `npm run build` w `client/` — OK,
- migracja na czystej bazie + zgodność migracji ze schematem (`prisma migrate diff`) — OK,
- import uruchomiony dwa razy — bez duplikatów,
- `GET /api/health` i `GET /api/quizzes` lokalnie i przez proxy Vite — OK,
- `docker compose build` obu obrazów, kontener `api` łączy się z bazą i wykonuje migracje — OK.
  (Pełnego `docker compose up` z Traefikiem nie uruchamiałem lokalnie — wymaga sieci `traefik-net` z serwera.)

### Następny krok

Krok 3: rejestracja, logowanie (bcrypt + JWT w ciasteczku httpOnly) i skrypt seed zakładający konto admina.

## Krok 3 — rejestracja, logowanie i konto admina (2026-11-14)

### Jak działa logowanie

- Hasła są hashowane **bcrypt** (12 rund, biblioteka `bcryptjs` — czysty JS, bez kompilacji w Dockerze). W bazie nie ma haseł jawnym tekstem.
- Po zalogowaniu serwer ustawia ciasteczko `mzi_token` z tokenem **JWT** (ważny 7 dni):
  - `HttpOnly` — JavaScript w przeglądarce nie ma do niego dostępu (ochrona przed kradzieżą przez XSS),
  - `SameSite=Lax` — nie jest wysyłane przy żądaniach z obcych stron (ochrona przed CSRF),
  - `Secure` na produkcji — tylko po HTTPS.
- Przy każdym żądaniu użytkownik jest pobierany z bazy, więc zmiana roli albo usunięcie konta działa od razu.
- Zawsze ten sam komunikat „Nieprawidłowy e-mail lub hasło” i stały czas odpowiedzi — nie da się sprawdzić, czy dany e-mail ma konto.
- Limity prób (`express-rate-limit`): 10 nieudanych logowań na 15 minut i 5 rejestracji na godzinę z jednego IP.
- E-mail jest zapisywany małymi literami i bez spacji (`Jan@Test.pl` = `jan@test.pl`).
- Rejestracja zawsze tworzy konto z rolą `user`. **Admina nie da się założyć przez stronę** — tylko skryptem.

### Nowe endpointy API

| Metoda | Adres | Opis |
|---|---|---|
| POST | `/api/auth/register` | `{ name, email, password }` → zakłada konto i od razu loguje |
| POST | `/api/auth/login` | `{ email, password }` → ustawia ciasteczko |
| POST | `/api/auth/logout` | usuwa ciasteczko |
| GET | `/api/auth/me` | `{ user }` albo `{ user: null }` |
| POST | `/api/auth/change-password` | `{ currentPassword, newPassword }` (wymaga logowania) |
| GET | `/api/admin/users` | lista kont bez haseł (tylko admin) |

Odpowiedzi błędów: `400` złe dane, `401` niezalogowany / złe hasło, `403` brak uprawnień, `409` e-mail zajęty, `429` za dużo prób.

### Zmiany w api/

```txt
api/src/
├── app.js               ← konfiguracja Express (wydzielona z server.js)
├── server.js            ← tylko uruchomienie serwera
├── config.js            ← zmienne środowiskowe; brak JWT_SECRET = błąd przy starcie
├── lib/auth.js          ← hashowanie haseł, token JWT, ciasteczko
├── lib/validate.js      ← walidacja e-maila, imienia, hasła (min. 8 znaków)
├── middleware/auth.js   ← loadUser, requireAuth, requireAdmin
└── routes/
    ├── auth.js          ← rejestracja, logowanie, wylogowanie, me, zmiana hasła
    ├── quizzes.js       ← GET /api/quizzes (przeniesione z server.js)
    └── admin.js         ← /api/admin/* (wszystko wymaga roli admin)
api/scripts/create-admin.js
```

Nowe zależności: `bcryptjs`, `jsonwebtoken`, `cookie-parser`, `express-rate-limit`.
Nowe zmienne w `api/.env`: `JWT_SECRET` (min. 32 znaki), `COOKIE_SECURE` (lokalnie `false`).
Schemat bazy się nie zmienił — tabela `users` była już w migracji z kroku 1.

### Konto administratora

```bash
cd api
npm run create-admin                         # zapyta o e-mail, imię i hasło (hasło nie jest wyświetlane)
npm run create-admin -- --email ja@example.com --name "Jan Kowalski"
```

- Jeśli konto z tym e-mailem już istnieje (np. założone przez stronę), dostaje rolę admin — hasło się nie zmienia.
- `--reset-password` — dodatkowo ustawia nowe hasło (przydatne, gdy zapomnisz hasła admina).
- Bez pytań: hasło w zmiennej `ADMIN_PASSWORD`.

Na serwerze (w działającym kontenerze):

```bash
docker compose exec api node scripts/create-admin.js --email ja@example.com --name "Jan Kowalski"
```

### Zmiany w client/

- `src/api.js` — wspólna funkcja do wywołań `/api/*` (błędy z serwera jako czytelne komunikaty).
- `src/auth/AuthContext.jsx` — `useAuth()` daje w każdym komponencie: `user`, `isAdmin`, `login`, `register`, `logout`. Gdy backend nie działa, aplikacja traktuje użytkownika jak niezalogowanego, a quizy z plików dalej działają.
- `src/auth/RequireAuth.jsx` — `<RequireAuth>` i `<RequireAdmin>` do ochrony stron. Niezalogowany trafia na `/logowanie`, a po zalogowaniu wraca na stronę, którą chciał otworzyć.
- `src/component/Header.jsx` — górny pasek na każdej stronie: Quizy, Zaloguj / Załóż konto albo imię użytkownika i Wyloguj, dla admina link „Panel admina”.
- Nowe strony (`src/pages/`, wspólne style w `Auth.css` w kolorach strony):

| Adres | Strona | Dostęp |
|---|---|---|
| `/logowanie` | logowanie | wszyscy (zalogowany jest przekierowany) |
| `/rejestracja` | zakładanie konta | wszyscy |
| `/konto` | dane konta i zmiana hasła | zalogowani |
| `/admin` | panel admina — na razie lista użytkowników | admin |

- `App.jsx` — dodany nagłówek i nowe trasy. Lista quizów ładuje się tylko na stronach quizów, więc strony logowania działają nawet przy problemie z `quizList.json`.
- Quizy **nadal działają bez logowania** — wymaganie logowania i zapis wyników to krok 4.

### Docker

- `docker-compose.yml`: kontener `api` dostaje `JWT_SECRET` z pliku `.env` i `COOKIE_SECURE=true`. Bez `JWT_SECRET` w `.env` `docker compose up` od razu zgłosi błąd.
- `.env.example` w katalogu głównym — dopisane `JWT_SECRET` z instrukcją wygenerowania.

**Przy wdrożeniu kroku 3 na serwer:** dopisz `JWT_SECRET` do `.env` na serwerze, potem `docker compose up -d --build` i załóż konto admina poleceniem powyżej.

### Sprawdzone

- API (curl): rejestracja, błędne dane, zajęty e-mail, logowanie, złe hasło, nieistniejący e-mail (ten sam komunikat), `/me` z ciasteczkiem i bez, podrobiony token, `403` dla ucznia w `/api/admin`, zmiana hasła (ze złym i dobrym obecnym hasłem), wylogowanie, zły JSON, blokada `429` po 10 nieudanych logowaniach.
- Skrypt `create-admin`: nowe konto, nadanie roli istniejącemu kontu, odrzucenie za krótkiego hasła — lokalnie i w kontenerze Dockera.
- Przeglądarka (Chrome, test automatyczny): przekierowanie z `/konto` na logowanie i z powrotem po rejestracji, sesja po odświeżeniu strony, „Brak dostępu” dla ucznia w `/admin`, wylogowanie, panel admina z listą kont, widok na telefonie (375 px, bez przewijania w bok), brak błędów JS.
- Kontener `api`: odmowa startu bez `JWT_SECRET`, ciasteczko z flagą `Secure`.
- Znaleziony i poprawiony błąd: wylogowanie na stronie chronionej przekierowywało na `/logowanie` zamiast na listę quizów.

### Do rozważenia później

- Zmiana hasła nie wylogowuje innych urządzeń (token JWT jest ważny do wygaśnięcia, max 7 dni). Jeśli będzie potrzebne — kolumna `token_version` w `users`.
- Brak resetu hasła przez e-mail (wymaga serwera SMTP). Na razie admin może ustawić nowe hasło: `create-admin --email ... --reset-password`.

### Następny krok

Krok 4: quizy tylko po zalogowaniu — pytania z API (bez poprawnych odpowiedzi), sprawdzanie odpowiedzi na serwerze, zapis wyników i strona „Moje wyniki”.

## Krok 4 — quizy po zalogowaniu, sprawdzanie odpowiedzi na serwerze, zapis wyników (2026-11-15)

### Co się zmieniło dla ucznia

- Listę quizów widzi każdy, ale **rozwiązać quiz można tylko po zalogowaniu**. Gość widzi przycisk „Zaloguj się i rozpocznij”, a po zalogowaniu wraca prosto do wybranego quizu.
- Ekran startowy nie pyta już o imię — bierze je z konta („Rozwiązujesz jako: …”).
- Działanie quizu bez zmian: losowa kolejność pytań, odpowiedź A–D bez możliwości cofnięcia, od razu zielone/czerwone podświetlenie.
- Po zakończeniu: wynik + przyciski „Rozwiąż ponownie”, „Zobacz odpowiedzi”, „Wróć do listy quizów”.
- Nowa zakładka **Moje wyniki** (`/moje-wyniki`): najlepszy wynik i liczba podejść dla każdego quizu oraz pełna historia.
- Strona **szczegółów wyniku** (`/wyniki/:id`): każde pytanie z zaznaczoną moją i poprawną odpowiedzią.

### Co się zmieniło dla admina

- W panelu admina nowa sekcja **Wyniki uczniów**: data, uczeń, quiz, wynik, filtr po quizie i link do odpowiedzi ucznia.
- Admin może otworzyć nieopublikowany quiz (szkic) pod adresem `/quiz/<slug>`, np. `/quiz/quiz04` — podgląd przed publikacją. Uczniowie dostają wtedy „Nie znaleziono quizu”.

### Bezpieczeństwo — poprawne odpowiedzi nie trafiają już do przeglądarki

- **Pliki JSON z pytaniami przeniesione z `client/public/` do `api/data/quizzes/`.** Wcześniej każdy mógł otworzyć np. `/sql-podstawy-1.json` i zobaczyć `correctAnswer`. Teraz te pliki służą tylko jako źródło dla skryptu importu i są wyłącznie w obrazie `api`.
- Przy starcie quizu API zwraca pytania i odpowiedzi **bez** pola `isCorrect`.
- Po kliknięciu odpowiedź jest sprawdzana i zapisywana na serwerze; dopiero wtedy przeglądarka dostaje informację, która odpowiedź była poprawna.
- Odpowiedzi nie da się zmienić (klucz główny `attempt_id + question_id`) — druga próba zwraca pierwszą zapisaną odpowiedź.
- Nie da się odpowiadać w cudzym podejściu ani podać odpowiedzi z innego pytania / innego quizu.
- Szczegóły z poprawnymi odpowiedziami są dostępne dopiero po zakończeniu quizu i tylko dla właściciela wyniku albo admina.
- Wynik końcowy jest liczony od nowa na serwerze z zapisanych odpowiedzi.

### Nowe i zmienione endpointy API

| Metoda | Adres | Dostęp | Opis |
|---|---|---|---|
| GET | `/api/quizzes` | wszyscy | lista opublikowanych quizów (bez pytań) |
| GET | `/api/quizzes/:slug` | zalogowani | dane jednego quizu (ekran startowy) |
| POST | `/api/quizzes/:slug/attempts` | zalogowani | start podejścia → `attemptId` + pytania bez poprawnych odpowiedzi |
| POST | `/api/attempts/:id/answer` | właściciel | `{ questionId, optionId }` → `{ correct, selectedOptionId, correctOptionId }` |
| POST | `/api/attempts/:id/finish` | właściciel | zakończenie → `{ score, total, percent }` |
| GET | `/api/attempts` | zalogowani | moje zakończone podejścia |
| GET | `/api/attempts/:id` | właściciel / admin | szczegóły zakończonego podejścia |
| GET | `/api/admin/attempts` | admin | wyniki wszystkich uczniów (`?quiz=<slug>`, `?limit=`) |

Reguły dostępu do quizu są w `api/src/lib/access.js` i są już przygotowane pod kursy (krok 7): quiz bez kursu — każdy zalogowany; quiz w kursie — tylko z zatwierdzonym zapisem; admin — zawsze.

### Zmienione pliki

**api/**
- `src/routes/quizzes.js` — lista, dane quizu, start podejścia,
- `src/routes/attempts.js` — **nowy**: odpowiedź, zakończenie, moje wyniki, szczegóły,
- `src/routes/admin.js` — dodane `GET /api/admin/attempts`,
- `src/lib/access.js` — **nowy**: kto może rozwiązywać quiz, parsowanie id,
- `src/app.js` — podpięte `/api/attempts`,
- `scripts/import-quizzes.js` — domyślny katalog to teraz `api/data/quizzes`,
- `data/quizzes/` — **nowy katalog**, przeniesione tu pliki JSON z `client/public/`.

**client/**
- `src/App.jsx` — lista quizów z `/api/quizzes` zamiast `/quizList.json`; `/quiz/:id` wymaga logowania; nowe trasy `/moje-wyniki`, `/wyniki/:id`,
- `src/component/Quiz.jsx` — przepisany na API (start podejścia, odpowiedzi i wynik z serwera),
- `src/component/StartScreen.jsx` — bez pola na imię, pokazuje zalogowanego użytkownika; poprawiony niepoprawny HTML (`<div>`/`<ul>` w `<p>`),
- `src/component/StartQuiz.jsx` — przycisk „Zaloguj się i rozpocznij” dla gościa,
- `src/component/Header.jsx` — link „Moje wyniki”,
- `src/pages/MyResults.jsx`, `AttemptDetails.jsx`, `resultsUtils.jsx`, `Results.css` — **nowe**,
- `src/pages/AdminHome.jsx` — sekcja „Wyniki uczniów”,
- `src/component/StartScreen.css` — poprawka: po zaznaczeniu odpowiedzi efekt `:hover` zmieniał tekst na pomarańczowy, przez co zielony/czerwony przycisk był nieczytelny (błąd był też w starej wersji),
- `public/` — zostały tylko `style.css` i favicony.

Schemat bazy się nie zmienił — tabele `quiz_attempts` i `attempt_answers` były już w migracji z kroku 1.

### Import quizów — nowe polecenia

```bash
# lokalnie
cd api && npm run import:quizzes

# na serwerze (pliki są w obrazie api, nie trzeba nic montować)
docker compose exec api node scripts/import-quizzes.js
```

Polecenia w `readme-start.md` zostały zaktualizowane. Polecenie z sekcji „Wdrożenie na serwer” w kroku 1–2 (`-v ./client/public:/data`) **już nie działa** — używaj powyższego.

### Wdrożenie kroku 4 na serwer

```bash
git pull
docker compose up -d --build
```

Bez migracji i bez zmian w `.env`. Jeśli import był już zrobiony, nie trzeba go powtarzać.

### Sprawdzone

- API (curl): gość nie może zacząć quizu (`401`), uczeń nie widzi szkicu (`404`), odpowiedź przy starcie nie zawiera `isCorrect`, odpowiedź w cudzym podejściu (`404`), odpowiedź z innego pytania (`400`), szczegóły przed zakończeniem niedostępne, zmiana odpowiedzi zwraca pierwszą, wynik po `finish` zgodny z liczbą poprawnych, odpowiedź po zakończeniu (`409`), cudze wyniki niewidoczne, admin widzi wyniki wszystkich i może otworzyć szkic.
- Przeglądarka (Chrome, test automatyczny): gość → „Zaloguj się i rozpocznij” → logowanie → powrót do quizu → rozwiązanie całego quizu → wynik w UI zgodny z liczbą zielonych odpowiedzi → szczegóły → Moje wyniki → panel admina z wynikiem ucznia i jego odpowiedziami; widok na telefonie (375 px); brak pobrań plików `.json` i brak błędów JS.
- Stary adres `/sql-podstawy-1.json` zwraca stronę aplikacji (HTML), a nie plik z odpowiedziami.
- Obrazy Dockera: frontend nie zawiera plików JSON, import działa w kontenerze `api`.

### Do rozważenia później

- Niedokończone podejścia (ktoś zamknął kartę w trakcie) zostają w bazie bez daty zakończenia i nie są nigdzie pokazywane. Można dodać „Dokończ quiz” albo czyszczenie starych podejść.
- Eksport wyników uczniów do CSV z panelu admina.

### Następny krok

Krok 5: panel admina z edytorem quizów i pytań (dodawanie, edycja, usuwanie, publikowanie szkiców).

## Krok 5 — edytor quizów i pytań w panelu admina (2026-11-15)

### Co nowego w panelu admina

Panel ma teraz dwie zakładki: **Wyniki i konta** (to, co było) oraz **Quizy** (nowe).

**Lista quizów** (`/admin/quizy`)
- wszystkie quizy, także szkice: tytuł, adres, temat, poziom, liczba pytań i wyników,
- wyszukiwarka (po tytule, adresie, temacie),
- strzałki ↑ ↓ — kolejność quizów na stronie dla uczniów,
- przycisk statusu **Opublikowany / Szkic** — kliknięcie przełącza publikację,
- Edytuj, Podgląd (otwiera quiz tak, jak widzi go uczeń — działa też dla szkiców), Usuń,
- **+ Nowy quiz**.

**Edycja quizu** (`/admin/quizy/:id`, nowy: `/admin/quizy/nowy`)
- dane quizu: tytuł, adres (slug — przy nowym quizie tworzy się sam z tytułu, np. „Pętle w Pythonie” → `petle-w-pythonie`), opis, temat i poziom (z podpowiedziami z istniejących quizów), losowa kolejność pytań, publikacja,
- lista pytań z podglądem treści, kodu i odpowiedzi (poprawna oznaczona ✓),
- przy każdym pytaniu: ↑ ↓ (kolejność), Edytuj, Usuń,
- **+ Dodaj pytanie**.

**Formularz pytania**
- treść pytania (może być pusta, jeśli jest kod),
- pole na kod czcionką o stałej szerokości — **Tab wstawia 4 spacje**, wcięcia są zachowywane,
- odpowiedzi od 2 do 8 (A–H), poprawną zaznacza się kółkiem po lewej,
- walidacja: brak pustych odpowiedzi, dokładnie jedna poprawna.

### Zasady chroniące wyniki uczniów

- Nowy quiz zawsze powstaje jako **szkic**. Opublikować można dopiero quiz z co najmniej jednym pytaniem; nie da się usunąć ostatniego pytania opublikowanego quizu.
- Odpowiedzi, którą wybrał już jakiś uczeń, **nie można usunąć** (przycisk ✕ jest wyszarzony) — można zmienić jej treść albo usunąć całe pytanie.
- Zmiana poprawnej odpowiedzi **nie przelicza starych wyników** — wynik ucznia zostaje taki, jak w chwili rozwiązywania. Edytor pokazuje ostrzeżenie, gdy pytanie ma już odpowiedzi uczniów.
- Usunięcie pytania usuwa też odpowiedzi uczniów na nie (w szczegółach wyniku to pytanie zniknie, sam wynik punktowy zostaje). Przed usunięciem jest potwierdzenie z liczbą odpowiedzi.
- Usunięcie quizu z wynikami wymaga **dwóch potwierdzeń** — drugie podaje liczbę wyników, które znikną.
- Adres (slug) musi być unikalny i może zawierać tylko małe litery, cyfry i myślniki.

### Nowe endpointy API (wszystkie tylko dla admina)

| Metoda | Adres | Opis |
|---|---|---|
| GET | `/api/admin/quizzes` | wszystkie quizy z liczbą pytań i wyników |
| POST | `/api/admin/quizzes` | nowy quiz (szkic) `{ title, slug?, description, topic, level, shuffle }` |
| PUT | `/api/admin/quizzes/order` | kolejność quizów `{ ids: [...] }` |
| GET | `/api/admin/quizzes/:id` | quiz z pytaniami i poprawnymi odpowiedziami |
| PATCH | `/api/admin/quizzes/:id` | zmiana danych / publikacja |
| DELETE | `/api/admin/quizzes/:id` | usunięcie; gdy są wyniki → `409`, potwierdzenie przez `?force=1` |
| POST | `/api/admin/quizzes/:id/questions` | nowe pytanie `{ question, code, options: [{ text, isCorrect }] }` |
| PUT | `/api/admin/quizzes/:id/questions/order` | kolejność pytań `{ ids: [...] }` |
| PUT | `/api/admin/questions/:id` | edycja pytania; odpowiedzi z `id` są zmieniane, bez `id` dodawane, brakujące usuwane |
| DELETE | `/api/admin/questions/:id` | usunięcie pytania |

### Zmienione pliki

**api/**
- `src/routes/adminQuizzes.js` — **nowy**: wszystkie endpointy edytora,
- `src/lib/quizValidate.js` — **nowy**: walidacja quizu i pytania, tworzenie slugów z polskimi znakami,
- `src/routes/admin.js` — podpięty edytor.

**client/**
- `src/pages/admin/AdminNav.jsx` — **nowy**: zakładki panelu,
- `src/pages/admin/AdminQuizList.jsx` — **nowy**: lista quizów,
- `src/pages/admin/AdminQuizEdit.jsx` — **nowy**: edycja quizu i lista pytań,
- `src/pages/admin/QuestionForm.jsx` — **nowy**: formularz pytania,
- `src/pages/admin/Admin.css` — **nowy**: style panelu (przyciski, formularze, karty pytań),
- `src/pages/AdminHome.jsx` — dodane zakładki,
- `src/App.jsx` — trasy `/admin/quizy` i `/admin/quizy/:id`.

Schemat bazy się nie zmienił — bez nowej migracji.

### Pliki JSON a edytor

Od teraz quizy najlepiej edytować w panelu. Pliki w `api/data/quizzes/` służą tylko do pierwszego importu. Ponowne uruchomienie importu **nadpisze pytania** zmienione w panelu (poza quizami, które mają już wyniki — te są pomijane, chyba że z `--force`), więc nie uruchamiaj go po wprowadzeniu zmian w edytorze.

### Wdrożenie kroku 5 na serwer

```bash
git pull
docker compose up -d --build
```

Bez migracji i bez zmian w `.env`.

### Sprawdzone

- API (curl): dostęp tylko dla admina (`403` dla ucznia), walidacja (brak tytułu, zły i zajęty slug, dwie poprawne odpowiedzi, pusta odpowiedź), blokada publikacji bez pytań, kolejność pytań (także odrzucenie obcych id), edycja odpowiedzi (zmiana treści, dodanie nowej, usunięcie nieużywanej, blokada usunięcia wybranej przez ucznia, odrzucenie odpowiedzi z innego pytania), szczegóły wyniku ucznia po edycji pokazują jego pierwotny wybór, usunięcie pytania, blokada usunięcia ostatniego pytania opublikowanego quizu, usuwanie quizu z wynikami (`409`, potem `force=1`).
- Baza: usunięcie pytania i quizu z odpowiedziami uczniów działa poprawnie (sprawdzone kaskady kluczy obcych).
- Przeglądarka (Chrome, test automatyczny): nowy quiz → automatyczny slug → publikacja zablokowana bez pytań → dodanie pytania z kodem (Tab wstawia wcięcie, kod zapisany z wcięciami) → komunikat o braku poprawnej odpowiedzi → pytanie z 2 odpowiedziami (blokada usuwania poniżej 2) → edycja → zmiana kolejności → publikacja → quiz widoczny i rozwiązywalny przez ucznia (kod wyświetla się z wcięciami) → usunięcie z dwoma potwierdzeniami; widok edytora na telefonie (375 px) bez przewijania w bok; brak błędów JS.

### Do rozważenia później

- Duplikowanie quizu (kopia jako szkic).
- Eksport quizu do JSON (kopia zapasowa / przeniesienie).
- Obrazki w pytaniach.

### Następny krok

Krok 6: artykuły i strona główna (edytor Markdown w panelu admina).

## Krok 6 — strona główna z artykułami i edytor Markdown (2026-11-15)

### Zmiana adresów

| Adres | Było | Jest |
|---|---|---|
| `/` | lista quizów | **strona główna z artykułami** |
| `/quizy` | — | lista quizów (przeniesiona z `/`) |
| `/artykuly/:slug` | — | pojedynczy artykuł |

W menu: **Artykuły** (`/`) i **Quizy** (`/quizy`). Linki „Wróć do listy quizów” i „Wybierz quiz” prowadzą teraz do `/quizy`.

> Uwaga: kto miał zakładkę na stronę główną `quiz.maturazinformatyki.it`, zobaczy teraz artykuły — do quizów prowadzi przycisk „Rozwiąż quiz” i menu.

### Strona główna (`/`)

- powitanie „Matura z informatyki” z przyciskami **Rozwiąż quiz** i **Załóż konto** (dla zalogowanego: **Moje wyniki**),
- karty artykułów od najnowszego: obrazek (jeśli jest), data, tytuł, zajawka, „Czytaj dalej →”,
- po 8 artykułów, przycisk **Starsze artykuły** dociąga kolejne,
- gdy nie ma artykułów: „Wkrótce pojawią się tu artykuły” z linkiem do quizów.

### Strona artykułu (`/artykuly/:slug`)

- tytuł, data publikacji, autor, obrazek na górze, treść z Markdown,
- na dole zachęta „Przejdź do quizów”,
- tytuł karty przeglądarki = tytuł artykułu,
- admin widzi też **szkice** (z paskiem „Szkic — widzisz tylko Ty”) i link **Edytuj artykuł**.

### Panel admina — zakładka **Artykuły**

**Lista** (`/admin/artykuly`): tytuł, adres, status (kliknięcie przełącza Opublikowany / Szkic), data publikacji, ostatnia zmiana, Edytuj / Podgląd / Usuń, **+ Nowy artykuł**.

**Edycja** (`/admin/artykuly/:id`, nowy: `/admin/artykuly/nowy`):
- tytuł, adres (slug tworzy się sam z tytułu), obrazek na górze (adres `https://…` albo `/…`), zajawka (puste = początek treści),
- przyciski: **Zapisz szkic / Zapisz zmiany**, **Opublikuj** / **Cofnij publikację**, **Usuń artykuł**,
- znacznik **● Niezapisane zmiany** i ostrzeżenie przeglądarki przy zamykaniu karty z niezapisanymi zmianami.

### Edytor Markdown

Własny edytor (bez ciężkiej zewnętrznej biblioteki), żeby podgląd wyglądał **dokładnie tak jak artykuł na stronie** — używa tego samego komponentu `<Markdown>`.

- **Pasek narzędzi:** H2, H3, **pogrubienie**, *kursywa*, ~~przekreślenie~~, link, obrazek, lista punktowana, lista numerowana, cytat, kod w linii, blok kodu (z zaznaczonym językiem `python` do szybkiej zmiany), tabela, linia pozioma. Przyciski działają na zaznaczonym tekście (np. zaznacz słowo → **B**).
- **Widoki:** Edycja / **Obok siebie** (podgląd na żywo) / Podgląd. Wybór jest zapamiętywany w przeglądarce. Na telefonie „obok siebie” = jedno pod drugim.
- **Skróty:** Ctrl+B pogrubienie, Ctrl+I kursywa, Ctrl+K link, **Ctrl+S zapis**, Tab wstawia 4 spacje (wcięcia w kodzie). Na Macu zamiast Ctrl działa Cmd.
- **Ctrl+Z działa** także po użyciu przycisków z paska.
- Licznik słów i znaków.

Obsługiwany Markdown (GFM): nagłówki, pogrubienia, kursywa, przekreślenia, linki, obrazki, listy (także zadań `- [ ]`), cytaty, kod w linii i bloki kodu, tabele, linie poziome.

### Bezpieczeństwo treści

- Markdown wyświetla `react-markdown`, który **nie wykonuje surowego HTML** — `<script>`, `<img onerror=…>` itp. pokazują się jako zwykły tekst.
- Linki `javascript:` są usuwane.
- Linki zewnętrzne otwierają się w nowej karcie z `rel="noopener noreferrer"`.
- Adres obrazka na górze artykułu musi zaczynać się od `http(s)://` albo `/`.
- Szkice są niewidoczne dla gości i uczniów (`404`).

### Nowe endpointy API

| Metoda | Adres | Dostęp | Opis |
|---|---|---|---|
| GET | `/api/articles?page=1&limit=10` | wszyscy | opublikowane, najnowsze pierwsze → `{ items, total, page, pages }` (bez pełnej treści, z zajawką) |
| GET | `/api/articles/:slug` | wszyscy (szkice: admin) | pełny artykuł |
| GET | `/api/admin/articles` | admin | wszystkie artykuły |
| POST | `/api/admin/articles` | admin | nowy `{ title, slug?, excerpt?, coverUrl?, content, status? }` |
| GET | `/api/admin/articles/:id` | admin | artykuł do edycji |
| PATCH | `/api/admin/articles/:id` | admin | zapis zmian / `status: "published" \| "draft"` |
| DELETE | `/api/admin/articles/:id` | admin | usunięcie |

Zasady:
- data publikacji ustawia się przy **pierwszej** publikacji i nie zmienia przy cofnięciu i ponownej publikacji,
- nie można opublikować pustego artykułu,
- autor = admin, który utworzył artykuł,
- zajawka automatyczna: pierwsze ~220 znaków treści bez formatowania Markdown i znaczników HTML.

### Zmienione pliki

**api/**
- `src/routes/articles.js` — **nowy**: endpointy publiczne i admina,
- `src/lib/articleValidate.js` — **nowy**: walidacja, automatyczna zajawka,
- `src/app.js` — podpięte `/api/articles` i `/api/admin/articles`; limit JSON zwiększony do 2 MB (długie artykuły).

**client/**
- `src/component/Markdown.jsx`, `Markdown.css` — **nowe**: wyświetlanie Markdown (strona i podgląd),
- `src/pages/Home.jsx` — **nowa** strona główna,
- `src/pages/ArticlePage.jsx` — **nowa** strona artykułu,
- `src/pages/Articles.css` — **nowe** style strony głównej i artykułu,
- `src/pages/admin/MarkdownEditor.jsx`, `MarkdownEditor.css` — **nowy** edytor,
- `src/pages/admin/AdminArticleList.jsx`, `AdminArticleEdit.jsx` — **nowe**,
- `src/pages/admin/AdminNav.jsx` — zakładka „Artykuły”,
- `src/pages/admin/Admin.css` — style edycji artykułu,
- `src/App.jsx` — trasy `/`, `/quizy`, `/artykuly/:slug`, `/admin/artykuly…`,
- `src/component/Header.jsx` — menu „Artykuły” i „Quizy”,
- `src/component/Quiz.jsx`, `src/pages/MyResults.jsx` — linki do `/quizy`,
- `package.json` — nowe zależności `react-markdown` i `remark-gfm`.

Schemat bazy się nie zmienił — tabela `articles` była już w migracji z kroku 1.

### Wdrożenie kroku 6 na serwer

```bash
git pull
docker compose up -d --build
```

Bez migracji i bez zmian w `.env`.

### Sprawdzone

- API (curl): dostęp do panelu tylko dla admina, walidacja (brak tytułu, zły adres obrazka `javascript:`, publikacja pustego artykułu, zajęty slug), szkic niewidoczny dla gościa i widoczny dla admina, publikacja ustawia datę, ponowna publikacja zachowuje pierwotną datę, lista publiczna bez pełnej treści, stronicowanie, usuwanie.
- Przeglądarka (Chrome, test automatyczny): strona główna gościa bez artykułów → logowanie → nowy artykuł → pogrubienie przyciskiem i Ctrl+B → **Ctrl+Z cofa zmianę z przycisku** → nagłówek, blok kodu, tabela, link Ctrl+K → podgląd na żywo (pogrubienie, nagłówek, kod, tabela, link w nowej karcie) → próby XSS (`<script>`, `<img onerror>`, link `javascript:`) nic nie wykonały ani w podglądzie, ani na stronie → zapis szkicu → podgląd szkicu → publikacja → zapis Ctrl+S → gość widzi artykuł na stronie głównej i otwiera go → `/quizy` działa; widok na telefonie (375 px) bez przewijania w bok; brak błędów JS.
- Obrazy Dockera budują się z nowymi zależnościami.
- Znalezione i poprawione w trakcie testów: (1) po użyciu przycisku z paska kolejne wpisywanie mogło trafić w złe miejsce tekstu (odroczone przywracanie zaznaczenia), (2) komunikat „Szkic zapisany” znikał od razu po utworzeniu artykułu, (3) automatyczna zajawka pokazywała znaczniki HTML.

### Do rozważenia później

- Wgrywanie obrazków z komputera (teraz tylko adresy obrazków z internetu) — wymaga katalogu/wolumenu na pliki w Dockerze.
- Kolorowanie składni w blokach kodu.
- Kategorie / tagi artykułów i wyszukiwarka.
- Mapa strony (`sitemap.xml`) i znaczniki dla wyszukiwarek (SEO).

### Następny krok

Krok 7: kursy — lekcje, prośba o dostęp, ręczne zatwierdzanie zapisów w panelu admina.

## Krok 7 — kursy, potwierdzanie e-maila, logowanie dwuetapowe (2026-11-15)

> **Przed wdrożeniem na serwer:** ten krok **wymaga serwera poczty (SMTP)**. Dopisz dane poczty do `.env` na serwerze (szczegóły niżej i w `readme-start.md`), inaczej kontener `api` nie wystartuje.

### 1. Kursy

**Uczeń**
- `/kursy` — lista opublikowanych kursów: liczba lekcji i quizów, plakietka statusu („Czeka na zatwierdzenie”, „Masz dostęp”, „Prośba odrzucona”).
- `/kursy/:slug` — opis kursu (Markdown) i spis lekcji widzi każdy; treść lekcji i quizy kursu są zablokowane 🔒 do czasu zatwierdzenia.
  - gość: „Zaloguj się” (po zalogowaniu wraca na stronę kursu),
  - zalogowany: **Poproś o dostęp** → „Prośba wysłana, czeka na zatwierdzenie”,
  - po odrzuceniu: **Poproś ponownie**,
  - po zatwierdzeniu: lekcje i przycisk „Zacznij od pierwszej lekcji”, quizy kursu z przyciskiem „Rozwiąż”.
- `/kursy/:slug/lekcje/:id` — lekcja: spis lekcji z boku (na telefonie nad treścią), „Lekcja 2 z 5”, przyciski **← Poprzednia / Następna →**.
- Quizy przypisane do kursu pojawiają się na `/quizy` tylko u uczniów z dostępem do kursu.

**Admin**
- Zakładka **Kursy** (`/admin/kursy`): lista z liczbą lekcji, quizów, uczniów i oczekujących próśb; przełączanie publikacji; Edytuj / Podgląd / Usuń.
- Edycja kursu (`/admin/kursy/:id`, nowy: `/admin/kursy/nowy`): nazwa, adres, **opis w edytorze Markdown**, publikacja; lista lekcji (↑ ↓, Edytuj, Usuń, + Dodaj lekcję) — **każda lekcja ma pełny edytor Markdown** z podglądem (Ctrl+S zapisuje lekcję); lista quizów kursu.
- Edytor quizu: nowe pole **Kurs** — „brak (quiz dla każdego zalogowanego)” albo wybrany kurs.
- Zakładka **Zapisy** (`/admin/zapisy`) z **liczbą oczekujących próśb** przy nazwie zakładki:
  - Oczekujące: **Zatwierdź** / **Odrzuć**,
  - Zatwierdzone: **Odbierz dostęp** / Usuń,
  - Odrzucone: **Zatwierdź** / Usuń (usunięty zapis = uczeń może poprosić od nowa).
- Usunięcie kursu usuwa lekcje i zapisy, ale **quizów nie usuwa** — zostają odpięte od kursu i ukryte (szkice), żeby nie stały się nagle dostępne dla wszystkich.

**Powiadomienia e-mail**
- nowa prośba o dostęp → e-mail do **wszystkich adminów** z przyciskiem „Przejdź do zapisów”,
- zatwierdzenie / odrzucenie → e-mail do ucznia (przy zatwierdzeniu z linkiem do kursu).
- Błąd wysyłki powiadomienia nie blokuje prośby ani decyzji (jest tylko zapisany w logach `api`).

### 2. Potwierdzanie adresu e-mail

1. Rejestracja **nie loguje** — pokazuje ekran „Sprawdź skrzynkę” i wysyła e-mail z linkiem (ważny **24 godziny**).
2. Kliknięcie linku (`/potwierdz-email?token=…`) potwierdza adres i **od razu loguje** („Konto aktywne!”).
3. Bez potwierdzenia **nie da się zalogować** — przy próbie pojawia się komunikat i przycisk „Wyślij link ponownie”.
4. Link działa raz; ponowne kliknięcie pokazuje „Adres już potwierdzony”. Wygasły link → formularz wysłania nowego.
5. Ponowna wysyłka najwcześniej po 60 s; nowy link unieważnia poprzedni.

**Istniejące konta** (sprzed aktualizacji, w tym admin) zostały w migracji automatycznie oznaczone jako potwierdzone — nikt nie traci dostępu. Konta zakładane skryptem `create-admin` też są od razu potwierdzone.

### 3. Logowanie dwuetapowe (kod na e-mail)

**Dobrowolne dla każdego** — włącza się w **Moje konto → Logowanie dwuetapowe**.

- **Włączenie:** „Włącz logowanie dwuetapowe” → kod 6-cyfrowy na e-mail → wpisanie kodu (potwierdza, że poczta działa).
- **Logowanie:** e-mail + hasło → ekran „Kod logowania” → kod z e-maila → zalogowany.
  - kod ważny **10 minut**, działa **jeden raz**,
  - **5 błędnych prób** → kod przestaje działać, trzeba zalogować się od nowa,
  - „Wyślij nowy kod” najwcześniej po 60 s (poprzedni przestaje działać),
  - adres pokazywany jest częściowo ukryty (`ja***@gmail.com`).
- **Wyłączenie:** wymaga podania hasła.

### Bezpieczeństwo

- Kody i linki są losowane kryptograficznie; w bazie zapisywany jest tylko ich **skrót HMAC** (tabela `auth_codes`) — wyciek bazy nie zdradza kodów.
- Między hasłem a kodem użytkownik ma tylko krótkie (10 min) ciasteczko `mzi_2fa`, które **samo nie loguje**. Tokeny sesji mają teraz typ `session`, więc tokenu z etapu 2FA nie da się podstawić jako sesji (sprawdzone testem).
- Informacja „potwierdź e-mail” pojawia się dopiero po poprawnym haśle — obcy nie sprawdzi, czy konto istnieje. Ponowna wysyłka linku zawsze odpowiada tak samo.
- Limity prób: kod 2FA (20 / 15 min z IP), wysyłki e-maili (10 / godz.), logowanie i rejestracja jak wcześniej.
- Stare kody (> 7 dni) są usuwane przy okazji kolejnych rejestracji.

### Zmiany w bazie (migracja `20261115115731_email_verification_2fa`)

- `users.email_verified_at` — data potwierdzenia e-maila (`NULL` = niepotwierdzony),
- `users.two_factor_enabled` — czy włączone logowanie dwuetapowe,
- nowa tabela `auth_codes` (jednorazowe kody i linki: `verify_email`, `login_2fa`, `enable_2fa`),
- istniejące konta oznaczone jako potwierdzone.

Kursy korzystają z tabel `courses`, `lessons`, `enrollments` z migracji z kroku 1.

Migracja wykona się automatycznie przy starcie kontenera `api`. Lokalnie: `cd api && npx prisma migrate deploy`.

### Nowe endpointy API

**Konto i logowanie**

| Metoda | Adres | Opis |
|---|---|---|
| POST | `/api/auth/register` | zakłada konto, wysyła link → `{ verificationRequired, email, emailSent }` (nie loguje) |
| POST | `/api/auth/verify-email` | `{ token }` → potwierdza i loguje |
| POST | `/api/auth/resend-verification` | `{ email }` → nowy link (zawsze `{ ok: true }`) |
| POST | `/api/auth/login` | → `{ user }` albo `{ twoFactorRequired, email }`; `403 EMAIL_NOT_VERIFIED` |
| POST | `/api/auth/2fa/verify` | `{ code }` — drugi krok logowania |
| POST | `/api/auth/2fa/resend` | nowy kod logowania |
| POST | `/api/auth/2fa/enable/start` | wysyła kod włączenia 2FA |
| POST | `/api/auth/2fa/enable/confirm` | `{ code }` → włącza 2FA |
| POST | `/api/auth/2fa/disable` | `{ password }` → wyłącza 2FA |

**Kursy (uczeń)**

| Metoda | Adres | Opis |
|---|---|---|
| GET | `/api/courses` | opublikowane kursy + mój status |
| GET | `/api/courses/:slug` | opis, spis lekcji, quizy, mój zapis, `hasAccess` |
| GET | `/api/courses/:slug/lessons/:id` | treść lekcji (tylko z dostępem; `403 NO_ACCESS`) |
| POST | `/api/courses/:slug/enroll` | prośba o dostęp (powiadamia adminów) |

**Kursy i zapisy (admin)**

| Metoda | Adres | Opis |
|---|---|---|
| GET / POST | `/api/admin/courses` | lista / nowy kurs |
| GET / PATCH / DELETE | `/api/admin/courses/:id` | kurs z lekcjami i quizami / zmiana / usunięcie |
| POST | `/api/admin/courses/:id/lessons` | nowa lekcja |
| PUT | `/api/admin/courses/:id/lessons/order` | kolejność lekcji |
| PUT / DELETE | `/api/admin/lessons/:id` | edycja / usunięcie lekcji |
| GET | `/api/admin/enrollments?status=pending\|approved\|rejected` | zapisy |
| GET | `/api/admin/enrollments/pending-count` | liczba oczekujących |
| PATCH | `/api/admin/enrollments/:userId/:courseId` | `{ status: "approved" \| "rejected" }` (e-mail do ucznia) |
| DELETE | `/api/admin/enrollments/:userId/:courseId` | usunięcie zapisu |

Oraz: `PATCH /api/admin/quizzes/:id` przyjmuje `courseId` (lub `null`).

### Zmienione pliki

**api/**
- `prisma/schema.prisma` + nowa migracja,
- `src/config.js` — `APP_URL`, `SMTP_*`; na produkcji brak `SMTP_HOST` = błąd przy starcie,
- `src/lib/mailer.js` — **nowy**: wysyłka (nodemailer) i szablony e-maili po polsku (HTML + tekst),
- `src/lib/authCodes.js` — **nowy**: jednorazowe kody i linki,
- `src/lib/auth.js` — ciasteczko 2FA, typ tokenu sesji, nowe pola użytkownika,
- `src/routes/auth.js` — przebudowany: potwierdzanie e-maila, 2FA,
- `src/routes/courses.js`, `src/routes/adminCourses.js`, `src/lib/courseValidate.js` — **nowe**,
- `src/lib/quizValidate.js`, `src/routes/adminQuizzes.js` — przypisanie quizu do kursu,
- `src/middleware/auth.js`, `src/routes/admin.js`, `src/app.js` — podpięcie,
- `scripts/create-admin.js` — admin od razu potwierdzony,
- `.env.example` — `APP_URL`, `SMTP_*`; nowa zależność `nodemailer`.

**client/**
- `src/pages/VerifyEmail.jsx`, `src/pages/TwoFactorSettings.jsx`, `src/auth/ResendVerification.jsx` — **nowe**,
- `src/pages/Login.jsx` (krok z kodem), `Register.jsx` („Sprawdź skrzynkę”), `Account.jsx` (sekcja 2FA),
- `src/auth/AuthContext.jsx`, `src/api.js` — obsługa 2FA i kodów błędów,
- `src/pages/courses/` — **nowe**: `CoursesList.jsx`, `CoursePage.jsx`, `LessonPage.jsx`, `Courses.css`, pomocnicze,
- `src/pages/admin/AdminCourseList.jsx`, `AdminCourseEdit.jsx`, `AdminEnrollments.jsx` — **nowe**,
- `src/pages/admin/AdminNav.jsx` — zakładki Kursy i Zapisy (z licznikiem),
- `src/pages/admin/AdminQuizEdit.jsx`, `AdminQuizList.jsx` — pole i informacja o kursie,
- `src/component/Header.jsx` — menu „Kursy”,
- `src/App.jsx` — nowe trasy; **panel admina ładowany osobno** (uczniowie nie pobierają edytorów — mniejszy plik JS).

**Docker / konfiguracja**
- `docker-compose.dev.yml` — nowy kontener **Mailpit** (testowa poczta, http://localhost:8025),
- `docker-compose.yml` — zmienne `APP_URL` i `SMTP_*` dla `api` (`SMTP_HOST` wymagany),
- `.env.example` — przykład konfiguracji poczty,
- `readme-start.md` — instrukcja poczty lokalnie i na VPS.

### Wdrożenie kroku 7 na serwer

1. Załóż skrzynkę do wysyłki (np. `no-reply@maturazinformatyki.it`) u swojego dostawcy poczty i sprawdź dane SMTP.
2. Dopisz do `.env` na serwerze `APP_URL` i `SMTP_*` (wzór w `.env.example`).
3. ```bash
   git pull
   docker compose up -d --build
   docker compose logs api        # "2 migrations found... All migrations have been successfully applied"
   ```
4. Sprawdź: załóż testowe konto — e-mail z linkiem powinien przyjść w ciągu kilku sekund (sprawdź też SPAM; pomaga ustawienie SPF/DKIM dla domeny).

### Sprawdzone

- **API (curl + Mailpit):** rejestracja bez logowania; e-mail z linkiem; logowanie przed potwierdzeniem zablokowane (komunikat dopiero po dobrym haśle); zły token; ponowna wysyłka (limit 60 s, ta sama odpowiedź dla nieistniejącego konta); potwierdzenie loguje; drugi klik = „już potwierdzony”; włączenie 2FA kodem (zły kod, limit 60 s); logowanie z 2FA (brak sesji przed kodem, zły kod z licznikiem prób, poprawny kod, kod jednorazowy, blokada po 5 błędach); **próba podstawienia tokenu 2FA jako sesji odrzucona**; wyłączenie 2FA tylko z hasłem; w bazie wyłącznie skróty kodów. Kursy: dostęp tylko admin do panelu, szkic kursu niewidoczny, lekcje i quizy kursu zablokowane bez zapisu, prośba (bez duplikatów), e-mail do admina, odrzucenie → ponowna prośba → zatwierdzenie → e-mail do ucznia → dostęp do lekcji i quizu, nawigacja między lekcjami, usunięcie kursu ukrywa jego quizy.
- **Przeglądarka (Chrome, test automatyczny z prawdziwymi e-mailami z Mailpit):** rejestracja → „Sprawdź skrzynkę” → logowanie zablokowane z przyciskiem ponownej wysyłki → kliknięcie linku z e-maila → „Konto aktywne!” i zalogowanie → włączenie 2FA kodem z e-maila → wylogowanie → logowanie z kodem (zły kod, potem dobry) → admin tworzy kurs z opisem i 2 lekcjami w edytorze Markdown, publikuje, przypisuje quiz do kursu → uczeń prosi o dostęp → licznik w zakładce Zapisy → admin zatwierdza (licznik znika, uczeń dostaje e-mail) → uczeń otwiera lekcje (kod w lekcji, następna lekcja, aktywna pozycja w spisie) → quiz kursu widoczny na `/quizy`; widoki na telefonie (375 px) bez przewijania w bok; brak błędów JS.
- **Docker:** obrazy się budują; bez `SMTP_HOST` zarówno `docker compose`, jak i kontener `api` kończą z czytelnym komunikatem; z ustawioną pocztą `api` startuje i wykonuje nową migrację.

### Do rozważenia później

- **Reset zapomnianego hasła przez e-mail** (mechanizm kodów i wysyłki jest już gotowy — to niewielka zmiana).
- Postęp ucznia w kursie (oznaczanie przeczytanych lekcji).
- Kod 2FA przez aplikację (TOTP) jako alternatywa dla e-maila.
- Wylogowanie z innych urządzeń przy zmianie hasła / włączeniu 2FA.

## Krok 8 — reset zapomnianego hasła i wylogowanie innych urządzeń (2026-11-15)

### Reset hasła

1. Na stronie logowania, pod polem hasła, jest link **„Nie pamiętasz hasła?”** → `/reset-hasla`.
2. Uczeń podaje e-mail → komunikat „Jeśli konto istnieje, wysłaliśmy link” (ta sama odpowiedź dla nieistniejącego konta — nie da się sprawdzić, kto ma konto). Ponowna wysyłka najwcześniej po 60 s.
3. E-mail **„Ustaw nowe hasło”** z przyciskiem — link (`/nowe-haslo?token=…`) jest ważny **1 godzinę** i działa **raz**.
4. Strona od razu sprawdza, czy link jest ważny. Jeśli wygasł / został użyty — „Link nie działa” z przyciskiem „Wyślij nowy link”.
5. Nowe hasło + powtórzenie → **„Hasło zmienione”** → „Zaloguj się”.

Ważne zasady:
- Reset **nie loguje automatycznie** — trzeba zalogować się nowym hasłem. Dzięki temu przy włączonym logowaniu dwuetapowym nadal potrzebny jest kod (sam dostęp do skrzynki nie omija drugiego kroku logowania).
- Konto z niepotwierdzonym e-mailem po resecie zostaje potwierdzone (link przyszedł na ten adres, więc adres działa).
- Zła próba (np. za krótkie hasło) nie zużywa linku.

### Wylogowanie innych urządzeń po zmianie hasła

- Każda sesja ma teraz **numer wersji** (`users.token_version`). Zmiana hasła zwiększa ten numer, więc wszystkie wcześniejsze sesje przestają działać.
- **Reset hasła** → wylogowanie ze **wszystkich** urządzeń.
- **Zmiana hasła w „Moje konto”** → wylogowanie z **pozostałych** urządzeń; bieżące zostaje zalogowane (dostaje nowe ciasteczko).
- Dotychczasowe sesje działają dalej (mają wersję 0, tak jak konta w bazie) — aktualizacja nikogo nie wylogowuje.

### Powiadomienie bezpieczeństwa

Po każdej zmianie hasła (reset albo „Moje konto”) właściciel dostaje e-mail **„Twoje hasło zostało zmienione”** z informacją o wylogowaniu innych urządzeń i przyciskiem „Ustaw nowe hasło” — na wypadek, gdyby to nie on zmienił hasło.

### Nowe endpointy API

| Metoda | Adres | Opis |
|---|---|---|
| POST | `/api/auth/forgot-password` | `{ email }` → wysyła link (zawsze `{ ok: true }`) |
| POST | `/api/auth/reset-password/check` | `{ token }` → czy link jest ważny (bez zużywania); `400 EXPIRED / INVALID` |
| POST | `/api/auth/reset-password` | `{ token, password }` → nowe hasło, wylogowanie wszystkich urządzeń |

Zmienione: `POST /api/auth/change-password` — zwiększa wersję sesji, odnawia ciasteczko bieżącego urządzenia, wysyła powiadomienie.

### Zmiany w bazie (migracja `20261115121500_password_reset`)

- `users.token_version` (liczba, domyślnie 0) — wersja sesji,
- nowy rodzaj kodu `password_reset` w `auth_codes`.

Wykona się automatycznie przy starcie kontenera `api`; lokalnie `cd api && npx prisma migrate deploy`.

### Zmienione pliki

**api/**
- `prisma/schema.prisma` + nowa migracja,
- `src/lib/auth.js` — wersja w tokenie sesji, `setAuthCookie(res, user)`,
- `src/middleware/auth.js` — odrzucanie sesji o nieaktualnej wersji,
- `src/lib/authCodes.js` — wspólna obsługa linków (`checkLinkToken`, `consumeLinkToken`), link resetu ważny 1 h,
- `src/lib/mailer.js` — szablony „Ustaw nowe hasło” i „Twoje hasło zostało zmienione”,
- `src/routes/auth.js` — reset hasła, zmiana hasła wylogowuje inne urządzenia.

**client/**
- `src/pages/ForgotPassword.jsx` (`/reset-hasla`), `src/pages/ResetPassword.jsx` (`/nowe-haslo`) — **nowe**,
- `src/pages/Login.jsx` — link „Nie pamiętasz hasła?”,
- `src/pages/Account.jsx` — komunikat o wylogowaniu innych urządzeń,
- `src/App.jsx` — nowe trasy, `src/pages/Auth.css` — styl linku.

### Wdrożenie na serwer

```bash
git pull
docker compose up -d --build
```

Bez zmian w `.env` (używa poczty skonfigurowanej w kroku 7).

### Sprawdzone

- **API (curl + Mailpit):** dwie sesje → zmiana hasła na jednej → ta zostaje zalogowana, druga wylogowana, przychodzi powiadomienie; prośba o reset (ta sama odpowiedź dla istniejącego i nieistniejącego konta, limit 60 s bez drugiego e-maila); sprawdzenie linku (dobry / zły); za krótkie hasło nie zużywa linku; reset nie ustawia sesji; ponowne użycie linku odrzucone; stara sesja wylogowana; stare hasło nie działa, nowe działa; wygasły link → `EXPIRED`; konto z 2FA po resecie nadal wymaga kodu; niepotwierdzone konto po resecie może się zalogować.
- **Przeglądarka (Chrome, test automatyczny, konto z włączonym 2FA, dwa „urządzenia”):** urządzenie A zalogowane kodem → na urządzeniu B „Nie pamiętasz hasła?” → link z e-maila → różne hasła = błąd → nowe hasło → „Hasło zmienione” → powiadomienie e-mail → urządzenie A po odświeżeniu wylogowane → ponowne użycie linku = „Link nie działa” → stare hasło odrzucone → nowe hasło + kod 2FA = zalogowany; widok na telefonie (375 px); brak błędów JS.
- **Docker:** obraz `api` się buduje, przy starcie stosuje 3 migracje.

## Poprawka — błąd 502 po wdrożeniu (2026-11-15)

### Objaw

Po wdrożeniu nowej wersji strona (także quizy) zwracała **502 Bad Gateway**.

### Przyczyna (odtworzona lokalnie na pełnym stacku produkcyjnym)

`client/nginx.conf` miał `proxy_pass http://api:4000;`. Nginx ustala wtedy adres IP kontenera `api` **tylko raz, przy starcie**:

1. **Gdy `api` nie działa w chwili startu frontendu** (np. pada przy starcie przez brak zmiennej w `.env`, problem z bazą albo migracją, albo po prostu startuje dłużej) — nginx kończy się błędem `host not found in upstream "api"`, kontener frontendu restartuje się w kółko i Traefik zwraca **502 dla całej strony**. Jedna awaria backendu wyłączała całą witrynę.
2. **Gdy `api` zostanie przebudowany / zrestartowany i dostanie nowy adres IP** — nginx dalej wysyła żądania pod stary adres → 502 dla `/api/*` aż do restartu frontendu.

Sprawdzone: produkcja w chwili diagnozy działała jeszcze na starej wersji (CRA, bez `api`) i odpowiadała poprawnie, więc 502 pojawia się przy przejściu na nową wersję.

### Poprawka (`client/nginx.conf`)

- `resolver 127.0.0.11 valid=10s` (wewnętrzny DNS Dockera) + adres `api` w zmiennej → nginx ustala adres przy żądaniach, nie tylko przy starcie,
- gdy `api` nie odpowiada, `/api/*` zwraca JSON `503 {"error":"Serwer chwilowo niedostępny..."}` — reszta strony działa normalnie.

### Sprawdzone (pełny stack z `docker-compose.yml` uruchomiony lokalnie)

- **przed poprawką:** po usunięciu `api` i restarcie frontendu — `nginx: [emerg] host not found in upstream "api"`, frontend w pętli restartów (odtworzony błąd),
- **po poprawce:**
  - normalne działanie: `/api/health` i adresy z parametrami (`/api/articles?page=1&limit=1`) przechodzą poprawnie,
  - `api` usunięte + restart frontendu: frontend działa, strona główna się ładuje, `/api/*` → 503 z komunikatem,
  - `api` uruchomione ponownie z **innym adresem IP** (stary zajęty celowo): frontend bez restartu po kilku sekundach trafia pod nowy adres → 200.

Dodatkowo w `readme-start.md`: sekcja **„Diagnostyka 502 / 503”** z poleceniami i najczęstszymi przyczynami awarii `api`.

### Wdrożenie

```bash
git pull
docker compose up -d --build
docker compose ps              # wszystkie kontenery "Up"
docker compose logs --tail 30 api
```

Jeśli po wdrożeniu `api` nadal nie startuje, przyczyna będzie w `docker compose logs api` (tabela w `readme-start.md`). Najbardziej prawdopodobne przy przejściu na krok 7–8: brak `SMTP_HOST` / `APP_URL` w `.env` na serwerze.

## Zmiana adresu — strona działa pod maturazinformatyki.it (2026-11-15)

### Co się zmieniło

| Adres | Było | Jest |
|---|---|---|
| `maturazinformatyki.it` | brak (Traefik: 404, niezaufany certyfikat) | **główny adres aplikacji** (certyfikat Let's Encrypt) |
| `www.maturazinformatyki.it` | brak (404) | przekierowanie 301 → `maturazinformatyki.it` |
| `quiz.maturazinformatyki.it` | aplikacja | przekierowanie 301 → `maturazinformatyki.it` |

Przekierowanie zachowuje ścieżkę i parametry, więc stare linki dalej działają, np.
`quiz.maturazinformatyki.it/quiz/sql-podstawy-1` → `maturazinformatyki.it/quiz/sql-podstawy-1`.

DNS był już gotowy — wszystkie trzy nazwy wskazują na serwer `46.248.186.18` (sprawdzone `dig`); na `maturazinformatyki.it` i `www` nie działała wcześniej żadna inna aplikacja.

### Zmienione pliki

- `docker-compose.yml` — reguła Traefika `Host(\`maturazinformatyki.it\`)`; drugi router dla `www.` i `quiz.` z middleware `redirectregex` (301); domyślne `APP_URL=https://maturazinformatyki.it`,
- `.env.example` — `APP_URL=https://maturazinformatyki.it`,
- `readme-start.md` — nowe adresy i informacja o przekierowaniach.

### Wdrożenie

1. W `.env` na serwerze ustaw **`APP_URL=https://maturazinformatyki.it`** (od tego zależą linki w e-mailach: potwierdzenie konta, reset hasła, powiadomienia o kursach).
2. ```bash
   git pull
   docker compose up -d --build
   ```
3. Przy pierwszym wejściu na każdą z nazw Traefik pobierze certyfikat Let's Encrypt (kilkadziesiąt sekund).
4. Sprawdź: `https://maturazinformatyki.it` (strona), `https://maturazinformatyki.it/api/health` (`{"status":"ok"...}`), `https://quiz.maturazinformatyki.it` (przekierowanie).

Uwaga: osoby zalogowane wcześniej na `quiz.maturazinformatyki.it` zalogują się ponownie (ciasteczka przypisane są do adresu strony).

### Sprawdzone

- `docker compose config` — poprawne etykiety; w kontenerze etykieta zamiany ma wartość `https://maturazinformatyki.it/${1}` (podwójne `$$` w pliku jest konieczne w Docker Compose).
- **Prawdziwy Traefik v3.6 uruchomiony lokalnie** z identycznymi regułami (zamiast Let's Encrypt — certyfikat testowy): `maturazinformatyki.it` → 200; `www.maturazinformatyki.it/` i `/artykuly/test` → 301 na `maturazinformatyki.it` z tą samą ścieżką; `quiz.maturazinformatyki.it/`, `/quiz/sql-podstawy-1` i `/kursy?strona=2&x=a%20b` → 301 z zachowaną ścieżką i parametrami; obca domena → 404.
- Poprawione w trakcie: pierwsza wersja reguły nie obsługiwała adresu z numerem portu — reguła akceptuje teraz port, więc działa niezależnie od konfiguracji wejścia Traefika.

## Informacja o plikach cookies (2026-11-15)

### Jakie dane strona zapisuje w przeglądarce (stan faktyczny, sprawdzony w kodzie)

| Nazwa | Rodzaj | Do czego | Kiedy | Jak długo |
|---|---|---|---|---|
| `mzi_token` | ciasteczko (HttpOnly, Secure, SameSite=Lax) | sesja logowania | po zalogowaniu | 7 dni / do wylogowania |
| `mzi_2fa` | ciasteczko (HttpOnly, Secure, SameSite=Lax) | etap między hasłem a kodem 2FA (samo nie loguje) | logowanie z włączonym 2FA | 10 minut |
| `mzi_cookie_notice` | localStorage | zapamiętanie, że zamknięto informację o cookies | po kliknięciu „Rozumiem” | bez limitu |
| `mzi_md_editor_view` | localStorage | widok edytora Markdown | tylko panel admina | bez limitu |

- **Brak** ciasteczek reklamowych, analitycznych i śledzących.
- **Gość, który się nie loguje, nie dostaje żadnych ciasteczek** (sprawdzone w przeglądarce).
- Zasób zewnętrzny: czcionki **Google Fonts** — nie zapisują ciasteczek, ale Google otrzymuje adres IP odwiedzającego (opisane w polityce).

Ponieważ używane są **wyłącznie niezbędne** ciasteczka, nie jest potrzebna zgoda (przycisk „Akceptuję / Odrzucam”) — wystarczy **informacja**. Dlatego jest pasek informacyjny z przyciskiem „Rozumiem”, a nie baner zgody.

### Co dodano

- **Pasek informacyjny** na dole ekranu (każda strona): „Ta strona używa wyłącznie niezbędnych plików cookies — do logowania i bezpieczeństwa konta. Nie używamy ciasteczek reklamowych ani analitycznych.” + link „Więcej informacji” + przycisk **Rozumiem**. Po kliknięciu nie pokazuje się więcej na tym urządzeniu. Nie wyświetla się na stronie samej polityki.
- **Strona „Polityka plików cookies”** (`/polityka-cookies`): czym są cookies, tabela ciasteczek (nazwa, cel, kiedy, jak długo), zabezpieczenia, localStorage, Google Fonts, jak usunąć / zablokować ciasteczka, co się stanie bez nich (strona działa, ale nie da się zalogować).
- **Link „Polityka cookies” w stopce** stron z artykułami, quizami i kursami.

> **Ważne przy zmianach w przyszłości:** jeśli dodasz statystyki (np. Google Analytics), piksel reklamowy albo osadzone filmy z YouTube — takie ciasteczka **wymagają zgody przed zapisaniem**. Wtedy trzeba zamienić pasek informacyjny na baner zgody z możliwością odmowy i zaktualizować stronę `/polityka-cookies`.
>
> Treść polityki to rzetelny opis techniczny, a nie porada prawna. Jeśli strona będzie zbierać więcej danych (np. płatności za kursy), warto dodać pełną politykę prywatności (RODO: administrator danych, cele, podstawy prawne, prawa użytkownika) i skonsultować ją z prawnikiem.

### Zmienione pliki (client/)

- `src/component/CookieNotice.jsx`, `CookieNotice.css` — **nowe**: pasek informacyjny,
- `src/pages/CookiePolicy.jsx`, `CookiePolicy.css` — **nowe**: strona polityki,
- `src/component/Footer.jsx`, `Footer.css` — link do polityki; dolny margines, żeby pasek nie zasłaniał stopki,
- `src/App.jsx` — trasa `/polityka-cookies`, pasek na każdej stronie.

### Sprawdzone (Chrome, test automatyczny)

Pasek widoczny przy pierwszej wizycie; gość nie ma żadnych ciasteczek; „Więcej informacji” → polityka (bez paska, tabela z 2 ciasteczkami); „Rozumiem” chowa pasek i zapisuje `mzi_cookie_notice`; po odświeżeniu pasek się nie pojawia; link w stopce prowadzi do polityki; widok na telefonie (375 px) bez przewijania w bok; brak błędów JS.

---

# Podsumowanie wszystkich zmian

| Krok | Co | Najważniejsze |
|---|---|---|
| 1 | Struktura `client/` + `api/`, PostgreSQL, Docker | Express + Prisma, migracje, `docker-compose.yml` (frontend + api + db), `docker-compose.dev.yml` |
| 2 | Import quizów z JSON do bazy | `npm run import:quizzes`; 15 quizów, 181 pytań |
| — | Create React App → Vite | `npm run dev`, build do `dist/` |
| 3 | Konta i logowanie | bcrypt, JWT w ciasteczku HttpOnly, limity prób, `npm run create-admin`, „Moje konto” |
| 4 | Quizy po zalogowaniu | odpowiedzi sprawdzane na serwerze, poprawne odpowiedzi nie trafiają do przeglądarki, „Moje wyniki”, wyniki uczniów w panelu |
| 5 | Edytor quizów i pytań | panel admina: quizy, pytania z kodem, kolejność, publikacja, ochrona wyników uczniów |
| 6 | Strona główna z artykułami | edytor Markdown z podglądem na żywo, `/quizy` przeniesione z `/` |
| 7 | Kursy, potwierdzanie e-maila, 2FA | lekcje w Markdown, prośby o dostęp i zatwierdzanie (zakładka „Zapisy”), powiadomienia e-mail, link potwierdzający konto, kod logowania na e-mail, Mailpit lokalnie |
| 8 | Reset hasła | link e-mail (1 h), wylogowanie innych urządzeń po zmianie hasła, powiadomienie o zmianie |
| poprawka | Błąd 502 | nginx frontendu nie zależy już od startu `api`, czytelny błąd 503 zamiast awarii całej strony |
| zmiana | Adres strony | `maturazinformatyki.it`; `www.` i `quiz.` przekierowują (301) z zachowaniem ścieżki |
| cookies | Informacja o cookies | pasek „Rozumiem”, strona `/polityka-cookies`, link w stopce |

## Adresy w aplikacji

| Dla wszystkich | Dla zalogowanych | Dla admina (`/admin…`) |
|---|---|---|
| `/` artykuły, `/artykuly/:slug` | `/quiz/:slug` rozwiązywanie | `/admin` wyniki i konta |
| `/quizy` lista quizów | `/moje-wyniki`, `/wyniki/:id` | `/admin/quizy` edytor quizów |
| `/kursy`, `/kursy/:slug` | `/kursy/:slug/lekcje/:id` (po zatwierdzeniu) | `/admin/kursy` kursy i lekcje |
| `/logowanie`, `/rejestracja` | `/konto` hasło, 2FA | `/admin/zapisy` prośby o dostęp |
| `/potwierdz-email`, `/reset-hasla`, `/nowe-haslo` | | `/admin/artykuly` artykuły |
| `/polityka-cookies` | | |

## Lista kontrolna wdrożenia na serwer (z obecnej wersji produkcyjnej)

Na serwerze działa jeszcze stara wersja (CRA). Przy przejściu na nową:

1. **Kopia** obecnego katalogu na serwerze (na wszelki wypadek).
2. `.env` obok `docker-compose.yml` (wzór: `.env.example`):
   - `POSTGRES_USER`, `POSTGRES_PASSWORD`, `POSTGRES_DB`,
   - `JWT_SECRET` (min. 32 znaki, `openssl rand -hex 32`),
   - `APP_URL=https://maturazinformatyki.it`,
   - `SMTP_HOST`, `SMTP_PORT`, `SMTP_SECURE`, `SMTP_USER`, `SMTP_PASS`, `MAIL_FROM` — **wymagane**.
3. `git pull` → `docker compose up -d --build` → `docker compose ps` (wszystko „Up”) → `docker compose logs --tail 50 api`.
4. Jednorazowo: `docker compose exec api node scripts/import-quizzes.js` (quizy) i `docker compose exec api node scripts/create-admin.js` (konto admina).
5. Sprawdzenie: `https://maturazinformatyki.it`, `https://maturazinformatyki.it/api/health`, przekierowanie z `https://quiz.maturazinformatyki.it`, rejestracja testowego konta (czy przychodzi e-mail).
6. Kopia zapasowa bazy — `pg_dump` (polecenie w `readme-start.md`), najlepiej codziennie z crona.

Szczegóły i rozwiązywanie problemów: **`readme-start.md`**.

## Przykładowy kurs „HTML5 od podstaw” (2026-11-15)

### Zawartość

Kurs dla początkujących, **5 rozdziałów** (lekcji) w Markdown — każdy z przykładami kodu, tabelami i **zadaniem do samodzielnego wykonania** na końcu:

| # | Rozdział | Zakres |
|---|---|---|
| 1 | Wprowadzenie i struktura dokumentu HTML5 | czym jest HTML, znaczniki i atrybuty, szkielet `<!DOCTYPE html>` / `head` / `body`, `meta charset` i `viewport`, zagnieżdżanie, komentarze, pierwsza strona, narzędzia deweloperskie (F12) |
| 2 | Tekst, nagłówki, listy i linki | `h1`–`h6`, akapity, `strong` / `em` / `mark` / `sub` / `sup`, listy `ul` / `ol` (zagnieżdżone), linki względne i bezwzględne, `target`, `mailto:`, kotwice `#id` |
| 3 | Obrazy i multimedia | `img` i atrybut `alt`, formaty plików, `figure` / `figcaption`, `audio`, `video` (`poster`, napisy `track`), `iframe` |
| 4 | Tabele i formularze | `table` / `caption` / `thead` / `th` / `td`, `colspan` / `rowspan`, `form`, `label`, nowe typy pól HTML5 (`email`, `number`, `date`, `range`…), walidacja (`required`, `pattern`), `select`, `radio`, `checkbox`, `fieldset` |
| 5 | Semantyczny HTML5 i projekt końcowy | `header`, `nav`, `main`, `article`, `section`, `aside`, `footer`, `time`, encje, lista kontrolna dobrych praktyk, walidator W3C, **projekt: strona-wizytówka z 3 podstron** |

Opis kursu (widoczny dla wszystkich): czego się nauczysz, plan 5 rozdziałów, czego potrzebujesz.

**Quiz kursu „HTML5 od podstaw — sprawdzian”** (`/quiz/html5-sprawdzian`) — 14 pytań z całego kursu, przypisany do kursu (widzą go tylko uczniowie z zatwierdzonym dostępem). Poprawne odpowiedzi rozłożone na pozycje A–D (3–4 na każdą literę), żeby nie dało się zgadywać po pozycji.

Kurs jest **opublikowany**: każdy widzi opis i spis rozdziałów 🔒, a treść lekcji i quiz — po prośbie o dostęp i zatwierdzeniu w zakładce **Zapisy**.

### Pliki kursu

```txt
api/data/courses/html5-od-podstaw/
├── course.json          ← slug, tytuł, lista lekcji (plik + tytuł), plik quizu
├── description.md       ← opis kursu
├── 01-wprowadzenie.md
├── 02-tekst-listy-linki.md
├── 03-obrazy-multimedia.md
├── 04-tabele-formularze.md
├── 05-semantyka.md
└── quiz.json            ← pytania quizu kursu (format jak pliki w api/data/quizzes)
```

### Skrypt importu kursów: `api/scripts/import-course.js`

Wczytuje kurs z plików do bazy (opis, lekcje, quiz przypisany do kursu). Działa dla każdego kursu w `api/data/courses/` — kolejne kursy można przygotować w tym samym formacie.

```bash
# lokalnie
cd api
npm run import:course -- html5-od-podstaw            # opublikowany
npm run import:course -- html5-od-podstaw --draft    # jako szkic (niewidoczny dla uczniów)
npm run import:course                                # pokazuje dostępne kursy

# na serwerze (pliki są w obrazie api)
docker compose exec api node scripts/import-course.js html5-od-podstaw
```

- można uruchamiać wielokrotnie — kurs i quiz dopasowywane po `slug`, bez duplikatów,
- **lekcje są zastępowane treścią z plików** — poprawki lekcji zrobione w panelu admina zostałyby nadpisane (po imporcie najlepiej edytować kurs już tylko w panelu),
- zapisy uczniów na kurs nie są ruszane,
- pytania quizu, który ma już wyniki uczniów, nie są nadpisywane (chyba że z `--force`).

### Zmienione pliki

- `api/data/courses/html5-od-podstaw/*` — **nowe**: treść kursu i quizu,
- `api/scripts/import-course.js` — **nowy** skrypt,
- `api/package.json` — skrypt `import:course`.

Bez zmian w bazie i w kodzie aplikacji.

### Sprawdzone

- import: kurs opublikowany, 5 lekcji, quiz z 14 pytaniami przypisany do kursu; drugi import bez duplikatów; ochrona pytań quizu z wynikami działa (komunikat „pytania NIE zmienione”),
- przeglądarka (Chrome): kurs na liście `/kursy` („5 lekcji · 1 quiz”); gość widzi opis i 5 zablokowanych rozdziałów; po zalogowaniu z dostępem — wszystkie 5 rozdziałów otwiera się kolejno przyciskiem „Następna →”, Markdown wyświetla się poprawnie (nagłówki, bloki kodu HTML, tabele, lista kontrolna z polami wyboru w rozdz. 5, brak nieprzetworzonych `**` / `##`); quiz się uruchamia; brak błędów JS,
- poprawione w trakcie: podwójna numeracja w spisie („1. Rozdział 1. …”) — tytuły lekcji bez numeru, numer dodaje strona,
- obraz Dockera `api` zawiera pliki kursu.

### Wdrożenie na serwer

```bash
git pull
docker compose up -d --build
docker compose exec api node scripts/import-course.js html5-od-podstaw
```

## Kurs „HTML5 — część 2: poziom zaawansowany” (2026-11-15)

Druga część kursu HTML5 — kontynuacja części 1, prowadząca do **poziomu zaawansowanego**. Podzielona na **10 części**, każda z przykładami kodu, tabelami i **zadaniem praktycznym**; kurs kończy **projekt końcowy** i **quiz**.

### Plan części 2

| # | Część | Zakres |
|---|---|---|
| 1 | Zaawansowany head: SEO, Open Graph i ikony | `title` i `description` pod SEO, `canonical`, `robots`, Open Graph i karty X, favicony, `manifest`, `theme-color`, `preconnect` / `preload` / `prefetch`, kolejność w `<head>` |
| 2 | Dostępność: WCAG i ARIA w praktyce | WCAG 2.1 AA i Europejski Akt o Dostępności, natywne elementy zamiast `div`, landmarki, link „Przejdź do treści”, `aria-label` / `labelledby` / `describedby`, stany (`aria-expanded`, `aria-pressed`, `aria-current`), `aria-live`, `tabindex`, testowanie (klawiatura, Lighthouse, NVDA / VoiceOver, kontrast) |
| 3 | Obrazy responsywne: srcset, sizes i picture | `srcset` z `x` i `w`, `sizes`, `<picture>` z AVIF / WebP, *art direction*, `loading`, `fetchpriority`, `decoding`, CLS i LCP |
| 4 | Zaawansowane formularze i walidacja | `datalist`, `autocomplete` (w tym `one-time-code`), `inputmode`, `enterkeyhint`, `output` / `progress` / `meter`, atrybut `form`, `formaction`, `formnovalidate`, **Constraint Validation API** (`checkValidity`, `validity`, `setCustomValidity`) |
| 5 | Elementy interaktywne: details, dialog i popover | `<details>` / `<summary>` i akordeon (`name`), `<dialog>` + `showModal()` + `method="dialog"`, atrybut `popover` (bez JavaScriptu), `inert`, `contenteditable` |
| 6 | Grafika w HTML5: SVG i Canvas | SVG inline, kształty i `path`, `viewBox`, `<symbol>` / `<use>` (zestaw ikon), dostępność SVG; Canvas 2D (wykres słupkowy), `requestAnimationFrame`, Retina; porównanie SVG vs Canvas |
| 7 | Zaawansowane multimedia: napisy WebVTT i Media API | format WebVTT, `<track>` (`subtitles`, `captions`, `chapters`), `preload`, własny odtwarzacz z Media API, zasady autoodtwarzania, pełny ekran i obraz w obrazie |
| 8 | Web Components: template, slot i Shadow DOM | `<template>` i `cloneNode`, Custom Elements i cykl życia, `observedAttributes`, Shadow DOM, `<slot>`, `:host`, `::slotted` |
| 9 | API przeglądarki: data-*, Web Storage i drag & drop | `data-*` i `dataset`, `localStorage` / `sessionStorage` vs ciasteczka (bezpieczeństwo tokenów), zdarzenie `storage`, Drag and Drop (także pliki) z alternatywą klawiaturową, przegląd innych API |
| 10 | Wydajność, dane strukturalne i projekt końcowy | `defer` / `async` / `type="module"`, Core Web Vitals (LCP, CLS, INP), JSON-LD i schema.org, okruszki, lista kontrolna profesjonalnej strony, **projekt końcowy „Dzień Informatyki”** łączący wszystkie 10 części |

**Quiz kursu „HTML5 — część 2: sprawdzian (poziom zaawansowany)”** (`/quiz/html5-zaawansowany-sprawdzian`) — **24 pytania** z całej części 2, przypisany do kursu; poprawne odpowiedzi rozłożone na pozycje A–D (A: 7, B: 5, C: 6, D: 6).

### Połączenie z częścią 1

- część 1 ma teraz nazwę **„HTML5 — część 1: od podstaw”** (adres bez zmian: `/kursy/html5-od-podstaw`), a jej quiz — „HTML5 — część 1: sprawdzian (od podstaw)”,
- w opisie części 1 dodana sekcja „Co dalej?” z linkiem do części 2, a na końcu ostatniego rozdziału — zachęta do przejścia do części 2,
- opis części 2 zaczyna się od linku do części 1 i podaje ją jako wymaganie,
- na liście `/kursy` obie części wyświetlają się po kolei (część 1, potem część 2).

Każda część kursu ma **osobny dostęp** — uczeń prosi o dostęp do części 2 niezależnie od części 1 (zatwierdzasz w zakładce **Zapisy**).

### Pliki

```txt
api/data/courses/html5-zaawansowany/
├── course.json, description.md, quiz.json
├── 01-head-seo.md             ├── 06-svg-canvas.md
├── 02-dostepnosc.md           ├── 07-multimedia-api.md
├── 03-obrazy-responsywne.md   ├── 08-web-components.md
├── 04-formularze-zaawansowane.md ├── 09-api-przegladarki.md
└── 05-elementy-interaktywne.md   └── 10-wydajnosc-projekt.md
```

Zmienione w części 1: `course.json` (nazwa), `description.md` (sekcja „Co dalej?”), `05-semantyka.md` (link do części 2), `quiz.json` (nazwa quizu).

### Sprawdzone

- import obu części: część 1 — 5 lekcji, quiz 14 pytań; część 2 — 10 lekcji, quiz 24 pytania, obie opublikowane,
- przeglądarka (Chrome): na `/kursy` obie części po kolei („5 lekcji · 1 quiz”, „10 lekcji · 1 quiz”); link z części 1 prowadzi do części 2 i odwrotnie; gość widzi 10 zablokowanych części; z dostępem wszystkie 10 części otwiera się kolejno „Następna →”, w żadnej nie ma nieprzetworzonego Markdown (bloki kodu HTML / JS / WebVTT, tabele i listy kontrolne wyświetlają się poprawnie); quiz części 2 startuje (24 pytania); brak błędów JS,
- obraz Dockera `api` zawiera oba kursy.

### Wdrożenie na serwer

```bash
git pull
docker compose up -d --build
docker compose exec api node scripts/import-course.js html5-od-podstaw
docker compose exec api node scripts/import-course.js html5-zaawansowany
```

## Kurs „CSS od podstaw do layoutu” (2026-11-15)

Kurs CSS dla osób znających podstawy HTML (część 1 kursu HTML5), podzielony na **9 lekcji** — od składni i selektorów po nowoczesne, responsywne układy we Flexboxie i Gridzie. Każda lekcja ma przykłady kodu, tabele i **zadanie**; kurs kończy **projekt końcowy** (ostylowanie strony-wizytówki z kursu HTML5) i **quiz**.

### Lekcje

| # | Lekcja | Zakres |
|---|---|---|
| 1 | Wprowadzenie: składnia, selektory i kaskada | sposoby podłączenia CSS, składnia reguły, selektory elementu / klasy / id / potomka, kaskada, **specyficzność**, dziedziczenie, F12 |
| 2 | Kolory, jednostki i typografia | HEX / RGB / **HSL**, kontrast WCAG, `px` / `%` / `em` / **`rem`** / `vw` / `dvh` / `ch`, `calc()` / `min()` / **`clamp()`**, czcionki, Google Fonts, `@font-face` |
| 3 | Model pudełkowy: margin, padding, border | content / padding / border / margin, **`box-sizing: border-box`**, skróty 1–4 wartości, wyśrodkowanie, łączenie marginesów, `display` (block / inline / inline-block), `overflow`, cienie |
| 4 | Zaawansowane selektory, pseudoklasy i pseudoelementy | kombinatory, selektory atrybutów, `:hover` / **`:focus-visible`** / `:nth-child`, `:is()` / `:where()` / **`:has()`**, `::before` / `::after` / `::marker` / `::selection` |
| 5 | Flexbox — układ w jednym wymiarze | oś główna i poprzeczna, `justify-content`, `align-items`, `gap`, `flex-wrap`, `flex: grow shrink basis`, `margin-left: auto`, stopka na dole strony |
| 6 | CSS Grid — układ w dwóch wymiarach | Flexbox vs Grid, `fr`, `repeat()`, **`auto-fit` + `minmax()`** (galeria bez media queries), linie, **`grid-template-areas`**, `place-items`, `subgrid` |
| 7 | Responsywność: media queries i mobile-first | `viewport`, media queries (także składnia zakresów), **mobile-first**, płynne wartości, obrazy (`aspect-ratio`, `object-fit`), **container queries**, `prefers-*`, arkusz do druku |
| 8 | Pozycjonowanie, transformacje i animacje | `position` (relative / absolute / fixed / **sticky**), `z-index`, `transform`, `transition`, `@keyframes`, wydajne animacje, **`prefers-reduced-motion`**, płynne przewijanie |
| 9 | Zmienne CSS, tryb ciemny i projekt końcowy | **custom properties**, tryb ciemny (`prefers-color-scheme` + przełącznik z `localStorage`), organizacja arkusza, BEM, natywne zagnieżdżanie, **projekt końcowy** łączący wszystkie 9 lekcji |

**Quiz „CSS od podstaw do layoutu — sprawdzian”** (`/quiz/css-sprawdzian`) — **24 pytania**, przypisany do kursu; poprawne odpowiedzi rozłożone równo: po 6 na A, B, C i D.

### Powiązania z kursami HTML5

- opis kursu CSS podaje jako wymaganie [HTML5 — część 1](/kursy/html5-od-podstaw) i linkuje do niej,
- **HTML5 część 1**: w sekcji „Co dalej?” i na końcu ostatniego rozdziału — link do kursu CSS (z informacją, że w projekcie CSS stylizuje się stronę-wizytówkę z HTML5),
- **HTML5 część 2**: na końcu ostatniej części — link do kursu CSS,
- kurs CSS kończy się linkiem do HTML5 części 2 dla chętnych.

Na liście `/kursy`: HTML5 cz. 1 → HTML5 cz. 2 → CSS (kolejność dodania). Dostęp do kursu CSS przyznaje się osobno w zakładce **Zapisy**.

### Pliki

```txt
api/data/courses/css-od-podstaw/
├── course.json, description.md, quiz.json
├── 01-wprowadzenie.md                 ├── 06-grid.md
├── 02-kolory-jednostki-typografia.md  ├── 07-responsywnosc.md
├── 03-model-pudelkowy.md              ├── 08-pozycjonowanie-animacje.md
├── 04-selektory-pseudoklasy.md        └── 09-zmienne-projekt.md
└── 05-flexbox.md
```

Zmienione w kursach HTML5: `html5-od-podstaw/description.md`, `html5-od-podstaw/05-semantyka.md`, `html5-zaawansowany/10-wydajnosc-projekt.md` (linki do kursu CSS).

### Sprawdzone

- import: kurs CSS — 9 lekcji, quiz 24 pytania, opublikowany; kursy HTML5 wczytane ponownie z linkami (bez duplikatów),
- przeglądarka (Chrome): na `/kursy` trzy kursy; link z HTML5 cz. 1 prowadzi do kursu CSS; gość widzi 9 zablokowanych lekcji; z dostępem wszystkie 9 lekcji otwiera się kolejno, bez nieprzetworzonego Markdown (bloki kodu CSS / HTML / JS i tabele wyświetlają się poprawnie); quiz startuje (24 pytania); lekcja na telefonie (375 px) bez przewijania w bok; brak błędów JS,
- obraz Dockera `api` zawiera wszystkie trzy kursy.

### Wdrożenie na serwer

```bash
git pull
docker compose up -d --build
docker compose exec api node scripts/import-course.js html5-od-podstaw
docker compose exec api node scripts/import-course.js html5-zaawansowany
docker compose exec api node scripts/import-course.js css-od-podstaw
```

Kolejność importu ustala kolejność na liście `/kursy` (dla nowych kursów).

---

## Kurs „JavaScript od podstaw do aplikacji” (20 lekcji)

Czwarty kurs z plików — `api/data/courses/javascript-od-podstaw/` (slug `javascript-od-podstaw`), importowany tym samym skryptem co kursy HTML5 i CSS. Kod aplikacji nie był zmieniany.

### Program

**Część I — język**

| # | Lekcja | Najważniejsze tematy |
|---|---|---|
| 1 | Wprowadzenie: pierwszy skrypt i konsola | `<script defer>`, konsola F12, składnia, `"use strict"` |
| 2 | Zmienne i typy danych | `let`/`const`, 7 typów prostych, `typeof`, szablony `${}`, konwersja |
| 3 | Operatory i wyrażenia | arytmetyka, `%`, `===` vs `==`, `&&`/`\|\|`, `??`, `?.`, `? :` |
| 4 | Instrukcje warunkowe | `if`/`else`, truthy/falsy, wczesny `return`, `switch` |
| 5 | Pętle | `for`, `while`, `do…while`, `for…of`, `for…in`, `break`/`continue` |
| 6 | Funkcje | deklaracje, funkcje strzałkowe, parametry domyślne, `...reszta`, callbacki, rekurencja |
| 7 | Tablice — podstawy | `push`/`pop`/`splice`/`slice`, `includes`, referencje, kopia przez spread |
| 8 | Metody tablic | `forEach`, `map`, `filter`, `find`, `some`/`every`, `reduce`, `sort`/`toSorted` |
| 9 | Obiekty | metody, `Object.entries`, destrukturyzacja, spread, `structuredClone` |
| 10 | Teksty, liczby, Math i daty | metody stringów, `toFixed`, `Intl.NumberFormat`, losowanie, tasowanie, `Date` |

**Część II — JavaScript w przeglądarce**

| # | Lekcja | Najważniejsze tematy |
|---|---|---|
| 11 | DOM | `querySelector(All)`, `textContent` vs `innerHTML` (XSS), `classList`, `createElement`, `<template>` |
| 12 | Zdarzenia | `addEventListener`, obiekt zdarzenia, `preventDefault`, delegacja, dostępność |
| 13 | Formularze | `FormData`, Constraint Validation API, własne komunikaty z `aria-invalid`, `setCustomValidity` |

**Część III — JavaScript zaawansowany**

| # | Lekcja | Najważniejsze tematy |
|---|---|---|
| 14 | Zakres, hoisting, domknięcia i `this` | zakres leksykalny, `var` vs `let`, TDZ, closures, `debounce`, `bind` |
| 15 | Klasy | `constructor`, gettery/settery, pola prywatne `#`, `static`, `extends`/`super`, polimorfizm |
| 16 | Błędy i debugowanie | typy błędów, `try/catch/finally`, `throw`, własne klasy błędów, breakpointy |
| 17 | Asynchroniczność | timery, pętla zdarzeń, `Promise`, `async`/`await`, `Promise.all/race` |
| 18 | Fetch API i JSON | `JSON.parse/stringify`, GET/POST, `response.ok`, kody HTTP, stany ładowania, CORS |
| 19 | Moduły ES i `localStorage` | `import`/`export`, dynamiczny import, Web Storage, bezpieczny moduł magazynu |
| 20 | Projekt końcowy: „Lista zadań” | kompletny działający szkielet aplikacji (4 moduły) + 8 zadań rozbudowy |

Każda lekcja kończy się sekcją **Zadanie**. Przykłady nawiązują do tej strony (quiz, logowanie, sesja w ciasteczku `HttpOnly`, polityka cookies, leniwe ładowanie panelu admina).

### Quiz `javascript-sprawdzian`

32 pytania (najwięcej ze wszystkich kursów), w większości „co wypisze kod?”: konwersje typów, `||` vs `??`, `switch` bez `break`, `slice`, referencje tablic, `filter/map/reduce`, `sort()` bez komparatora, destrukturyzacja, spread, miesiące w `Date` od zera, XSS, `querySelector` → `null`, `addEventListener(fn())`, delegacja, domknięcia, `var` w pętli z `setTimeout`, kolejność w pętli zdarzeń, `fetch` przy 404, `localStorage` + JSON, `#pola`, `super`, `async`. Poprawne odpowiedzi rozłożone równo: po 8 na A, B, C i D.

### Powiązania z innymi kursami

- opis kursu JS wymaga HTML5 cz. 1 i poleca kurs CSS (linki),
- **HTML5 część 1** (`description.md`): po linku do CSS — link do kursu JS,
- **HTML5 część 2** (`10-wydajnosc-projekt.md`): „Kolejne kroki” — pogrubione słowo „JavaScript” zamienione na link do kursu,
- **CSS** (`09-zmienne-projekt.md`): na końcu — link do kursu JS jako następnego kroku,
- lekcja 20 JS odsyła do kursu CSS przy stylowaniu projektu.

### Pliki

```txt
api/data/courses/javascript-od-podstaw/
├── course.json, description.md, quiz.json
├── 01-wprowadzenie.md          ├── 11-dom.md
├── 02-zmienne-typy.md          ├── 12-zdarzenia.md
├── 03-operatory.md             ├── 13-formularze.md
├── 04-warunki.md               ├── 14-zakres-domkniecia.md
├── 05-petle.md                 ├── 15-klasy.md
├── 06-funkcje.md               ├── 16-bledy-debugowanie.md
├── 07-tablice.md               ├── 17-asynchronicznosc.md
├── 08-metody-tablic.md         ├── 18-fetch-json.md
├── 09-obiekty.md               ├── 19-moduly-localstorage.md
└── 10-teksty-liczby-daty.md    └── 20-projekt.md
```

### Sprawdzone

- **poprawność merytoryczna**: wszystkie pytania quizu z kodem uruchomione w Node.js — wyniki zgodne z kluczem; przykłady z lekcji (wyniki w komentarzach, formatowanie `pl-PL` liczb, kwot i dat, sortowanie z `localeCompare`, grupowanie `reduce`) sprawdzone tak samo; klasa `ListaZadan` i odmiana „1 zadanie / 2 zadania / 5 zadań” z projektu końcowego oraz przykład quizu z klasami z lekcji 15 przetestowane,
- import: 20 lekcji, quiz 32 pytania, kurs opublikowany; HTML5 cz. 1, cz. 2 i CSS wczytane ponownie z nowymi linkami,
- przeglądarka (Chrome): na `/kursy` cztery kursy; link z opisu HTML5 cz. 1 prowadzi do kursu JS; gość widzi 20 zablokowanych lekcji; z dostępem wszystkie 20 lekcji otwiera się kolejno („Następna →”), bez nieprzetworzonego Markdown (bloki kodu, tabele, `\|\|` w tabeli operatorów logicznych); quiz startuje (32 pytania); lekcja 20 na telefonie (375 px) bez przewijania w bok; brak błędów JS,
- tymczasowe konto testowe usunięte.

### Wdrożenie na serwer

```bash
git pull
docker compose up -d --build
docker compose exec api node scripts/import-course.js html5-od-podstaw
docker compose exec api node scripts/import-course.js html5-zaawansowany
docker compose exec api node scripts/import-course.js css-od-podstaw
docker compose exec api node scripts/import-course.js javascript-od-podstaw
```

Kursy HTML5 i CSS trzeba wczytać ponownie, żeby pojawiły się w nich linki do kursu JavaScript. Dostęp do kursu JS przyznaje się osobno w zakładce **Zapisy**.

---

## Opcja quizu: „Zakończ quiz, gdy uczeń opuści kartę”

Nowa opcja w edytorze quizu (panel → Quizy → nowy lub istniejący quiz). Gdy jest włączona, a uczeń w trakcie rozwiązywania opuści kartę z quizem, podejście **kończy się natychmiast** z odpowiedziami udzielonymi do tej chwili. Pytania bez odpowiedzi są niezaliczone, a dalsze odpowiadanie jest zablokowane przez serwer. Domyślnie opcja jest **wyłączona** — istniejące quizy działają jak dotąd.

### Co kończy podejście

| Sytuacja | Wykrywanie |
|---|---|
| przejście na inną kartę, do innego programu (gdy okno quizu zostanie zakryte), zminimalizowanie okna, zablokowanie ekranu telefonu, przełączenie aplikacji na telefonie | zdarzenie `visibilitychange` → `document.visibilityState === "hidden"` |
| zamknięcie karty, odświeżenie strony | j.w. (przeglądarka ukrywa stronę przed jej zamknięciem); zapytanie z `fetch(..., { keepalive: true })` dochodzi do serwera mimo zamykania |
| wyjście z quizu w obrębie strony (link w menu, przycisk „wstecz”) | sprzątanie efektu Reacta przy odmontowaniu komponentu `Quiz` w trakcie aktywnego podejścia |

**Nie** jest wykrywane: drugie okno obok quizu na tym samym ekranie (karta quizu cały czas widoczna) ani drugie urządzenie. Celowo nie użyto zdarzenia `blur` okna — fałszywie kończyłoby quiz np. po kliknięciu paska adresu czy okna powiadomień systemu.

> To zabezpieczenie po stronie przeglądarki — zniechęca i rejestruje opuszczenie karty, ale zdeterminowany uczeń z narzędziami programisty może zablokować wysłanie zakończenia. Serwer gwarantuje natomiast, że **po zakończeniu** podejścia żadna odpowiedź nie zostanie już przyjęta.

### Jak to działa

1. Ekran startowy quizu z włączoną opcją pokazuje ostrzeżenie (czerwony punkt instrukcji): „Nie opuszczaj tej karty! …”.
2. W trakcie podejścia `Quiz.jsx` nasłuchuje `visibilitychange`. Przy ukryciu karty: od razu blokuje ekran („Quiz został zakończony, ponieważ opuściłeś kartę z quizem. Zapisywanie wyniku...”) i wysyła `POST /api/attempts/:id/finish { reason: "left_page" }` z `keepalive`.
3. Serwer zapisuje `finishedAt` i `endReason = "left_page"` — **tylko jeśli quiz ma włączoną opcję** (inaczej `reason` jest ignorowany). Kolejne `POST /api/attempts/:id/answer` dostają `409 „Ten quiz został już zakończony.”`. Ponowne `/finish` nie zmienia daty ani powodu.
4. Uczeń widzi wynik z czerwonym komunikatem; przy błędzie sieci — przycisk „Zapisz wynik ponownie”.
5. Wynik jest oznaczony plakietką **„opuszczono kartę”** w „Moich wynikach” i w panelu admina (Wyniki i konta), a w szczegółach podejścia (`/wyniki/:id`) — komunikatem nad pytaniami.
6. Normalne ukończenie quizu z włączoną opcją działa jak dotąd (`endReason = null`); po zakończeniu ukrycie karty niczego nie zmienia.

„Rozwiąż ponownie” pozostaje dostępne — każde podejście jest zapisywane osobno, więc nauczyciel widzi wszystkie, łącznie z przerwanymi.

### Zmiany w bazie

Migracja `api/prisma/migrations/20261116120000_quiz_lock_on_leave`:

- `quizzes.lock_on_leave BOOLEAN NOT NULL DEFAULT false` (`Quiz.lockOnLeave`),
- `quiz_attempts.end_reason VARCHAR(30)` (`QuizAttempt.endReason`: `NULL` — zakończone normalnie, `"left_page"` — opuszczenie karty).

Na serwerze migracja wykona się sama przy starcie kontenera `api` (`prisma migrate deploy` w `CMD`).

### Zmienione pliki

| Plik | Zmiana |
|---|---|
| `api/prisma/schema.prisma` + migracja | pola `lockOnLeave` i `endReason` |
| `api/src/lib/quizValidate.js` | pole `lockOnLeave` w tworzeniu i edycji quizu |
| `api/src/routes/adminQuizzes.js` | `lockOnLeave` w danych quizu dla edytora |
| `api/src/routes/quizzes.js` | `lockOnLeave` w metadanych quizu (ekran startowy) |
| `api/src/routes/attempts.js` | `/finish` przyjmuje `reason: "left_page"`; `endReason` w liście i szczegółach wyników |
| `api/src/routes/admin.js` | `endReason` w wynikach wszystkich uczniów |
| `api/scripts/import-course.js` | opcjonalne `"lockOnLeave": true/false` w `quiz.json` kursu (bez pola — zostaje ustawienie z panelu) |
| `client/src/api.js` | opcja `keepalive` |
| `client/src/component/Quiz.jsx` | wykrywanie opuszczenia karty, ekran blokady, komunikat przy wyniku |
| `client/src/component/StartScreen.jsx` + `.css` | ostrzeżenie w instrukcji |
| `client/src/component/Quiz.css` | styl komunikatu `.maturazinformatyki-quiz-left` |
| `client/src/pages/admin/AdminQuizEdit.jsx` + `Admin.css` | checkbox „Zakończ quiz, gdy uczeń opuści kartę” z opisem (`.mzi-admin-hint`) |
| `client/src/pages/MyResults.jsx`, `AdminHome.jsx`, `AttemptDetails.jsx`, `Results.css` | plakietka / komunikat „opuszczono kartę” |

### Sprawdzone (Chrome, Playwright, tymczasowy quiz z 3 pytaniami i tymczasowe konto — usunięte po teście)

- edytor: opcja domyślnie wyłączona, po zaznaczeniu i zapisie zostaje po odświeżeniu,
- ekran startowy pokazuje ostrzeżenie tylko przy włączonej opcji,
- odpowiedź na 1 pytanie → ukrycie karty → ekran wyniku `1 / 3 (33%)` z komunikatem, pytania znikają; serwer: `endReason = left_page`, kolejna odpowiedź → `409`, ponowne `/finish` nie zmienia powodu,
- wyjście z quizu linkiem „Quizy” w menu → podejście zakończone z `left_page`,
- normalne ukończenie z włączoną opcją → `3 / 3`, bez komunikatu; późniejsze ukrycie karty nic nie zmienia,
- quiz bez opcji: brak ostrzeżenia, ukrycie karty nie przerywa quizu, `/finish` z `reason` → `endReason = null`,
- plakietki w „Moich wynikach” i panelu admina, komunikat w szczegółach; telefon 375 px; brak błędów JS; `vite build` bez błędów.

Ukrycie karty w teście było wywołane zdarzeniem `visibilitychange` — przeglądarka sterowana przez Playwright zawsze zgłasza kartę jako widoczną, więc prawdziwe przełączenie karty warto sprawdzić ręcznie: zalogować się jako uczeń, rozpocząć quiz z włączoną opcją, odpowiedzieć na pytanie i przejść na inną kartę (Ctrl+Tab) — po powrocie widać wynik z komunikatem.

---

## Opcja „Zakończ quiz…” — także gdy okno przeglądarki przestanie być aktywne

Rozszerzenie opcji `lockOnLeave` z poprzedniej sekcji. Podejście kończy się teraz również wtedy, gdy **okno przeglądarki straci fokus**, nawet jeśli karta z quizem nadal jest widoczna: kliknięcie w inny program (np. okno obok na tym samym ekranie), w pasek adresu, w narzędzia programisty (F12), wywołanie okna systemowego. Opcja w edytorze nazywa się teraz **„Zakończ quiz, gdy uczeń opuści kartę lub okno przeglądarki przestanie być aktywne”** (to ta sama opcja — quizy, które ją miały, od razu działają po nowemu).

### Działanie

- `Quiz.jsx` nasłuchuje dodatkowo zdarzenia `blur` na `window`; jeśli okno jest nieaktywne już w chwili startu podejścia (`!document.hasFocus()`), quiz kończy się od razu.
- Przy przełączeniu karty przeglądarka wysyła najpierw `blur`, a zaraz potem `visibilitychange`. Dlatego po `blur` kod czeka 150 ms: jeśli karta w tym czasie została ukryta, zapisuje powód **`left_page`**, w przeciwnym razie **`window_blur`**. Samo ukrycie karty kończy quiz natychmiast.
- Serwer (`POST /api/attempts/:id/finish`) przyjmuje `reason` z zestawu `left_page` / `window_blur` — nadal tylko dla quizów z włączoną opcją.
- Nowy plik `client/src/component/endReason.js` — teksty powodów, wspólne dla ekranu wyniku, „Moich wyników”, szczegółów i panelu admina:

| `endReason` | Plakietka | Komunikat |
|---|---|---|
| `left_page` | „opuszczono kartę” | „…ponieważ opuszczono kartę z quizem” |
| `window_blur` | „okno nieaktywne” | „…ponieważ okno przeglądarki przestało być aktywne” |

- Ostrzeżenie na ekranie startowym: „Nie opuszczaj tej karty i tego okna! Przejście na inną kartę, kliknięcie w inny program lub poza stronę (np. w pasek adresu), zminimalizowanie okna albo wyjście ze strony quizu natychmiast go zakończy…”.

Bez zmian w bazie danych (kolumna `end_reason` mieści nową wartość).

> Uwaga dla nauczyciela: ta opcja jest bardzo restrykcyjna — także przypadkowe kliknięcie poza stronę (pasek adresu, powiadomienie systemowe, drugi monitor) kończy quiz. Warto uprzedzić uczniów przed sprawdzianem.

### Zmienione pliki

`api/src/routes/attempts.js`, `client/src/component/Quiz.jsx`, `client/src/component/StartScreen.jsx`, `client/src/component/endReason.js` (nowy), `client/src/pages/MyResults.jsx`, `client/src/pages/AdminHome.jsx`, `client/src/pages/AttemptDetails.jsx`, `client/src/pages/admin/AdminQuizEdit.jsx`.

### Sprawdzone (Chrome, Playwright; tymczasowy quiz i konto usunięte)

- utrata fokusu okna przy widocznej karcie → wynik `1 / 3`, komunikat „okno przeglądarki przestało być aktywne”, `endReason = window_blur`,
- `blur` i zaraz potem ukrycie karty (przełączenie karty) → `endReason = left_page`,
- wszystkie wcześniejsze scenariusze bez zmian: ukrycie karty, wyjście linkiem z menu, blokada odpowiedzi (409), normalne ukończenie, quiz bez opcji niereagujący na zmiany fokusu, plakietki w wynikach i panelu admina, brak błędów JS, `vite build` bez błędów.

Zdarzenia `blur` / `visibilitychange` były w teście wywoływane programowo (przeglądarka sterowana przez Playwright zawsze ma fokus) — warto raz sprawdzić ręcznie: rozpocząć quiz z opcją i kliknąć w pasek adresu albo w inny program.

---

## Kurs „Python od podstaw do matury” (20 lekcji)

Piąty kurs z plików — `api/data/courses/python-od-podstaw/` (slug `python-od-podstaw`), importowany tym samym skryptem co pozostałe kursy. Kod aplikacji nie był zmieniany. Kurs jest nastawiony na **maturę z informatyki**: dane z plików tekstowych, zapis odpowiedzi do `wyniki….txt`, klasyczne algorytmy i złożoność.

### Program

**Część I — podstawy języka**

| # | Lekcja | Najważniejsze tematy |
|---|---|---|
| 1 | Wprowadzenie | instalacja, IDLE / VS Code / PyCharm, `print`, `input`, wcięcia, czytanie komunikatów o błędach |
| 2 | Zmienne, typy danych i wczytywanie | `int`/`float`/`str`/`bool`/`None`, f-stringi, konwersje, `map(int, input().split())`, wartości fałszywe |
| 3 | Operatory i wyrażenia | `/` vs `//`, `%`, `**`, ostatnia cyfra, `0.1 + 0.2`, `round` bankierski, łańcuchy porównań, `and`/`or`/`not`, `in`, `is` |
| 4 | Instrukcje warunkowe | `if`/`elif`/`else`, wyrażenie warunkowe, `pass`, `match`/`case`, równanie kwadratowe |
| 5 | Pętle | `for` + `range`, `enumerate`, `while`, `break`/`continue`, `else` w pętli, schematy licznika i maksimum |
| 6 | Funkcje | `return` vs `print`, wiele wartości, parametry domyślne i nazwane, `*args`, pułapka `x=[]`, zasięg, docstring, `main()` |

**Część II — struktury danych i pliki**

| # | Lekcja | Najważniejsze tematy |
|---|---|---|
| 7 | Napisy | indeksy, wycinki `[::-1]`, niezmienność, metody, `ord`/`chr`, porównywanie, formatowanie f-stringów |
| 8 | Listy | `append`/`insert`/`pop`/`remove`, `sort` vs `sorted`, `key`, referencje i kopie, listy 2D (pułapka `[[0]*4]*3`) |
| 9 | Krotki, zbiory i słowniki | działania na zbiorach, `get`, `items`, zliczanie, grupowanie, sortowanie słownika |
| 10 | Wyrażenia listowe | list/dict/set comprehensions, generatory, `lambda`, sortowanie po kilku kluczach, `zip`, `any`/`all`, `*reszta` |
| 11 | Pliki tekstowe | `with open`, tryby `r`/`w`/`a`, `strip()`, `split`, zapis odpowiedzi w stylu maturalnym (`print(..., file=f)`) |
| 12 | Wyjątki i debugowanie | tabela wyjątków, `try`/`except`/`else`/`finally`, `raise`, własne wyjątki, `assert`, debugger |
| 13 | Moduły | `math`, `random`, `Counter`, `defaultdict`, `datetime`, `itertools`, własne moduły, `if __name__ == "__main__"`, `pip` |
| 14 | Klasy | `__init__`, `self`, metody specjalne (klasa `Ulamek`), `@property`, dziedziczenie, `super()`, polimorfizm, `@dataclass` |

**Część III — algorytmy i matura**

| # | Lekcja | Najważniejsze tematy |
|---|---|---|
| 15 | Rekurencja | przypadek bazowy, Fibonacci i `lru_cache`, szybkie potęgowanie, wieże Hanoi, śledzenie wywołań „na kartce” |
| 16 | Algorytmy na liczbach | cyfry, dzielniki do √n, liczby doskonałe, pierwszość, sito Eratostenesa, rozkład na czynniki, Euklides, systemy liczbowe, Horner |
| 17 | Algorytmy na napisach | palindromy, anagramy, szyfr Cezara, szyfr przestawieniowy, wyszukiwanie wzorca, najdłuższy fragment, RLE |
| 18 | Sortowanie i wyszukiwanie | złożoność O(…), bąbelkowe, wybieranie, wstawianie, scalanie, zliczanie, wyszukiwanie binarne, `bisect` |
| 19 | Zadania maturalne krok po kroku | plan pracy, szablon rozwiązania, pełne zadanie „Liczby” (4.1–4.4) z plikiem przykładowym, plansze 2D |
| 20 | Projekt końcowy: „Dziennik ocen” | 3 moduły (`model`, `magazyn` z JSON, `main` z menu `match`), `testy.py` na `assert`, 8 zadań rozbudowy |

Każda lekcja kończy się sekcją **Zadanie**.

### Quiz `python-sprawdzian`

32 pytania, w większości „co wypisze kod?”: `//` i `%`, typ wyniku `/` i `input()`, `range` z krokiem, wycinki, `-2 ** 2`, referencje list, `t = t.sort()`, zbiory, `{}` vs `set()`, `dict.get`, wyrażenia listowe, prawdziwość `"0"`, parametry domyślne, `None` z funkcji, `int("101", 2)`, `bin`, tryby plików, `strip`, `try/finally`, `IndexError`, `Counter.most_common`, `randint`, `self`, `super()`, rekurencja, złożoność, sito Eratostenesa, szyfr Cezara. Poprawne odpowiedzi rozłożone równo: po 8 na A, B, C i D.

### Pliki

```txt
api/data/courses/python-od-podstaw/
├── course.json, description.md, quiz.json
├── 01-wprowadzenie.md          ├── 11-pliki.md
├── 02-zmienne-typy.md          ├── 12-wyjatki.md
├── 03-operatory.md             ├── 13-moduly.md
├── 04-warunki.md               ├── 14-klasy.md
├── 05-petle.md                 ├── 15-rekurencja.md
├── 06-funkcje.md               ├── 16-algorytmy-liczbowe.md
├── 07-napisy.md                ├── 17-algorytmy-tekstowe.md
├── 08-listy.md                 ├── 18-sortowanie-wyszukiwanie.md
├── 09-krotki-zbiory-slowniki.md├── 19-zadania-maturalne.md
└── 10-wyrazenia-listowe.md     └── 20-projekt.md
```

Opis kursu zawiera link do kursu JavaScript. Przy okazji z katalogu kursu JS usunięto pomocniczy plik `check.mjs`, który został tam po weryfikacji (nie był częścią kursu).

### Sprawdzone

- **poprawność merytoryczna** (Python 3.14): wszystkie bloki kodu z lekcji uruchomione — jedyne wyjątki to te pokazywane celowo (np. `int("3.5")`, `s[0] = "K"`, `KeyError`); każdy wynik zapisany w komentarzu (`# …`) porównany z rzeczywistym wydrukiem, a znalezione rozbieżności poprawione (szyfr przestawieniowy, odpowiedź do 4.4 w lekcji 19). Przykłady z plikami (lekcja 11) i pełne rozwiązanie zadania maturalnego (lekcja 19) uruchomione na plikach testowych,
- **projekt końcowy**: `testy.py` przechodzi; menu przetestowane wejściem z klawiatury: duplikat ucznia, puste imię, litera zamiast oceny, ocena 7, nieistniejący uczeń i opcja. Sprawdzone też: zapis i odczyt `dziennik.json` po ponownym uruchomieniu oraz uszkodzony plik JSON,
- **quiz**: kod każdego pytania „co wypisze?” uruchomiony automatycznie i porównany z kluczem,
- import: 20 lekcji, quiz 32 pytania, kurs opublikowany,
- przeglądarka (Chrome): na `/kursy` pięć kursów; gość widzi 20 zablokowanych lekcji; z dostępem wszystkie 20 lekcji otwiera się kolejno („Następna →”), bez nieprzetworzonego Markdown poza blokami kodu (tabele, bloki kodu, cytat z treścią zadania i plikiem przykładowym w lekcji 19); quiz startuje (32 pytania); lekcja 20 na telefonie (375 px) bez przewijania w bok; brak błędów JS,
- tymczasowe konto testowe usunięte.

### Wdrożenie na serwer

```bash
git pull
docker compose up -d --build
docker compose exec api node scripts/import-course.js python-od-podstaw
```

Dostęp do kursu Python przyznaje się osobno w zakładce **Zapisy**. Pozostałych kursów nie trzeba wczytywać ponownie. Nazwa quizu kursu (`python-sprawdzian`) nie koliduje z istniejącym quizem `python-zajecia-02`.

---

## Slider na stronie głównej

Na górze strony głównej (`/`), nad sekcją „Matura z informatyki”, jest slider z trzema slajdami. Jest tylko na stronie głównej, nie na stronach artykułów. Nie wymaga nowych bibliotek.

| # | Obraz | Treść | Przycisk |
|---|---|---|---|
| 1 | `client/public/slider01.webp` (laptop z Fibonaccim w Pythonie) | Nowy kurs — Python od podstaw do matury | „Zobacz kurs” → `/kursy/python-od-podstaw` |
| 2 | `client/public/slider02.webp` (roboty i tablet z odpowiedziami A/B/C) | Quizy — Sprawdź swoją wiedzę w quizach | „Rozwiąż quiz” → `/quizy` |
| 3 | `client/public/slider03.webp` (monitor z `quiz.js`) | Kurs — JavaScript od podstaw do aplikacji | „Zobacz kurs” → `/kursy/javascript-od-podstaw` |

### Dopasowanie do obrazów

Obrazy mają proporcje ok. 2,4 : 1 (ok. 1940 × 810 px), pusty granatowy lewy bok i motyw po prawej. Dlatego:

- **komputer** — tekst leży po lewej, na granatowej części obrazu; obraz jest dosunięty do prawej krawędzi i ma wysokość slidera (`clamp(340px, 40vw, 540px)`); na bardzo szerokich ekranach lewa krawędź obrazu płynnie przechodzi (maska z gradientem) w tło w kolorze odczytanym z obrazu (`bg` slajdu: `#0c1422`, `#111c31`, `#001138`),
- **tablet** (≤ 960 px) — obraz wchodzi pod tekst, więc tekst ma mocniejsze przyciemnienie tła,
- **telefon** (≤ 680 px) — u góry kadr z prawej części obrazu (laptop / roboty / monitor), pod nim tekst na granatowym tle; bez strzałek (przesuwanie palcem i kropki).

Wygląd jest spójny ze stroną: żółty akcent `#facc15` w tytule, etykiecie, przycisku i kropkach.

### Działanie

- zmiana slajdu przez płynne przenikanie, co 7 s,
- pauza po najechaniu myszą lub fokusie klawiatury; bez automatycznego przewijania, gdy w systemie włączono „ogranicz animacje” (`prefers-reduced-motion`),
- strzałki, kropki (aktywna jest wydłużona), klawisze ← →, przesuwanie palcem,
- dostępność: `aria-roledescription="karuzela"` / `"slajd"`, ukryte slajdy mają `aria-hidden` i przycisk poza kolejnością Tab,
- pierwszy obraz ładuje się od razu (`fetchpriority="high"`), kolejne leniwie.

### Pliki

| Plik | Zmiana |
|---|---|
| `client/src/component/Slider.jsx` | komponent; lista slajdów `SLIDES` na górze pliku (obraz, kolor tła, etykieta, tytuł, żółta część tytułu, tekst, link) |
| `client/src/component/Slider.css` | style slidera (desktop, tablet, telefon, ograniczenie animacji) |
| `client/src/pages/Home.jsx` | `<Slider />` nad sekcją powitalną (bez zmian) |
| `client/public/slider01–03.webp` | obrazy slajdów |

**Zmiana slajdów:** edytuj tablicę `SLIDES` w `Slider.jsx`. Nowy obraz włóż do `client/public/` w podobnych proporcjach, z pustym lewym bokiem, i wpisz kolor jego lewej krawędzi w polu `bg`.

### Sprawdzone

- Chrome przy szerokości 1920, 1440, 900 i 375 px: tekst czytelny, motyw obrazu widoczny, brak przewijania w bok,
- automatyczna zmiana po 7 s, klawisz →, pauza przy fokusie, przełączanie kropkami,
- brak błędów JS, `vite build` bez błędów.

Wdrożenie: `docker compose up -d --build`.

---

## Menu mobilne (burger)

Przy szerokości ekranu **do 860 px** menu w nagłówku zamienia się na przycisk z trzema kreskami (burger). Po kliknięciu pod nagłówkiem rozwija się panel z pozycjami menu jedna pod drugą. Na komputerze menu wygląda jak dotąd.

### Działanie

- burger zamienia się w **X**, gdy menu jest otwarte; menu pojawia się z krótką animacją (bez animacji przy „ogranicz animacje” w systemie),
- menu **zamyka się**: po wybraniu pozycji (także „Wyloguj”), klawiszem **Escape** (fokus wraca na burger), po kliknięciu poza nagłówkiem, kliknięciu logo i po poszerzeniu okna do widoku komputerowego,
- pozycje menu na telefonie: duże pola do kliknięcia (pełna szerokość), aktywna strona oznaczona żółtym paskiem z lewej; przyciski „Załóż konto” / „Wyloguj” na całą szerokość pod listą,
- nagłówek nadal „przykleja się” do góry ekranu (`sticky`); przy bardzo niskim ekranie panel menu można przewijać,
- dostępność: przycisk ma `aria-expanded`, `aria-controls` i opis „Otwórz menu” / „Zamknij menu”; zamknięte menu jest ukryte także dla klawiatury (Tab je pomija) i czytników ekranu.

### Pliki

| Plik | Zmiana |
|---|---|
| `client/src/component/Header.jsx` | stan `open`, przycisk burgera, zamykanie (Escape, klik poza, klik w pozycję, przejście na desktop) |
| `client/src/component/Header.css` | styl burgera i panelu menu w `@media (max-width: 860px)` |

### Sprawdzone

- 1280 px: burger ukryty, menu w rzędzie jak wcześniej; zalogowany admin (7 pozycji) mieści się w jednej linii od 861 px wzwyż,
- 375 px (gość i admin): otwieranie i zamykanie, przejście do „Kursy”, Escape z powrotem fokusu, klik poza menu, „Wyloguj”, Tab pomija zamknięte menu, brak przewijania w bok,
- brak błędów JS, `vite build` bez błędów; tymczasowe konto testowe usunięte.

Wdrożenie: `docker compose up -d --build`.

---

## Artykuł „Dlaczego warto wstawiać obrazy WebP na stronie internetowej?” + import artykułów z plików

Pierwszy artykuł dodany z pliku — tak jak kursy. Dzięki temu po wdrożeniu wystarczy jedno polecenie, żeby artykuł pojawił się także na serwerze (artykuły dodane w panelu admina istnieją tylko w bazie, w której je utworzono).

### Artykuł

Adres: `/artykuly/dlaczego-webp`, opublikowany, autor: pierwszy administrator. Treść (ok. 8600 znaków):

- czym jest WebP i porównanie z JPEG / PNG / GIF (tabela możliwości),
- kompresja stratna i bezstratna (nawiązanie do matury), kodek VP8,
- **pomiar na zdjęciu ze slidera** (1937 × 812 px): PNG 811 KB, WebP bezstratny 460 KB, JPEG q80 157 KB, **WebP q80 49 KB**; po zmniejszeniu do 800 px: 228 / 41 / 14 KB — z uczciwymi zastrzeżeniami i danymi Google (25–34% mniej niż JPEG, ok. 26% mniej niż PNG),
- korzyści: szybkość, Core Web Vitals (LCP), PageSpeed / Lighthouse, transfer,
- obsługa w przeglądarkach (wszystkie współczesne, Safari od 14; bez IE),
- narzędzia: Squoosh, GIMP, Photoshop, `cwebp`, Python + Pillow (skrypt zamiany całego folderu),
- HTML: `<img>` z `alt`, `width`, `height`, `loading="lazy"` / `fetchpriority`, `<picture>` z AVIF/WebP/JPEG, `srcset` + `sizes`, CSS `background-image`,
- kiedy nie WebP (SVG dla logo i ikon, oryginały do archiwum, pliki do pobrania, AVIF),
- linki do kursów HTML5 cz. 1 i 2 oraz CSS.

**Okładka:** `client/public/artykuly/webp-okladka.webp` (1600 × 900, 23 KB) — grafika z wykresem wyników pomiaru, sama w formacie WebP.

### Import artykułów — `scripts/import-article.js`

```txt
api/data/articles/<nazwa>/
├── article.json   — { slug, title, excerpt?, coverUrl?, content: "content.md" }
└── content.md     — treść w Markdown
```

```bash
npm run import:article -- dlaczego-webp                          # opublikowany
npm run import:article -- dlaczego-webp --draft                  # szkic
npm run import:article -- dlaczego-webp --author=email@domena.pl # autor (domyślnie pierwszy admin)
```

- dane sprawdzane tą samą walidacją co w panelu admina (`validateArticleInput`); bez `excerpt` zajawka tworzy się automatycznie z treści,
- artykuł dopasowywany po `slug` — ponowne uruchomienie aktualizuje go zamiast tworzyć duplikat,
- data publikacji ustawiana tylko przy pierwszym opublikowaniu (aktualizacja treści jej nie zmienia),
- **uwaga:** treść z pliku nadpisuje zmiany zrobione w panelu admina,
- obrazki artykułu kładziemy w `client/public/` (np. `/artykuly/…`).

### Pliki

| Plik | Zmiana |
|---|---|
| `api/data/articles/dlaczego-webp/article.json`, `content.md` | nowy artykuł |
| `api/scripts/import-article.js` | nowy skrypt importu artykułu |
| `api/package.json` | skrypt `import:article` |
| `client/public/artykuly/webp-okladka.webp` | okładka |

### Sprawdzone

- import: opublikowany, autor „Marcin Putra”; drugi import aktualizuje ten sam artykuł (bez duplikatu, data publikacji bez zmian),
- liczby w artykule z rzeczywistego pomiaru (`sips` → JPEG q80, `cwebp` 1.6 → WebP q80 i bezstratny),
- przeglądarka (Chrome, 1280 i 375 px): karta z okładką na stronie głównej, strona artykułu z tytułem w karcie przeglądarki, 9 sekcji, 3 tabele, 5 bloków kodu, bez nieprzetworzonego Markdown, bez przewijania w bok, bez błędów JS i błędnych zapytań (okładka się wczytuje).

### Wdrożenie na serwer

```bash
git pull
docker compose up -d --build
docker compose exec api node scripts/import-article.js dlaczego-webp
```

---

## Artykuł „Podstawy SQL: grupowanie danych i liczenie wyników — GROUP BY, HAVING, COUNT”

Drugi artykuł z pliku, dodany skryptem `import:article`. Adres: `/artykuly/sql-group-by-having-count`, opublikowany. Treść ok. 15 000 znaków.

### Zawartość

- przykładowa baza: tabele `uczniowie` (8 osób, 3 klasy, jedno miasto `NULL`) i `oceny` (15 ocen, jeden uczeń bez ocen) + kod `CREATE TABLE` / `INSERT` do skopiowania,
- funkcje agregujące `COUNT`, `SUM`, `AVG`, `MIN`, `MAX`, `ROUND`; różnica `COUNT(*)` / `COUNT(kolumna)` / `COUNT(DISTINCT …)` i pomijanie `NULL`,
- `GROUP BY`: jedna kolumna, kilka kolumn, sortowanie po wyniku, grupa `NULL`, brak gwarancji kolejności bez `ORDER BY`, „złota zasada” (komunikat błędu PostgreSQL; SQLite takie zapytanie przepuszcza),
- `WHERE` a `HAVING` (tabela porównawcza, błąd agregatu w `WHERE`, oba razem), kolejność wykonywania zapytania,
- `JOIN` + `GROUP BY`: średnia ucznia, `HAVING AVG(...) >= 4.5`, średnia z matematyki w klasach, `LEFT JOIN` z `COUNT(o.id)` vs `COUNT(*)`,
- matura: Access / LibreOffice Base, przycisk **Sumy**, brak `COUNT(DISTINCT)` w Accessie (obejście podzapytaniem), `TOP 1` i remisy,
- ściąga i 6 zadań z odpowiedziami.

**Okładka:** `client/public/artykuly/sql-group-by-okladka.webp` (1600 × 900, 33 KB).

### Sprawdzone

- **wszystkie zapytania** z artykułu (14) i skrypt tworzący tabele wyciągnięte automatycznie z treści i uruchomione w **SQLite** i **PostgreSQL 17** (tabele tymczasowe, baza deweloperska bez zmian) — wyniki identyczne z tabelami w artykule; jedyna różnica między bazami to kolejność remisu `NULL` / Bochnia, opisana w tekście; zapytania pokazane jako błędne dają w obu bazach opisane błędy; odpowiedzi do zadań policzone tymi samymi danymi,
- przeglądarka (Chrome, 1280 i 375 px): 18 tabel, 19 bloków kodu, bez nieprzetworzonego Markdown, bez przewijania w bok, bez błędów JS.

### Pliki

| Plik | Zmiana |
|---|---|
| `api/data/articles/sql-group-by-having-count/article.json`, `content.md` | nowy artykuł |
| `client/public/artykuly/sql-group-by-okladka.webp` | okładka |

### Wdrożenie na serwer

```bash
git pull
docker compose up -d --build
docker compose exec api node scripts/import-article.js sql-group-by-having-count
```

---

## Artykuł „Algorytmy rekurencyjne w Pythonie — kiedy są szybkie, a kiedy bardzo wolne”

Trzeci artykuł z pliku (`import:article`), celowo **zwięzły** (ok. 4800 znaków). Adres: `/artykuly/rekurencja-python-wydajnosc`, opublikowany.

- przypadek bazowy i krok rekurencyjny (silnia),
- Fibonacci rekurencyjny: drzewo wywołań i **pomiar** liczby wywołań i czasu dla n = 20, 25, 30, 32 (wzrost ok. ×1,6 na każde +1),
- poprawki: `@lru_cache` (fib(30) ok. 0,00004 s) i pętla (ok. 0,0000006 s; fib(5000) w 0,35 ms),
- limit głębokości (~1000, `RecursionError`, memoizacja go nie usuwa),
- dziel i zwyciężaj: szybkie potęgowanie — 14 wywołań zamiast 900 dla 2⁹⁰⁰,
- tabela podsumowująca złożoności i zasady praktyczne; link do kursu Python.

**Okładka:** `client/public/artykuly/rekurencja-okladka.webp` (33 KB).

**Sprawdzone:** wszystkie czasy i liczby wywołań zmierzone w Pythonie 3.14 (w artykule zaznaczono, że czasy zależą od komputera); liczba wywołań dla fib(40) wyliczona ze wzoru 2·F(41) − 1; wszystkie bloki kodu z artykułu uruchomione; przeglądarka (Chrome, 1280 i 375 px) bez nieprzetworzonego Markdown, przewijania w bok i błędów JS.

**Pliki:** `api/data/articles/rekurencja-python-wydajnosc/` (`article.json`, `content.md`), okładka.

**Wdrożenie:** `docker compose up -d --build`, potem `docker compose exec api node scripts/import-article.js rekurencja-python-wydajnosc`.

---

## Artykuł „Sortowanie bąbelkowe w Pythonie — krótko i na przykładzie”

Czwarty artykuł z pliku (`import:article`), **krótki** (ok. 2900 znaków). Adres: `/artykuly/sortowanie-babelkowe-python`, opublikowany.

- idea algorytmu, przykład `[5, 1, 4, 2, 8]` krok po kroku (3 przebiegi),
- kod z dwiema optymalizacjami (`range(n - 1 - i)`, flaga `zamiana`),
- złożoność: O(n²), z flagą O(n) dla posortowanych danych,
- pomiar: 1000 elementów — 0,027 s vs `sorted()` 0,00008 s; 5000 — 0,72 s vs 0,0004 s (ok. 1700×),
- `sorted()`, `list.sort(reverse=True)`, `key=len`; link do lekcji 18 kursu Python.

**Okładka:** `client/public/artykuly/sortowanie-babelkowe-okladka.webp` (kolejne przebiegi sortowania).

**Sprawdzone:** ślad przebiegów i pomiary wygenerowane programem (Python 3.14), bloki kodu uruchomione, przeglądarka (1280 i 375 px) bez błędów.

**Wdrożenie:** `docker compose up -d --build`, potem `docker compose exec api node scripts/import-article.js sortowanie-babelkowe-python`.

---

## Artykuł „Jak nagrać płytę CD w systemie Windows — pliki, muzyka i obraz ISO”

Piąty artykuł z pliku (`import:article`), poradnik (ok. 5400 znaków). Adres: `/artykuly/nagrywanie-plyty-cd-windows`, opublikowany.

- co jest potrzebne: nagrywarka (także zewnętrzna USB), tabela CD-R / CD-RW / DVD±R,
- **płyta z plikami** w Eksploratorze plików: okno *Nagrywanie dysku*, różnica *Jak dysk flash USB* / *Za pomocą odtwarzacza CD/DVD*, dokończenie zapisu (Windows 10: *Narzędzia dysków → Zakończ nagrywanie*; Windows 11: *Nagraj na dysk*, ewentualnie przez *Pokaż więcej opcji*), szybkość nagrywania, *Wysuń*,
- **płyta audio** w Windows Media Player (w Windows 11 „starsza wersja”): karta *Nagrywanie*, *Dysk CD audio*, limit 80 minut, MP3 jako dysk z danymi,
- **obraz ISO**: *Nagraj obraz dysku*, *Zweryfikuj dysk po nagraniu*,
- kasowanie CD-RW (*Wymaż ten dysk*), tabela problemów i rozwiązań, podsumowanie.

**Okładka:** `client/public/artykuly/nagrywanie-cd-okladka.webp`.

**Uwaga:** kroki opisane według wbudowanych narzędzi Windows 10/11 i nazw z polskiego interfejsu, ale **nie były przeklikane na Windowsie** (projekt tworzony na macOS) — przed promowaniem artykułu warto raz przejść je na komputerze z Windows, zwłaszcza menu Windows 11, które zmienia się z aktualizacjami. Ewentualne poprawki: edycja `content.md` i ponowny import.

**Sprawdzone:** przeglądarka (Chrome, 1280 i 375 px) — 3 tabele, bez nieprzetworzonego Markdown, bez przewijania w bok i błędów JS.

**Wdrożenie:** `docker compose up -d --build`, potem `docker compose exec api node scripts/import-article.js nagrywanie-plyty-cd-windows`.

---

## Artykuł „Instrukcja warunkowa w Pythonie — przykłady z życia i kod”

Szósty artykuł z pliku (`import:article`), ok. 4900 znaków. Adres: `/artykuly/instrukcja-warunkowa-python`, opublikowany.

Każda konstrukcja na przykładzie z życia:

| Przykład | Konstrukcja |
|---|---|
| parasol czy okulary | `if` / `else`, dwukropek, wcięcia |
| bilet do kina | operatory porównania, `=` vs `==` |
| ocena ze sprawdzianu | `elif`, znaczenie kolejności warunków |
| darmowa dostawa w sklepie | `and`, `or`, `not`, nawiasy; przedział `18 <= t <= 25` |
| logowanie | warunki zagnieżdżone |
| rok przestępny | warunek złożony w funkcji, wyrażenie warunkowe `a if w else b` |
| pusty koszyk | wartości prawdziwe i fałszywe |
| dzień tygodnia | `match` / `case`, `|`, `case _` |

Do tego tabela najczęstszych błędów (w tym `if x == 1 or 2`, które jest zawsze prawdziwe) i link do lekcji 4 kursu Python.

**Okładka:** `client/public/artykuly/instrukcja-warunkowa-okladka.webp`.

**Sprawdzone:** wszystkie 9 bloków kodu uruchomione (wyniki zgodne z tekstem), przeglądarka (Chrome, 1280 i 375 px) bez nieprzetworzonego Markdown, przewijania w bok i błędów JS.

**Wdrożenie:** `docker compose up -d --build`, potem `docker compose exec api node scripts/import-article.js instrukcja-warunkowa-python`.

---

## Lista kursów na stronie głównej

Na stronie głównej, między sliderem a artykułami, jest sekcja **„Kursy”** z listą wszystkich opublikowanych kursów i linkiem **„Wszystkie kursy →”** do `/kursy`.

Każdy kurs to zwarta, w całości klikalna karta:

- **znak technologii** w kolorze rozpoznawanym po adresie kursu: HTML (pomarańczowy), CSS (niebieski), JS (żółty), PY (niebiesko-żółty), SQL (zielony); inne kursy dostają inicjały tytułu na szarym tle,
- tytuł, liczba lekcji i quizów (z polską odmianą — `lessonsLabel`, `quizzesLabel`),
- krótki opis (pierwsze ~120 znaków opisu kursu bez Markdown — `markdownPreview`),
- dla zalogowanych — plakietka statusu dostępu („Masz dostęp”, „Czeka na zatwierdzenie”, „Prośba odrzucona”), odświeżana po zalogowaniu.

Lista pobiera dane z istniejącego `GET /api/courses` (kolejność jak na `/kursy`), więc nowy kurs po imporcie pojawi się na stronie głównej sam. Gdy kursów nie ma albo API zwróci błąd, sekcja się nie wyświetla — reszta strony działa normalnie. Szkice kursów nie są pokazywane.

### Pliki

| Plik | Zmiana |
|---|---|
| `client/src/component/HomeCourses.jsx` | nowy komponent sekcji |
| `client/src/component/HomeCourses.css` | style (siatka kart, znaki technologii, hover/fokus, ograniczenie animacji) |
| `client/src/pages/Home.jsx` | `<HomeCourses />` pod sliderem |

### Sprawdzone

- Chrome 1280 px (3 kolumny) i 375 px (1 kolumna, bez przewijania w bok): 5 kursów ze znakami HTML, HTML, CSS, JS, PY,
- kliknięcie w dowolne miejsce karty otwiera kurs, „Wszystkie kursy →” prowadzi do `/kursy`,
- po zalogowaniu i prośbie o dostęp karta pokazuje „Czeka na zatwierdzenie”,
- brak błędów JS, `vite build` bez błędów; tymczasowe konto testowe i jego prośba o dostęp usunięte.

Wdrożenie: `docker compose up -d --build`.

---

## Nowa stopka strony

Stopka (komponent `Footer`, używany jak dotąd na stronach artykułów, kursów, lekcji, quizów i polityki cookies) ma trzy kolumny i dolny pasek:

| Część | Zawartość |
|---|---|
| marka | **maturazinformatyki.it** (link do strony głównej) + jedno zdanie o stronie |
| „Na stronie” | krótkie menu: Artykuły, Kursy, Quizy, Polityka cookies |
| „Kontakt” | **kontakt@maturazinformatyki.it** (link `mailto:`) i krótka informacja, w jakich sprawach pisać |
| dolny pasek | © rok (liczony automatycznie) · nazwa bieżącej sekcji z dotychczasowego parametru `nameQuiz` (np. „Kursy”, tytuł quizu) |

Układ: na komputerze 3 kolumny; do 760 px — marka na całą szerokość, menu i kontakt obok siebie; do 480 px — wszystko jedno pod drugim. Kolory i fokus klawiatury spójne z nagłówkiem.

**Adres kontaktowy** jest w stałej `CONTACT_EMAIL` na początku `client/src/component/Footer.jsx` — zmiana w jednym miejscu. **Uwaga:** upewnij się, że skrzynka `kontakt@maturazinformatyki.it` istnieje lub przekierowuje pocztę.

### Pasek cookies a stopka

Wcześniej stopka miała na stałe 90 px pustego miejsca na dole (na pasek informacji o cookies), także po jego zamknięciu. Teraz `CookieNotice` sam dodaje pod treścią odstęp równy **rzeczywistej wysokości paska** (mierzonej `ResizeObserver`, więc działa także na telefonie, gdzie pasek jest wyższy) — i tylko wtedy, gdy pasek jest widoczny. Po kliknięciu „Rozumiem” odstęp znika.

### Pliki

| Plik | Zmiana |
|---|---|
| `client/src/component/Footer.jsx` | nowa treść stopki, stała `CONTACT_EMAIL` (parametr `nameQuiz` bez zmian — strony nie wymagały poprawek) |
| `client/src/component/Footer.css` | nowe style (klasy `mzi-footer-*`; stare `maturazinformatyki-quiz-footer-*` usunięte, nigdzie indziej nie były używane) |
| `client/src/component/CookieNotice.jsx` | odstęp `mzi-cookie-spacer` o wysokości paska |

### Sprawdzone

- Chrome 1280, 700 i 375 px na stronie głównej, `/kursy`, `/quizy` i stronie artykułu: menu, link `mailto:`, nazwa sekcji w dolnym pasku, link „Kursy” w stopce prowadzi do `/kursy`,
- z widocznym paskiem cookies stopka nie jest zasłonięta (1280 i 375 px), po zamknięciu paska stopka kończy się przy dolnej krawędzi ekranu,
- bez przewijania w bok, bez błędów JS, `vite build` bez błędów.

Wdrożenie: `docker compose up -d --build`.
