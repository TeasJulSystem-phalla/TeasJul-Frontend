import { Sparkles, Building2, Receipt, BarChart3, DoorOpen } from "lucide-react";
import { AssistantChat } from "../components/assistant/AssistantChat";
import { useMyRoles } from "../hooks/useMyRoles";

/**
 * Full-page AI Assistant workspace view, mounted at /owner/assistant,
 * /manager/assistant and /tenant/assistant.
 *
 * It reuses the shared {@link AssistantChat} interface and conversation store,
 * providing a dedicated full-page screen with quick capability pills.
 */
const AssistantPage = () => {
  const { isTenant } = useMyRoles();

  return (
    <div className="flex h-[calc(100vh-6rem)] sm:h-[calc(100vh-6.5rem)] lg:h-[calc(100vh-7rem)] flex-col gap-3 min-h-0">
      {/* Top Workspace Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-slate-200/80 bg-white px-4 py-2.5 shadow-2xs dark:border-gray-800 dark:bg-gray-900 shrink-0">
        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary dark:bg-primary/20 dark:text-primary-light">
            <Sparkles className="h-4 w-4" />
          </div>
          <div>
            <h2 className="text-[14px] font-bold text-slate-800 dark:text-white">
              AI Assistant Workspace
            </h2>
            <p className="text-[11px] text-slate-400 dark:text-slate-500">
              {isTenant
                ? "Your personal rental, payment & invoice assistant"
                : "Real-time rental operations, property occupancy & financial analytics"}
            </p>
          </div>
        </div>

        {/* Quick Capabilities */}
        <div className="hidden md:flex items-center gap-1.5 text-[11px]">
          <span className="flex items-center gap-1 rounded-md bg-slate-100 px-2 py-1 font-medium text-slate-600 dark:bg-gray-800 dark:text-slate-300">
            <Building2 className="h-3 w-3 text-primary" /> Properties
          </span>
          <span className="flex items-center gap-1 rounded-md bg-slate-100 px-2 py-1 font-medium text-slate-600 dark:bg-gray-800 dark:text-slate-300">
            <DoorOpen className="h-3 w-3 text-blue-500" /> Rooms & Vacancy
          </span>
          <span className="flex items-center gap-1 rounded-md bg-slate-100 px-2 py-1 font-medium text-slate-600 dark:bg-gray-800 dark:text-slate-300">
            <Receipt className="h-3 w-3 text-amber-500" /> Invoices
          </span>
          <span className="flex items-center gap-1 rounded-md bg-slate-100 px-2 py-1 font-medium text-slate-600 dark:bg-gray-800 dark:text-slate-300">
            <BarChart3 className="h-3 w-3 text-emerald-500" /> Reports
          </span>
        </div>
      </div>

      {/* Main Chat Interface taking all remaining height */}
      <div className="flex-1 min-h-0 overflow-hidden">
        <AssistantChat autoFocus={true} isFullPage={true} />
      </div>
    </div>
  );
};

export default AssistantPage;