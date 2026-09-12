import { useState, useCallback, useRef } from "react";
import { assistantApi } from "../api/assistant.api";

/**
 * Manages assistant conversation state with SSE streaming support.
 *
 * Messages have shape:
 *   { role, content, timestamp, error?, streaming? }
 *
 * While the model is generating, the last assistant message has
 * `streaming: true` and grows as `onDelta` fires. Once `onDone`
 * fires the flag is cleared and the authoritative reply replaces it.
 */
export function useAssistant() {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [streamingStatus, setStreamingStatus] = useState("");

  const pendingRef = useRef(false);
  const cancelRef = useRef(null);

  const sendMessage = useCallback(
    async (text) => {
      const trimmed = text?.trim();
      if (!trimmed || pendingRef.current) return;

      pendingRef.current = true;
      setLoading(true);
      setError(null);
      setStreamingStatus("Thinking...");

      const userMsg = { role: "user", content: trimmed, timestamp: Date.now() };

      // We'll use a ref snapshot of messages for building history because
      // the state closure is captured at call time.
      let snapshotMessages;
      setMessages((prev) => {
        snapshotMessages = prev;
        return [...prev, userMsg];
      });

      // Build history from the snapshot (before the user message was appended)
      const history = [...(snapshotMessages ?? []), userMsg]
        .slice(-12)
        .map((m) => ({ content: m.content, role: m.role }));

      // Append a placeholder streaming assistant message
      const streamingMsgId = Date.now() + 1; // unique enough for key
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: "",
          timestamp: streamingMsgId,
          streaming: true,
          error: false,
        },
      ]);

      const { cancel } = assistantApi.streamChat(
        trimmed,
        history,
        null,
        {
          onDelta: (fragment) => {
            setMessages((prev) => {
              const updated = [...prev];
              const idx = updated.findLastIndex(
                (m) => m.role === "assistant" && m.streaming
              );
              if (idx === -1) return prev;
              updated[idx] = {
                ...updated[idx],
                content: updated[idx].content + fragment,
              };
              return updated;
            });
          },

          onToolEvent: (label) => {
            setStreamingStatus(label);
          },

          onDone: (response) => {
            setMessages((prev) => {
              const updated = [...prev];
              const idx = updated.findLastIndex(
                (m) => m.role === "assistant" && m.streaming
              );
              if (idx === -1) return prev;
              updated[idx] = {
                role: "assistant",
                content: response.reply || "I received your message.",
                timestamp: updated[idx].timestamp,
                error: response.error || false,
                streaming: false,
              };
              return updated;
            });
            setLoading(false);
            setStreamingStatus("");
            pendingRef.current = false;
            cancelRef.current = null;
          },

          onError: (message) => {
            const userMessage = mapErrorMessage(message);
            setError(userMessage);
            setMessages((prev) => {
              const updated = [...prev];
              const idx = updated.findLastIndex(
                (m) => m.role === "assistant" && m.streaming
              );
              if (idx === -1) {
                return [
                  ...prev,
                  {
                    role: "assistant",
                    content: userMessage,
                    timestamp: Date.now(),
                    error: true,
                    streaming: false,
                  },
                ];
              }
              updated[idx] = {
                ...updated[idx],
                content: userMessage,
                error: true,
                streaming: false,
              };
              return updated;
            });
            setLoading(false);
            setStreamingStatus("");
            pendingRef.current = false;
            cancelRef.current = null;
          },
        }
      );

      cancelRef.current = cancel;
    },
    []
  );

  const clearConversation = useCallback(() => {
    // Cancel any active stream before clearing
    cancelRef.current?.();
    cancelRef.current = null;
    pendingRef.current = false;
    setMessages([]);
    setError(null);
    setLoading(false);
    setStreamingStatus("");
  }, []);

  return {
    messages,
    loading,
    error,
    streamingStatus,
    sendMessage,
    clearConversation,
  };
}

function mapErrorMessage(raw) {
  if (!raw) return "The AI assistant is temporarily unavailable.";
  const lower = raw.toLowerCase();
  if (lower.includes("session") || lower.includes("expired")) {
    return "Your session has expired. Please log in again.";
  }
  if (lower.includes("permission") || lower.includes("disabled")) {
    return "You don't have permission to use this assistant.";
  }
  if (lower.includes("connect") || lower.includes("network")) {
    return "Unable to connect to the AI assistant.";
  }
  if (lower.includes("timeout") || lower.includes("too long")) {
    return "The AI assistant is taking too long to respond. Please try again.";
  }
  return raw;
}
