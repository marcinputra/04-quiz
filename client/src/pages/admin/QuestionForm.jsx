import { useId, useState } from "react";

const OPTIONS_MIN = 2;
const OPTIONS_MAX = 8;
const letter = (i) => String.fromCharCode(65 + i);

const emptyOptions = () => Array.from({ length: 4 }, () => ({ id: null, text: "", isCorrect: false, used: 0 }));

// Formularz pytania: treść, kod (opcjonalnie), odpowiedzi A–H z jedną poprawną.
// initial = pytanie z API (edycja) albo null (nowe pytanie)
function QuestionForm({ initial, onSave, onCancel }) {
  const formId = useId();
  const [question, setQuestion] = useState(initial?.question ?? "");
  const [code, setCode] = useState(initial?.code ?? "");
  const [options, setOptions] = useState(() =>
    initial
      ? initial.options.map((o) => ({
          id: o.id,
          text: o.text,
          isCorrect: o.isCorrect,
          used: o._count?.attemptAnswers ?? 0,
        }))
      : emptyOptions()
  );
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  const updateOption = (index, patch) =>
    setOptions((prev) => prev.map((o, i) => (i === index ? { ...o, ...patch } : o)));

  const setCorrect = (index) =>
    setOptions((prev) => prev.map((o, i) => ({ ...o, isCorrect: i === index })));

  const removeOption = (index) => setOptions((prev) => prev.filter((_, i) => i !== index));

  const addOption = () =>
    setOptions((prev) => [...prev, { id: null, text: "", isCorrect: false, used: 0 }]);

  // Tab w polu kodu wstawia 4 spacje zamiast przechodzić do następnego pola
  const handleCodeKeyDown = (e) => {
    if (e.key !== "Tab" || e.shiftKey) return;
    e.preventDefault();
    const el = e.target;
    const { selectionStart: start, selectionEnd: end } = el;
    const next = code.slice(0, start) + "    " + code.slice(end);
    setCode(next);
    requestAnimationFrame(() => {
      el.selectionStart = el.selectionEnd = start + 4;
    });
  };

  const validate = () => {
    if (!question.trim() && !code.trim()) return "Podaj treść pytania albo kod.";
    const emptyIndex = options.findIndex((o) => !o.text.trim());
    if (emptyIndex >= 0) return `Odpowiedź ${letter(emptyIndex)} jest pusta.`;
    if (options.filter((o) => o.isCorrect).length !== 1) return "Zaznacz poprawną odpowiedź.";
    return "";
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const problem = validate();
    if (problem) {
      setError(problem);
      return;
    }
    setSaving(true);
    setError("");
    try {
      await onSave({
        question: question.trim(),
        code,
        options: options.map(({ id, text, isCorrect }) => ({ ...(id ? { id } : {}), text: text.trim(), isCorrect })),
      });
    } catch (err) {
      setError(err.message);
      setSaving(false);
    }
  };

  return (
    <form className="mzi-question-form" onSubmit={handleSubmit} noValidate>
      <label className="mzi-admin-label" htmlFor={`${formId}-q`}>Treść pytania</label>
      <textarea
        id={`${formId}-q`}
        className="mzi-admin-input"
        rows={2}
        value={question}
        onChange={(e) => setQuestion(e.target.value)}
        placeholder="np. Co wyświetli poniższy kod?"
        autoFocus
      />

      <label className="mzi-admin-label" htmlFor={`${formId}-code`}>
        Kod (opcjonalnie — wyświetla się pod pytaniem, Tab wstawia wcięcie)
      </label>
      <textarea
        id={`${formId}-code`}
        className="mzi-admin-input mzi-admin-code"
        rows={Math.min(Math.max(code.split("\n").length, 3), 16)}
        value={code}
        onChange={(e) => setCode(e.target.value)}
        onKeyDown={handleCodeKeyDown}
        spellCheck={false}
        placeholder={'for i in range(3):\n    print(i)'}
      />

      <fieldset className="mzi-question-options">
        <legend className="mzi-admin-label">Odpowiedzi — zaznacz poprawną</legend>
        {options.map((o, i) => (
          <div key={o.id ?? `new-${i}`} className={`mzi-option-row ${o.isCorrect ? "mzi-option-row-correct" : ""}`}>
            <input
              type="radio"
              name={`${formId}-correct`}
              checked={o.isCorrect}
              onChange={() => setCorrect(i)}
              aria-label={`Odpowiedź ${letter(i)} jest poprawna`}
              className="mzi-option-radio"
            />
            <span className="mzi-option-letter">{letter(i)}.</span>
            <input
              type="text"
              className="mzi-admin-input mzi-option-text"
              value={o.text}
              onChange={(e) => updateOption(i, { text: e.target.value })}
              aria-label={`Treść odpowiedzi ${letter(i)}`}
            />
            <button
              type="button"
              className="mzi-btn mzi-btn-icon"
              onClick={() => removeOption(i)}
              disabled={options.length <= OPTIONS_MIN || o.used > 0}
              title={o.used > 0 ? "Tę odpowiedź wybierali już uczniowie — można zmienić jej treść, ale nie usunąć" : "Usuń odpowiedź"}
              aria-label={`Usuń odpowiedź ${letter(i)}`}
            >
              ✕
            </button>
          </div>
        ))}
        {options.length < OPTIONS_MAX && (
          <button type="button" className="mzi-btn mzi-btn-small" onClick={addOption}>
            + Dodaj odpowiedź
          </button>
        )}
      </fieldset>

      {initial && initial._count?.attemptAnswers > 0 && (
        <p className="mzi-admin-note">
          Na to pytanie odpowiedziało już {initial._count.attemptAnswers} osób. Zmiana poprawnej odpowiedzi
          nie zmienia ich wcześniejszych wyników.
        </p>
      )}

      {error && <p className="mzi-auth-error" role="alert">{error}</p>}

      <div className="mzi-form-actions">
        <button type="submit" className="mzi-btn mzi-btn-primary" disabled={saving}>
          {saving ? "Zapisywanie..." : initial ? "Zapisz pytanie" : "Dodaj pytanie"}
        </button>
        <button type="button" className="mzi-btn" onClick={onCancel} disabled={saving}>
          Anuluj
        </button>
      </div>
    </form>
  );
}

export default QuestionForm;
