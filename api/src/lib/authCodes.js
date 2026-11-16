// Jednorazowe kody i tokeny wysyłane e-mailem (potwierdzenie konta, logowanie dwuetapowe).
// W bazie trzymamy tylko HMAC kodu (z JWT_SECRET) — wyciek bazy nie zdradza kodów.
import crypto from "node:crypto";
import { prisma } from "../db.js";
import { config } from "../config.js";

export const VERIFY_TTL_MS = 24 * 60 * 60 * 1000; // link potwierdzający: 24 h
export const RESET_TTL_MS = 60 * 60 * 1000; // link do resetu hasła: 1 h
export const CODE_TTL_MS = 10 * 60 * 1000; // kod 2FA: 10 min
export const CODE_MAX_ATTEMPTS = 5; // po tylu błędnych próbach kod przestaje działać
export const RESEND_COOLDOWN_MS = 60 * 1000; // nowy kod najwcześniej po minucie

const hash = (value) => crypto.createHmac("sha256", config.jwtSecret).update(String(value)).digest("hex");

const sixDigits = () => String(crypto.randomInt(0, 1_000_000)).padStart(6, "0");

// Tworzy nowy kod; poprzednie niewykorzystane kody tego samego rodzaju przestają działać
export async function createAuthCode(userId, purpose) {
  // linki (w e-mailu do kliknięcia) — długi losowy token; kody do wpisania — 6 cyfr
  const isLink = purpose === "verify_email" || purpose === "password_reset";
  const code = isLink ? crypto.randomBytes(32).toString("base64url") : sixDigits();
  const ttl = purpose === "verify_email" ? VERIFY_TTL_MS : purpose === "password_reset" ? RESET_TTL_MS : CODE_TTL_MS;

  const [, row] = await prisma.$transaction([
    prisma.authCode.updateMany({
      where: { userId, purpose, usedAt: null },
      data: { usedAt: new Date() },
    }),
    prisma.authCode.create({
      data: {
        userId,
        purpose,
        codeHash: hash(code),
        expiresAt: new Date(Date.now() + ttl),
      },
      select: { id: true, createdAt: true },
    }),
  ]);
  return { code, id: row.id, createdAt: row.createdAt };
}

// Sprawdza token z linku BEZ zużywania go -> { row } albo { error, userId? }
export async function checkLinkToken(token, purpose) {
  if (typeof token !== "string" || token.length < 20 || token.length > 100) return { error: "invalid" };
  const row = await prisma.authCode.findFirst({
    where: { codeHash: hash(token), purpose },
    select: { id: true, userId: true, usedAt: true, expiresAt: true },
  });
  if (!row) return { error: "invalid" };
  if (row.usedAt) return { error: "used", userId: row.userId };
  if (row.expiresAt < new Date()) return { error: "expired", userId: row.userId };
  return { row };
}

// Token z linku (potwierdzenie e-maila / reset hasła) -> { userId } albo { error }. Link działa raz.
export async function consumeLinkToken(token, purpose) {
  const checked = await checkLinkToken(token, purpose);
  if (checked.error) return checked;
  const { row } = checked;
  // warunek usedAt: null chroni przed podwójnym użyciem przy równoczesnych żądaniach
  const marked = await prisma.authCode.updateMany({ where: { id: row.id, usedAt: null }, data: { usedAt: new Date() } });
  if (!marked.count) return { error: "used", userId: row.userId };
  return { userId: row.userId };
}

export const consumeVerifyToken = (token) => consumeLinkToken(token, "verify_email");

// Sprawdza 6-cyfrowy kod dla konkretnego wyzwania (id z ciasteczka 2FA albo ostatni kod danego rodzaju).
// -> { ok: true } | { error: "invalid" | "expired" | "locked", attemptsLeft? }
export async function verifyCode({ userId, purpose, codeId, code }) {
  const row = await prisma.authCode.findFirst({
    where: { userId, purpose, ...(codeId ? { id: codeId } : {}), usedAt: null },
    orderBy: { createdAt: "desc" },
    select: { id: true, codeHash: true, expiresAt: true, attempts: true },
  });
  if (!row) return { error: "expired" };
  if (row.expiresAt < new Date()) return { error: "expired" };
  if (row.attempts >= CODE_MAX_ATTEMPTS) return { error: "locked" };

  const given = typeof code === "string" ? code.replace(/\s+/g, "") : "";
  const ok =
    /^\d{6}$/.test(given) && crypto.timingSafeEqual(Buffer.from(hash(given)), Buffer.from(row.codeHash));

  if (!ok) {
    const updated = await prisma.authCode.update({
      where: { id: row.id },
      data: { attempts: { increment: 1 } },
      select: { attempts: true },
    });
    const attemptsLeft = Math.max(CODE_MAX_ATTEMPTS - updated.attempts, 0);
    return { error: attemptsLeft ? "invalid" : "locked", attemptsLeft };
  }

  const marked = await prisma.authCode.updateMany({ where: { id: row.id, usedAt: null }, data: { usedAt: new Date() } });
  return marked.count ? { ok: true } : { error: "expired" };
}

// Czy można już wysłać nowy kod (ochrona przed zasypywaniem skrzynki)?
export async function secondsUntilResend(userId, purpose) {
  const last = await prisma.authCode.findFirst({
    where: { userId, purpose },
    orderBy: { createdAt: "desc" },
    select: { createdAt: true },
  });
  if (!last) return 0;
  const wait = RESEND_COOLDOWN_MS - (Date.now() - last.createdAt.getTime());
  return wait > 0 ? Math.ceil(wait / 1000) : 0;
}

// „jan.kowalski@gmail.com” -> „ja***@gmail.com” (pokazywane przy wpisywaniu kodu)
export function maskEmail(email) {
  const [local, domain] = String(email).split("@");
  return `${local.slice(0, 2)}***@${domain}`;
}

// Sprzątanie starych kodów (wywoływane przy okazji, bez osobnego crona)
export function cleanupOldCodes() {
  prisma.authCode
    .deleteMany({ where: { createdAt: { lt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) } } })
    .catch(() => {});
}
