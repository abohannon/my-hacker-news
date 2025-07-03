const { BigQuery } = require('@google-cloud/bigquery');
const { Firestore } = require('@google-cloud/firestore');
const cors = require('cors')({ origin: true });
const crypto = require('crypto');

// Initialize clients
const bigquery = new BigQuery();
const firestore = new Firestore();

// Cache configuration
const CACHE_COLLECTION = 'hn_cache';
const CACHE_DURATION_HOURS = 6;

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
    LOWER(title) LIKE '%agentic%'
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
LIMIT 100
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
  return cors(req, res, async () => {
    try {
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
        message: error.message
      });
    }
  });
};