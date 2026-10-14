import { useState } from "react";
import {
  Building2,
  DoorOpen,
  MapPin,
  ExternalLink,
  Check,
  Copy,
  Receipt,
  BarChart3,
  Tag,
  ArrowRight,
  Clock,
  Sparkles,
} from "lucide-react";

/**
 * Status color mappings for badges
 */
const STATUS_CONFIG = {
  ACTIVE: {
    label: "ACTIVE",
    badge: "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800",
    dot: "bg-emerald-500",
  },
  AVAILABLE: {
    label: "AVAILABLE",
    badge: "bg-teal-50 text-teal-700 border-teal-200 dark:bg-teal-950/40 dark:text-teal-300 dark:border-teal-800",
    dot: "bg-teal-500",
  },
  OCCUPIED: {
    label: "OCCUPIED",
    badge: "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/40 dark:text-blue-300 dark:border-blue-800",
    dot: "bg-blue-500",
  },
  PAID: {
    label: "PAID",
    badge: "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800",
    dot: "bg-emerald-500",
  },
  PENDING: {
    label: "PENDING",
    badge: "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800",
    dot: "bg-amber-500",
  },
  OVERDUE: {
    label: "OVERDUE",
    badge: "bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/40 dark:text-rose-300 dark:border-rose-800",
    dot: "bg-rose-500",
  },
  MAINTENANCE: {
    label: "MAINTENANCE",
    badge: "bg-orange-50 text-orange-700 border-orange-200 dark:bg-orange-950/40 dark:text-orange-300 dark:border-orange-800",
    dot: "bg-orange-500",
  },
  INACTIVE: {
    label: "INACTIVE",
    badge: "bg-slate-100 text-slate-700 border-slate-200 dark:bg-gray-800 dark:text-slate-300 dark:border-gray-700",
    dot: "bg-slate-400",
  },
};

/**
 * Render inline markdown styles: bold, italic, inline code, links, status tags
 */
function renderInlineMarkdown(text) {
  if (!text) return null;

  // Split into tokens: links, code, bold, italic
  const parts = [];
  let keyIdx = 0;

  // Pattern matches:
  // 1) Markdown link: [label](url)
  // 2) Inline code: `code`
  // 3) Bold: **bold** or __bold__
  // 4) Italic: *italic* or _italic_
  const tokenRegex = /(\[([^\]]+)\]\(([^)]+)\)|`([^`]+)`|\*\*([^*]+)\*\*|__([^_]+)__|(?<!\*)\*([^*]+)\*(?!\*)|(?<!_)_([^_]+)_(?!_))/g;

  let lastIndex = 0;
  let match;

  while ((match = tokenRegex.exec(text)) !== null) {
    // Plain text before token
    if (match.index > lastIndex) {
      parts.push(
        <span key={`txt-${keyIdx++}`}>
          {renderStatusWords(text.substring(lastIndex, match.index))}
        </span>
      );
    }

    const fullMatch = match[0];

    if (fullMatch.startsWith("[")) {
      // Link [label](url)
      const label = match[2];
      let url = match[3];
      const isHttp = /^https?:\/\//i.test(url);
      const safeUrl = isHttp
        ? url
        : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(label)}`;

      parts.push(
        <a
          key={`link-${keyIdx++}`}
          href={safeUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1 font-medium text-primary hover:text-primary-focus hover:underline"
        >
          {label}
          <ExternalLink className="h-3 w-3 inline shrink-0 opacity-70" />
        </a>
      );
    } else if (fullMatch.startsWith("`")) {
      // Code `...`
      const code = match[4];
      parts.push(
        <code
          key={`code-${keyIdx++}`}
          className="rounded bg-slate-100 px-1.5 py-0.5 font-mono text-[12px] font-medium text-slate-800 dark:bg-gray-800 dark:text-slate-200 border border-slate-200/60 dark:border-gray-700/60"
        >
          {code}
        </code>
      );
    } else if (fullMatch.startsWith("**") || fullMatch.startsWith("__")) {
      // Bold
      const boldText = match[5] || match[6];
      parts.push(
        <strong key={`b-${keyIdx++}`} className="font-semibold text-slate-900 dark:text-white">
          {renderStatusWords(boldText)}
        </strong>
      );
    } else if (fullMatch.startsWith("*") || fullMatch.startsWith("_")) {
      // Italic
      const italicText = match[7] || match[8];
      parts.push(
        <em key={`em-${keyIdx++}`} className="italic text-slate-700 dark:text-slate-300">
          {italicText}
        </em>
      );
    }

    lastIndex = match.index + fullMatch.length;
  }

  // Remainder
  if (lastIndex < text.length) {
    parts.push(
      <span key={`txt-end-${keyIdx}`}>
        {renderStatusWords(text.substring(lastIndex))}
      </span>
    );
  }

  return parts;
}

