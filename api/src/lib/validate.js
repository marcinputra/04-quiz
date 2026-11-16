// Proste walidatory danych z formularzy. Zwracają { value } albo { error }.

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const PASSWORD_MIN = 8;
export const PASSWORD_MAX = 72; // bcrypt i tak bierze tylko pierwsze 72 bajty

export function validateEmail(raw) {
  const value = typeof raw === "string" ? raw.trim().toLowerCase() : "";
  if (!value) return { error: "Podaj adres e-mail." };
  if (value.length > 255 || !EMAIL_RE.test(value)) return { error: "Niepoprawny adres e-mail." };
  return { value };
}

export function validateName(raw) {
  const value = typeof raw === "string" ? raw.trim().replace(/\s+/g, " ") : "";
  if (value.length < 2) return { error: "Imię i nazwisko musi mieć co najmniej 2 znaki." };
  if (value.length > 120) return { error: "Imię i nazwisko może mieć najwyżej 120 znaków." };
  return { value };
}

export function validatePassword(raw) {
  const value = typeof raw === "string" ? raw : "";
  if (value.length < PASSWORD_MIN) return { error: `Hasło musi mieć co najmniej ${PASSWORD_MIN} znaków.` };
  if (Buffer.byteLength(value, "utf8") > PASSWORD_MAX) return { error: "Hasło jest za długie." };
  return { value };
}
