import api from "./axios";
import axios from "axios";
import { useAuthStore } from "../store/auth.store";

export const assistantApi = {
  chat: (message, history = [], sessionId = null) =>
    api
      .post("/assistant/chat", {
        message,
        history,
        sessionId,
      })
      .then((res) => res.data),

  /**
   * Streaming chat via the SSE endpoint.
   *
   * Uses native fetch (not axios) because the browser's ReadableStream API is
   * required for progressive rendering; axios buffers the full response body.
   *
   * @param {string}   message
   * @param {Array}    history  — [{role, content}, ...]
   * @param {string|null} sessionId
   * @param {{
   *   onDelta:     (text: string) => void,
   *   onToolEvent: (label: string) => void,
   *   onDone:      (response: object) => void,
   *   onError:     (message: string) => void,
   * }} callbacks
   * @returns {{ cancel: () => void }} — call cancel() to abort mid-stream
   */
  streamChat: (message, history = [], sessionId = null, callbacks = {}) => {
    const controller = new AbortController();
    let cancelled = false;
    let isDone = false;

    const run = async (token, retried = false) => {
      const baseUrl = import.meta.env.VITE_API_URL || "";
      const url = `${baseUrl}/assistant/chat/stream`;

      let response;
      try {
        response = await fetch(url, {
          method: "POST",
          signal: controller.signal,
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          credentials: "include",
          body: JSON.stringify({ message, history, sessionId }),
        });
      } catch {
        if (cancelled || controller.signal.aborted) return;
        callbacks.onError?.("Unable to connect to the AI assistant.");
        return;
      }

      // 401 → try one token refresh then retry
      if (response.status === 401 && !retried) {
        try {
          const refreshResp = await axios.post(
            `${baseUrl}/v1/auth/refresh`,
            {},
            { withCredentials: true }
          );
          const newToken =
            refreshResp.data.token || refreshResp.data.accessToken;
          useAuthStore.getState().setAccessToken(newToken);
          return run(newToken, true);
        } catch {
          callbacks.onError?.("Your session has expired. Please log in again.");
          return;
        }
      }

      if (response.status === 403) {
        callbacks.onError?.(
          "The AI assistant is currently disabled or you lack permission."
        );
        return;
      }

      if (!response.ok) {
        callbacks.onError?.("The AI assistant is temporarily unavailable.");
        return;
      }

      // Parse the SSE stream line-by-line
      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";
      let currentEvent = "message";

      try {
        while (true) {
          const { done, value } = await reader.read();
          if (done || cancelled) break;

          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split("\n");
          // Keep last (potentially incomplete) line in buffer
          buffer = lines.pop();

          for (const line of lines) {
            if (line.startsWith("event:")) {
              currentEvent = line.slice(6).trim();
            } else if (line.startsWith("data:")) {
              const data = line.slice(5).trim();
              if (currentEvent === "done") isDone = true;
              dispatchSseEvent(currentEvent, data, callbacks);
              // Reset for next event block
              currentEvent = "message";
            }
            // Empty line = event separator; already handled by reset above
          }
        }
      } catch {
        if (!cancelled && !controller.signal.aborted && !isDone) {
          callbacks.onError?.("The AI assistant stream was interrupted.");
        }
      } finally {
        reader.cancel().catch(() => {});
      }
    };

    const token = useAuthStore.getState().accessToken;
    run(token).catch(() => {
      callbacks.onError?.("The AI assistant ran into a problem.");
    });

    return {
      cancel: () => {
        cancelled = true;
        controller.abort();
      },
    };
  },
};

function dispatchSseEvent(eventName, data, callbacks) {
  switch (eventName) {
    case "delta":
      callbacks.onDelta?.(data);
      break;
    case "tool":
      callbacks.onToolEvent?.(data);
      break;
    case "done":
      try {
        callbacks.onDone?.(JSON.parse(data));
      } catch {
        callbacks.onDone?.({ reply: data, error: false, toolCalls: [] });
      }
      break;
    case "error":
      callbacks.onError?.(data);
      break;
    default:
      break;
  }
}
