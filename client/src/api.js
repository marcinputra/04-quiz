// Wspólna funkcja do wywołań backendu (/api/*).
// Ciasteczko z sesją wysyła się automatycznie (ta sama domena).

export class ApiError extends Error {
  constructor(message, status, data = null) {
    super(message);
    this.status = status;
    this.code = data?.code ?? null; // np. EMAIL_NOT_VERIFIED, RESTART, NO_ACCESS
    this.data = data;
  }
}

// keepalive: true — zapytanie dojdzie do serwera nawet przy zamykaniu karty
export async function api(path, { method = "GET", body, keepalive = false } = {}) {
  let res;
  try {
    res = await fetch(`/api${path}`, {
      method,
      keepalive,
      credentials: "same-origin",
      headers: body !== undefined ? { "Content-Type": "application/json" } : undefined,
      body: body !== undefined ? JSON.stringify(body) : undefined,
    });
  } catch {
    throw new ApiError("Brak połączenia z serwerem.", 0);
  }

  let data = null;
  try {
    data = await res.json();
  } catch {
    // odpowiedź bez JSON
  }

  if (!res.ok) {
    throw new ApiError(data?.error || `Błąd serwera (HTTP ${res.status}).`, res.status, data);
  }
  return data;
}
