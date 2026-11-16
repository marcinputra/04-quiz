// Walidacja artykułów i automatyczna zajawka z treści Markdown
import { slugify } from "./quizValidate.js";

const SLUG_RE = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
export const CONTENT_MAX = 200_000;

const str = (v) => (typeof v === "string" ? v.trim() : "");

// adres obrazka: pełny http(s) albo ścieżka na tej stronie ("/obrazki/x.png")
function validateUrl(raw) {
  const value = str(raw);
  if (!value) return { value: null };
  if (value.length > 500) return { error: "Adres obrazka jest za długi." };
  if (value.startsWith("/") && !value.startsWith("//")) return { value };
  try {
    const url = new URL(value);
    if (url.protocol === "http:" || url.protocol === "https:") return { value };
  } catch {
    // niżej błąd
  }
  return { error: "Adres obrazka musi zaczynać się od https:// albo /" };
}

// partial=true -> tylko podane pola (PATCH)
export function validateArticleInput(body, { partial = false } = {}) {
  const data = {};
  const has = (k) => body && Object.prototype.hasOwnProperty.call(body, k);

  if (!partial || has("title")) {
    const title = str(body?.title);
    if (!title) return { error: "Podaj tytuł artykułu." };
    if (title.length > 255) return { error: "Tytuł może mieć najwyżej 255 znaków." };
    data.title = title;
  }

  if (!partial || has("slug")) {
    const slug = str(body?.slug) ? str(body.slug).toLowerCase() : slugify(data.title);
    if (!slug || slug.length > 200 || !SLUG_RE.test(slug)) {
      return { error: "Adres artykułu może zawierać tylko małe litery, cyfry i myślniki (np. wstep-do-sql)." };
    }
    data.slug = slug;
  }

  if (!partial || has("content")) {
    const content = typeof body?.content === "string" ? body.content.replace(/\s+$/, "") : "";
    if (content.length > CONTENT_MAX) return { error: "Treść artykułu jest za długa." };
    data.content = content;
  }

  if (has("excerpt")) {
    const excerpt = str(body.excerpt);
    if (excerpt.length > 1000) return { error: "Zajawka może mieć najwyżej 1000 znaków." };
    data.excerpt = excerpt || null;
  }

  if (has("coverUrl")) {
    const cover = validateUrl(body.coverUrl);
    if (cover.error) return { error: cover.error };
    data.coverUrl = cover.value;
  }

  if (has("status")) {
    if (!["draft", "published"].includes(body.status)) return { error: "Niepoprawny status artykułu." };
    data.status = body.status;
  }

  return { value: data };
}

// Zwykły tekst z Markdowna (do zajawki na stronie głównej)
export function markdownToPlainText(md) {
  return String(md ?? "")
    .replace(/```[\s\S]*?```/g, " ") // bloki kodu
    .replace(/`([^`]*)`/g, "$1") // kod w linii
    .replace(/<script[\s\S]*?<\/script>|<style[\s\S]*?<\/style>/gi, " ") // wstawki HTML
    .replace(/<[^>]+>/g, " ") // pozostałe znaczniki HTML
    .replace(/!\[[^\]]*\]\((?:[^()]|\([^)]*\))*\)/g, " ") // obrazki (adres może mieć nawiasy)
    .replace(/\[([^\]]*)\]\((?:[^()]|\([^)]*\))*\)/g, "$1") // linki -> sam tekst
    .replace(/^\s{0,3}(#{1,6}|>|[-*+]|\d+\.)\s+/gm, "") // nagłówki, cytaty, listy
    .replace(/^\s*\|?[-:| ]+\|?\s*$/gm, " ") // separatory tabel
    .replace(/[|*_~]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export function autoExcerpt(md, max = 220) {
  const text = markdownToPlainText(md);
  if (text.length <= max) return text;
  const cut = text.slice(0, max);
  return cut.slice(0, cut.lastIndexOf(" ") > max * 0.6 ? cut.lastIndexOf(" ") : max).trimEnd() + "…";
}
