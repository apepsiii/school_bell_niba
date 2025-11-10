# 🚀 Quick Start Guide

## Langkah Cepat Mulai Menggunakan

### ⚡ Super Quick (3 Langkah)

```bash
# 1. Install dependencies
pip install -r requirements.txt --break-system-packages

# 2. Initialize database
python database.py

# 3. Run application
python app.py
```

**Buka browser:** http://localhost:5000

---

## 📦 Apa yang Sudah Dibuat?

✅ **23 Files Lengkap** (~128 KB):

### Backend (Python)
- `app.py` - Main Flask application (server web)
- `database.py` - Database management (SQLite)
- `scheduler.py` - Auto scheduling system
- `audio_player.py` - Audio playback (Pygame)
- `requirements.txt` - Dependencies list

### Frontend (HTML + JS + CSS)
- **6 HTML templates** (Dashboard, Jadwal, Audio, Pengumuman, Log)
- **6 JavaScript files** (Interactivity)
- **1 CSS file** (Styling)

### Utilities
- `start.sh` - Linux/Mac quick starter
- `start.bat` - Windows quick starter
- `.gitignore` - Git ignore rules
- `README.md` - Full documentation

---

## 📖 Tutorial Pertama Kali

### 1️⃣ Jalankan Aplikasi

**Linux/Mac:**
```bash
chmod +x start.sh
./start.sh
```

**Windows:**
```cmd
start.bat
```

**Manual:**
```bash
python database.py    # Init database
python app.py         # Run server
```

### 2️⃣ Upload Audio File

1. Buka http://localhost:5000
2. Klik menu **Audio** di navbar
3. Klik tombol **Upload Audio**
4. Isi:
   - Nama Display: "Bel Masuk Pagi"
   - File: Pilih file MP3 Anda
5. Klik **Upload**
6. ✅ File siap digunakan!

### 3️⃣ Buat Jadwal Pertama

1. Klik menu **Jadwal**
2. Klik tombol **Tambah Jadwal**
3. Isi form:
   - Nama: "Bel Masuk"
   - Hari: "Senin"
   - Waktu: "07:00"
   - Audio: Pilih file yang tadi diupload
4. Klik **Simpan**
5. ✅ Bel akan otomatis berbunyi Senin jam 07:00!

### 4️⃣ Test Pengumuman Manual

1. Klik menu **Pengumuman**
2. Pilih audio dari dropdown
3. Klik **Putar Sekarang**
4. ✅ Audio langsung berbunyi!

### 5️⃣ Lihat Log

1. Klik menu **Log**
2. Lihat history semua pemutaran
3. Ada statistik sukses/gagal/manual

---

## 🔊 Setup Audio

### Bluetooth Speaker

```bash
# 1. Pair Bluetooth speaker di OS
# 2. Set sebagai default audio
# 3. App otomatis pakai speaker tersebut
```

### Kabel Aux (Recommended)

```bash
# 1. Colok kabel aux ke speaker system
# 2. Set sebagai default audio
# 3. Lebih stabil, no delay
```

---

## 🎯 Fitur-Fitur

### Dashboard
- ✅ Status sistem real-time
- ✅ Jadwal berikutnya
- ✅ Toggle holiday mode
- ✅ Volume control
- ✅ Log terakhir

### Jadwal
- ✅ Tambah/Edit/Hapus jadwal
- ✅ Set hari & waktu
- ✅ Pilih audio file
- ✅ Toggle aktif/nonaktif
- ✅ Auto-reload scheduler

### Audio
- ✅ Upload MP3/WAV/OGG
- ✅ Preview audio
- ✅ Delete audio
- ✅ Auto-detect durasi

### Pengumuman
- ✅ Play audio instant
- ✅ Stop control
- ✅ Volume control
- ✅ Status real-time

### Log
- ✅ Complete history
- ✅ Statistik
- ✅ Auto-refresh

---

## 🐛 Troubleshooting Cepat

### Audio tidak keluar?
```bash
# Test audio system
python3 -c "import pygame; pygame.mixer.init(); print('OK')"

# Cek speaker:
# - Power ON?
# - Volume > 0?
# - Default audio device?
```

### Port 5000 sudah digunakan?
```python
# Edit app.py, line terakhir:
app.run(debug=True, host='0.0.0.0', port=5001)
```

### Permission error saat install?
```bash
pip install -r requirements.txt --user
# atau
pip install -r requirements.txt --break-system-packages
```

---

## 📂 Struktur File

```
bell-system/
├── 📘 Backend (5 Python files)
│   ├── app.py          ⭐ Main application
│   ├── database.py     💾 Database
│   ├── scheduler.py    ⏰ Scheduler
│   ├── audio_player.py 🔊 Audio player
│   └── requirements.txt
│
├── 🎨 Frontend (13 files)
│   ├── templates/      (6 HTML files)
│   └── static/
│       ├── css/        (1 CSS file)
│       └── js/         (6 JS files)
│
└── 🛠️ Utilities (5 files)
    ├── start.sh
    ├── start.bat
    ├── README.md
    ├── .gitignore
    └── database/
```

---

## 💡 Tips

### Jadwal Umum Sekolah:
```
07:00 - Bel Masuk
10:00 - Bel Istirahat 1
10:15 - Bel Masuk Kelas
12:00 - Bel Istirahat 2
12:30 - Bel Masuk Kelas
15:00 - Bel Pulang
```

### Best Practices:
- ✅ Audio format: MP3 (128kbps)
- ✅ File size: 1-5 MB
- ✅ Duration: 3-10 detik
- ✅ Backup database weekly
- ✅ Test before go-live

### Mode Libur:
- Toggle ON saat hari libur
- Semua bel otomatis OFF
- Pengumuman manual tetap bisa

---

## 🎉 Selesai!

Sistem bell sekolah Anda sudah siap digunakan!

**Next Steps:**
1. ✅ Upload semua audio files Anda
2. ✅ Buat jadwal untuk semua hari
3. ✅ Test semua fitur
4. ✅ Deploy ke production
5. ✅ Enjoy automated bell system!

---

**Need help?** Baca README.md untuk dokumentasi lengkap.

---

*Quick Start v1.0 | November 2024*
