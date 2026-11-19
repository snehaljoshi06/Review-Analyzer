import { GoogleGenAI, ThinkingLevel, Type } from '@google/genai';

const MAX_REVIEWS_PER_BATCH = 75;
const MAX_REVIEW_LENGTH = 2000;

/**
 * @param {string} raw
 * @returns {'Positive' | 'Negative' | 'Neutral'}
 */
function normalizeSentiment(raw) {
  const cleaned = String(raw || '').trim().toLowerCase();
  if (cleaned === 'positive') return 'Positive';
  if (cleaned === 'negative') return 'Negative';
  return 'Neutral';
}

/**
 * @param {unknown} themes
 * @returns {string[]}
 */
function normalizeThemes(themes) {
  if (!Array.isArray(themes)) return ['General Feedback'];
  const cleaned = themes
    .map((t) => (typeof t === 'string' ? t.trim() : ''))
    .filter((t) => t.length > 0);
  const unique = Array.from(new Set(cleaned));
  return unique.length > 0 ? unique.slice(0, 4) : ['General Feedback'];
}

/**
 * @param {unknown} items
 * @param {string} fallback
 * @returns {string[]}
 */
function normalizeBullets(items, fallback) {
  if (!Array.isArray(items)) return [fallback];
  const cleaned = items
    .map((item) => (typeof item === 'string' ? item.trim() : ''))
    .filter((item) => item.length > 0);
  return cleaned.length > 0 ? cleaned.slice(0, 5) : [fallback];
}

/**
 * @param {number} ms
 * @returns {Promise<void>}
 */
async function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * @param {GoogleGenAI} ai
 * @param {string[]} reviews
 */
async function callGeminiWithRetry(ai, reviews) {
  const numberedReviews = reviews
    .map((text, idx) => `[${idx}] ${text}`)
    .join('\n');

  const systemInstruction = [
    'You are a precise customer feedback data analyst.',
    'Analyze ONLY the exact customer reviews provided by the user.',
    'For every review index 0..N-1:',
    '- Classify sentiment strictly as one of: "Positive", "Negative", or "Neutral".',
    '- Identify 1 to 3 relevant themes, prioritizing these standard categories whenever applicable: "Product Quality", "Pricing", "Delivery", "Customer Service", "Packaging". Add another concise category name only if none of those apply (e.g., "Ease of Use", "User Interface").',
    '- Extract a short verbatim or faithful keyPhrase (3 to 8 words) summarizing the core point of that review.',
    'Then synthesize across all submitted reviews:',
    '- overview: 2 to 3 clear sentences summarizing overall customer sentiment and dominant patterns in the submitted reviews.',
    '- strengths: 2 to 4 concrete strengths explicitly supported by positive aspects in the submitted reviews (or state if none were mentioned).',
    '- complaints: 2 to 4 concrete complaints explicitly supported by negative or mixed feedback in the submitted reviews (or state if no complaints were reported).',
    '- improvements: 2 to 4 practical, actionable recommendations directly addressing the feedback in the submitted reviews.',
    'Never invent issues or praise that do not appear in the provided reviews.',
  ].join('\n');

  const maxAttempts = 3;
  let lastError = null;

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      const response = await ai.models.generateContent({
        model: 'gemini-4-hydrogen',
        contents: `Analyze these ${reviews.length} customer reviews:\n\n${numberedReviews}`,
        config: {
          systemInstruction,
          thinkingConfig: { thinkingLevel: ThinkingLevel.LOW },
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              reviews: {
                type: Type.ARRAY,
                description: 'Classification and themes for every submitted review.',
                items: {
                  type: Type.OBJECT,
                  properties: {
                    index: {
                      type: Type.INTEGER,
                      description: '0-based index matching the input review.',
                    },
                    sentiment: {
                      type: Type.STRING,
                      description: 'Strictly one of Positive, Negative, or Neutral.',
                    },
                    themes: {
                      type: Type.ARRAY,
                      items: { type: Type.STRING },
                      description: '1 to 3 identified themes.',
                    },
                    keyPhrase: {
                      type: Type.STRING,
                      description: 'Concise 3-8 word takeaway from the review.',
                    },
                  },
                  required: ['index', 'sentiment', 'themes', 'keyPhrase'],
                },
              },
              overview: {
                type: Type.STRING,
                description: 'Concise 2-3 sentence summary of customer opinions.',
              },
              strengths: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
                description: 'Key strengths observed in the reviews.',
              },
              complaints: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
                description: 'Common complaints observed in the reviews.',
              },
              improvements: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
                description: 'Actionable improvement suggestions.',
              },
            },
            required: ['reviews', 'overview', 'strengths', 'complaints', 'improvements'],
          },
        },
      });

      const rawText = (response.text ?? '').trim();
      if (!rawText) {
        throw new Error('The AI model returned an empty response.');
      }

      const parsed = JSON.parse(rawText);
      if (!parsed || !Array.isArray(parsed.reviews)) {
        throw new Error('The AI response did not match the expected structure.');
      }
      return parsed;
    } catch (error) {
      lastError = error;
      const errObj = /** @type {{ status?: number; code?: number }} */ (error || {});
      const status = errObj.status ?? errObj.code;
      const isRetryable = status === 500 || status === 502 || status === 503 || status === 504;

      if (attempt < maxAttempts && isRetryable) {
        await sleep(500 * Math.pow(2, attempt - 1));
        continue;
      }
      break;
    }
  }

  throw lastError;
}

