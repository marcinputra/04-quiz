// Konfiguracja z zmiennych środowiskowych — błędy wychodzą od razu przy starcie

const isProduction = process.env.NODE_ENV === "production";

const jwtSecret = process.env.JWT_SECRET ?? "";
if (jwtSecret.length < 32) {
  throw new Error("Brak JWT_SECRET lub jest krótszy niż 32 znaki — ustaw go w .env");
}

const smtpHost = process.env.SMTP_HOST?.trim() || "";
// na produkcji bez poczty nikt nie potwierdzi konta — lepiej nie wystartować niż działać po cichu źle
if (isProduction && !smtpHost) {
  throw new Error("Brak SMTP_HOST — ustaw dane serwera poczty w .env (potwierdzenia kont i kody logowania)");
}

const appUrl = (process.env.APP_URL || "http://localhost:3000").replace(/\/+$/, "");

export const config = {
  isProduction,
  port: Number(process.env.PORT) || 4000,
  jwtSecret,
  // domyślnie na produkcji ciasteczko tylko po HTTPS
  cookieSecure: process.env.COOKIE_SECURE ? process.env.COOKIE_SECURE === "true" : isProduction,
  cookieName: "mzi_token",
  // krótkie ciasteczko między hasłem a kodem 2FA
  twoFactorCookieName: "mzi_2fa",
  sessionDays: 7,
  appUrl,
  mail: {
    // bez SMTP_HOST (tylko lokalnie) e-maile są wypisywane w konsoli api
    host: smtpHost,
    port: Number(process.env.SMTP_PORT) || 587,
    secure: process.env.SMTP_SECURE === "true", // true = port 465 (SSL), false = STARTTLS / bez szyfrowania
    user: process.env.SMTP_USER || "",
    pass: process.env.SMTP_PASS || "",
    from: process.env.MAIL_FROM || "maturazinformatyki.it <no-reply@maturazinformatyki.it>",
  },
};
