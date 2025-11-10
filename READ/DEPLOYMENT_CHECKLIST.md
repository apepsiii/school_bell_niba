# ✅ Deployment Checklist - School Bell System

## 📋 Pre-Deployment

### Hardware Preparation
- [ ] Komputer/Raspberry Pi sudah siap
- [ ] Power supply stabil (UPS recommended)
- [ ] Audio output device (Bluetooth speaker / Aux cable)
- [ ] Network connection (jika ingin akses remote)
- [ ] Tested audio output working

### Software Requirements
- [ ] Python 3.7+ installed
- [ ] pip installed
- [ ] Git installed (optional)
- [ ] Text editor installed (nano/vim/notepad++)

### Audio Files Preparation
- [ ] Bel masuk kelas (MP3)
- [ ] Bel istirahat (MP3)
- [ ] Bel pulang (MP3)
- [ ] Bel lain sesuai kebutuhan
- [ ] Test semua file audio bisa diputar

## 🚀 Installation Steps

### 1. Setup Project
```bash
- [ ] Download/extract project ke folder
- [ ] cd school-bell-system
- [ ] Check semua file ada (ls -la)
```

### 2. Install Dependencies
```bash
- [ ] pip install -r requirements.txt --break-system-packages
- [ ] Tidak ada error saat install
- [ ] Test import: python3 -c "import flask; import pygame"
```

### 3. Initialize Database
```bash
- [ ] python database.py
- [ ] File database/school_bell.db terbuat
- [ ] Check tables: sqlite3 database/school_bell.db ".tables"
```

### 4. (Optional) Add Sample Data
```bash
- [ ] python setup_sample_data.py
- [ ] Sample schedules created
- [ ] Sample audio entries created
```

## 📁 Initial Configuration

### 1. Upload Audio Files
- [ ] Jalankan aplikasi: python app.py
- [ ] Buka browser: http://localhost:5000
- [ ] Masuk ke menu Audio
- [ ] Upload semua file audio yang sudah disiapkan
- [ ] Verify semua audio ter-upload dengan baik
- [ ] Test preview audio

### 2. Create Schedules
- [ ] Masuk ke menu Jadwal
- [ ] Buat jadwal untuk Senin
- [ ] Buat jadwal untuk Selasa
- [ ] Buat jadwal untuk Rabu
- [ ] Buat jadwal untuk Kamis
- [ ] Buat jadwal untuk Jumat
- [ ] Buat jadwal untuk Sabtu (jika ada)
- [ ] Verify semua jadwal benar (hari, waktu, audio)

### 3. Test Manual Play
- [ ] Masuk ke menu Pengumuman
- [ ] Test putar setiap audio
- [ ] Verify audio keluar dari speaker
- [ ] Test stop audio
- [ ] Test volume control

### 4. Settings Configuration
- [ ] Set volume default (80% recommended)
- [ ] Test holiday mode ON
- [ ] Test holiday mode OFF
- [ ] Verify settings tersimpan

## 🔊 Audio Configuration

### Bluetooth Speaker
- [ ] Pair Bluetooth speaker dengan OS
- [ ] Set sebagai default audio output
- [ ] Test koneksi stabil
- [ ] Check audio quality
- [ ] Test jarak maksimal speaker

### Wired Speaker
- [ ] Connect aux cable ke sistem audio
- [ ] Set sebagai default audio output
- [ ] Test audio output
- [ ] Check volume level
- [ ] Verify tidak ada noise/distortion

## ⏰ Schedule Testing

### Test Actual Scheduling
- [ ] Set jadwal test 2-3 menit ke depan
- [ ] Wait sampai waktu trigger
- [ ] Verify audio berbunyi otomatis
- [ ] Check log pemutaran
- [ ] Delete jadwal test setelah selesai

### Test Holiday Mode
- [ ] Set jadwal test 2 menit ke depan
- [ ] Aktifkan holiday mode
- [ ] Wait sampai waktu trigger
- [ ] Verify audio TIDAK berbunyi
- [ ] Check log (status: cancelled)
- [ ] Nonaktifkan holiday mode

## 🔄 Auto-Start Setup

### Linux/Mac (systemd)
```bash
- [ ] Create service file: /etc/systemd/system/school-bell.service
- [ ] Edit path dan username dalam service file
- [ ] sudo systemctl daemon-reload
- [ ] sudo systemctl enable school-bell
- [ ] sudo systemctl start school-bell
- [ ] sudo systemctl status school-bell (check running)
- [ ] Reboot dan verify auto-start
```

### Windows (Startup)
```bash
- [ ] Create shortcut from start.bat
- [ ] Win+R → shell:startup
- [ ] Copy shortcut ke folder Startup
- [ ] Reboot dan verify auto-start
- [ ] Check Task Manager → Startup apps
```

### Raspberry Pi Specific
```bash
- [ ] Add to rc.local atau crontab
- [ ] @reboot cd /path && ./start.sh
- [ ] Verify execute permission: chmod +x start.sh
- [ ] Test reboot
```

