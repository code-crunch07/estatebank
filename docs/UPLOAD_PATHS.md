# Image Upload Paths

All images in the app are uploaded to the local `uploads` folder and served at `/uploads/{folder}/{filename}`.

## Base Path

- **Default:** `public/uploads` (relative to project root)
- **Custom:** Set `UPLOAD_PATH` in `.env` for full path (e.g. `/home/estatebanknew/htdocs/estatebank.in/public/uploads`)

## Upload Folders by Content Type

| Content Type | Folder | URL Path |
|--------------|--------|----------|
| **Properties** | | |
| Featured image | `properties/featured` | `/uploads/properties/featured/` |
| Gallery images | `properties/gallery` | `/uploads/properties/gallery/` |
| Floor plans | `properties/floor-plans` | `/uploads/properties/floor-plans/` |
| **Team** | `team-members` | `/uploads/team-members/` |
| **Testimonials** | `testimonials` | `/uploads/testimonials/` |
| **Hero Slider** | `hero-images` | `/uploads/hero-images/` |
| **Clients** | `clients/logos` | `/uploads/clients/logos/` |
| **Branding** | `branding` | `/uploads/branding/` |
| **Homepage Areas** | `homepage-areas` | `/uploads/homepage-areas/` |

## CloudPanel / Server Deployment

For deployment at `/home/estatebanknew/htdocs/estatebank.in`:

You have `uploads` at the root. To use it for all images:

**Option 1:** Move uploads inside public (recommended)
```bash
cd /home/estatebanknew/htdocs/estatebank.in
mv uploads public/uploads
# Or if public/uploads exists: cp -r uploads/* public/uploads/
```

**Option 2:** Use root-level uploads with UPLOAD_PATH
```env
UPLOAD_PATH=/home/estatebanknew/htdocs/estatebank.in/uploads
```
Then configure your web server (CloudPanel/Nginx) to serve `/uploads/` from that directory.

## Creating the uploads directory

The upload API creates subfolders automatically. Ensure the base `public/uploads` directory exists:

```bash
mkdir -p public/uploads
```

Or for custom path:
```bash
mkdir -p /home/estatebanknew/htdocs/estatebank.in/public/uploads
```
