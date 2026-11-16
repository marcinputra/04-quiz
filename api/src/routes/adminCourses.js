// Panel admina: kursy, lekcje i zapisy (prośby o dostęp). requireAdmin ustawia router admina.
import { Router } from "express";
import { prisma } from "../db.js";
import { parseId } from "../lib/access.js";
import { validateIdList } from "../lib/quizValidate.js";
import { validateCourseInput, validateLessonInput } from "../lib/courseValidate.js";
import { enrollmentDecisionMessage, sendMailInBackground } from "../lib/mailer.js";

const router = Router();
const SLUG_TAKEN = { error: "Kurs o takim adresie (slug) już istnieje." };

async function loadCourse(id) {
  return prisma.course.findUnique({
    where: { id },
    select: {
      id: true,
      slug: true,
      title: true,
      description: true,
      isPublished: true,
      createdAt: true,
      lessons: {
        orderBy: [{ position: "asc" }, { id: "asc" }],
        select: { id: true, title: true, content: true, position: true },
      },
      quizzes: {
        orderBy: [{ position: "asc" }, { id: "asc" }],
        select: { id: true, slug: true, title: true, isPublished: true },
      },
    },
  });
}

// ---------------- KURSY ----------------

// GET /api/admin/courses — wszystkie kursy z licznikami
router.get("/courses", async (req, res, next) => {
  try {
    const courses = await prisma.course.findMany({
      orderBy: [{ createdAt: "asc" }, { id: "asc" }],
      select: {
        id: true,
        slug: true,
        title: true,
        isPublished: true,
        _count: { select: { lessons: true, quizzes: true } },
        enrollments: { select: { status: true } },
      },
    });
    res.json(
      courses.map(({ _count, enrollments, ...c }) => ({
        ...c,
        lessons: _count.lessons,
        quizzes: _count.quizzes,
        pending: enrollments.filter((e) => e.status === "pending").length,
        approved: enrollments.filter((e) => e.status === "approved").length,
      }))
    );
  } catch (err) {
    next(err);
  }
});

// POST /api/admin/courses — nowy kurs (szkic)
router.post("/courses", async (req, res, next) => {
  try {
    const input = validateCourseInput(req.body);
    if (input.error) return res.status(400).json({ error: input.error });
    const course = await prisma.course.create({ data: { ...input.value, isPublished: false }, select: { id: true, slug: true } });
    res.status(201).json(course);
  } catch (err) {
    if (err?.code === "P2002") return res.status(409).json(SLUG_TAKEN);
    next(err);
  }
});

// GET /api/admin/courses/:id — kurs z lekcjami i quizami
router.get("/courses/:id", async (req, res, next) => {
  try {
    const id = parseId(req.params.id);
    const course = id ? await loadCourse(id) : null;
    if (!course) return res.status(404).json({ error: "Nie znaleziono kursu." });
    res.json(course);
  } catch (err) {
    next(err);
  }
});

// PATCH /api/admin/courses/:id — dane kursu / publikacja
router.patch("/courses/:id", async (req, res, next) => {
  try {
    const id = parseId(req.params.id);
    if (!id) return res.status(404).json({ error: "Nie znaleziono kursu." });
    const input = validateCourseInput(req.body, { partial: true });
    if (input.error) return res.status(400).json({ error: input.error });
    const updated = await prisma.course.updateMany({ where: { id }, data: input.value });
    if (!updated.count) return res.status(404).json({ error: "Nie znaleziono kursu." });
    res.json(await loadCourse(id));
  } catch (err) {
    if (err?.code === "P2002") return res.status(409).json(SLUG_TAKEN);
    next(err);
  }
});

// DELETE /api/admin/courses/:id — usuwa kurs, lekcje i zapisy.
// Quizy kursu NIE są usuwane: zostają odpięte i ukryte (szkice), żeby nie stały się nagle ogólnodostępne.
router.delete("/courses/:id", async (req, res, next) => {
  try {
    const id = parseId(req.params.id);
    if (!id) return res.status(404).json({ error: "Nie znaleziono kursu." });
    const [, deleted] = await prisma.$transaction([
      prisma.quiz.updateMany({ where: { courseId: id }, data: { isPublished: false, courseId: null } }),
      prisma.course.deleteMany({ where: { id } }),
    ]);
    if (!deleted.count) return res.status(404).json({ error: "Nie znaleziono kursu." });
    res.json({ ok: true });
  } catch (err) {
    next(err);
  }
});

// ---------------- LEKCJE ----------------

// POST /api/admin/courses/:id/lessons — nowa lekcja na końcu
router.post("/courses/:id/lessons", async (req, res, next) => {
  try {
    const courseId = parseId(req.params.id);
    const course = courseId ? await prisma.course.findUnique({ where: { id: courseId }, select: { id: true } }) : null;
    if (!course) return res.status(404).json({ error: "Nie znaleziono kursu." });
    const input = validateLessonInput(req.body);
    if (input.error) return res.status(400).json({ error: input.error });

    const last = await prisma.lesson.aggregate({ where: { courseId }, _max: { position: true } });
    const lesson = await prisma.lesson.create({
      data: { ...input.value, courseId, position: (last._max.position ?? -1) + 1 },
      select: { id: true, title: true, content: true, position: true },
    });
    res.status(201).json(lesson);
  } catch (err) {
    next(err);
  }
});

