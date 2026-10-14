import { useState, useRef, useEffect } from "react";
import {
  Bot,
  Send,
  Trash2,
  User,
  AlertCircle,
  Loader2,
  MessageSquare,
  X,
  Maximize2,
  Sparkles,
  Building2,
  Receipt,
  BarChart3,
  DoorOpen,
} from "lucide-react";
import { useAssistant } from "../../hooks/useAssistant";
import { useMyRoles } from "../../hooks/useMyRoles";
import { RichAssistantResponse } from "./RichAssistantMessage";

const STAFF_SUGGESTIONS = [
  { label: "Show my rental properties", icon: Building2 },
  { label: "Show vacant rooms", icon: DoorOpen },
  { label: "Show overdue invoices", icon: Receipt },
  { label: "Show this month's report", icon: BarChart3 },
  { label: "Show dashboard summary", icon: Sparkles },
];

const TENANT_SUGGESTIONS = [
  { label: "Show my balance", icon: Receipt },
  { label: "Show my invoices", icon: Receipt },
  { label: "Show payment history", icon: BarChart3 },
  { label: "Show utility usage", icon: Sparkles },
  { label: "Show my profile", icon: User },
];

function formatTime(ts) {
  if (!ts) return "";
  const d = new Date(ts);
  return d.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
}

const SuggestionChip = ({ item, onClick }) => {
  const Icon = item.icon || MessageSquare;
  return (
    <button
      type="button"
      onClick={() => onClick(item.label)}
      className="group flex items-center gap-2.5 rounded-xl border border-slate-200/90 bg-white p-3 text-left transition-all hover:border-primary/40 hover:bg-primary/5 hover:shadow-2xs dark:border-gray-700/80 dark:bg-gray-800/80 dark:hover:border-primary-light/40 dark:hover:bg-primary/10"
    >
      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-slate-600 transition-colors group-hover:bg-primary/10 group-hover:text-primary dark:bg-gray-700 dark:text-slate-300">
        <Icon className="h-4 w-4" />
      </div>
      <div className="min-w-0">
        <p className="text-[13px] font-medium text-slate-700 transition-colors group-hover:text-primary dark:text-slate-200 dark:group-hover:text-primary-light">
          {item.label}
        </p>
      </div>
    </button>
  );
};

/**
 * AI Assistant chat interface. Rendered by the full assistant
 * page and by the floating bottom-right assistant widget.
 *
 * @param {boolean} autoFocus focus the input when mounted (default true)
 * @param {() => void} [onClose] when provided, a close button is rendered in the header
 * @param {() => void} [onExpand] when provided, an expand button is rendered to jump to full page
 */
