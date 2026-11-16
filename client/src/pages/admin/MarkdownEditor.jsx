import { useEffect, useRef, useState } from "react";
import Markdown from "../../component/Markdown";
import "./MarkdownEditor.css";

// Edytor Markdown: pasek narzędzi + pole tekstowe + podgląd na żywo.
// Podgląd używa tego samego komponentu <Markdown> co strona artykułu, więc wygląda identycznie.

const VIEW_KEY = "mzi_md_editor_view";

// Wstawia tekst w miejsce zaznaczenia tak, żeby działało Ctrl+Z (execCommand),
// a gdy przeglądarka tego nie obsługuje — przez zwykłą zmianę wartości.
function replaceSelection(textarea, text, onChange, selectStart, selectEnd) {
  const { selectionStart: start, selectionEnd: end, value } = textarea;
  textarea.focus();
  const from = start + (selectStart ?? text.length);
  const to = start + (selectEnd ?? selectStart ?? text.length);
  const ok = typeof document.execCommand === "function" && document.execCommand("insertText", false, text);
  if (ok) {
    // wartość pola jest już zmieniona — zaznaczenie ustawiamy od razu
    // (odroczone mogłoby nadpisać to, co użytkownik zdążył zaznaczyć w międzyczasie)
    textarea.setSelectionRange(from, to);
    return;
  }
  // przeglądarka bez execCommand: zmiana przez React, zaznaczenie po odświeżeniu pola
  onChange(value.slice(0, start) + text + value.slice(end));
  requestAnimationFrame(() => {
    textarea.focus();
    textarea.setSelectionRange(from, to);
  });
}

// Otacza zaznaczenie znacznikami, np. **pogrubienie**
function wrap(textarea, onChange, before, after, placeholder) {
  const selected = textarea.value.slice(textarea.selectionStart, textarea.selectionEnd) || placeholder;
  replaceSelection(textarea, before + selected + after, onChange, before.length, before.length + selected.length);
}

