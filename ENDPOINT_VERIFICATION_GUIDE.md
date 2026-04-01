# 🔍 Endpoint Verification Guide

**Development Server:** `http://localhost:3000` (Next.js)  
**Strapi Admin:** `http://localhost:1337/admin` (If Strapi running)  
**Test Date:** April 1, 2026

---

## 📋 Endpoint Checklist

Use this guide to verify each endpoint and capture screenshots. The dev server is already running in background.

---

## 1️⃣ Homepage (Default Locale: English)

**URL:** `http://localhost:3000`

**Expected to See:**
```
✅ Page title: "Indigo Studio"
✅ Navigation bar (from fallback data)
✅ Main content area
✅ Footer section
✅ No error messages
✅ Console shows: [StrapiError] (expected in dev)
✅ Page fully responsive
```

**Verification Steps:**
1. Visit `http://localhost:3000`
2. Wait for page to load (should be instant or ~2-3 seconds)
3. Look for navbar at top
4. Look for main content
5. Scroll to see footer
6. Open DevTools (F12) → Console tab → confirm [StrapiError] visible
7. **Screenshot:** Full page + console showing error

**Expected Console Output:**
```javascript
[StrapiError] Failed to fetch single type "global" {}
// ↑ This is EXPECTED and proves error handling works
```

---

## 2️⃣ French Locale Route

**URL:** `http://localhost:3000/fr`

**Expected to See:**
```
✅ Same page content as English
✅ URL shows: /fr (with prefix)
✅ Navigation renders (fallback data)
✅ Content loads
✅ No 404 error
✅ Responsive layout maintained
```

**Verification Steps:**
1. Visit `http://localhost:3000/fr`
2. Verify page loads (not 404)
3. Check URL bar shows `/fr`
4. Verify content visible
5. **Screenshot:** Full page with URL bar visible

**Note:** Without actual French translations in Strapi, content will be in fallback language. This proves routing works correctly even with missing CMS content.

---

## 3️⃣ Dashboard Component

**URL:** `http://localhost:3000/dashboard`

**Expected to See:**
```
✅ Dashboard title: "Deployment Readiness Dashboard"
✅ Section: Deployment Checklist (20+ checkboxes)
✅ All items visible
✅ Checkboxes are interactive (can click)
✅ Service status display
✅ Progress indicators
✅ Action buttons (Deploy, Validate, etc)
```

**Verification Steps:**
1. Visit `http://localhost:3000/dashboard`
2. Scroll through entire dashboard
3. Try clicking a checkbox (should toggle visual state)
4. Look for all sections
5. **Screenshot 1:** Top section with title and start of checklist
6. **Screenshot 2:** Middle section showing more checklist items
7. **Screenshot 3:** Bottom section with action buttons

**Interactive Test:**
- Click a checkbox → it should visually toggle
- Click "Validate" button → should show validation command
- Page should be fully responsive on mobile too

---

## 4️⃣ Health Check API Endpoint

**URL:** `http://localhost:3000/api/health`

**Expected to See:**
```json
{
  "status": "healthy",
  "timestamp": "2026-04-01T...",
  "services": {
    "nextjs": "healthy",
    "database": "checking...",
    "strapi": "unavailable"
  }
}
```

**Verification Steps:**
1. Visit `http://localhost:3000/api/health`
2. You should see JSON response
3. Page shows valid JSON structure
4. `status` field shows value
5. `timestamp` shows current time
6. `services` object shows status
7. **Screenshot:** Entire JSON response (use Ctrl+A, Ctrl+C to copy)

**Alternative (Terminal):**
```bash
curl http://localhost:3000/api/health
```
Then screenshot the terminal output.

---

## 5️⃣ Invalid Route (404 Handling)

**URL:** `http://localhost:3000/this-page-does-not-exist`

**Expected to See:**
```
✅ 404 page or error boundary
✅ Clear indication page not found
✅ Navigation still visible (fallback)
✅ No application crash
✅ Can navigate back to homepage
```

**Verification Steps:**
1. Visit `http://localhost:3000/this-page-does-not-exist`
2. Page should show 404 error
3. Navigation should still work
4. Logo/home link should still be clickable
5. **Screenshot:** 404 error page

**Success Indicator:** App doesn't crash, shows graceful error page.

---

## 6️⃣ Performance Check

**Location:** DevTools Network Tab

**Steps:**
1. Open `http://localhost:3000`
2. Press F12 to open DevTools
3. Click "Network" tab
4. Refresh page (Ctrl+R)
5. Look for page load files

**Expected to See:**
```
✅ Main document: ~50-100KB
✅ JavaScript bundles: Multiple chunks
✅ Image files: Optimized Next.js images
✅ CSS: Embedded or separate
✅ Total load time: < 3 seconds
✅ No 4xx or 5xx errors in network tab
```

**Screenshot:** Network tab showing all requests with load times

**Key Metrics to Capture:**
- Document load time
- Total page load time  
- Largest file size
- Number of requests
- Any failed requests (should be none)

---

## 7️⃣ Responsive Design Check

**Steps:**
1. Visit `http://localhost:3000`
2. Open DevTools (F12)
3. Click device toggle (mobile phone icon) or press Ctrl+Shift+M
4. Test these screen sizes:
   - Mobile: 375px (iPhone SE)
   - Tablet: 768px (iPad)
   - Desktop: 1920px (Full width)

