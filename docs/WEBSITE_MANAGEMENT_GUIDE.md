# Website Management Section - How It Works

## Overview
The Website Management section allows you to control various aspects of your website's appearance, content, and functionality. Each subsection has specific features and APIs connected.

---

## 1. 📸 Slideshow / Banner (`/dashboard/website/banner`)

### Purpose
Manage hero images/slideshow banners displayed on the homepage.

### Features
- **Add Hero Images**: Upload images for the homepage carousel
- **Link Properties**: Connect banners to specific property pages
- **Custom Banners**: Create standalone promotional banners
- **Order Management**: Set display order (1, 2, 3, etc.)
- **Status Control**: Activate/Deactivate banners
- **Custom Content**: Add title, description, and button text for each banner

### How It Works
1. Click "Add Banner" to create a new hero image
2. Upload an image (file upload, URL, or Media Library)
3. Set type: "property" (links to property) or "banner" (standalone)
4. Add optional title, description, and button text
5. Set order (lower numbers appear first)
6. Set status: "Active" (visible) or "Inactive" (hidden)
7. Save - the banner appears on the homepage carousel

### API Endpoint
- `GET /api/hero-images` - Fetch all hero images
- `POST /api/hero-images` - Create new hero image
- `PUT /api/hero-images/[id]` - Update hero image
- `DELETE /api/hero-images/[id]` - Delete hero image

### Frontend Display
- Homepage (`app/(client)/page.tsx`) fetches active banners
- Displays in carousel/slider format
- Only "Active" status banners are shown

---

## 2. 🎨 Branding (`/dashboard/website/branding`)

### Purpose
Manage your website's visual identity and branding elements.

### Features
- **Logo Management**: Upload main website logo
- **Dashboard Logo**: Separate logo for admin dashboard
- **Favicon**: Website icon (browser tab icon)
- **Color Scheme**: Primary colors, accent colors
- **Font Settings**: Custom fonts and typography
- **Social Media Links**: Facebook, Twitter, LinkedIn, Instagram
- **Contact Information**: Phone, email, address

### How It Works
1. Upload logos (file upload or Media Library)
2. Set color values (hex codes)
3. Configure social media links
4. Update contact information
5. Save - changes reflect across the website

### API Endpoint
- `GET /api/branding` - Fetch branding settings
- `PUT /api/branding` - Update branding settings

### Frontend Display
- Logo appears in header/footer
- Colors used throughout the site
- Social links in footer
- Contact info in contact page

---

## 3. 📍 Homepage Areas (`/dashboard/website/areas`)

### Purpose
Manage featured areas/locations displayed on the homepage.

### Features
- **Add Areas**: Create featured location cards
- **Area Images**: Upload images for each area
- **Area Details**: Name, description, property count
- **Status Control**: Show/hide areas on homepage
- **Order Management**: Control display order

### How It Works
1. Click "Add Area" to create a new featured area
2. Enter area name (e.g., "Powai", "Andheri", "Bandra")
3. Upload area image
4. Add description
5. Set status: "Active" or "Inactive"
6. Save - area appears on homepage

### API Endpoint
- `GET /api/homepage-areas` - Fetch all homepage areas
- `POST /api/homepage-areas` - Create new area
- `PUT /api/homepage-areas/[id]` - Update area
- `DELETE /api/homepage-areas/[id]` - Delete area

### Frontend Display
- Homepage shows featured areas section
- Only "Active" areas are displayed
- Links to area-specific property listings

---

## 4. 📄 Pages (`/dashboard/website/pages`)

### Purpose
Manage static pages (About Us, Contact, Privacy Policy, etc.)

### Features
- **Page Management**: Create, edit, delete pages
- **Content Editor**: Rich text content for pages
- **SEO Settings**: Meta title, description per page
- **Status Control**: Published or Draft
- **Slug Management**: URL-friendly page names

### How It Works
1. Click "Add Page" to create a new page
2. Enter page title (e.g., "About Us")
3. Set slug (URL: `/about`, `/contact`, etc.)
4. Add page content (rich text)
5. Set SEO meta title and description
6. Set status: "Published" or "Draft"
7. Save - page accessible at `/slug`

