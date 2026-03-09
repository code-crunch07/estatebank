# Console Logs Reference

This document lists all `console.log`, `console.error`, `console.warn`, and `console.info` statements in the codebase.

## Authentication & Login

### `app/login/page.tsx`
- `console.log('[Login] Starting login request...', { email })` - Logs when login request starts
- `console.log('[Login] Response status:', response.status, response.statusText)` - Logs API response status
- `console.log('[Login] Response data:', data)` - Logs full API response data
- `console.error('Login failed:', errorMsg, data)` - Logs login failure with error details
- `console.error('Login error:', error)` - Logs login exception errors

## Property Detail Pages

### `app/(client)/properties/[segment]/[slug]/page.tsx`
- `console.log('[PropertyDetailPage] Component mounted/updated:', { segment, slug, pathname, params })` - Logs component lifecycle
- `console.log('[PropertyDetailPage] Route changed, resetting state:', { oldKey, newKey })` - Logs route changes
- `console.error("Missing segment or slug:", { segment, slug })` - Logs missing route parameters
- `console.log("Looking for property:", { segment, slug })` - Logs property lookup start
- `console.log('Property not found in segment, trying other segments...')` - Logs when property not found in expected segment
- `console.log('Found property in different segment, redirecting:', correctUrl)` - Logs property found in different segment
- `console.error("Error fetching property:", error)` - Logs property fetch errors
- `console.error("Error fetching recent properties:", error)` - Logs recent properties fetch errors
- `console.error('Error fetching capacities:', error)` - Logs capacities fetch errors
- `console.error('Error submitting enquiry:', error)` - Logs enquiry submission errors
- `console.log("Error sharing:", err)` - Logs sharing errors

### `app/(client)/properties/[segment]/[slug]/layout.tsx`
- `console.error("Metadata error:", error)` - Logs metadata generation errors

## Homepage

### `app/(client)/page.tsx`
- `console.log('[Homepage] Active hero images:', activeHeroImages.length)` - Logs count of active hero images
- `console.log('[Homepage] Properties loaded:', properties.length)` - Logs count of loaded properties
- `console.log('[Homepage] Processing hero image ${index + 1}:', { type, propertyId, ... })` - Logs each hero image being processed
- `console.log('[Homepage] ✓ Added property slide: ${property.name}', { image, hasImages, hasFeaturedImage })` - Logs successful property slide addition
- `console.warn('[Homepage] ✗ Property not found for hero image:', { propertyId, ... })` - Warns when property not found for hero image
- `console.error('Error processing properties:', error)` - Logs property processing errors
- `console.error('Error processing hero images:', error)` - Logs hero image processing errors
- `console.error('Error fetching data:', error)` - Logs general data fetch errors

## Dashboard - Properties

### `app/(dashboard)/dashboard/properties/page.tsx`
- `console.log('[Dashboard] Loaded ${normalizedProperties.length} properties')` - Logs count of loaded properties
- `console.warn('[Dashboard] No properties data in response:', data)` - Warns when no properties in response
- `console.error('Error fetching properties:', error)` - Logs property fetch errors
- `console.error('Property ID not found:', property)` - Logs missing property ID errors
- `console.error('Error deleting property:', error)` - Logs property deletion errors
- `console.error('Error deleting properties:', error)` - Logs bulk deletion errors
- `console.error("Error exporting properties:", error)` - Logs export errors
- `console.error("Error importing properties:", error)` - Logs import errors

### `app/(dashboard)/dashboard/properties/add/page.tsx`
- `console.error('Error fetching amenities:', error)` - Logs amenities fetch errors
- `console.error('Error fetching capacities:', error)` - Logs capacities fetch errors
- `console.error('Error fetching occupancy types:', error)` - Logs occupancy types fetch errors
- `console.error('Error fetching locations:', error)` - Logs locations fetch errors
- `console.error('Error fetching areas:', error)` - Logs areas fetch errors
- `console.error('Error fetching property types:', error)` - Logs property types fetch errors
- `console.error('Error fetching brokers:', error)` - Logs brokers fetch errors
- `console.error('Error fetching owners:', error)` - Logs owners fetch errors
- `console.error('Error adding amenity:', error)` - Logs amenity addition errors
- `console.error('Error adding property:', error)` - Logs property addition errors

