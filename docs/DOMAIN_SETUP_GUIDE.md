# Domain Setup Guide - Deploy to Any Domain

Yes! You can deploy this application to **any domain**. This guide shows you how.

---

## ✅ What Works Automatically

The app is designed to work on any domain because:

1. **Dynamic URLs**: Uses `window.location.origin` for API calls
2. **No hardcoded domains**: Most references are dynamic
3. **Environment-based**: Configuration via environment variables

---

## 🔧 What Needs Configuration

### 1. DNS Configuration

Point your domain to your server's IP address:

```
Type: A
Name: @ (or blank for root domain)
Value: YOUR_SERVER_IP
TTL: 3600

Type: A
Name: www
Value: YOUR_SERVER_IP
TTL: 3600
```

**Example:**
- Domain: `example.com`
- Server IP: `93.127.172.86`

```
A Record: @ → 93.127.172.86
A Record: www → 93.127.172.86
```

---

### 2. Reverse Proxy Configuration

#### Option A: CloudPanel (Recommended)

1. Login to CloudPanel
2. Go to **Sites** → **Add Site** → **Proxy Site**
3. Configure:
   - **Domain**: `yourdomain.com`
   - **Backend URL**: `http://localhost:3000`
   - **Backend Port**: `3000`
4. Enable SSL (Let's Encrypt)

#### Option B: Nginx

Create `/etc/nginx/sites-available/yourdomain.com`:

```nginx
server {
    listen 80;
    server_name yourdomain.com www.yourdomain.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

Enable site:
```bash
sudo ln -s /etc/nginx/sites-available/yourdomain.com /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

#### Option C: Caddy

Create `Caddyfile`:

```
yourdomain.com {
    reverse_proxy localhost:3000
}
```

---

### 3. Environment Variables

No domain-specific environment variables needed! The app automatically detects the domain.

However, you can optionally set:

```bash
# Optional - for email links, etc.
NEXT_PUBLIC_BASE_URL=https://yourdomain.com
```

But this is **not required** - the app uses `window.location.origin` automatically.

---

### 4. Update Hardcoded References (Optional)

There are a few places with "estatebank.in" as fallback. These are safe to leave, but you can update:

#### File: `app/(dashboard)/dashboard/properties/page.tsx`

**Current:**
```typescript
value={`${typeof window !== 'undefined' ? window.location.origin : 'https://estatebank.in'}${getPropertyUrl(selectedProperty)}`}
```

**This is fine!** It uses `window.location.origin` first, and only falls back to estatebank.in if window is undefined (server-side).

#### File: `app/(client)/about/page.tsx`

**Line 515:** Hardcoded video URL
```typescript
<source src="https://www.estatebank.in/uploads/about_image/video_20200727114642.mp4" type="video/mp4" />
```

**Update this if you have a different video URL:**
```typescript
<source src="/uploads/about_image/video_20200727114642.mp4" type="video/mp4" />
```

---

## 🚀 Deployment Steps for New Domain

### Step 1: Prepare Server

```bash
# SSH to your server
ssh user@your-server-ip

# Navigate to project
cd /opt/estatebank/estatebank-prod
```

### Step 2: Update Docker Compose (if needed)

The `docker-compose.yml` doesn't need domain changes - it runs on localhost:3000 internally.

### Step 3: Configure Reverse Proxy

Use CloudPanel, Nginx, or Caddy (see section 2 above).

### Step 4: Set Up SSL Certificate

**CloudPanel:**
- Automatic via Let's Encrypt in site settings

**Nginx with Certbot:**
```bash
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com
```

**Caddy:**
- Automatic SSL by default

### Step 5: Deploy

```bash
# Build and start
docker compose build --no-cache
docker compose up -d

# Check logs
docker compose logs -f app
```

### Step 6: Verify

1. **Test domain**: `https://yourdomain.com`
2. **Test API**: `https://yourdomain.com/api/health`
3. **Test dashboard**: `https://yourdomain.com/dashboard/login`

---

## 🔍 Domain-Specific Checklist

- [ ] DNS A records pointing to server IP
- [ ] Reverse proxy configured (CloudPanel/Nginx/Caddy)
- [ ] SSL certificate installed (HTTPS)
- [ ] Docker containers running
- [ ] Application accessible on domain
- [ ] API endpoints working
- [ ] Dashboard login working

---

## 📝 Multiple Domains

You can run the same app on multiple domains:

1. **Same Server, Multiple Domains:**
   - Create multiple proxy sites in CloudPanel
   - All point to `http://localhost:3000`
   - Each domain gets its own SSL certificate

2. **Different Servers:**
   - Deploy the same codebase to different servers
   - Each server has its own domain
   - Each has its own database (or shared MongoDB Atlas)

---

## 🌐 Subdomain Setup

You can also use subdomains:

- `app.yourdomain.com` → Main app
- `admin.yourdomain.com` → Dashboard (same app, different route)
- `api.yourdomain.com` → API (same app, `/api` routes)

**CloudPanel Setup:**
1. Create proxy site for each subdomain
2. All point to `http://localhost:3000`
3. Each gets SSL certificate

---

## ⚙️ Environment Variables (No Changes Needed)

Your `.env` file doesn't need domain-specific variables:

```bash
# These work for any domain
MONGODB_URI=mongodb://...
JWT_SECRET=...
BREVO_SMTP_HOST=...
# etc.
```

The app automatically:
- Detects current domain
- Uses it for API calls
- Generates correct URLs

---

## 🔄 Switching Domains

If you want to move from one domain to another:

1. **Update DNS** to point new domain to server
2. **Add new domain** in reverse proxy (CloudPanel/Nginx)
3. **Get SSL certificate** for new domain
4. **No code changes needed!**

The app will automatically work on the new domain.

---

## 🐛 Troubleshooting

### Issue: Domain not loading

```bash
# Check DNS propagation
dig yourdomain.com
nslookup yourdomain.com

# Check reverse proxy
curl http://localhost:3000  # Should work
curl -H "Host: yourdomain.com" http://localhost:3000  # Test with domain header
```

### Issue: SSL not working

```bash
# Check certificate
sudo certbot certificates

# Renew if needed
sudo certbot renew
```

### Issue: Mixed content (HTTP/HTTPS)

Make sure all external resources use HTTPS or relative URLs.

---

## ✅ Summary

**Yes, you can deploy to any domain!**

1. ✅ Point DNS to your server
2. ✅ Configure reverse proxy (CloudPanel/Nginx/Caddy)
3. ✅ Get SSL certificate
4. ✅ Deploy (no code changes needed)
5. ✅ Done!

The app is **domain-agnostic** and will work on any domain you configure.

---

## 📚 Related Guides

- `CLEAN_REDEPLOY_GUIDE.md` - Clean deployment steps
- `CLOUDPANEL_COMPLETE_GUIDE.md` - CloudPanel setup
- `DEPLOYMENT_GUIDE.md` - Full deployment guide

---

**Need help?** Check the deployment guides in the `docs/` folder! 🚀
