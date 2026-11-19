export interface AnalyzeHandlerResult {
  statusCode: number;
  body: Record<string, unknown>;
}

export function handleAnalyzeReviews(rawBody: unknown): Promise<AnalyzeHandlerResult>;