### `app/(dashboard)/dashboard/properties/edit/[id]/page.tsx`
- `console.log('[Edit Property] Loaded property data:', { id, name, ... })` - Logs loaded property data
- `console.error('Error fetching property:', error)` - Logs property fetch errors
- `console.error('Error fetching amenities:', error)` - Logs amenities fetch errors
- `console.error('Error fetching capacities:', error)` - Logs capacities fetch errors
- `console.error('Error fetching occupancy types:', error)` - Logs occupancy types fetch errors
- `console.error('Error fetching locations:', error)` - Logs locations fetch errors
- `console.error('Error fetching areas:', error)` - Logs areas fetch errors
- `console.error('Error fetching property types:', error)` - Logs property types fetch errors
- `console.error('Error fetching brokers:', error)` - Logs brokers fetch errors
- `console.error('Error fetching owners:', error)` - Logs owners fetch errors
- `console.error('Error adding amenity:', error)` - Logs amenity addition errors
- `console.error('Error updating property:', error)` - Logs property update errors

### `app/(dashboard)/dashboard/properties/types/page.tsx`
- `console.error('Error fetching property types:', error)` - Logs property types fetch errors
- `console.error('Error deleting property type:', error)` - Logs property type deletion errors
- `console.error('Error saving property type:', error)` - Logs property type save errors

## Dashboard - Main

### `app/(dashboard)/dashboard/page.tsx`
- `console.error("Error loading properties:", error)` - Logs property loading errors
- `console.error("Error loading clients:", error)` - Logs client loading errors
- `console.error("Error loading leads:", error)` - Logs lead loading errors
- `console.error("Error loading dashboard data:", error)` - Logs general dashboard data errors

## Dashboard - Content

### `app/(dashboard)/dashboard/content/testimonials/page.tsx`
- `console.error('Error fetching testimonials:', error)` - Logs testimonials fetch errors
- `console.error('Error saving testimonial:', error)` - Logs testimonial save errors
- `console.error('Error deleting testimonial:', error)` - Logs testimonial deletion errors

## Dashboard - Website Management

### `app/(dashboard)/dashboard/website/branding/page.tsx`
- `console.error('Error fetching branding:', error)` - Logs branding fetch errors
- `console.error('Error saving branding:', error)` - Logs branding save errors
- `console.error('Error reloading branding:', error)` - Logs branding reload errors

### `app/(dashboard)/dashboard/website/areas/page.tsx`
- `console.error('Error loading areas:', error)` - Logs areas loading errors
- `console.error('Error deleting area:', error)` - Logs area deletion errors
- `console.error('Error saving area:', error)` - Logs area save errors

### `app/(dashboard)/dashboard/website/pages/page.tsx`
- `console.error('Error fetching pages:', error)` - Logs pages fetch errors
- `console.error('Error deleting page:', error)` - Logs page deletion errors
- `console.error('Error saving page:', error)` - Logs page save errors

### `app/(dashboard)/dashboard/website/services/page.tsx`
- `console.error('Error fetching services:', error)` - Logs services fetch errors
- `console.error('Error saving service:', error)` - Logs service save errors
- `console.error('Error deleting service:', error)` - Logs service deletion errors

## Dashboard - CRM

### `app/(dashboard)/dashboard/crm/leads/page.tsx`
- `console.error('Error fetching leads:', error)` - Logs leads fetch errors
- `console.error('Error deleting lead:', error)` - Logs lead deletion errors
- `console.error('Error adding lead:', error)` - Logs lead addition errors

## API Routes

### `app/api/properties/route.ts`
- `console.log("[Properties API] Cache marked as stale")` - Logs cache invalidation
- `console.log("[Properties API] Starting request...")` - Logs request start
- `console.log("[Properties API] Returning cached data")` - Logs cache hit
- `console.log("[Properties API] Using existing database connection")` - Logs existing DB connection usage
- `console.log("[Properties API] Database connected in ${connectionTime}ms")` - Logs DB connection time
- `console.error("[Properties API] Database connection failed:", dbError.message)` - Logs DB connection failures
- `console.log("[Properties API] Returning stale cached data due to connection failure")` - Logs fallback to stale cache
- `console.log("[Properties API] Executing query...")` - Logs query execution start
- `console.log("[Properties API] Found ${properties.length} properties")` - Logs query results count
- `console.error("[Properties API] Query failed:", queryError)` - Logs query failures
- `console.log("[Properties API] Returning stale cached data due to query failure")` - Logs fallback to stale cache
- `console.log("[Properties API] Returning response")` - Logs response return
- `console.error("[Properties API] Error:", error)` - Logs general API errors
- `console.log("[Properties API] Returning stale cached data due to error")` - Logs fallback to stale cache
- `console.log("[Properties API POST] Received request body:", JSON.stringify(body, null, 2))` - Logs POST request body
- `console.log("[Properties API POST] Saving property...")` - Logs property save start
- `console.log("[Properties API POST] Property saved successfully:", savedProperty._id)` - Logs successful save
- `console.error("[Properties API POST] Error saving property:", error)` - Logs property save errors
- `console.error("[Properties API POST] Error details:", {...})` - Logs detailed save errors

