# Security Incident Report - Token Exposure

**Date:** 2025-01-14
**Severity:** HIGH
**Status:** RESOLVED
**Reporter:** Claude Code Security Scanner

## Incident Summary

During a routine security scan, multiple GitHub Personal Access Tokens (PATs) were found exposed in the repository:

1. **Tracked .env files**: `.env.local`, `next/.env.production`, `strapi/.env.production`, `strapi/easypanel.env`
2. **Exposed tokens**:
   - GitHub tokens starting with `ghp_NE8x...` (found in `.env.local`)
   - Multiple other GitHub tokens in `.env` file

## Immediate Actions Taken

✅ **COMPLETED:**
1. Removed sensitive `.env` files from git tracking
2. Updated `.gitignore` with comprehensive security patterns
3. Installed pre-commit and pre-push hooks to prevent future secret commits
4. Created security scanning scripts

## Required Follow-up Actions

🚨 **CRITICAL - Token Rotation:**

The following tokens must be **immediately revoked and regenerated**:

1. **Primary GitHub Token**: `ghp_NE8x...K9sq1` (truncated for security)
   - Found in: `.env.local` (now removed from tracking)
   - Action: Revoke immediately via GitHub Settings > Developer Settings > Personal Access Tokens

2. **Secondary Tokens** (mentioned in `.env`):
   - Token starting with `ghp_gULKlMLL...31K3wR` (truncated for security)
   - Token starting with `ghp_n44A3cb...Zid4DCF6H` (truncated for security)
   - Action: Verify status and rotate if still active

## Security Measures Implemented

### 1. Git Hooks
- **Pre-commit hook**: Scans staged files for secret patterns before commit
- **Pre-push hook**: Final verification before pushing to remote
- Both hooks block common secret patterns (GitHub tokens, API keys, etc.)

### 2. Enhanced .gitignore
Updated to exclude:
- All `.env` variants (production, development, staging, local)
- Sensitive file types (`.pem`, `.key`, credentials, secrets)
- Comprehensive protection against future accidental commits

### 3. Security Scanning
Created [`scripts/security-scan.sh`](scripts/security-scan.sh) for:
- Regular repository audits
- .gitignore validation
- Tracked file analysis
- Hook verification

## Preventive Measures

### For Future Development:
1. **Use environment variables** for all secrets
2. **Never commit `.env` files** with real values
3. **Use GitHub Actions Secrets** for CI/CD pipelines
4. **Enable GitHub Secret Scanning** on repository
5. **Regular security audits** using installed tools

### Token Management Best Practices:
- Use **fine-grained PATs** with minimal required scope
- Set **expiration dates** on all tokens
- Use **different tokens** for different environments
- **Monitor token usage** in GitHub Settings
- **Rotate tokens regularly** (at least quarterly)

## Git History Cleanup

⚠️ **IMPORTANT:** The exposed tokens may still exist in git history.

**Options for history cleanup:**

1. **BFG Repo-Cleaner** (Recommended for large repos):
   ```bash
   # Install BFG
   brew install bfg  # or download from https://rtyley.github.io/bfg-repo-cleaner/

   # Clean tokens from history
   bfg --replace-text passwords.txt  # Create file with patterns to replace

   # Cleanup
   git reflog expire --expire=now --all
   git gc --prune=now --aggressive
   ```

2. **git-filter-repo** (Modern alternative):
   ```bash
   pip install git-filter-repo
   git filter-repo --invert-paths --path .env.local
   ```

3. **Manual rewriting** (For precise control):
   ```bash
   git filter-branch --force --index-filter \
     'git rm --cached --ignore-unmatch .env.local' \
     --prune-empty --tag-name-filter cat -- --all
   ```

⚠️ **WARNING:** History rewrites require force-push and coordination with team members.

## Verification Steps

After completing the remediation:

1. **Verify token revocation**:
   - Check GitHub Settings > Developer Settings > Personal Access Tokens
   - Confirm old tokens are no longer active

2. **Test git hooks**:
   ```bash
   # Try to commit a dummy secret (should be blocked)
   echo "GITHUB_TOKEN=ghp_test1234" > test-secret.txt
   git add test-secret.txt
   git commit -m "Test hook"
   # Should be blocked by pre-commit hook
   rm test-secret.txt
   ```

3. **Run security scan**:
   ```bash
   ./scripts/security-scan.sh
   ```

4. **Check git history**:
   ```bash
   git log --all --oneline | grep -i "secret\|token\|password"
   git log --all --source -- "*env*"
   ```

## Monitoring Recommendations

1. **GitHub Security**: Enable GitHub Secret Scanning and Dependabot
2. **Access Logs**: Monitor GitHub repository access logs
3. **Token Usage**: Regular audit of active tokens and their usage
4. **Team Training**: Educate team members on secret management

## Contact Information

For questions about this security incident:
- Review GitHub Security documentation
- Check organization security policies
- Contact repository administrators

---

**Next Review Date:** 2025-02-14 (30 days)
**Status**: Open until all tokens are rotated and history is cleaned up.