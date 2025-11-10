# 🔔 School Bell Management System

## Sistem Manajemen Bel Sekolah Otomatis Berbasis Web

### 📦 Apa yang Ada di Sini?

Aplikasi lengkap untuk mengotomatisasi bel sekolah dengan fitur:
- ⏰ **Scheduling Otomatis** - Bel berbunyi sesuai jadwal
- 🎵 **Audio Management** - Upload dan kelola file MP3
- 📢 **Pengumuman Manual** - Putar audio kapan saja
- 📊 **Monitoring & Logs** - Track semua pemutaran
- ⚙️ **Settings** - Volume control & holiday mode
- 📱 **Responsive** - Bisa diakses dari HP/tablet

---

## 🚀 QUICK START (3 Langkah)

### 1️⃣ Install Dependencies
```bash
cd school-bell-system
pip install -r requirements.txt --break-system-packages
```

### 2️⃣ Initialize Database
```bash
python database.py
```

### 3️⃣ Run Application
```bash
python app.py
```

Buka browser: **http://localhost:5000**

---

## 📁 Struktur File

```
school-bell-system/
├── 📘 README.md                    # Dokumentasi utama
├── 🚀 QUICKSTART.md               # Panduan cepat
├── 🏗️ ARCHITECTURE.md             # Arsitektur sistem
├── ✅ DEPLOYMENT_CHECKLIST.md     # Checklist deployment
├── 📋 PROJECT_SUMMARY.md          # Ringkasan project
├── 🎨 VISUAL_GUIDE.md             # Panduan visual
│
├── 🐍 BACKEND (Python)
│   ├── app.py                     # Main application
│   ├── database.py                # Database functions
│   ├── scheduler.py               # Auto scheduler
│   ├── audio_player.py            # Audio player
│   └── requirements.txt           # Dependencies
│
├── 🎨 FRONTEND (Web)
│   ├── templates/                 # HTML templates
│   │   ├── base.html
│   │   ├── index.html            # Dashboard
│   │   ├── schedules.html        # Jadwal
│   │   ├── audio.html            # Audio
│   │   ├── announcements.html    # Pengumuman
│   │   └── logs.html             # Logs
│   │
│   └── static/
│       ├── css/style.css         # Custom CSS
│       ├── js/*.js               # JavaScript
│       └── audio/                # Audio files
│
├── 🗄️ DATABASE
│   └── database/school_bell.db   # SQLite (auto-created)
│
└── 🛠️ UTILITIES
    ├── start.sh                   # Linux/Mac starter
    ├── start.bat                  # Windows starter
    └── setup_sample_data.py       # Sample data
```

---

## 📖 Dokumentasi Lengkap

| File | Deskripsi |
|------|-----------|
| **README.md** | Dokumentasi lengkap instalasi & penggunaan |
| **QUICKSTART.md** | Panduan cepat untuk pemula |
| **ARCHITECTURE.md** | Penjelasan detail arsitektur sistem |
| **DEPLOYMENT_CHECKLIST.md** | Checklist step-by-step deployment |
| **PROJECT_SUMMARY.md** | Overview lengkap project |
| **VISUAL_GUIDE.md** | Panduan visual UI/UX |

---

## 🎯 Fitur Lengkap

### Dashboard
- ✅ Status sistem real-time
- ✅ Jadwal berikutnya
- ✅ Toggle holiday mode
- ✅ Volume control
- ✅ Recent logs

### Manajemen Jadwal
- ✅ Create/Edit/Delete jadwal
- ✅ Set hari & waktu
- ✅ Pilih audio file
- ✅ Toggle aktif/nonaktif
- ✅ Auto-reload scheduler

### Manajemen Audio
- ✅ Upload MP3/WAV/OGG
- ✅ Max file size 50MB
- ✅ Preview audio
- ✅ Delete file
- ✅ Auto-detect durasi

### Pengumuman Manual
- ✅ Play audio instant
- ✅ Volume control
- ✅ Stop control
- ✅ Status pemutaran
- ✅ Independent dari jadwal

### Log & Monitoring
- ✅ Complete play history
- ✅ Success/failed tracking
- ✅ Manual play tracking
- ✅ Statistics
- ✅ Auto-refresh

---

## 🔧 Teknologi

- **Backend**: Python 3.7+, Flask, APScheduler, Pygame
- **Frontend**: HTML5, CSS3, JavaScript, Bootstrap 5
- **Database**: SQLite
- **Audio**: MP3, WAV, OGG support

---

## 💻 System Requirements

### Minimum
- Python 3.7+
- 1GB RAM
- 8GB Storage
- Audio output (Bluetooth/Aux)

### Recommended
- Raspberry Pi 4 (4GB) atau PC
- 16GB+ Storage
- UPS untuk backup power
- Bluetooth speaker atau sistem audio

---

## 🎵 Koneksi Audio

### Bluetooth Speaker (Recommended)
1. Pair Bluetooth speaker dengan OS
2. Set sebagai audio default
3. Aplikasi otomatis menggunakan