### `app/api/properties/[id]/route.ts`
- `console.log('[Properties API] Cache marked as stale (from [id] route)')` - Logs cache invalidation from ID route

### `app/api/enquiries/route.ts`
- `console.error('Failed to send email notification:', emailError)` - Logs email notification failures
- `console.warn('ADMIN_WHATSAPP_NUMBER not set. Skipping WhatsApp notification.')` - Warns missing WhatsApp config
- `console.error('Failed to send WhatsApp notification:', waError)` - Logs WhatsApp notification failures

### `app/api/email/property-enquiry/route.ts`
- `console.error('Failed to send email, but enquiry saved:', emailError)` - Logs email send failures (enquiry still saved)
- `console.error('Failed to send WhatsApp notification, but enquiry saved:', whatsappError)` - Logs WhatsApp failures (enquiry still saved)
- `console.error('Error submitting property enquiry:', error)` - Logs general enquiry errors

### `app/api/properties/submit/route.ts`
- `console.error('Failed to save enquiry:', enquiryError)` - Logs enquiry save failures
- `console.error('Failed to send email notification:', emailError)` - Logs email notification failures
- `console.error('Failed to send WhatsApp notification:', whatsappError)` - Logs WhatsApp notification failures

### `app/api/debug/metadata/route.ts`
- `console.error("Error generating debug metadata:", error)` - Logs metadata generation errors

### `app/api/images/base64/route.ts`
- `console.error("Error serving base64 image:", error)` - Logs base64 image serving errors

## Components

### `components/favicon-updater.tsx`
- `console.error("Favicon update failed:", err)` - Logs favicon update failures

### `components/header.tsx`
- `console.log("Google login clicked")` - Logs Google login button clicks
- `console.error('Error fetching branding:', error)` - Logs branding fetch errors

### `components/media-selector.tsx`
- `console.error("Error fetching properties:", error)` - Logs property fetch errors
- `console.error("Error fetching banners:", error)` - Logs banner fetch errors
- `console.error("Error fetching team:", error)` - Logs team fetch errors
- `console.error("Error fetching branding:", error)` - Logs branding fetch errors
- `console.error("Error fetching areas:", error)` - Logs area fetch errors
- `console.error("Error fetching property types:", error)` - Logs property types fetch errors
- `console.error("Error collecting media:", error)` - Logs media collection errors

### `components/property-card.tsx`
- `console.log("Error sharing:", err)` - Logs sharing errors

### `components/property-chatbot.tsx`
- `console.error("Error in saveAndSearch:", err)` - Logs saveAndSearch errors
- `console.error("Error saving lead/enquiry:", err)` - Logs lead/enquiry save errors
- `console.error("Error saving lead:", err)` - Logs lead save errors (multiple instances)
- `console.error("Missing required fields:", { name, email, mobile })` - Logs missing required fields
- `console.log("Lead saved successfully:", data.data)` - Logs successful lead saves
- `console.error("Failed to save lead:", data.error || data.message)` - Logs lead save failures
- `console.error("Error saving lead:", error)` - Logs lead save exceptions
- `console.error("Missing required fields for enquiry:", { name, email, mobile })` - Logs missing enquiry fields
- `console.log("Enquiry saved successfully:", data.data)` - Logs successful enquiry saves
- `console.error("Failed to save enquiry:", data.error || data.message)` - Logs enquiry save failures
- `console.error("Error saving enquiry:", error)` - Logs enquiry save exceptions
- `console.error("Error searching properties:", error)` - Logs property search errors

### `components/quick-enquiry-form.tsx`
- `console.error('Error submitting form:', error)` - Logs form submission errors

### `components/testimonials-slider.tsx`
- `console.error("Error fetching testimonials:", error)` - Logs testimonials fetch errors

