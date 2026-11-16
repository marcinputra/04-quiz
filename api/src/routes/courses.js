// Kursy — widok ucznia: lista, opis, prośba o dostęp, lekcje (tylko z zatwierdzonym dostępem)
import { Router } from "express";
import { prisma } from "../db.js";
import { requireAuth } from "../middleware/auth.js";
import { parseId } from "../lib/access.js";
import { enrollmentRequestMessage, sendMailInBackground } from "../lib/mailer.js";

const router = Router();

// opublikowany kurs albo dowolny dla admina (podgląd)
async function findVisibleCourse(slug, user) {
  const course = await prisma.course.findUnique({ where: { slug } });
  if (!course) return null;
  if (!course.isPublished && user?.role !== "admin") return null;
  return course;
}

async function enrollmentOf(user, courseId) {
  if (!user) return null;
  return prisma.enrollment.findUnique({
    where: { userId_courseId: { userId: user.id, courseId } },
    select: { status: true, requestedAt: true, decidedAt: true },
  });
}

const hasAccess = (user, enrollment) => user?.role === "admin" || enrollment?.status === "approved";

// GET /api/courses — opublikowane kursy (+ mój status zapisu, jeśli zalogowany)
router.get("/", async (req, res, next) => {
  try {
    const courses = await prisma.course.findMany({
      where: { isPublished: true },
      orderBy: [{ createdAt: "asc" }, { id: "asc" }],
      select: {
        id: true,
        slug: true,
        title: true,
        description: true,
        _count: { select: { lessons: true, quizzes: { where: { isPublished: true } } } },
        enrollments: req.user ? { where: { userId: req.user.id }, select: { status: true } } : false,
      },
    });
    res.json(
      courses.map(({ _count, enrollments, id, ...c }) => ({
        ...c,
        lessons: _count.lessons,
        quizzes: _count.quizzes,
        enrollmentStatus: enrollments?.[0]?.status ?? null,
      }))
    );
  } catch (err) {
    next(err);
  }
});

// GET /api/courses/:slug — opis kursu, spis lekcji (tytuły widzi każdy), quizy i mój status
router.get("/:slug", async (req, res, next) => {
  try {
    const course = await findVisibleCourse(req.params.slug, req.user);
    if (!course) return res.status(404).json({ error: "Nie znaleziono kursu." });

    const [lessons, quizzes, enrollment] = await Promise.all([
      prisma.lesson.findMany({
        where: { courseId: course.id },
        orderBy: [{ position: "asc" }, { id: "asc" }],
        select: { id: true, title: true },
      }),
      prisma.quiz.findMany({
        where: { courseId: course.id, isPublished: true },
        orderBy: [{ position: "asc" }, { id: "asc" }],
        select: { slug: true, title: true, description: true, _count: { select: { questions: true } } },
      }),
      enrollmentOf(req.user, course.id),
    ]);

    res.json({
      slug: course.slug,
      title: course.title,
      description: course.description,
      isPublished: course.isPublished,
      lessons,
      quizzes: quizzes.map(({ _count, ...q }) => ({ ...q, questions: _count.questions })),
      enrollment,
      hasAccess: hasAccess(req.user, enrollment),
    });
  } catch (err) {
    next(err);
  }
});

// GET /api/courses/:slug/lessons/:id — treść lekcji (tylko z dostępem)
router.get("/:slug/lessons/:id", requireAuth, async (req, res, next) => {
  try {
    const course = await findVisibleCourse(req.params.slug, req.user);
    const lessonId = parseId(req.params.id);
    if (!course || !lessonId) return res.status(404).json({ error: "Nie znaleziono lekcji." });

    const enrollment = await enrollmentOf(req.user, course.id);
    if (!hasAccess(req.user, enrollment)) {
      return res.status(403).json({ error: "Nie masz dostępu do tego kursu.", code: "NO_ACCESS" });
    }

    const lessons = await prisma.lesson.findMany({
      where: { courseId: course.id },
      orderBy: [{ position: "asc" }, { id: "asc" }],
      select: { id: true, title: true },
    });
    const index = lessons.findIndex((l) => l.id === lessonId);
    if (index === -1) return res.status(404).json({ error: "Nie znaleziono lekcji." });

    const lesson = await prisma.lesson.findUnique({ where: { id: lessonId }, select: { id: true, title: true, content: true } });
    res.json({
      lesson,
      number: index + 1,
      course: { slug: course.slug, title: course.title },
      lessons,
      prevId: lessons[index - 1]?.id ?? null,
      nextId: lessons[index + 1]?.id ?? null,
    });
  } catch (err) {
    next(err);
  }
});

// POST /api/courses/:slug/enroll — prośba o dostęp (czeka na zatwierdzenie przez admina)
router.post("/:slug/enroll", requireAuth, async (req, res, next) => {
  try {
    const course = await findVisibleCourse(req.params.slug, req.user);
    if (!course) return res.status(404).json({ error: "Nie znaleziono kursu." });

    const where = { userId_courseId: { userId: req.user.id, courseId: course.id } };
    const existing = await prisma.enrollment.findUnique({ where });
    if (existing && existing.status !== "rejected") {
      return res.json({ status: existing.status, requestedAt: existing.requestedAt });
    }

    // nowa prośba albo ponowna po odrzuceniu
    const enrollment = await prisma.enrollment.upsert({
      where,
      create: { userId: req.user.id, courseId: course.id },
      update: { status: "pending", requestedAt: new Date(), decidedAt: null, decidedById: null },
      select: { status: true, requestedAt: true },
    });

    // powiadomienie adminów — błąd poczty nie blokuje prośby
    const admins = await prisma.user.findMany({
      where: { role: "admin", emailVerifiedAt: { not: null } },
      select: { email: true },
    });
    for (const admin of admins) {
      sendMailInBackground(
        enrollmentRequestMessage({
          adminEmail: admin.email,
          studentName: req.user.name,
          studentEmail: req.user.email,
          courseTitle: course.title,
        })
      );
    }

    res.status(201).json(enrollment);
  } catch (err) {
    next(err);
  }
});

export default router;
