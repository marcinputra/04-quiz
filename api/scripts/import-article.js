// Import artykułu z plików do bazy (tak jak import kursów).
//
// Pliki artykułu: api/data/articles/<nazwa>/
//   article.json  — { slug, title, excerpt?, coverUrl?, content: "content.md" }
//   content.md    — treść (Markdown)
// Obrazki (okładka) leżą w client/public/, np. coverUrl: "/artykuly/okladka.webp".
//
// Użycie:
//   npm run import:article -- dlaczego-webp                          -> artykuł opublikowany
//   npm run import:article -- dlaczego-webp --draft                  -> szkic (widoczny tylko dla admina)
//   npm run import:article -- dlaczego-webp --author=bok@example.pl  -> autor (domyślnie pierwszy administrator)
// Na serwerze:
//   docker compose exec api node scripts/import-article.js dlaczego-webp
//
// Skrypt można uruchamiać wielokrotnie: artykuł jest dopasowywany po slug.
// UWAGA: treść jest zastępowana plikiem — zmiany zrobione w panelu admina zostaną nadpisane.
// Data publikacji ustawiana jest tylko przy pierwszym opublikowaniu.

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { validateArticleInput, autoExcerpt } from "../src/lib/articleValidate.js";

const args = process.argv.slice(2);
const name = args.find((a) => !a.startsWith("--"));
const draft = args.includes("--draft");
const authorEmail = args.find((a) => a.startsWith("--author="))?.slice("--author=".length);

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const articlesDir = path.join(scriptDir, "../data/articles");

function fail(message) {
  console.error("Błąd:", message);
  process.exit(1);
}

if (!name) {
  const available = fs.existsSync(articlesDir) ? fs.readdirSync(articlesDir) : [];
  fail(`podaj nazwę artykułu, np. npm run import:article -- dlaczego-webp\nDostępne: ${available.join(", ") || "(brak)"}`);
}

const dir = path.join(articlesDir, name);
if (!fs.existsSync(path.join(dir, "article.json"))) fail(`brak pliku ${path.join(dir, "article.json")}`);

const meta = JSON.parse(fs.readFileSync(path.join(dir, "article.json"), "utf8"));
const content = fs.readFileSync(path.join(dir, meta.content ?? "content.md"), "utf8").trim();

const input = validateArticleInput({
  slug: meta.slug,
  title: meta.title,
  content,
  excerpt: meta.excerpt ?? autoExcerpt(content),
  coverUrl: meta.coverUrl ?? "",
  status: draft ? "draft" : "published",
});
if (input.error) fail(input.error);
if (!input.value.content) fail("treść artykułu jest pusta");

const { prisma } = await import("../src/db.js");

try {
  const author = authorEmail
    ? await prisma.user.findUnique({ where: { email: authorEmail.toLowerCase() }, select: { id: true, name: true } })
    : await prisma.user.findFirst({ where: { role: "admin" }, orderBy: { id: "asc" }, select: { id: true, name: true } });
  if (authorEmail && !author) fail(`nie ma użytkownika ${authorEmail}`);

  const existing = await prisma.article.findUnique({ where: { slug: input.value.slug }, select: { publishedAt: true } });
  const publishedAt = !draft && !existing?.publishedAt ? new Date() : undefined;

  const data = { ...input.value, ...(publishedAt && { publishedAt }) };
  const article = await prisma.article.upsert({
    where: { slug: input.value.slug },
    create: { ...data, authorId: author?.id ?? null },
    update: data,
  });

  console.log(
    `Artykuł „${article.title}” (/artykuly/${article.slug}) — ${article.status === "published" ? "opublikowany" : "szkic"}, ` +
      `${content.length} znaków${existing ? ", zaktualizowany" : `, autor: ${author?.name ?? "brak"}`}`,
  );
} finally {
  await prisma.$disconnect();
}
