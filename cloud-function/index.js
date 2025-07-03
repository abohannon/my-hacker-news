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
const QUERY = `
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
    LOWER(title) LIKE '%copilot%' OR
    LOWER(title) LIKE '%codewhisperer%' OR
    LOWER(title) LIKE '%replit%' OR
    LOWER(title) LIKE '%cursor%' OR
    LOWER(title) LIKE '%windsurf%' OR
    LOWER(title) LIKE '%ai coding%' OR
    LOWER(title) LIKE '%vibe coding%' OR
    LOWER(title) LIKE '%agentic%' OR
    LOWER(title) LIKE '%claude%' OR
    LOWER(title) LIKE '%anthropic%' OR
    LOWER(title) LIKE '%gemini%' OR
    LOWER(title) LIKE '%bard%' OR
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
    LOWER(title) LIKE '%v0%' OR
    LOWER(title) LIKE '%bolt.new%' OR
    LOWER(title) LIKE '%lovable%' OR
    LOWER(title) LIKE '%devin%' OR
    LOWER(title) LIKE '%ai agent%' OR
    LOWER(title) LIKE '%coding agent%'
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
LIMIT 200
`;

/**
 * Generate a hash of the query for cache key
 */
function getQueryHash(query) {
  return crypto.createHash('md5').update(query).digest('hex');
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
      const queryHash = getQueryHash(QUERY);
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
            lastUpdated: cacheData.timestamp.toDate().toISOString()
          });
        }
      }
      
      // Cache miss or expired - query BigQuery
      console.log('Querying BigQuery...');
      const [rows] = await bigquery.query({
        query: QUERY,
        location: 'US',
      });
      
      const stories = formatStories(rows);
      
      // Update cache
      await cacheRef.set({
        stories,
        timestamp: Firestore.Timestamp.now(),
        queryText: QUERY
      });
      
      console.log(`Fetched ${stories.length} stories from BigQuery`);
      
      return res.json({
        stories,
        cached: false,
        lastUpdated: new Date().toISOString()
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