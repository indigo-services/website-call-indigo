#!/bin/bash

# Add deploy key to GitHub using GitHub CLI
# This ensures Easypanel can access the repository

DEPLOY_KEY_PUBLIC="ssh-ed25519 AAAAC3NzaC1lZDI1NTE5AAAAIFK+h9uzv6xOy0pFVn2ecJhevb7j8aZ69sANxWDfWH1D easypanel@riostack"
REPO="indigo-services/indigo-studio"
KEY_TITLE="Easypanel-Production-Server"

echo "🔑 Adding deploy key to GitHub..."
echo "Repository: $REPO"
echo "Key: $DEPLOY_KEY_PUBLIC"

# Check if gh CLI is available
if command -v gh &> /dev/null; then
    echo "Using GitHub CLI..."
    
    # Add deploy key with write access
    echo "$DEPLOY_KEY_PUBLIC" | gh repo deploy-key add "$REPO" --title "$KEY_TITLE" --write-access || echo "Key might already exist"
    
    echo "✅ Deploy key configuration complete"
else
    echo "❌ GitHub CLI not found. Manual steps:"
    echo "1. Go to: https://github.com/indigo-services/indigo-studio/settings/keys"
    echo "2. Click 'Add deploy key'"
    echo "3. Title: 'Easypanel Production Server'"
    echo "4. Key: $DEPLOY_KEY_PUBLIC"
    echo "5. ✅ Check 'Allow write access'"
    echo "6. Click 'Add key'"
fi