// Dodaje przedrostek na początku każdej zaznaczonej linii, np. "- " albo "## "
function prefixLines(textarea, onChange, prefix) {
  const { value } = textarea;
  const lineStart = value.lastIndexOf("\n", textarea.selectionStart - 1) + 1;
  let lineEnd = value.indexOf("\n", textarea.selectionEnd);
  if (lineEnd === -1) lineEnd = value.length;
  textarea.setSelectionRange(lineStart, lineEnd);
  const lines = value.slice(lineStart, lineEnd).split("\n");
  const text = lines
    .map((line, i) => (typeof prefix === "function" ? prefix(i) : prefix) + line.replace(/^(#{1,6} |> |- |\d+\. )/, ""))
    .join("\n");
  replaceSelection(textarea, text, onChange);
}

// Wstawia blok w osobnych liniach (z pustą linią przed i po)
function insertBlock(textarea, onChange, block, selectFrom, selectTo) {
  const before = textarea.value.slice(0, textarea.selectionStart);
  const pre = before === "" || before.endsWith("\n\n") ? "" : before.endsWith("\n") ? "\n" : "\n\n";
  const text = pre + block + "\n";
  replaceSelection(textarea, text, onChange, pre.length + (selectFrom ?? block.length), pre.length + (selectTo ?? selectFrom ?? block.length));
}

const TOOLS = [
  { label: "H2", title: "Nagłówek", run: (t, c) => prefixLines(t, c, "## ") },
  { label: "H3", title: "Podtytuł", run: (t, c) => prefixLines(t, c, "### ") },
  { label: "B", title: "Pogrubienie (Ctrl+B)", className: "mzi-md-tool-bold", run: (t, c) => wrap(t, c, "**", "**", "pogrubiony tekst") },
  { label: "I", title: "Kursywa (Ctrl+I)", className: "mzi-md-tool-italic", run: (t, c) => wrap(t, c, "*", "*", "kursywa") },
  { label: "S", title: "Przekreślenie", className: "mzi-md-tool-strike", run: (t, c) => wrap(t, c, "~~", "~~", "przekreślone") },
  { sep: true },
  { label: "🔗", title: "Link (Ctrl+K)", run: (t, c) => linkTool(t, c) },
  { label: "🖼", title: "Obrazek", run: (t, c) => wrap(t, c, "![", "](https://)", "opis obrazka") },
  { sep: true },
  { label: "•", title: "Lista punktowana", run: (t, c) => prefixLines(t, c, "- ") },
  { label: "1.", title: "Lista numerowana", run: (t, c) => prefixLines(t, c, (i) => `${i + 1}. `) },
  { label: "❝", title: "Cytat", run: (t, c) => prefixLines(t, c, "> ") },
  { sep: true },
  { label: "</>", title: "Kod w linii", run: (t, c) => wrap(t, c, "`", "`", "kod") },
  {
    label: "{ }",
    title: "Blok kodu",
    run: (t, c) => {
      const selected = t.value.slice(t.selectionStart, t.selectionEnd);
      const body = selected || "print(\"Hello\")";
      insertBlock(t, c, "```python\n" + body + "\n```", 3, 9); // zaznacza „python” — łatwo zmienić język
    },
  },
  {
    label: "▦",
    title: "Tabela",
    run: (t, c) => insertBlock(t, c, "| Kolumna 1 | Kolumna 2 |\n|---|---|\n| wartość | wartość |", 2, 11),
  },
  { label: "—", title: "Linia pozioma", run: (t, c) => insertBlock(t, c, "---") },
];

function linkTool(textarea, onChange) {
  const selected = textarea.value.slice(textarea.selectionStart, textarea.selectionEnd) || "tekst linku";
  const text = `[${selected}](https://)`;
  // zaznacz „https://”, żeby od razu wkleić adres
  replaceSelection(textarea, text, onChange, selected.length + 3, selected.length + 11);
}

function MarkdownEditor({ id, value, onChange, onSave }) {
  const textareaRef = useRef(null);
  const [view, setView] = useState(() => {
    try {
      return localStorage.getItem(VIEW_KEY) || "split";
    } catch {
      return "split";
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem(VIEW_KEY, view);
    } catch {
      // brak dostępu do localStorage — trudno
    }
  }, [view]);

  const runTool = (tool) => {
    if (view === "preview") setView("split");
    const t = textareaRef.current;
    if (t) tool.run(t, onChange);
  };

  const handleKeyDown = (e) => {
    const t = e.target;
    const mod = e.ctrlKey || e.metaKey;
    if (mod && e.key.toLowerCase() === "b") {
      e.preventDefault();
      wrap(t, onChange, "**", "**", "pogrubiony tekst");
    } else if (mod && e.key.toLowerCase() === "i") {
      e.preventDefault();
      wrap(t, onChange, "*", "*", "kursywa");
    } else if (mod && e.key.toLowerCase() === "k") {
      e.preventDefault();
      linkTool(t, onChange);
    } else if (mod && e.key.toLowerCase() === "s") {
      e.preventDefault();
      onSave?.();
    } else if (e.key === "Tab" && !e.shiftKey && !mod) {
      // Tab = 4 spacje (wcięcia w kodzie i zagnieżdżone listy)
      e.preventDefault();
      replaceSelection(t, "    ", onChange);
    }
  };

  const words = value.trim() ? value.trim().split(/\s+/).length : 0;

  return (
    <div className={`mzi-md-editor mzi-md-editor-${view}`}>
      <div className="mzi-md-toolbar" role="toolbar" aria-label="Formatowanie">
        <div className="mzi-md-tools">
          {TOOLS.map((tool, i) =>
            tool.sep ? (
              <span key={i} className="mzi-md-sep" aria-hidden="true" />
            ) : (
              <button
                key={i}
                type="button"
                className={`mzi-md-tool ${tool.className ?? ""}`}
                title={tool.title}
                aria-label={tool.title}
                onMouseDown={(e) => e.preventDefault()} // nie zabieraj zaznaczenia z pola tekstowego
                onClick={() => runTool(tool)}
              >
                {tool.label}
              </button>
            )
          )}
        </div>
        <div className="mzi-md-views" role="tablist" aria-label="Widok">
          {[
            ["edit", "Edycja"],
            ["split", "Obok siebie"],
            ["preview", "Podgląd"],
          ].map(([key, label]) => (
            <button
              key={key}
              type="button"
              role="tab"
              aria-selected={view === key}
              className={`mzi-md-view ${view === key ? "active" : ""}`}
              onClick={() => setView(key)}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      <div className="mzi-md-panes">
        <textarea
          id={id}
          ref={textareaRef}
          className="mzi-md-input"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={handleKeyDown}
          spellCheck
          placeholder={"## Nagłówek\n\nTreść artykułu w **Markdown**.\n\n- punkt listy\n- kolejny punkt\n\n```python\nprint(\"Hello\")\n```"}
        />
        <div className="mzi-md-preview" aria-label="Podgląd">
          {value.trim() ? <Markdown>{value}</Markdown> : <p className="mzi-md-empty">Tu pojawi się podgląd artykułu.</p>}
        </div>
      </div>

      <div className="mzi-md-status">
        <span>{words} słów · {value.length} znaków</span>
        <span className="mzi-md-hint">Ctrl+B pogrubienie · Ctrl+I kursywa · Ctrl+K link · Ctrl+S zapis · Tab wcięcie</span>
      </div>
    </div>
  );
}

export default MarkdownEditor;
