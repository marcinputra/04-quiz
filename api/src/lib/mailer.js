// Wysyłka e-maili (SMTP przez nodemailer) i szablony wiadomości po polsku.
// Bez SMTP_HOST (tylko lokalnie) wiadomości są wypisywane w konsoli zamiast wysyłane.
import nodemailer from "nodemailer";
import { config } from "../config.js";

const transport = config.mail.host
  ? nodemailer.createTransport({
      host: config.mail.host,
      port: config.mail.port,
      secure: config.mail.secure,
      auth: config.mail.user ? { user: config.mail.user, pass: config.mail.pass } : undefined,
    })
  : null;

const escapeHtml = (s) =>
  String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);

// Prosty, czytelny układ HTML w kolorach strony (działa w klientach poczty)
function layout(title, bodyHtml) {
  return `<!doctype html>
<html lang="pl"><body style="margin:0;padding:24px;background:#f3f4f6;font-family:Arial,Helvetica,sans-serif;color:#1f2324">
  <div style="max-width:520px;margin:0 auto;background:#ffffff;border-radius:10px;overflow:hidden;border:1px solid #e5e7eb">
    <div style="background:#262a2b;padding:16px 24px;font-size:18px;font-weight:bold;color:#e5e7eb">
      maturazinformatyki<span style="color:#facc15">.it</span>
    </div>
    <div style="padding:24px;font-size:15px;line-height:1.6">
      <h1 style="font-size:20px;margin:0 0 16px">${escapeHtml(title)}</h1>
      ${bodyHtml}
    </div>
    <div style="padding:12px 24px;background:#f9fafb;color:#6b7280;font-size:12px">
      Wiadomość wysłana automatycznie — nie odpowiadaj na nią.
    </div>
  </div>
</body></html>`;
}

const button = (url, label) =>
  `<p style="margin:24px 0"><a href="${escapeHtml(url)}" style="background:#facc15;color:#262a2b;text-decoration:none;font-weight:bold;padding:12px 20px;border-radius:6px;display:inline-block">${escapeHtml(label)}</a></p>`;

const codeBox = (code) =>
  `<p style="margin:20px 0;font-size:32px;letter-spacing:8px;font-weight:bold;font-family:monospace;background:#f3f4f6;padding:12px 16px;border-radius:8px;text-align:center">${escapeHtml(code)}</p>`;

export async function sendMail({ to, subject, text, html }) {
  if (!transport) {
    console.log(`\n===== E-MAIL (brak SMTP_HOST — nie wysłano) =====\nDo: ${to}\nTemat: ${subject}\n\n${text}\n=================================================\n`);
    return;
  }
  await transport.sendMail({ from: config.mail.from, to, subject, text, html });
}

// Wysyłka, której błąd nie może przerwać żądania (np. powiadomienia) — tylko log
export function sendMailInBackground(message) {
  sendMail(message).catch((err) => console.error(`Nie udało się wysłać e-maila do ${message.to}:`, err.message));
}

// ---------------- szablony ----------------

export function verifyEmailMessage({ name, email, token }) {
  const url = `${config.appUrl}/potwierdz-email?token=${encodeURIComponent(token)}`;
  return {
    to: email,
    subject: "Potwierdź adres e-mail — maturazinformatyki.it",
    text: `Cześć ${name}!\n\nDziękujemy za założenie konta na maturazinformatyki.it.\nAby je aktywować, otwórz link (ważny 24 godziny):\n\n${url}\n\nJeśli to nie Ty zakładałeś konto, zignoruj tę wiadomość.`,
    html: layout(
      "Potwierdź adres e-mail",
      `<p>Cześć ${escapeHtml(name)}!</p>
       <p>Dziękujemy za założenie konta na maturazinformatyki.it. Aby je aktywować, kliknij przycisk (link jest ważny 24 godziny):</p>
       ${button(url, "Potwierdzam adres e-mail")}
       <p style="color:#6b7280;font-size:13px">Jeśli przycisk nie działa, skopiuj ten adres do przeglądarki:<br>${escapeHtml(url)}</p>
       <p style="color:#6b7280;font-size:13px">Jeśli to nie Ty zakładałeś konto, zignoruj tę wiadomość.</p>`
    ),
  };
}

export function loginCodeMessage({ name, email, code, purpose }) {
  const enabling = purpose === "enable_2fa";
  const intro = enabling
    ? "Ktoś (prawdopodobnie Ty) włącza logowanie dwuetapowe na Twoim koncie. Wpisz ten kod, aby to potwierdzić:"
    : "Ktoś (prawdopodobnie Ty) loguje się na Twoje konto. Wpisz ten kod, aby dokończyć logowanie:";
  return {
    to: email,
    subject: enabling ? `Kod włączenia logowania dwuetapowego: ${code}` : `Kod logowania: ${code}`,
    text: `Cześć ${name}!\n\n${intro}\n\n${code}\n\nKod jest ważny 10 minut.\nJeśli to nie Ty, zmień hasło — ktoś może je znać.`,
    html: layout(
      enabling ? "Włączanie logowania dwuetapowego" : "Kod logowania",
      `<p>Cześć ${escapeHtml(name)}!</p><p>${escapeHtml(intro)}</p>${codeBox(code)}
       <p>Kod jest ważny <strong>10 minut</strong>.</p>
       <p style="color:#6b7280;font-size:13px">Jeśli to nie Ty, zmień hasło — ktoś może je znać.</p>`
    ),
  };
}

