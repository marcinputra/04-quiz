import { Router } from "express";
import rateLimit from "express-rate-limit";
import { prisma } from "../db.js";
import {
  hashPassword,
  verifyPassword,
  DUMMY_HASH,
  setAuthCookie,
  clearAuthCookie,
  publicUser,
  setTwoFactorCookie,
  readTwoFactorCookie,
  clearTwoFactorCookie,
} from "../lib/auth.js";
import { validateEmail, validateName, validatePassword } from "../lib/validate.js";
import { requireAuth } from "../middleware/auth.js";
import {
  createAuthCode,
  consumeVerifyToken,
  checkLinkToken,
  consumeLinkToken,
  verifyCode,
  secondsUntilResend,
  maskEmail,
  cleanupOldCodes,
} from "../lib/authCodes.js";
import {
  sendMail,
  sendMailInBackground,
  verifyEmailMessage,
  loginCodeMessage,
  passwordResetMessage,
  passwordChangedMessage,
} from "../lib/mailer.js";

const router = Router();

// ---------------- limity prób ----------------
const limiterOptions = { standardHeaders: "draft-8", legacyHeaders: false };
const loginLimiter = rateLimit({
  ...limiterOptions,
  windowMs: 15 * 60 * 1000,
  limit: 10,
  skipSuccessfulRequests: true,
  message: { error: "Za dużo nieudanych prób logowania. Spróbuj ponownie za 15 minut." },
});
const registerLimiter = rateLimit({
  ...limiterOptions,
  windowMs: 60 * 60 * 1000,
  limit: 5,
  message: { error: "Za dużo rejestracji z tego adresu. Spróbuj ponownie później." },
});
const emailLimiter = rateLimit({
  ...limiterOptions,
  windowMs: 60 * 60 * 1000,
  limit: 10,
  message: { error: "Za dużo wysłanych wiadomości. Spróbuj ponownie później." },
});
const codeLimiter = rateLimit({
  ...limiterOptions,
  windowMs: 15 * 60 * 1000,
  limit: 20,
  skipSuccessfulRequests: true,
  message: { error: "Za dużo prób wpisania kodu. Spróbuj ponownie za 15 minut." },
});

const MAIL_FAILED = "Nie udało się wysłać e-maila. Spróbuj ponownie za chwilę.";

const codeError = (result) =>
  result.error === "invalid"
    ? `Nieprawidłowy kod. Pozostało prób: ${result.attemptsLeft}.`
    : result.error === "locked"
      ? "Za dużo błędnych prób — ten kod przestał działać."
      : "Kod wygasł.";

async function sendVerification(user) {
  const { code } = await createAuthCode(user.id, "verify_email");
  await sendMail(verifyEmailMessage({ name: user.name, email: user.email, token: code }));
}

// ---------------- rejestracja i potwierdzenie e-maila ----------------

// POST /api/auth/register  { email, name, password }
// Zakłada konto (niepotwierdzone) i wysyła link potwierdzający. NIE loguje.
router.post("/register", registerLimiter, async (req, res, next) => {
  try {
    const email = validateEmail(req.body?.email);
    const name = validateName(req.body?.name);
    const password = validatePassword(req.body?.password);
    const error = email.error || name.error || password.error;
    if (error) return res.status(400).json({ error });

    const exists = await prisma.user.findUnique({ where: { email: email.value }, select: { id: true } });
    if (exists) return res.status(409).json({ error: "Konto z tym adresem e-mail już istnieje." });

    const user = await prisma.user.create({
      data: {
        email: email.value,
        name: name.value,
        passwordHash: await hashPassword(password.value),
        // rola zawsze "user" — admina zakłada się tylko skryptem create-admin
      },
    });

    let emailSent = true;
    try {
      await sendVerification(user);
    } catch (err) {
      console.error("Wysyłka potwierdzenia nie powiodła się:", err.message);
      emailSent = false; // konto zostaje — można wysłać ponownie z ekranu logowania
    }
    cleanupOldCodes();
    res.status(201).json({ verificationRequired: true, email: user.email, emailSent });
  } catch (err) {
    if (err?.code === "P2002") return res.status(409).json({ error: "Konto z tym adresem e-mail już istnieje." });
    next(err);
  }
});

