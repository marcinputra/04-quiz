import { useEffect, useState } from "react";
import { Link, Navigate, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";
import { api } from "../api";
import ResendVerification from "../auth/ResendVerification";
import "./Auth.css";

const RESEND_COOLDOWN = 60;

// Logowanie: krok 1 — e-mail i hasło; krok 2 (gdy włączone 2FA) — kod z e-maila
function Login() {
  const { user, loading, login, verifyTwoFactor } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  // gdzie wrócić po zalogowaniu (ustawia RequireAuth)
  const from = location.state?.from?.pathname || "/";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [notVerified, setNotVerified] = useState(false);
  const [sending, setSending] = useState(false);

  // krok 2
  const [codeStep, setCodeStep] = useState(null); // { email: "ja***@..." }
  const [code, setCode] = useState("");
  const [info, setInfo] = useState("");
  const [wait, setWait] = useState(0);

  useEffect(() => {
    if (wait <= 0) return;
    const t = setTimeout(() => setWait((w) => w - 1), 1000);
    return () => clearTimeout(t);
  }, [wait]);

  if (loading) return <p className="mzi-auth-loading">Ładowanie...</p>;
  if (user) return <Navigate to={from} replace />;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setNotVerified(false);
    setSending(true);
    try {
      const data = await login(email, password);
      if (data.twoFactorRequired) {
        setCodeStep({ email: data.email });
        setCode("");
        setInfo("");
        setWait(RESEND_COOLDOWN);
        return;
      }
      navigate(from, { replace: true });
    } catch (err) {
      setError(err.message);
      setNotVerified(err.code === "EMAIL_NOT_VERIFIED");
    } finally {
      setSending(false);
    }
  };

  const handleCode = async (e) => {
    e.preventDefault();
    setError("");
    setInfo("");
    setSending(true);
    try {
      await verifyTwoFactor(code);
      navigate(from, { replace: true });
    } catch (err) {
      setError(err.message);
      setCode("");
      if (err.code === "RESTART") {
        // kod wygasł / zablokowany — wracamy do hasła
        setCodeStep(null);
        setPassword("");
      }
    } finally {
      setSending(false);
    }
  };

  const resendCode = async () => {
    setError("");
    setInfo("");
    try {
      await api("/auth/2fa/resend", { method: "POST" });
      setInfo("Wysłaliśmy nowy kod. Poprzedni przestał działać.");
      setWait(RESEND_COOLDOWN);
    } catch (err) {
      setError(err.message);
      if (err.data?.retryAfter) setWait(err.data.retryAfter);
      if (err.code === "RESTART") setCodeStep(null);
    }
  };

  if (codeStep) {
    return (
      <div className="mzi-auth-page">
        <form className="mzi-auth-card mzi-auth-form" onSubmit={handleCode} noValidate>
          <h1 className="mzi-auth-title">Kod logowania</h1>
          <p className="mzi-auth-text">
            Wysłaliśmy 6-cyfrowy kod na adres <strong>{codeStep.email}</strong>. Kod jest ważny 10 minut.
          </p>

          <label className="mzi-auth-label" htmlFor="login-code">Kod z e-maila</label>
          <input
            id="login-code"
            className="mzi-auth-input mzi-auth-code"
            inputMode="numeric"
            autoComplete="one-time-code"
            maxLength={6}
            value={code}
            onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))}
            autoFocus
          />

          {error && <p className="mzi-auth-error" role="alert">{error}</p>}
          {info && <p className="mzi-auth-success" role="status">{info}</p>}

          <button type="submit" className="mzi-auth-submit" disabled={sending || code.length !== 6}>
            {sending ? "Sprawdzanie..." : "Zaloguj się"}
          </button>
          <button type="button" className="mzi-auth-secondary" onClick={resendCode} disabled={wait > 0}>
            {wait > 0 ? `Wyślij nowy kod (za ${wait} s)` : "Wyślij nowy kod"}
          </button>
          <p className="mzi-auth-muted">
            <button type="button" className="mzi-auth-linkbtn" onClick={() => { setCodeStep(null); setError(""); }}>
              ← Wróć do logowania
            </button>
          </p>
        </form>
      </div>
    );
  }

  return (
    <div className="mzi-auth-page">
      <form className="mzi-auth-card mzi-auth-form" onSubmit={handleSubmit} noValidate>
        <h1 className="mzi-auth-title">Logowanie</h1>

        <label className="mzi-auth-label" htmlFor="login-email">E-mail</label>
        <input
          id="login-email"
          className="mzi-auth-input"
          type="email"
          autoComplete="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />

        <label className="mzi-auth-label" htmlFor="login-password">Hasło</label>
        <input
          id="login-password"
          className="mzi-auth-input"
          type="password"
          autoComplete="current-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <p className="mzi-auth-forgot">
          <Link to="/reset-hasla" className="mzi-auth-link">Nie pamiętasz hasła?</Link>
        </p>

        {error && <p className="mzi-auth-error" role="alert">{error}</p>}
        {notVerified && <ResendVerification email={email} />}

        <button type="submit" className="mzi-auth-submit" disabled={sending || !email || !password}>
          {sending ? "Logowanie..." : "Zaloguj się"}
        </button>

        <p className="mzi-auth-muted">
          Nie masz konta?{" "}
          <Link to="/rejestracja" state={location.state} className="mzi-auth-link">
            Zarejestruj się
          </Link>
        </p>
      </form>
    </div>
  );
}

export default Login;
