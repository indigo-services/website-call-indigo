#!/bin/bash
# Full stack deployment script

echo "🚀 Full Stack Deployment"
echo "========================"

# Deploy Strapi backend first
echo ""
echo "📦 Step 1: Deploy Strapi Backend to EasyPanel"
./scripts/deploy-strapi.sh

# Wait for Strapi to be ready
echo ""
echo "⏳ Waiting for Strapi to be ready..."
sleep 10

# Deploy Next.js frontend
echo ""
echo "📦 Step 2: Deploy Next.js Frontend to Vercel"
cd next && vercel --prod && cd ..

echo ""
echo "✅ Full Stack Deployment Complete!"
echo ""
echo "🌐 Available URLs:"
echo "  Frontend: https://indigo-website-cms.vercel.app"
echo "  Backend:  https://studio.call-indigo.com"
echo "  Website:  https://call-indigo.com"