// POST /api/auth/verify-email  { token } — kliknięty link z e-maila. Po potwierdzeniu loguje.
router.post("/verify-email", codeLimiter, async (req, res, next) => {
  try {
    const result = await consumeVerifyToken(req.body?.token);
    if (result.error) {
      const user = result.userId
        ? await prisma.user.findUnique({ where: { id: result.userId }, select: { emailVerifiedAt: true } })
        : null;
      if (user?.emailVerifiedAt) return res.json({ alreadyVerified: true });
      if (result.error === "expired") {
        return res.status(400).json({ error: "Link wygasł. Wyślij nowy link poniżej.", code: "EXPIRED" });
      }
      return res.status(400).json({ error: "Link jest nieprawidłowy albo został już użyty.", code: "INVALID" });
    }

    const user = await prisma.user.update({
      where: { id: result.userId },
      data: { emailVerifiedAt: new Date() },
    });
    setAuthCookie(res, user);
    res.json({ user: publicUser(user) });
  } catch (err) {
    next(err);
  }
});

// POST /api/auth/resend-verification  { email }
// Zawsze ta sama odpowiedź — nie zdradza, czy konto istnieje.
router.post("/resend-verification", emailLimiter, async (req, res, next) => {
  try {
    const email = validateEmail(req.body?.email);
    if (email.error) return res.status(400).json({ error: email.error });

    const user = await prisma.user.findUnique({ where: { email: email.value } });
    if (user && !user.emailVerifiedAt && (await secondsUntilResend(user.id, "verify_email")) === 0) {
      try {
        await sendVerification(user);
      } catch (err) {
        console.error("Ponowna wysyłka potwierdzenia nie powiodła się:", err.message);
        return res.status(503).json({ error: MAIL_FAILED });
      }
    }
    res.json({ ok: true });
  } catch (err) {
    next(err);
  }
});

// ---------------- logowanie ----------------

// POST /api/auth/login  { email, password }
// -> { user }                                  — zalogowano
// -> { twoFactorRequired: true, email }        — wysłano kod, dalej /2fa/verify
// -> 403 { code: "EMAIL_NOT_VERIFIED" }        — trzeba potwierdzić e-mail
router.post("/login", loginLimiter, async (req, res, next) => {
  try {
    const email = validateEmail(req.body?.email);
    const password = typeof req.body?.password === "string" ? req.body.password : "";
    const invalid = () => res.status(401).json({ error: "Nieprawidłowy e-mail lub hasło." });
    if (email.error || !password) return invalid();

    const user = await prisma.user.findUnique({ where: { email: email.value } });
    // porównanie hasła także gdy konta nie ma — stały czas odpowiedzi
    const ok = await verifyPassword(password, user?.passwordHash ?? DUMMY_HASH);
    if (!user || !ok) return invalid();

    // dopiero po poprawnym haśle — nie zdradza obcym, że konto istnieje
    if (!user.emailVerifiedAt) {
      return res.status(403).json({
        error: "Najpierw potwierdź adres e-mail — kliknij link z wiadomości, którą wysłaliśmy po rejestracji.",
        code: "EMAIL_NOT_VERIFIED",
      });
    }

    if (user.twoFactorEnabled) {
      const { code, id } = await createAuthCode(user.id, "login_2fa");
      try {
        await sendMail(loginCodeMessage({ name: user.name, email: user.email, code, purpose: "login_2fa" }));
      } catch (err) {
        console.error("Wysyłka kodu logowania nie powiodła się:", err.message);
        return res.status(503).json({ error: MAIL_FAILED });
      }
      clearAuthCookie(res);
      setTwoFactorCookie(res, user.id, id);
      return res.json({ twoFactorRequired: true, email: maskEmail(user.email) });
    }

    setAuthCookie(res, user);
    res.json({ user: publicUser(user) });
  } catch (err) {
    next(err);
  }
});

// POST /api/auth/2fa/verify  { code } — drugi krok logowania
router.post("/2fa/verify", codeLimiter, async (req, res, next) => {
  try {
    const pending = readTwoFactorCookie(req);
    if (!pending) {
      return res.status(401).json({ error: "Sesja logowania wygasła. Zaloguj się ponownie.", code: "RESTART" });
    }

    const result = await verifyCode({ userId: pending.userId, purpose: "login_2fa", codeId: pending.codeId, code: req.body?.code });
    if (!result.ok) {
      const restart = result.error !== "invalid";
      if (restart) clearTwoFactorCookie(res);
      return res.status(401).json({
        error: restart ? `${codeError(result)} Zaloguj się ponownie.` : codeError(result),
        ...(restart ? { code: "RESTART" } : {}),
      });
    }

    const user = await prisma.user.findUnique({ where: { id: pending.userId } });
    if (!user) return res.status(401).json({ error: "Konto nie istnieje.", code: "RESTART" });
    clearTwoFactorCookie(res);
    setAuthCookie(res, user);
    res.json({ user: publicUser(user) });
  } catch (err) {
    next(err);
  }
});

