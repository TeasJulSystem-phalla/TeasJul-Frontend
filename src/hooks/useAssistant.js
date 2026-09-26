import { useAssistantStore } from "../store/assistant.store";

/**
 * Reactive view over the global assistant conversation state.
 *
 * The conversation lives in {@link useAssistantStore} so the full assistant
 * page and the floating assistant widget share the same messages, loading
 * state and streaming progress, and it survives page navigation.
 *
 * Messages have shape:
 *   { role, content, timestamp, error?, streaming? }
 */
export function useAssistant() {
  const messages = useAssistantStore((s) => s.messages);
  const loading = useAssistantStore((s) => s.loading);
  const error = useAssistantStore((s) => s.error);
  const streamingStatus = useAssistantStore((s) => s.streamingStatus);
  const sendMessage = useAssistantStore((s) => s.sendMessage);
  const clearConversation = useAssistantStore((s) => s.clearConversation);

  return {
    messages,
    loading,
    error,
    streamingStatus,
    sendMessage,
    clearConversation,
  };
}