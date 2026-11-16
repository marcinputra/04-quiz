// Import kursu z plików do bazy: opis, lekcje (Markdown) i opcjonalny quiz kursu.
//
// Pliki kursu: api/data/courses/<nazwa>/
//   course.json      — { slug, title, lessons: [{ file, title }], quiz?: "quiz.json" }
//   description.md   — opis kursu (Markdown)
//   *.md             — treść lekcji
//   quiz.json        — { slug, title, description, topic, level, lockOnLeave?, questions: [{ question, code, options, correctAnswer }] }
//                      lockOnLeave: true — opuszczenie karty kończy quiz (bez pola: zostaje ustawienie z panelu)
//
// Użycie:
//   npm run import:course -- html5-od-podstaw            -> kurs opublikowany
//   npm run import:course -- html5-od-podstaw --draft    -> kurs jako szkic (niewidoczny dla uczniów)
//   npm run import:course -- html5-od-podstaw --force    -> nadpisz pytania quizu, nawet jeśli są już wyniki
// Na serwerze:
//   docker compose exec api node scripts/import-course.js html5-od-podstaw
//
// Skrypt można uruchamiać wielokrotnie: kurs i quiz są dopasowywane po slug.
// UWAGA: lekcje kursu są zastępowane treścią z plików — zmiany lekcji zrobione w panelu admina
// zostaną nadpisane. Zapisy uczniów na kurs nie są ruszane.

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const args = process.argv.slice(2);
const name = args.find((a) => !a.startsWith("--"));
const draft = args.includes("--draft");
const force = args.includes("--force");

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const coursesDir = path.join(scriptDir, "../data/courses");

function fail(message) {
  console.error("Błąd:", message);
  process.exit(1);
}

if (!name) {
  const available = fs.existsSync(coursesDir) ? fs.readdirSync(coursesDir) : [];
  fail(`podaj nazwę kursu, np. npm run import:course -- html5-od-podstaw\nDostępne: ${available.join(", ") || "(brak)"}`);
}

const dir = path.join(coursesDir, name);
if (!fs.existsSync(path.join(dir, "course.json"))) fail(`brak pliku ${path.join(dir, "course.json")}`);

const read = (file) => fs.readFileSync(path.join(dir, file), "utf8");
const meta = JSON.parse(read("course.json"));
const description = fs.existsSync(path.join(dir, "description.md")) ? read("description.md").trim() : null;
const lessons = meta.lessons.map((l, position) => ({ title: l.title, content: read(l.file).trim(), position }));

let quiz = null;
if (meta.quiz) {
  quiz = JSON.parse(read(meta.quiz));
  quiz.questions.forEach((q, i) => {
    const where = `${meta.quiz}, pytanie #${i + 1}`;
    if (!q.question?.trim() && !q.code?.trim()) fail(`${where}: brak treści i kodu`);
    if (!Array.isArray(q.options) || q.options.length < 2) fail(`${where}: za mało odpowiedzi`);
    if (!Number.isInteger(q.correctAnswer) || q.correctAnswer < 0 || q.correctAnswer >= q.options.length) {
      fail(`${where}: niepoprawny correctAnswer`);
    }
  });
}

const { prisma } = await import("../src/db.js");

try {
  const course = await prisma.course.upsert({
    where: { slug: meta.slug },
    create: { slug: meta.slug, title: meta.title, description, isPublished: !draft },
    update: { title: meta.title, description, isPublished: !draft },
  });

  await prisma.$transaction([
    prisma.lesson.deleteMany({ where: { courseId: course.id } }),
    prisma.lesson.createMany({ data: lessons.map((l) => ({ ...l, courseId: course.id })) }),
  ]);
  console.log(`Kurs „${course.title}” (/kursy/${course.slug}) — ${draft ? "szkic" : "opublikowany"}, lekcji: ${lessons.length}`);
  lessons.forEach((l) => console.log(`  ${l.position + 1}. ${l.title} (${l.content.length} znaków)`));

  if (quiz) {
    const existing = await prisma.quiz.findUnique({
      where: { slug: quiz.slug },
      select: { id: true, _count: { select: { attempts: true } } },
    });
    const data = {
      title: quiz.title,
      description: quiz.description ?? null,
      topic: quiz.topic ?? null,
      level: quiz.level ?? null,
      courseId: course.id,
      isPublished: true, // widoczny tylko dla uczniów z dostępem do kursu
      // "lockOnLeave": true w quiz.json — bez tego pola zostaje ustawienie z panelu
      ...(typeof quiz.lockOnLeave === "boolean" ? { lockOnLeave: quiz.lockOnLeave } : {}),
    };

    if (existing && existing._count.attempts > 0 && !force) {
      await prisma.quiz.update({ where: { id: existing.id }, data });
      console.log(`Quiz „${quiz.title}”: pytania NIE zmienione — są już wyniki uczniów (użyj --force)`);
    } else {
      const last = await prisma.quiz.aggregate({ _max: { position: true } });
      await prisma.$transaction(async (tx) => {
        const q = await tx.quiz.upsert({
          where: { slug: quiz.slug },
          create: { slug: quiz.slug, ...data, position: (last._max.position ?? -1) + 1 },
          update: data,
        });
        await tx.question.deleteMany({ where: { quizId: q.id } });
        for (const [i, item] of quiz.questions.entries()) {
          await tx.question.create({
            data: {
              quizId: q.id,
              question: item.question?.trim() ?? "",
              code: item.code?.trim() ? item.code : null,
              position: i,
              options: {
                create: item.options.map((text, oi) => ({ text: String(text), isCorrect: oi === item.correctAnswer, position: oi })),
              },
            },
          });
        }
      });
      console.log(`Quiz „${quiz.title}” (/quiz/${quiz.slug}) — pytań: ${quiz.questions.length}, przypisany do kursu`);
    }
  }
} finally {
  await prisma.$disconnect();
}
