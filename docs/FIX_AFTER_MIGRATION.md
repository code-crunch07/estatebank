# Fix Issues After Migration

## Problems After Moving from `frontend/` to Root

### Issue 1: Data Not Showing (Properties, Testimonials, etc.)

**Cause:** Browser localStorage might be cached or the app needs a fresh start.

**Solution:**

1. **Clear Browser Cache & localStorage:**
   ```javascript
   // Open browser console (F12) and run:
   localStorage.clear();
   location.reload();
   ```

2. **Or manually clear in browser:**
   - Chrome: DevTools → Application → Storage → Clear site data
   - Firefox: DevTools → Storage → Clear All

3. **Restart the dev server:**
   ```bash
   # Stop the server (Ctrl+C)
   # Then restart:
   npm run dev
   ```

4. **Re-add your data:**
   - Go to Dashboard → Properties → Add Property
   - Go to Dashboard → Content → Testimonials → Add Testimonial
   - Your data will be saved to localStorage again

### Issue 2: Fonts Not Reflecting

**Cause:** Font files might not be loading or CSS cache issue.

**Solution:**

1. **Clear Next.js build cache:**
   ```bash
   rm -rf .next
   npm run dev
   ```

2. **Check if fonts are loading:**
   - Open browser DevTools (F12)
   - Go to Network tab
   - Filter by "font"
   - Reload page
   - Check if fonts are loading (should see 200 status)

3. **Verify font paths:**
   - Google Fonts (Jost, Forum) load automatically via `next/font/google`
   - Local fonts (Gordita, Nexa) should be in `/public/fonts/`

4. **Hard refresh browser:**
   - Mac: Cmd + Shift + R
   - Windows: Ctrl + Shift + R

### Issue 3: Images Not Loading

**Solution:**

1. **Check image paths:**
   - Images should be in `/public/` folder
   - References should use `/logo.png` (not `/frontend/logo.png`)

2. **Clear Next.js image cache:**
   ```bash
   rm -rf .next/cache
   npm run dev
   ```

---

## Quick Fix Script

Run this to fix common issues:

```bash
cd /Users/rahulshah/Downloads/EstateBANK.in

# 1. Clear build cache
rm -rf .next

# 2. Clear node_modules and reinstall (optional but recommended)
rm -rf node_modules
npm install

# 3. Restart dev server
npm run dev
```

---

## Verify Everything Works

### Test Checklist:

1. **Homepage loads** - Visit `http://localhost:3000`
2. **Fonts display** - Check if headings use Forum font
3. **Properties show** - Visit `/properties` page
4. **Dashboard works** - Visit `/login` and login
5. **Data persists** - Add a property, refresh, check if it's still there

---

## If Data is Still Missing

### Option 1: Restore from Backup

If you have a backup of the `frontend` folder:

```bash
# Check if localStorage data exists in browser
# Open browser console and run:
console.log(localStorage.getItem('properties'));
console.log(localStorage.getItem('testimonials'));

# If data exists, it will show. If null, data was lost.
```

### Option 2: Export/Import Data

**Export data from old location:**
```javascript
// In browser console (on old site if still accessible)
const data = {
  properties: localStorage.getItem('properties'),
  testimonials: localStorage.getItem('testimonials'),
  amenities: localStorage.getItem('amenities'),
  // ... other data
};
console.log(JSON.stringify(data));
// Copy the output
```

**Import data to new location:**
```javascript
// In browser console (on new site)
const data = { /* paste exported data */ };
Object.keys(data).forEach(key => {
  if (data[key]) localStorage.setItem(key, data[key]);
});
location.reload();
```

---

## Common Issues & Solutions

### Issue: "Cannot find module" errors
**Fix:** 
```bash
rm -rf node_modules .next
npm install
```

### Issue: Port 3000 already in use
**Fix:**
```bash
# Kill process on port 3000
lsof -ti:3000 | xargs kill -9
# Or use different port:
npm run dev -- -p 3001
```

### Issue: TypeScript errors
**Fix:**
```bash
rm -rf .next
npm run build  # This will show all errors
```

---

## Still Having Issues?

1. **Check browser console** for errors (F12 → Console)
2. **Check terminal** where `npm run dev` is running
3. **Verify file structure** - Make sure all files moved correctly
4. **Check .env.local** - Make sure it exists and has correct values