// POST /api/auth/2fa/resend — nowy kod logowania (najwcześniej po minucie)
router.post("/2fa/resend", emailLimiter, async (req, res, next) => {
  try {
    const pending = readTwoFactorCookie(req);
    if (!pending) {
      return res.status(401).json({ error: "Sesja logowania wygasła. Zaloguj się ponownie.", code: "RESTART" });
    }
    const wait = await secondsUntilResend(pending.userId, "login_2fa");
    if (wait > 0) return res.status(429).json({ error: `Nowy kod możesz wysłać za ${wait} s.`, retryAfter: wait });

    const user = await prisma.user.findUnique({ where: { id: pending.userId } });
    if (!user) return res.status(401).json({ error: "Konto nie istnieje.", code: "RESTART" });
    const { code, id } = await createAuthCode(user.id, "login_2fa");
    try {
      await sendMail(loginCodeMessage({ name: user.name, email: user.email, code, purpose: "login_2fa" }));
    } catch (err) {
      console.error("Wysyłka kodu logowania nie powiodła się:", err.message);
      return res.status(503).json({ error: MAIL_FAILED });
    }
    setTwoFactorCookie(res, user.id, id);
    res.json({ ok: true, email: maskEmail(user.email) });
  } catch (err) {
    next(err);
  }
});

// ---------------- reset zapomnianego hasła ----------------

// POST /api/auth/forgot-password  { email } — wysyła link do ustawienia nowego hasła.
// Zawsze ta sama odpowiedź — nie zdradza, czy konto istnieje.
router.post("/forgot-password", emailLimiter, async (req, res, next) => {
  try {
    const email = validateEmail(req.body?.email);
    if (email.error) return res.status(400).json({ error: email.error });

    const user = await prisma.user.findUnique({ where: { email: email.value } });
    if (user && (await secondsUntilResend(user.id, "password_reset")) === 0) {
      const { code } = await createAuthCode(user.id, "password_reset");
      try {
        await sendMail(passwordResetMessage({ name: user.name, email: user.email, token: code }));
      } catch (err) {
        console.error("Wysyłka linku do resetu hasła nie powiodła się:", err.message);
        return res.status(503).json({ error: MAIL_FAILED });
      }
    }
    res.json({ ok: true });
  } catch (err) {
    next(err);
  }
});

const resetLinkError = (error) =>
  error === "expired"
    ? { error: "Link wygasł (jest ważny 1 godzinę). Poproś o nowy.", code: "EXPIRED" }
    : { error: "Link jest nieprawidłowy albo został już użyty. Poproś o nowy.", code: "INVALID" };

// POST /api/auth/reset-password/check  { token } — czy link jest jeszcze ważny (bez zużywania)
router.post("/reset-password/check", codeLimiter, async (req, res, next) => {
  try {
    const result = await checkLinkToken(req.body?.token, "password_reset");
    if (result.error) return res.status(400).json(resetLinkError(result.error));
    res.json({ ok: true });
  } catch (err) {
    next(err);
  }
});

// POST /api/auth/reset-password  { token, password }
// Ustawia nowe hasło i wylogowuje wszystkie urządzenia. NIE loguje — trzeba się zalogować
// (z kodem 2FA, jeśli włączony), żeby sam dostęp do skrzynki nie omijał drugiego kroku.
router.post("/reset-password", codeLimiter, async (req, res, next) => {
  try {
    const password = validatePassword(req.body?.password);
    if (password.error) return res.status(400).json({ error: password.error });

    const result = await consumeLinkToken(req.body?.token, "password_reset");
    if (result.error) return res.status(400).json(resetLinkError(result.error));

    const current = await prisma.user.findUnique({ where: { id: result.userId }, select: { emailVerifiedAt: true } });
    if (!current) return res.status(400).json(resetLinkError("invalid"));

    const user = await prisma.user.update({
      where: { id: result.userId },
      data: {
        passwordHash: await hashPassword(password.value),
        tokenVersion: { increment: 1 },
        // link przyszedł na ten adres — skoro działa, adres jest potwierdzony
        emailVerifiedAt: current.emailVerifiedAt ?? new Date(),
      },
    });
    clearAuthCookie(res);
    clearTwoFactorCookie(res);
    sendMailInBackground(passwordChangedMessage({ name: user.name, email: user.email }));
    res.json({ ok: true });
  } catch (err) {
    next(err);
  }
});

