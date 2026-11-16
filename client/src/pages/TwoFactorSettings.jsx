import { useEffect, useState } from "react";
import { api } from "../api";
import { useAuth } from "../auth/AuthContext";

// Sekcja „Logowanie dwuetapowe” w Moim koncie.
// Włączenie: kod wysłany na e-mail (potwierdza, że poczta działa). Wyłączenie: hasło.
function TwoFactorSettings() {
  const { user, setUser } = useAuth();
  const [step, setStep] = useState("idle"); // idle | code | disable
  const [maskedEmail, setMaskedEmail] = useState("");
  const [code, setCode] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [busy, setBusy] = useState(false);
  const [wait, setWait] = useState(0);

  useEffect(() => {
    if (wait <= 0) return;
    const t = setTimeout(() => setWait((w) => w - 1), 1000);
    return () => clearTimeout(t);
  }, [wait]);

  const run = async (fn) => {
    setBusy(true);
    setError("");
    setSuccess("");
    try {
      await fn();
    } catch (err) {
      setError(err.message);
      if (err.data?.retryAfter) setWait(err.data.retryAfter);
    } finally {
      setBusy(false);
    }
  };

  const start = () =>
    run(async () => {
      const data = await api("/auth/2fa/enable/start", { method: "POST" });
      setMaskedEmail(data.email);
      setCode("");
      setStep("code");
      setWait(60);
    });

  const confirm = (e) => {
    e.preventDefault();
    run(async () => {
      const data = await api("/auth/2fa/enable/confirm", { method: "POST", body: { code } });
      setUser(data.user);
      setStep("idle");
      setSuccess("Logowanie dwuetapowe jest włączone. Przy każdym logowaniu dostaniesz kod na e-mail.");
    });
  };

  const disable = (e) => {
    e.preventDefault();
    run(async () => {
      const data = await api("/auth/2fa/disable", { method: "POST", body: { password } });
      setUser(data.user);
      setPassword("");
      setStep("idle");
      setSuccess("Logowanie dwuetapowe zostało wyłączone.");
    });
  };

  const enabled = user.twoFactorEnabled;

  return (
    <section className="mzi-account-section">
      <h2 className="mzi-auth-subtitle">
        Logowanie dwuetapowe
        <span className={`mzi-account-status ${enabled ? "mzi-account-status-on" : "mzi-account-status-off"}`}>
          {enabled ? "włączone" : "wyłączone"}
        </span>
      </h2>
      <p className="mzi-auth-text">
        Po wpisaniu hasła dostaniesz e-mailem 6-cyfrowy kod, bez którego nie da się zalogować. Chroni konto,
        nawet jeśli ktoś pozna Twoje hasło.
      </p>

      {step === "idle" && !enabled && (
        <button type="button" className="mzi-auth-submit" onClick={start} disabled={busy || wait > 0}>
          {busy ? "Wysyłanie kodu..." : "Włącz logowanie dwuetapowe"}
        </button>
      )}

      {step === "code" && (
        <form className="mzi-auth-form" onSubmit={confirm} noValidate>
          <p className="mzi-auth-text">
            Wysłaliśmy kod na <strong>{maskedEmail}</strong>. Wpisz go, aby włączyć logowanie dwuetapowe.
          </p>
          <label className="mzi-auth-label" htmlFor="tfa-code">Kod z e-maila</label>
          <input
            id="tfa-code"
            className="mzi-auth-input mzi-auth-code"
            inputMode="numeric"
            autoComplete="one-time-code"
            maxLength={6}
            value={code}
            onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))}
            autoFocus
          />
          <button type="submit" className="mzi-auth-submit" disabled={busy || code.length !== 6}>
            {busy ? "Sprawdzanie..." : "Potwierdź i włącz"}
          </button>
          <button type="button" className="mzi-auth-secondary" onClick={start} disabled={busy || wait > 0}>
            {wait > 0 ? `Wyślij nowy kod (za ${wait} s)` : "Wyślij nowy kod"}
          </button>
          <p className="mzi-auth-muted">
            <button type="button" className="mzi-auth-linkbtn" onClick={() => setStep("idle")}>Anuluj</button>
          </p>
        </form>
      )}

      {step === "idle" && enabled && (
        <button type="button" className="mzi-auth-secondary" onClick={() => { setStep("disable"); setSuccess(""); }}>
          Wyłącz logowanie dwuetapowe
        </button>
      )}

      {step === "disable" && (
        <form className="mzi-auth-form" onSubmit={disable} noValidate>
          <label className="mzi-auth-label" htmlFor="tfa-password">Podaj hasło, aby wyłączyć</label>
          <input
            id="tfa-password"
            className="mzi-auth-input"
            type="password"
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoFocus
          />
          <button type="submit" className="mzi-auth-submit" disabled={busy || !password}>
            {busy ? "Wyłączanie..." : "Wyłącz"}
          </button>
          <p className="mzi-auth-muted">
            <button type="button" className="mzi-auth-linkbtn" onClick={() => setStep("idle")}>Anuluj</button>
          </p>
        </form>
      )}

      {error && <p className="mzi-auth-error" role="alert">{error}</p>}
      {success && <p className="mzi-auth-success" role="status">{success}</p>}
    </section>
  );
}

export default TwoFactorSettings;
