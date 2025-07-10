const { BigQuery } = require('@google-cloud/bigquery');
const { Firestore } = require('@google-cloud/firestore');
const cors = require('cors')({
  origin: [
    'http://localhost:5173',  // Development
    'https://my-hacker-news-navy.vercel.app', // Old production URL
    'https://hacker-news-ai-dev-feed.vercel.app' // Actual production URL
  ],
  credentials: true,
  methods: ['GET', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'x-api-key']
});
const crypto = require('crypto');

// Initialize clients
const bigquery = new BigQuery();
const firestore = new Firestore();

// Cache configuration
const CACHE_COLLECTION = 'hn_cache';
const CACHE_DURATION_HOURS = 1;

// BigQuery configuration
const BASE_QUERY = `
SELECT
  id,
  title,
  text,
  url,
  score,
  parent,
  ranking,
  descendants,
  timestamp,
FROM
  \`bigquery-public-data.hacker_news.full\`
WHERE
  (
    LOWER(title) LIKE '%llm%' OR
    LOWER(title) LIKE '%large language model%' OR
    LOWER(title) LIKE '%chatgpt%' OR
    LOWER(title) LIKE '%gpt%' OR
    LOWER(title) LIKE '%gpt-4%' OR
    LOWER(title) LIKE '%gpt-4o%' OR
    LOWER(title) LIKE '%4o%' OR
    LOWER(title) LIKE '%o1%' OR
    LOWER(title) LIKE '%o3%' OR
    LOWER(title) LIKE '%copilot%' OR
    LOWER(title) LIKE '%codewhisperer%' OR
    LOWER(title) LIKE '%replit%' OR
    LOWER(title) LIKE '%cursor%' OR
    LOWER(title) LIKE '%windsurf%' OR
    LOWER(title) LIKE '%ai coding%' OR
    LOWER(title) LIKE '%vibe coding%' OR
    LOWER(title) LIKE '%agentic%' OR
    LOWER(title) LIKE '%claude%' OR
    LOWER(title) LIKE '%sonnet%' OR
    LOWER(title) LIKE '%opus%' OR
    LOWER(title) LIKE '%haiku%' OR
    LOWER(title) LIKE '%anthropic%' OR
    LOWER(title) LIKE '%gemini%' OR
    LOWER(title) LIKE '%gemini-pro%' OR
    LOWER(title) LIKE '%gemini-flash%' OR
    LOWER(title) LIKE '%bard%' OR
    LOWER(title) LIKE '%llama%' OR
    LOWER(title) LIKE '%llama-3%' OR
    LOWER(title) LIKE '%llama-4%' OR
    LOWER(title) LIKE '%mistral%' OR
    LOWER(title) LIKE '%mixtral%' OR
    LOWER(title) LIKE '%qwen%' OR
    LOWER(title) LIKE '%deepseek%' OR
    LOWER(title) LIKE '%phi%' OR
    LOWER(title) LIKE '%codestral%' OR
    LOWER(title) LIKE '%openai%' OR
    LOWER(title) LIKE '%perplexity%' OR
    LOWER(title) LIKE '%cohere%' OR
    LOWER(title) LIKE '%together%' OR
    LOWER(title) LIKE '%hugging face%' OR
    LOWER(title) LIKE '%huggingface%' OR
    LOWER(title) LIKE '%transformers%' OR
    LOWER(title) LIKE '%neural network%' OR
    LOWER(title) LIKE '%machine learning%' OR
    LOWER(title) LIKE '%deep learning%' OR
    LOWER(title) LIKE '%artificial intelligence%' OR
    LOWER(title) LIKE '%rag%' OR
    LOWER(title) LIKE '%retrieval augmented%' OR
    LOWER(title) LIKE '%vector database%' OR
    LOWER(title) LIKE '%embeddings%' OR
    LOWER(title) LIKE '%fine-tuning%' OR
    LOWER(title) LIKE '%fine tuning%' OR
    LOWER(title) LIKE '%training%' OR
    LOWER(title) LIKE '%inference%' OR
    LOWER(title) LIKE '%langchain%' OR
    LOWER(title) LIKE '%llamaindex%' OR
    LOWER(title) LIKE '%vercel ai%' OR
    LOWER(title) LIKE '%openai api%' OR
    LOWER(title) LIKE '%anthropic api%' OR
    LOWER(title) LIKE '%chatbot%' OR
    LOWER(title) LIKE '%conversational ai%' OR
    LOWER(title) LIKE '%ai assistant%' OR
    LOWER(title) LIKE '%code generation%' OR
    LOWER(title) LIKE '%code assistant%' OR
    LOWER(title) LIKE '%ai pair programming%' OR
    LOWER(title) LIKE '%prompt engineering%' OR
    LOWER(title) LIKE '%code completion%' OR
    LOWER(title) LIKE '%ai code review%' OR
    LOWER(title) LIKE '%automated testing%' OR
    LOWER(title) LIKE '%ai debugging%' OR
    LOWER(title) LIKE '%machine learning ops%' OR
    LOWER(title) LIKE '%mlops%' OR
    LOWER(title) LIKE '%ai workflow%' OR
    LOWER(title) LIKE '%developer productivity%' OR
    LOWER(title) LIKE '%ai tooling%' OR
    LOWER(title) LIKE '%intelligent ide%' OR
    LOWER(title) LIKE '%smart autocomplete%' OR
    LOWER(title) LIKE '%ai refactoring%' OR
    LOWER(title) LIKE '%automated documentation%' OR
    LOWER(title) LIKE '%ai documentation%' OR
    LOWER(title) LIKE '%code search%' OR
    LOWER(title) LIKE '%semantic search%' OR
    LOWER(title) LIKE '%ai powered%' OR
    LOWER(title) LIKE '%ai-powered%' OR
    LOWER(title) LIKE '%automated%' OR
    LOWER(title) LIKE '%ai testing%' OR
    LOWER(title) LIKE '%test generation%' OR
    LOWER(title) LIKE '%ai deployment%' OR
    LOWER(title) LIKE '%devops ai%' OR
    LOWER(title) LIKE '%ci/cd ai%' OR
    LOWER(title) LIKE '%github actions ai%' OR
    LOWER(title) LIKE '%ai monitoring%' OR
    LOWER(title) LIKE '%observability ai%' OR
    LOWER(title) LIKE '%ai analytics%' OR
    LOWER(title) LIKE '%performance ai%' OR
    LOWER(title) LIKE '%ai optimization%' OR
    LOWER(title) LIKE '%code quality ai%' OR
    LOWER(title) LIKE '%ai security%' OR
    LOWER(title) LIKE '%vulnerability ai%' OR
    LOWER(title) LIKE '%ai migration%' OR
    LOWER(title) LIKE '%legacy code ai%' OR
    LOWER(title) LIKE '%v0%' OR
    LOWER(title) LIKE '%bolt.new%' OR
    LOWER(title) LIKE '%lovable%' OR
    LOWER(title) LIKE '%devin%' OR
    LOWER(title) LIKE '%sweep%' OR
    LOWER(title) LIKE '%codeium%' OR
    LOWER(title) LIKE '%tabnine%' OR
    LOWER(title) LIKE '%sourcegraph%' OR
    LOWER(title) LIKE '%cody%' OR
    LOWER(title) LIKE '%continue%' OR
    LOWER(title) LIKE '%aider%' OR
    LOWER(title) LIKE '%codecomplete%' OR
    LOWER(title) LIKE '%kite%' OR
    LOWER(title) LIKE '%ai agent%' OR
    LOWER(title) LIKE '%coding agent%' OR
    LOWER(title) LIKE '%autonomous agent%' OR
    LOWER(title) LIKE '%software agent%'
  )
  AND
  (
    LOWER(title) LIKE '%software%' OR
    LOWER(title) LIKE '%engineering%' OR
    LOWER(title) LIKE '%web development%' OR
    LOWER(title) LIKE '%programming%' OR
    LOWER(title) LIKE '%coding%' OR
    LOWER(title) LIKE '%developer%'
  )
ORDER BY
  timestamp DESC
`;