export function AssistantChat({
  autoFocus = true,
  onClose,
  onExpand,
}) {
  const { messages, loading, streamingStatus, sendMessage, clearConversation } =
    useAssistant();
  const { isTenant } = useMyRoles();
  const [input, setInput] = useState("");
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);
  const textareaRef = useRef(null);

  const suggestions = isTenant ? TENANT_SUGGESTIONS : STAFF_SUGGESTIONS;

  // True when the last assistant message is still being streamed
  const isStreaming = messages.some((m) => m.role === "assistant" && m.streaming);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  useEffect(() => {
    if (autoFocus) {
      inputRef.current?.focus();
    }
  }, [autoFocus]);

  const handleSend = () => {
    if (!input.trim() || loading) return;
    sendMessage(input.trim());
    setInput("");
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleInput = (e) => {
    setInput(e.target.value);
    const el = e.target;
    el.style.height = "auto";
    el.style.height = Math.min(el.scrollHeight, 140) + "px";
  };

  const handleSuggestion = (text) => {
    sendMessage(text);
  };

  const isEmpty = messages.length === 0;

  return (
    <div className="flex h-full min-h-0 flex-col overflow-hidden rounded-2xl border border-slate-200/90 bg-white shadow-xs dark:border-gray-800 dark:bg-gray-900">
      {/* Header */}
      <div className="flex items-center justify-between gap-3 border-b border-slate-200/80 bg-white/95 px-5 py-3.5 backdrop-blur-xs dark:border-gray-800 dark:bg-gray-900/95">
        <div className="flex items-center gap-3">
          <div className="relative flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-secondary text-white shadow-xs shadow-primary/20">
            <Bot className="h-5 w-5" />
            <span className="absolute -bottom-0.5 -right-0.5 flex h-3 w-3">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex h-3 w-3 rounded-full bg-emerald-500 ring-2 ring-white dark:ring-gray-900" />
            </span>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-[15px] font-bold text-slate-800 dark:text-white">
                TeasJul AI Assistant
              </h1>
              <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[10.5px] font-semibold text-primary dark:bg-primary/20 dark:text-primary-light">
                AI Powered
              </span>
            </div>
            <p className="text-[11.5px] text-slate-500 dark:text-slate-400">
              Instant answers about houses, rooms, tenants, contracts & invoices
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          {!isEmpty && (
            <button
              type="button"
              onClick={clearConversation}
              className="inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-[12px] font-medium text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-700 dark:text-slate-400 dark:hover:bg-gray-800 dark:hover:text-slate-200"
              title="Clear conversation"
            >
              <Trash2 className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Clear Chat</span>
            </button>
          )}

          {onExpand && (
            <button
              type="button"
              onClick={onExpand}
              aria-label="Open Full Page"
              title="Open full page"
              className="rounded-lg p-2 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-gray-800 dark:hover:text-slate-300"
            >
              <Maximize2 className="h-4 w-4" />
            </button>
          )}

          {onClose && (
            <button
              type="button"
              onClick={onClose}
              aria-label="Close AI Assistant"
              title="Close"
              className="rounded-lg p-2 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-gray-800 dark:hover:text-slate-300"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>

      {/* Messages Scroll Area */}
      <div className="min-h-0 flex-1 overflow-y-auto px-4 py-5 sm:px-6">
        {isEmpty ? (
          /* Empty state */
          <div className="flex h-full flex-col items-center justify-center py-6 text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-primary/15 to-secondary/15 text-primary shadow-xs dark:from-primary/25 dark:to-secondary/25 dark:text-primary-light">
              <Sparkles className="h-8 w-8" />
            </div>
            <h2 className="mt-4 text-xl font-bold text-slate-800 dark:text-white">
              How can I assist you today?
            </h2>
            <p className="mt-1.5 max-w-md text-[13.5px] leading-relaxed text-slate-500 dark:text-slate-400">
              I can help inspect rental properties, track vacant rooms, manage tenants, review monthly reports, and verify invoices.
            </p>

            <div className="mt-8 w-full max-w-xl">
              <p className="text-left text-[11.5px] font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-3">
                Suggested questions:
              </p>
              <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
                {suggestions.map((s, idx) => (
                  <SuggestionChip key={idx} item={s} onClick={handleSuggestion} />
                ))}
              </div>
            </div>
          </div>
        ) : (
          /* Conversation messages */
          <div className="space-y-5">
            {messages.map((msg, i) => (
              <div
                key={i}
                className={`flex gap-3 sm:gap-4 ${
                  msg.role === "user" ? "justify-end" : "justify-start"
                }`}
              >
                {/* Assistant Avatar */}
                {msg.role === "assistant" && (
                  <div className="mt-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-secondary text-white shadow-2xs shadow-primary/20">
                    <Bot className="h-4 w-4" />
                  </div>
                )}

                {/* Message Bubble Container */}
                <div
                  className={`relative ${
                    msg.role === "user"
                      ? "max-w-[85%] sm:max-w-[75%]"
                      : "w-full max-w-[95%] sm:max-w-[90%] lg:max-w-[85%]"
                  }`}
                >
                  <div
                    className={`rounded-2xl px-4 py-3.5 sm:px-5 sm:py-4 transition-all ${
                      msg.role === "user"
                        ? "rounded-tr-xs bg-slate-900 text-white shadow-sm dark:bg-slate-800 dark:text-slate-100"
                        : msg.error
                        ? "rounded-tl-xs border border-red-200 bg-red-50/90 text-red-800 shadow-2xs dark:border-red-800 dark:bg-red-950/40 dark:text-red-300"
                        : "rounded-tl-xs border border-slate-200/90 bg-white text-slate-800 shadow-xs dark:border-gray-700/80 dark:bg-gray-800/90 dark:text-slate-200"
                    }`}
                  >
                    {msg.error && (
                      <div className="mb-2 flex items-center gap-1.5 text-red-600 dark:text-red-400">
                        <AlertCircle className="h-4 w-4" />
                        <span className="text-[12px] font-semibold uppercase tracking-wider">
                          Error occurred
                        </span>
                      </div>
                    )}

                    {/* Content Rendering */}
                    <div>
                      {msg.role === "assistant" ? (
                        <RichAssistantResponse
                          content={msg.content}
                          streaming={msg.streaming}
                          onAction={handleSuggestion}
                        />
                      ) : (
                        <p className="whitespace-pre-wrap text-[13.5px] leading-relaxed">
                          {msg.content}
                        </p>
                      )}
                    </div>

                    {/* Timestamp */}
                    <div className="mt-2 flex items-center justify-end">
                      <span
                        className={`text-[10.5px] font-medium ${
                          msg.role === "user"
                            ? "text-slate-300/80 dark:text-slate-400"
                            : "text-slate-400 dark:text-slate-500"
                        }`}
                      >
                        {formatTime(msg.timestamp)}
                      </span>
                    </div>
                  </div>
                </div>

                {/* User Avatar */}
                {msg.role === "user" && (
                  <div className="mt-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-slate-800 text-white shadow-2xs dark:bg-gray-700">
                    <User className="h-4 w-4 text-slate-200" />
                  </div>
                )}
              </div>
            ))}

            {/* Thinking / Tool Execution Indicator */}
            {loading && !isStreaming && (
              <div className="flex gap-3 sm:gap-4">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-secondary text-white shadow-2xs shadow-primary/20">
                  <Bot className="h-4 w-4" />
                </div>
                <div className="flex items-center gap-3 rounded-2xl rounded-tl-xs border border-slate-200/90 bg-white px-4 py-3 shadow-xs dark:border-gray-700/80 dark:bg-gray-800">
                  <Loader2 className="h-4 w-4 animate-spin text-primary" />
                  <span className="text-[13px] font-medium text-slate-600 dark:text-slate-300">
                    {streamingStatus || "Analyzing request..."}
                  </span>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      {/* Input area */}
      <div className="border-t border-slate-200/80 bg-slate-50/50 p-4 dark:border-gray-800 dark:bg-gray-900/50">
        <div className="relative flex items-end gap-2.5">
          <textarea
            ref={(el) => {
              textareaRef.current = el;
              inputRef.current = el;
            }}
            value={input}
            onChange={handleInput}
            onKeyDown={handleKeyDown}
            placeholder="Ask about properties, rooms, occupancy, invoices..."
            rows={1}
            disabled={loading}
            className="flex-1 resize-none rounded-xl border border-slate-200 bg-white px-4 py-3 text-[13.5px] leading-relaxed text-slate-800 shadow-2xs outline-none transition-all placeholder:text-slate-400 focus:border-primary focus:ring-2 focus:ring-primary/10 disabled:opacity-60 dark:border-gray-700 dark:bg-gray-800 dark:text-slate-200 dark:placeholder:text-slate-500 dark:focus:border-primary-light dark:focus:ring-primary-light/10"
          />
          <button
            type="button"
            onClick={handleSend}
            disabled={!input.trim() || loading}
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-r from-primary to-secondary text-white shadow-xs shadow-primary/30 transition-all hover:scale-105 hover:shadow-md disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:scale-100"
            title="Send message"
          >
            {loading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Send className="h-4 w-4" />
            )}
          </button>
        </div>
        <div className="mt-2 flex items-center justify-between text-[11px] text-slate-400 dark:text-slate-500">
          <span>Press Enter to send, Shift+Enter for new line</span>
          <span className="hidden sm:inline">TeasJul AI v2.0</span>
        </div>
      </div>
    </div>
  );
}

export default AssistantChat;