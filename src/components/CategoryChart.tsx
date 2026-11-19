import { useState } from 'react';
import { CategoryStat } from '../types/review';

interface CategoryChartProps {
  categories: CategoryStat[];
  hasResults: boolean;
  isLoading: boolean;
  activeTheme: string | null;
  onSelectTheme: (theme: string | null) => void;
}

export function CategoryChart({
  categories,
  hasResults,
  isLoading,
  activeTheme,
  onSelectTheme,
}: CategoryChartProps) {
  const [hoveredTheme, setHoveredTheme] = useState<string | null>(null);

  const maxTotal = categories.reduce((max, c) => Math.max(max, c.total), 1);
  const inspected = categories.find((c) => c.theme === (hoveredTheme ?? activeTheme));

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs flex flex-col justify-between h-full">
      <div className="flex flex-wrap items-start justify-between gap-4 pb-4 border-b border-slate-100">
        <div>
          <h3 className="text-base font-semibold text-[#0B1936]">
            Category & Theme Analysis
          </h3>
          <p className="mt-0.5 text-xs text-slate-500">
            Mention volume and sentiment split across identified themes
          </p>
        </div>

        <div className="flex items-center gap-4 text-xs text-slate-600 shrink-0">
          <span className="inline-flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-xs bg-emerald-600" aria-hidden="true" />
            Positive
          </span>
          <span className="inline-flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-xs bg-amber-500" aria-hidden="true" />
            Neutral
          </span>
          <span className="inline-flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-xs bg-red-600" aria-hidden="true" />
            Negative
          </span>
        </div>
      </div>

      {isLoading ? (
        <div className="py-8 space-y-4">
          {[1, 2, 3, 4, 5].map((row) => (
            <div key={row} className="space-y-1.5">
              <div className="flex justify-between">
                <div className="h-3.5 w-28 bg-slate-100 rounded animate-pulse" />
                <div className="h-3.5 w-10 bg-slate-100 rounded animate-pulse" />
              </div>
              <div className="h-3 w-full bg-slate-100 rounded animate-pulse" />
            </div>
          ))}
        </div>
      ) : !hasResults || categories.length === 0 ? (
        <div className="py-12 flex flex-col items-center justify-center text-center my-auto">
          <div className="w-full max-w-sm space-y-3 opacity-50" aria-hidden="true">
            <div className="h-2.5 w-3/4 rounded bg-slate-200" />
            <div className="h-2.5 w-1/2 rounded bg-slate-200" />
            <div className="h-2.5 w-5/6 rounded bg-slate-200" />
            <div className="h-2.5 w-2/3 rounded bg-slate-200" />
          </div>
          <p className="mt-5 text-sm text-slate-500 max-w-sm">
            Themes such as Product Quality, Pricing, Delivery, Customer Service, and Packaging will appear here after analysis.
          </p>
        </div>
      ) : (
        <div className="pt-5 flex flex-col justify-between flex-1 gap-4">
          <div className="space-y-3">
            {categories.map((cat) => {
              const isSelected = activeTheme === cat.theme;
              const isHovered = hoveredTheme === cat.theme;
              const barWidthPct = Math.max(8, Math.round((cat.total / maxTotal) * 100));
              const posPct = (cat.positive / cat.total) * 100;
              const neuPct = (cat.neutral / cat.total) * 100;
              const negPct = (cat.negative / cat.total) * 100;

              return (
                <button
                  key={cat.theme}
                  type="button"
                  onMouseEnter={() => setHoveredTheme(cat.theme)}
                  onMouseLeave={() => setHoveredTheme(null)}
                  onClick={() => onSelectTheme(isSelected ? null : cat.theme)}
                  className={`w-full text-left rounded-lg px-3 py-2.5 border transition-colors cursor-pointer ${
                    isSelected
                      ? 'border-[#2563EB] bg-blue-50/50'
                      : isHovered
                      ? 'border-slate-200 bg-slate-50/80'
                      : 'border-transparent hover:bg-slate-50/60'
                  }`}
                >
                  <div className="flex items-center justify-between gap-4 text-sm">
                    <span className="font-medium text-[#0B1936] truncate">
                      {cat.theme}
                    </span>
                    <span className="text-xs font-mono text-slate-600 tabular-nums shrink-0">
                      {cat.total} {cat.total === 1 ? 'mention' : 'mentions'}
                    </span>
                  </div>

                  <div className="mt-2 h-2.5 w-full rounded-full bg-slate-100 overflow-hidden">
                    <div
                      className="h-full flex rounded-full overflow-hidden transition-all duration-300"
                      style={{ width: `${barWidthPct}%` }}
                    >
                      {cat.positive > 0 && (
                        <div
                          className="h-full bg-emerald-600"
                          style={{ width: `${posPct}%` }}
                        />
                      )}
                      {cat.neutral > 0 && (
                        <div
                          className="h-full bg-amber-500"
                          style={{ width: `${neuPct}%` }}
                        />
                      )}
                      {cat.negative > 0 && (
                        <div
                          className="h-full bg-red-600"
                          style={{ width: `${negPct}%` }}
                        />
                      )}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>

          <div className="pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2 text-xs text-slate-600 min-h-[28px]">
            {inspected ? (
              <div className="flex flex-wrap items-center gap-2 font-mono tabular-nums">
                <span className="font-sans font-semibold text-[#0B1936]">
                  {inspected.theme}:
                </span>
                <span className="text-emerald-700">{inspected.positive} positive</span>
                <span aria-hidden="true">·</span>
                <span className="text-amber-700">{inspected.neutral} neutral</span>
                <span aria-hidden="true">·</span>
                <span className="text-red-700">{inspected.negative} negative</span>
              </div>
            ) : (
              <span>Click any theme bar to filter the review table below.</span>
            )}

            {activeTheme && (
              <button
                type="button"
                onClick={() => onSelectTheme(null)}
                className="font-medium text-[#2563EB] hover:text-[#1D4ED8] underline underline-offset-2 whitespace-nowrap cursor-pointer"
              >
                Reset theme filter
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
