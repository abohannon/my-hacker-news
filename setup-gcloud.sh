#!/bin/bash

# Google Cloud Setup Script for Hacker News Project

echo "🚀 Setting up Google Cloud for Hacker News BigQuery Integration"
echo "================================================================"

# Check if gcloud is installed
if ! command -v gcloud &> /dev/null; then
    echo "❌ Google Cloud CLI is not installed. Please run:"
    echo "   curl https://sdk.cloud.google.com | bash"
    echo "   exec -l \$SHELL"
    echo "   gcloud init"
    exit 1
fi

echo "✅ Google Cloud CLI is installed"

# Get current project
CURRENT_PROJECT=$(gcloud config get-value project 2>/dev/null)
if [ -z "$CURRENT_PROJECT" ]; then
    echo "❌ No Google Cloud project is set. Please run 'gcloud init' first."
    exit 1
fi

echo "📋 Current project: $CURRENT_PROJECT"

# Enable required APIs
echo "🔧 Enabling required Google Cloud APIs..."
gcloud services enable bigquery.googleapis.com
gcloud services enable cloudfunctions.googleapis.com  
gcloud services enable firestore.googleapis.com
gcloud services enable cloudbuild.googleapis.com

echo "✅ APIs enabled"

# Create Firestore database (if not exists)
echo "🗄️  Setting up Firestore database..."
gcloud firestore databases create --location=us-central1 --type=firestore-native || echo "Firestore database already exists"

echo "✅ Firestore database ready"

# Deploy Cloud Function
echo "🚀 Deploying Cloud Function..."
cd cloud-function

# Install dependencies
npm install

# Deploy the function
gcloud functions deploy fetchHackerNewsStories \
    --runtime nodejs20 \
    --trigger-http \
    --allow-unauthenticated \
    --region us-central1 \
    --memory 512MB \
    --timeout 60s

# Get the function URL
FUNCTION_URL=$(gcloud functions describe fetchHackerNewsStories --region us-central1 --format="value(httpsTrigger.url)")

echo "✅ Cloud Function deployed successfully!"
echo "🌐 Function URL: $FUNCTION_URL"

# Go back to project root
cd ..

# Update the .env file with the function URL
echo "📝 Creating .env file with function URL..."
cat > .env << EOL
VITE_CLOUD_FUNCTION_URL=$FUNCTION_URL
EOL

echo "✅ .env file created with function URL"

echo ""
echo "🎉 Setup complete! Your Hacker News BigQuery integration is ready."
echo ""
echo "Next steps:"
echo "1. Start your React development server: npm run dev"
echo "2. Click the 'Live Data' button to fetch from BigQuery"
echo "3. Monitor usage in Google Cloud Console"
echo ""
echo "💡 Estimated costs: <$3/month with 6-hour cache intervals"
echo "🔍 Monitor usage: https://console.cloud.google.com/billing"