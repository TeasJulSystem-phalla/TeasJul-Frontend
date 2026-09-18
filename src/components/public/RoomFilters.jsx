import { useEffect, useState } from "react";
import { DollarSign, Filter, RotateCcw } from "lucide-react";

const PRESETS = [
  { label: "Under $100", min: "", max: 100 },
  { label: "$100 – $200", min: 100, max: 200 },
  { label: "$200 – $400", min: 200, max: 400 },
  { label: "$400+", min: 400, max: "" },
];

const RoomFilters = ({ value = { min: "", max: "" }, onChange }) => {
  const [local, setLocal] = useState(value);
  const active = local.min !== "" || local.max !== "";
  useEffect(() => {
    setLocal({ min: value.min ?? "", max: value.max ?? "" });
  }, [value.min, value.max]);
  const apply = (next) => {
    const normalized = {
      min: next.min?.toString() ?? "",
      max: next.max?.toString() ?? "",
    };
    setLocal(normalized);
    onChange(normalized);
  };
  const handleInput = (key, nextValue) =>
    setLocal((previous) => ({
      ...previous,
      [key]: nextValue.replace(/[^\d]/g, ""),
    }));
  const input = (key, label, placeholder) => (
    <label className="relative min-w-0 flex-1">
      <span className="sr-only">{label}</span>
      <DollarSign className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
      <input
        type="number"
        inputMode="numeric"
        min="0"
        placeholder={placeholder}
        value={local[key]}
        onChange={(event) => handleInput(key, event.target.value)}
        onBlur={() => onChange(local)}
        className="w-full rounded-xl border border-slate-200 bg-[#fafbf9] py-2.5 pl-8 pr-2 text-[12px] text-slate-700 outline-none transition focus:border-[#79959c] focus:bg-white"
      />
    </label>
  );
  return (
    <div>
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="flex items-center gap-2 text-[14px] font-bold text-[#163957]">
            <Filter className="h-4 w-4" /> Refine your search
          </h3>
          <p className="mt-1 text-[11.5px] leading-5 text-slate-500">
            Set a monthly budget that works for you.
          </p>
        </div>
        {active && (
          <button
            type="button"
            onClick={() => apply({ min: "", max: "" })}
            className="mt-0.5 flex shrink-0 items-center gap-1 text-[11px] font-semibold text-[#58727e] hover:text-[#163957]"
          >
            <RotateCcw className="h-3.5 w-3.5" /> Reset
          </button>
        )}
      </div>
      <div className="mt-5">
        <p className="text-[11px] font-bold uppercase tracking-[.15em] text-[#6d8490]">
          Monthly rent
        </p>
        <div className="mt-2.5 flex items-center gap-2">
          {input("min", "Minimum rent", "Min")}
          <span className="text-slate-300">—</span>
          {input("max", "Maximum rent", "Max")}
        </div>
      </div>
      <div className="mt-5">
        <p className="text-[11px] font-bold uppercase tracking-[.15em] text-[#6d8490]">
          Quick budgets
        </p>
        <div className="mt-2.5 grid grid-cols-2 gap-2">
          {PRESETS.map((preset) => {
            const selected =
              String(preset.min) === String(local.min) &&
              String(preset.max) === String(local.max);
            return (
              <button
                key={preset.label}
                type="button"
                onClick={() => apply(selected ? { min: "", max: "" } : preset)}
                className={`rounded-xl border px-2.5 py-2.5 text-left text-[11.5px] font-medium transition ${selected ? "border-[#163957] bg-[#163957] text-white" : "border-slate-200 text-slate-600 hover:border-[#aebfc1] hover:bg-[#f7f9f7]"}`}
              >
                {preset.label}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default RoomFilters;