### Current Status
⚠️ **Note**: Currently uses mock data. Needs API implementation:
- `GET /api/pages` - Fetch all pages
- `POST /api/pages` - Create new page
- `PUT /api/pages/[id]` - Update page
- `DELETE /api/pages/[id]` - Delete page

### Frontend Display
- Pages accessible via routes like `/about`, `/contact`
- Content rendered from database
- SEO meta tags applied

---

## 5. 🛠️ Services (`/dashboard/website/services`)

### Purpose
Manage services offered (e.g., Property Management, Legal Services, etc.)

### Features
- **Service Management**: Add, edit, delete services
- **Service Icons**: Choose from icon library
- **Service Description**: Detailed service information
- **Status Control**: Active/Inactive services
- **Order Management**: Display order

### How It Works
1. Click "Add Service" to create a new service
2. Enter service name (e.g., "Property Management")
3. Select icon from icon picker
4. Add description
5. Set status: "Active" or "Inactive"
6. Save - service appears on services page

### API Endpoint
- `GET /api/services` - Fetch all services
- `POST /api/services` - Create new service
- `PUT /api/services/[id]` - Update service
- `DELETE /api/services/[id]` - Delete service

### Frontend Display
- Services page (`/services`) displays all active services
- Icons and descriptions shown
- Links to service details

---

## 6. 🔍 SEO Settings (`/dashboard/website/seo`)

### Purpose
Configure global SEO settings for the website.

### Features
- **Site Title**: Main website title (50-60 characters)
- **Site Description**: Meta description (150-160 characters)
- **Keywords**: SEO keywords
- **Open Graph Settings**: Social media sharing preview
- **Twitter Card Settings**: Twitter sharing preview
- **Robots.txt**: Search engine crawling rules

### How It Works
1. Enter site title (appears in browser tab)
2. Add meta description (search engine snippet)
3. Add keywords (comma-separated)
4. Configure Open Graph image for social sharing
5. Set Twitter card settings
6. Save - SEO settings applied globally

### Current Status
⚠️ **Note**: Currently uses mock data. Needs API implementation:
- `GET /api/seo` - Fetch SEO settings
- `PUT /api/seo` - Update SEO settings

### Frontend Display
- Meta tags in `<head>` of all pages
- Social sharing previews
- Search engine optimization

---

## 7. 🖼️ Media Library (`/dashboard/media`)

### Purpose
Centralized media management for all images used across the website.

### Features
- **Image Collection**: Gathers images from all sources
- **Source Tracking**: Shows where each image is used
- **Image Preview**: Visual gallery of all media
- **Search & Filter**: Find images quickly
- **Usage Information**: See which properties/pages use each image

### How It Works
1. Automatically collects images from:
   - Properties (featured images, gallery images)
   - Hero Images/Banners
   - Team Members
   - Testimonials
   - Blogs
   - Homepage Areas
2. Displays all images in a grid
3. Shows source (e.g., "Property: ABC Building")
4. Click to view full image
5. Copy image URL for use

### API Endpoints Used
- `GET /api/properties` - Property images
- `GET /api/hero-images` - Banner images
- `GET /api/people/team` - Team member images
- `GET /api/testimonials` - Testimonial images
- `GET /api/blogs` - Blog images
- `GET /api/homepage-areas` - Area images

### Frontend Display
- Media selector component uses this library
- Images available for selection when adding content
- Centralized image management

---

## Summary

| Section | Status | API | Frontend |
|---------|--------|-----|----------|
| Slideshow/Banner | ✅ Complete | ✅ Working | ✅ Homepage |
| Branding | ✅ Complete | ✅ Working | ✅ Site-wide |
| Homepage Areas | ✅ Complete | ✅ Working | ✅ Homepage |
| Pages | ⚠️ Mock Data | ❌ Needs API | ⚠️ Partial |
| Services | ✅ Complete | ✅ Working | ✅ Services Page |
| SEO Settings | ⚠️ Mock Data | ❌ Needs API | ⚠️ Not Applied |
| Media Library | ✅ Complete | ✅ Working | ✅ All Pages |

---

## Next Steps (If Needed)

1. **Pages API**: Create `/api/pages` endpoints for page management
2. **SEO API**: Create `/api/seo` endpoint for SEO settings
3. **Frontend Integration**: Connect Pages and SEO to frontend

All other sections are fully functional and ready to use!

