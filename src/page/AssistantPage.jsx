import { useState, useRef, useEffect } from "react";
import {
  Bot,
  Send,
  Trash2,
  User,
  AlertCircle,
  Loader2,
  MessageSquare,
} from "lucide-react";
import { useAssistant } from "../hooks/useAssistant";
import { useMyRoles } from "../hooks/useMyRoles";

const STAFF_SUGGESTIONS = [
  "Show me my houses",
  "Show me vacant rooms",
  "Show me overdue invoices",
  "Show me this month's report",
  "Show me the dashboard summary",
];

const TENANT_SUGGESTIONS = [
  "Show me my balance",
  "Show my invoices",
  "Show my payment history",
  "Show my utility usage",
  "Show my profile",
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

function renderMarkdown(text) {
  if (!text) return null;

  const lines = text.split("\n");
  const elements = [];
  let listItems = [];

  const flushList = () => {
    if (listItems.length > 0) {
      elements.push(
        <ul
          key={`list-${elements.length}`}
          className="my-1 list-disc pl-5 space-y-0.5"
        >
          {listItems.map((item, i) => (
            <li key={i} className="text-[13.5px] leading-relaxed">
              {item}
            </li>
          ))}
        </ul>
      );
      listItems = [];
    }
  };

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const trimmed = line.trim();

    if (trimmed.startsWith("- ") || trimmed.startsWith("* ")) {
      listItems.push(trimmed.slice(2));
      continue;
    }

    if (/^\d+\.\s/.test(trimmed)) {
      listItems.push(trimmed.replace(/^\d+\.\s/, ""));
      continue;
    }

    flushList();

    if (trimmed === "") {
      elements.push(<div key={`br-${i}`} className="h-2" />);
      continue;
    }

    elements.push(
      <p key={`p-${i}`} className="text-[13.5px] leading-relaxed">
        {trimmed}
      </p>
    );
  }

  flushList();
  return elements;
}

const SuggestionChip = ({ text, onClick }) => (
  <button
    type="button"
    onClick={() => onClick(text)}
    className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-left text-[12.5px] font-medium text-slate-600 transition-colors hover:border-gray-300 hover:bg-slate-50 hover:text-slate-800 dark:border-gray-700 dark:bg-gray-800 dark:text-slate-300 dark:hover:border-gray-600 dark:hover:bg-gray-700 dark:hover:text-white"
  >
    {text}
  </button>
);

