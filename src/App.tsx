import { useMemo, useState } from 'react';
import { CategoryChart } from './components/CategoryChart';
import { InsightsPanel } from './components/InsightsPanel';
import { KpiStrip } from './components/KpiStrip';
import { ReviewAnalyzer } from './components/ReviewAnalyzer';
import { ReviewResultsTable } from './components/ReviewResultsTable';
import { SentimentChart } from './components/SentimentChart';
import { Sidebar } from './components/Sidebar';
import { DEMO_REVIEWS } from './data/demoReviews';
import { AnalysisResult, Sentiment } from './types/review';
import { computeCategoryStats, computeSentimentCounts } from './utils/analytics';
import { exportAnalysisToCsv } from './utils/csvExport';

const MAX_BATCH = 75;
const MAX_LINE_CHARS = 2000;

function parseLines(text: string): string[] {
  return text
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter((line) => line.length > 0);
}

export default function App() {
  const [rawInput, setRawInput] = useState<string>('');
  const [isDemoInput, setIsDemoInput] = useState<boolean>(false);
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [validationError, setValidationError] = useState<string | null>(null);

  const [searchQuery, setSearchQuery] = useState<string>('');
  const [activeSentiment, setActiveSentiment] = useState<Sentiment | 'All'>('All');
  const [activeTheme, setActiveTheme] = useState<string | null>(null);

  const parsedLines = useMemo(() => parseLines(rawInput), [rawInput]);
  const demoJoined = useMemo(() => DEMO_REVIEWS.join('\n'), []);

  const hasResults = Boolean(analysis && analysis.reviews.length > 0);

  const sentimentStats = useMemo(
    () => computeSentimentCounts(analysis?.reviews ?? []),
    [analysis]
  );

  const categoryStats = useMemo(
    () => computeCategoryStats(analysis?.reviews ?? []),
    [analysis]
  );

  function handleInputChange(value: string) {
    setRawInput(value);
    setValidationError(null);
    setError(null);
    setIsDemoInput(value.trim() === demoJoined.trim());
  }

  function handleLoadDemo() {
    setRawInput(demoJoined);
    setIsDemoInput(true);
    setValidationError(null);
    setError(null);
    const analyzerEl = document.getElementById('analyzer');
    if (analyzerEl) {
      analyzerEl.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
  }

  function handleClear() {
    setRawInput('');
    setIsDemoInput(false);
    setAnalysis(null);
    setError(null);
    setValidationError(null);
    setSearchQuery('');
    setActiveSentiment('All');
    setActiveTheme(null);
  }

  async function handleAnalyze() {
    setValidationError(null);
    setError(null);

    if (parsedLines.length === 0) {
      setValidationError(
        'Please enter at least one customer review (one per line), or click Load Demo Reviews to try sample data.'
      );
      return;
    }

    if (parsedLines.length > MAX_BATCH) {
      setValidationError(
        `Please submit up to ${MAX_BATCH} reviews per analysis batch (currently ${parsedLines.length} lines).`
      );
      return;
    }

    const tooLongIdx = parsedLines.findIndex((line) => line.length > MAX_LINE_CHARS);
    if (tooLongIdx !== -1) {
      setValidationError(
        `Review #${tooLongIdx + 1} exceeds ${MAX_LINE_CHARS} characters. Please shorten or split that line.`
      );
      return;
    }

    setIsLoading(true);
    setActiveSentiment('All');
    setActiveTheme(null);
    setSearchQuery('');

    try {
      const response = await fetch('/api/analyze-reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          reviews: parsedLines,
          isDemoData: isDemoInput,
        }),
      });

      const payload = (await response.json().catch(() => ({}))) as Partial<AnalysisResult> & {
        error?: string;
      };

      if (!response.ok) {
        throw new Error(
          payload.error ||
            `Analysis request failed with status ${response.status}. Please try again.`
        );
      }

      if (!Array.isArray(payload.reviews) || !payload.summary) {
        throw new Error('Received an incomplete analysis response from the server.');
      }

      setAnalysis({
        reviews: payload.reviews,
        summary: payload.summary,
        analyzedAt: payload.analyzedAt || new Date().toISOString(),
        isDemoData: Boolean(payload.isDemoData),
      });
    } catch (err: unknown) {
      const message =
        err instanceof Error
          ? err.message
          : 'Unable to reach the analysis service. Please verify your connection and try again.';
      setError(message);
    } finally {
      setIsLoading(false);
    }
  }

  function handleExportCsv() {
    if (!analysis || analysis.reviews.length === 0) return;
    exportAnalysisToCsv(analysis, sentimentStats, categoryStats);
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-[#0B1936] flex">
      <Sidebar
        hasResults={hasResults}
        totalReviews={sentimentStats.total}
        isDemoData={Boolean(analysis?.isDemoData)}
        onLoadDemo={handleLoadDemo}
        onExportCsv={handleExportCsv}
        onClear={handleClear}
        isLoading={isLoading}
      />

      <div className="flex-1 min-w-0 flex flex-col">
        <header className="sticky top-0 z-20 h-16 bg-white/95 backdrop-blur-xs border-b border-slate-200 px-4 sm:px-8 flex items-center justify-between gap-8">
          <div className="flex items-center gap-3 min-w-0">
            <a
              href="#overview"
              className="lg:hidden text-base font-bold tracking-tight text-[#0B1936] font-display whitespace-nowrap shrink-0"
            >
              ReviewLens
            </a>
            <span className="hidden lg:inline text-sm font-medium text-slate-500 whitespace-nowrap truncate">
              Workspace / Customer Feedback Analyzer
            </span>
          </div>

          <nav
            aria-label="Primary sections"
            className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-600"
          >
            <a
              href="#overview"
              className="hover:text-[#0B1936] hover:underline underline-offset-4 transition-colors whitespace-nowrap shrink-0"
            >
              Overview
            </a>
            <a
              href="#analyzer"
              className="hover:text-[#0B1936] hover:underline underline-offset-4 transition-colors whitespace-nowrap shrink-0"
            >
              Analyzer
            </a>
            <a
              href="#insights"
              className="hover:text-[#0B1936] hover:underline underline-offset-4 transition-colors whitespace-nowrap shrink-0"
            >
              Insights
            </a>
            <a
              href="#results"
              className="hover:text-[#0B1936] hover:underline underline-offset-4 transition-colors whitespace-nowrap shrink-0"
            >
              Review Log
            </a>
          </nav>

          <div className="shrink-0">
            {hasResults ? (
              <button
                type="button"
                onClick={handleExportCsv}
                disabled={isLoading}
                className="px-4 py-2 text-xs sm:text-sm font-medium text-white bg-[#2563EB] hover:bg-[#1D4ED8] rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer disabled:opacity-50"
              >
                Export CSV
              </button>
            ) : (
              <button
                type="button"
                onClick={handleLoadDemo}
                disabled={isLoading}
                className="px-4 py-2 text-xs sm:text-sm font-medium text-white bg-[#2563EB] hover:bg-[#1D4ED8] rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer disabled:opacity-50"
              >
                Load Demo Reviews
              </button>
            )}
          </div>
        </header>

        <main className="flex-1 w-full max-w-[1280px] mx-auto px-4 sm:px-8 py-8 space-y-8">
          <section id="overview" className="space-y-5">
            <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
              <div>
                <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-[#0B1936] font-display text-balance">
                  ReviewLens
                </h1>
                <p className="mt-1.5 text-base sm:text-lg text-slate-600">
                  Turn customer feedback into actionable insights.
                </p>
              </div>

              <p className="text-xs text-slate-500 md:text-right leading-relaxed">
                Cisco Networking Academy Internship Demonstration
                <span className="hidden sm:inline"> · </span>
                <br className="sm:hidden" />
                Modern AI · Analyze Customer Reviews · Data Analytics Essentials
              </p>
            </div>

            {analysis?.isDemoData && (
              <div
                role="note"
                className="rounded-lg border border-violet-200 bg-violet-50/70 px-4 py-3 text-sm text-[#0B1936] flex flex-wrap items-center justify-between gap-2"
              >
                <span>
                  <strong>Demo Data Results:</strong> The metrics, charts, and classifications below are generated from the 12 sample demonstration reviews.
                </span>
                <button
                  type="button"
                  onClick={handleClear}
                  className="text-xs font-semibold text-[#7C3AED] hover:text-[#6D28D9] underline underline-offset-2 whitespace-nowrap cursor-pointer"
                >
                  Clear & enter custom reviews
                </button>
              </div>
            )}

            <KpiStrip
              stats={sentimentStats}
              hasResults={hasResults}
              isLoading={isLoading}
            />
          </section>

          <ReviewAnalyzer
            rawInput={rawInput}
            onInputChange={handleInputChange}
            onAnalyze={handleAnalyze}
            onLoadDemo={handleLoadDemo}
            onClear={handleClear}
            isLoading={isLoading}
            error={error}
            validationError={validationError}
            isDemoInput={isDemoInput}
            reviewCount={parsedLines.length}
          />

          <section
            id="charts"
            aria-label="Interactive sentiment and category analytics"
            className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch"
          >
            <div className="lg:col-span-5">
              <SentimentChart
                stats={sentimentStats}
                hasResults={hasResults}
                isLoading={isLoading}
                activeSentiment={activeSentiment}
                onSelectSentiment={setActiveSentiment}
              />
            </div>

            <div className="lg:col-span-7">
              <CategoryChart
                categories={categoryStats}
                hasResults={hasResults}
                isLoading={isLoading}
                activeTheme={activeTheme}
                onSelectTheme={setActiveTheme}
              />
            </div>
          </section>

          <InsightsPanel
            summary={analysis?.summary ?? null}
            isLoading={isLoading}
            isDemoData={Boolean(analysis?.isDemoData)}
          />

          <ReviewResultsTable
            reviews={analysis?.reviews ?? []}
            isLoading={isLoading}
            hasResults={hasResults}
            isDemoData={Boolean(analysis?.isDemoData)}
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            activeSentiment={activeSentiment}
            onSentimentChange={setActiveSentiment}
            activeTheme={activeTheme}
            onThemeChange={setActiveTheme}
            onExportCsv={handleExportCsv}
            onLoadDemo={handleLoadDemo}
          />
        </main>

        <footer className="border-t border-slate-200 bg-white px-4 sm:px-8 py-5 mt-8">
          <div className="max-w-[1280px] mx-auto flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 text-xs text-slate-500">
            <span>ReviewLens · AI Customer Feedback Analyzer</span>
            <span>
              Educational Project · Introduction to Modern AI · Apply AI: Analyze Customer Reviews · Data Analytics Essentials
            </span>
          </div>
        </footer>
      </div>
    </div>
  );
}
