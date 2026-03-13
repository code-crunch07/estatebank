# Image Upload Paths

All images in the app are uploaded to the local `uploads` folder and served at `/uploads/{folder}/{filename}`.

## Base Path

- **Default:** `public/uploads` (relative to project root)
- **Custom:** Set `UPLOAD_PATH` in `.env` for full path (e.g. `/home/estatebanknew/htdocs/estatebank.in/estate-uploads/public`)

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

**Option 2:** Use estate-uploads/public with UPLOAD_PATH (recommended for this server)
```env
UPLOAD_PATH=/home/estatebanknew/htdocs/estatebank.in/estate-uploads/public
```
Then configure your web server (CloudPanel/Nginx) to serve `/uploads/` from that directory, or the app will serve them via `/api/uploads/*`.

## Creating the uploads directory

The upload API creates subfolders automatically. Ensure the base `public/uploads` directory exists:

```bash
mkdir -p public/uploads
```

Or for custom path (estate-uploads/public):
```bash
mkdir -p /home/estatebanknew/htdocs/estatebank.in/estate-uploads/public
```

## Troubleshooting 404 errors

If images return 404:

1. **Check UPLOAD_PATH** – Ensure `.env` has the correct path:
   ```env
   UPLOAD_PATH=/home/estatebanknew/htdocs/estatebank.in/estate-uploads/public
   ```
   Or use default (omit UPLOAD_PATH): `public/uploads`

2. **Verify files exist** – On the server:
   ```bash
   ls -la /home/estatebanknew/htdocs/estatebank.in/estate-uploads/public/properties/gallery/
   ```

3. **Copy uploads if missing** – If files were uploaded locally, copy to the server:
   ```bash
   scp -r public/uploads/* user@server:/home/estatebanknew/htdocs/estatebank.in/estate-uploads/public/
   ```

4. **Permissions** – Ensure the app can read the uploads directory:
   ```bash
   chmod -R 755 /path/to/uploads
   ```

5. **Serve via API** – `/uploads/*` is served via `/api/uploads/*` so files in UPLOAD_PATH are served even when outside `public/`.
