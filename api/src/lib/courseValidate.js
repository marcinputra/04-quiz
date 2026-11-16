// Walidacja kursów i lekcji
import { slugify } from "./quizValidate.js";

const SLUG_RE = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const str = (v) => (typeof v === "string" ? v.trim() : "");
const md = (v) => (typeof v === "string" ? v.replace(/\s+$/, "") : "");

// partial=true -> tylko podane pola (PATCH)
export function validateCourseInput(body, { partial = false } = {}) {
  const data = {};
  const has = (k) => body && Object.prototype.hasOwnProperty.call(body, k);

  if (!partial || has("title")) {
    const title = str(body?.title);
    if (!title) return { error: "Podaj nazwę kursu." };
    if (title.length > 255) return { error: "Nazwa kursu może mieć najwyżej 255 znaków." };
    data.title = title;
  }
  if (!partial || has("slug")) {
    const slug = str(body?.slug) ? str(body.slug).toLowerCase() : slugify(data.title);
    if (!slug || slug.length > 200 || !SLUG_RE.test(slug)) {
      return { error: "Adres kursu może zawierać tylko małe litery, cyfry i myślniki (np. python-od-podstaw)." };
    }
    data.slug = slug;
  }
  if (has("description")) {
    const description = md(body.description);
    if (description.length > 20000) return { error: "Opis kursu jest za długi." };
    data.description = description || null;
  }
  if (has("isPublished")) data.isPublished = Boolean(body.isPublished);
  return { value: data };
}

export function validateLessonInput(body) {
  const title = str(body?.title);
  if (!title) return { error: "Podaj tytuł lekcji." };
  if (title.length > 255) return { error: "Tytuł lekcji może mieć najwyżej 255 znaków." };
  const content = md(body?.content);
  if (content.length > 200_000) return { error: "Treść lekcji jest za długa." };
  return { value: { title, content } };
}
