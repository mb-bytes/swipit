import React, { useState } from 'react';
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip } from 'recharts';

export function MonoRoundedDonutChart({
  data = [],
  theme = 'light',
  compact = false,
  title = 'Top Categories',
  subtitle = 'Top 3 categories',
  className = '',
}) {
  const isDark = theme === 'dark';
  const [hoverIndex, setHoverIndex] = useState(null);

  const chartData = Array.isArray(data) ? data : [];
  const totalAmount = chartData.reduce((acc, item) => acc + (Number(item.amount) || Number(item.value) || 0), 0);

  return (
    <div
      className={`relative w-full rounded-[24px] transition-all duration-300 group flex flex-col justify-between overflow-hidden p-4 sm:p-5 ${
        isDark
          ? 'bg-[#181818] shadow-[inset_0_1px_0_rgba(255,255,255,0.04)] hover:bg-[#202020]'
          : 'bg-white shadow-[0_4px_20px_rgba(0,0,0,0.04)] border border-neutral-200/80 text-black hover:shadow-[0_6px_24px_rgba(0,0,0,0.06)]'
      } ${className}`}
    >
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
          <div className="text-xl font-bold tracking-tight tabular-nums mt-0.5 font-sans">
            ₹{totalAmount.toLocaleString('en-IN')} <span className="text-xs font-normal opacity-70">spend</span>
          </div>
        </div>
      </div>

      <div
        className={`relative w-full flex-1 min-h-[140px] rounded-[14px] overflow-hidden p-2 transition-colors duration-300 flex items-center justify-center touch-pan-y ${
          isDark ? 'bg-[#131313]' : 'bg-[#f4f4f6]'
        }`}
      >
        {chartData.length === 0 ? (
          <span className="text-xs text-neutral-400 font-medium">No category data</span>
        ) : (
          <>
            <ResponsiveContainer width="100%" height="100%" minHeight={130}>
              <PieChart>
                <Tooltip
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const item = payload[0].payload;
                      return (
                        <div className="rounded-lg bg-black/90 px-3 py-2 text-xs text-white shadow-xl border border-white/10">
                          <p className="font-semibold text-white">{item.name}</p>
                          <p className="text-emerald-400 font-mono font-medium">
                            {item.amount ? `₹${Number(item.amount).toLocaleString('en-IN')}` : `${item.value}%`}
                          </p>
                          <p className="text-neutral-400 text-[10px] mt-0.5">{item.value}% of category spend</p>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Pie
                  data={chartData}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  innerRadius={compact ? 36 : 42}
                  outerRadius={compact ? 54 : 62}
                  paddingAngle={6}
                  cornerRadius={8}
                  strokeLinecap="round"
                  onMouseEnter={(_, idx) => setHoverIndex(idx)}
                  onMouseLeave={() => setHoverIndex(null)}
                  animationDuration={900}
                >
                  {chartData.map((_, index) => {
                    const isHovered = hoverIndex === index;
                    const fillColor = isDark
                      ? index === 0
                        ? '#FFFFFF'
                        : index === 1
                        ? 'rgba(255,255,255,0.75)'
                        : index === 2
                        ? 'rgba(255,255,255,0.5)'
                        : 'rgba(255,255,255,0.25)'
                      : index === 0
                      ? '#09090B'
                      : index === 1
                      ? 'rgba(9,9,11,0.75)'
                      : index === 2
                      ? 'rgba(9,9,11,0.5)'
                      : 'rgba(9,9,11,0.25)';

                    return (
                      <Cell
                        key={`mono-cell-${index}`}
                        fill={fillColor}
                        stroke={isDark ? '#181818' : '#FFFFFF'}
                        strokeWidth={2}
                        style={{
                          transform: isHovered ? 'scale(1.05)' : 'scale(1)',
                          transformOrigin: 'center center',
                          transition: 'transform 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
                          cursor: 'pointer',
                        }}
                      />
                    );
                  })}
                </Pie>
              </PieChart>
            </ResponsiveContainer>

            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <span className="text-sm font-bold tabular-nums font-sans text-neutral-900 dark:text-white">
                {hoverIndex !== null ? `${chartData[hoverIndex]?.value}%` : `${chartData.length} Cats`}
              </span>
              <span className={`text-[10px] truncate max-w-[80px] text-center ${isDark ? 'text-neutral-400' : 'text-neutral-500'}`}>
                {hoverIndex !== null ? chartData[hoverIndex]?.name : 'Categories'}
              </span>
            </div>
          </>
        )}
      </div>

      <div className="flex items-center justify-around mt-3 pt-1 border-t border-black/5 dark:border-white/5 text-[10px] shrink-0">
        {chartData.length === 0 ? (
          <span className="text-neutral-400">0 categories</span>
        ) : (
          chartData.slice(0, 4).map((seg, idx) => (
            <div key={idx} className="flex items-center gap-1 min-w-0">
              <span
                className={`w-1.5 h-1.5 rounded-full shrink-0 ${
                  idx === 0
                    ? 'bg-neutral-900 dark:bg-white'
                    : idx === 1
                    ? 'bg-neutral-600 dark:bg-white/70'
                    : idx === 2
                    ? 'bg-neutral-400 dark:bg-white/40'
                    : 'bg-neutral-300 dark:bg-white/20'
                }`}
              />
              <span className={`truncate max-w-[70px] ${isDark ? 'text-neutral-400' : 'text-neutral-600'}`}>
                {seg.name}
              </span>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default MonoRoundedDonutChart;
