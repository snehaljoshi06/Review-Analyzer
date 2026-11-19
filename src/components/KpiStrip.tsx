import { CheckCircle2, MessageSquareText, MinusCircle, AlertTriangle } from 'lucide-react';
import { SentimentCounts } from '../types/review';

interface KpiStripProps {
  stats: SentimentCounts;
  hasResults: boolean;
  isLoading: boolean;
}

export function KpiStrip({ stats, hasResults, isLoading }: KpiStripProps) {
  const items = [
    {
      label: 'Total Reviews',
      value: hasResults ? String(stats.total) : '—',
      detail: hasResults ? '100% processed' : 'Awaiting input',
      icon: MessageSquareText,
      accentClass: 'text-[#2563EB]',
      bgClass: 'bg-blue-50',
    },
    {
      label: 'Positive Reviews',
      value: hasResults ? String(stats.positive) : '—',
      detail: hasResults ? `${stats.positivePct}% of total` : 'Favorable sentiment',
      icon: CheckCircle2,
      accentClass: 'text-emerald-600',
      bgClass: 'bg-emerald-50',
    },
    {
      label: 'Negative Reviews',
      value: hasResults ? String(stats.negative) : '—',
      detail: hasResults ? `${stats.negativePct}% of total` : 'Critical feedback',
      icon: AlertTriangle,
      accentClass: 'text-red-600',
      bgClass: 'bg-red-50',
    },
    {
      label: 'Neutral Reviews',
      value: hasResults ? String(stats.neutral) : '—',
      detail: hasResults ? `${stats.neutralPct}% of total` : 'Balanced or mixed',
      icon: MinusCircle,
      accentClass: 'text-amber-600',
      bgClass: 'bg-amber-50',
    },
  ];

  return (
    <section aria-label="Sentiment key metrics" className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
      {items.map((item) => {
        const Icon = item.icon;
        return (
          <div
            key={item.label}
            className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs flex items-start justify-between gap-4"
          >
            <div className="min-w-0">
              <p className="text-sm font-medium text-slate-600">{item.label}</p>
              {isLoading ? (
                <div className="mt-2 h-8 w-16 rounded bg-slate-100 animate-pulse" />
              ) : (
                <p className="mt-1.5 text-3xl font-bold tracking-tight text-[#0B1936] font-display tabular-nums">
                  {item.value}
                </p>
              )}
              <p className="mt-1.5 text-xs text-slate-500 tabular-nums font-mono">
                {isLoading ? 'Calculating...' : item.detail}
              </p>
            </div>
            <div
              className={`w-10 h-10 rounded-lg ${item.bgClass} ${item.accentClass} flex items-center justify-center shrink-0`}
              aria-hidden="true"
            >
              <Icon className="w-5 h-5" />
            </div>
          </div>
        );
      })}
    </section>
  );
}
