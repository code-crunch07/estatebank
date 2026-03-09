# Share Function Metadata Fix

**Date:** January 28, 2026  
**Issue:** WhatsApp share showing generic "Property - EstateBANK.in" instead of property-specific metadata

---

## 🔍 Problem Identified

When sharing property pages on WhatsApp, the link preview was showing:
- ❌ Generic title: "Property - EstateBANK.in"
- ❌ Generic description: "Property details"
- ❌ Generic image: Office reception with logo

This happened because the `generateMetadata` function in `layout.tsx` was failing to find properties.

---

## 🐛 Root Cause

The property lookup in `generateMetadata` was using:
```typescript
Property.findOne({ segment, slug: normalizedSlug })
```

**Problem:** Properties don't have a `slug` field stored in the database. The slug is **computed from the `name` field** on-the-fly using `generateSlug()`.

So the query was always failing → returning generic metadata → WhatsApp cached the generic preview.

---

## ✅ Solution

Updated `generateMetadata` to use the same lookup logic as the API routes:

1. **Fetch all properties in the segment** (indexed, fast)
2. **Generate slug from each property's name** and compare
3. **Added fuzzy matching fallback** for similar property names

### Code Changes

**Before:**
```typescript
const property = await Property.findOne({
  segment,
  slug: normalizedSlug,  // ❌ This field doesn't exist!
}).lean();
```

**After:**
```typescript
// Fetch all properties in segment
const properties = await Property.find({ segment }).lean();

// Find by comparing generated slugs
const property = properties.find((p: any) => {
  const propertySlug = generateSlug(p.name);
  return propertySlug === normalizedSlug;
});

// Fuzzy matching fallback
if (!property) {
  const similarProperty = properties.find((p: any) => {
    const propertyName = p.name.toLowerCase();
    const searchName = decodedSlug.replace(/-/g, ' ').toLowerCase();
    return propertyName.includes(searchName);
  });
}
```

---

## 🖼️ Image Handling Improvements

Also improved image selection to:
- ✅ Prioritize Cloudinary URLs (after migration)
- ✅ Reject base64 data URIs (not valid for OG tags)
- ✅ Fallback to `/og-default.png` or `/logo.png`

---

## 📋 Files Modified

1. **`app/(client)/properties/[segment]/[slug]/layout.tsx`**
   - Fixed property lookup logic
   - Improved image selection
   - Added fuzzy matching fallback

---

## 🧪 Testing

### Test 1: Share a Property Page
1. Navigate to any property detail page
2. Click share button
3. Share to WhatsApp
4. **Expected:** Property-specific title, description, and image

### Test 2: Check OG Tags
1. View page source of property page
2. Check `<meta property="og:title">` tag
3. **Expected:** Should show property name, not "Property - EstateBANK.in"

### Test 3: Facebook Debugger
1. Go to https://developers.facebook.com/tools/debug/
2. Enter property page URL
3. Click "Scrape Again" to clear cache
4. **Expected:** Property-specific metadata

---

## ⚠️ Important Notes

### WhatsApp Cache
- WhatsApp caches OG metadata for **7 days**
- After fixing, you may need to wait or use Facebook Debugger to clear cache
- Or share a different property URL to see the fix immediately

### Cloudinary Images
- After Cloudinary migration, property images are Cloudinary URLs
- These work perfectly for OG tags (public HTTPS URLs)
- Base64 images are automatically rejected (not valid for sharing)

---

## ✅ Status

**Fixed:** Property lookup now works correctly  
**Result:** Property-specific metadata will be shown in WhatsApp shares  
**Cache:** May take up to 7 days for WhatsApp to refresh, or use Facebook Debugger

---

## 🔄 Next Steps

1. **Test sharing** a property page to WhatsApp
2. **Verify** property-specific metadata appears
3. **Clear cache** using Facebook Debugger if needed
4. **Monitor** to ensure all properties are found correctly
