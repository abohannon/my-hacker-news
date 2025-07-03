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
```

### 2. Create Firestore Database
```bash
gcloud firestore databases create --location=us-central1 --type=firestore-native
```

### 3. Deploy Cloud Function
```bash
cd cloud-function
npm install
gcloud functions deploy fetchHackerNewsStories \
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
- **BigQuery**: ~$2.40/month (120 queries × $0.02)
- **Cloud Functions**: Free tier (2M invocations/month)
- **Firestore**: Free tier (50K reads/day, 20K writes/day)
- **Total**: <$3/month

### Monitoring
- Set up billing alerts in [Google Cloud Console](https://console.cloud.google.com/billing)
- Monitor function executions and BigQuery usage
- Cache refreshes every 6 hours to minimize costs

## Architecture Overview

```
React App → Cloud Function → BigQuery (cached in Firestore)
```

1. **Frontend**: React app with toggle between static and live data
2. **Cloud Function**: Node.js function that queries BigQuery
3. **Caching**: Firestore stores results for 6 hours
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

- The Cloud Function is publicly accessible (required for frontend)
- No sensitive data is stored in the caching layer
- Consider adding API key authentication for production use
- Monitor usage to prevent unexpected costs