import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import "./Markdown.css";

// Wyświetlanie treści Markdown (artykuły i podgląd w edytorze).
// react-markdown nie wykonuje surowego HTML i blokuje linki javascript: — treść jest bezpieczna.
// remark-gfm: tabele, przekreślenia, listy zadań, automatyczne linki.

const isExternal = (href = "") => /^https?:\/\//i.test(href);

const components = {
  a: ({ href, children, node, ...props }) =>
    isExternal(href) ? (
      <a href={href} target="_blank" rel="noopener noreferrer" {...props}>
        {children}
      </a>
    ) : (
      <a href={href} {...props}>
        {children}
      </a>
    ),
  img: ({ node, alt, ...props }) => <img alt={alt ?? ""} loading="lazy" {...props} />,
  // szerokie tabele przewijają się w poziomie zamiast rozpychać stronę
  table: ({ node, ...props }) => (
    <div className="mzi-md-table-wrap">
      <table {...props} />
    </div>
  ),
};

function Markdown({ children }) {
  return (
    <div className="mzi-md">
      <ReactMarkdown remarkPlugins={[remarkGfm]} components={components}>
        {children ?? ""}
      </ReactMarkdown>
    </div>
  );
}

export default Markdown;
