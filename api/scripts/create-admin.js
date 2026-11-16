// Zakłada konto administratora albo nadaje rolę admin istniejącemu kontu.
//
// Użycie (interaktywnie — skrypt zapyta o brakujące dane, hasło nie jest wyświetlane):
//   npm run create-admin
//   npm run create-admin -- --email ja@example.com --name "Jan Kowalski"
//
// Bez pytań (np. w Dockerze) — hasło przez zmienną środowiskową:
//   ADMIN_PASSWORD='...' npm run create-admin -- --email ja@example.com --name "Jan Kowalski"
//
// Gdy konto już istnieje: dostaje rolę admin, hasło się NIE zmienia,
// chyba że dodasz --reset-password.

import readline from "node:readline";
import { hashPassword } from "../src/lib/auth.js";
import { validateEmail, validateName, validatePassword } from "../src/lib/validate.js";

const args = process.argv.slice(2);
const argValue = (name) => {
  const i = args.indexOf(`--${name}`);
  return i >= 0 ? args[i + 1] : undefined;
};
const resetPassword = args.includes("--reset-password");

function ask(question, { hidden = false } = {}) {
  return new Promise((resolve) => {
    const rl = readline.createInterface({ input: process.stdin, output: process.stdout, terminal: true });
    if (hidden) {
      // nie pokazuj wpisywanych znaków
      rl._writeToOutput = (s) => {
        if (s.includes(question)) rl.output.write(s);
      };
    }
    rl.question(question, (answer) => {
      rl.close();
      if (hidden) process.stdout.write("\n");
      resolve(answer);
    });
  });
}

async function getValid(label, validator, initial, opts) {
  let raw = initial;
  for (;;) {
    if (raw === undefined) {
      if (!process.stdin.isTTY) throw new Error(`Brak wartości: ${label}`);
      raw = await ask(`${label}: `, opts);
    }
    const result = validator(raw);
    if (!result.error) return result.value;
    if (!process.stdin.isTTY || initial !== undefined) throw new Error(result.error);
    console.log(`  ${result.error}`);
    raw = undefined;
  }
}

async function getPassword() {
  const fromEnv = process.env.ADMIN_PASSWORD;
  if (fromEnv !== undefined) {
    const result = validatePassword(fromEnv);
    if (result.error) throw new Error(result.error);
    return result.value;
  }
  for (;;) {
    const password = await getValid("Hasło", validatePassword, undefined, { hidden: true });
    const repeat = await ask("Powtórz hasło: ", { hidden: true });
    if (password === repeat) return password;
    console.log("  Hasła nie są takie same.");
  }
}

async function main() {
  const { prisma } = await import("../src/db.js");
  try {
    const email = await getValid("E-mail", validateEmail, argValue("email"));
    const existing = await prisma.user.findUnique({ where: { email } });

    if (existing) {
      // admin zakładany ręcznie przez właściciela serwera — e-mail uznajemy za potwierdzony
      const data = { role: "admin", emailVerifiedAt: existing.emailVerifiedAt ?? new Date() };
      if (resetPassword) data.passwordHash = await hashPassword(await getPassword());
      await prisma.user.update({ where: { id: existing.id }, data });
      console.log(
        `Konto ${email} już istniało — nadano rolę admin${resetPassword ? " i ustawiono nowe hasło" : ""}.`
      );
      return;
    }

    const name = await getValid("Imię i nazwisko", validateName, argValue("name"));
    const password = await getPassword();
    await prisma.user.create({
      data: { email, name, role: "admin", passwordHash: await hashPassword(password), emailVerifiedAt: new Date() },
    });
    console.log(`Utworzono konto administratora: ${email}`);
  } finally {
    await prisma.$disconnect();
  }
}

main().catch((err) => {
  console.error("Błąd:", err.message);
  process.exit(1);
});
