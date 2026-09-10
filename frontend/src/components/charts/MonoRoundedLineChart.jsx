import React, { useState } from 'react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from 'recharts';

export function MonoRoundedLineChart({
  data = [],
  theme = 'light',
  compact = false,
  title = 'Spend Dynamics',
  subtitle = 'Monthly Spend',
  badgeText = 'Spline',
  currencyPrefix = '₹',
  className = '',
}) {
  const isDark = theme === 'dark';
  const chartData = Array.isArray(data) ? data : [];
  const hasSecondary = chartData.some((d) => d.secondary !== undefined);
  const [activeSeries, setActiveSeries] = useState(hasSecondary ? 'all' : 'value');

  const totalVal = chartData.reduce((sum, d) => sum + (Number(d.value) || 0), 0);
  const peakVal = chartData.reduce((max, d) => Math.max(max, Number(d.value) || 0), 0);

  const formatAmount = (num) => {
    if (num >= 100000) return `${currencyPrefix}${(num / 100000).toFixed(1)}L`;
    if (num >= 1000) return `${currencyPrefix}${(num / 1000).toFixed(1)}k`;
    return `${currencyPrefix}${num.toLocaleString('en-IN')}`;
  };

  return (
    <div
      className={`relative w-full rounded-[24px] transition-all duration-300 group flex flex-col justify-between overflow-hidden p-4 sm:p-5 ${
        isDark
          ? 'bg-[#181818] shadow-[inset_0_1px_0_rgba(255,255,255,0.04)] hover:bg-[#202020]'
          : 'bg-white shadow-[0_4px_20px_rgba(0,0,0,0.04)] border border-neutral-200/80 text-black hover:shadow-[0_6px_24px_rgba(0,0,0,0.06)]'
      } ${className}`}
    >
      <div className="flex items-center justify-between mb-2 shrink-0">
        <div>
          <div className="flex items-center gap-2">
            <span
              className={`text-xs font-semibold tracking-wider uppercase ${
                isDark ? 'text-neutral-400' : 'text-neutral-500'
              }`}
            >
              {title}
            </span>
            <span
              className={`inline-flex items-center px-1.5 py-0.5 rounded-full text-[10px] font-mono ${
                isDark
                  ? 'bg-white/10 text-white border border-white/20'
                  : 'bg-neutral-100 text-neutral-700 border border-neutral-200'
              }`}
            >
              {badgeText}
            </span>
          </div>
          <div className="text-xl font-bold tracking-tight tabular-nums mt-0.5 font-sans flex items-baseline gap-1.5">
            <span>₹{totalVal.toLocaleString('en-IN')}</span>
            <span className={`text-xs font-normal ${isDark ? 'text-neutral-400' : 'text-neutral-500'}`}>
              {subtitle}
            </span>
          </div>
        </div>

        {hasSecondary && (
          <div
            className={`p-0.5 rounded-full border flex items-center gap-0.5 ${
              isDark ? 'bg-white/5 border-white/10' : 'bg-neutral-100 border-neutral-200'
            }`}
          >
            {['all', 'value'].map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => setActiveSeries(s)}
                className={`px-2.5 py-0.5 rounded-full text-[11px] font-medium capitalize transition-all cursor-pointer ${
                  activeSeries === s
                    ? isDark
                      ? 'bg-white text-black font-semibold shadow-xs'
                      : 'bg-black text-white font-semibold shadow-xs'
                    : isDark
                    ? 'text-neutral-400 hover:text-white'
                    : 'text-neutral-600 hover:text-black'
                }`}
              >
                {s === 'all' ? 'Dual' : 'Single'}
              </button>
            ))}
          </div>
        )}
      </div>

      <div
        className={`relative w-full flex-1 min-h-[180px] rounded-[14px] overflow-hidden p-2 transition-colors duration-300 touch-pan-y ${
          isDark ? 'bg-[#131313]' : 'bg-[#f4f4f6]'
        }`}
      >
        <ResponsiveContainer width="100%" height="100%" minHeight={160}>
          <LineChart data={chartData} margin={{ top: 12, right: 14, left: -20, bottom: 0 }}>
            <CartesianGrid
              strokeDasharray="3 3"
              vertical={false}
              stroke={isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.06)'}
            />
            <XAxis
              dataKey="label"
              tickLine={false}
              axisLine={false}
              tick={{ fontSize: 10, fill: isDark ? '#71717A' : '#71717A' }}
            />
            <YAxis
              tickLine={false}
              axisLine={false}
              tickFormatter={formatAmount}
              tick={{ fontSize: 10, fill: isDark ? '#71717A' : '#71717A' }}
            />
            <Tooltip
              content={({ active, payload, label }) => {
                if (active && payload && payload.length) {
                  return (
                    <div className="rounded-lg bg-black/90 px-3 py-2 text-xs text-white shadow-xl border border-white/10">
                      <p className="font-semibold mb-1 text-neutral-300">{label}</p>
                      {payload.map((entry, idx) => (
                        <p key={idx} className="text-neutral-400 flex items-center justify-between gap-3">
                          <span>{entry.name || 'Spend'}:</span>
                          <span className="text-white font-mono font-bold">
                            ₹{(Number(entry.value) || 0).toLocaleString('en-IN')}
                          </span>
                        </p>
                      ))}
                    </div>
                  );
                }
                return null;
              }}
            />

            {activeSeries === 'all' && hasSecondary && (
              <Line
                type="monotone"
                dataKey="secondary"
                name="Baseline"
                stroke={isDark ? '#52525B' : '#A1A1AA'}
                strokeWidth={2}
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeDasharray="4 4"
                dot={false}
                animationDuration={900}
              />
            )}

            <Line
              type="monotone"
              dataKey="value"
              name="Spend"
              stroke={isDark ? '#FFFFFF' : '#09090B'}
              strokeWidth={3}
              strokeLinecap="round"
              strokeLinejoin="round"
              dot={{
                r: 3.5,
                fill: isDark ? '#FFFFFF' : '#09090B',
                stroke: isDark ? '#181818' : '#FFFFFF',
                strokeWidth: 2,
              }}
              activeDot={{
                r: 5.5,
                fill: isDark ? '#FFFFFF' : '#09090B',
                stroke: isDark ? '#A1A1AA' : '#52525B',
                strokeWidth: 2,
              }}
              animationDuration={800}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div className="flex items-center justify-between mt-3 pt-1 border-t border-black/5 dark:border-white/5 text-[11px] font-mono shrink-0">
        <span className={isDark ? 'text-neutral-400' : 'text-neutral-600'}>
          {chartData.length} Data Points
        </span>
        <span className={isDark ? 'text-white font-medium' : 'text-black font-medium'}>
          Peak: ₹{peakVal.toLocaleString('en-IN')}
        </span>
      </div>
    </div>
  );
}

export default MonoRoundedLineChart;