import React from 'react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Cell,
} from 'recharts';

export function MonoRoundedFunnelChart({
  data = [],
  theme = 'light',
  compact = false,
  title = 'Top 5 Merchants',
  subtitle = 'by spends',
  className = '',
}) {
  const isDark = theme === 'dark';
  const chartData = Array.isArray(data) ? data : [];
  const totalVolume = chartData.reduce((acc, item) => acc + (Number(item.volume) || 0), 0);
  const topItem = chartData[0] || { stage: 'None', volume: 0 };
  const topPercentage = totalVolume > 0 ? Math.round((topItem.volume / totalVolume) * 100) : 0;

  return (
    <div
      className={`relative w-full rounded-[24px] transition-all duration-300 group flex flex-col justify-between overflow-hidden p-4 sm:p-5 ${
        isDark
          ? 'bg-[#181818] shadow-[inset_0_1px_0_rgba(255,255,255,0.04)] hover:bg-[#202020]'
          : 'bg-white shadow-[0_4px_20px_rgba(0,0,0,0.04)] border border-neutral-200/80 text-black hover:shadow-[0_6px_24px_rgba(0,0,0,0.06)]'
      } ${className}`}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-1 shrink-0">
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
              {subtitle}
            </span>
          </div>
          <div className="text-xl font-bold tracking-tight tabular-nums mt-0.5 font-sans flex items-baseline gap-1.5">
            <span>₹{topItem.volume.toLocaleString('en-IN')}</span>
            <span className={`text-xs font-normal ${isDark ? 'text-neutral-400' : 'text-neutral-500'}`}>
              {chartData.length > 0 ? `top (${topItem.stage} • ${topPercentage}%)` : 'top spend'}
            </span>
          </div>
        </div>
      </div>

      {/* Main Stage */}
      <div
        className={`relative w-full flex-1 min-h-[140px] rounded-[14px] overflow-hidden p-2 transition-colors duration-300 flex items-center justify-center ${
          isDark ? 'bg-[#131313]' : 'bg-[#f4f4f6]'
        }`}
      >
        {chartData.length === 0 ? (
          <span className="text-xs text-neutral-400 font-medium">No merchant data</span>
        ) : (
          <ResponsiveContainer width="100%" height="100%" minHeight={130}>
            <BarChart
              data={chartData}
              layout="vertical"
              margin={{ top: 8, right: 16, left: 10, bottom: 0 }}
            >
              <XAxis type="number" hide domain={[0, 'dataMax']} />
              <YAxis
                dataKey="stage"
                type="category"
                tickLine={false}
                axisLine={false}
                tick={{
                  fontSize: 11,
                  fill: isDark ? '#A1A1AA' : '#3F3F46',
                  fontWeight: 500,
                }}
                width={75}
              />
              <Tooltip
                cursor={{ fill: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.04)' }}
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    const item = payload[0].payload;
                    return (
                      <div className="rounded-lg bg-black/90 px-3 py-2 text-xs text-white shadow-xl border border-white/10">
                        <p className="font-semibold text-white">{item.stage}</p>
                        <p className="font-mono font-medium text-emerald-400 mt-0.5">
                          ₹{(item.volume ?? 0).toLocaleString('en-IN')}
                        </p>
                        {item.count && (
                          <p className="text-[10px] text-neutral-400 mt-0.5">
                            {item.count} transaction{item.count > 1 ? 's' : ''}
                          </p>
                        )}
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Bar
                dataKey="volume"
                name="Spend"
                radius={[0, 8, 8, 0]}
                barSize={14}
                animationDuration={800}
              >
                {chartData.map((_, index) => {
                  const fill = isDark
                    ? index === 0
                      ? '#FFFFFF'
                      : index === 1
                      ? 'rgba(255,255,255,0.8)'
                      : index === 2
                      ? 'rgba(255,255,255,0.6)'
                      : index === 3
                      ? 'rgba(255,255,255,0.4)'
                      : 'rgba(255,255,255,0.25)'
                    : index === 0
                    ? '#09090B'
                    : index === 1
                    ? 'rgba(9,9,11,0.8)'
                    : index === 2
                    ? 'rgba(9,9,11,0.6)'
                    : index === 3
                    ? 'rgba(9,9,11,0.4)'
                    : 'rgba(9,9,11,0.25)';

                  return <Cell key={`bar-${index}`} fill={fill} />;
                })}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between mt-3 pt-1 border-t border-black/5 dark:border-white/5 text-[11px] font-mono shrink-0">
        <span className={isDark ? 'text-neutral-400' : 'text-neutral-600'}>
          Total: ₹{totalVolume.toLocaleString('en-IN')}
        </span>
        <span className={isDark ? 'text-white font-medium' : 'text-black font-medium'}>
          {chartData.length} Merchants
        </span>
      </div>
    </div>
  );
}

export default MonoRoundedFunnelChart;