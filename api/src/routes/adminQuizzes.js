// Edytor quizów i pytań — wszystko pod /api/admin (requireAdmin ustawia router admina)
import { Router } from "express";
import { prisma } from "../db.js";
import { parseId } from "../lib/access.js";
import { validateQuizInput, validateQuestionInput, validateIdList } from "../lib/quizValidate.js";

const router = Router();

const questionSelect = {
  id: true,
  question: true,
  code: true,
  position: true,
  options: {
    orderBy: [{ position: "asc" }, { id: "asc" }],
    // _count.attemptAnswers > 0 -> odpowiedź wybierali uczniowie (nie można jej usunąć)
    select: { id: true, text: true, isCorrect: true, position: true, _count: { select: { attemptAnswers: true } } },
  },
  _count: { select: { attemptAnswers: true } },
};

const slugTaken = (err) => err?.code === "P2002";

// czy podany kurs istnieje (przy przypisywaniu quizu do kursu)
async function courseMissing(data) {
  if (data.courseId == null) return false;
  return !(await prisma.course.findUnique({ where: { id: data.courseId }, select: { id: true } }));
}
const SLUG_TAKEN = { error: "Quiz o takim adresie (slug) już istnieje." };

async function loadQuiz(id) {
  return prisma.quiz.findUnique({
    where: { id },
    select: {
      id: true,
      slug: true,
      title: true,
      description: true,
      level: true,
      topic: true,
      isPublished: true,
      shuffle: true,
      lockOnLeave: true,
      position: true,
      courseId: true,
      _count: { select: { attempts: true } },
      questions: { orderBy: [{ position: "asc" }, { id: "asc" }], select: questionSelect },
    },
  });
}

// ---------------- QUIZY ----------------

// GET /api/admin/quizzes — wszystkie quizy, także szkice
router.get("/quizzes", async (req, res, next) => {
  try {
    const quizzes = await prisma.quiz.findMany({
      orderBy: [{ position: "asc" }, { id: "asc" }],
      select: {
        id: true,
        slug: true,
        title: true,
        level: true,
        topic: true,
        isPublished: true,
        position: true,
        course: { select: { id: true, title: true } },
        _count: { select: { questions: true, attempts: true } },
      },
    });
    res.json(
      quizzes.map(({ _count, ...q }) => ({ ...q, questions: _count.questions, attempts: _count.attempts }))
    );
  } catch (err) {
    next(err);
  }
});

// PUT /api/admin/quizzes/order  { ids: [3, 1, 2] } — kolejność na liście quizów
router.put("/quizzes/order", async (req, res, next) => {
  try {
    const ids = validateIdList(req.body?.ids);
    if (ids.error) return res.status(400).json({ error: ids.error });
    await prisma.$transaction(
      ids.value.map((id, position) => prisma.quiz.updateMany({ where: { id }, data: { position } }))
    );
    res.json({ ok: true });
  } catch (err) {
    next(err);
  }
});

// POST /api/admin/quizzes — nowy quiz (domyślnie szkic, na końcu listy)
router.post("/quizzes", async (req, res, next) => {
  try {
    const input = validateQuizInput(req.body);
    if (input.error) return res.status(400).json({ error: input.error });
    if (input.value.isPublished) {
      return res.status(400).json({ error: "Nowy quiz nie ma jeszcze pytań — opublikuj go po ich dodaniu." });
    }
    if (await courseMissing(input.value)) return res.status(400).json({ error: "Nie ma takiego kursu." });

    const last = await prisma.quiz.aggregate({ _max: { position: true } });
    const quiz = await prisma.quiz.create({
      data: { ...input.value, isPublished: false, position: (last._max.position ?? -1) + 1 },
      select: { id: true, slug: true },
    });
    res.status(201).json(quiz);
  } catch (err) {
    if (slugTaken(err)) return res.status(409).json(SLUG_TAKEN);
    next(err);
  }
});

// GET /api/admin/quizzes/:id — quiz z pytaniami i poprawnymi odpowiedziami
router.get("/quizzes/:id", async (req, res, next) => {
  try {
    const id = parseId(req.params.id);
    const quiz = id ? await loadQuiz(id) : null;
    if (!quiz) return res.status(404).json({ error: "Nie znaleziono quizu." });
    res.json(quiz);
  } catch (err) {
    next(err);
  }
});

// PATCH /api/admin/quizzes/:id — zmiana danych quizu / publikacja
router.patch("/quizzes/:id", async (req, res, next) => {
  try {
    const id = parseId(req.params.id);
    if (!id) return res.status(404).json({ error: "Nie znaleziono quizu." });
    const input = validateQuizInput(req.body, { partial: true });
    if (input.error) return res.status(400).json({ error: input.error });
    if (await courseMissing(input.value)) return res.status(400).json({ error: "Nie ma takiego kursu." });

    if (input.value.isPublished) {
      const count = await prisma.question.count({ where: { quizId: id } });
      if (count === 0) return res.status(400).json({ error: "Nie można opublikować quizu bez pytań." });
    }

    const updated = await prisma.quiz.updateMany({ where: { id }, data: input.value });
    if (!updated.count) return res.status(404).json({ error: "Nie znaleziono quizu." });
    res.json(await loadQuiz(id));
  } catch (err) {
    if (slugTaken(err)) return res.status(409).json(SLUG_TAKEN);
    next(err);
  }
});

