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
    FUNCTION_URL=$(gcloud functions describe fetchHackerNewsStories --region us-central1 --format="value(httpsTrigger.url)" 2>/dev/null)

    if [ -z "$FUNCTION_URL" ]; then
        echo "⚠️  Could not retrieve function URL automatically"
        echo "🌐 Please manually set VITE_CLOUD_FUNCTION_URL in your .env file"
        echo "   You can find the URL in the Google Cloud Console"
        exit 0
    fi

    echo "🌐 Function URL: $FUNCTION_URL"

    # Navigate back to project root
    cd ..

    # Update .env file if it exists, otherwise create it
    if [ -f ".env" ]; then
        echo "📝 Updating .env file..."
        # Cross-platform sed command
        if [[ "$OSTYPE" == "darwin"* ]]; then
            # macOS
            sed -i '' "s|VITE_CLOUD_FUNCTION_URL=.*|VITE_CLOUD_FUNCTION_URL=$FUNCTION_URL|" .env
        else
            # Linux
            sed -i "s|VITE_CLOUD_FUNCTION_URL=.*|VITE_CLOUD_FUNCTION_URL=$FUNCTION_URL|" .env
        fi
        echo "✅ .env file updated"
    else
        echo "📝 Creating .env file..."
        echo "VITE_CLOUD_FUNCTION_URL=$FUNCTION_URL" > .env
        echo "✅ .env file created"
    fi

    # Also create/update .env.local for local development
    if [ -f ".env.local" ]; then
        echo "📝 Updating .env.local file..."
        if [[ "$OSTYPE" == "darwin"* ]]; then
            sed -i '' "s|VITE_CLOUD_FUNCTION_URL=.*|VITE_CLOUD_FUNCTION_URL=$FUNCTION_URL|" .env.local
        else
            sed -i "s|VITE_CLOUD_FUNCTION_URL=.*|VITE_CLOUD_FUNCTION_URL=$FUNCTION_URL|" .env.local
        fi
        echo "✅ .env.local file updated"
    else
        echo "📝 Creating .env.local file..."
        echo "VITE_CLOUD_FUNCTION_URL=$FUNCTION_URL" > .env.local
        echo "✅ .env.local file created"
    fi

    echo ""
    echo "🎉 Deployment complete!"
    echo "💡 Your React app will use the updated function automatically"
else
    echo "❌ Deployment failed"
    exit 1
fi
