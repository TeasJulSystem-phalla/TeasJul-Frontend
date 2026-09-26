import { create } from "zustand";
import { assistantApi } from "../api/assistant.api";

/**
 * Global assistant conversation state with SSE streaming support.
 *
 * Messages have shape:
 *   { role, content, timestamp, error?, streaming? }
 *
 * While the model is generating, the last assistant message has
 * `streaming: true` and grows as `onDelta` fires. Once `onDone`
 * fires the flag is cleared and the authoritative reply replaces it.
 *
 * Living in a global store (rather than per-mount state) means the same
 * conversation is shared between the full assistant page and the floating
 * assistant widget, and it survives page navigation.
 */
let pendingRef = false;
let cancelRef = null;

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

export const useAssistantStore = create((set) => ({
  messages: [],
  loading: false,
  error: null,
  streamingStatus: "",

  sendMessage: async (text) => {
    const trimmed = text?.trim();
    if (!trimmed || pendingRef) return;

    pendingRef = true;
    set({ loading: true, error: null, streamingStatus: "Thinking..." });

    const userMsg = { role: "user", content: trimmed, timestamp: Date.now() };

    // Snapshot of messages for building history because the store state is
    // captured at call time.
    let snapshotMessages;
    set((state) => {
      snapshotMessages = state.messages;
      return { messages: [...state.messages, userMsg] };
    });

    // Build history from the snapshot (before the user message was appended)
    const history = [...(snapshotMessages ?? []), userMsg]
      .slice(-12)
      .map((m) => ({ content: m.content, role: m.role }));

    // Append a placeholder streaming assistant message
    const streamingMsgId = Date.now() + 1; // unique enough for key
    set((state) => ({
      messages: [
        ...state.messages,
        {
          role: "assistant",
          content: "",
          timestamp: streamingMsgId,
          streaming: true,
          error: false,
        },
      ],
    }));

    const { cancel } = assistantApi.streamChat(
      trimmed,
      history,
      null,
      {
        onDelta: (fragment) => {
          set((state) => {
            const updated = [...state.messages];
            const idx = updated.findLastIndex(
              (m) => m.role === "assistant" && m.streaming
            );
            if (idx === -1) return state;
            updated[idx] = {
              ...updated[idx],
              content: updated[idx].content + fragment,
            };
            return { messages: updated };
          });
        },

        onToolEvent: (label) => {
          set({ streamingStatus: label });
        },

        onDone: (response) => {
          set((state) => {
            const updated = [...state.messages];
            const idx = updated.findLastIndex(
              (m) => m.role === "assistant" && m.streaming
            );
            if (idx === -1) return state;
            updated[idx] = {
              role: "assistant",
              content: response.reply || "I received your message.",
              timestamp: updated[idx].timestamp,
              error: response.error || false,
              streaming: false,
            };
            return { messages: updated };
          });
          set({ loading: false, streamingStatus: "" });
          pendingRef = false;
          cancelRef = null;
        },

        onError: (message) => {
          const userMessage = mapErrorMessage(message);
          set((state) => {
            const updated = [...state.messages];
            const idx = updated.findLastIndex(
              (m) => m.role === "assistant" && m.streaming
            );
            if (idx === -1) {
              return {
                messages: [
                  ...state.messages,
                  {
                    role: "assistant",
                    content: userMessage,
                    timestamp: Date.now(),
                    error: true,
                    streaming: false,
                  },
                ],
              };
            }
            updated[idx] = {
              ...updated[idx],
              content: userMessage,
              error: true,
              streaming: false,
            };
            return { messages: updated };
          });
          set({ loading: false, streamingStatus: "", error: userMessage });
          pendingRef = false;
          cancelRef = null;
        },
      }
    );

    cancelRef = cancel;
  },

  clearConversation: () => {
    // Cancel any active stream before clearing
    cancelRef?.();
    cancelRef = null;
    pendingRef = false;
    set({
      messages: [],
      error: null,
      loading: false,
      streamingStatus: "",
    });
  },
}));