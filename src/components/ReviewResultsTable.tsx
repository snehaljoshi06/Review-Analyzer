import {
  AlertTriangle,
  CheckCircle2,
  Download,
  MinusCircle,
  Search,
  X,
} from 'lucide-react';
import { AnalyzedReview, Sentiment } from '../types/review';

interface ReviewResultsTableProps {
  reviews: AnalyzedReview[];
  isLoading: boolean;
  hasResults: boolean;
  isDemoData: boolean;
  searchQuery: string;
  onSearchChange: (q: string) => void;
  activeSentiment: Sentiment | 'All';
  onSentimentChange: (s: Sentiment | 'All') => void;
  activeTheme: string | null;
  onThemeChange: (t: string | null) => void;
  onExportCsv: () => void;
  onLoadDemo: () => void;
}

const SENTIMENT_FILTERS: Array<Sentiment | 'All'> = [
  'All',
  'Positive',
  'Neutral',
  'Negative',
];

export function ReviewResultsTable({
  reviews,
  isLoading,
  hasResults,
  isDemoData,
  searchQuery,
  onSearchChange,
  activeSentiment,
  onSentimentChange,
  activeTheme,
  onThemeChange,
  onExportCsv,
  onLoadDemo,
}: ReviewResultsTableProps) {
  const normalizedQuery = searchQuery.trim().toLowerCase();

  const filteredReviews = reviews.filter((review) => {
    if (activeSentiment !== 'All' && review.sentiment !== activeSentiment) {
      return false;
    }
    if (activeTheme && !review.themes.includes(activeTheme)) {
      return false;
    }
    if (normalizedQuery) {
      const hay = `${review.text} ${review.keyPhrase} ${review.themes.join(' ')}`.toLowerCase();
      if (!hay.includes(normalizedQuery)) return false;
    }
    return true;
  });

  return (
    <section
      id="results"
      aria-labelledby="results-heading"
      className="bg-white border border-slate-200 rounded-xl shadow-xs overflow-hidden"
    >
      <div className="p-6 border-b border-slate-100 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <div className="flex flex-wrap items-baseline gap-2.5">
            <h2 id="results-heading" className="text-lg font-semibold text-[#0B1936]">
              Classified Reviews
            </h2>
            {hasResults && (
              <span className="text-xs font-mono text-slate-500 tabular-nums">
                {filteredReviews.length} of {reviews.length} shown
                {isDemoData ? ' · Demo Dataset' : ''}
              </span>
            )}
          </div>
          <p className="mt-1 text-sm text-slate-600">
            Individual sentiment classification, identified feedback themes, and key takeaways.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3 shrink-0">
          <button
            type="button"
            onClick={onExportCsv}
            disabled={!hasResults || isLoading}
            className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-[#0B1936] bg-white border border-slate-200 rounded-lg hover:bg-slate-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#2563EB] transition-colors disabled:opacity-40 whitespace-nowrap shrink-0 cursor-pointer"
          >
            <Download className="w-4 h-4 text-[#2563EB]" aria-hidden="true" />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {hasResults && (
        <div className="px-6 py-3.5 bg-slate-50/70 border-b border-slate-100 flex flex-col md:flex-row md:items-center md:justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2">
            <div
              className="inline-flex items-center gap-1 p-1 bg-slate-200/70 rounded-lg"
              role="group"
              aria-label="Filter by sentiment"
            >
              {SENTIMENT_FILTERS.map((option) => {
                const active = activeSentiment === option;
                return (
                  <button
                    key={option}
                    type="button"
                    onClick={() => onSentimentChange(option)}
                    className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                      active
                        ? 'bg-white text-[#0B1936] shadow-xs'
                        : 'text-slate-600 hover:text-[#0B1936]'
                    }`}
                  >
                    {option}
                  </button>
                );
              })}
            </div>

            {activeTheme && (
              <button
                type="button"
                onClick={() => onThemeChange(null)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-[#2563EB] bg-blue-50 border border-blue-200 rounded-md hover:bg-blue-100 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
              >
                <span>Theme: {activeTheme}</span>
                <X className="w-3.5 h-3.5" aria-hidden="true" />
              </button>
            )}
          </div>

          <div className="relative w-full md:w-72">
            <Search
              className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none"
              aria-hidden="true"
            />
            <input
              type="search"
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Search review text or theme..."
              aria-label="Search analyzed reviews"
              className="w-full pl-9 pr-3 py-1.5 text-sm bg-white border border-slate-200 rounded-lg text-[#0B1936] placeholder:text-slate-400 focus:border-[#2563EB] focus:ring-2 focus:ring-[#2563EB]/20 focus:outline-none"
            />
          </div>
        </div>
      )}

      {isLoading ? (
        <div className="divide-y divide-slate-100">
          {[1, 2, 3, 4].map((row) => (
            <div key={row} className="px-6 py-4 flex items-center gap-4">
              <div className="h-4 w-8 bg-slate-100 rounded animate-pulse shrink-0" />
              <div className="flex-1 space-y-2">
                <div className="h-4 w-3/4 bg-slate-100 rounded animate-pulse" />
                <div className="h-3 w-1/3 bg-slate-100 rounded animate-pulse" />
              </div>
              <div className="h-5 w-20 bg-slate-100 rounded animate-pulse shrink-0" />
            </div>
          ))}
        </div>
      ) : !hasResults ? (
        <div className="px-6 py-14 text-center">
          <h3 className="text-base font-semibold text-[#0B1936]">
            No analyzed reviews yet
          </h3>
          <p className="mt-1.5 text-sm text-slate-500 max-w-md mx-auto">
            Paste customer feedback in the Review Analyzer above and click Analyze Reviews, or load the 12 sample reviews to explore a complete demonstration.
          </p>
          <button
            type="button"
            onClick={onLoadDemo}
            className="mt-5 inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-[#2563EB] hover:bg-[#1D4ED8] rounded-lg transition-colors cursor-pointer"
          >
            Load Demo Reviews
          </button>
        </div>
      ) : filteredReviews.length === 0 ? (
        <div className="px-6 py-12 text-center">
          <p className="text-sm font-medium text-[#0B1936]">
            No reviews match your current filters.
          </p>
          <button
            type="button"
            onClick={() => {
              onSearchChange('');
              onSentimentChange('All');
              onThemeChange(null);
            }}
            className="mt-3 text-xs font-medium text-[#2563EB] hover:text-[#1D4ED8] underline underline-offset-2 cursor-pointer"
          >
            Reset all filters
          </button>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50/50 text-xs font-semibold text-slate-500">
                <th scope="col" className="py-3 pl-6 pr-3 w-14 font-mono">
                  #
                </th>
                <th scope="col" className="py-3 px-3">
                  Customer Review & Key Takeaway
                </th>
                <th scope="col" className="py-3 px-3 w-48">
                  Identified Themes
                </th>
                <th scope="col" className="py-3 pl-3 pr-6 w-36 text-right">
                  Sentiment
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm">
              {filteredReviews.map((review) => (
                <tr
                  key={review.index}
                  className="hover:bg-slate-50/70 transition-colors align-top"
                >
                  <td className="py-4 pl-6 pr-3 font-mono text-xs text-slate-400 tabular-nums">
                    {String(review.index).padStart(2, '0')}
                  </td>
                  <td className="py-4 px-3">
                    <p className="text-[#0B1936] leading-relaxed">{review.text}</p>
                    <p className="mt-1.5 text-xs text-slate-500">
                      Takeaway: <span className="text-slate-700">{review.keyPhrase}</span>
                    </p>
                  </td>
                  <td className="py-4 px-3 text-xs text-slate-600">
                    <div className="flex flex-wrap items-center gap-x-1.5 gap-y-1">
                      {review.themes.map((theme, idx) => (
                        <span key={theme} className="inline-flex items-center gap-1.5">
                          {idx > 0 && (
                            <span className="text-slate-300" aria-hidden="true">
                              ·
                            </span>
                          )}
                          <button
                            type="button"
                            onClick={() =>
                              onThemeChange(activeTheme === theme ? null : theme)
                            }
                            className={`text-left hover:text-[#2563EB] transition-colors cursor-pointer ${
                              activeTheme === theme
                                ? 'font-semibold text-[#2563EB] underline underline-offset-2'
                                : 'text-slate-700'
                            }`}
                          >
                            {theme}
                          </button>
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className="py-4 pl-3 pr-6 text-right whitespace-nowrap">
                    <SentimentTextLabel sentiment={review.sentiment} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}

function SentimentTextLabel({ sentiment }: { sentiment: Sentiment }) {
  if (sentiment === 'Positive') {
    return (
      <span className="inline-flex items-center justify-end gap-1.5 font-medium text-emerald-700">
        <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" aria-hidden="true" />
        <span>Positive</span>
      </span>
    );
  }
  if (sentiment === 'Negative') {
    return (
      <span className="inline-flex items-center justify-end gap-1.5 font-medium text-red-700">
        <AlertTriangle className="w-4 h-4 text-red-600 shrink-0" aria-hidden="true" />
        <span>Negative</span>
      </span>
    );
  }
  return (
    <span className="inline-flex items-center justify-end gap-1.5 font-medium text-amber-700">
      <MinusCircle className="w-4 h-4 text-amber-600 shrink-0" aria-hidden="true" />
      <span>Neutral</span>
    </span>
  );
}
