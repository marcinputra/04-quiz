import { Router } from "express";
import { prisma } from "../db.js";
import { requireAdmin } from "../middleware/auth.js";
import { publicUserSelect, publicUser } from "../lib/auth.js";
import quizEditorRoutes from "./adminQuizzes.js";
import courseAdminRoutes from "./adminCourses.js";

const router = Router();

// wszystko pod /api/admin wymaga roli admin
router.use(requireAdmin);

// edytor quizów i pytań: /api/admin/quizzes..., /api/admin/questions/...
router.use(quizEditorRoutes);

// kursy, lekcje, zapisy: /api/admin/courses..., /api/admin/lessons/..., /api/admin/enrollments...
router.use(courseAdminRoutes);

// GET /api/admin/users — lista kont (bez haseł), najnowsze pierwsze
router.get("/users", async (req, res, next) => {
  try {
    const users = await prisma.user.findMany({
      orderBy: { createdAt: "desc" },
      select: publicUserSelect,
    });
    res.json(users.map(publicUser));
  } catch (err) {
    next(err);
  }
});

// GET /api/admin/attempts — ostatnie zakończone podejścia wszystkich uczniów
//   ?quiz=<slug>  — tylko dany quiz
//   ?limit=<n>    — ile wyników (domyślnie 200, max 1000)
router.get("/attempts", async (req, res, next) => {
  try {
    const limit = Math.min(Math.max(Number(req.query.limit) || 200, 1), 1000);
    const where = { finishedAt: { not: null } };
    if (typeof req.query.quiz === "string" && req.query.quiz) where.quiz = { slug: req.query.quiz };

    const attempts = await prisma.quizAttempt.findMany({
      where,
      orderBy: { finishedAt: "desc" },
      take: limit,
      select: {
        id: true,
        score: true,
        total: true,
        startedAt: true,
        finishedAt: true,
        endReason: true,
        user: { select: { id: true, name: true, email: true } },
        quiz: { select: { slug: true, title: true } },
      },
    });
    res.json(
      attempts.map((a) => ({ ...a, percent: a.total ? Math.round((a.score / a.total) * 100) : 0 }))
    );
  } catch (err) {
    next(err);
  }
});

export default router;