// DELETE /api/admin/quizzes/:id[?force=1] — usuwa quiz z pytaniami.
// Jeśli są wyniki uczniów, bez force=1 zwraca 409 z ich liczbą (UI pyta o potwierdzenie).
router.delete("/quizzes/:id", async (req, res, next) => {
  try {
    const id = parseId(req.params.id);
    const quiz = id
      ? await prisma.quiz.findUnique({ where: { id }, select: { _count: { select: { attempts: true } } } })
      : null;
    if (!quiz) return res.status(404).json({ error: "Nie znaleziono quizu." });

    if (quiz._count.attempts > 0 && req.query.force !== "1") {
      return res.status(409).json({
        error: `Ten quiz ma ${quiz._count.attempts} wyników uczniów — zostaną usunięte razem z nim.`,
        attempts: quiz._count.attempts,
      });
    }
    await prisma.quiz.delete({ where: { id } });
    res.json({ ok: true });
  } catch (err) {
    next(err);
  }
});

// ---------------- PYTANIA ----------------

// POST /api/admin/quizzes/:id/questions — nowe pytanie na końcu quizu
router.post("/quizzes/:id/questions", async (req, res, next) => {
  try {
    const quizId = parseId(req.params.id);
    const quiz = quizId ? await prisma.quiz.findUnique({ where: { id: quizId }, select: { id: true } }) : null;
    if (!quiz) return res.status(404).json({ error: "Nie znaleziono quizu." });

    const input = validateQuestionInput(req.body);
    if (input.error) return res.status(400).json({ error: input.error });

    const last = await prisma.question.aggregate({ where: { quizId }, _max: { position: true } });
    const { options, ...q } = input.value;
    const question = await prisma.question.create({
      data: {
        ...q,
        quizId,
        position: (last._max.position ?? -1) + 1,
        options: { create: options.map(({ id, ...o }) => o) },
      },
      select: questionSelect,
    });
    res.status(201).json(question);
  } catch (err) {
    next(err);
  }
});

// PUT /api/admin/quizzes/:id/questions/order  { ids: [...] } — kolejność pytań
router.put("/quizzes/:id/questions/order", async (req, res, next) => {
  try {
    const quizId = parseId(req.params.id);
    const ids = validateIdList(req.body?.ids);
    if (!quizId) return res.status(404).json({ error: "Nie znaleziono quizu." });
    if (ids.error) return res.status(400).json({ error: ids.error });

    const count = await prisma.question.count({ where: { quizId, id: { in: ids.value } } });
    if (count !== ids.value.length) return res.status(400).json({ error: "Pytania nie należą do tego quizu." });

    await prisma.$transaction(
      ids.value.map((id, position) => prisma.question.update({ where: { id }, data: { position } }))
    );
    res.json({ ok: true });
  } catch (err) {
    next(err);
  }
});

// PUT /api/admin/questions/:id — edycja pytania i odpowiedzi.
// Odpowiedzi z id są aktualizowane, bez id — dodawane, brakujące — usuwane.
// Odpowiedzi, którą wybrał już jakiś uczeń, nie można usunąć (można zmienić jej treść).
router.put("/questions/:id", async (req, res, next) => {
  try {
    const id = parseId(req.params.id);
    const existing = id
      ? await prisma.question.findUnique({
          where: { id },
          select: {
            id: true,
            options: { select: { id: true, position: true, _count: { select: { attemptAnswers: true } } } },
          },
        })
      : null;
    if (!existing) return res.status(404).json({ error: "Nie znaleziono pytania." });

    const input = validateQuestionInput(req.body);
    if (input.error) return res.status(400).json({ error: input.error });
    const { options, ...q } = input.value;

    const existingById = new Map(existing.options.map((o) => [o.id, o]));
    if (options.some((o) => o.id && !existingById.has(o.id))) {
      return res.status(400).json({ error: "Odpowiedź nie należy do tego pytania." });
    }
    const keptIds = new Set(options.filter((o) => o.id).map((o) => o.id));
    const toDelete = existing.options.filter((o) => !keptIds.has(o.id));
    const used = toDelete.filter((o) => o._count.attemptAnswers > 0);
    if (used.length) {
      return res.status(409).json({
        error:
          "Nie można usunąć odpowiedzi, którą wybierali już uczniowie. Zmień jej treść albo usuń całe pytanie.",
      });
    }

    await prisma.$transaction([
      prisma.question.update({ where: { id }, data: q }),
      ...(toDelete.length
        ? [prisma.answerOption.deleteMany({ where: { id: { in: toDelete.map((o) => o.id) } } })]
        : []),
      ...options.map(({ id: optionId, ...o }) =>
        optionId
          ? prisma.answerOption.update({ where: { id: optionId }, data: o })
          : prisma.answerOption.create({ data: { ...o, questionId: id } })
      ),
    ]);

    res.json(await prisma.question.findUnique({ where: { id }, select: questionSelect }));
  } catch (err) {
    next(err);
  }
});

// DELETE /api/admin/questions/:id — usuwa pytanie (razem z odpowiedziami uczniów na nie).
// Nie pozwala zostawić opublikowanego quizu bez pytań.
router.delete("/questions/:id", async (req, res, next) => {
  try {
    const id = parseId(req.params.id);
    const question = id
      ? await prisma.question.findUnique({
          where: { id },
          select: { quiz: { select: { isPublished: true, _count: { select: { questions: true } } } } },
        })
      : null;
    if (!question) return res.status(404).json({ error: "Nie znaleziono pytania." });

    if (question.quiz.isPublished && question.quiz._count.questions <= 1) {
      return res.status(409).json({ error: "To ostatnie pytanie opublikowanego quizu — najpierw cofnij publikację." });
    }
    await prisma.question.delete({ where: { id } });
    res.json({ ok: true });
  } catch (err) {
    next(err);
  }
});

export default router;
