// Wspólne elementy stron kursów

const LABELS = {
  approved: "Masz dostęp",
  pending: "Czeka na zatwierdzenie",
  rejected: "Prośba odrzucona",
};

// Plakietka ze statusem dostępu do kursu
export function EnrollmentBadge({ status }) {
  if (!status) return null;
  return <span className={`mzi-course-badge mzi-course-badge-${status}`}>{LABELS[status]}</span>;
}

export const lessonsLabel = (n) => (n === 1 ? "1 lekcja" : n % 10 >= 2 && n % 10 <= 4 && (n % 100 < 10 || n % 100 >= 20) ? `${n} lekcje` : `${n} lekcji`);
export const quizzesLabel = (n) => (n === 1 ? "1 quiz" : n % 10 >= 2 && n % 10 <= 4 && (n % 100 < 10 || n % 100 >= 20) ? `${n} quizy` : `${n} quizów`);
