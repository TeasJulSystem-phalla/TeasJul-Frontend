import { AssistantChat } from "../components/assistant/AssistantChat";

/**
 * Full-page AI Assistant view, mounted at /owner/assistant, /manager/assistant
 * and /tenant/assistant. It reuses the shared {@link AssistantChat} interface
 * (and therefore the global conversation store), so it is the same assistant as
 * the floating bottom-right widget.
 */
const AssistantPage = () => (
  <div className="h-[calc(100vh-8rem)]">
    <AssistantChat />
  </div>
);

export default AssistantPage;