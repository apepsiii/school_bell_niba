# 🚀 School Bell System - VPS Deployment Guide

## 📋 Overview

Panduan lengkap untuk deploy **School Bell Management System** ke VPS dengan:
- ✅ Backend Flask + WebSocket
- ✅ Client Web Player (Public Access)
- ✅ PWA dengan Offline Support
- ✅ Nginx Reverse Proxy
- ✅ Systemd Service
- ✅ SSL Certificate (Let's Encrypt)

---

## 🖥️ Requirements

### VPS Specifications
- **OS**: Ubuntu 22.04 LTS
- **RAM**: Minimum 1GB (Recommended 2GB)
- **Storage**: 10GB+ (untuk audio files)
- **CPU**: 1 core minimum
- **Domain**: bell.smkniba.sch.id

### Software Requirements
- Python 3.8+
- Nginx
- SQLite3
- Audio drivers (ALSA/PulseAudio)

---

## 📦 Deployment Steps

### Step 1: Persiapan VPS

```bash
# SSH ke VPS
ssh root@YOUR_VPS_IP

# Update sistem
sudo apt update
sudo apt upgrade -y
```

### Step 2: Upload File Project

```bash
# Di komputer lokal, upload file ke VPS
scp -r school-bell-vps root@YOUR_VPS_IP:/tmp/

# Atau gunakan git
cd /tmp
git clone https://github.com/YOUR_USERNAME/school-bell-vps.git
```

### Step 3: Jalankan Deployment Script

```bash
# Masuk ke directory
cd /tmp/school-bell-vps

# Jalankan script (sebagai root)
sudo bash deploy.sh
```

Script akan otomatis:
1. ✅ Install dependencies
2. ✅ Setup Python virtual environment
3. ✅ Install Python packages
4. ✅ Initialize database
5. ✅ Configure Nginx
6. ✅ Setup systemd service
7. ✅ Configure firewall
8. ✅ Setup SSL (optional)
9. ✅ Create backup script

### Step 4: Verifikasi Installation

```bash
# Check service status
sudo systemctl status school-bell

# Check Nginx
sudo systemctl status nginx

# View logs
sudo journalctl -u school-bell -f
```

### Step 5: Setup DNS

Tambahkan A Record di DNS provider Anda:
```
A    bell.smkniba.sch.id    YOUR_VPS_IP
```

Tunggu propagasi DNS (5-30 menit).

### Step 6: Setup SSL Certificate

```bash
# Install SSL certificate
sudo certbot --nginx -d bell.smkniba.sch.id

# Test auto-renewal
sudo certbot renew --dry-run
```

---

## 🌐 Access Points

Setelah deployment berhasil:

### Admin Panel (Protected)
```
https://bell.smkniba.sch.id/
```
- Upload audio files
- Manage schedules
- View logs
- System settings

### Client Player (Public)
```
https://bell.smkniba.sch.id/player
```
- View jadwal hari ini
- Real-time countdown
- Auto-play bell audio
- Offline support (PWA)

### API Endpoint
```
https://bell.smkniba.sch.id/api/client/status
https://bell.smkniba.sch.id/api/client/schedules/today
```

---

## 🔧 Configuration

### File Locations

```
/var/www/school-bell/          # Application root
├── app.py                     # Main application
├── database.py                # Database functions
├── scheduler.py               # Scheduler
├── audio_player.py            # Audio player
├── requirements.txt           # Python deps
├── venv/                      # Virtual environment
├── static/
│   └── audio/                 # Audio files storage
├── client/                    # Client player files
│   ├── index.html
│   ├── player.js
│   ├── manifest.json
│   └── service-worker.js
├── database/
│   └── school_bell.db         # SQLite database
└── templates/                 # Admin templates

/etc/nginx/sites-available/school-bell     # Nginx config
/etc/systemd/system/school-bell.service    # Systemd service
/var/log/school-bell/                      # Application logs
/var/backups/school-bell/                  # Backups
```

### Environment Variables

Edit systemd service jika perlu:
```bash
sudo nano /etc/systemd/system/school-bell.service
```

Tambahkan environment variables:
```ini
Environment="SECRET_KEY=your-secret-key-here"
Environment="MAX_UPLOAD_SIZE=50"
```

Reload service:
```bash
sudo systemctl daemon-reload
sudo systemctl restart school-bell
```

---

## 🎵 Audio Setup

### Upload Audio Files

**Via Admin Panel:**
1. Login ke admin panel
2. Menu "Audio"
3. Click "Upload Audio"
4. Pilih file MP3/WAV/OGG
5. Upload

**Via SSH:**
```bash
# Upload langsung ke server
scp your-audio.mp3 root@YOUR_VPS_IP:/var/www/school-bell/static/audio/

# Set permissions
sudo chown www-data:www-data /var/www/school-bell/static/audio/*.mp3
sudo chmod 644 /var/www/school-bell/static/audio/*.mp3
```

### Supported Formats
- MP3 (recommended)
- WAV
- OGG

### File Size Limit
- Default: 50MB
- Modify in `app.py`: `MAX_CONTENT_LENGTH`

---

## 📱 Client Player Features

### Real-time Updates
- ✅ WebSocket connection untuk update instant
- ✅ Countdown timer untuk bel berikutnya
- ✅ Status indicator (online/playing/holiday)

### Offline Support (PWA)
- ✅ Cache static files
- ✅ Cache audio files
- ✅ Works without internet after first load
- ✅ Installable as mobile app

### Auto-play Audio
- ✅ Audio plays automatically saat bel berbunyi
- ✅ Browser harus allow autoplay (user interaction)

### Responsive Design
- ✅ Desktop optimized
- ✅ Mobile friendly
- ✅ Tablet compatible

---

## 🛠️ Maintenance

### Service Management

```bash
# Start service
sudo systemctl start school-bell

# Stop service
sudo systemctl stop school-bell

# Restart service
sudo systemctl restart school-bell

# Check status
sudo systemctl status school-bell

# Enable auto-start on boot
sudo systemctl enable school-bell

# View logs
sudo journalctl -u school-bell -f
```

### Nginx Management

```bash
# Test configuration
sudo nginx -t

# Reload configuration
sudo systemctl reload nginx

# Restart Nginx
sudo systemctl restart nginx

# Check status
sudo systemctl status nginx

# View access logs
sudo tail -f /var/log/nginx/school-bell-access.log

# View error logs
sudo tail -f /var/log/nginx/school-bell-error.log
```

### Database Management

```bash
# Backup database
sudo cp /var/www/school-bell/database/school_bell.db \
       /var/backups/school-bell/school_bell_$(date +%Y%m%d).db

# Restore database
sudo cp /var/backups/school-bell/school_bell_YYYYMMDD.db \
       /var/www/school-bell/database/school_bell.db

# Check database
sudo sqlite3 /var/www/school-bell/database/school_bell.db
```

### Backup & Restore

**Automatic Backup:**
- Runs daily at 2 AM
- Keeps last 7 days
- Location: `/var/backups/school-bell/`

**Manual Backup:**
```bash
sudo /usr/local/bin/backup-school-bell.sh
```

**Restore from Backup:**
```bash
# Stop service
sudo systemctl stop school-bell

# Restore database
sudo cp /var/backups/school-bell/school_bell_YYYYMMDD.db \
       /var/www/school-bell/database/school_bell.db

# Restore audio files
sudo tar -xzf /var/backups/school-bell/audio_YYYYMMDD.tar.gz \
       -C /var/www/school-bell/static/

# Fix permissions
sudo chown -R www-data:www-data /var/www/school-bell

# Start service
sudo systemctl start school-bell
```

---

## 🐛 Troubleshooting

### Service Won't Start

```bash
# Check logs
sudo journalctl -u school-bell -n 50

# Check Python errors
sudo tail -f /var/log/school-bell/error.log

# Test manually
cd /var/www/school-bell
source venv/bin/activate
python app.py
```

### Audio Not Playing

**Server-side:**
```bash
# Check audio system
aplay -l

# Test audio
speaker-test -t wav -c 2

# Check pulseaudio
pulseaudio --check
pulseaudio --start
```

**Client-side:**
- Check browser console for errors
- Ensure autoplay is allowed
- Check network connection
- Verify audio file exists

### WebSocket Connection Failed

```bash
# Check if port 5000 is listening
sudo netstat -tlnp | grep 5000

# Check Nginx WebSocket config
sudo nginx -t

# Check firewall
sudo ufw status

# Allow port (if needed)
sudo ufw allow 5000
```

### High Memory Usage

```bash
# Check memory
free -h

# Check process
ps aux | grep python

# Restart service
sudo systemctl restart school-bell
```

### SSL Certificate Issues

```bash
# Renew certificate manually
sudo certbot renew

# Check certificate expiry
sudo certbot certificates

# Test auto-renewal
sudo certbot renew --dry-run
```

---

## 📊 Monitoring

### System Monitoring

```bash
# CPU & Memory
htop

# Disk usage
df -h

# Service uptime
sudo systemctl status school-bell

# System logs
sudo journalctl -xe
```

### Application Monitoring

```bash
# Real-time logs
sudo journalctl -u school-bell -f

# Error logs
sudo tail -f /var/log/school-bell/error.log

# Access logs
sudo tail -f /var/log/nginx/school-bell-access.log

# Check database size
sudo du -sh /var/www/school-bell/database/school_bell.db
```

### Performance Tuning

**Gunicorn Workers:**
Edit `/etc/systemd/system/school-bell.service`:
```ini
# Increase workers for better performance
--workers 2
```

**Nginx Caching:**
Edit `/etc/nginx/sites-available/school-bell`:
```nginx
# Add caching
proxy_cache_path /var/cache/nginx levels=1:2 keys_zone=bell_cache:10m;
proxy_cache bell_cache;
```

---

## 🔒 Security

### Firewall (UFW)

```bash
# Enable firewall
sudo ufw enable

# Allow SSH
sudo ufw allow OpenSSH

# Allow HTTP/HTTPS
sudo ufw allow 'Nginx Full'

# Check status
sudo ufw status
```

### Admin Panel Protection

**Add Basic Auth:**
```bash
# Create password file
sudo htpasswd -c /etc/nginx/.htpasswd admin

# Edit Nginx config
sudo nano /etc/nginx/sites-available/school-bell
```

Uncomment dalam Nginx config:
```nginx
location / {
    auth_basic "School Bell Admin";
    auth_basic_user_file /etc/nginx/.htpasswd;
    ...
}
```

Reload Nginx:
```bash
sudo systemctl reload nginx
```

### Update System Regularly

```bash
# Update packages
sudo apt update
sudo apt upgrade -y

# Update Python packages
cd /var/www/school-bell
source venv/bin/activate
pip install --upgrade -r requirements.txt
```

---

## 📈 Scaling

### Multiple Audio Zones

Coming soon: Support untuk multiple zones/ruangan dengan output berbeda.

### Load Balancing

Untuk traffic tinggi, setup multiple instances dengan Nginx load balancer.

### Cloud Backup

Setup automatic backup to cloud storage (Google Drive, Dropbox, S3).

---

## 📞 Support

### Get Help

- Check logs first
- Review documentation
- Search error messages online
- Contact system administrator

### Reporting Issues

Sertakan informasi berikut:
- OS version: `lsb_release -a`
- Service status: `systemctl status school-bell`
- Error logs: `journalctl -u school-bell -n 100`
- Nginx logs
- Steps to reproduce

---

## 🎉 Success!

Jika semua berjalan lancar, sistem Anda sekarang:
- ✅ Running 24/7 di VPS
- ✅ Accessible via domain
- ✅ Client player works on all devices
- ✅ Auto-play bell audio on schedule
- ✅ Offline support enabled
- ✅ Automatic backups configured
- ✅ SSL certificate installed

**Test URL:**
- Admin: https://bell.smkniba.sch.id/
- Player: https://bell.smkniba.sch.id/player

---

**Created with ❤️ for SMK NIBA**  
*Version 2.0 - VPS Edition*
