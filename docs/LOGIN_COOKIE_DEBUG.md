# Login Cookie Debugging Guide

## Issue
After successful login, user sees "Login successful" but remains on login page.

## Possible Causes

1. **Cookie not being set** - Check browser DevTools → Application → Cookies
2. **Cookie domain mismatch** - Cookie set for wrong domain
3. **Cookie secure flag** - Cookie requires HTTPS but site accessed via HTTP
4. **Middleware timing** - Middleware checks cookie before it's fully set
5. **CORS issues** - Cookie blocked by CORS policy

## Quick Debug Steps

### 1. Check if Cookie is Set
After login, open browser DevTools:
- **Chrome/Edge**: F12 → Application → Cookies → `https://estatebank.in`
- **Firefox**: F12 → Storage → Cookies → `https://estatebank.in`

Look for `auth_token` cookie. If it's NOT there, the cookie isn't being set.

### 2. Check Cookie Properties
If cookie exists, verify:
- ✅ `httpOnly: true` (should be checked/grayed out)
- ✅ `Secure: true` (should be checked - requires HTTPS)
- ✅ `Path: /` (should be `/`)
- ✅ `Domain: estatebank.in` or empty (should NOT be `.estatebank.in`)

### 3. Test Cookie Manually
In browser console (after login):
```javascript
// Check if cookie exists (won't show httpOnly cookies, but you can check via Network tab)
document.cookie
// Should show other cookies, but NOT auth_token (because it's httpOnly - this is correct)

// Check Network tab → Login request → Response Headers
// Look for: Set-Cookie: auth_token=...
```

### 4. Check Middleware Logs
Check server logs to see if middleware is receiving the cookie:
```bash
docker compose logs -f app | grep -i "middleware\|auth\|cookie"
```

### 5. Test API Directly
Test login API directly:
```bash
curl -X POST https://estatebank.in/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@estatebank.in","password":"74p4hkkw"}' \
  -v -c cookies.txt

# Check if cookie was set
cat cookies.txt
```

## Fixes Applied

1. ✅ Removed explicit domain setting (let browser handle it)
2. ✅ Added explicit `path: '/'` to cookie
3. ✅ Increased redirect delay to 500ms
4. ✅ Added CORS headers for cookie support

## Next Steps

1. **Rebuild and redeploy** the Docker container
2. **Clear browser cache and cookies** completely
3. **Try login again** and check DevTools
4. **If still not working**, check server logs for errors

## Alternative: Use API Endpoint to Create Admin

If login still doesn't work, you can create admin via API:
```bash
curl -X PUT https://estatebank.in/api/auth/create-admin \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@estatebank.in",
    "password": "74p4hkkw",
    "name": "Admin User",
    "secretKey": "YOUR_ADMIN_CREATE_SECRET"
  }'
```
