import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "./AuthContext";

// Strona tylko dla zalogowanych — inaczej przekierowanie na /logowanie,
// a po zalogowaniu powrót na stronę, którą ktoś chciał otworzyć.
export function RequireAuth({ children }) {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) return <p className="mzi-auth-loading">Ładowanie...</p>;
  if (!user) return <Navigate to="/logowanie" replace state={{ from: location }} />;
  return children;
}

// Strona tylko dla administratora
export function RequireAdmin({ children }) {
  const { user, loading, isAdmin } = useAuth();
  const location = useLocation();

  if (loading) return <p className="mzi-auth-loading">Ładowanie...</p>;
  if (!user) return <Navigate to="/logowanie" replace state={{ from: location }} />;
  if (!isAdmin) {
    return (
      <div className="mzi-auth-page">
        <div className="mzi-auth-card">
          <h1 className="mzi-auth-title">Brak dostępu</h1>
          <p className="mzi-auth-muted">Ta strona jest dostępna tylko dla administratora.</p>
        </div>
      </div>
    );
  }
  return children;
}
