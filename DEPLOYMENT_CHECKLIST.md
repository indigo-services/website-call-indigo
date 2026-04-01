# Production Deployment Checklist

## Pre-Deployment Verification (Local)

### Environment & Build
- [ ] All environment variables defined in `.env.production`
- [ ] Build succeeds locally: `yarn build`
- [ ] No build warnings or errors in Next.js
- [ ] Strapi build passes: `yarn build --prefix strapi`
- [ ] All dependencies resolved: `yarn install`
- [ ] Lock files committed (yarn.lock)

### Code Quality
- [ ] Linting passes: `yarn lint`
- [ ] Code formatting correct: `yarn fix:format`
- [ ] No TypeScript errors: `tsc --noEmit`
- [ ] All tests passing (if applicable)
- [ ] No console warnings in production mode
- [ ] No hardcoded secrets or credentials

### Performance
- [ ] Next.js build size acceptable (<500KB gzipped)
- [ ] Core Web Vitals targets met (LCP<2.5s, FID<100ms, CLS<0.1)
- [ ] Images optimized (using Next.js Image component)
- [ ] No missing image optimization configs
- [ ] Caching headers properly configured

### Security
- [ ] HTTPS enabled and SSL valid
- [ ] Security headers configured (CSP, X-Frame-Options, etc.)
- [ ] JWT secrets rotated
- [ ] API key rotation scheduled
- [ ] Environment variables properly scoped
- [ ] No exposed sensitive data in commits

### Strapi Configuration
- [ ] Database migrations completed
- [ ] Strapi build passes: `cd strapi && yarn build`
- [ ] Content types validated
- [ ] API permissions configured
- [ ] Authentication settings validated
- [ ] Plugin versions compatible

## Vercel Deployment

### Configuration
- [ ] `vercel.json` configured correctly
- [ ] Build command verified: `cd next && yarn build`
- [ ] Environment variables set in Vercel console
- [ ] Regions configured (iad1, sfo1)
- [ ] Domains configured with SSL
- [ ] Git integration active (GitHub/GitLab)

### Pre-Deployment
- [ ] Preview URL tested on staging
- [ ] All features tested on preview deployment
- [ ] Performance benchmarks recorded
- [ ] Rollback plan in place
- [ ] Communication sent to team

### Deployment
- [ ] Feature branch merged to main
- [ ] GitHub Actions workflows passing
- [ ] Vercel build logs reviewed
- [ ] Deployment completed successfully
- [ ] Production URL accessible
- [ ] Health check endpoint responding

## Post-Deployment Verification

### Functionality
- [ ] Website loads and renders correctly
- [ ] API endpoints responding (200 status)
- [ ] Database queries executing properly
- [ ] Authentication working end-to-end
- [ ] User sessions functioning
- [ ] File uploads working
- [ ] All pages render without errors

### Performance
- [ ] Core Web Vitals checked (Web Vitals report)
- [ ] Page load times acceptable
- [ ] API response times normal
- [ ] No memory leaks detected
- [ ] Bundle analysis reviewed
- [ ] Lighthouse score > 90

### Monitoring
- [ ] Analytics tracking active
- [ ] Error tracking configured (Sentry, etc.)
- [ ] Performance monitoring enabled
- [ ] Uptime monitoring active
- [ ] Alerting configured
- [ ] Logs accessible and readable

### External Services
- [ ] Mail service operational
- [ ] CDN cache invalidated
- [ ] Database backups running
- [ ] Storage service accessible
- [ ] Third-party integrations working
- [ ] Webhooks configured

## Maintenance

### Post-Deployment (Next 24 Hours)
- [ ] Monitor error logs for issues
- [ ] Check analytics for anomalies
- [ ] Verify no spike in failed requests
- [ ] Confirm email delivery working
- [ ] Check database stability
- [ ] Monitor resource usage

### Weekly
- [ ] Review error logs
- [ ] Check performance metrics
- [ ] Verify backup integrity
- [ ] Update dependencies (patch/minor)
- [ ] Review security patches
- [ ] Check cost usage

### Monthly
- [ ] Security audit
- [ ] Dependency update review
- [ ] Performance optimization review
- [ ] Database optimization
- [ ] Cost analysis
- [ ] Capacity planning

## Rollback Procedure

If critical issues occur:

```bash
# Rollback to previous deployment
vercel rollback [deployment-url]

# Or use Vercel CLI
vercel --prod --force

# Immediate steps
1. Notify team on Slack
2. Check error logs for root cause
3. Determine rollback vs. fix-forward
4. Execute rollback if needed
5. Verify previous version stable
6. Post-incident review
```

## Emergency Contacts

- **DevOps Lead**: [Contact]
- **Senior Dev**: [Contact]
- **On-Call**: [Schedule link]

## Deployment History

| Date | Version | Changes | Status |
|------|---------|---------|--------|
| | | | |

## Notes

- Always deploy during business hours for first deployment
- Have team available for the first 2 hours post-deployment
- Maintain version tags in git
- Document all environment-specific configurations
- Keep this checklist updated as infrastructure evolves
