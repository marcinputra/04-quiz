// Powody automatycznego zakończenia podejścia (opcja quizu lockOnLeave) — teksty do wyników.
export const END_REASONS = {
  left_page: { short: "opuszczono kartę", long: "opuszczono kartę z quizem" },
  window_blur: { short: "okno nieaktywne", long: "okno przeglądarki przestało być aktywne" },
};

export const endReasonInfo = (reason) => END_REASONS[reason] ?? null;