## 🔐 Security Hardening (Production)

### Basic Security
- [ ] Change default Flask secret key
- [ ] Disable debug mode in production
- [ ] Set proper file permissions
- [ ] Limit network access if needed

### Advanced Security (Optional)
- [ ] Add user authentication
- [ ] Setup HTTPS with Let's Encrypt
- [ ] Configure firewall rules
- [ ] Setup fail2ban (Linux)
- [ ] Regular security updates

## 💾 Backup Strategy

### Initial Backup
- [ ] Backup database: cp database/school_bell.db backup/
- [ ] Backup audio: cp -r static/audio backup/
- [ ] Document all settings
- [ ] Save schedule screenshots

### Automated Backup (Recommended)
```bash
- [ ] Create backup script
- [ ] Setup daily cron job for backup
- [ ] Test restore from backup
- [ ] Setup cloud backup (Google Drive/Dropbox)
```

### Backup Schedule
```bash
# Add to crontab -e
0 2 * * * /path/to/backup-script.sh
```

## 📊 Monitoring Setup

### Basic Monitoring
- [ ] Check logs setiap hari
- [ ] Monitor disk space
- [ ] Check audio device connection
- [ ] Verify schedules running correctly

### Advanced Monitoring (Optional)
- [ ] Setup uptime monitoring
- [ ] Email alerts on errors
- [ ] Log rotation setup
- [ ] Dashboard for admin

## 🧪 Final Testing

### Day Before Go-Live
- [ ] Test semua jadwal di hari Senin
- [ ] Test semua jadwal di hari Selasa
- [ ] Test semua jadwal di hari Rabu
- [ ] Test semua jadwal di hari Kamis
- [ ] Test semua jadwal di hari Jumat
- [ ] Test holiday mode
- [ ] Test manual announcements
- [ ] Test volume control
- [ ] Test stop functionality
- [ ] Check logs accuracy

### Go-Live Day
- [ ] Start system 30 menit sebelum jadwal pertama
- [ ] Monitor log real-time
- [ ] Standby di lokasi speaker
- [ ] Test manual announcement sebagai backup
- [ ] Have phone/laptop ready untuk emergency control

### Post Go-Live (First Week)
- [ ] Day 1: Monitor semua jadwal
- [ ] Day 2: Check logs for errors
- [ ] Day 3: Verify no missed schedules
- [ ] Day 4: Check audio quality
- [ ] Day 5: User feedback collection
- [ ] Week end: Review and adjust

## 📝 Documentation

### Complete Before Go-Live
- [ ] Document system IP address
- [ ] Document login credentials (if added)
- [ ] Document backup location
- [ ] Document emergency contacts
- [ ] Create user manual for staff
- [ ] Create troubleshooting guide

### Create Quick Reference Card
```
System URL: http://[IP]:5000
Restart: sudo systemctl restart school-bell
Stop: sudo systemctl stop school-bell
Logs: /var/log/school-bell.log
Backup: /backup/school-bell/
Emergency Contact: [Phone]
```

## 🆘 Emergency Procedures

### Audio Tidak Berbunyi
```
1. Check speaker power
2. Check Bluetooth connection
3. Test manual play
4. Check volume settings
5. Check schedule active/inactive
6. Check holiday mode
7. Restart application
```

### System Crash
```
1. Check logs
2. Restart application
3. Check database integrity
4. Restore from backup if needed
5. Contact IT support
```

### Schedule Not Working
```
1. Check schedule is active
2. Check correct day/time
3. Check audio file exists
4. Check holiday mode off
5. Check system time correct
6. Reload schedules manually
```

## 🎓 Training

### Staff Training Checklist
- [ ] Train on accessing web interface
- [ ] Train on adding/editing schedules
- [ ] Train on uploading audio files
- [ ] Train on manual announcements
- [ ] Train on checking logs
- [ ] Train on holiday mode
- [ ] Train on basic troubleshooting
- [ ] Provide printed manual

### Admin Training
- [ ] Server access and management
- [ ] Backup and restore procedures
- [ ] Troubleshooting advanced issues
- [ ] System monitoring
- [ ] Security best practices

## ✅ Final Sign-Off

### Completed By
- **Technical Team**: _____________________ Date: _______
- **Admin/Principal**: _____________________ Date: _______
- **IT Support**: _____________________ Date: _______

### Go-Live Approval
- [ ] All tests passed
- [ ] Backups configured
- [ ] Staff trained
- [ ] Documentation complete
- [ ] Emergency procedures in place

### Go-Live Date: ______________

---

## 📞 Support Contact

**Primary Contact**: ___________________
**Phone**: ___________________
**Email**: ___________________

**Backup Contact**: ___________________
**Phone**: ___________________
**Email**: ___________________

---

**Checklist Version**: 1.0  
**Last Updated**: November 2024  
**Project**: School Bell Management System
