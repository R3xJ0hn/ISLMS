import { useState, useEffect, useRef, useMemo } from "react";

interface NoteItem {
  Label: string;
  Data: string[];
}

export default function NotesSection({ notesData }: { notesData: string }) {
  const [visibleLabels, setVisibleLabels] = useState<string[]>([]);
  const containerRef = useRef<HTMLDivElement>(null);

  // Helper: safely parse incoming JSON-like string
  const parseNotes = (noteString: string) => {
    if (!noteString) return [];
    try {
      const jsonString = noteString
        .trim()
        .replace(/'/g, '"')
        .replace(/,\s*]/g, "]")
        .replace(/([A-Za-z0-9\s.+#-]+):/g, '"$1":');
      return JSON.parse(jsonString);
    } catch (e) {
      return [];
    }
  };

  const cleanKeys = (data: any[]) =>
    data.map((item) => {
      const cleaned: Record<string, any> = {};
      Object.keys(item).forEach((key) => {
        cleaned[key.trim()] = item[key];
      });
      return cleaned;
    });

  // Convert `notesData` to structured JSON if needed
  const structuredNotes = useMemo(() => {
    if (typeof notesData === "string") return cleanKeys(parseNotes(notesData));
    return notesData;
  }, [notesData]);

  const isStructuredData =
    Array.isArray(structuredNotes) &&
    structuredNotes.length > 0 &&
    structuredNotes.every(
      (item) =>
        typeof item.Label === "string" && Array.isArray(item.Data)
    );

  useEffect(() => {
    if (!isStructuredData) return;

    const container = containerRef.current;
    if (!container) return;

    const sections = container.querySelectorAll("[data-label]");
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const label = entry.target.getAttribute("data-label")!;
          if (entry.isIntersecting) {
            setVisibleLabels((prev) => [...new Set([...prev, label])]);
          } else if (entry.boundingClientRect.top > 0) {
            setVisibleLabels((prev) => prev.filter((l) => l !== label));
          }
        });
      },
      { root: container, threshold: 0.4 }
    );

    sections.forEach((s) => observer.observe(s));
    return () => observer.disconnect();
  }, [isStructuredData, structuredNotes]);

  const isVisible = (label: string) => visibleLabels.includes(label);

  const colorMap: Record<string, string> = {
    PRELIM: "from-indigo-100 to-violet-100",
    MIDTERM: "from-rose-100 to-pink-100",
    "PRE-FINALS": "from-emerald-100 to-teal-100",
    FINALS: "from-sky-100 to-blue-100",
  };

  // Section renderer
  const renderSection = (label: string, notes: string[], gradient: string) => (
    <div
      className={`relative bg-gradient-to-r ${gradient} rounded-xl`}
      data-label={label}
      key={label}
    >
      <div
        className={`sticky top-0 z-20 bg-gradient-to-r ${gradient} shadow-sm px-1 py-1 transition-all duration-700 ${
          isVisible(label)
            ? "opacity-100 translate-y-0"
            : "opacity-0 -translate-y-1"
        }`}
      >
        <span
          className={`font-semibold tracking-wide transition-all duration-300 ${
            isVisible(label)
              ? "text-slate-800 drop-shadow-sm "
              : "text-slate-500"
          }`}
        >
          {label}
        </span>
      </div>

      <div className="flex flex-wrap gap-2 mt-3 mb-6 px-2 pb-2">
        {notes.map((text, i) => (
          <span
            key={i}
            className={`text-sm text-slate-700 bg-gradient-to-r ${gradient} rounded-sm px-3 py-1 shadow-sm hover:shadow-lg hover:scale-105 transition-all duration-300`}
          >
            {text}
          </span>
        ))}
      </div>
    </div>
  );

  const nonEmptyNotes = isStructuredData
    ? structuredNotes.filter((item) => (item as NoteItem).Data?.length > 0)
    : [];

  return (
    <div className="max-h-80 border rounded-2xl border-slate-200 p-4 bg-gradient-to-br from-slate-50 to-white shadow-md flex flex-col">
      <h2 className="text-lg font-semibold text-slate-800 mb-3 border-b border-slate-200 pb-2">
        🗒️ Notes
      </h2>

      {isStructuredData ? (
        <div
          ref={containerRef}
          className="overflow-y-auto max-h-30 pr-2 space-y-6 notes-scrollbar scroll-smooth"
        >
          {nonEmptyNotes.length > 0 ? (
            <>
              <h4 className="border-b border-slate-200">
                Incomplete Submissions
              </h4>
              {nonEmptyNotes.map((item) =>
                renderSection(
                  (item as NoteItem).Label,
                  (item as NoteItem).Data,
                  colorMap[(item as NoteItem).Label] ||
                    "from-slate-100 to-slate-200"
                )
              )}
            </>
          ) : (
            <p className="text-sm text-slate-500 italic px-2 py-1">
              No notes available.
            </p>
          )}
        </div>
      ) : (
        <div className="overflow-y-auto max-h-30 notes-scrollbar scroll-smooth text-slate-700 text-sm bg-slate-100 px-4 py-3">
          {String(notesData || "No notes available.")}
        </div>
      )}
    </div>
  );
}
