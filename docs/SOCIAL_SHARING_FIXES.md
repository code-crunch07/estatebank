# Social Sharing Metadata Fixes

## Issues Fixed

### 1. ✅ Property Lookup Improved
- **Problem**: Properties weren't being found due to slug matching issues
- **Solution**: 
  - Improved slug normalization (trim, lowercase, handle special characters)
  - Added fuzzy matching for similar property names
  - Better handling of URL encoding/decoding

### 2. ✅ URL Encoding Fixed
- **Problem**: URLs were being double-encoded, causing malformed URLs
- **Solution**:
  - Proper encoding of segment and slug separately
  - Clean up double encoding issues
  - Consistent URL construction

### 3. ✅ Debug Endpoint Clarification
- **Problem**: Facebook was trying to parse the debug API endpoint as HTML
- **Solution**:
  - Added clear notes that the debug endpoint is JSON-only
  - Added suggestions to use the actual property page URL
  - Improved error messages

### 4. ⚠️ Image Size Warning
- **Problem**: `logo.png` may be smaller than Facebook's 200x200px minimum
- **Current Solution**:
  - When property is found: Uses property image (should be large enough)
  - When property not found: Tries to use a similar property's image
  - Falls back to logo.png only if no property images available

## Action Required

### Check Logo Size
Facebook requires images to be at least **200x200px**. Please verify:

1. **Check logo.png size**:
   ```bash
   # Check image dimensions
   file public/logo.png
   # Or use an image viewer to check dimensions
   ```

2. **If logo.png is smaller than 200x200px**:
   - Option 1: Replace `/public/logo.png` with a version that's at least 200x200px
   - Option 2: Create a larger fallback image (e.g., `/public/og-default.png` at 1200x630px)
   - Option 3: Ensure all properties have images so logo.png is rarely used

### Recommended: Create OG Default Image
Create a default Open Graph image at `/public/og-default.png`:
- **Size**: 1200x630px (optimal for social sharing)
- **Content**: Your logo/branding centered on a colored background
- **Format**: PNG or JPEG

Then update the fallback image URL in `layout.tsx`:
```typescript
const fallbackImageUrl = `${validBaseUrl}/og-default.png`;
```

## Testing

### 1. Test Property Page
Use Facebook Sharing Debugger:
1. Go to: https://developers.facebook.com/tools/debug/
2. Enter: `https://estatebank.in/properties/residential/3-bhk-flat-for-sale-in-kanakia-silicon-valley-powai`
3. Click "Scrape Again"
4. Verify:
   - ✅ Property is found (not "Property Not Found")
   - ✅ og:image is present and valid
   - ✅ Image is at least 200x200px
   - ✅ URL is properly formatted

### 2. Test Debug Endpoint (for development only)
The debug endpoint is for development/testing only:
```
https://estatebank.in/api/debug/metadata?segment=residential&slug=3-bhk-flat-for-sale-in-kanakia-silicon-valley-powai
```
**Do not share this URL on Facebook** - it returns JSON, not HTML.

### 3. Verify Slug Matching
If properties are still not found:
1. Check the property name in the database
2. Compare with the generated slug
3. Use the debug endpoint to see available slugs:
   ```bash
   # The debug endpoint will show available slugs in development mode
   ```

## Common Issues

### Issue: "Property Not Found"
**Causes**:
- Property name has trailing spaces or special characters
- Slug doesn't match exactly
- Property is in a different segment

**Solution**:
- Check property name in database (trim spaces)
- Verify segment matches
- Use fuzzy matching (now implemented)

### Issue: "Image Too Small"
**Causes**:
- logo.png is smaller than 200x200px
- Property has no images

**Solution**:
- Replace logo.png with larger version
- Ensure all properties have at least one image
- Create og-default.png (1200x630px)

### Issue: Malformed URL
**Causes**:
- Double encoding
- Incorrect URL construction

**Solution**:
- Fixed in latest code
- URLs are now properly encoded
- Clean up double encoding issues

## Next Steps

1. ✅ Deploy the fixes
2. ⚠️ Verify logo.png is at least 200x200px (or create og-default.png)
3. ✅ Test with Facebook Sharing Debugger
4. ✅ Monitor for any remaining issues
