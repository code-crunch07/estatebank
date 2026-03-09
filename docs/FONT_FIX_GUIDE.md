# Font Loading Fix Guide

## Issue
Fonts (Jost and Forum) are not loading on the live site: https://estatebanknew.optimaxmedia.in/

## Root Cause
Google Fonts may be blocked, slow to load, or there might be CSP (Content Security Policy) issues preventing font loading.

## Solutions Applied

### 1. Added Font Preconnect (app/layout.tsx)
Added preconnect links to Google Fonts for faster loading:
```tsx
<head>
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
</head>
```

### 2. Added Fallback Fonts
Added fallback fonts so content is readable even if Google Fonts fail:
- Jost fallback: `system-ui, -apple-system, BlinkMacSystemFont, Segoe UI, sans-serif`
- Forum fallback: `Georgia, serif`

### 3. Enabled Preload
Set `preload: true` to prioritize font loading.

## Additional Steps for Production

### Option A: Self-Host Fonts (Recommended for Production)

1. **Download Font Files:**
   - Download Jost and Forum fonts from Google Fonts
   - Place them in `public/fonts/jost/` and `public/fonts/forum/`

2. **Update globals.css:**
   Add @font-face declarations similar to Gordita font.

3. **Update layout.tsx:**
   Remove Google Fonts import and use local fonts instead.

### Option B: Check CSP Headers

If using CloudPanel/Nginx, ensure Content Security Policy allows Google Fonts:

```nginx
add_header Content-Security-Policy "font-src 'self' https://fonts.googleapis.com https://fonts.gstatic.com;";
```

### Option C: Use Next.js Font Optimization

The current setup uses Next.js font optimization which should work. If fonts still don't load:

1. **Check Network Tab:**
   - Open browser DevTools → Network
   - Filter by "Font"
   - Check if font requests are failing

2. **Check Console:**
   - Look for CSP errors
   - Check for CORS errors
   - Verify font URLs are accessible

## Quick Fix Commands

### On Production Server:

```bash
# 1. Rebuild the application
cd /home/cloudpanel/htdocs/estatebanknew.optimaxmedia.in
npm run build

# 2. Restart the application
pm2 restart estatebank

# 3. Clear browser cache and test
# Or use incognito mode to test
```

### Verify Font Loading:

1. Open browser DevTools (F12)
2. Go to Network tab
3. Filter by "Font"
4. Reload the page
5. Check if fonts are loading (status 200)

## Testing

After deploying fixes:

1. **Check Font Loading:**
   ```javascript
   // In browser console
   document.fonts.check('16px Jost')
   document.fonts.check('16px Forum')
   ```

2. **Verify CSS Variables:**
   ```javascript
   // In browser console
   getComputedStyle(document.documentElement).getPropertyValue('--font-jost')
   getComputedStyle(document.documentElement).getPropertyValue('--font-forum')
   ```

## If Fonts Still Don't Load

### Self-Host Fonts (Most Reliable)

1. Download fonts from:
   - Jost: https://fonts.google.com/specimen/Jost
   - Forum: https://fonts.google.com/specimen/Forum

2. Convert to web formats (woff2, woff, ttf)

3. Add to `public/fonts/` directory

4. Update `globals.css` with @font-face declarations

5. Update `layout.tsx` to remove Google Fonts dependency

## Current Status

✅ Preconnect links added
✅ Fallback fonts configured
✅ Preload enabled
⏳ Waiting for rebuild and deployment

## Next Steps

1. Rebuild the application on production
2. Restart the server
3. Clear browser cache
4. Test font loading
5. If still not working, consider self-hosting fonts

