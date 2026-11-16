import { prisma } from "../db.js";
import { config } from "../config.js";
import { readToken, clearAuthCookie, publicUserSelect, publicUser } from "../lib/auth.js";

// Odczytuje ciasteczko i ustawia req.user (albo null).
// Użytkownik jest pobierany z bazy przy każdym żądaniu, więc zmiana roli
// lub usunięcie konta działa od razu, bez czekania na wygaśnięcie tokenu.
export async function loadUser(req, res, next) {
  req.user = null;
  const token = req.cookies?.[config.cookieName];
  if (!token) return next();

  const session = readToken(token);
  if (!session) {
    clearAuthCookie(res);
    return next();
  }

  try {
    const user = await prisma.user.findUnique({ where: { id: session.userId }, select: publicUserSelect });
    // sesja ważna tylko gdy: konto istnieje, e-mail potwierdzony i wersja sesji aktualna
    // (po zmianie / resecie hasła stare sesje na innych urządzeniach przestają działać)
    const valid = user && user.emailVerifiedAt && user.tokenVersion === session.version;
    req.user = valid ? publicUser(user) : null;
    if (!req.user) clearAuthCookie(res);
    next();
  } catch (err) {
    next(err);
  }
}

export function requireAuth(req, res, next) {
  if (!req.user) return res.status(401).json({ error: "Musisz się zalogować." });
  next();
}

export function requireAdmin(req, res, next) {
  if (!req.user) return res.status(401).json({ error: "Musisz się zalogować." });
  if (req.user.role !== "admin") return res.status(403).json({ error: "Brak uprawnień." });
  next();
}