/**
 * Build the complete query with pagination
 */
function buildQuery(limit = 200, offset = 0) {
  return `${BASE_QUERY}
LIMIT ${limit}
OFFSET ${offset}`;
}

/**
 * Generate a hash of the query for cache key
 */
function getQueryHash(query, limit, offset) {
  const fullQuery = `${query}_limit_${limit}_offset_${offset}`;
  return crypto.createHash('md5').update(fullQuery).digest('hex');
}

/**
 * Check if cache is still valid
 */
function isCacheValid(timestamp) {
  const now = new Date();
  const cacheTime = timestamp.toDate();
  const hoursDiff = (now - cacheTime) / (1000 * 60 * 60);
  return hoursDiff < CACHE_DURATION_HOURS;
}

/**
 * Format BigQuery results to match frontend Story interface
 */
function formatStories(rows) {
  return rows.map(row => ({
    id: row.id?.toString() || '',
    title: row.title || '',
    text: row.text || null,
    url: row.url || null,
    score: row.score?.toString() || null,
    parent: row.parent?.toString() || null,
    ranking: row.ranking?.toString() || null,
    descendants: row.descendants?.toString() || null,
    timestamp: row.timestamp?.value || row.timestamp || ''
  }));
}

/**
 * Main Cloud Function entry point
 */
