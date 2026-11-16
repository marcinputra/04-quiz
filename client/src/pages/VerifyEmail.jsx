import { useEffect, useRef, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { api } from "../api";
import { useAuth } from "../auth/AuthContext";
import ResendVerification from "../auth/ResendVerification";
import "./Auth.css";

// /potwierdz-email?token=... — strona z linku w e-mailu po rejestracji
function VerifyEmail() {
  const [params] = useSearchParams();
  const token = params.get("token") ?? "";
  const { setUser } = useAuth();
  const [state, setState] = useState({ status: "loading" });
  const sent = useRef(false); // link działa raz — nie wysyłamy go dwa razy

  useEffect(() => {
    if (sent.current) return;
    sent.current = true;
    if (!token) {
      setState({ status: "error", message: "Brak tokenu w linku." });
      return;
    }
    api("/auth/verify-email", { method: "POST", body: { token } })
      .then((data) => {
        if (data.user) {
          setUser(data.user); // od razu zalogowany
          setState({ status: "ok", name: data.user.name });
        } else {
          setState({ status: "already" });
        }
      })
      .catch((err) => setState({ status: "error", message: err.message, expired: err.code === "EXPIRED" }));
  }, [token, setUser]);

  return (
    <div className="mzi-auth-page">
      <div className="mzi-auth-card">
        {state.status === "loading" && <p className="mzi-auth-text">Potwierdzanie adresu e-mail...</p>}

        {state.status === "ok" && (
          <>
            <h1 className="mzi-auth-title">Konto aktywne!</h1>
            <p className="mzi-auth-text">
              Dziękujemy, {state.name}. Adres e-mail został potwierdzony i jesteś już zalogowany.
            </p>
            <div className="mzi-auth-actions">
              <Link to="/quizy" className="mzi-auth-submit mzi-auth-btnlink">Rozwiąż quiz</Link>
              <Link to="/kursy" className="mzi-auth-secondary mzi-auth-btnlink">Zobacz kursy</Link>
            </div>
          </>
        )}

        {state.status === "already" && (
          <>
            <h1 className="mzi-auth-title">Adres już potwierdzony</h1>
            <p className="mzi-auth-text">To konto jest już aktywne — możesz się zalogować.</p>
            <Link to="/logowanie" className="mzi-auth-submit mzi-auth-btnlink">Zaloguj się</Link>
          </>
        )}

        {state.status === "error" && (
          <>
            <h1 className="mzi-auth-title">Nie udało się potwierdzić</h1>
            <p className="mzi-auth-error" role="alert">{state.message}</p>
            <p className="mzi-auth-text">Wpisz adres e-mail konta, a wyślemy nowy link.</p>
            <ResendVerification />
          </>
        )}
      </div>
    </div>
  );
}

export default VerifyEmail;
