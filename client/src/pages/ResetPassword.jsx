import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { api } from "../api";
import { useAuth } from "../auth/AuthContext";
import "./Auth.css";

const PASSWORD_MIN = 8;

// /nowe-haslo?token=... — strona z linku w e-mailu: ustawienie nowego hasła
function ResetPassword() {
  const [params] = useSearchParams();
  const token = params.get("token") ?? "";
  const { refresh } = useAuth();

  const [status, setStatus] = useState("checking"); // checking | form | invalid | done
  const [linkError, setLinkError] = useState("");
  const [password, setPassword] = useState("");
  const [password2, setPassword2] = useState("");
  const [error, setError] = useState("");
  const [sending, setSending] = useState(false);

  // od razu sprawdzamy, czy link jest jeszcze ważny (bez jego zużywania)
  useEffect(() => {
    if (!token) {
      setLinkError("Brak tokenu w linku.");
      setStatus("invalid");
      return;
    }
    api("/auth/reset-password/check", { method: "POST", body: { token } })
      .then(() => setStatus("form"))
      .catch((err) => {
        setLinkError(err.message);
        setStatus("invalid");
      });
  }, [token]);

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
      await api("/auth/reset-password", { method: "POST", body: { token, password } });
      await refresh(); // serwer wylogował wszystkie urządzenia, także to
      setStatus("done");
    } catch (err) {
      if (err.code === "EXPIRED" || err.code === "INVALID") {
        setLinkError(err.message);
        setStatus("invalid");
      } else {
        setError(err.message);
      }
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="mzi-auth-page">
      <div className="mzi-auth-card">
        {status === "checking" && <p className="mzi-auth-text">Sprawdzanie linku...</p>}

        {status === "invalid" && (
          <>
            <h1 className="mzi-auth-title">Link nie działa</h1>
            <p className="mzi-auth-error" role="alert">{linkError}</p>
            <Link to="/reset-hasla" className="mzi-auth-submit mzi-auth-btnlink">Wyślij nowy link</Link>
          </>
        )}

        {status === "done" && (
          <>
            <h1 className="mzi-auth-title">Hasło zmienione</h1>
            <p className="mzi-auth-text">
              Nowe hasło zostało ustawione. Ze względów bezpieczeństwa wylogowaliśmy Cię na wszystkich urządzeniach —
              zaloguj się nowym hasłem.
            </p>
            <Link to="/logowanie" className="mzi-auth-submit mzi-auth-btnlink">Zaloguj się</Link>
          </>
        )}

        {status === "form" && (
          <form className="mzi-auth-form" onSubmit={handleSubmit} noValidate>
            <h1 className="mzi-auth-title">Ustaw nowe hasło</h1>

            <label className="mzi-auth-label" htmlFor="reset-password">Nowe hasło (min. {PASSWORD_MIN} znaków)</label>
            <input
              id="reset-password"
              className="mzi-auth-input"
              type="password"
              autoComplete="new-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoFocus
            />

            <label className="mzi-auth-label" htmlFor="reset-password2">Powtórz nowe hasło</label>
            <input
              id="reset-password2"
              className="mzi-auth-input"
              type="password"
              autoComplete="new-password"
              value={password2}
              onChange={(e) => setPassword2(e.target.value)}
            />

            {error && <p className="mzi-auth-error" role="alert">{error}</p>}

            <button type="submit" className="mzi-auth-submit" disabled={sending || !password || !password2}>
              {sending ? "Zapisywanie..." : "Ustaw nowe hasło"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}

export default ResetPassword;
