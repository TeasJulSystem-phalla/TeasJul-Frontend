// src/components/charts/RevenueTrendChart.jsx
import { useMemo } from 'react';
import {
  Area,
  AreaChart,
  CartesianGrid,
  Line,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { TrendingUp, TrendingDown, Award } from 'lucide-react';
import { formatCurrency, formatCompactCurrency } from '../../utils/format';

const ACTUAL_COLOR = '#092328';
const PROJECTED_COLOR = '#94a3b8';
const GRID_COLOR = '#e2e8f0';
const AXIS_COLOR = '#64748b';

const monthLabel = (key) => {
  if (typeof key === 'string' && /^\d{4}-\d{2}$/.test(key)) {
    const [y, m] = key.split('-').map(Number);
    return new Date(y, m - 1, 1).toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
  }
  return key;
};

const nextMonthKey = (key) => {
  const [y, m] = String(key ?? '').split('-').map(Number);
  if (!y || !m) return null;
  const date = new Date(y, m - 1, 1);
  date.setMonth(date.getMonth() + 1);
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
};

const buildForecast = (points, horizon) => {
  if (points.length < 3) return undefined;
  const positive = points.filter((p) => p.amount > 0);
  if (positive.length < 2) return undefined;

  const n = points.length;
  let sumX = 0;
  let sumY = 0;
  let sumXY = 0;
  let sumXX = 0;
  points.forEach((p, i) => {
    sumX += i;
    sumY += p.amount;
    sumXY += i * p.amount;
    sumXX += i * i;
  });
  const denom = n * sumXX - sumX * sumX;
  const slope = denom === 0 ? 0 : (n * sumXY - sumX * sumY) / denom;
  const last = points[n - 1];

  const out = [];
  let key = last.month || last.label;
  for (let k = 1; k <= horizon; k += 1) {
    const next = nextMonthKey(key);
    if (!next) break;
    out.push({
      label: monthLabel(next),
      month: next,
      proj: Math.max(0, last.amount + slope * k),
    });
    key = next;
  }
  return out.length ? out : undefined;
};

const LegendChip = ({ color, dashed, label }) => (
  <span className="flex items-center gap-2 text-[12px] font-medium text-slate-500 dark:text-slate-400">
    <span
      className={`h-[3px] w-5 ${dashed ? 'border-t-2 border-dashed' : 'rounded-full'}`}
      style={dashed ? { borderColor: color } : { background: color }}
    />
    {label}
  </span>
);

const TrendTooltip = ({ active, payload, label }) => {
  if (!active || !payload || payload.length === 0) return null;
  const datum = payload[0]?.payload || {};
  const actual = datum.amount != null ? datum.amount : null;
  const projected = datum.proj != null ? datum.proj : null;

  return (
    <div className="min-w-[190px] rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 shadow-xl shadow-slate-900/10 dark:border-gray-700 dark:bg-gray-900 dark:shadow-black/20">
      <p className="text-[12px] font-semibold text-slate-800 dark:text-white">
        {label}
        {actual == null && ' (ព្យាករ)'}
      </p>
      <div className="mt-1.5 space-y-1">
        {actual != null && (
          <div className="flex items-center justify-between gap-6">
            <span className="flex items-center gap-2 text-[12px] text-slate-500 dark:text-slate-400">
              <span className="h-2 w-2 rounded-full" style={{ background: ACTUAL_COLOR }} />
              ចំណូល
            </span>
            <span className="text-[12px] font-semibold text-slate-800 dark:text-white">
              {formatCurrency(actual)}
            </span>
          </div>
        )}
        {projected != null && (
          <div className="flex items-center justify-between gap-6">
            <span className="flex items-center gap-2 text-[12px] text-slate-500 dark:text-slate-400">
              <span className="h-2 w-2 rounded-full border" style={{ borderColor: PROJECTED_COLOR }} />
              ការព្យាករណ៍
            </span>
            <span className="text-[12px] font-semibold text-slate-800 dark:text-white">
              {formatCurrency(projected)}
            </span>
          </div>
        )}
      </div>
      {actual != null && datum.delta != null && (
        <span
          className={`mt-2 inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-semibold ${
            datum.delta >= 0
              ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400'
              : 'bg-red-50 text-red-600 dark:bg-red-500/10 dark:text-red-400'
          }`}
        >
          {datum.delta >= 0 ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
          {datum.delta >= 0 ? '+' : ''}
          {datum.delta.toFixed(1)}% បើប្រៀបធៀបខែមុន
        </span>
      )}
    </div>
  );
};

const RevenueTrendChart = ({ data = [], height = 292 }) => {
  const { chartData, average, hasForecast, peak, last } = useMemo(() => {
    const rows = data.map((d, i) => {
      const prev = data[i - 1];
      const amount = Number(d.amount || 0);
      return {
        ...d,
        amount,
        proj: null,
        delta:
          prev && Number(prev.amount || 0)
            ? ((amount - Number(prev.amount || 0)) / Number(prev.amount || 0)) * 100
            : null,
      };
    });

    const forecast = buildForecast(rows, rows.length >= 6 ? 3 : 2);
    const chartData = forecast ? [...rows, ...forecast] : rows;

    const actuals = rows.map((r) => r.amount);
    const positive = actuals.filter((v) => v > 0);
    const average = positive.length ? positive.reduce((a, b) => a + b, 0) / positive.length : 0;
    const peakIdx = actuals.indexOf(Math.max(...actuals));
    const peak = peakIdx >= 0 ? rows[peakIdx] : null;

    return {
      chartData,
      average,
      hasForecast: Boolean(forecast),
      peak,
      last: rows[rows.length - 1],
    };
  }, [data]);

  const growPct =
    last && data[0]
      ? Number(data[0].amount || 0)
        ? ((last.amount - Number(data[0].amount || 0)) / Number(data[0].amount || 0)) * 100
        : null
      : null;

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-x-6 gap-y-2">
        <div className="flex flex-wrap items-center gap-4">
          <LegendChip color={ACTUAL_COLOR} label="ចំណូល (Actual)" />
          {hasForecast && <LegendChip color={PROJECTED_COLOR} dashed label="ការព្យាករណ៍ (Projected)" />}
        </div>
        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-[12px] text-slate-500 dark:text-slate-400">
          {average > 0 && (
            <span className="flex items-center gap-1.5">
              <TrendingUp className="h-3.5 w-3.5 text-emerald-500" />
              ជាមធ្យម {formatCompactCurrency(average)}
            </span>
          )}
          {peak && peak.amount > 0 && (
            <span className="flex items-center gap-1.5">
              <Award className="h-3.5 w-3.5 text-amber-500" />
              កំពូល {peak.label}: {formatCompactCurrency(peak.amount)}
            </span>
          )}
          {growPct != null && (
            <span
              className={`rounded-full px-2 py-0.5 font-semibold ${
                growPct >= 0
                  ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400'
                  : 'bg-red-50 text-red-600 dark:bg-red-500/10 dark:text-red-400'
              }`}
            >
              {growPct >= 0 ? '+' : ''}
              {growPct.toFixed(1)}%
            </span>
          )}
        </div>
      </div>

      <div style={{ height }} className="w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData} margin={{ top: 6, right: 4, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="revenueFill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={ACTUAL_COLOR} stopOpacity={0.28} />
                <stop offset="100%" stopColor={ACTUAL_COLOR} stopOpacity={0.02} />
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
            <Tooltip content={<TrendTooltip />} cursor={{ stroke: GRID_COLOR, strokeDasharray: '3 3' }} />
            {average > 0 && (
              <ReferenceLine
                y={average}
                stroke="#cbd5e1"
                strokeDasharray="4 4"
                label={{
                  value: 'ជាមធ្យម',
                  position: 'right',
                  fontSize: 10,
                  fill: '#94a3b8',
                }}
              />
            )}
            <Area
              type="monotone"
              dataKey="amount"
              name="ចំណូល"
              stroke={ACTUAL_COLOR}
              strokeWidth={2.5}
              fill="url(#revenueFill)"
              dot={{ r: 3, fill: ACTUAL_COLOR, strokeWidth: 0 }}
              activeDot={{ r: 5, fill: ACTUAL_COLOR, stroke: '#ffffff', strokeWidth: 2 }}
            />
            {hasForecast && (
              <Line
                type="monotone"
                dataKey="proj"
                name="ការព្យាករណ៍"
                connectNulls
                stroke={PROJECTED_COLOR}
                strokeWidth={2}
                strokeDasharray="5 4"
                dot={{ r: 2.5, fill: PROJECTED_COLOR, strokeWidth: 0 }}
                activeDot={{ r: 4.5, fill: PROJECTED_COLOR, stroke: '#ffffff', strokeWidth: 2 }}
              />
            )}
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default RevenueTrendChart;