#!/bin/bash
# Deploy Strapi to EasyPanel

echo "🚀 Deploying Strapi to EasyPanel..."

# Check EasyPanel configuration
if [ -z "$EASYPANEL_API" ]; then
    echo "❌ EASYPANEL_API not set"
    exit 1
fi

# Build Docker image
echo "🐳 Building Docker image..."
docker build -f strapi/Dockerfile -t indigo-strapi:latest .

# Tag for EasyPanel registry
echo "🏷️  Tagging image..."
docker tag indigo-strapi:latest vps10.riolabs.ai/indigo-strapi:latest

# Push to EasyPanel registry
echo "📤 Pushing to EasyPanel..."
docker push vps10.riolabs.ai/indigo-strapi:latest

# Trigger EasyPanel deployment
echo "🔄 Triggering EasyPanel deployment..."
curl -X POST "$EASYPANEL_API_URL/services/$EASYPANEL_SERVICE_NAME/redeploy" \
    -H "Authorization: Bearer $EASYPANEL_API" \
    -H "Content-Type: application/json"

echo "✅ Strapi deployment complete!"
echo "🌐 Available at: https://studio.call-indigo.com"