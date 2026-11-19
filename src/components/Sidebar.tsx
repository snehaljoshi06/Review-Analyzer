import {
  BarChart3,
  Database,
  Download,
  FileSpreadsheet,
  LayoutDashboard,
  Lightbulb,
  MessageSquarePlus,
  RotateCcw,
} from 'lucide-react';

interface SidebarProps {
  hasResults: boolean;
  totalReviews: number;
  isDemoData: boolean;
  onLoadDemo: () => void;
  onExportCsv: () => void;
  onClear: () => void;
  isLoading: boolean;
}

const NAV_ITEMS = [
  { href: '#overview', label: 'Overview', icon: LayoutDashboard },
  { href: '#analyzer', label: 'Review Analyzer', icon: MessageSquarePlus },
  { href: '#charts', label: 'Sentiment & Themes', icon: BarChart3 },
  { href: '#insights', label: 'Actionable Insights', icon: Lightbulb },
  { href: '#results', label: 'Review Log', icon: FileSpreadsheet },
];

export function Sidebar({
  hasResults,
  totalReviews,
  isDemoData,
  onLoadDemo,
  onExportCsv,
  onClear,
  isLoading,
}: SidebarProps) {
  return (
    <aside className="hidden lg:flex lg:flex-col lg:w-64 lg:shrink-0 bg-white border-r border-slate-200 min-h-screen sticky top-0 h-screen justify-between">
      <div>
        <div className="h-16 px-6 flex items-center border-b border-slate-200">
          <a
            href="#overview"
            className="text-lg font-bold tracking-tight text-[#0B1936] font-display flex items-center gap-2.5 whitespace-nowrap"
          >
            <span className="w-7 h-7 rounded-lg bg-[#2563EB] text-white flex items-center justify-center text-xs font-bold">
              RL
            </span>
            <span>ReviewLens</span>
          </a>
        </div>

        <nav aria-label="Workspace navigation" className="p-4 space-y-1">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            return (
              <a
                key={item.href}
                href={item.href}
                className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-slate-600 hover:text-[#0B1936] hover:bg-slate-50 transition-colors whitespace-nowrap"
              >
                <Icon className="w-4 h-4 text-slate-400 shrink-0" aria-hidden="true" />
                <span>{item.label}</span>
              </a>
            );
          })}
        </nav>

        <div className="mx-4 mt-2 pt-4 border-t border-slate-100 space-y-1.5">
          <p className="px-3 text-xs font-semibold text-slate-400">Quick Actions</p>
          <button
            type="button"
            onClick={onLoadDemo}
            disabled={isLoading}
            className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-medium text-[#0B1936] hover:bg-violet-50/70 transition-colors disabled:opacity-50 text-left cursor-pointer"
          >
            <Database className="w-4 h-4 text-[#7C3AED] shrink-0" aria-hidden="true" />
            <span>Load Demo Reviews</span>
          </button>

          <button
            type="button"
            onClick={onExportCsv}
            disabled={!hasResults || isLoading}
            className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-medium text-[#0B1936] hover:bg-slate-50 transition-colors disabled:opacity-40 text-left cursor-pointer"
          >
            <Download className="w-4 h-4 text-[#2563EB] shrink-0" aria-hidden="true" />
            <span>Export CSV</span>
          </button>

          <button
            type="button"
            onClick={onClear}
            disabled={isLoading}
            className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-medium text-slate-600 hover:text-[#0B1936] hover:bg-slate-50 transition-colors disabled:opacity-40 text-left cursor-pointer"
          >
            <RotateCcw className="w-4 h-4 text-slate-400 shrink-0" aria-hidden="true" />
            <span>Clear Workspace</span>
          </button>
        </div>
      </div>

      <div className="p-5 border-t border-slate-100 space-y-2 text-xs text-slate-500">
        <div className="flex items-center justify-between">
          <span>Active Dataset</span>
          <span className="font-mono font-medium text-[#0B1936] tabular-nums">
            {hasResults ? `${totalReviews} rows` : 'Empty'}
          </span>
        </div>
        {hasResults && (
          <p className="text-slate-500">
            Source: {isDemoData ? 'Demo Dataset (12)' : 'User Input'}
          </p>
        )}
        <p className="pt-2 border-t border-slate-100 leading-relaxed text-slate-400">
          Cisco Networking Academy Internship Project
        </p>
      </div>
    </aside>
  );
}
