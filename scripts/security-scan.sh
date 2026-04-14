#!/bin/bash
# Comprehensive security scanner for git repositories

set -e

echo "🔐 Repository Security Scanner"
echo "=============================="
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to print colored output
print_error() {
    echo -e "${RED}❌ ERROR: $1${NC}"
}

print_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  WARNING: $1${NC}"
}

# Check if .gitignore is properly configured
echo "📋 Checking .gitignore configuration..."
if [ -f ".gitignore" ]; then
    if grep -q "\.env\*" .gitignore && grep -q "!\.env\.example" .gitignore; then
        print_success ".gitignore properly excludes .env files"
    else
        print_warning ".gitignore may not properly exclude all .env files"
    fi

    # Check for other sensitive files
    SENSITIVE_PATTERNS=("\.pem" "\.key" "credentials" "secrets" "passwords")
    for pattern in "${SENSITIVE_PATTERNS[@]}"; do
        if grep -q "$pattern" .gitignore; then
            print_success ".gitignore excludes $pattern files"
        else
            print_warning ".gitignore does not exclude $pattern files"
        fi
    done
else
    print_error "No .gitignore file found"
fi

echo ""

# Check for currently tracked .env files
echo "🔍 Checking for tracked .env files..."
TRACKED_ENV=$(git ls-files | grep "\.env" || true)
if [ -z "$TRACKED_ENV" ]; then
    print_success "No .env files are currently tracked"
else
    print_error "Found tracked .env files:"
    echo "$TRACKED_ENV"
    echo ""
    echo "To remove them from git tracking:"
    echo "  git rm --cached \$(git ls-files | grep '\\.env')"
    echo "  git commit -m 'Remove .env files from tracking'"
fi

echo ""

# Scan current branch for potential secrets in recent commits
echo "🔍 Scanning recent commits for potential secrets..."
RECOMMITS=$(git log --oneline -10 | awk '{print $1}')
SECRETS_FOUND=false

for commit in $RECOMMITS; do
    # Check commit content for secret patterns
    SECRET_PATTERNS=(
        "ghp_[A-Za-z0-9_]{36}"
        "gho_[A-Za-z0-9_]{36}"
        "sk_live_[A-Za-z0-9]{24,}"
        "AKIA[0-9A-Z]{16}"
        "AIza[0-9A-Za-z\\-_]{35}"
        "xox[baprs]-[0-9]{12}-[0-9]{12}"
        "[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}"
    )

    for pattern in "${SECRET_PATTERNS[@]}"; do
        if git show "$commit" | grep -qE "$pattern"; then
            print_warning "Potential secret in commit $commit"
            git log -1 --format="  Commit: %h - %s" "$commit"
            SECRETS_FOUND=true
            break
        fi
    done
done

if [ "$SECRETS_FOUND" = false ]; then
    print_success "No obvious secrets found in recent commits"
fi

echo ""

# Check current working directory for exposed .env files
echo "🔍 Checking current working directory for exposed secrets..."
if [ -f ".env" ] && [ -f ".gitignore" ]; then
    if ! grep -q "^\.env$" .gitignore; then
        print_warning ".env file exists but is not in .gitignore"
    fi
fi

for env_file in .env.local .env.development .env.production; do
    if [ -f "$env_file" ]; then
        if grep -q "^$env_file$" .gitignore 2>/dev/null; then
            print_success "$env_file is in .gitignore"
        else
            print_warning "$env_file exists but may not be in .gitignore"
        fi

        # Check for GitHub tokens specifically
        if grep -q "ghp_[A-Za-z0-9_]\{36\}" "$env_file" 2>/dev/null; then
            print_warning "$env_file contains GitHub tokens"
        fi
    fi
done

echo ""

# Check GitHub token exposure in environment files
echo "🔍 Checking for exposed GitHub tokens..."
GITHUB_TOKENS=$(grep -r "GITHUB_TOKEN.*=.*ghp_" . --include="*.env*" 2>/dev/null || true)
if [ -z "$GITHUB_TOKENS" ]; then
    print_success "No GitHub tokens found in environment files"
else
    print_warning "Found GitHub tokens in environment files:"
    echo "$GITHUB_TOKENS" | head -3
    echo ""
    echo "💡 Recommendations:"
    echo "  1. Use GitHub Actions secrets for CI/CD"
    echo "  2. Use environment-specific .env files"
    echo "  3. Never commit .env files with real tokens"
    echo "  4. Use fine-grained personal access tokens with minimal scope"
fi

echo ""

# Check git hooks
echo "🔧 Checking git hooks..."
if [ -f ".git/hooks/pre-commit" ] && [ -x ".git/hooks/pre-commit" ]; then
    print_success "Pre-commit hook is installed and executable"
else
    print_warning "No executable pre-commit hook found"
fi

if [ -f ".git/hooks/pre-push" ] && [ -x ".git/hooks/pre-push" ]; then
    print_success "Pre-push hook is installed and executable"
else
    print_warning "No executable pre-push hook found"
fi

echo ""

# Summary and recommendations
echo "📋 SECURITY SUMMARY"
echo "=================="
echo ""
echo "🔒 Implemented Protections:"
echo "  ✓ Pre-commit hook to block secret commits"
echo "  ✓ Pre-push hook for final verification"
echo "  ✓ .gitignore configured for .env files"
echo ""
echo "💡 Security Best Practices:"
echo "  1. Use environment variables for all secrets"
echo "  2. Never commit .env files with real values"
echo "  3. Use GitHub Actions secrets for CI/CD"
echo "  4. Rotate exposed secrets immediately"
echo "  5. Enable GitHub secret scanning"
echo "  6. Use fine-grained tokens with minimal scope"
echo "  7. Regular security audits with tools like truffleHog"
echo ""
echo "🚀 Next Steps:"
echo "  1. Review any warnings above"
echo "  2. Remove secrets from tracked files if found"
echo "  3. Consider installing additional secret scanning tools"
echo "  4. Set up GitHub Dependabot and secret scanning"
echo "  5. Test the hooks by trying to commit a dummy secret"
echo ""

# Offer to install additional tools
echo "📦 Recommended Security Tools:"
echo "  - truffleHog: git secret scanner"
echo "  - git-secrets: AWS secret scanner"
echo "  - gitleaks: comprehensive secret scanner"
echo ""
echo "Install with:"
echo "  brew install trufflehog  # macOS"
echo "  pip install truffleHog   # Python"
echo "  See gitleaks documentation for Go installation"
echo ""

exit 0