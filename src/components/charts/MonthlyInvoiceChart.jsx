// src/components/charts/MonthlyInvoiceChart.jsx
import { useMemo } from 'react';
import {
  Bar,
  CartesianGrid,
  ComposedChart,
  Line,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { formatCompactCurrency, formatCurrency, formatMonth } from '../../utils/format';

const INVOICED_COLOR = 'var(--app-primary)';
const COLLECTED_COLOR = '#059669';
const OUTSTANDING_COLOR = '#dc2626';
const GRID_COLOR = '#e2e8f0';
const AXIS_COLOR = '#64748b';

const LEGEND = [
  { key: 'invoiced', color: INVOICED_COLOR, label: 'បានចេញវិក្កយបត្រ (Invoiced)' },
  { key: 'collected', color: COLLECTED_COLOR, label: 'បានទូទាត់ (Collected)' },
  { key: 'outstanding', color: OUTSTANDING_COLOR, label: 'នៅសល់ (Outstanding)' },
];

const ChartTooltip = ({ active, payload, label }) => {
  if (!active || !payload || payload.length === 0) return null;
  return (
    <div className="min-w-[190px] rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 shadow-xl shadow-slate-900/10 dark:border-gray-700 dark:bg-gray-900 dark:shadow-black/20">
      <p className="text-[12px] font-semibold text-slate-800 dark:text-white">{label}</p>
      <div className="mt-1.5 space-y-1">
        {payload.map((entry) => (
          <div key={entry.dataKey} className="flex items-center justify-between gap-6">
            <span className="flex items-center gap-2 text-[12px] text-slate-500 dark:text-slate-400">
              <span className="h-2 w-2 rounded-full" style={{ background: entry.color }} />
              {entry.name}
            </span>
            <span className="text-[12px] font-semibold text-slate-800 dark:text-white">
              {formatCurrency(entry.value)}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

const LegendChip = ({ color, label }) => (
  <span className="flex items-center gap-2 text-[12px] font-medium text-slate-500 dark:text-slate-400">
    <span className="h-[3px] w-5 rounded-full" style={{ background: color }} />
    {label}
  </span>
);

const MonthlyInvoiceChart = ({ data = [], year, height = 300 }) => {
  const rows = useMemo(
    () =>
      (Array.isArray(data) ? data : []).map((d) => ({
        ...d,
        label: formatMonth(d.month),
        invoiced: Number(d.invoiced || 0),
        collected: Number(d.collected || 0),
        outstanding: Number(d.outstanding || 0),
      })),
    [data]
  );

  if (rows.length === 0) return null;

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center gap-4">
        {LEGEND.map((item) => (
          <LegendChip key={item.key} color={item.color} label={item.label} />
        ))}
        {year && (
          <span className="ml-auto rounded-full bg-slate-100 px-2.5 py-0.5 text-[12px] font-semibold text-slate-600 dark:bg-gray-800 dark:text-slate-300">
            {year}
          </span>
        )}
      </div>
      <div style={{ height }} className="w-full">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={rows} margin={{ top: 6, right: 4, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="invoiceInvoiced" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={INVOICED_COLOR} stopOpacity={0.55} />
                <stop offset="100%" stopColor={INVOICED_COLOR} stopOpacity={0.1} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke={GRID_COLOR} vertical={false} />
            <XAxis
              dataKey="label"
              tick={{ fontSize: 11, fill: AXIS_COLOR }}
              tickLine={false}
              axisLine={{ stroke: GRID_COLOR }}
              dy={6}
            />
            <YAxis
              tick={{ fontSize: 11, fill: AXIS_COLOR }}
              tickLine={false}
              axisLine={false}
              width={52}
              tickFormatter={(v) => formatCompactCurrency(v)}
            />
            <Tooltip content={<ChartTooltip />} cursor={{ stroke: GRID_COLOR, strokeDasharray: '3 3' }} />
            <Bar
              dataKey="invoiced"
              name="បានចេញវិក្កយបត្រ"
              fill="url(#invoiceInvoiced)"
              radius={[4, 4, 0, 0]}
              maxBarSize={16}
            />
            <Bar
              dataKey="collected"
              name="បានទូទាត់"
              fill={COLLECTED_COLOR}
              radius={[4, 4, 0, 0]}
              maxBarSize={16}
            />
            <Line
              type="monotone"
              dataKey="outstanding"
              name="នៅសល់"
              stroke={OUTSTANDING_COLOR}
              strokeWidth={2.5}
              dot={{ r: 3, fill: OUTSTANDING_COLOR, strokeWidth: 0 }}
              activeDot={{ r: 5, fill: OUTSTANDING_COLOR, stroke: '#ffffff', strokeWidth: 2 }}
            />
          </ComposedChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default MonthlyInvoiceChart;