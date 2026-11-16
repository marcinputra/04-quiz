import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { config } from "../config.js";

const BCRYPT_ROUNDS = 12;

export const hashPassword = (plain) => bcrypt.hash(plain, BCRYPT_ROUNDS);
export const verifyPassword = (plain, hash) => bcrypt.compare(plain, hash);

// Hash „na niby” — porównujemy z nim, gdy użytkownik nie istnieje,
// żeby czas odpowiedzi nie zdradzał, czy e-mail jest w bazie.
export const DUMMY_HASH = bcrypt.hashSync("dummy-password-for-timing", BCRYPT_ROUNDS);

// ---------- token w ciasteczku ----------

// v = wersja sesji użytkownika (users.token_version); zmiana hasła ją zwiększa,
// przez co wszystkie wcześniej wydane sesje przestają działać
export function signToken(userId, tokenVersion = 0) {
  return jwt.sign({ sub: String(userId), typ: "session", v: tokenVersion }, config.jwtSecret, {
    algorithm: "HS256",
    expiresIn: `${config.sessionDays}d`,
  });
}

// -> { userId, version } albo null, jeśli token jest zły / wygasł
export function readToken(token) {
  try {
    const payload = jwt.verify(token, config.jwtSecret, { algorithms: ["HS256"] });
    // tylko token sesji — token z etapu 2FA (typ "2fa") nie może posłużyć za zalogowanie.
    // Brak typu = sesja sprzed kroku 7 (wygasa najpóźniej po 7 dniach).
    if (payload.typ !== undefined && payload.typ !== "session") return null;
    const userId = Number(payload.sub);
    if (!Number.isInteger(userId)) return null;
    return { userId, version: Number.isInteger(payload.v) ? payload.v : 0 };
  } catch {
    return null;
  }
}

const cookieOptions = () => ({
  httpOnly: true, // niedostępne z JavaScriptu w przeglądarce
  secure: config.cookieSecure,
  sameSite: "lax", // chroni przed wysyłaniem z obcych stron (CSRF)
  path: "/",
});

// user = rekord z bazy (potrzebne id i tokenVersion)
export function setAuthCookie(res, user) {
  res.cookie(config.cookieName, signToken(user.id, user.tokenVersion ?? 0), {
    ...cookieOptions(),
    maxAge: config.sessionDays * 24 * 60 * 60 * 1000,
  });
}

export function clearAuthCookie(res) {
  res.clearCookie(config.cookieName, cookieOptions());
}

// dane użytkownika, które wolno wysłać do przeglądarki (bez hasha hasła)
export const publicUser = (u) => ({
  id: u.id,
  email: u.email,
  name: u.name,
  role: u.role,
  createdAt: u.createdAt,
  emailVerified: Boolean(u.emailVerifiedAt),
  twoFactorEnabled: Boolean(u.twoFactorEnabled),
});

// pola z bazy potrzebne do publicUser (bez hasha hasła)
export const publicUserSelect = {
  id: true,
  email: true,
  name: true,
  role: true,
  createdAt: true,
  emailVerifiedAt: true,
  twoFactorEnabled: true,
  tokenVersion: true,
};

// ---------- ciasteczko między hasłem a kodem 2FA (10 min) ----------
// zawiera id użytkownika i id wysłanego kodu; samo w sobie NIE loguje

export function setTwoFactorCookie(res, userId, codeId) {
  const token = jwt.sign({ sub: String(userId), cid: codeId, typ: "2fa" }, config.jwtSecret, {
    algorithm: "HS256",
    expiresIn: "10m",
  });
  res.cookie(config.twoFactorCookieName, token, { ...cookieOptions(), maxAge: 10 * 60 * 1000 });
}

export function readTwoFactorCookie(req) {
  const token = req.cookies?.[config.twoFactorCookieName];
  if (!token) return null;
  try {
    const p = jwt.verify(token, config.jwtSecret, { algorithms: ["HS256"] });
    const userId = Number(p.sub);
    if (p.typ !== "2fa" || !Number.isInteger(userId) || !Number.isInteger(p.cid)) return null;
    return { userId, codeId: p.cid };
  } catch {
    return null;
  }
}

export function clearTwoFactorCookie(res) {
  res.clearCookie(config.twoFactorCookieName, cookieOptions());
}
