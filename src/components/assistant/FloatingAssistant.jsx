import { useEffect, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Bot, Sparkles, X } from "lucide-react";
import { AssistantChat } from "./AssistantChat";

// The full assistant page already renders the (shared) chat interface on
// these routes, so the floating launcher hides there to avoid a duplicated
// entry point on the same screen.
const ASSISTANT_ROUTES = new Set([
  "/owner/assistant",
  "/manager/assistant",
  "/tenant/assistant",
  "/assistant",
]);

/**
 * Global AI Assistant floating widget. Mounted once in every authenticated
 * layout (Owner/Admin, Manager, Tenant) so it stays available at the
 * bottom-right of the viewport across page navigation.
 *
 * It hosts the same {@link AssistantChat} used by the full assistant page and
 * reads conversation state from the global assistant store, so there is a
 * single assistant (and a single conversation) for the whole app.
 */
const FloatingAssistant = () => {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const launcherRef = useRef(null);

  useEffect(() => {
    if (!open) return undefined;
    const onKeyDown = (e) => {
      if (e.key === "Escape") {
        setOpen(false);
        launcherRef.current?.focus();
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open]);

  // Determine the full-page route matching the current layout
  const handleExpandToFullPage = () => {
    setOpen(false);
    if (pathname.startsWith("/manager")) {
      navigate("/manager/assistant");
    } else if (pathname.startsWith("/tenant")) {
      navigate("/tenant/assistant");
    } else {
      navigate("/owner/assistant");
    }
  };

  // No duplicate entry point on the full assistant page routes.
  const isAssistantRoute = ASSISTANT_ROUTES.has(pathname);
  if (isAssistantRoute) {
    return null;
  }

  return (
    <>
      {/* Floating launcher button */}
      <button
        ref={launcherRef}
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-label="AI Assistant"
        aria-expanded={open}
        aria-haspopup="dialog"
        title="AI Assistant"
        className="group fixed right-4 bottom-4 z-40 flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-primary to-secondary text-white shadow-lg shadow-primary/30 ring-1 ring-white/20 transition-all duration-200 hover:scale-105 hover:shadow-xl hover:shadow-primary/40 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-slate-50 dark:focus-visible:ring-offset-gray-950 print:hidden sm:right-6 sm:bottom-6 sm:h-14 sm:w-14"
      >
        {open ? (
          <X className="h-5 w-5 sm:h-6 sm:w-6" />
        ) : (
          <Bot className="h-5 w-5 sm:h-6 sm:w-6" />
        )}
        <span className="absolute -top-1 -right-1 flex h-3.5 w-3.5 items-center justify-center rounded-full bg-emerald-400 ring-2 ring-white dark:ring-gray-950">
          <Sparkles className="h-2 w-2 text-white" />
        </span>
      </button>

      {/* Floating panel */}
      <div
        role="dialog"
        aria-label="AI Assistant"
        aria-hidden={!open}
        inert={!open}
        className={[
          "fixed right-4 bottom-20 z-40 w-[min(28rem,calc(100vw-2rem))] h-[min(38rem,calc(100dvh-7rem))] transition-all duration-200 ease-out print:hidden sm:right-6 sm:bottom-24",
          open
            ? "pointer-events-auto translate-y-0 scale-100 opacity-100"
            : "pointer-events-none translate-y-3 scale-[0.98] opacity-0",
        ].join(" ")}
      >
        <div className="h-full overflow-hidden rounded-2xl bg-white shadow-2xl shadow-slate-900/20 ring-1 ring-slate-200 dark:bg-gray-900 dark:shadow-black/40 dark:ring-gray-800">
          <AssistantChat
            autoFocus={open}
            onClose={() => setOpen(false)}
            onExpand={handleExpandToFullPage}
          />
        </div>
      </div>
    </>
  );
};

export default FloatingAssistant;