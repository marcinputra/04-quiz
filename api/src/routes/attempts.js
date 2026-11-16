import { Router } from "express";
import { prisma } from "../db.js";
import { requireAuth } from "../middleware/auth.js";
import { parseId } from "../lib/access.js";

const router = Router();
router.use(requireAuth);

const percent = (score, total) => (total > 0 ? Math.round((score / total) * 100) : 0);

// Podejście należące do zalogowanego użytkownika (albo null)
async function findOwnAttempt(req) {
  const id = parseId(req.params.id);
  if (!id) return null;
  const attempt = await prisma.quizAttempt.findUnique({
    where: { id },
    select: {
      id: true,
      userId: true,
      quizId: true,
      total: true,
      finishedAt: true,
      quiz: { select: { lockOnLeave: true } },
    },
  });
  return attempt && attempt.userId === req.user.id ? attempt : null;
}

// POST /api/attempts/:id/answer  { questionId, optionId }
// Sprawdza odpowiedź na serwerze i od razu zwraca poprawną (do kolorowania przycisków).
// Odpowiedzi nie da się zmienić — druga próba zwraca pierwszą zapisaną.
router.post("/:id/answer", async (req, res, next) => {
  try {
    const attempt = await findOwnAttempt(req);
    if (!attempt) return res.status(404).json({ error: "Nie znaleziono podejścia." });
    if (attempt.finishedAt) return res.status(409).json({ error: "Ten quiz został już zakończony." });

    const questionId = parseId(req.body?.questionId);
    const optionId = parseId(req.body?.optionId);
    if (!questionId || !optionId) return res.status(400).json({ error: "Brak pytania lub odpowiedzi." });

    // odpowiedź musi należeć do tego pytania, a pytanie do quizu z tego podejścia
    const option = await prisma.answerOption.findUnique({
      where: { id: optionId },
      select: { questionId: true, isCorrect: true, question: { select: { quizId: true } } },
    });
    if (!option || option.questionId !== questionId || option.question.quizId !== attempt.quizId) {
      return res.status(400).json({ error: "Niepoprawna odpowiedź dla tego pytania." });
    }

    const correctOption = await prisma.answerOption.findFirst({
      where: { questionId, isCorrect: true },
      select: { id: true },
    });

    let saved = { optionId, isCorrect: option.isCorrect };
    let alreadyAnswered = false;
    try {
      await prisma.$transaction([
        prisma.attemptAnswer.create({
          data: { attemptId: attempt.id, questionId, optionId, isCorrect: option.isCorrect },
        }),
        prisma.quizAttempt.update({
          where: { id: attempt.id },
          data: { score: { increment: option.isCorrect ? 1 : 0 } },
        }),
      ]);
    } catch (err) {
      if (err?.code !== "P2002") throw err;
      // już odpowiedziano na to pytanie (np. podwójne kliknięcie) — zwracamy pierwszą odpowiedź
      alreadyAnswered = true;
      saved = await prisma.attemptAnswer.findUnique({
        where: { attemptId_questionId: { attemptId: attempt.id, questionId } },
        select: { optionId: true, isCorrect: true },
      });
    }

    res.json({
      correct: saved.isCorrect,
      selectedOptionId: saved.optionId,
      correctOptionId: correctOption?.id ?? null,
      alreadyAnswered,
    });
  } catch (err) {
    next(err);
  }
});

const AUTO_END_REASONS = new Set(["left_page", "window_blur"]);

// POST /api/attempts/:id/finish  { reason?: "left_page" | "window_blur" } — zakończenie i wynik.
// reason wysyła przeglądarka w quizie z opcją lockOnLeave, gdy uczeń opuścił kartę ("left_page")
// albo okno przeglądarki przestało być aktywne ("window_blur"):
// podejście kończy się z dotychczasowymi odpowiedziami, a kolejne są odrzucane (409 w /answer).
router.post("/:id/finish", async (req, res, next) => {
  try {
    const attempt = await findOwnAttempt(req);
    if (!attempt) return res.status(404).json({ error: "Nie znaleziono podejścia." });

    const reason = req.body?.reason;
    const endReason = attempt.quiz.lockOnLeave && AUTO_END_REASONS.has(reason) ? reason : null;

    // wynik liczony od nowa z zapisanych odpowiedzi
    const score = await prisma.attemptAnswer.count({ where: { attemptId: attempt.id, isCorrect: true } });
    const updated = await prisma.quizAttempt.update({
      where: { id: attempt.id },
      // już zakończonego podejścia nie zmieniamy (ani daty, ani powodu)
      data: attempt.finishedAt ? { score } : { score, finishedAt: new Date(), endReason },
      select: { id: true, score: true, total: true, finishedAt: true, endReason: true },
    });

    res.json({ ...updated, percent: percent(updated.score, updated.total) });
  } catch (err) {
    next(err);
  }
});

// GET /api/attempts — moje zakończone podejścia, najnowsze pierwsze
router.get("/", async (req, res, next) => {
  try {
    const attempts = await prisma.quizAttempt.findMany({
      where: { userId: req.user.id, finishedAt: { not: null } },
      orderBy: { finishedAt: "desc" },
      select: {
        id: true,
        score: true,
        total: true,
        startedAt: true,
        finishedAt: true,
        endReason: true,
        quiz: { select: { slug: true, title: true, topic: true, level: true } },
      },
    });
    res.json(attempts.map((a) => ({ ...a, percent: percent(a.score, a.total) })));
  } catch (err) {
    next(err);
  }
});

// GET /api/attempts/:id — szczegóły zakończonego podejścia (właściciel albo admin):
// każde pytanie z wybraną i poprawną odpowiedzią
router.get("/:id", async (req, res, next) => {
  try {
    const id = parseId(req.params.id);
    const attempt = id
      ? await prisma.quizAttempt.findUnique({
          where: { id },
          select: {
            id: true,
            userId: true,
            quizId: true,
            score: true,
            total: true,
            startedAt: true,
            finishedAt: true,
            endReason: true,
            user: { select: { name: true, email: true } },
            quiz: { select: { slug: true, title: true } },
            answers: { select: { questionId: true, optionId: true, isCorrect: true } },
          },
        })
      : null;

    const allowed = attempt && (attempt.userId === req.user.id || req.user.role === "admin");
    // niezakończone nie pokazujemy — zdradziłoby odpowiedzi na pytania jeszcze bez odpowiedzi
    if (!allowed || !attempt.finishedAt) {
      return res.status(404).json({ error: "Nie znaleziono wyniku." });
    }

    const questions = await prisma.question.findMany({
      where: { quizId: attempt.quizId },
      orderBy: [{ position: "asc" }, { id: "asc" }],
      select: {
        id: true,
        question: true,
        code: true,
        options: {
          orderBy: [{ position: "asc" }, { id: "asc" }],
          select: { id: true, text: true, isCorrect: true },
        },
      },
    });

    const answerByQuestion = new Map(attempt.answers.map((a) => [a.questionId, a]));
    const { answers, userId, quizId, ...rest } = attempt;

    res.json({
      ...rest,
      percent: percent(attempt.score, attempt.total),
      questions: questions.map((q) => ({
        ...q,
        code: q.code ?? "",
        selectedOptionId: answerByQuestion.get(q.id)?.optionId ?? null,
        correct: answerByQuestion.get(q.id)?.isCorrect ?? false,
      })),
    });
  } catch (err) {
    next(err);
  }
});

export default router;
