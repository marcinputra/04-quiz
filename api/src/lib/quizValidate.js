// Walidacja danych z edytora quizów. Każda funkcja zwraca { value } albo { error }.

export const OPTIONS_MIN = 2;
export const OPTIONS_MAX = 8;
const SLUG_RE = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

const PL = { ą: "a", ć: "c", ę: "e", ł: "l", ń: "n", ó: "o", ś: "s", ź: "z", ż: "z" };

// "Wstęp do SQL (SP01)" -> "wstep-do-sql-sp01"
export function slugify(text) {
  return String(text ?? "")
    .toLowerCase()
    .replace(/[ąćęłńóśźż]/g, (c) => PL[c])
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 200)
    .replace(/-+$/, "");
}

const str = (v) => (typeof v === "string" ? v.trim() : "");
const optionalStr = (v, max) => {
  const s = str(v);
  return s ? s.slice(0, max) : null;
};

// Dane quizu. partial=true -> tylko podane pola (PATCH)
export function validateQuizInput(body, { partial = false } = {}) {
  const data = {};
  const has = (k) => body && Object.prototype.hasOwnProperty.call(body, k);

  if (!partial || has("title")) {
    const title = str(body?.title);
    if (!title) return { error: "Podaj tytuł quizu." };
    if (title.length > 255) return { error: "Tytuł może mieć najwyżej 255 znaków." };
    data.title = title;
  }

  if (has("slug") || !partial) {
    const slug = str(body?.slug) ? str(body.slug).toLowerCase() : slugify(data.title);
    if (!slug) return { error: "Podaj adres quizu (slug)." };
    if (slug.length > 200 || !SLUG_RE.test(slug)) {
      return { error: "Adres quizu może zawierać tylko małe litery, cyfry i myślniki (np. sql-podstawy-1)." };
    }
    data.slug = slug;
  }

  if (has("description")) data.description = optionalStr(body.description, 5000);
  if (has("topic")) data.topic = optionalStr(body.topic, 100);
  if (has("level")) data.level = optionalStr(body.level, 50);
  if (has("isPublished")) data.isPublished = Boolean(body.isPublished);
  if (has("shuffle")) data.shuffle = Boolean(body.shuffle);
  if (has("lockOnLeave")) data.lockOnLeave = Boolean(body.lockOnLeave);
  if (has("courseId")) {
    // null / "" = quiz ogólnodostępny (dla każdego zalogowanego)
    const raw = body.courseId;
    if (raw === null || raw === "") data.courseId = null;
    else if (Number.isInteger(Number(raw)) && Number(raw) > 0) data.courseId = Number(raw);
    else return { error: "Niepoprawny kurs." };
  }

  return { value: data };
}

// Pytanie z odpowiedziami: dokładnie jedna poprawna
export function validateQuestionInput(body) {
  const question = typeof body?.question === "string" ? body.question.trim() : "";
  // kod zostawiamy bez trim() na początku — wcięcia są ważne; usuwamy tylko puste linie na końcu
  const code = typeof body?.code === "string" ? body.code.replace(/\s+$/, "") : "";

  if (!question && !code) return { error: "Podaj treść pytania albo kod." };
  if (question.length > 5000 || code.length > 20000) return { error: "Pytanie jest za długie." };

  const raw = Array.isArray(body?.options) ? body.options : [];
  if (raw.length < OPTIONS_MIN) return { error: `Pytanie musi mieć co najmniej ${OPTIONS_MIN} odpowiedzi.` };
  if (raw.length > OPTIONS_MAX) return { error: `Pytanie może mieć najwyżej ${OPTIONS_MAX} odpowiedzi.` };

  const options = [];
  for (const [i, o] of raw.entries()) {
    const text = typeof o?.text === "string" ? o.text.trim() : "";
    if (!text) return { error: `Odpowiedź ${String.fromCharCode(65 + i)} jest pusta.` };
    if (text.length > 2000) return { error: `Odpowiedź ${String.fromCharCode(65 + i)} jest za długa.` };
    const id = Number.isInteger(o?.id) && o.id > 0 ? o.id : null;
    options.push({ id, text, isCorrect: o?.isCorrect === true, position: i });
  }

  const correctCount = options.filter((o) => o.isCorrect).length;
  if (correctCount !== 1) return { error: "Zaznacz dokładnie jedną poprawną odpowiedź." };

  return { value: { question, code: code || null, options } };
}

// [3, 1, 2] -> poprawna lista różnych id
export function validateIdList(raw) {
  if (!Array.isArray(raw) || !raw.length) return { error: "Brak listy kolejności." };
  const ids = raw.map(Number);
  if (ids.some((n) => !Number.isInteger(n) || n <= 0) || new Set(ids).size !== ids.length) {
    return { error: "Niepoprawna lista kolejności." };
  }
  return { value: ids };
}
