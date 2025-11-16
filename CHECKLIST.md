# ✅ Deployment Checklist - School Bell System

Print atau simpan checklist ini untuk memastikan semua langkah deployment berhasil.

---

## 📋 Pre-Deployment Preparation

### VPS Requirements
- [ ] VPS Ubuntu 22.04 ready
- [ ] RAM minimum 1GB (recommended 2GB)
- [ ] Storage minimum 10GB
- [ ] Root/sudo access available
- [ ] VPS IP address noted: ________________

### Domain Configuration
- [ ] Domain registered: bell.smkniba.sch.id
- [ ] DNS A record added (bell → VPS_IP)
- [ ] DNS propagated (test: `ping bell.smkniba.sch.id`)

### Files Preparation
- [ ] Downloaded `school-bell-vps` folder
- [ ] Ran `prepare-vps.sh` script
- [ ] All files from original project copied
- [ ] Files uploaded to VPS `/tmp/` directory

---

## 🚀 Deployment Steps

### Step 1: System Update
- [ ] SSH connected to VPS
- [ ] Ran: `sudo apt update && sudo apt upgrade -y`
- [ ] System fully updated

### Step 2: Run Deployment Script
- [ ] Navigated to: `cd /tmp/school-bell-vps`
- [ ] Made script executable: `chmod +x deploy.sh`
- [ ] Ran: `sudo bash deploy.sh`
- [ ] Script completed without errors
- [ ] All dependencies installed

### Step 3: Service Configuration
- [ ] Service file created: `/etc/systemd/system/school-bell.service`
- [ ] Service enabled: `sudo systemctl enable school-bell`
- [ ] Service started: `sudo systemctl start school-bell`
- [ ] Service status: `sudo systemctl status school-bell` shows "active"

### Step 4: Nginx Configuration
- [ ] Nginx config created: `/etc/nginx/sites-available/school-bell`
- [ ] Symlink created: `/etc/nginx/sites-enabled/school-bell`
- [ ] Nginx test passed: `sudo nginx -t`
- [ ] Nginx reloaded: `sudo systemctl reload nginx`

### Step 5: Firewall Configuration
- [ ] UFW enabled: `sudo ufw enable`
- [ ] SSH allowed: `sudo ufw allow OpenSSH`
- [ ] HTTP/HTTPS allowed: `sudo ufw allow 'Nginx Full'`
- [ ] Firewall status checked: `sudo ufw status`

### Step 6: SSL Certificate
- [ ] Certbot installed
- [ ] SSL certificate obtained: `sudo certbot --nginx -d bell.smkniba.sch.id`
- [ ] HTTPS working
- [ ] Auto-renewal configured: `sudo certbot renew --dry-run`

---

## 🧪 Testing & Verification

### Service Testing
- [ ] Service running: `systemctl status school-bell`
- [ ] No errors in logs: `journalctl -u school-bell -n 50`
- [ ] Nginx running: `systemctl status nginx`
- [ ] Process listening on port 5000: `sudo netstat -tlnp | grep 5000`

### Website Access Testing
- [ ] Admin panel accessible: https://bell.smkniba.sch.id/
- [ ] Client player accessible: https://bell.smkniba.sch.id/player
- [ ] No SSL warnings in browser
- [ ] Website loads properly

### Functionality Testing
- [ ] Can access admin dashboard
- [ ] Audio menu accessible
- [ ] Can upload audio file (test with small MP3)
- [ ] Uploaded audio appears in list
- [ ] Can create new schedule
- [ ] Schedule appears in schedules list
- [ ] Manual play works (Announcements menu)
- [ ] Audio plays successfully

### Client Player Testing
- [ ] Player page loads properly
- [ ] Clock displays correct time
- [ ] Schedule for today displays
- [ ] Countdown timer works
- [ ] WebSocket status shows "Terhubung"
- [ ] Tested on desktop browser
- [ ] Tested on mobile browser
- [ ] Tested on tablet (if available)

### Real-time Features Testing
- [ ] Play audio from admin → Client receives update
- [ ] Toggle holiday mode → Client updates status
- [ ] Create schedule → Client refreshes schedules
- [ ] WebSocket connection remains stable

### Offline/PWA Testing
- [ ] Can install as PWA (Add to Home Screen)
- [ ] Service worker registered (check console)
- [ ] Works offline after first load
- [ ] Audio cached for offline playback

---

## 🔧 Post-Deployment Configuration

### Database Initialization
- [ ] Database file exists: `/var/www/school-bell/database/school_bell.db`
- [ ] Database has proper permissions
- [ ] Sample data loaded (if needed)

### Audio Files Setup
- [ ] Audio directory created: `/var/www/school-bell/static/audio/`
- [ ] Uploaded initial audio files
- [ ] Audio files have proper permissions (644)
- [ ] Audio files accessible via browser

### Schedule Configuration
- [ ] Created schedules for Monday
- [ ] Created schedules for Tuesday
- [ ] Created schedules for Wednesday
- [ ] Created schedules for Thursday
- [ ] Created schedules for Friday
- [ ] Created schedules for Saturday (if needed)
- [ ] Created schedules for Sunday (if needed)

