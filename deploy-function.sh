#!/bin/bash

# Deploy Cloud Function Script for Hacker News Project

echo "🚀 Deploying Cloud Function: fetchHackerNewsStories"
echo "=================================================="

# Navigate to cloud-function directory
cd cloud-function

# Install dependencies
echo "📦 Installing dependencies..."
npm install

# Deploy the function
echo "🔧 Deploying function..."
gcloud functions deploy fetchHackerNewsStories \
    --gen2 \
    --runtime nodejs20 \
    --trigger-http \
    --allow-unauthenticated \
    --region us-central1 \
    --memory 512MB \
    --timeout 60s

# Check deployment status
if [ $? -eq 0 ]; then
    echo "✅ Function deployed successfully!"
    
    # Get the function URL
    FUNCTION_URL=$(gcloud functions describe fetchHackerNewsStories --region us-central1 --format="value(httpsTrigger.url)")
    echo "🌐 Function URL: $FUNCTION_URL"
    
    # Navigate back to project root
    cd ..
    
    # Update .env file if it exists
    if [ -f ".env" ]; then
        echo "📝 Updating .env file..."
        sed -i '' "s|VITE_CLOUD_FUNCTION_URL=.*|VITE_CLOUD_FUNCTION_URL=$FUNCTION_URL|" .env
        echo "✅ .env file updated"
    else
        echo "📝 Creating .env file..."
        echo "VITE_CLOUD_FUNCTION_URL=$FUNCTION_URL" > .env
        echo "✅ .env file created"
    fi
    
    echo ""
    echo "🎉 Deployment complete!"
    echo "💡 Your React app will use the updated function automatically"
else
    echo "❌ Deployment failed"
    exit 1
fi