// PUT /api/admin/courses/:id/lessons/order  { ids }
router.put("/courses/:id/lessons/order", async (req, res, next) => {
  try {
    const courseId = parseId(req.params.id);
    const ids = validateIdList(req.body?.ids);
    if (!courseId) return res.status(404).json({ error: "Nie znaleziono kursu." });
    if (ids.error) return res.status(400).json({ error: ids.error });
    const count = await prisma.lesson.count({ where: { courseId, id: { in: ids.value } } });
    if (count !== ids.value.length) return res.status(400).json({ error: "Lekcje nie należą do tego kursu." });
    await prisma.$transaction(ids.value.map((id, position) => prisma.lesson.update({ where: { id }, data: { position } })));
    res.json({ ok: true });
  } catch (err) {
    next(err);
  }
});

// PUT /api/admin/lessons/:id — edycja lekcji
router.put("/lessons/:id", async (req, res, next) => {
  try {
    const id = parseId(req.params.id);
    if (!id) return res.status(404).json({ error: "Nie znaleziono lekcji." });
    const input = validateLessonInput(req.body);
    if (input.error) return res.status(400).json({ error: input.error });
    const updated = await prisma.lesson.updateMany({ where: { id }, data: input.value });
    if (!updated.count) return res.status(404).json({ error: "Nie znaleziono lekcji." });
    res.json(await prisma.lesson.findUnique({ where: { id }, select: { id: true, title: true, content: true, position: true } }));
  } catch (err) {
    next(err);
  }
});

// DELETE /api/admin/lessons/:id
router.delete("/lessons/:id", async (req, res, next) => {
  try {
    const id = parseId(req.params.id);
    const deleted = id ? await prisma.lesson.deleteMany({ where: { id } }) : { count: 0 };
    if (!deleted.count) return res.status(404).json({ error: "Nie znaleziono lekcji." });
    res.json({ ok: true });
  } catch (err) {
    next(err);
  }
});

// ---------------- ZAPISY (prośby o dostęp) ----------------

const STATUSES = ["pending", "approved", "rejected"];

// GET /api/admin/enrollments?status=pending|approved|rejected  (bez status = wszystkie)
router.get("/enrollments", async (req, res, next) => {
  try {
    const status = STATUSES.includes(req.query.status) ? req.query.status : undefined;
    const enrollments = await prisma.enrollment.findMany({
      where: status ? { status } : {},
      orderBy: [{ requestedAt: "desc" }],
      select: {
        status: true,
        requestedAt: true,
        decidedAt: true,
        user: { select: { id: true, name: true, email: true } },
        course: { select: { id: true, slug: true, title: true } },
        decidedBy: { select: { name: true } },
      },
    });
    res.json(enrollments.map((e) => ({ ...e, decidedBy: e.decidedBy?.name ?? null })));
  } catch (err) {
    next(err);
  }
});

// GET /api/admin/enrollments/pending-count — liczba oczekujących (plakietka w panelu)
router.get("/enrollments/pending-count", async (req, res, next) => {
  try {
    res.json({ count: await prisma.enrollment.count({ where: { status: "pending" } }) });
  } catch (err) {
    next(err);
  }
});

// PATCH /api/admin/enrollments/:userId/:courseId  { status: "approved" | "rejected" }
// Uczeń dostaje e-mail z decyzją.
router.patch("/enrollments/:userId/:courseId", async (req, res, next) => {
  try {
    const userId = parseId(req.params.userId);
    const courseId = parseId(req.params.courseId);
    const status = req.body?.status;
    if (!["approved", "rejected"].includes(status)) return res.status(400).json({ error: "Niepoprawna decyzja." });
    if (!userId || !courseId) return res.status(404).json({ error: "Nie znaleziono zapisu." });

    const where = { userId_courseId: { userId, courseId } };
    const existing = await prisma.enrollment.findUnique({ where, select: { status: true } });
    if (!existing) return res.status(404).json({ error: "Nie znaleziono zapisu." });

    const enrollment = await prisma.enrollment.update({
      where,
      data: { status, decidedAt: new Date(), decidedById: req.user.id },
      select: {
        status: true,
        user: { select: { name: true, email: true } },
        course: { select: { title: true, slug: true } },
      },
    });

    if (existing.status !== status) {
      sendMailInBackground(
        enrollmentDecisionMessage({
          name: enrollment.user.name,
          email: enrollment.user.email,
          courseTitle: enrollment.course.title,
          courseSlug: enrollment.course.slug,
          approved: status === "approved",
        })
      );
    }
    res.json({ status: enrollment.status });
  } catch (err) {
    next(err);
  }
});

// DELETE /api/admin/enrollments/:userId/:courseId — usunięcie zapisu (uczeń może poprosić od nowa)
router.delete("/enrollments/:userId/:courseId", async (req, res, next) => {
  try {
    const userId = parseId(req.params.userId);
    const courseId = parseId(req.params.courseId);
    const deleted =
      userId && courseId ? await prisma.enrollment.deleteMany({ where: { userId, courseId } }) : { count: 0 };
    if (!deleted.count) return res.status(404).json({ error: "Nie znaleziono zapisu." });
    res.json({ ok: true });
  } catch (err) {
    next(err);
  }
});

export default router;
