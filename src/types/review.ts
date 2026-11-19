export type Sentiment = 'Positive' | 'Negative' | 'Neutral';

export const CORE_THEMES = [
  'Product Quality',
  'Pricing',
  'Delivery',
  'Customer Service',
  'Packaging',
] as const;

export type CoreTheme = (typeof CORE_THEMES)[number];

export interface AnalyzedReview {
  index: number;
  text: string;
  sentiment: Sentiment;
  themes: string[];
  keyPhrase: string;
}

export interface AnalysisSummary {
  overview: string;
  strengths: string[];
  complaints: string[];
  improvements: string[];
}

export interface AnalysisResult {
  reviews: AnalyzedReview[];
  summary: AnalysisSummary;
  analyzedAt: string;
  isDemoData: boolean;
}

export interface SentimentCounts {
  total: number;
  positive: number;
  negative: number;
  neutral: number;
  positivePct: number;
  negativePct: number;
  neutralPct: number;
}

export interface CategoryStat {
  theme: string;
  total: number;
  positive: number;
  negative: number;
  neutral: number;
}
