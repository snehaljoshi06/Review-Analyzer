import { AlertCircle, Database, Loader2, RotateCcw, Sparkles } from 'lucide-react';

interface ReviewAnalyzerProps {
  rawInput: string;
  onInputChange: (value: string) => void;
  onAnalyze: () => void;
  onLoadDemo: () => void;
  onClear: () => void;
  isLoading: boolean;
  error: string | null;
  validationError: string | null;
  isDemoInput: boolean;
  reviewCount: number;
}

export function ReviewAnalyzer({
  rawInput,
  onInputChange,
  onAnalyze,
  onLoadDemo,
  onClear,
  isLoading,
  error,
  validationError,
  isDemoInput,
  reviewCount,
}: ReviewAnalyzerProps) {
  return (
    <section
      id="analyzer"
      aria-labelledby="analyzer-heading"
      className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs"
    >
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 pb-5 border-b border-slate-100">
        <div>
          <h2 id="analyzer-heading" className="text-lg font-semibold text-[#0B1936]">
            Review Analyzer
          </h2>
          <p className="mt-1 text-sm text-slate-600">
            Paste customer reviews below—one review per line—to classify sentiment, extract themes, and surface improvements.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5 shrink-0">
          <button
            type="button"
            onClick={onLoadDemo}
            disabled={isLoading}
            className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-[#0B1936] bg-slate-50 border border-slate-200 rounded-lg hover:bg-slate-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#2563EB] transition-colors disabled:opacity-50 whitespace-nowrap shrink-0 cursor-pointer"
          >
            <Database className="w-4 h-4 text-[#7C3AED]" aria-hidden="true" />
            <span>Load Demo Reviews</span>
          </button>

          <button
            type="button"
            onClick={onClear}
            disabled={isLoading || (rawInput.trim().length === 0 && !error)}
            className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-slate-600 bg-white border border-slate-200 rounded-lg hover:text-[#0B1936] hover:bg-slate-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#2563EB] transition-colors disabled:opacity-40 whitespace-nowrap shrink-0 cursor-pointer"
          >
            <RotateCcw className="w-4 h-4" aria-hidden="true" />
            <span>Clear / Reset</span>
          </button>
        </div>
      </div>

      {isDemoInput && (
        <div
          role="status"
          className="mt-4 flex flex-wrap items-center justify-between gap-2 px-3.5 py-2.5 rounded-lg bg-violet-50/70 border border-violet-200 text-xs text-[#0B1936]"
        >
          <span className="font-medium">
            Demo Data Loaded: 12 realistic sample customer reviews ready for analysis.
          </span>
          <span className="text-slate-600">
            Edit any line or paste your own feedback to analyze custom input.
          </span>
        </div>
      )}

      <div className="mt-4">
        <div className="flex items-center justify-between mb-2">
          <label htmlFor="reviews-textarea" className="text-sm font-medium text-[#0B1936]">
            Customer Reviews Input
          </label>
          <span className="text-xs text-slate-500 font-mono tabular-nums">
            {reviewCount} {reviewCount === 1 ? 'review' : 'reviews'} detected · max 75 per batch
          </span>
        </div>

        <textarea
          id="reviews-textarea"
          rows={7}
          value={rawInput}
          onChange={(e) => onInputChange(e.target.value)}
          disabled={isLoading}
          placeholder={
            'Paste one customer review per line, for example:\nThe laptop sleeve feels durable and arrived ahead of schedule.\nShipping took over a week and the outer box was dented.\nFair price for the features, though instructions could be clearer.'
          }
          className="w-full rounded-lg border border-slate-300 bg-slate-50/50 px-4 py-3 text-sm leading-relaxed text-[#0B1936] placeholder:text-slate-400 focus:bg-white focus:border-[#2563EB] focus:ring-2 focus:ring-[#2563EB]/20 focus:outline-none transition-colors disabled:opacity-60 resize-y"
        />
      </div>

      {validationError && (
        <div
          role="alert"
          className="mt-3 flex items-start gap-2.5 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900"
        >
          <AlertCircle className="w-4 h-4 text-amber-600 mt-0.5 shrink-0" aria-hidden="true" />
          <span>{validationError}</span>
        </div>
      )}

      {error && (
        <div
          role="alert"
          className="mt-3 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-900"
        >
          <div className="flex items-start gap-2.5">
            <AlertCircle className="w-4 h-4 text-red-600 mt-0.5 shrink-0" aria-hidden="true" />
            <span>{error}</span>
          </div>
          <button
            type="button"
            onClick={onAnalyze}
            disabled={isLoading}
            className="self-start sm:self-center px-3 py-1.5 text-xs font-medium text-red-800 bg-white border border-red-200 rounded-md hover:bg-red-100 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
          >
            Try Again
          </button>
        </div>
      )}

      <div className="mt-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <p className="text-xs text-slate-500">
          Analyzed via Gemini AI on the server. Results reflect only the lines submitted above.
        </p>

        <button
          type="button"
          onClick={onAnalyze}
          disabled={isLoading}
          className="inline-flex items-center justify-center gap-2 px-5 py-2.5 text-sm font-semibold text-white bg-[#2563EB] hover:bg-[#1D4ED8] active:bg-[#1E40AF] rounded-lg shadow-xs focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#2563EB] transition-colors disabled:opacity-60 whitespace-nowrap shrink-0 cursor-pointer"
        >
          {isLoading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" aria-hidden="true" />
              <span>Analyzing {reviewCount} Reviews...</span>
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4" aria-hidden="true" />
              <span>Analyze Reviews</span>
            </>
          )}
        </button>
      </div>
    </section>
  );
}