exports.fetchHackerNewsStories = async (req, res) => {
  // Set CORS headers manually for all requests
  const allowedOrigins = [
    'http://localhost:5173',
    'https://my-hacker-news-navy.vercel.app',
    'https://hacker-news-ai-dev-feed.vercel.app'
  ];

  const origin = req.headers.origin;
  if (allowedOrigins.includes(origin)) {
    res.set('Access-Control-Allow-Origin', origin);
  }

  res.set('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.set('Access-Control-Allow-Headers', 'Content-Type, x-api-key');
  res.set('Access-Control-Max-Age', '3600');

  // Handle preflight OPTIONS request
  if (req.method === 'OPTIONS') {
    return res.status(204).send('');
  }

  return cors(req, res, async () => {
    try {
      // Only allow GET requests
      if (req.method !== 'GET') {
        return res.status(405).json({ error: 'Method not allowed' });
      }

      // Optional: Check for API key in production
      const apiKey = req.headers['x-api-key'];
      const expectedApiKey = process.env.API_KEY;

      if (expectedApiKey && apiKey !== expectedApiKey) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      // Parse and validate pagination parameters
      const limit = Math.min(Math.max(parseInt(req.query.limit) || 200, 1), 500); // Min 1, Max 500
      const offset = Math.max(parseInt(req.query.offset) || 0, 0); // Min 0

      console.log(`Fetching stories with limit: ${limit}, offset: ${offset}`);

      const queryHash = getQueryHash(BASE_QUERY, limit, offset);
      const cacheRef = firestore.collection(CACHE_COLLECTION).doc(queryHash);

      // Check cache first
      const cacheDoc = await cacheRef.get();

      if (cacheDoc.exists) {
        const cacheData = cacheDoc.data();
        if (isCacheValid(cacheData.timestamp)) {
          console.log('Returning cached data');
          return res.json({
            stories: cacheData.stories,
            cached: true,
            lastUpdated: cacheData.timestamp.toDate().toISOString(),
            pagination: {
              limit: cacheData.limit || limit,
              offset: cacheData.offset || offset,
              count: cacheData.stories.length,
              hasMore: cacheData.stories.length === (cacheData.limit || limit)
            }
          });
        }
      }

      // Cache miss or expired - query BigQuery
      console.log('Querying BigQuery...');
      const [rows] = await bigquery.query({
        query: buildQuery(limit, offset),
        location: 'US',
      });

      const stories = formatStories(rows);

      // Update cache
      await cacheRef.set({
        stories,
        timestamp: Firestore.Timestamp.now(),
        queryText: BASE_QUERY, // This will be overwritten by buildQuery
        limit,
        offset
      });

      console.log(`Fetched ${stories.length} stories from BigQuery`);

      return res.json({
        stories,
        cached: false,
        lastUpdated: new Date().toISOString(),
        pagination: {
          limit,
          offset,
          count: stories.length,
          hasMore: stories.length === limit
        }
      });

    } catch (error) {
      console.error('Error:', error);
      return res.status(500).json({
        error: 'Failed to fetch stories',
        message: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
      });
    }
  });
};