/**
 * Highlight known status words (e.g. ACTIVE, PAID) as badges when standalone
 */
function renderStatusWords(str) {
  if (!str) return null;
  const statusRegex = /\b(ACTIVE|AVAILABLE|OCCUPIED|PAID|PENDING|OVERDUE|MAINTENANCE|INACTIVE)\b/g;
  const elements = [];
  let lastIdx = 0;
  let match;

  while ((match = statusRegex.exec(str)) !== null) {
    if (match.index > lastIdx) {
      elements.push(str.substring(lastIdx, match.index));
    }
    const statusWord = match[1];
    const config = STATUS_CONFIG[statusWord] || STATUS_CONFIG.ACTIVE;
    elements.push(
      <span
        key={`badge-${match.index}`}
        className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-semibold border ${config.badge} align-middle mx-1`}
      >
        <span className={`h-1.5 w-1.5 rounded-full ${config.dot}`} />
        {statusWord}
      </span>
    );
    lastIdx = match.index + statusWord.length;
  }

  if (lastIdx < str.length) {
    elements.push(str.substring(lastIdx));
  }

  return elements.length === 1 && typeof elements[0] === "string" ? elements[0] : elements;
}

/**
 * Interactive Property Card for rental properties returned by the assistant
 */
export function PropertyCard({ property, onAction }) {
  const {
    title,
    id,
    code,
    address,
    mapsUrl,
    status = "ACTIVE",
    totalRooms,
    availableRooms,
    created,
    updated,
  } = property;

  const total = totalRooms !== undefined ? Number(totalRooms) : null;
  const avail = availableRooms !== undefined ? Number(availableRooms) : null;
  const occupied = total !== null && avail !== null ? Math.max(0, total - avail) : null;
  const occupancyPct = total && total > 0 && occupied !== null ? Math.round((occupied / total) * 100) : null;

  const statusConfig = STATUS_CONFIG[status?.toUpperCase()] || STATUS_CONFIG.ACTIVE;

  // Clean map URL
  const mapLink =
    mapsUrl && mapsUrl.startsWith("http")
      ? mapsUrl
      : address
      ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`
      : null;

  return (
    <div className="my-3 overflow-hidden rounded-2xl border border-slate-200/90 bg-white shadow-sm transition-all hover:shadow-md dark:border-gray-700/80 dark:bg-gray-800/90">
      {/* Header Banner */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 bg-gradient-to-r from-slate-50 via-white to-slate-50/50 px-4 py-3.5 dark:border-gray-700/50 dark:from-gray-800 dark:via-gray-800/80 dark:to-gray-800">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary dark:bg-primary/20">
            <Building2 className="h-5 w-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-[15px] font-bold text-slate-900 dark:text-white">
                {title}
              </h3>
              {id && (
                <span className="rounded-md bg-slate-100 px-1.5 py-0.5 text-[11px] font-medium text-slate-500 dark:bg-gray-700 dark:text-slate-300">
                  #{id}
                </span>
              )}
            </div>
            {code && (
              <p className="flex items-center gap-1 text-[11.5px] font-medium text-slate-400 dark:text-slate-400">
                <Tag className="h-3 w-3" />
                <span>Code:</span>
                <span className="font-mono text-slate-700 dark:text-slate-200">{code}</span>
              </p>
            )}
          </div>
        </div>

        {/* Status Badge */}
        <div className="flex items-center gap-2">
          <span
            className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11.5px] font-semibold tracking-wide ${statusConfig.badge}`}
          >
            <span className={`h-2 w-2 rounded-full ${statusConfig.dot} animate-pulse`} />
            {status}
          </span>
        </div>
      </div>

      {/* Body Content */}
      <div className="p-4 space-y-3.5">
        {/* Address & Google Maps */}
        {address && (
          <div className="flex items-start justify-between gap-3 rounded-xl bg-slate-50/70 p-3 text-[13px] dark:bg-gray-800/50">
            <div className="flex items-start gap-2 text-slate-600 dark:text-slate-300">
              <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-slate-400 dark:text-slate-500" />
              <span className="leading-snug">{address}</span>
            </div>
            {mapLink && (
              <a
                href={mapLink}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex shrink-0 items-center gap-1 rounded-lg border border-slate-200 bg-white px-2.5 py-1 text-[11.5px] font-medium text-slate-700 shadow-2xs transition-colors hover:border-slate-300 hover:bg-slate-50 hover:text-primary dark:border-gray-700 dark:bg-gray-700 dark:text-slate-200 dark:hover:bg-gray-600"
              >
                <span>Maps</span>
                <ExternalLink className="h-3 w-3" />
              </a>
            )}
          </div>
        )}

        {/* Room Metrics & Occupancy Bar */}
        {total !== null && (
          <div className="rounded-xl border border-slate-100 bg-white p-3 dark:border-gray-700/60 dark:bg-gray-800/60">
            <div className="flex items-center justify-between text-[12px] font-medium text-slate-600 dark:text-slate-300">
              <span className="flex items-center gap-1.5">
                <DoorOpen className="h-4 w-4 text-slate-400" />
                <span>Room Occupancy</span>
              </span>
              <span className="font-semibold text-slate-900 dark:text-white">
                {occupancyPct !== null ? `${occupancyPct}%` : "—"}
              </span>
            </div>

            {/* Visual Progress Bar */}
            <div className="mt-2 h-2.5 w-full overflow-hidden rounded-full bg-slate-100 dark:bg-gray-700">
              <div
                className="h-full rounded-full bg-gradient-to-r from-primary to-blue-500 transition-all duration-500"
                style={{ width: `${occupancyPct || 0}%` }}
              />
            </div>

            {/* Micro stats pills */}
            <div className="mt-2.5 grid grid-cols-3 gap-2 text-center text-[11px]">
              <div className="rounded-lg bg-slate-50 py-1.5 dark:bg-gray-800">
                <p className="text-slate-400 dark:text-slate-500">Total</p>
                <p className="text-[13px] font-bold text-slate-800 dark:text-slate-100">{total}</p>
              </div>
              <div className="rounded-lg bg-blue-50/60 py-1.5 text-blue-700 dark:bg-blue-950/30 dark:text-blue-300">
                <p className="text-blue-500/80 dark:text-blue-400">Occupied</p>
                <p className="text-[13px] font-bold">{occupied ?? "—"}</p>
              </div>
              <div className="rounded-lg bg-emerald-50/60 py-1.5 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-300">
                <p className="text-emerald-500/80 dark:text-emerald-400">Available</p>
                <p className="text-[13px] font-bold">{avail ?? "—"}</p>
              </div>
            </div>
          </div>
        )}

        {/* Timestamps */}
        {(created || updated) && (
          <div className="flex flex-wrap items-center justify-between gap-2 border-t border-slate-100 pt-2.5 text-[11px] text-slate-400 dark:border-gray-700/60 dark:text-slate-500">
            {created && (
              <span className="flex items-center gap-1">
                <Clock className="h-3 w-3" />
                Created: {created}
              </span>
            )}
            {updated && <span>Updated: {updated}</span>}
          </div>
        )}

        {/* Quick Action Buttons */}
        {onAction && (
          <div className="flex flex-wrap gap-2 pt-1 border-t border-slate-100 dark:border-gray-700/60">
            <button
              type="button"
              onClick={() => onAction(`Show rooms in ${title}`)}
              className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-[12px] font-medium text-slate-700 transition-colors hover:border-primary/40 hover:bg-primary/5 hover:text-primary dark:border-gray-700 dark:bg-gray-700/60 dark:text-slate-200 dark:hover:bg-gray-700"
            >
              <DoorOpen className="h-3.5 w-3.5 text-primary" />
              <span>Room Breakdown</span>
            </button>
            <button
              type="button"
              onClick={() => onAction(`Show invoices for ${title}`)}
              className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-[12px] font-medium text-slate-700 transition-colors hover:border-primary/40 hover:bg-primary/5 hover:text-primary dark:border-gray-700 dark:bg-gray-700/60 dark:text-slate-200 dark:hover:bg-gray-700"
            >
              <Receipt className="h-3.5 w-3.5 text-blue-500" />
              <span>Invoices</span>
            </button>
            <button
              type="button"
              onClick={() => onAction(`Show monthly report for ${title}`)}
              className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-[12px] font-medium text-slate-700 transition-colors hover:border-primary/40 hover:bg-primary/5 hover:text-primary dark:border-gray-700 dark:bg-gray-700/60 dark:text-slate-200 dark:hover:bg-gray-700"
            >
              <BarChart3 className="h-3.5 w-3.5 text-emerald-500" />
              <span>Reports</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

/**
 * Parse structured assistant reply containing property sections, markdown, and follow-ups
 */
export function RichAssistantResponse({ content, streaming, onAction }) {
  const [copied, setCopied] = useState(false);

  if (!content) return null;

  const handleCopy = () => {
    navigator.clipboard?.writeText(content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Extract structured elements
  const lines = content.split("\n");
  const renderedElements = [];
  let currentKeyValues = [];
  let currentList = [];
  let currentProperty = null;
  let elementIndex = 0;

  const flushKeyValues = () => {
    if (currentKeyValues.length > 0) {
      renderedElements.push(
        <div
          key={`kv-${elementIndex++}`}
          className="my-2 grid grid-cols-1 gap-1.5 rounded-xl border border-slate-200/70 bg-slate-50/60 p-3 sm:grid-cols-2 dark:border-gray-700/60 dark:bg-gray-800/40"
        >
          {currentKeyValues.map((kv, i) => (
            <div key={i} className="flex items-baseline justify-between gap-2 text-[12.5px]">
              <span className="font-semibold text-slate-600 dark:text-slate-400">
                {kv.key}:
              </span>
              <span className="text-right text-slate-800 dark:text-slate-200">
                {renderInlineMarkdown(kv.value)}
              </span>
            </div>
          ))}
        </div>
      );
      currentKeyValues = [];
    }
  };

  const flushList = () => {
    if (currentList.length > 0) {
      renderedElements.push(
        <ul key={`ul-${elementIndex++}`} className="my-2 space-y-1 pl-1">
          {currentList.map((item, idx) => (
            <li key={idx} className="flex items-start gap-2 text-[13.5px] leading-relaxed text-slate-700 dark:text-slate-300">
              <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-primary/70" />
              <span>{renderInlineMarkdown(item)}</span>
            </li>
          ))}
        </ul>
      );
      currentList = [];
    }
  };

  const flushProperty = () => {
    if (currentProperty) {
      renderedElements.push(
        <PropertyCard
          key={`prop-${elementIndex++}`}
          property={currentProperty}
          onAction={onAction}
        />
      );
      currentProperty = null;
    }
  };

  for (let i = 0; i < lines.length; i++) {
    const rawLine = lines[i];
    const trimmed = rawLine.trim();

    if (!trimmed) {
      flushKeyValues();
      flushList();
      flushProperty();
      continue;
    }

    // Check for property heading: ## **Title** (ID: 123) or ## Title (ID: 123)
    const propertyHeadingMatch = trimmed.match(/^##\s+(?:\*\*)?([^*()]+)(?:\*\*)?\s*(?:\(ID:\s*(\w+)\))?/i);
    if (propertyHeadingMatch && (trimmed.toLowerCase().includes("id:") || lines.slice(i + 1, i + 8).some(l => l.includes("**Code:**") || l.includes("**Address:**")))) {
      flushKeyValues();
      flushList();
      flushProperty();

      const title = propertyHeadingMatch[1].trim();
      const id = propertyHeadingMatch[2] ? propertyHeadingMatch[2].trim() : null;

      currentProperty = {
        title,
        id,
      };
      continue;
    }

    // If currently parsing a property card, capture property fields
    if (currentProperty) {
      const kvMatch = trimmed.match(/^\*\*([^*:]+):\*\*\s*(.*)$/);
      if (kvMatch) {
        const key = kvMatch[1].trim();
        const value = kvMatch[2].trim();
        const keyLower = key.toLowerCase();

        if (keyLower === "code") currentProperty.code = value;
        else if (keyLower === "address") currentProperty.address = value;
        else if (keyLower.includes("maps")) currentProperty.mapsUrl = value.replace(/^\[([^\]]+)\]\(([^)]+)\)$/, "$2");
        else if (keyLower === "status") currentProperty.status = value;
        else if (keyLower.includes("total rooms")) currentProperty.totalRooms = value;
        else if (keyLower.includes("available rooms")) currentProperty.availableRooms = value;
        else if (keyLower.includes("created")) currentProperty.created = value;
        else if (keyLower.includes("updated")) currentProperty.updated = value;
        else {
          currentProperty[key] = value;
        }
        continue;
      } else {
        // Line does not match property field -> flush property card and continue parsing
        flushProperty();
      }
    }

    // Check for standard markdown headers
    if (trimmed.startsWith("### ")) {
      flushKeyValues();
      flushList();
      flushProperty();
      renderedElements.push(
        <h4 key={`h3-${elementIndex++}`} className="mt-3 mb-1 text-[14px] font-bold text-slate-800 dark:text-white">
          {renderInlineMarkdown(trimmed.replace(/^###\s+/, ""))}
        </h4>
      );
      continue;
    }

    if (trimmed.startsWith("## ")) {
      flushKeyValues();
      flushList();
      flushProperty();
      renderedElements.push(
        <h3 key={`h2-${elementIndex++}`} className="mt-3.5 mb-1.5 text-[15px] font-bold text-slate-900 dark:text-white">
          {renderInlineMarkdown(trimmed.replace(/^##\s+/, ""))}
        </h3>
      );
      continue;
    }

    if (trimmed.startsWith("# ")) {
      flushKeyValues();
      flushList();
      flushProperty();
      renderedElements.push(
        <h2 key={`h1-${elementIndex++}`} className="mt-4 mb-2 text-[16px] font-extrabold text-slate-900 dark:text-white">
          {renderInlineMarkdown(trimmed.replace(/^#\s+/, ""))}
        </h2>
      );
      continue;
    }

    // Check for lists
    if (trimmed.startsWith("- ") || trimmed.startsWith("* ")) {
      flushKeyValues();
      flushProperty();
      currentList.push(trimmed.slice(2));
      continue;
    }

    if (/^\d+\.\s/.test(trimmed)) {
      flushKeyValues();
      flushProperty();
      currentList.push(trimmed.replace(/^\d+\.\s/, ""));
      continue;
    }

    // Check for standalone key-value line
    const kvMatch = trimmed.match(/^\*\*([^*:]+):\*\*\s*(.*)$/);
    if (kvMatch) {
      flushList();
      flushProperty();
      currentKeyValues.push({
        key: kvMatch[1].trim(),
        value: kvMatch[2].trim(),
      });
      continue;
    }

    // Regular paragraph
    flushKeyValues();
    flushList();
    flushProperty();

    // Check if paragraph is a question / suggestion like: "Would you like to see more details..."
    const isFollowupPrompt =
      trimmed.startsWith("Would you like") ||
      trimmed.startsWith("Do you want") ||
      trimmed.startsWith("Should I") ||
      trimmed.includes("Would you like to see");

    renderedElements.push(
      <p
        key={`p-${elementIndex++}`}
        className={`text-[13.5px] leading-relaxed text-slate-700 dark:text-slate-300 ${
          isFollowupPrompt
            ? "mt-2.5 rounded-xl border border-primary/20 bg-primary/5 p-3 text-primary-dark font-medium dark:bg-primary/10 dark:text-primary-light"
            : ""
        }`}
      >
        {renderInlineMarkdown(trimmed)}
      </p>
    );
  }

  // Final flushes
  flushKeyValues();
  flushList();
  flushProperty();

  // Extract contextual follow-up suggestions from questions in the text
  const extractedSuggestions = [];
  const lower = content.toLowerCase();
  if (lower.includes("room breakdown") || lower.includes("rooms")) {
    extractedSuggestions.push("Show room breakdowns");
  }
  if (lower.includes("financial") || lower.includes("financial summaries") || lower.includes("invoice")) {
    extractedSuggestions.push("Show financial summary");
  }
  if (lower.includes("reports") || lower.includes("monthly report")) {
    extractedSuggestions.push("Show monthly report");
  }
  if (lower.includes("vacant")) {
    extractedSuggestions.push("Show vacant rooms");
  }

  return (
    <div className="group relative space-y-1">
      {/* Top / Copy Action */}
      {!streaming && (
        <div className="absolute -top-2 right-0 opacity-0 transition-opacity group-hover:opacity-100">
          <button
            type="button"
            onClick={handleCopy}
            title={copied ? "Copied!" : "Copy response"}
            className="flex items-center gap-1 rounded-md border border-slate-200 bg-white px-2 py-1 text-[11px] font-medium text-slate-600 shadow-2xs hover:bg-slate-50 dark:border-gray-700 dark:bg-gray-800 dark:text-slate-300"
          >
            {copied ? (
              <>
                <Check className="h-3 w-3 text-emerald-500" />
                <span className="text-emerald-600 dark:text-emerald-400">Copied</span>
              </>
            ) : (
              <>
                <Copy className="h-3 w-3 text-slate-400" />
                <span>Copy</span>
              </>
            )}
          </button>
        </div>
      )}

      {/* Main Elements */}
      <div className="space-y-1.5">{renderedElements}</div>

      {/* Streaming cursor */}
      {streaming && (
        <span
          className="inline-block h-3.5 w-1 rounded-xs bg-primary align-middle ml-1 animate-pulse"
          aria-hidden="true"
        />
      )}

      {/* Suggested Follow-up Actions */}
      {!streaming && onAction && extractedSuggestions.length > 0 && (
        <div className="mt-3.5 pt-2 border-t border-slate-100 dark:border-gray-700/60">
          <p className="flex items-center gap-1 text-[11px] font-semibold text-slate-400 dark:text-slate-500 mb-1.5">
            <Sparkles className="h-3 w-3 text-primary" />
            <span>Suggested follow-ups:</span>
          </p>
          <div className="flex flex-wrap gap-1.5">
            {extractedSuggestions.map((s, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => onAction(s)}
                className="inline-flex items-center gap-1 rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1 text-[11.5px] font-medium text-slate-700 transition-colors hover:border-primary hover:bg-primary/5 hover:text-primary dark:border-gray-700 dark:bg-gray-800 dark:text-slate-300 dark:hover:border-primary-light"
              >
                <span>{s}</span>
                <ArrowRight className="h-2.5 w-2.5 opacity-60" />
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default RichAssistantResponse;
