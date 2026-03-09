# Build Errors and Fixes Summary

Last checked: local TypeScript + lint context. Full build requires **Node.js >= 20.9.0** (Docker uses Node 20).

---

## 1. Resolved (already fixed in codebase)

### Prerender: "Cannot read properties of null (reading 'useEffect')"
- **Cause:** Next.js was statically prerendering client-only routes at build time; hooks run in a context where React dispatcher was null.
- **Fix:**
  - **Dashboard:** `app/(dashboard)/layout.tsx` is a **server** layout that exports `export const dynamic = 'force-dynamic'` and renders `DashboardLayoutClient`. All dashboard routes are now dynamic.
  - **Login:** `app/login/layout.tsx` (new) is a **server** layout that exports `export const dynamic = 'force-dynamic'`. Removed the invalid `dynamic` export from the client `app/login/page.tsx`.

### "Each child in a list should have a unique key prop" (head/link/meta)
- **Cause:** Multiple `<link>` siblings in root `<head>` without keys triggered React list warnings during SSG.
- **Fix:** Added unique `key` props to each `<link>` in `app/layout.tsx` (e.g. `key="preconnect-googleapis"`, `key="dns-cloudinary"`).

---

## 2. Environment / Tooling

### Node.js version
- **Error:** `You are using Node.js 18.20.8. For Next.js, Node.js version ">=20.9.0" is required.`
- **Fix:** Use Node 20+ for `npm run build` and `npm run lint` (e.g. `nvm use 20` or ensure Docker/build uses Node 20).

### NODE_ENV (Docker/build)
- **Warning:** `You are using a non-standard "NODE_ENV" value in your environment.`
- **Fix:** Ensure build runs with `NODE_ENV=production` (or unset). Do not set custom values like `NODE_ENV=staging` during `next build`.

### Middleware deprecation (Next.js 16)
- **Warning:** `The "middleware" file convention is deprecated. Please use "proxy" instead.`
- **Note:** Informational for Next 16; current `middleware.ts` still works. Plan to migrate when Next.js documents the new proxy API.

---

## 3. Local checks (no errors)

- **TypeScript:** `npx tsc --noEmit` — **passes** (exit 0).
- **IDE linter:** No reported errors under `app/`, `components/`, `lib/`.

---

## 4. How to verify a full build

On a machine or CI with **Node >= 20.9.0**:

```bash
# Use Node 20 if you use nvm
nvm use 20   # or nvm use 22

# Clean and build
rm -rf .next
npm run build
npm run lint
```

Or use Docker (already uses Node 20):

```bash
docker compose build app
# or
./update.sh
```

---

## 5. If a new prerender error appears on another route

If you see the same "Cannot read properties of null (reading 'useEffect')" on a **different** path:

1. Add a **server** layout for that route segment that exports `dynamic = 'force-dynamic'`.
2. Keep all client-only logic (hooks, `localStorage`, etc.) in a client component rendered by that layout.

Example: for a route group `(admin)`:

- `app/(admin)/layout.tsx` (server):  
  `export const dynamic = 'force-dynamic';`  
  `export default function AdminLayout({ children }) { return <>{children}</>; }`
- Pages under `(admin)` can stay client components as needed.

---

## 6. Quick reference: route segment config

| Config              | Valid in              | Invalid in        |
|---------------------|------------------------|-------------------|
| `dynamic`           | Server layout/page     | Client component  |
| `revalidate`        | Server layout/page     | Client component  |
| `runtime`           | Server layout/page     | Client component  |

Use a thin server layout + client child when you need both `dynamic` and client-only UI.