### `components/analytics-loader.tsx`
- `console.error("Failed to load Google Analytics ID:", error)` - Logs analytics loading errors

### `components/error-handler.tsx`
- Overrides `console.error` and `console.warn` to filter known React DOM manipulation errors

## Client Pages

### `app/(client)/about/page.tsx`
- `console.error('Error loading data:', error)` - Logs data loading errors

### `app/(client)/testimonials/page.tsx`
- `console.error('Error loading testimonials:', error)` - Logs testimonials loading errors

### `app/(client)/[slug]/page.tsx`
- `console.error('Error fetching page:', error)` - Logs page fetch errors

## Utilities

### `lib/whatsapp.ts`
- `console.warn(...)` - Warns about missing WhatsApp configuration
- `console.error("[WhatsApp] Failed to send message:", errorData)` - Logs WhatsApp send failures
- `console.log("[WhatsApp] Message sent successfully.", data)` - Logs successful WhatsApp sends
- `console.error("[WhatsApp] Failed to send message:", error.message || error)` - Logs WhatsApp send exceptions
- `console.error("[WhatsApp] Error sending enquiry:", error)` - Logs enquiry send errors

### `lib/api-utils.ts`
- `console.error("API Error:", error)` - Logs general API errors

## Scripts

### `scripts/verify-metadata.ts`
- `console.error('Property not found: ${segment}/${slug}')` - Logs property not found errors
- `console.log('\n=== Property Metadata Verification ===\n')` - Logs verification header
- `console.log('Property Name:', property.name)` - Logs property name
- `console.log('Segment:', segment)` - Logs segment
- `console.log('Slug:', slug)` - Logs slug
- `console.log('\n--- Image URLs ---')` - Logs image URLs section
- `console.log('Original Image Path:', mainImage)` - Logs original image path
- `console.log('Absolute Image URL:', absoluteImageUrl)` - Logs absolute image URL
- `console.log('\n--- Meta Tags ---')` - Logs meta tags section
- `console.log('Title:', ...)` - Logs meta title
- `console.log('Description:', ...)` - Logs meta description
- `console.log('URL:', url)` - Logs page URL
- `console.log('\n--- Open Graph Tags ---')` - Logs OG tags section
- Multiple `console.log` statements for OG tag values
- `console.log('\n--- Verification ---')` - Logs verification section
- `console.log('Base URL:', validBaseUrl)` - Logs base URL
- `console.log('Image URL Valid:', ...)` - Logs image URL validation
- `console.log('Image URL HTTPS:', ...)` - Logs HTTPS check
- `console.log('Image URL Contains Base64:', ...)` - Logs base64 check
- `console.log('\n--- Open Graph Meta Tags (for HTML) ---')` - Logs HTML meta tags
- Multiple `console.log` statements for HTML meta tag output
- `console.log('\n=== End Verification ===\n')` - Logs verification footer
- `console.log('Image Accessibility Test:')` - Logs accessibility test header
- `console.log('  Status:', response.status)` - Logs response status
- `console.log('  Accessible:', response.ok)` - Logs accessibility status
- `console.warn('  ⚠️  Image might not be accessible to social media crawlers!')` - Warns about accessibility issues
- `console.warn('  ⚠️  Could not verify image accessibility:', error)` - Warns about verification failures
- `console.error('Error verifying metadata:', error)` - Logs verification errors
- `console.error('Usage: npx tsx scripts/verify-metadata.ts <segment> <slug>')` - Logs usage instructions
- `console.error('Example: npx tsx scripts/verify-metadata.ts residential sample-property')` - Logs usage example

## Other Files

### `app/sitemap.ts`
- `console.error('Error generating sitemap:', error)` - Logs sitemap generation errors

## Summary

**Total Console Statements: ~380**

**Breakdown by Type:**
- `console.log`: ~200+ (informational/debugging)
- `console.error`: ~150+ (error handling)
- `console.warn`: ~10+ (warnings)
- `console.info`: ~0 (not used)

**Most Logged Areas:**
1. API routes (especially properties API) - ~50+ logs
2. Dashboard pages - ~100+ logs
3. Property detail pages - ~20+ logs
4. Components - ~50+ logs
5. Error handling - ~150+ logs

**Recommendations:**
- Consider removing or reducing verbose logging in production
- Use environment-based logging (only log in development)
- Consider using a logging library for better log management
- Group related logs with consistent prefixes (already done in many places)
