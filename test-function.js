#!/usr/bin/env node

/**
 * Test script to verify the Cloud Function works correctly
 */

const https = require('https');
const fs = require('fs');
const path = require('path');

// Read the function URL from .env file
const envPath = path.join(__dirname, '.env');
let functionUrl = null;

if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf8');
  const match = envContent.match(/VITE_CLOUD_FUNCTION_URL=(.+)/);
  if (match) {
    functionUrl = match[1].trim();
  }
}

if (!functionUrl) {
  console.error('❌ Function URL not found in .env file');
  console.log('Please run ./setup-gcloud.sh first or manually set VITE_CLOUD_FUNCTION_URL');
  process.exit(1);
}

console.log('🧪 Testing Cloud Function...');
console.log('📡 Function URL:', functionUrl);

const startTime = Date.now();

// Make request to Cloud Function
const url = new URL(functionUrl);
const options = {
  hostname: url.hostname,
  port: url.port || 443,
  path: url.pathname,
  method: 'GET',
  headers: {
    'Content-Type': 'application/json',
  }
};

const req = https.request(options, (res) => {
  let data = '';
  
  res.on('data', (chunk) => {
    data += chunk;
  });
  
  res.on('end', () => {
    const endTime = Date.now();
    const duration = endTime - startTime;
    
    console.log(`⏱️  Response time: ${duration}ms`);
    console.log(`📊 Status code: ${res.statusCode}`);
    
    if (res.statusCode === 200) {
      try {
        const response = JSON.parse(data);
        console.log('✅ Function executed successfully!');
        console.log(`📰 Stories returned: ${response.stories ? response.stories.length : 0}`);
        console.log(`🏪 Data cached: ${response.cached ? 'Yes' : 'No'}`);
        console.log(`🕐 Last updated: ${response.lastUpdated}`);
        
        if (response.stories && response.stories.length > 0) {
          console.log('🔍 Sample story:');
          const sample = response.stories[0];
          console.log(`   Title: ${sample.title}`);
          console.log(`   Score: ${sample.score}`);
          console.log(`   URL: ${sample.url}`);
        }
      } catch (error) {
        console.error('❌ Failed to parse response:', error);
        console.log('Raw response:', data);
      }
    } else {
      console.error('❌ Function returned error:', res.statusCode);
      console.log('Response:', data);
    }
  });
});

req.on('error', (error) => {
  console.error('❌ Request failed:', error);
});

req.setTimeout(30000, () => {
  console.error('❌ Request timed out');
  req.destroy();
});

req.end();