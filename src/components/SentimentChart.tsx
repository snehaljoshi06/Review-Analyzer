import { useState } from 'react';
import { Sentiment, SentimentCounts } from '../types/review';

interface SentimentChartProps {
  stats: SentimentCounts;
  hasResults: boolean;
  isLoading: boolean;
  activeSentiment: Sentiment | 'All';
  onSelectSentiment: (sentiment: Sentiment | 'All') => void;
}

interface SegmentConfig {
  key: Sentiment;
  label: string;
  count: number;
  pct: number;
  color: string;
  hoverColor: string;
  barBg: string;
}

export function SentimentChart({
  stats,
  hasResults,
  isLoading,
  activeSentiment,
  onSelectSentiment,
}: SentimentChartProps) {
  const [hoveredKey, setHoveredKey] = useState<Sentiment | null>(null);

  const segments: SegmentConfig[] = [
    {
      key: 'Positive',
      label: 'Positive',
      count: stats.positive,
      pct: stats.positivePct,
      color: '#16A34A',
      hoverColor: '#15803D',
      barBg: 'bg-emerald-600',
    },
    {
      key: 'Neutral',
      label: 'Neutral',
      count: stats.neutral,
      pct: stats.neutralPct,
      color: '#D97706',
      hoverColor: '#B45309',
      barBg: 'bg-amber-600',
    },
    {
      key: 'Negative',
      label: 'Negative',
      count: stats.negative,
      pct: stats.negativePct,
      color: '#DC2626',
      hoverColor: '#B91C1C',
      barBg: 'bg-red-600',
    },
  ];

  const radius = 64;
  const strokeWidth = 22;
  const circumference = 2 * Math.PI * radius;

  let cumulativeFraction = 0;

  const focusedSegment =
    segments.find((s) => s.key === hoveredKey) ??
    (activeSentiment !== 'All' ? segments.find((s) => s.key === activeSentiment) : undefined);

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs flex flex-col justify-between h-full">
      <div className="flex items-start justify-between gap-4 pb-4 border-b border-slate-100">
        <div>
          <h3 className="text-base font-semibold text-[#0B1936]">Sentiment Distribution</h3>
          <p className="mt-0.5 text-xs text-slate-500">
            Click a segment or row to filter reviews below
          </p>
        </div>
        {activeSentiment !== 'All' && (
          <button
            type="button"
            onClick={() => onSelectSentiment('All')}
            className="text-xs font-medium text-[#2563EB] hover:text-[#1D4ED8] underline underline-offset-2 whitespace-nowrap shrink-0 cursor-pointer"
          >
            Clear filter
          </button>
        )}
      </div>

      {isLoading ? (
        <div className="py-10 flex flex-col items-center justify-center gap-4">
          <div className="w-40 h-40 rounded-full border-[18px] border-slate-100 animate-pulse" />
          <div className="w-full space-y-2.5 mt-2">
            <div className="h-4 bg-slate-100 rounded animate-pulse" />
            <div className="h-4 bg-slate-100 rounded animate-pulse" />
            <div className="h-4 bg-slate-100 rounded animate-pulse" />
          </div>
        </div>
      ) : !hasResults ? (
        <div className="py-12 flex flex-col items-center justify-center text-center">
          <div className="w-36 h-36 rounded-full border-[16px] border-slate-100 flex items-center justify-center">
            <span className="text-xs font-medium text-slate-400">No Data</span>
          </div>
          <p className="mt-4 text-sm text-slate-500 max-w-xs">
            Analyze submitted reviews or load the demo dataset to view live sentiment proportions.
          </p>
        </div>
      ) : (
        <div className="pt-5 flex flex-col sm:flex-row lg:flex-col xl:flex-row items-center gap-6 my-auto">
          <div className="relative w-44 h-44 shrink-0 flex items-center justify-center">
            <svg
              viewBox="0 0 180 180"
              className="w-full h-full -rotate-90"
              role="img"
              aria-label={`Sentiment distribution: ${stats.positivePct}% positive, ${stats.neutralPct}% neutral, ${stats.negativePct}% negative`}
            >
              <circle
                cx="90"
                cy="90"
                r={radius}
                fill="none"
                stroke="#F1F5F9"
                strokeWidth={strokeWidth}
              />
              {segments.map((seg) => {
                if (seg.count === 0) return null;
                const fraction = seg.count / stats.total;
                const dashLength = Math.max(0, fraction * circumference - (stats.total > 1 ? 2 : 0));
                const dashOffset = -cumulativeFraction * circumference;
                cumulativeFraction += fraction;

                const isHighlighted =
                  hoveredKey === seg.key || activeSentiment === seg.key;
                const isDimmed =
                  (hoveredKey !== null && hoveredKey !== seg.key) ||
                  (hoveredKey === null && activeSentiment !== 'All' && activeSentiment !== seg.key);

                return (
                  <circle
                    key={seg.key}
                    cx="90"
                    cy="90"
                    r={radius}
                    fill="none"
                    stroke={isHighlighted ? seg.hoverColor : seg.color}
                    strokeWidth={isHighlighted ? strokeWidth + 3 : strokeWidth}
                    strokeDasharray={`${dashLength} ${circumference}`}
                    strokeDashoffset={dashOffset}
                    opacity={isDimmed ? 0.35 : 1}
                    className="transition-all duration-150 cursor-pointer"
                    onMouseEnter={() => setHoveredKey(seg.key)}
                    onMouseLeave={() => setHoveredKey(null)}
                    onClick={() =>
                      onSelectSentiment(activeSentiment === seg.key ? 'All' : seg.key)
                    }
                  />
                );
              })}
            </svg>

            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none text-center px-4">
              <span className="text-2xl font-bold text-[#0B1936] font-display tabular-nums">
                {focusedSegment ? `${focusedSegment.pct}%` : stats.total}
              </span>
              <span className="text-xs font-medium text-slate-500">
                {focusedSegment ? focusedSegment.label : 'Reviews'}
              </span>
            </div>
          </div>

          <div className="w-full space-y-3">
            {segments.map((seg) => {
              const isSelected = activeSentiment === seg.key;
              return (
                <button
                  key={seg.key}
                  type="button"
                  onMouseEnter={() => setHoveredKey(seg.key)}
                  onMouseLeave={() => setHoveredKey(null)}
                  onClick={() =>
                    onSelectSentiment(isSelected ? 'All' : seg.key)
                  }
                  className={`w-full text-left p-2.5 rounded-lg border transition-colors cursor-pointer ${
                    isSelected
                      ? 'border-[#2563EB] bg-blue-50/50'
                      : 'border-slate-100 hover:border-slate-200 hover:bg-slate-50/70'
                  }`}
                >
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-medium text-[#0B1936] flex items-center gap-2">
                      <span
                        className={`w-2.5 h-2.5 rounded-xs ${seg.barBg} shrink-0`}
                        aria-hidden="true"
                      />
                      {seg.label}
                    </span>
                    <span className="font-mono text-xs text-slate-600 tabular-nums">
                      {seg.count} ({seg.pct}%)
                    </span>
                  </div>
                  <div className="mt-2 h-1.5 w-full rounded-full bg-slate-100 overflow-hidden">
                    <div
                      className={`h-full rounded-full ${seg.barBg} transition-all duration-300`}
                      style={{ width: `${seg.pct}%` }}
                    />
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