// POST /api/auth/logout
router.post("/logout", (req, res) => {
  clearAuthCookie(res);
  clearTwoFactorCookie(res);
  res.json({ ok: true });
});

// GET /api/auth/me — kim jestem (user: null, gdy niezalogowany)
router.get("/me", (req, res) => {
  res.json({ user: req.user });
});

// ---------------- ustawienia konta ----------------

// POST /api/auth/change-password  { currentPassword, newPassword }
router.post("/change-password", requireAuth, loginLimiter, async (req, res, next) => {
  try {
    const newPassword = validatePassword(req.body?.newPassword);
    if (newPassword.error) return res.status(400).json({ error: newPassword.error });

    const user = await prisma.user.findUnique({ where: { id: req.user.id } });
    const current = typeof req.body?.currentPassword === "string" ? req.body.currentPassword : "";
    if (!(await verifyPassword(current, user.passwordHash))) {
      return res.status(401).json({ error: "Obecne hasło jest nieprawidłowe." });
    }

    // tokenVersion+1 -> sesje na innych urządzeniach przestają działać; to urządzenie dostaje nowe ciasteczko
    const updated = await prisma.user.update({
      where: { id: user.id },
      data: { passwordHash: await hashPassword(newPassword.value), tokenVersion: { increment: 1 } },
    });
    setAuthCookie(res, updated);
    sendMailInBackground(passwordChangedMessage({ name: updated.name, email: updated.email }));
    res.json({ ok: true });
  } catch (err) {
    next(err);
  }
});

// POST /api/auth/2fa/enable/start — wysyła kod na e-mail (potwierdza, że poczta działa)
router.post("/2fa/enable/start", requireAuth, emailLimiter, async (req, res, next) => {
  try {
    if (req.user.twoFactorEnabled) return res.status(409).json({ error: "Logowanie dwuetapowe jest już włączone." });
    const wait = await secondsUntilResend(req.user.id, "enable_2fa");
    if (wait > 0) return res.status(429).json({ error: `Nowy kod możesz wysłać za ${wait} s.`, retryAfter: wait });

    const { code } = await createAuthCode(req.user.id, "enable_2fa");
    try {
      await sendMail(loginCodeMessage({ name: req.user.name, email: req.user.email, code, purpose: "enable_2fa" }));
    } catch (err) {
      console.error("Wysyłka kodu włączenia 2FA nie powiodła się:", err.message);
      return res.status(503).json({ error: MAIL_FAILED });
    }
    res.json({ ok: true, email: maskEmail(req.user.email) });
  } catch (err) {
    next(err);
  }
});

// POST /api/auth/2fa/enable/confirm  { code }
router.post("/2fa/enable/confirm", requireAuth, codeLimiter, async (req, res, next) => {
  try {
    const result = await verifyCode({ userId: req.user.id, purpose: "enable_2fa", code: req.body?.code });
    if (!result.ok) return res.status(400).json({ error: codeError(result), code: result.error });

    const user = await prisma.user.update({ where: { id: req.user.id }, data: { twoFactorEnabled: true } });
    res.json({ user: publicUser(user) });
  } catch (err) {
    next(err);
  }
});

// POST /api/auth/2fa/disable  { password } — wyłączenie wymaga hasła
router.post("/2fa/disable", requireAuth, loginLimiter, async (req, res, next) => {
  try {
    const user = await prisma.user.findUnique({ where: { id: req.user.id } });
    const password = typeof req.body?.password === "string" ? req.body.password : "";
    if (!(await verifyPassword(password, user.passwordHash))) {
      return res.status(401).json({ error: "Hasło jest nieprawidłowe." });
    }
    const updated = await prisma.user.update({ where: { id: user.id }, data: { twoFactorEnabled: false } });
    res.json({ user: publicUser(updated) });
  } catch (err) {
    next(err);
  }
});

export default router;
