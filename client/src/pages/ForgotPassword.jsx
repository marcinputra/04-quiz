import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../api";
import "./Auth.css";

const COOLDOWN = 60;

// /reset-hasla — prośba o link do ustawienia nowego hasła
function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");
  const [sending, setSending] = useState(false);
  const [wait, setWait] = useState(0);

  useEffect(() => {
    if (wait <= 0) return;
    const t = setTimeout(() => setWait((w) => w - 1), 1000);
    return () => clearTimeout(t);
  }, [wait]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSending(true);
    setError("");
    try {
      await api("/auth/forgot-password", { method: "POST", body: { email } });
      setSent(true);
      setWait(COOLDOWN);
    } catch (err) {
      setError(err.message);
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="mzi-auth-page">
      <form className="mzi-auth-card mzi-auth-form" onSubmit={handleSubmit} noValidate>
        <h1 className="mzi-auth-title">Nie pamiętasz hasła?</h1>

        {!sent ? (
          <p className="mzi-auth-text">
            Podaj adres e-mail konta — wyślemy link do ustawienia nowego hasła (ważny 1 godzinę).
          </p>
        ) : (
          <p className="mzi-auth-success" role="status">
            Jeśli konto o adresie <strong>{email}</strong> istnieje, wysłaliśmy na nie link do ustawienia nowego
            hasła. Sprawdź skrzynkę (także folder SPAM).
          </p>
        )}

        <label className="mzi-auth-label" htmlFor="forgot-email">E-mail</label>
        <input
          id="forgot-email"
          className="mzi-auth-input"
          type="email"
          autoComplete="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          autoFocus
        />

        {error && <p className="mzi-auth-error" role="alert">{error}</p>}

        <button type="submit" className="mzi-auth-submit" disabled={sending || !email || wait > 0}>
          {sending ? "Wysyłanie..." : wait > 0 ? `Wyślij ponownie (za ${wait} s)` : sent ? "Wyślij ponownie" : "Wyślij link"}
        </button>

        <p className="mzi-auth-muted">
          <Link to="/logowanie" className="mzi-auth-link">← Wróć do logowania</Link>
        </p>
      </form>
    </div>
  );
}

export default ForgotPassword;
