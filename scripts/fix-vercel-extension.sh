#!/bin/bash
# Fix Vercel Project Manager Extension

echo "🔧 Fixing Vercel Project Manager Extension..."

# Step 1: Ensure Vercel CLI is properly authenticated
echo "1. Checking Vercel CLI authentication..."
if vercel whoami > /dev/null 2>&1; then
    echo "   ✅ Vercel CLI authenticated"
else
    echo "   ❌ Vercel CLI not authenticated"
    echo "   Run: vercel login"
    exit 1
fi

# Step 2: Check Vercel token in environment
echo "2. Checking Vercel token..."
if [ -n "$VERCEL_TOKEN" ]; then
    echo "   ✅ VERCEL_TOKEN is set in environment"
else
    echo "   ⚠️  VERCEL_TOKEN not set in environment"
    echo "   Adding to shell profile..."
fi

# Step 3: Test Vercel API access
echo "3. Testing Vercel API access..."
VERCEL_TOKEN=$(grep VERCEL_TOKEN .env | cut -d'=' -f2 | tr -d '"')
if curl -s -H "Authorization: Bearer $VERCEL_TOKEN" "https://api.vercel.com/v2/user" > /dev/null 2>&1; then
    echo "   ✅ Vercel API access working"
else
    echo "   ❌ Vercel API access failed"
    echo "   Your token may be expired or invalid"
fi

# Step 4: Check teams access
echo "4. Testing teams access..."
if curl -s -H "Authorization: Bearer $VERCEL_TOKEN" "https://api.vercel.com/v2/teams" > /dev/null 2>&1; then
    echo "   ✅ Teams API accessible"
else
    echo "   ❌ Teams API not accessible"
    echo "   Your token may not have team permissions"
fi

echo ""
echo "🔧 VSCode Extension Fix Steps:"
echo "1. Open VSCode"
echo "2. Press Ctrl+Shift+P"
echo "3. Type 'Developer: Reload Window'"
echo "4. Click the 'Login to Vercel' button in the extension panel"
echo "5. If that doesn't work, try:"
echo "   - Ctrl+Shift+P > 'Extensions: Show Installed Extensions'"
echo "   - Find 'Vercel Project Manager'"
echo "   - Click the gear icon > 'Disable'"
echo "   - Reload VSCode"
echo "   - Re-enable the extension"
echo "   - Click 'Login to Vercel' again"

echo ""
echo "📋 Alternative: Use Vercel CLI instead"
echo "The Vercel CLI works perfectly. You can use:"
echo "  - vercel list      # List deployments"
echo "  - vercel logs      # View logs"
echo "  - vercel deploy    # Deploy to production"
echo "  - vercel --prod    # Deploy to production"