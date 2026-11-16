// Import quizów z plików JSON (stary format) do bazy.
//
// Źródło: api/data/quizzes (pliki JSON nie są już publiczne w client/public).
//
// Użycie:
//   npm run import:quizzes                    -> czyta api/data/quizzes
//   npm run import:quizzes -- /sciezka/do/json
//   npm run import:quizzes -- --dry-run       -> tylko sprawdza pliki, nic nie zapisuje
//   npm run import:quizzes -- --force         -> nadpisuje pytania także w quizach, które mają już wyniki
//
// - quizy z quizList.json importowane są jako opublikowane (kolejność jak w pliku),
// - pozostałe pliki z pytaniami (np. quiz04.json) jako NIEopublikowane szkice,
//   z tytułem = nazwa pliku, żeby nic nie przepadło,
// - skrypt można uruchamiać wielokrotnie: quiz jest dopasowywany po slug,
//   a jego pytania są podmieniane na te z pliku.

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const args = process.argv.slice(2);
const dryRun = args.includes("--dry-run");
const force = args.includes("--force");
const dirArg = args.find((a) => !a.startsWith("--"));

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const dataDir = path.resolve(dirArg ?? path.join(scriptDir, "../data/quizzes"));

const readJson = (file) => JSON.parse(fs.readFileSync(path.join(dataDir, file), "utf8"));

const warnings = [];

// Zamiana starego formatu pytania na format bazy; rzuca błąd przy złych danych.
// Akceptuje też klucze z wielkiej litery (Question, Code, Options, CorrectAnswer).
function normalizeQuestion(raw, idx, file) {
  const where = `${file}, pytanie #${idx + 1}`;
  const q = {
    question: raw?.question ?? raw?.Question,
    code: raw?.code ?? raw?.Code,
    options: raw?.options ?? raw?.Options,
    correctAnswer: raw?.correctAnswer ?? raw?.CorrectAnswer,
  };
  // dopuszczamy pytanie bez treści, jeśli ma kod (np. "co wyświetli program?")
  const hasText = typeof q.question === "string" && q.question.trim() !== "";
  const hasCode = typeof q.code === "string" && q.code.trim() !== "";
  if (!hasText && !hasCode) {
    throw new Error(`${where}: brak treści pytania i kodu`);
  }
  q.question = hasText ? q.question : "";
  if (!Array.isArray(q.options) || q.options.length < 2) {
    throw new Error(`${where}: za mało odpowiedzi`);
  }
  if (!Number.isInteger(q.correctAnswer) || q.correctAnswer < 0 || q.correctAnswer >= q.options.length) {
    throw new Error(`${where}: niepoprawny correctAnswer (${q.correctAnswer})`);
  }
  return {
    question: q.question,
    code: q.code ? String(q.code) : null,
    options: q.options.map((text, i) => ({
      text: String(text),
      isCorrect: i === q.correctAnswer,
      position: i,
    })),
  };
}

function loadQuizzes() {
  const list = readJson("quizList.json");
  const listedSlugs = new Set(list.map((m) => m.id));

  const quizzes = list.map((meta, index) => ({
    slug: meta.id,
    title: meta.title,
    description: meta.content ?? null,
    level: meta.level ?? null,
    topic: meta.topic ?? null,
    isPublished: true,
    position: index,
    file: `${meta.id}.json`,
  }));

  // pliki z pytaniami, których nie ma w quizList.json
  const extraFiles = fs
    .readdirSync(dataDir)
    .filter((f) => f.endsWith(".json") && f !== "quizList.json")
    .filter((f) => !listedSlugs.has(path.basename(f, ".json")))
    .sort();

  for (const file of extraFiles) {
    const slug = path.basename(file, ".json");
    quizzes.push({
      slug,
      title: `[szkic] ${slug}`,
      description: "Zaimportowane z pliku spoza quizList.json — uzupełnij opis i opublikuj w panelu admina.",
      level: null,
      topic: null,
      isPublished: false,
      position: quizzes.length,
      file,
    });
  }

  return quizzes.map((quiz) => {
    if (!fs.existsSync(path.join(dataDir, quiz.file))) {
      throw new Error(`Brak pliku z pytaniami: ${quiz.file}`);
    }
    const raw = readJson(quiz.file);
    if (!Array.isArray(raw)) throw new Error(`${quiz.file}: oczekiwano tablicy pytań`);
    // błędne pytanie nie przerywa importu — jest pomijane i raportowane na końcu
    const questions = [];
    raw.forEach((q, i) => {
      try {
        questions.push({ ...normalizeQuestion(q, i, quiz.file), position: questions.length });
      } catch (err) {
        warnings.push(err.message);
      }
    });
    return { ...quiz, questions };
  });
}

function printWarnings() {
  if (!warnings.length) return;
  console.log(`\nPominięto ${warnings.length} pytań z błędami (popraw plik JSON lub dodaj je w panelu admina):`);
  for (const w of warnings) console.log(`  - ${w}`);
}

async function main() {
  console.log(`Katalog z danymi: ${dataDir}`);
  const quizzes = loadQuizzes();

  if (dryRun) {
    for (const q of quizzes) {
      console.log(`  ${q.isPublished ? "✓" : "·"} ${q.slug} — ${q.questions.length} pytań`);
    }
    printWarnings();
    console.log(`\nDry run: ${quizzes.length} quizów, nic nie zapisano.`);
    return;
  }

  // import dynamiczny, żeby --dry-run działał bez bazy i bez wygenerowanego klienta
  const { prisma } = await import("../src/db.js");

  try {
    for (const { file, questions, ...data } of quizzes) {
      const existing = await prisma.quiz.findUnique({
        where: { slug: data.slug },
        select: { id: true, _count: { select: { attempts: true } } },
      });

      if (existing && existing._count.attempts > 0 && !force) {
        console.log(`  ! ${data.slug}: pominięto pytania — quiz ma już ${existing._count.attempts} podejść (użyj --force)`);
        await prisma.quiz.update({ where: { id: existing.id }, data });
        continue;
      }

      await prisma.$transaction(async (tx) => {
        const quiz = await tx.quiz.upsert({
          where: { slug: data.slug },
          create: data,
          update: data,
        });
        await tx.question.deleteMany({ where: { quizId: quiz.id } });
        for (const { options, ...q } of questions) {
          await tx.question.create({
            data: { ...q, quizId: quiz.id, options: { create: options } },
          });
        }
      });

      console.log(`  ${data.isPublished ? "✓" : "·"} ${data.slug} — ${questions.length} pytań`);
    }
    printWarnings();
    console.log(`\nZaimportowano ${quizzes.length} quizów.`);
  } finally {
    await prisma.$disconnect();
  }
}

main().catch((err) => {
  console.error("Błąd importu:", err.message);
  process.exit(1);
});
