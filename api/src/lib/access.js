import { prisma } from "../db.js";

// Czy użytkownik może rozwiązywać dany quiz?
// - admin: zawsze (także nieopublikowane — podgląd szkiców),
// - nieopublikowany quiz: nikt poza adminem,
// - quiz bez kursu: każdy zalogowany,
// - quiz w kursie: tylko z zatwierdzonym zapisem na kurs (krok 7).
export async function canAccessQuiz(user, quiz) {
  if (!user) return false;
  if (user.role === "admin") return true;
  if (!quiz.isPublished) return false;
  if (quiz.courseId == null) return true;

  const enrollment = await prisma.enrollment.findUnique({
    where: { userId_courseId: { userId: user.id, courseId: quiz.courseId } },
    select: { status: true },
  });
  return enrollment?.status === "approved";
}

// Warunek do listy quizów widocznych dla użytkownika (bez szkiców)
export function visibleQuizzesWhere(user) {
  const where = { isPublished: true, OR: [{ courseId: null }] };
  if (user) {
    where.OR.push({
      course: { enrollments: { some: { userId: user.id, status: "approved" } } },
    });
  }
  return where;
}

// "12" -> 12, wszystko inne -> null
export function parseId(raw) {
  const n = Number(raw);
  return Number.isInteger(n) && n > 0 ? n : null;
}
