import { Router } from "express";
import { prisma } from "../db.js";
import { requireAuth } from "../middleware/auth.js";
import { canAccessQuiz, visibleQuizzesWhere } from "../lib/access.js";

const router = Router();

const metaSelect = {
  id: true,
  slug: true,
  title: true,
  description: true,
  level: true,
  topic: true,
  courseId: true,
  isPublished: true,
  shuffle: true,
  lockOnLeave: true,
  _count: { select: { questions: true } },
};

// format zgodny z dawnym quizList.json (id = slug)
const toListItem = (q) => ({
  id: q.slug,
  title: q.title,
  content: q.description,
  level: q.level,
  topic: q.topic,
  questions: q._count.questions,
  isPublished: q.isPublished,
  lockOnLeave: q.lockOnLeave, // ekran startowy uprzedza, że opuszczenie karty zakończy quiz
});

function shuffle(array) {
  const a = [...array];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

// GET /api/quizzes — lista quizów (publiczna, żeby gość widział, co może rozwiązać po zalogowaniu).
// Same metadane — bez pytań i odpowiedzi.
router.get("/", async (req, res, next) => {
  try {
    const quizzes = await prisma.quiz.findMany({
      where: visibleQuizzesWhere(req.user),
      orderBy: [{ position: "asc" }, { id: "asc" }],
      select: metaSelect,
    });
    res.json(quizzes.map(toListItem));
  } catch (err) {
    next(err);
  }
});

// GET /api/quizzes/:slug — metadane jednego quizu (ekran startowy)
router.get("/:slug", requireAuth, async (req, res, next) => {
  try {
    const quiz = await prisma.quiz.findUnique({ where: { slug: req.params.slug }, select: metaSelect });
    if (!quiz || !(await canAccessQuiz(req.user, quiz))) {
      return res.status(404).json({ error: "Nie znaleziono quizu." });
    }
    res.json(toListItem(quiz));
  } catch (err) {
    next(err);
  }
});

// POST /api/quizzes/:slug/attempts — rozpoczęcie podejścia.
// Zwraca pytania z odpowiedziami, ale BEZ informacji, która jest poprawna.
router.post("/:slug/attempts", requireAuth, async (req, res, next) => {
  try {
    const quiz = await prisma.quiz.findUnique({
      where: { slug: req.params.slug },
      select: {
        ...metaSelect,
        questions: {
          orderBy: [{ position: "asc" }, { id: "asc" }],
          select: {
            id: true,
            question: true,
            code: true,
            options: {
              orderBy: [{ position: "asc" }, { id: "asc" }],
              select: { id: true, text: true }, // bez isCorrect!
            },
          },
        },
      },
    });

    if (!quiz || !(await canAccessQuiz(req.user, quiz))) {
      return res.status(404).json({ error: "Nie znaleziono quizu." });
    }
    if (!quiz.questions.length) {
      return res.status(409).json({ error: "Ten quiz nie ma jeszcze pytań." });
    }

    const attempt = await prisma.quizAttempt.create({
      data: { userId: req.user.id, quizId: quiz.id, total: quiz.questions.length },
      select: { id: true, total: true, startedAt: true },
    });

    // kolejność pytań losowana jak wcześniej; kolejność odpowiedzi A–D zostaje
    const questions = quiz.shuffle ? shuffle(quiz.questions) : quiz.questions;

    res.status(201).json({
      attemptId: attempt.id,
      total: attempt.total,
      quiz: toListItem(quiz),
      questions: questions.map((q) => ({ ...q, code: q.code ?? "" })),
    });
  } catch (err) {
    next(err);
  }
});

export default router;
