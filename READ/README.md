# 🔔 School Bell Management System

Sistem manajemen bel sekolah berbasis web yang memungkinkan penjadwalan otomatis pemutaran audio untuk bel sekolah dengan fitur pengumuman manual.

## ✨ Fitur Utama

- ⏰ **Scheduling Otomatis** - Bel berbunyi otomatis sesuai jadwal
- 🎵 **Audio Management** - Upload dan kelola file MP3/WAV/OGG
- 📢 **Pengumuman Manual** - Putar audio kapan saja di luar jadwal
- 📊 **Dashboard Monitoring** - Status real-time dan jadwal berikutnya
- 📝 **Log History** - Track semua pemutaran audio
- ⚙️ **Settings** - Volume control dan holiday mode
- 📱 **Responsive** - Bisa diakses dari desktop, tablet, dan mobile

## 🛠️ Teknologi

- **Backend**: Python 3, Flask, APScheduler, Pygame
- **Frontend**: HTML5, Bootstrap 5, JavaScript
- **Database**: SQLite
- **Audio**: MP3, WAV, OGG support

## 📋 Requirements

- Python 3.7 atau lebih tinggi
- pip (Python package manager)
- Audio output device (Bluetooth speaker atau kabel aux)

## 🚀 Quick Start

### 1. Install Dependencies

```bash
pip install -r requirements.txt --break-system-packages
```

### 2. Initialize Database

```bash
python database.py
```

### 3. Run Application

```bash
python app.py
```

### 4. Akses Web Interface

Buka browser dan akses: **http://localhost:5000**

## 📖 Cara Penggunaan

### Upload Audio File

1. Buka menu **Audio**
2. Klik tombol **Upload Audio**
3. Isi nama display dan pilih file MP3
4. Klik **Upload**

### Buat Jadwal Bel

1. Buka menu **Jadwal**
2. Klik tombol **Tambah Jadwal**
3. Isi form:
   - Nama: "Bel Masuk"
   - Hari: "Senin"
   - Waktu: "07:00"
   - Audio: Pilih file yang sudah diupload
4. Klik **Simpan**

### Pengumuman Manual

1. Buka menu **Pengumuman**
2. Pilih audio dari dropdown
3. Klik **Putar Sekarang**

### Mode Libur

1. Di **Dashboard**, toggle **Mode Libur** ke ON
2. Semua bel otomatis tidak akan berbunyi
3. Pengumuman manual tetap bisa digunakan

## 🔊 Koneksi Audio

### Bluetooth Speaker

1. Pair Bluetooth speaker dengan sistem operasi
2. Set sebagai audio output default
3. Aplikasi otomatis menggunakannya

### Kabel Aux (Recommended)

1. Hubungkan kabel aux ke sistem audio sekolah
2. Set sebagai audio output default
3. Lebih stabil dan tanpa delay

## 📁 Struktur Folder

```
bell-system/
├── app.py                    # Main Flask application
├── database.py               # Database functions
├── scheduler.py              # Scheduling system
├── audio_player.py           # Audio playback
├── requirements.txt          # Python dependencies
├── start.sh                  # Linux/Mac startup
├── start.bat                 # Windows startup
│
├── database/                 # SQLite database
│   └── school_bell.db        (auto-generated)
│
├── static/
│   ├── audio/               # Uploaded audio files
│   ├── css/
│   │   └── style.css        # Custom CSS
│   └── js/
│       ├── main.js          # Main JavaScript
│       ├── dashboard.js     # Dashboard logic
│       ├── schedules.js     # Schedule management
│       ├── audio.js         # Audio management
│       ├── announcements.js # Announcements
│       └── logs.js          # Logs display
│
└── templates/               # HTML templates
    ├── base.html            # Base template
    ├── index.html           # Dashboard
    ├── schedules.html       # Schedules page
    ├── audio.html           # Audio page
    ├── announcements.html   # Announcements page
    └── logs.html            # Logs page
```

## 🆘 Troubleshooting

### Audio tidak keluar

1. Cek koneksi speaker
2. Cek volume sistem
3. Test dengan pengumuman manual
4. Cek audio output default

### Jadwal tidak berjalan

1. Cek jadwal aktif (toggle ON)
2. Cek mode libur OFF
3. Cek log untuk error
4. Restart aplikasi

### Port sudah digunakan

Edit `app.py`, ubah port:
```python
app.run(debug=True, host='0.0.0.0', port=5001)
```

## 📞 API Endpoints

- `GET /api/schedules` - Get all schedules
- `POST /api/schedules` - Add schedule
- `PUT /api/schedules/<id>` - Update schedule
- `DELETE /api/schedules/<id>` - Delete schedule
- `POST /api/audio/upload` - Upload audio
- `POST /api/play` - Play audio manually
- `POST /api/stop` - Stop audio
- `GET /api/status` - Get system status
- `GET /api/logs` - Get play logs

## 💾 Backup

```bash
# Backup database
cp database/school_bell.db backup/school_bell_$(date +%Y%m%d).db

# Backup audio files
cp -r static/audio backup/audio_$(date +%Y%m%d)
```

## 📄 License

MIT License - Free to use and modify

## 🎓 Support

Untuk bantuan lebih lanjut, silakan buka issue atau hubungi administrator sistem.

---

**Dibuat dengan ❤️ untuk pendidikan yang lebih baik**