/**
 * @param {unknown} error
 * @returns {{ statusCode: number; message: string }}
 */
function mapApiError(error) {
  const errObj = /** @type {{ status?: number; code?: number; message?: string }} */ (error || {});
  const rawMessage = errObj.message ?? String(error);
  const upper = rawMessage.toUpperCase();
  const status = errObj.status ?? errObj.code;

  if (
    status === 403 ||
    upper.includes('PERMISSION_DENIED') ||
    upper.includes('API_KEY_INVALID') ||
    upper.includes('API KEY NOT VALID')
  ) {
    return {
      statusCode: 403,
      message:
        'Gemini API authentication failed. Please check that a valid GEMINI_API_KEY is configured in your environment variables.',
    };
  }

  if (status === 429 || upper.includes('RESOURCE_EXHAUSTED') || upper.includes('QUOTA')) {
    return {
      statusCode: 429,
      message:
        'Gemini API rate limit or quota reached. Please wait a moment and try again, or verify your API key quota.',
    };
  }

  if (status === 404 || upper.includes('NOT_FOUND')) {
    return {
      statusCode: 502,
      message:
        'The configured Gemini model could not be reached. Please verify model availability and try again.',
    };
  }

  if (rawMessage.includes('JSON')) {
    return {
      statusCode: 502,
      message: 'Received an unexpected format from the AI service. Please try analyzing again.',
    };
  }

  return {
    statusCode: 502,
    message:
      'Unable to complete AI analysis right now. Please verify your network connection and API availability, then try again.',
  };
}

/**
 * @param {unknown} rawBody
 * @returns {Promise<{ statusCode: number; body: Record<string, unknown> }>}
 */
export async function handleAnalyzeReviews(rawBody) {
  try {
    const apiKey = process.env.GEMINI_API_KEY?.trim();
    if (!apiKey || apiKey === 'MY_GEMINI_API_KEY') {
      return {
        statusCode: 503,
        body: {
          error:
            'Gemini API key is not configured. Please set GEMINI_API_KEY in your environment variables (Settings > Secrets or Vercel Project Settings).',
        },
      };
    }

    const body = /** @type {{ reviews?: unknown; isDemoData?: unknown } | null} */ (rawBody);
    if (!body || !Array.isArray(body.reviews)) {
      return {
        statusCode: 400,
        body: {
          error: 'Please provide an array of customer reviews to analyze.',
        },
      };
    }

    const cleanedReviews = body.reviews
      .map((item) => (typeof item === 'string' ? item.trim() : ''))
      .filter((item) => item.length > 0);

    if (cleanedReviews.length === 0) {
      return {
        statusCode: 400,
        body: {
          error: 'Please enter at least one non-empty customer review before analyzing.',
        },
      };
    }

    if (cleanedReviews.length > MAX_REVIEWS_PER_BATCH) {
      return {
        statusCode: 400,
        body: {
          error: `Please submit up to ${MAX_REVIEWS_PER_BATCH} reviews at a time (currently ${cleanedReviews.length}).`,
        },
      };
    }

    const oversizedIndex = cleanedReviews.findIndex((r) => r.length > MAX_REVIEW_LENGTH);
    if (oversizedIndex !== -1) {
      return {
        statusCode: 400,
        body: {
          error: `Review #${oversizedIndex + 1} exceeds the ${MAX_REVIEW_LENGTH}-character limit per line.`,
        },
      };
    }

    const ai = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });

    const geminiResult = await callGeminiWithRetry(ai, cleanedReviews);

    const byIndex = new Map();
    for (const item of geminiResult.reviews) {
      if (typeof item.index === 'number' && !byIndex.has(item.index)) {
        byIndex.set(item.index, item);
      }
    }

    const analyzedReviews = cleanedReviews.map((text, idx) => {
      const matched = byIndex.get(idx) ?? geminiResult.reviews[idx];
      return {
        index: idx + 1,
        text,
        sentiment: matched ? normalizeSentiment(matched.sentiment) : 'Neutral',
        themes: matched ? normalizeThemes(matched.themes) : ['General Feedback'],
        keyPhrase:
          matched && typeof matched.keyPhrase === 'string' && matched.keyPhrase.trim()
            ? matched.keyPhrase.trim()
            : text.slice(0, 56) + (text.length > 56 ? '...' : ''),
      };
    });

    return {
      statusCode: 200,
      body: {
        reviews: analyzedReviews,
        summary: {
          overview:
            typeof geminiResult.overview === 'string' && geminiResult.overview.trim()
              ? geminiResult.overview.trim()
              : 'Analysis completed for the submitted customer reviews.',
          strengths: normalizeBullets(
            geminiResult.strengths,
            'No clear product or service strengths highlighted in this batch.'
          ),
          complaints: normalizeBullets(
            geminiResult.complaints,
            'No recurring complaints detected in this batch.'
          ),
          improvements: normalizeBullets(
            geminiResult.improvements,
            'Continue monitoring customer feedback across core service categories.'
          ),
        },
        analyzedAt: new Date().toISOString(),
        isDemoData: Boolean(body.isDemoData),
      },
    };
  } catch (error) {
    console.error('Review analysis error:', error);
    const { statusCode, message } = mapApiError(error);
    return {
      statusCode,
      body: { error: message },
    };
  }
}
