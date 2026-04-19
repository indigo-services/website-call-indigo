#!/bin/bash
# Check deployment status of both apps

echo "📊 Multi-App Deployment Status"
echo "==============================="
echo ""

# Next.js Frontend (Vercel)
echo "🎨 Next.js Frontend (Vercel)"
echo "-----------------------------"
if vercel list --scope indigo-projects 2>/dev/null | grep -q "app-indigo-studio"; then
    echo "✅ Deployed to Vercel"
    vercel list --scope indigo-projects | head -5
else
    echo "❌ Not found on Vercel"
fi

echo ""
echo "🗄️  Strapi Backend (EasyPanel)"
echo "------------------------------"
# Check if Strapi is running
if curl -s "https://studio.call-indigo.com" > /dev/null; then
    echo "✅ Deployed to EasyPanel"
    echo "🌐 URL: https://studio.call-indigo.com"
    echo "🏥 Health: $(curl -s "https://studio.call-indigo.com/health" || echo 'Checking...')"
else
    echo "❌ Not accessible on EasyPanel"
fi

echo ""
echo "🔗 Integration Status"
echo "--------------------"
if grep -q "NEXT_PUBLIC_API_URL=https://studio.call-indigo.com" next/.env 2>/dev/null; then
    echo "✅ Frontend configured to use Strapi backend"
else
    echo "⚠️  Frontend may not be properly configured"
fi

echo ""
echo "📋 Deployment Summary"
echo "--------------------"
echo "Frontend: Next.js → Vercel → https://indigo-website-cms.vercel.app"
echo "Backend:  Strapi → EasyPanel → https://studio.call-indigo.com"
echo "Website: Combined → https://call-indigo.com"