### Settings Configuration
- [ ] Set appropriate volume level
- [ ] Configured holiday mode (if currently holiday)
- [ ] Tested settings save/load

---

## 📊 Monitoring Setup

### Log Monitoring
- [ ] Can view application logs: `journalctl -u school-bell -f`
- [ ] Can view error logs: `tail -f /var/log/school-bell/error.log`
- [ ] Can view Nginx access logs
- [ ] Can view Nginx error logs

### Backup Configuration
- [ ] Backup script exists: `/usr/local/bin/backup-school-bell.sh`
- [ ] Backup script is executable
- [ ] Backup directory created: `/var/backups/school-bell/`
- [ ] Cron job configured (daily 2 AM)
- [ ] Ran manual backup test
- [ ] Verified backup files created

### Resource Monitoring
- [ ] Checked disk space: `df -h`
- [ ] Checked memory usage: `free -h`
- [ ] Checked CPU usage: `htop` or `top`
- [ ] No resource warnings

---

## 🔒 Security Checklist

### Basic Security
- [ ] Changed default SSH port (optional)
- [ ] Disabled root SSH login (optional)
- [ ] SSH key authentication configured (optional)
- [ ] Fail2ban installed (optional)

### Application Security
- [ ] Admin panel protected (basic auth if configured)
- [ ] Strong secret key set in environment
- [ ] File upload size limits configured
- [ ] File type validation working

### SSL/TLS Security
- [ ] SSL certificate valid
- [ ] Certificate auto-renewal working
- [ ] HTTPS redirect configured
- [ ] SSL test passed (ssllabs.com)

### Firewall Security
- [ ] Only necessary ports open
- [ ] SSH port protected
- [ ] UFW active and enabled

---

## 📱 User Distribution

### URL Distribution
- [ ] Admin panel URL shared with admins
- [ ] Client player URL shared with:
  - [ ] Teachers
  - [ ] Students
  - [ ] Staff
  - [ ] Other users

### Documentation Provided
- [ ] User manual created
- [ ] How to use player (screenshots)
- [ ] How to install as app
- [ ] Troubleshooting guide for users

### Training Completed
- [ ] Admin trained on:
  - [ ] Uploading audio
  - [ ] Creating schedules
  - [ ] Manual announcements
  - [ ] Viewing logs
  - [ ] Basic troubleshooting
- [ ] Users trained on:
  - [ ] Accessing player
  - [ ] Installing as app
  - [ ] Understanding schedule display

---

## 📈 Performance Optimization

### Application Performance
- [ ] Gunicorn workers configured appropriately
- [ ] Database optimized (vacuumed if needed)
- [ ] Static files cached properly
- [ ] Audio files compressed (appropriate bitrate)

### Server Performance
- [ ] Nginx caching configured (if needed)
- [ ] Gzip compression enabled
- [ ] Server resources sufficient
- [ ] No memory leaks detected

---

## 🎯 Final Verification

### Smoke Testing
- [ ] Ran complete end-to-end test
- [ ] Waited for scheduled bell to ring
- [ ] Audio played on schedule successfully
- [ ] Client received real-time update
- [ ] System stable after 24 hours

### Documentation
- [ ] Deployment notes documented
- [ ] Admin credentials saved securely
- [ ] Server info documented
- [ ] Emergency contacts updated

### Handover
- [ ] System handed over to admin
- [ ] Emergency procedures explained
- [ ] Contact information exchanged
- [ ] Support arrangement made

---

## ✅ Sign-Off

### Technical Team
**Name:** ___________________________  
**Date:** ___________________________  
**Signature:** ______________________

### School Admin
**Name:** ___________________________  
**Date:** ___________________________  
**Signature:** ______________________

### IT Support
**Name:** ___________________________  
**Date:** ___________________________  
**Signature:** ______________________

---

## 🎉 Go-Live Approval

- [ ] All checklist items completed
- [ ] System tested and stable
- [ ] Users trained
- [ ] Documentation complete
- [ ] Backup working
- [ ] Monitoring active
- [ ] Support arranged

**GO-LIVE DATE:** _______________

**STATUS:** 
- [ ] Ready for Production
- [ ] Needs Review
- [ ] Issues to Resolve

---

## 📞 Emergency Contacts

**Primary Technical Contact:**  
Name: ___________________________  
Phone: __________________________  
Email: __________________________

**Backup Contact:**  
Name: ___________________________  
Phone: __________________________  
Email: __________________________

**VPS Provider Support:**  
URL: ____________________________  
Phone: __________________________

**Domain Provider:**  
URL: ____________________________  
Support: _________________________

---

## 📝 Notes & Issues

Use this space to note any issues, special configurations, or important information:

```
[Write notes here]







```

---

**Checklist Version:** 1.0  
**Last Updated:** November 16, 2024  
**System:** School Bell Management System VPS v2.0
