import { AlertTriangle, CheckCircle2, Lightbulb } from 'lucide-react';
import { AnalysisSummary } from '../types/review';

interface InsightsPanelProps {
  summary: AnalysisSummary | null;
  isLoading: boolean;
  isDemoData: boolean;
}

export function InsightsPanel({ summary, isLoading, isDemoData }: InsightsPanelProps) {
  return (
    <section id="insights" aria-labelledby="insights-heading" className="space-y-4">
      <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs">
        <div className="flex flex-wrap items-baseline justify-between gap-2 pb-4 border-b border-slate-100">
          <h2 id="insights-heading" className="text-lg font-semibold text-[#0B1936]">
            Executive Opinion Summary
          </h2>
          {summary && (
            <span className="text-xs text-slate-500">
              {isDemoData ? 'Generated from Demo Reviews' : 'Generated from Submitted Reviews'}
            </span>
          )}
        </div>

        {isLoading ? (
          <div className="mt-4 space-y-2.5">
            <div className="h-4 w-full bg-slate-100 rounded animate-pulse" />
            <div className="h-4 w-11/12 bg-slate-100 rounded animate-pulse" />
            <div className="h-4 w-3/4 bg-slate-100 rounded animate-pulse" />
          </div>
        ) : summary ? (
          <p className="mt-4 text-[15px] leading-relaxed text-[#1E293B] max-w-4xl">
            {summary.overview}
          </p>
        ) : (
          <p className="mt-4 text-sm text-slate-500">
            Run an analysis above to generate a concise executive summary of customer opinions, top strengths, recurring complaints, and practical recommendations.
          </p>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <InsightColumn
          title="Key Strengths"
          items={summary?.strengths ?? null}
          emptyText="Positive patterns from your reviews will be summarized here."
          isLoading={isLoading}
          icon={CheckCircle2}
          iconClass="text-emerald-600"
          iconBg="bg-emerald-50"
        />

        <InsightColumn
          title="Common Complaints"
          items={summary?.complaints ?? null}
          emptyText="Friction points and negative feedback themes will be highlighted here."
          isLoading={isLoading}
          icon={AlertTriangle}
          iconClass="text-red-600"
          iconBg="bg-red-50"
        />

        <InsightColumn
          title="Suggested Improvements"
          items={summary?.improvements ?? null}
          emptyText="Concrete action items derived from the feedback will appear here."
          isLoading={isLoading}
          icon={Lightbulb}
          iconClass="text-[#7C3AED]"
          iconBg="bg-violet-50"
        />
      </div>
    </section>
  );
}

interface InsightColumnProps {
  title: string;
  items: string[] | null;
  emptyText: string;
  isLoading: boolean;
  icon: typeof CheckCircle2;
  iconClass: string;
  iconBg: string;
}

function InsightColumn({
  title,
  items,
  emptyText,
  isLoading,
  icon: Icon,
  iconClass,
  iconBg,
}: InsightColumnProps) {
  return (
    <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs flex flex-col">
      <div className="flex items-center gap-3 pb-4 border-b border-slate-100">
        <div
          className={`w-8 h-8 rounded-lg ${iconBg} ${iconClass} flex items-center justify-center shrink-0`}
          aria-hidden="true"
        >
          <Icon className="w-4 h-4" />
        </div>
        <h3 className="text-base font-semibold text-[#0B1936]">{title}</h3>
      </div>

      {isLoading ? (
        <div className="mt-4 space-y-3">
          <div className="h-3.5 w-full bg-slate-100 rounded animate-pulse" />
          <div className="h-3.5 w-5/6 bg-slate-100 rounded animate-pulse" />
          <div className="h-3.5 w-4/5 bg-slate-100 rounded animate-pulse" />
        </div>
      ) : items && items.length > 0 ? (
        <ul className="mt-4 space-y-3 text-sm leading-relaxed text-[#1E293B]">
          {items.map((point, idx) => (
            <li key={idx} className="flex items-start gap-2.5">
              <span className="font-mono text-xs text-slate-400 mt-1 tabular-nums shrink-0">
                0{idx + 1}
              </span>
              <span>{point}</span>
            </li>
          ))}
        </ul>
      ) : (
        <p className="mt-4 text-sm text-slate-400">{emptyText}</p>
      )}
    </div>
  );
}
