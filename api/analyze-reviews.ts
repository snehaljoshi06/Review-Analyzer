import type { IncomingMessage, ServerResponse } from 'http';
import { handleAnalyzeReviews } from '../lib/analyzeReviews.js';

type VercelRequest = IncomingMessage & {
  body?: unknown;
  method?: string;
};

async function readJsonBody(req: VercelRequest): Promise<unknown> {
  if (req.body !== undefined) {
    if (typeof req.body === 'string') {
      try {
        return JSON.parse(req.body);
      } catch {
        return null;
      }
    }
    return req.body;
  }

  const chunks: Buffer[] = [];
  for await (const chunk of req) {
    chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
  }
  const raw = Buffer.concat(chunks).toString('utf-8').trim();
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export default async function handler(req: VercelRequest, res: ServerResponse) {
  res.setHeader('Content-Type', 'application/json');

  if (req.method === 'OPTIONS') {
    res.statusCode = 204;
    res.end();
    return;
  }

  if (req.method !== 'POST') {
    res.statusCode = 405;
    res.end(JSON.stringify({ error: 'Method not allowed. Use POST.' }));
    return;
  }

  try {
    const body = await readJsonBody(req);
    const result = await handleAnalyzeReviews(body);
    res.statusCode = result.statusCode;
    res.end(JSON.stringify(result.body));
  } catch (err) {
    console.error('Unhandled error in /api/analyze-reviews:', err);
    if (!res.writableEnded) {
      res.statusCode = 500;
      res.end(
        JSON.stringify({
          error: 'An unexpected server error occurred while processing your reviews.',
        })
      );
    }
  }
}
