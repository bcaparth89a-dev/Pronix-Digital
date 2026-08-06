import { useRef, useState } from "react";
import { cn } from "@/lib/utils";

function renderMarkdown(md) {
  if (!md) return "";

  let html = md
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");

  // Code blocks (must be before inline code)
  html = html.replace(/```[\w]*\n?([\s\S]*?)```/g, (_, code) => {
    return `<pre class="bg-muted rounded-md p-3 my-3 overflow-x-auto text-xs font-mono"><code>${code.trim()}</code></pre>`;
  });

  // Headings
  html = html.replace(/^### (.+)$/gm, '<h3 class="text-base font-semibold mt-4 mb-1">$1</h3>');
  html = html.replace(/^## (.+)$/gm, '<h2 class="text-lg font-semibold mt-5 mb-2">$1</h2>');
  html = html.replace(/^# (.+)$/gm, '<h1 class="text-xl font-bold mt-6 mb-3">$1</h1>');

  // Bold and italic
  html = html.replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>");
  html = html.replace(/\*(.+?)\*/g, "<em>$1</em>");

  // Inline code
  html = html.replace(/`(.+?)`/g, '<code class="bg-muted rounded px-1 py-0.5 text-xs font-mono">$1</code>');

  // Unordered lists (group consecutive - lines)
  html = html.replace(/(^- .+$(\n^- .+$)*)/gm, (block) => {
    const items = block.split("\n").map((line) => `<li class="ml-5 list-disc">${line.slice(2)}</li>`).join("");
    return `<ul class="my-2 space-y-0.5">${items}</ul>`;
  });

  // Paragraphs
  html = html.split(/\n\n+/).map((block) => {
    if (block.startsWith("<h") || block.startsWith("<ul") || block.startsWith("<pre")) return block;
    return `<p class="mb-3 leading-relaxed">${block.replace(/\n/g, "<br>")}</p>`;
  }).join("\n");

  return html;
}

const TOOLBAR = [
  { label: "B", title: "Bold", wrap: ["**", "**"] },
  { label: "I", title: "Italic", wrap: ["*", "*"] },
  { label: "`", title: "Inline code", wrap: ["`", "`"] },
  { label: "H2", title: "Heading 2", prefix: "## " },
  { label: "H3", title: "Heading 3", prefix: "### " },
  { label: "-", title: "List item", prefix: "- " },
];

function applyFormat(textarea, value, onChange, format) {
  const start = textarea.selectionStart;
  const end = textarea.selectionEnd;
  const selected = value.slice(start, end);

  let newText;
  let cursorStart;
  let cursorEnd;

  if (format.wrap) {
    const [before, after] = format.wrap;
    newText = value.slice(0, start) + before + (selected || "text") + after + value.slice(end);
    cursorStart = start + before.length;
    cursorEnd = cursorStart + (selected || "text").length;
  } else if (format.prefix) {
    const lineStart = value.lastIndexOf("\n", start - 1) + 1;
    newText = value.slice(0, lineStart) + format.prefix + value.slice(lineStart);
    cursorStart = start + format.prefix.length;
    cursorEnd = end + format.prefix.length;
  }

  onChange(newText);

  setTimeout(() => {
    textarea.focus();
    textarea.setSelectionRange(cursorStart, cursorEnd);
  }, 0);
}

export function MarkdownEditor({ value = "", onChange, rows = 14, placeholder, error }) {
  const [tab, setTab] = useState("write");
  const textareaRef = useRef(null);

  const tabBtn = (t) =>
    cn(
      "px-3 py-1.5 text-xs font-medium transition-colors",
      tab === t
        ? "bg-background text-foreground border border-b-background border-input relative -mb-px z-10"
        : "text-muted-foreground hover:text-foreground",
    );

  return (
    <div className="space-y-0">
      {/* Tab bar + toolbar */}
      <div className="flex items-center justify-between border-b border-input pb-0">
        <div className="flex">
          <button type="button" onClick={() => setTab("write")} className={tabBtn("write")}>
            Write
          </button>
          <button type="button" onClick={() => setTab("preview")} className={tabBtn("preview")}>
            Preview
          </button>
        </div>
        {tab === "write" && (
          <div className="flex items-center gap-0.5 pr-1">
            {TOOLBAR.map((fmt) => (
              <button
                key={fmt.label}
                type="button"
                title={fmt.title}
                onClick={() => textareaRef.current && applyFormat(textareaRef.current, value, onChange, fmt)}
                className="h-6 min-w-6 rounded px-1 text-xs font-mono font-semibold text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
              >
                {fmt.label}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Editor area */}
      <div className={cn("rounded-b-md border border-t-0 border-input", error && "border-destructive")}>
        {tab === "write" ? (
          <textarea
            ref={textareaRef}
            className="flex w-full rounded-b-md bg-background px-3 py-3 text-sm outline-none placeholder:text-muted-foreground resize-none font-mono leading-relaxed"
            rows={rows}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder || "Write your content in Markdown..."}
          />
        ) : (
          <div
            className="min-h-[200px] px-4 py-3 text-sm leading-relaxed"
            dangerouslySetInnerHTML={{
              __html:
                renderMarkdown(value) ||
                '<p class="text-muted-foreground italic">Nothing to preview</p>',
            }}
          />
        )}
      </div>

      {tab === "write" && !error && (
        <p className="mt-1 text-xs text-muted-foreground">
          Markdown supported - **bold** - *italic* - `code` - ## heading - - list item
        </p>
      )}
      {error && <p className="mt-1 text-xs text-destructive">{error}</p>}
    </div>
  );
}
