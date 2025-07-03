# Deployment Guide: BigQuery Integration

This guide walks you through deploying the Hacker News BigQuery integration with Google Cloud Functions and Firestore caching.

## Prerequisites

1. **Google Cloud Account**: You need a Google Cloud account with billing enabled
2. **Google Cloud CLI**: Install the gcloud CLI tool

## Step 1: Install Google Cloud CLI

### macOS
```bash
# Run the install script
./install-gcloud.sh
```

### Manual Installation
```bash
# Download and install
curl https://sdk.cloud.google.com | bash

# Restart your shell
exec -l $SHELL

# Initialize gcloud
gcloud init
```

## Step 2: Automated Setup

Run the setup script to automatically configure everything:

```bash
./setup-gcloud.sh
```

This script will:
- ✅ Enable required Google Cloud APIs
- 🗄️ Create Firestore database
- 🚀 Deploy the Cloud Function
- 📝 Create .env file with function URL

## Step 3: Manual Setup (Alternative)

If you prefer to set up manually:

### 1. Enable APIs
```bash
gcloud services enable bigquery.googleapis.com
gcloud services enable cloudfunctions.googleapis.com  
gcloud services enable firestore.googleapis.com
gcloud services enable cloudbuild.googleapis.com
gcloud services enable run.googleapis.com  # Required for Cloud Functions Gen 2
```

### 2. Create Firestore Database
```bash
gcloud firestore databases create --location=us-central1 --type=firestore-native
```

### 3. Deploy Cloud Function
```bash
cd cloud-function
npm install
# Create .gitignore file to avoid deployment errors
echo "node_modules/
.env
.env.local
*.log" > .gitignore

gcloud functions deploy fetchHackerNewsStories \
    --gen2 \
    --runtime nodejs20 \
    --trigger-http \
    --allow-unauthenticated \
    --region us-central1 \
    --memory 512MB \
    --timeout 60s
```

### 4. Get Function URL
```bash
gcloud functions describe fetchHackerNewsStories --region us-central1 --format="value(httpsTrigger.url)"
```

### 5. Update Environment Variables
Create `.env` file in project root:
```
VITE_CLOUD_FUNCTION_URL=https://your-function-url-here
```

## Step 4: Test the Integration

1. Start your React app:
   ```bash
   npm run dev
   ```

2. Click the "Live Data" button in the app

3. Verify data loads from BigQuery

## Cost Management

### Expected Costs
- **BigQuery**: $0/month (well within 1TB free tier)
- **Cloud Functions**: Free tier (2M invocations/month)
- **Firestore**: Free tier (50K reads/day, 20K writes/day)
- **Total**: $0/month

### Monitoring
- Set up billing alerts in [Google Cloud Console](https://console.cloud.google.com/billing)
- Monitor function executions and BigQuery usage
- Cache refreshes every hour for fresh data (still within free tier)

## Architecture Overview

```
React App → Cloud Function → BigQuery (cached in Firestore)
```

1. **Frontend**: React app with toggle between static and live data
2. **Cloud Function**: Node.js function that queries BigQuery
3. **Caching**: Firestore stores results for 1 hour
4. **Fallback**: Static JSON data if Cloud Function fails

## Troubleshooting

### Common Issues

1. **Function deployment fails**
   - Check if all APIs are enabled
   - Verify billing is enabled on your project
   - Ensure you have sufficient IAM permissions

2. **BigQuery permission errors**
   - The public dataset should be accessible by default
   - Check your project has BigQuery API enabled

3. **Firestore permission errors**
   - Ensure Firestore API is enabled
   - Check that the database was created successfully

4. **CORS errors in frontend**
   - The Cloud Function includes CORS headers
   - Verify the function URL is correct in your .env file

### Getting Help

- Check [Google Cloud Function logs](https://console.cloud.google.com/functions)
- View BigQuery job history in [BigQuery Console](https://console.cloud.google.com/bigquery)
- Monitor Firestore usage in [Firestore Console](https://console.cloud.google.com/firestore)

## Security Notes

### Current Security Measures
- **CORS Protection**: Cloud Function only accepts requests from authorized domains:
  - Development: `http://localhost:5173`
  - Production: `https://my-hacker-news-navy.vercel.app`
- **No Sensitive Data**: Only public BigQuery data is cached
- **Optional API Key**: Can be enabled by setting `API_KEY` environment variable

### Additional Security Options
1. **Enable API Key Authentication**:
   ```bash
   gcloud functions deploy fetchHackerNewsStories \
       --gen2 \
       --runtime nodejs20 \
       --trigger-http \
       --allow-unauthenticated \
       --region us-central1 \
       --memory 512MB \
       --timeout 60s \
       --set-env-vars API_KEY=your-secret-key
   ```

2. **Monitor Usage**: Set up billing alerts to prevent unexpected costs

### Domain Restrictions
The Cloud Function uses CORS to restrict access to authorized domains only. Other websites cannot make requests to your API from browsers, but direct API calls (curl, Postman) will still work.