export function enrollmentRequestMessage({ adminEmail, studentName, studentEmail, courseTitle }) {
  const url = `${config.appUrl}/admin/zapisy`;
  return {
    to: adminEmail,
    subject: `Prośba o dostęp do kursu: ${courseTitle}`,
    text: `${studentName} (${studentEmail}) prosi o dostęp do kursu „${courseTitle}”.\n\nZatwierdź albo odrzuć w panelu admina:\n${url}`,
    html: layout(
      "Nowa prośba o dostęp do kursu",
      `<p><strong>${escapeHtml(studentName)}</strong> (${escapeHtml(studentEmail)}) prosi o dostęp do kursu <strong>„${escapeHtml(courseTitle)}”</strong>.</p>
       ${button(url, "Przejdź do zapisów")}`
    ),
  };
}

export function enrollmentDecisionMessage({ name, email, courseTitle, courseSlug, approved }) {
  const url = `${config.appUrl}/kursy/${encodeURIComponent(courseSlug)}`;
  return {
    to: email,
    subject: approved ? `Masz dostęp do kursu: ${courseTitle}` : `Prośba o dostęp do kursu: ${courseTitle}`,
    text: approved
      ? `Cześć ${name}!\n\nTwoja prośba o dostęp do kursu „${courseTitle}” została zatwierdzona. Możesz zaczynać:\n${url}`
      : `Cześć ${name}!\n\nTwoja prośba o dostęp do kursu „${courseTitle}” nie została zatwierdzona. W razie pytań skontaktuj się z prowadzącym.`,
    html: layout(
      approved ? "Dostęp do kursu zatwierdzony" : "Prośba o dostęp nie została zatwierdzona",
      approved
        ? `<p>Cześć ${escapeHtml(name)}!</p><p>Twoja prośba o dostęp do kursu <strong>„${escapeHtml(courseTitle)}”</strong> została zatwierdzona.</p>${button(url, "Otwórz kurs")}`
        : `<p>Cześć ${escapeHtml(name)}!</p><p>Twoja prośba o dostęp do kursu <strong>„${escapeHtml(courseTitle)}”</strong> nie została zatwierdzona. W razie pytań skontaktuj się z prowadzącym.</p>`
    ),
  };
}

export function passwordResetMessage({ name, email, token }) {
  const url = `${config.appUrl}/nowe-haslo?token=${encodeURIComponent(token)}`;
  return {
    to: email,
    subject: "Ustaw nowe hasło — maturazinformatyki.it",
    text: `Cześć ${name}!\n\nOtrzymaliśmy prośbę o ustawienie nowego hasła do Twojego konta.\nAby to zrobić, otwórz link (ważny 1 godzinę):\n\n${url}\n\nJeśli to nie Ty prosiłeś o zmianę hasła, zignoruj tę wiadomość — Twoje obecne hasło nadal działa.`,
    html: layout(
      "Ustaw nowe hasło",
      `<p>Cześć ${escapeHtml(name)}!</p>
       <p>Otrzymaliśmy prośbę o ustawienie nowego hasła do Twojego konta. Kliknij przycisk (link jest ważny <strong>1 godzinę</strong>):</p>
       ${button(url, "Ustaw nowe hasło")}
       <p style="color:#6b7280;font-size:13px">Jeśli przycisk nie działa, skopiuj ten adres do przeglądarki:<br>${escapeHtml(url)}</p>
       <p style="color:#6b7280;font-size:13px">Jeśli to nie Ty prosiłeś o zmianę hasła, zignoruj tę wiadomość — Twoje obecne hasło nadal działa.</p>`
    ),
  };
}

// Powiadomienie bezpieczeństwa po każdej zmianie hasła (reset albo zmiana w „Moje konto”)
export function passwordChangedMessage({ name, email }) {
  const url = `${config.appUrl}/reset-hasla`;
  return {
    to: email,
    subject: "Twoje hasło zostało zmienione — maturazinformatyki.it",
    text: `Cześć ${name}!\n\nHasło do Twojego konta zostało właśnie zmienione. Ze względów bezpieczeństwa wylogowaliśmy Cię na pozostałych urządzeniach.\n\nJeśli to nie Ty, natychmiast ustaw nowe hasło:\n${url}`,
    html: layout(
      "Hasło zostało zmienione",
      `<p>Cześć ${escapeHtml(name)}!</p>
       <p>Hasło do Twojego konta zostało właśnie zmienione. Ze względów bezpieczeństwa wylogowaliśmy Cię na pozostałych urządzeniach.</p>
       <p><strong>Jeśli to nie Ty</strong>, natychmiast ustaw nowe hasło:</p>
       ${button(url, "Ustaw nowe hasło")}`
    ),
  };
}