### Kabel Aux (Lebih Stabil)
1. Hubungkan kabel ke sistem audio
2. Set sebagai audio default
3. Test di menu Pengumuman

---

## 🆘 Troubleshooting

### Audio tidak keluar?
```bash
# Test audio system
python3 -c "import pygame; pygame.mixer.init(); print('Audio OK')"
```

### Port 5000 sudah digunakan?
Edit `app.py`, ubah port:
```python
app.run(debug=True, host='0.0.0.0', port=5001)
```

### Permission error?
```bash
pip install -r requirements.txt --user
```

---

## 📞 Quick Reference

### URLs
- Dashboard: http://localhost:5000
- Jadwal: http://localhost:5000/schedules
- Audio: http://localhost:5000/audio
- Pengumuman: http://localhost:5000/announcements
- Logs: http://localhost:5000/logs

### Commands
```bash
# Start application
python app.py

# Initialize database
python database.py

# Add sample data
python setup_sample_data.py

# Linux/Mac quick start
./start.sh

# Windows quick start
start.bat
```

---

## 🎓 Tutorial Singkat

### 1. Upload Audio
1. Klik menu **Audio**
2. Klik **Upload Audio**
3. Isi nama & pilih file MP3
4. Klik **Upload**

### 2. Buat Jadwal
1. Klik menu **Jadwal**
2. Klik **Tambah Jadwal**
3. Isi: Nama, Hari, Waktu, Audio
4. Klik **Simpan**

### 3. Test Pengumuman
1. Klik menu **Pengumuman**
2. Pilih audio
3. Klik **Putar Sekarang**
4. Audio akan langsung berbunyi

### 4. Mode Libur
1. Di **Dashboard**
2. Toggle **Mode Libur** ON
3. Semua bel otomatis tidak akan berbunyi

---

## 🎨 Screenshots

Buka file **VISUAL_GUIDE.md** untuk melihat:
- Layout setiap halaman
- Flow diagram penggunaan
- Troubleshooting visual
- Quick reference

---

## ✅ Deployment Checklist

Ikuti langkah-langkah di **DEPLOYMENT_CHECKLIST.md** untuk:
- ✅ Pre-deployment preparation
- ✅ Installation steps
- ✅ Initial configuration
- ✅ Audio setup
- ✅ Testing
- ✅ Auto-start setup
- ✅ Backup strategy
- ✅ Go-live procedures

---

## 🚀 Production Setup

### Linux (systemd)
```bash
# Create service
sudo nano /etc/systemd/system/school-bell.service

[Unit]
Description=School Bell System
After=network.target

[Service]
Type=simple
User=YOUR_USERNAME
WorkingDirectory=/path/to/school-bell-system
ExecStart=/usr/bin/python3 /path/to/school-bell-system/app.py
Restart=always

[Install]
WantedBy=multi-user.target

# Enable & start
sudo systemctl enable school-bell
sudo systemctl start school-bell
```

### Windows (Startup)
1. Buat shortcut dari `start.bat`
2. Win+R → ketik `shell:startup`
3. Copy shortcut ke folder tersebut
4. Reboot untuk test

---

## 💾 Backup

```bash
# Backup database
cp database/school_bell.db backup/school_bell_$(date +%Y%m%d).db

# Backup audio files
cp -r static/audio backup/audio_$(date +%Y%m%d)
```

---

## 📈 Future Enhancements

Potential improvements:
- [ ] User authentication
- [ ] Multiple audio zones
- [ ] Mobile app
- [ ] Cloud backup
- [ ] Email notifications
- [ ] Advanced analytics
- [ ] Text-to-speech
- [ ] REST API documentation

---

## 🎉 Siap Digunakan!

Sistem ini sudah **production-ready** dan siap digunakan!

### Next Steps:
1. ✅ Baca dokumentasi (README.md atau QUICKSTART.md)
2. ✅ Install dan test di local
3. ✅ Upload audio files Anda
4. ✅ Buat jadwal bel
5. ✅ Deploy ke hardware final
6. ✅ Training untuk user

---

## 📞 Support

Jika ada masalah:
1. Cek dokumentasi lengkap di **README.md**
2. Ikuti troubleshooting di **VISUAL_GUIDE.md**
3. Review **DEPLOYMENT_CHECKLIST.md**
4. Cek logs aplikasi

---

## 📄 License

MIT License - Free to use and modify

---

**Dibuat dengan ❤️ untuk pendidikan yang lebih baik**

*Version: 1.0 | Created: November 2024*

---

## 📦 Total Package

- ✅ **4 Python files** (backend)
- ✅ **6 HTML templates** (frontend)
- ✅ **6 JavaScript files** (client-side)
- ✅ **1 CSS file** (styling)
- ✅ **6 Documentation files** (MD)
- ✅ **2 Startup scripts** (sh/bat)
- ✅ **1 Sample data script**

**Total: 26+ files, ~3500+ lines of code**

---

🎯 **Everything you need is here. Ready to deploy!** 🚀
