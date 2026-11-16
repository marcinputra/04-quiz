import { useState } from "react";
import { useAuth } from "../auth/AuthContext";
import { api } from "../api";
import TwoFactorSettings from "./TwoFactorSettings";
import "./Auth.css";

const PASSWORD_MIN = 8;

// Moje konto: dane użytkownika i zmiana hasła
function Account() {
  const { user } = useAuth();
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [newPassword2, setNewPassword2] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [sending, setSending] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (newPassword.length < PASSWORD_MIN) {
      setError(`Nowe hasło musi mieć co najmniej ${PASSWORD_MIN} znaków.`);
      return;
    }
    if (newPassword !== newPassword2) {
      setError("Nowe hasła nie są takie same.");
      return;
    }

    setSending(true);
    try {
      await api("/auth/change-password", { method: "POST", body: { currentPassword, newPassword } });
      setSuccess("Hasło zostało zmienione. Na pozostałych urządzeniach zostałeś wylogowany.");
      setCurrentPassword("");
      setNewPassword("");
      setNewPassword2("");
    } catch (err) {
      setError(err.message);
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="mzi-auth-page">
      <div className="mzi-auth-card">
        <h1 className="mzi-auth-title">Moje konto</h1>
        <dl className="mzi-auth-details">
          <dt>Imię i nazwisko</dt>
          <dd>{user.name}</dd>
          <dt>E-mail</dt>
          <dd>{user.email}</dd>
          <dt>Rola</dt>
          <dd>{user.role === "admin" ? "administrator" : "uczeń"}</dd>
          <dt>Konto od</dt>
          <dd>{new Date(user.createdAt).toLocaleDateString("pl-PL")}</dd>
          <dt>E-mail potwierdzony</dt>
          <dd>{user.emailVerified ? "tak" : "nie"}</dd>
        </dl>

        <form className="mzi-auth-form" onSubmit={handleSubmit} noValidate>
          <h2 className="mzi-auth-subtitle">Zmiana hasła</h2>

          <label className="mzi-auth-label" htmlFor="acc-current">Obecne hasło</label>
          <input
            id="acc-current"
            className="mzi-auth-input"
            type="password"
            autoComplete="current-password"
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
          />

          <label className="mzi-auth-label" htmlFor="acc-new">Nowe hasło (min. {PASSWORD_MIN} znaków)</label>
          <input
            id="acc-new"
            className="mzi-auth-input"
            type="password"
            autoComplete="new-password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
          />

          <label className="mzi-auth-label" htmlFor="acc-new2">Powtórz nowe hasło</label>
          <input
            id="acc-new2"
            className="mzi-auth-input"
            type="password"
            autoComplete="new-password"
            value={newPassword2}
            onChange={(e) => setNewPassword2(e.target.value)}
          />

          {error && <p className="mzi-auth-error" role="alert">{error}</p>}
          {success && <p className="mzi-auth-success" role="status">{success}</p>}

          <button
            type="submit"
            className="mzi-auth-submit"
            disabled={sending || !currentPassword || !newPassword || !newPassword2}
          >
            {sending ? "Zapisywanie..." : "Zmień hasło"}
          </button>
        </form>

        <TwoFactorSettings />
      </div>
    </div>
  );
}

export default Account;
