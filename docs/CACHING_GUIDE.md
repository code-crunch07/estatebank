# Caching Guide for EstateBANK.in Application

This guide explains all the caching strategies available in your Next.js application and how to use them effectively.

## 📋 Table of Contents

1. [Types of Caching](#types-of-caching)
2. [Current Caching Implementation](#current-caching-implementation)
3. [How to Use Each Cache Type](#how-to-use-each-cache-type)
4. [Best Practices](#best-practices)
5. [Cache Configuration Examples](#cache-configuration-examples)

---

## Types of Caching

### 1. **Browser Cache (HTTP Cache Headers)**
- **Location**: `next.config.js` → `headers()` function
- **What it caches**: Static files (images, CSS, JS, fonts)
- **Duration**: Set via `Cache-Control` headers
- **Current Setup**: ✅ Already configured

### 2. **Next.js Data Cache (fetch cache)**
- **Location**: API routes and Server Components
- **What it caches**: API responses, database queries
- **Duration**: Configurable via `revalidate` option
- **Current Setup**: ⚠️ Partially implemented

### 3. **In-Memory Cache (Runtime Cache)**
- **Location**: API route handlers (e.g., `app/api/properties/route.ts`)
- **What it caches**: API responses in server memory
- **Duration**: Configurable TTL (Time To Live)
- **Current Setup**: ✅ Already implemented

### 4. **Next.js Image Cache**
- **Location**: `next.config.js` → `images` config
- **What it caches**: Optimized images
- **Duration**: `minimumCacheTTL` setting
- **Current Setup**: ✅ Already configured (60 seconds)

### 5. **Client-Side Cache (React Query / SWR)**
- **Location**: Client components
- **What it caches**: API responses in browser
- **Duration**: Configurable per request
- **Current Setup**: ❌ Not implemented (can be added)

---

## Current Caching Implementation

### ✅ What's Already Cached

#### 1. **Static Assets** (Browser Cache)
```javascript
// Location: next.config.js
{
  source: '/images/:path*',
  headers: [
    {
      key: 'Cache-Control',
      value: 'public, max-age=31536000, immutable', // 1 year
    },
  ],
}
```

#### 2. **Next.js Static Files**
```javascript
// Location: next.config.js
{
  source: '/_next/static/:path*',
  headers: [
    {
      key: 'Cache-Control',
      value: 'public, max-age=31536000, immutable', // 1 year
    },
  ],
}
```

#### 3. **Properties API** (In-Memory Cache)
```javascript
// Location: app/api/properties/route.ts
const CACHE_TTL = 5000; // 5 seconds (development)
// Uses Map-based cache with TTL
```

#### 4. **Images** (Next.js Image Optimization)
```javascript
// Location: next.config.js
images: {
  minimumCacheTTL: 60, // 60 seconds
}
```

---

## How to Use Each Cache Type

### 1. **Browser Cache (HTTP Headers)**

#### Current Configuration:
```javascript
// next.config.js
async headers() {
  return [
    {
      source: '/images/:path*',
      headers: [
        {
          key: 'Cache-Control',
          value: 'public, max-age=31536000, immutable',
        },
      ],
    },
  ];
}
```

#### How to Modify:
- **Increase cache duration**: Change `max-age=31536000` (1 year) to longer
- **Add more paths**: Add new `source` patterns for other static assets
- **Example for API responses**:
```javascript
{
  source: '/api/properties',
  headers: [
    {
      key: 'Cache-Control',
      value: 'public, s-maxage=60, stale-while-revalidate=300',
    },
  ],
}
```

---

### 2. **Next.js Data Cache (fetch with revalidate)**

#### Current Usage:
```javascript
// app/(client)/page.tsx
fetch('/api/properties?lightweight=true', {
  next: { revalidate: 60 }, // Revalidate every 60 seconds
})
```

#### How to Use:
- **Time-based revalidation**: `revalidate: 60` = cache for 60 seconds
- **On-demand revalidation**: Use `revalidatePath()` or `revalidateTag()` after mutations
- **No cache**: `cache: 'no-store'` = always fetch fresh data
- **Force cache**: `cache: 'force-cache'` = cache indefinitely

#### Examples:

**Cache for 5 minutes:**
```javascript
fetch('/api/properties', {
  next: { revalidate: 300 }, // 5 minutes
})
```

**Cache for 1 hour:**
```javascript
fetch('/api/properties', {
  next: { revalidate: 3600 }, // 1 hour
})
```

**No cache (always fresh):**
```javascript
fetch('/api/properties', {
  cache: 'no-store',
})
```

**Cache with tags (for on-demand revalidation):**
```javascript
// In API route:
export async function GET() {
  const data = await fetch('...', {
    next: { tags: ['properties'] }
  });
}

// After mutation, revalidate:
import { revalidateTag } from 'next/cache';
revalidateTag('properties');
```

---

### 3. **In-Memory Cache (Runtime Cache)**

#### Current Implementation:
```javascript
// app/api/properties/route.ts
const CACHE_TTL = 5000; // 5 seconds
const cache = new Map();

// Check cache:
const cached = cache.get(cacheKey);
if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
  return cached.data;
}

// Store in cache:
cache.set(cacheKey, { data: responseData, timestamp: Date.now() });
```

#### How to Modify:

**Increase cache duration:**
```javascript
// Change from 5 seconds to 60 seconds:
const CACHE_TTL = 60000; // 60 seconds
```

**Add cache to other API routes:**
```javascript
// Example: app/api/hero-images/route.ts
const cache = new Map();
const CACHE_TTL = 60000; // 60 seconds

export async function GET() {
  const cacheKey = 'hero-images-active';
  const cached = cache.get(cacheKey);
  
  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    return NextResponse.json({ success: true, data: cached.data, cached: true });
  }
  
  // Fetch data...
  const data = await HeroImage.find({ status: 'Active' });
  
  // Store in cache:
  cache.set(cacheKey, { data, timestamp: Date.now() });
  
  return NextResponse.json({ success: true, data });
}
```

**Clear cache after mutations:**
```javascript
// After creating/updating/deleting:
import { markPropertiesCacheStale } from '@/app/api/properties/route';

// In POST/PUT/DELETE handler:
await Property.create(newProperty);
markPropertiesCacheStale(); // Clear cache
```

---

### 4. **Next.js Image Cache**

#### Current Configuration:
```javascript
// next.config.js
images: {
  minimumCacheTTL: 60, // 60 seconds
}
```

#### How to Modify:

**Increase image cache duration:**
```javascript
images: {
  minimumCacheTTL: 3600, // 1 hour
}
```

**Cache images for 1 day:**
```javascript
images: {
  minimumCacheTTL: 86400, // 24 hours
}
```

---

### 5. **Client-Side Cache (React Query / SWR)**

#### Not Currently Implemented - How to Add:

**Option A: Using React Query (TanStack Query)**
```javascript
// Already in package.json: "@tanstack/react-query": "^5.28.0"

// Create a hook:
import { useQuery } from '@tanstack/react-query';

export function useProperties() {
  return useQuery({
    queryKey: ['properties'],
    queryFn: async () => {
      const res = await fetch('/api/properties?lightweight=true');
      return res.json();
    },
    staleTime: 60000, // Consider fresh for 60 seconds
    gcTime: 300000, // Keep in cache for 5 minutes
  });
}

// Use in component:
const { data, isLoading } = useProperties();
```

**Option B: Using SWR**
```bash
npm install swr
```

```javascript
import useSWR from 'swr';

const fetcher = (url: string) => fetch(url).then(res => res.json());

export function useProperties() {
  const { data, error, isLoading } = useSWR(
    '/api/properties?lightweight=true',
    fetcher,
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: true,
      refreshInterval: 60000, // Refresh every 60 seconds
      dedupingInterval: 2000, // Dedupe requests within 2 seconds
    }
  );
  
  return { data, error, isLoading };
}
```

---

## Best Practices

### 1. **Cache Strategy by Data Type**

| Data Type | Cache Duration | Cache Type | Reason |
|-----------|---------------|------------|--------|
| Static images | 1 year | Browser Cache | Never change |
| CSS/JS bundles | 1 year | Browser Cache | Content-hashed |
| Property listings | 60 seconds | API Cache | Changes frequently |
| Hero images | 60 seconds | API Cache | May change |
| User data | No cache | - | Personal data |
| SEO metadata | 1 hour | API Cache | Changes rarely |

### 2. **Cache Invalidation**

**When to clear cache:**
- ✅ After creating new property → Clear properties cache
- ✅ After updating property → Clear properties cache
- ✅ After deleting property → Clear properties cache
- ✅ After updating hero images → Clear hero-images cache
- ✅ After updating branding → Clear branding cache

**How to clear cache:**
```javascript
// Method 1: Mark cache stale (in-memory)
markPropertiesCacheStale();

// Method 2: Revalidate Next.js cache
import { revalidatePath } from 'next/cache';
revalidatePath('/api/properties');

// Method 3: Revalidate with tags
import { revalidateTag } from 'next/cache';
revalidateTag('properties');
```

### 3. **Cache Headers Strategy**

**For static assets:**
```
Cache-Control: public, max-age=31536000, immutable
```

**For API responses (stale-while-revalidate):**
```
Cache-Control: public, s-maxage=60, stale-while-revalidate=300
```
- `s-maxage=60`: Cache for 60 seconds
- `stale-while-revalidate=300`: Serve stale content for 300 seconds while revalidating

**For dynamic content:**
```
Cache-Control: no-cache, must-revalidate
```

---

## Cache Configuration Examples

### Example 1: Cache Properties API for 5 Minutes

**In API route** (`app/api/properties/route.ts`):
```javascript
const CACHE_TTL = 300000; // 5 minutes (300 seconds * 1000ms)
```

**In client component** (`app/(client)/page.tsx`):
```javascript
fetch('/api/properties?lightweight=true', {
  next: { revalidate: 300 }, // 5 minutes
})
```

### Example 2: Add Cache Headers to API Response

**In API route**:
```javascript
export async function GET(request: NextRequest) {
  const data = await fetchProperties();
  
  return NextResponse.json(
    { success: true, data },
    {
      headers: {
        'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=300',
      },
    }
  );
}
```

### Example 3: Cache Hero Images API

**Create cache in** `app/api/hero-images/route.ts`:
```javascript
const cache = new Map();
const CACHE_TTL = 60000; // 60 seconds

export async function GET() {
  const cacheKey = 'hero-images-active';
  const cached = cache.get(cacheKey);
  
  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    return NextResponse.json({ 
      success: true, 
      data: cached.data, 
      cached: true 
    });
  }
  
  const data = await HeroImage.find({ status: 'Active' });
  cache.set(cacheKey, { data, timestamp: Date.now() });
  
  return NextResponse.json({ success: true, data });
}
```

### Example 4: Add Browser Cache for API Routes

**In** `next.config.js`:
```javascript
async headers() {
  return [
    // ... existing headers ...
    {
      source: '/api/properties',
      headers: [
        {
          key: 'Cache-Control',
          value: 'public, s-maxage=60, stale-while-revalidate=300',
        },
      ],
    },
    {
      source: '/api/hero-images',
      headers: [
        {
          key: 'Cache-Control',
          value: 'public, s-maxage=60, stale-while-revalidate=300',
        },
      ],
    },
  ];
}
```

---

## Recommended Cache Durations

### Development Environment:
- **API Cache**: 5-10 seconds (fast iteration)
- **Image Cache**: 60 seconds
- **Static Assets**: 1 year (unchanged)

### Production Environment:
- **Properties API**: 60-300 seconds (1-5 minutes)
- **Hero Images**: 60-300 seconds
- **Branding Settings**: 300-3600 seconds (5-60 minutes)
- **SEO Metadata**: 3600 seconds (1 hour)
- **Static Assets**: 1 year
- **Images**: 3600 seconds (1 hour)

---

## Monitoring Cache Performance

### Check Cache Hit Rate:
```javascript
// Add to API route:
console.log(`Cache hit rate: ${cacheHits}/${totalRequests}`);
```

### Check Cache Size:
```javascript
// In API route:
console.log(`Cache size: ${cache.size} entries`);
```

### Browser DevTools:
1. Open Network tab
2. Check response headers for `Cache-Control`
3. Look for `X-Cache` or `X-Cached` headers (if added)
4. Monitor `from disk cache` or `from memory cache` indicators

---

## Troubleshooting

### Cache Not Working?
1. **Check browser cache**: Hard refresh (Ctrl+Shift+R / Cmd+Shift+R)
2. **Check API cache**: Look for `cached: true` in response
3. **Check headers**: Verify `Cache-Control` header is set
4. **Check TTL**: Ensure cache hasn't expired

### Cache Too Aggressive?
- Reduce `CACHE_TTL` in API routes
- Reduce `revalidate` time in fetch calls
- Use `cache: 'no-store'` for fresh data

### Cache Not Clearing?
- Ensure `markPropertiesCacheStale()` is called after mutations
- Use `revalidatePath()` or `revalidateTag()` in Next.js
- Clear browser cache manually

---

## Summary

Your application currently uses:
- ✅ Browser cache for static assets (1 year)
- ✅ In-memory cache for Properties API (5 seconds)
- ✅ Next.js image cache (60 seconds)
- ⚠️ Partial Next.js data cache (60 seconds in client)

**To improve caching:**
1. Increase API cache TTL in production (60-300 seconds)
2. Add cache headers to API responses
3. Implement client-side caching (React Query/SWR)
4. Add cache to other API routes (hero-images, branding, etc.)
5. Use cache tags for on-demand revalidation
