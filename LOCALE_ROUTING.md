# Locale Routing Configuration

## 🎯 Routing Behavior

### URL Structure
- **Default Locale (en)**: No prefix
  - `/` → Root
  - `/about` → About page  
  - `/products` → Products page
  - `/products/item-1` → Product detail

- **Non-Default Locales (fr, etc)**: With locale prefix
  - `/fr/` → French root
  - `/fr/about` → French about page
  - `/fr/products` → French products page
  - `/fr/products/item-1` → French product detail

## 🔄 How It Works

### Proxy.ts (Middleware)
Located: `next/proxy.ts`

1. **Default Locale Behavior**:
   - Request: `/about` 
   - Action: Browser accepts default locale (en), no redirect
   - Route: `app/[locale]/(marketing)/about/page.tsx` with `locale='en'`

2. **Non-Default Locale Auto-Redirect**:
   - Request: `/about` from user with `Accept-Language: fr`
   - Action: Detect 'fr' preference, redirect to `/fr/about`
   - Route: `app/[locale]/(marketing)/about/page.tsx` with `locale='fr'`

3. **Non-Default Locale Direct Access**:
   - Request: `/fr/about`
   - Action: Already has locale prefix, no redirect
   - Route: `app/[locale]/(marketing)/about/page.tsx` with `locale='fr'`

4. **Default Locale Prefix Cleanup**:
   - Request: `/en/about`
   - Action: Redirect to `/about` (remove default locale prefix)
   - Route: `app/[locale]/(marketing)/about/page.tsx` with `locale='en'`

## 📁 File Structure

```
app/
├── layout.tsx                    # Root HTML wrapper
├── [locale]/
│   ├── layout.tsx               # Locale-aware layout (updated)
│   ├── page.tsx                 # Home page
│   └── (marketing)/
│       ├── page.tsx             # Home (alternative structure)
│       ├── [slug]/page.tsx       # Dynamic route
│       ├── products/
│       │   ├── page.tsx         # Products list
│       │   └── [slug]/page.tsx  # Product detail
│       └── ...other routes
```

## 🛠️ Key Changes Made

### 1. **Updated proxy.ts**
- Logic for default locale (en) without prefix
- Logic for non-default locales with prefix
- Redirect `/en/*` → `/*` to clean up default locale URLs

### 2. **Enhanced [locale]/layout.tsx**
- Added `fetchSingleTypeOrNull()` fallback for missing content
- Added `extractLocale()` helper to safely extract locale from params
- Added error handling with sensible defaults
- Added DEFAULT_GLOBAL_DATA fallback

### 3. **Added Client Helper Functions**
- `fetchSingleTypeOrNull()` - Fetch with null fallback
- `fetchCollectionTypeOrEmpty()` - Fetch collections with empty array fallback
- `DEFAULT_GLOBAL_DATA` - Fallback data for "global" single type

## 🔧 Configuration Files

### i18n.config.ts
```typescript
export const i18n = {
  defaultLocale: 'en',
  locales: ['en', 'fr'],  // Add more as needed
} as const;
```

### Important Environment
- Default locale is 'en' by convention
- All URLs use 'en', 'fr', etc. (no dashes) as locale codes internally
- Strapi uses full locale codes ('en-US', 'fr-FR', etc.) for content

## ✅ Testing the Setup

### Test Default Locale (en)
```bash
# Should work without /en prefix
http://localhost:3000/
http://localhost:3000/about
http://localhost:3000/products
http://localhost:3000/products/item-1
```

### Test Non-Default Locale (fr)
```bash
# Should work with /fr prefix
http://localhost:3000/fr
http://localhost:3000/fr/about
http://localhost:3000/fr/products
http://localhost:3000/fr/products/item-1
```

### Test Default Locale Prefix Cleanup
```bash
# /en/* should redirect to /* (only for default locale)
http://localhost:3000/en/about → redirects to /about
http://localhost:3000/en/products → redirects to /products
```

### Test Non-Default Locale Prefix Preservation
```bash
# /fr/* should stay as /fr/* (keep locale prefix)
http://localhost:3000/fr/about → stays at /fr/about
http://localhost:3000/fr/products → stays at /fr/products
```

## 📋 Common Tasks

### Add a New Locale
1. Update `i18n.config.ts`:
   ```typescript
   locales: ['en', 'fr', 'es'],  // Add 'es'
   ```
2. Create content in Strapi for the new locale
3. Restart Next.js

### Add a New Page
1. Create page file: `app/[locale]/(marketing)/new-page/page.tsx`
2. Extract locale: `const { locale } = await params;`
3. Fetch locale-specific content if needed
4. Locale prefix is handled automatically by routing

### Fix 404 When Accessing /en/something
This is expected! The proxy redirects `/en/*` to `/*` because 'en' is the default locale. If you're seeing 404 after redirect, check:
1. The page exists at `app/[locale]/...`
2. Locale parameter is properly extracted
3. No hardcoded locale prefixes in component links

## 🐛 Troubleshooting

### Issue: /en/page still shows 404
- This is correct! Proxy redirects to `/page`
- Check that `app/[locale](.../page.tsx exists

### Issue: All pages require /en/ prefix
- Proxy is configured correctly but not active
- Make sure middleware/proxy is being executed
- Check that `proxy.ts` is properly imported

### Issue: Locale content isn't loading
- Check `fetchSingleTypeOrNull()` is handling errors
- Verify Strapi content exists for the locale
- Check Strapi permission settings for API access

## 📚 Related Files
- `proxy.ts` - Locale routing middleware
- `i18n.config.ts` - Locale configuration
- `lib/strapi/client.ts` - Strapi client with error handling
- `app/[locale]/layout.tsx` - Locale-aware layout
- `next/middleware.ts` - (doesn't exist, using proxy.ts instead)