const AssistantPage = () => {
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
    inputRef.current?.focus();
  }, []);

  const handleSend = () => {
    if (!input.trim() || loading) return;
    sendMessage(input);
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
    el.style.height = Math.min(el.scrollHeight, 120) + "px";
  };

  const handleSuggestion = (text) => {
    setInput(text);
    sendMessage(text);
  };

  const isEmpty = messages.length === 0;

  return (
    <div className="flex h-[calc(100vh-8rem)] flex-col rounded-xl border border-slate-200 bg-white dark:border-gray-800 dark:bg-gray-900">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-200 px-5 py-3.5 dark:border-gray-800">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-100 dark:bg-gray-800">
            <Bot className="h-5 w-5 text-slate-600 dark:text-slate-300" />
          </div>
          <div>
            <h1 className="text-[15px] font-semibold text-slate-800 dark:text-white">
              AI Assistant
            </h1>
            <p className="text-[11px] text-slate-400 dark:text-slate-500">
              Ask about your properties, tenants, invoices, and more
            </p>
          </div>
        </div>
        {!isEmpty && (
          <button
            type="button"
            onClick={clearConversation}
            className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-[12.5px] font-medium text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-700 dark:text-slate-400 dark:hover:bg-gray-800 dark:hover:text-slate-200"
            title="Clear conversation"
          >
            <Trash2 className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Clear</span>
          </button>
        )}
      </div>

      {/* Messages area */}
      <div className="flex-1 overflow-y-auto px-5 py-4">
        {isEmpty ? (
          /* Empty state */
          <div className="flex h-full flex-col items-center justify-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 dark:bg-gray-800">
              <MessageSquare className="h-7 w-7 text-slate-400 dark:text-slate-500" />
            </div>
            <h2 className="mt-4 text-lg font-semibold text-slate-800 dark:text-white">
              How can I help you?
            </h2>
            <p className="mt-1 max-w-sm text-center text-[13px] text-slate-500 dark:text-slate-400">
              I can help you with property management, tenant information,
              invoices, reports, and more.
            </p>
            <div className="mt-6 grid w-full max-w-md grid-cols-1 gap-2 sm:grid-cols-2">
              {suggestions.map((s) => (
                <SuggestionChip key={s} text={s} onClick={handleSuggestion} />
              ))}
            </div>
          </div>
        ) : (
          /* Conversation messages */
          <div className="space-y-4">
            {messages.map((msg, i) => (
              <div
                key={i}
                className={`flex gap-3 ${
                  msg.role === "user" ? "justify-end" : "justify-start"
                }`}
              >
                {msg.role === "assistant" && (
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-slate-100 dark:bg-gray-800">
                    <Bot className="h-4 w-4 text-slate-600 dark:text-slate-300" />
                  </div>
                )}
                <div
                  className={`max-w-[75%] rounded-xl px-4 py-2.5 ${
                    msg.role === "user"
                      ? "bg-slate-800 text-white dark:bg-gray-700 dark:text-slate-100"
                      : msg.error
                      ? "border border-red-200 bg-red-50 text-red-700 dark:border-red-800 dark:bg-red-950/50 dark:text-red-300"
                      : "border border-slate-200 bg-slate-50 text-slate-800 dark:border-gray-700 dark:bg-gray-800 dark:text-slate-200"
                  }`}
                >
                  {msg.error && (
                    <div className="mb-1 flex items-center gap-1.5">
                      <AlertCircle className="h-3.5 w-3.5" />
                      <span className="text-[11px] font-medium uppercase tracking-wide opacity-70">
                        Error
                      </span>
                    </div>
                  )}
                  <div className="space-y-1">
                    {msg.role === "assistant"
                      ? (
                        <>
                          {renderMarkdown(msg.content)}
                          {msg.streaming && (
                            <span
                              className="inline-block w-0.5 h-3.5 bg-slate-500 dark:bg-slate-400 align-middle ml-0.5"
                              style={{ animation: "blink 1s step-end infinite" }}
                              aria-hidden="true"
                            />
                          )}
                        </>
                      )
                      : msg.content}
                  </div>
                  <p
                    className={`mt-1 text-[10px] ${
                      msg.role === "user"
                        ? "text-slate-400 dark:text-slate-500"
                        : "text-slate-400 dark:text-slate-500"
                    }`}
                  >
                    {formatTime(msg.timestamp)}
                  </p>
                </div>
                {msg.role === "user" && (
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-slate-800 dark:bg-gray-700">
                    <User className="h-4 w-4 text-white dark:text-slate-200" />
                  </div>
                )}
              </div>
            ))}

            {/* Thinking/tool bubble — shown only when loading but no streaming message yet */}
            {loading && !isStreaming && (
              <div className="flex gap-3">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-slate-100 dark:bg-gray-800">
                  <Bot className="h-4 w-4 text-slate-600 dark:text-slate-300" />
                </div>
                <div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 dark:border-gray-700 dark:bg-gray-800">
                  <Loader2 className="h-4 w-4 animate-spin text-slate-400 dark:text-slate-500" />
                  <span className="text-[13px] text-slate-500 dark:text-slate-400">
                    {streamingStatus || "Thinking..."}
                  </span>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      {/* Input area */}
      <div className="border-t border-slate-200 px-5 py-3.5 dark:border-gray-800">
        <div className="flex items-end gap-3">
          <textarea
            ref={textareaRef}
            value={input}
            onChange={handleInput}
            onKeyDown={handleKeyDown}
            placeholder="Ask me anything..."
            rows={1}
            disabled={loading}
            className="flex-1 resize-none rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-[13.5px] text-slate-800 outline-none transition-colors placeholder:text-slate-400 focus:border-gray-300 focus:ring-2 focus:ring-gray-100 disabled:opacity-60 dark:border-gray-700 dark:bg-gray-800 dark:text-slate-200 dark:placeholder:text-slate-500 dark:focus:border-gray-600 dark:focus:ring-gray-800"
          />
          <button
            type="button"
            onClick={handleSend}
            disabled={!input.trim() || loading}
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-slate-800 text-white transition-colors hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-40 dark:bg-gray-700 dark:hover:bg-gray-600"
            title="Send message"
          >
            {loading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Send className="h-4 w-4" />
            )}
          </button>
        </div>
        <p className="mt-2 text-[11px] text-slate-400 dark:text-slate-500">
          Press Enter to send, Shift+Enter for new line
        </p>
      </div>
    </div>
  );
};

export default AssistantPage;
