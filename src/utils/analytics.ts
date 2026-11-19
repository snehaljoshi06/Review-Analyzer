import {
  AnalyzedReview,
  CategoryStat,
  CORE_THEMES,
  SentimentCounts,
} from '../types/review';

export function computeSentimentCounts(reviews: AnalyzedReview[]): SentimentCounts {
  const total = reviews.length;
  if (total === 0) {
    return {
      total: 0,
      positive: 0,
      negative: 0,
      neutral: 0,
      positivePct: 0,
      negativePct: 0,
      neutralPct: 0,
    };
  }

  let positive = 0;
  let negative = 0;
  let neutral = 0;

  for (const r of reviews) {
    if (r.sentiment === 'Positive') positive += 1;
    else if (r.sentiment === 'Negative') negative += 1;
    else neutral += 1;
  }

  const positivePct = Math.round((positive / total) * 100);
  const negativePct = Math.round((negative / total) * 100);
  const neutralPct = Math.max(0, 100 - positivePct - negativePct);

  return {
    total,
    positive,
    negative,
    neutral,
    positivePct,
    negativePct,
    neutralPct,
  };
}

export function computeCategoryStats(reviews: AnalyzedReview[]): CategoryStat[] {
  const map = new Map<string, CategoryStat>();

  for (const core of CORE_THEMES) {
    map.set(core, {
      theme: core,
      total: 0,
      positive: 0,
      negative: 0,
      neutral: 0,
    });
  }

  for (const review of reviews) {
    const uniqueThemes = Array.from(new Set(review.themes));
    for (const theme of uniqueThemes) {
      const existing = map.get(theme) ?? {
        theme,
        total: 0,
        positive: 0,
        negative: 0,
        neutral: 0,
      };
      existing.total += 1;
      if (review.sentiment === 'Positive') existing.positive += 1;
      else if (review.sentiment === 'Negative') existing.negative += 1;
      else existing.neutral += 1;
      map.set(theme, existing);
    }
  }

  return Array.from(map.values())
    .filter((item) => item.total > 0)
    .sort((a, b) => b.total - a.total);
}
