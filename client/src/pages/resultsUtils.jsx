// Wspólne elementy stron z wynikami

export const formatDateTime = (iso) =>
  new Date(iso).toLocaleString("pl-PL", { dateStyle: "short", timeStyle: "short" });

// Procent w kolorowej plakietce: zielony ≥ 75%, żółty ≥ 50%, czerwony poniżej
export function ResultBadge({ percent }) {
  const level = percent >= 75 ? "good" : percent >= 50 ? "mid" : "low";
  return <span className={`mzi-results-badge mzi-results-badge-${level}`}>{percent}%</span>;
}
