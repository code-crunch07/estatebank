# EstateBANK.in - Quick Reference Card

## 🚀 Quick Commands

### Start Application
```bash
cd /opt/estatebank/estatebank-prod
docker compose up -d
```

### Stop Application
```bash
docker compose down
```

### Restart Application
```bash
docker compose restart
```

### Update Code
```bash
cd /opt/estatebank/estatebank-prod
git pull
docker compose build --no-cache
docker compose down
docker compose up -d
```

### Check Status
```bash
docker compose ps
```

### View Logs
```bash
# App logs
docker compose logs -f app

# MongoDB logs
docker compose logs -f mongodb

# All logs
docker compose logs -f
```

### Create Admin
```bash
docker compose exec app npx tsx scripts/create-admin.ts
```

### Health Check
```bash
curl http://localhost:3000/api/health
```

### Backup MongoDB
```bash
docker compose exec mongodb mongodump \
  --uri="mongodb://admin:PASSWORD@localhost:27017/estatebank?authSource=admin" \
  --archive > backup_$(date +%Y%m%d).archive
```

---

## 📍 Important Paths

- **Project Directory**: `/opt/estatebank/estatebank-prod`
- **Environment File**: `/opt/estatebank/estatebank-prod/.env`
- **Backups**: `/opt/estatebank/backups`

---

## 🔗 Important URLs

- **Application**: `https://your-domain.com`
- **Admin Dashboard**: `https://your-domain.com/dashboard`
- **API Health**: `https://your-domain.com/api/health`
- **CloudPanel**: `https://your-vps-ip:8443`

---

## 🐛 Quick Troubleshooting

### Container Not Starting
```bash
docker compose logs app
docker compose restart
```

### MongoDB Issues
```bash
docker compose logs mongodb
docker compose restart mongodb
```

### Permission Errors
```bash
sudo usermod -aG docker $USER
newgrp docker
```

### Port Conflicts
```bash
sudo lsof -i :3000
sudo kill -9 <PID>
```

---

## 📧 Environment Variables (Key Ones)

```env
MONGODB_URI=mongodb://admin:PASSWORD@mongodb:27017/estatebank?authSource=admin
JWT_SECRET=your_secret_here
BREVO_SMTP_USER=your_brevo_user
BREVO_SMTP_PASSWORD=your_brevo_password
ADMIN_EMAIL=admin@estatebank.in
ADMIN_PASSWORD_CREATE=your_password
```

---

**For detailed instructions, see `DEPLOYMENT_GUIDE.md`**

