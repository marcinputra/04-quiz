// Artykuły — publiczne (strona główna) i edytor w panelu admina
import { Router } from "express";
import { prisma } from "../db.js";
import { parseId } from "../lib/access.js";
import { requireAdmin } from "../middleware/auth.js";
import { validateArticleInput, autoExcerpt } from "../lib/articleValidate.js";

export const publicRouter = Router();
export const adminRouter = Router();
adminRouter.use(requireAdmin);

const listSelect = {
  id: true,
  slug: true,
  title: true,
  excerpt: true,
  content: true,
  coverUrl: true,
  status: true,
  publishedAt: true,
  createdAt: true,
  updatedAt: true,
  author: { select: { name: true } },
};

// na liście zamiast pełnej treści — zajawka (własna albo z początku treści)
const toListItem = ({ content, excerpt, ...a }) => ({
  ...a,
  excerpt: excerpt || autoExcerpt(content),
  author: a.author?.name ?? null,
});

const SLUG_TAKEN = { error: "Artykuł o takim adresie (slug) już istnieje." };

// ---------------- publiczne ----------------

// GET /api/articles?page=1&limit=10 — opublikowane, najnowsze pierwsze
publicRouter.get("/", async (req, res, next) => {
  try {
    const limit = Math.min(Math.max(Number(req.query.limit) || 10, 1), 50);
    const page = Math.max(Number(req.query.page) || 1, 1);
    const where = { status: "published" };

    const [total, items] = await Promise.all([
      prisma.article.count({ where }),
      prisma.article.findMany({
        where,
        orderBy: [{ publishedAt: "desc" }, { id: "desc" }],
        skip: (page - 1) * limit,
        take: limit,
        select: listSelect,
      }),
    ]);

    res.json({ items: items.map(toListItem), total, page, pages: Math.max(Math.ceil(total / limit), 1) });
  } catch (err) {
    next(err);
  }
});

// GET /api/articles/:slug — opublikowany artykuł (admin widzi też szkice — podgląd)
publicRouter.get("/:slug", async (req, res, next) => {
  try {
    const article = await prisma.article.findUnique({
      where: { slug: req.params.slug },
      select: { ...listSelect },
    });
    const visible = article && (article.status === "published" || req.user?.role === "admin");
    if (!visible) return res.status(404).json({ error: "Nie znaleziono artykułu." });

    res.json({ ...article, author: article.author?.name ?? null });
  } catch (err) {
    next(err);
  }
});

// ---------------- admin ----------------

// GET /api/admin/articles — wszystkie, także szkice
adminRouter.get("/", async (req, res, next) => {
  try {
    const items = await prisma.article.findMany({
      orderBy: [{ updatedAt: "desc" }],
      select: listSelect,
    });
    res.json(items.map(toListItem));
  } catch (err) {
    next(err);
  }
});

// GET /api/admin/articles/:id — do edycji (pełna treść)
adminRouter.get("/:id", async (req, res, next) => {
  try {
    const id = parseId(req.params.id);
    const article = id ? await prisma.article.findUnique({ where: { id }, select: listSelect }) : null;
    if (!article) return res.status(404).json({ error: "Nie znaleziono artykułu." });
    res.json({ ...article, author: article.author?.name ?? null });
  } catch (err) {
    next(err);
  }
});

// przy publikacji ustawiamy datę publikacji (tylko za pierwszym razem)
const withPublishDate = (data, current) =>
  data.status === "published" && !current?.publishedAt ? { ...data, publishedAt: new Date() } : data;

// POST /api/admin/articles — nowy artykuł (domyślnie szkic)
adminRouter.post("/", async (req, res, next) => {
  try {
    const input = validateArticleInput(req.body);
    if (input.error) return res.status(400).json({ error: input.error });
    if (input.value.status === "published" && !input.value.content) {
      return res.status(400).json({ error: "Nie można opublikować pustego artykułu." });
    }

    const article = await prisma.article.create({
      data: withPublishDate({ status: "draft", ...input.value, authorId: req.user.id }),
      select: listSelect,
    });
    res.status(201).json({ ...article, author: article.author?.name ?? null });
  } catch (err) {
    if (err?.code === "P2002") return res.status(409).json(SLUG_TAKEN);
    next(err);
  }
});

// PATCH /api/admin/articles/:id — zapis zmian / publikacja / cofnięcie publikacji
adminRouter.patch("/:id", async (req, res, next) => {
  try {
    const id = parseId(req.params.id);
    const current = id
      ? await prisma.article.findUnique({ where: { id }, select: { publishedAt: true, content: true } })
      : null;
    if (!current) return res.status(404).json({ error: "Nie znaleziono artykułu." });

    const input = validateArticleInput(req.body, { partial: true });
    if (input.error) return res.status(400).json({ error: input.error });
    const content = input.value.content ?? current.content;
    if (input.value.status === "published" && !content) {
      return res.status(400).json({ error: "Nie można opublikować pustego artykułu." });
    }

    const article = await prisma.article.update({
      where: { id },
      data: withPublishDate(input.value, current),
      select: listSelect,
    });
    res.json({ ...article, author: article.author?.name ?? null });
  } catch (err) {
    if (err?.code === "P2002") return res.status(409).json(SLUG_TAKEN);
    next(err);
  }
});

// DELETE /api/admin/articles/:id
adminRouter.delete("/:id", async (req, res, next) => {
  try {
    const id = parseId(req.params.id);
    const deleted = id ? await prisma.article.deleteMany({ where: { id } }) : { count: 0 };
    if (!deleted.count) return res.status(404).json({ error: "Nie znaleziono artykułu." });
    res.json({ ok: true });
  } catch (err) {
    next(err);
  }
});