**Expected to See at Each Size:**
```
Mobile (375px):
  ✅ Single column layout
  ✅ Navigation accessible
  ✅ Text readable
  ✅ Buttons tappable
  ✅ No horizontal scroll

Tablet (768px):
  ✅ Two-column layout (if applicable)
  ✅ Navigation visible
  ✅ Content well-proportioned

Desktop (1920px):
  ✅ Full layout
  ✅ Multi-column if designed
  ✅ Content centered
  ✅ No stretching artifacts
```

**Screenshots:** One from each breakpoint showing responsive adaptation

---

## 8️⃣ Error Boundary Recovery

**Steps:**
1. Visit `http://localhost:3000`
2. Open DevTools Console (F12)
3. Look for [StrapiError] message
4. **Verify:** Despite the error in console, page is still visible and functional

**Expected to See:**
```
Console:
[StrapiError] Failed to fetch single type "global" {}

Page Display:
✅ Content visible
✅ Navigation works
✅ No red error overlay
✅ App not crashed
```

**What This Proves:**
- Error boundaries are catching exceptions
- Fallback data is deployed
- Graceful degradation working
- Production-ready resilience confirmed

**Screenshot:** Split view showing both console error AND functional page content

---

## 9️⃣ Browser Console Inspection

**Steps:**
1. Visit `http://localhost:3000`
2. Open DevTools (F12)
3. Console tab
4. Clear console (if needed)
5. Refresh page

**Expected Messages:**
```
[StrapiError] Failed to fetch single type "global" {}
// This appears because:
// ✅ Strapi not running (expected in dev)
// ✅ Error handling working
// ✅ Fallback data deployed
// ✅ Component renders anyway
```

**What NOT to See:**
```
❌ React errors
❌ Unhandled promise rejections
❌ Stack traces
❌ Multiple error cascades
❌ Any indication app is broken
```

**Screenshot:** Console showing the StrapiError message only (clean console besides that)

---

## 🔟 TypeScript Validation Check

**Steps:**
1. Open terminal in VS Code
2. Run: `yarn tsc --noEmit`
3. Wait for check to complete

**Expected Output:**
```bash
# No errors output
# Should complete immediately with exit code 0
```

**OR Quick Check in DevTools:**
1. Visit `http://localhost:3000`
2. Open DevTools (F12)
3. No TypeScript errors should appear in console
4. All components should render without type errors

**Screenshot:** Terminal showing successful TypeScript check

---

## Summary Verification Checklist

- [ ] ✅ Homepage loads (http://localhost:3000)
- [ ] ✅ French route works (http://localhost:3000/fr)
- [ ] ✅ Dashboard interactive (http://localhost:3000/dashboard)
- [ ] ✅ Health API responds with JSON (http://localhost:3000/api/health)
- [ ] ✅ 404 page handles missing routes (http://localhost:3000/invalid)
- [ ] ✅ Page loads in < 3 seconds
- [ ] ✅ Network tab shows no errors
- [ ] ✅ Mobile responsive (375px)
- [ ] ✅ Tablet responsive (768px)
- [ ] ✅ Desktop responsive (1920px)
- [ ] ✅ Console shows [StrapiError] (expected)
- [ ] ✅ Page content visible despite error
- [ ] ✅ TypeScript validation passing

---

## 📸 Screenshot Locations

Create a `screenshots/` folder and save:

```
screenshots/
├── 01-homepage-desktop.png
├── 02-homepage-console-error.png
├── 03-french-route.png
├── 04-dashboard-top.png
├── 05-dashboard-middle.png
├── 06-dashboard-bottom.png
├── 07-api-health-json.png
├── 08-404-error-page.png
├── 09-network-tab-performance.png
├── 10-mobile-responsive-375px.png
├── 11-tablet-responsive-768px.png
├── 12-desktop-responsive-1920px.png
├── 13-error-boundary-working.png
└── 14-console-typescript-clean.png
```

---

## Commands to Run in Parallel

If you want to verify everything:

```bash
# Terminal 1: Dev server (already running)
# Check: http://localhost:3000

# Terminal 2: Validate production (already ran, but can re-run)
yarn validate:prod

# Terminal 3: Type check
yarn tsc --noEmit

# Terminal 4: Health check
curl http://localhost:3000/api/health
```

---

## ✅ All Endpoints Summary

| Endpoint | Type | Expected | Status |
|----------|------|----------|--------|
| `/` | Page | Homepage with fallback data | ✅ Ready |
| `/fr` | Page | French locale route | ✅ Ready |
| `/dashboard` | Page | Interactive checklist | ✅ Ready |
| `/api/health` | JSON | Health status | ✅ Ready |
| `/404` | Page | 404 error handling | ✅ Ready |

---

## 🎯 What Each Screenshot Proves

1. **Homepage Screenshot** → App renders with fallback data ✅
2. **Console Error Screenshot** → Error handling working ✅
3. **Dashboard Screenshot** → Components interactive ✅
4. **API Response Screenshot** → Health checks responding ✅
5. **Responsive Screenshots** → Mobile/tablet/desktop work ✅
6. **Error Boundary Screenshot** → Graceful degradation ✅
7. **Network Performance** → Fast load times ✅
8. **TypeScript Check** → Type safety maintained ✅

---

## 🚀 Next Step

Once you've captured screenshots:
1. Save them to `screenshots/` folder
2. Create `SCREENSHOTS_DOCUMENTATION.md` pointing to each one
3. This becomes your visual UAT proof
4. Ready for stakeholder sign-off before deployment

---

**Ready to Verify?** Start with homepage (`http://localhost:3000`) - should load instantly with fallback content and show [StrapiError] in console (expected & correct).
