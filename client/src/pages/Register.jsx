import { useState } from "react";
import { Link, Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";
import ResendVerification from "../auth/ResendVerification";
import "./Auth.css";

const PASSWORD_MIN = 8;

function Register() {
  const { user, loading, register } = useAuth();
  const location = useLocation();
  const from = location.state?.from?.pathname || "/";

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [password2, setPassword2] = useState("");
  const [error, setError] = useState("");
  const [sending, setSending] = useState(false);
  const [registered, setRegistered] = useState(null); // { email, emailSent } po założeniu konta

  if (loading) return <p className="mzi-auth-loading">Ładowanie...</p>;
  if (user) return <Navigate to={from} replace />;

  // konto założone — czeka na potwierdzenie e-maila
  if (registered) {
    return (
      <div className="mzi-auth-page">
        <div className="mzi-auth-card">
          <h1 className="mzi-auth-title">Sprawdź skrzynkę</h1>
          {registered.emailSent ? (
            <p className="mzi-auth-text">
              Wysłaliśmy link potwierdzający na adres <strong>{registered.email}</strong>. Kliknij go, aby
              aktywować konto — link jest ważny 24 godziny.
            </p>
          ) : (
            <p className="mzi-auth-error">
              Konto zostało założone, ale nie udało się wysłać e-maila. Spróbuj wysłać link ponownie.
            </p>
          )}
          <p className="mzi-auth-muted">Nie widzisz wiadomości? Sprawdź folder SPAM albo wyślij link jeszcze raz.</p>
          <ResendVerification email={registered.email} startWithCooldown={registered.emailSent} />
          <p className="mzi-auth-muted">
            <Link to="/logowanie" className="mzi-auth-link">Przejdź do logowania</Link>
          </p>
        </div>
      </div>
    );
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (password.length < PASSWORD_MIN) {
      setError(`Hasło musi mieć co najmniej ${PASSWORD_MIN} znaków.`);
      return;
    }
    if (password !== password2) {
      setError("Hasła nie są takie same.");
      return;
    }

    setSending(true);
    try {
      const data = await register(name, email, password);
      setRegistered({ email: data.email, emailSent: data.emailSent });
    } catch (err) {
      setError(err.message);
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="mzi-auth-page">
      <form className="mzi-auth-card mzi-auth-form" onSubmit={handleSubmit} noValidate>
        <h1 className="mzi-auth-title">Załóż konto</h1>

        <label className="mzi-auth-label" htmlFor="reg-name">Imię i nazwisko</label>
        <input
          id="reg-name"
          className="mzi-auth-input"
          type="text"
          autoComplete="name"
          placeholder="np. Jan Kowalski"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />

        <label className="mzi-auth-label" htmlFor="reg-email">E-mail</label>
        <input
          id="reg-email"
          className="mzi-auth-input"
          type="email"
          autoComplete="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />

        <label className="mzi-auth-label" htmlFor="reg-password">Hasło (min. {PASSWORD_MIN} znaków)</label>
        <input
          id="reg-password"
          className="mzi-auth-input"
          type="password"
          autoComplete="new-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />

        <label className="mzi-auth-label" htmlFor="reg-password2">Powtórz hasło</label>
        <input
          id="reg-password2"
          className="mzi-auth-input"
          type="password"
          autoComplete="new-password"
          value={password2}
          onChange={(e) => setPassword2(e.target.value)}
          required
        />

        {error && <p className="mzi-auth-error" role="alert">{error}</p>}

        <button
          type="submit"
          className="mzi-auth-submit"
          disabled={sending || !name || !email || !password || !password2}
        >
          {sending ? "Zakładanie konta..." : "Zarejestruj się"}
        </button>

        <p className="mzi-auth-muted">
          Masz już konto?{" "}
          <Link to="/logowanie" state={location.state} className="mzi-auth-link">
            Zaloguj się
          </Link>
        </p>
      </form>
    </div>
  );
}

export default Register;
