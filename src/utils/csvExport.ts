import { AnalysisResult, CategoryStat, SentimentCounts } from '../types/review';

function escapeCsvCell(value: string | number): string {
  const str = String(value ?? '');
  if (/[",\r\n]/.test(str)) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

export function exportAnalysisToCsv(
  result: AnalysisResult,
  stats: SentimentCounts,
  categories: CategoryStat[]
): void {
  const lines: string[] = [];

  lines.push('ReviewLens - AI Customer Feedback Analysis Export');
  lines.push(`Dataset Source,${escapeCsvCell(result.isDemoData ? 'Demo Dataset (12 Sample Reviews)' : 'User Submitted Reviews')}`);
  lines.push(`Analyzed At,${escapeCsvCell(new Date(result.analyzedAt).toLocaleString())}`);
  lines.push('');

  lines.push('Sentiment Summary');
  lines.push('Metric,Count,Percentage');
  lines.push(`Total Reviews,${stats.total},100%`);
  lines.push(`Positive,${stats.positive},${stats.positivePct}%`);
  lines.push(`Negative,${stats.negative},${stats.negativePct}%`);
  lines.push(`Neutral,${stats.neutral},${stats.neutralPct}%`);
  lines.push('');

  lines.push('Executive Summary');
  lines.push(`Overview,${escapeCsvCell(result.summary.overview)}`);
  lines.push(`Strengths,${escapeCsvCell(result.summary.strengths.join(' | '))}`);
  lines.push(`Common Complaints,${escapeCsvCell(result.summary.complaints.join(' | '))}`);
  lines.push(`Suggested Improvements,${escapeCsvCell(result.summary.improvements.join(' | '))}`);
  lines.push('');

  lines.push('Theme Breakdown');
  lines.push('Theme,Total Mentions,Positive,Neutral,Negative');
  for (const cat of categories) {
    lines.push(
      [
        escapeCsvCell(cat.theme),
        cat.total,
        cat.positive,
        cat.neutral,
        cat.negative,
      ].join(',')
    );
  }
  lines.push('');

  lines.push('Analyzed Reviews');
  lines.push('Review #,Sentiment,Themes,Key Takeaway,Review Text');
  for (const review of result.reviews) {
    lines.push(
      [
        review.index,
        escapeCsvCell(review.sentiment),
        escapeCsvCell(review.themes.join('; ')),
        escapeCsvCell(review.keyPhrase),
        escapeCsvCell(review.text),
      ].join(',')
    );
  }

  const csvContent = lines.join('\r\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);

  const link = document.createElement('a');
  const timestamp = new Date().toISOString().slice(0, 10);
  link.href = url;
  link.setAttribute('download', `reviewlens-analysis-${timestamp}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
