-- Opcja quizu: opuszczenie karty w trakcie rozwiązywania kończy podejście
ALTER TABLE "quizzes" ADD COLUMN "lock_on_leave" BOOLEAN NOT NULL DEFAULT false;

-- Powód zakończenia podejścia (NULL = zakończone normalnie, "left_page" = opuszczenie karty)
ALTER TABLE "quiz_attempts" ADD COLUMN "end_reason" VARCHAR(30);
