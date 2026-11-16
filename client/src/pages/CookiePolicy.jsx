import { useEffect } from "react";
import { Link } from "react-router-dom";
import Footer from "../component/Footer";
import "./Articles.css";
import "./CookiePolicy.css";

// /polityka-cookies — jakie ciasteczka i dane w przeglądarce zapisuje strona.
// Przy dodaniu nowego ciasteczka / narzędzia (np. statystyk) zaktualizuj tę stronę.
const UPDATED = "15 listopada 2026";

function CookiePolicy() {
  useEffect(() => {
    document.title = "Polityka cookies — maturazinformatyki.it";
  }, []);

  return (
    <div className="mzi-home">
      <main className="mzi-container mzi-article-page mzi-policy">
        <h1 className="mzi-article-page-title">Polityka plików cookies</h1>
        <p className="mzi-article-meta">Ostatnia aktualizacja: {UPDATED}</p>

        <section>
          <h2>Najważniejsze w skrócie</h2>
          <ul>
            <li>Strona <strong>maturazinformatyki.it</strong> używa <strong>wyłącznie niezbędnych plików cookies</strong> — tylko po to, żeby działało logowanie i było bezpieczne.</li>
            <li><strong>Nie używamy</strong> ciasteczek reklamowych, analitycznych (np. Google Analytics) ani śledzących, nie profilujemy użytkowników i nie przekazujemy danych reklamodawcom.</li>
            <li>Jeśli nie zakładasz konta i się nie logujesz, strona <strong>nie zapisuje żadnych ciasteczek</strong>.</li>
          </ul>
        </section>

        <section>
          <h2>Czym są pliki cookies?</h2>
          <p>
            Pliki cookies (ciasteczka) to małe pliki tekstowe, które strona zapisuje w Twojej przeglądarce. Przeglądarka
            odsyła je przy kolejnych odwiedzinach — dzięki temu strona „pamięta”, że jesteś zalogowany.
          </p>
        </section>

        <section>
          <h2>Jakie pliki cookies zapisujemy</h2>
          <div className="mzi-md-table-wrap">
            <table className="mzi-policy-table">
              <thead>
                <tr>
                  <th>Nazwa</th>
                  <th>Do czego służy</th>
                  <th>Kiedy powstaje</th>
                  <th>Jak długo</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td><code>mzi_token</code></td>
                  <td>Utrzymuje zalogowanie (sesję). Bez niego trzeba by logować się na każdej stronie.</td>
                  <td>Po zalogowaniu</td>
                  <td>7 dni albo do wylogowania</td>
                </tr>
                <tr>
                  <td><code>mzi_2fa</code></td>
                  <td>Łączy wpisane hasło z kodem z e-maila podczas logowania dwuetapowego. Samo nie loguje.</td>
                  <td>Tylko przy logowaniu z włączonym logowaniem dwuetapowym</td>
                  <td>10 minut (usuwane po wpisaniu kodu)</td>
                </tr>
              </tbody>
            </table>
          </div>
          <p>
            Oba ciasteczka są <strong>niezbędne</strong> do świadczenia usługi, o którą prosisz (logowanie), dlatego zgodnie
            z przepisami (ustawa Prawo komunikacji elektronicznej, unijna dyrektywa ePrivacy) nie wymagają zgody — wymagają
            jedynie poinformowania o nich, co robimy na tej stronie. Są zabezpieczone: niedostępne dla skryptów na stronie (<em>HttpOnly</em>), przesyłane tylko szyfrowanym
            połączeniem (<em>Secure</em>) i nie są wysyłane z innych stron (<em>SameSite</em>).
          </p>
        </section>

        <section>
          <h2>Pamięć przeglądarki (localStorage)</h2>
          <p>Oprócz ciasteczek strona zapisuje w przeglądarce dwa ustawienia (nie trafiają one na serwer):</p>
          <ul>
            <li><code>mzi_cookie_notice</code> — że zamknąłeś informację o ciasteczkach (żeby nie pokazywać jej ponownie),</li>
            <li><code>mzi_md_editor_view</code> — wybrany widok edytora treści (tylko w panelu administratora).</li>
          </ul>
        </section>

        <section>
          <h2>Zasoby zewnętrzne — czcionki Google</h2>
          <p>
            Do wyświetlania tekstu strona pobiera czcionki z usługi <strong>Google Fonts</strong> (Google Ireland Ltd.).
            Usługa nie zapisuje ciasteczek, ale przy pobieraniu czcionek przeglądarka łączy się z serwerami Google, które
            otrzymują Twój adres IP. Więcej:{" "}
            <a href="https://policies.google.com/privacy?hl=pl" target="_blank" rel="noopener noreferrer">polityka prywatności Google</a>.
          </p>
        </section>

        <section>
          <h2>Jak zarządzać ciasteczkami</h2>
          <p>
            Możesz w każdej chwili usunąć ciasteczka albo zablokować ich zapisywanie w ustawieniach przeglądarki (zwykle:
            Ustawienia → Prywatność i bezpieczeństwo → Pliki cookie). Strona będzie działać, ale <strong>bez ciasteczek nie
            da się zalogować</strong> — artykuły i opisy kursów pozostaną dostępne.
          </p>
          <p>Wylogowanie (przycisk „Wyloguj”) usuwa ciasteczko sesji.</p>
        </section>

        <section>
          <h2>Zmiany</h2>
          <p>
            Jeśli zaczniemy używać innych plików cookies (np. statystyk odwiedzin), zaktualizujemy tę stronę i — gdy będzie
            to wymagane — poprosimy o zgodę przed ich zapisaniem.
          </p>
        </section>

        <p className="mzi-policy-back">
          <Link to="/" className="mzi-article-back">← Strona główna</Link>
        </p>
      </main>
      <Footer nameQuiz="Polityka cookies" />
    </div>
  );
}

export default CookiePolicy;
