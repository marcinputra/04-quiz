import { useEffect, useState } from "react";
import { api } from "../api";

const COOLDOWN = 60; // sekundy — tyle samo serwer wymaga między wysyłkami

// Przycisk „Wyślij link ponownie” (rejestracja, logowanie, wygasły link).
// email = znany adres; bez niego pokazuje pole do wpisania.
function ResendVerification({ email: knownEmail, startWithCooldown = false }) {
  const [email, setEmail] = useState(knownEmail ?? "");
  const [wait, setWait] = useState(startWithCooldown ? COOLDOWN : 0);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [sending, setSending] = useState(false);

  useEffect(() => {
    if (wait <= 0) return;
    const t = setTimeout(() => setWait((w) => w - 1), 1000);
    return () => clearTimeout(t);
  }, [wait]);

  const send = async () => {
    setSending(true);
    setError("");
    setMessage("");
    try {
      await api("/auth/resend-verification", { method: "POST", body: { email } });
      setMessage("Jeśli konto czeka na potwierdzenie, wysłaliśmy nowy link. Sprawdź skrzynkę (także folder SPAM).");
      setWait(COOLDOWN);
    } catch (err) {
      setError(err.message);
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="mzi-resend">
      {!knownEmail && (
        <>
          <label className="mzi-auth-label" htmlFor="resend-email">Adres e-mail konta</label>
          <input
            id="resend-email"
            className="mzi-auth-input"
            type="email"
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </>
      )}
      <button type="button" className="mzi-auth-secondary" onClick={send} disabled={sending || wait > 0 || !email}>
        {sending ? "Wysyłanie..." : wait > 0 ? `Wyślij link ponownie (za ${wait} s)` : "Wyślij link ponownie"}
      </button>
      {message && <p className="mzi-auth-success" role="status">{message}</p>}
      {error && <p className="mzi-auth-error" role="alert">{error}</p>}
    </div>
  );
}

export default ResendVerification;
