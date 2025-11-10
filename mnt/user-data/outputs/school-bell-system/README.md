# School Bell Management System

Sistem manajemen bel sekolah berbasis web yang memungkinkan penjadwalan otomatis pemutaran audio untuk bel sekolah dengan fitur pengumuman manual.

## Fitur Utama

### 1. Dashboard
- Status sistem real-time
- Jadwal berikutnya
- Mode libur (holiday mode)
- Kontrol volume
- Log pemutaran terakhir

### 2. Manajemen Jadwal
- Tambah, edit, hapus jadwal bel
- Jadwal berdasarkan hari dan waktu
- Toggle aktif/non-aktif jadwal
- Support multiple audio untuk waktu yang berbeda

### 3. Manajemen Audio
- Upload file audio (MP3, WAV, OGG)
- Preview audio sebelum digunakan
- Manajemen file audio terpusat
- Informasi durasi audio

### 4. Pengumuman Manual
- Putar audio kapan saja di luar jadwal
- Kontrol volume real-time
- Status pemutaran
- Stop audio yang sedang berjalan

### 5. Log Pemutaran
- History semua pemutaran audio
- Status sukses/gagal/manual/cancelled
- Statistik pemutaran
- Auto-refresh

## Teknologi

- **Backend**: Python 3, Flask
- **Scheduler**: APScheduler
- **Audio Player**: Pygame
- **Database**: SQLite
- **Frontend**: HTML5, Bootstrap 5, JavaScript
- **Icons**: Bootstrap Icons

## Instalasi

### 1. Install Dependencies

```bash
# Install Python packages
pip install -r requirements.txt --break-system-packages
```

### 2. Inisialisasi Database

```bash
python database.py
```

### 3. Jalankan Aplikasi

```bash
python app.py
```

Aplikasi akan berjalan di `http://localhost:5000`

## Struktur Folder

```
school-bell-system/
├── app.py                  # Main Flask application
├── database.py             # Database setup and functions
├── audio_player.py         # Audio playback handler
├── scheduler.py            # Scheduling system
├── requirements.txt        # Python dependencies
├── database/              # SQLite database location
│   └── school_bell.db
├── static/
│   ├── audio/            # Uploaded audio files
│   ├── css/
│   │   └── style.css
│   └── js/
│       ├── main.js
│       ├── dashboard.js
│       ├── schedules.js
│       ├── audio.js
│       ├── announcements.js
│       └── logs.js
└── templates/            # HTML templates
    ├── base.html
    ├── index.html
    ├── schedules.html
    ├── audio.html
    ├── announcements.html
    └── logs.html
```

## Cara Penggunaan

### Menambah Jadwal Bel

1. Buka halaman **Jadwal**
2. Klik tombol **Tambah Jadwal**
3. Isi form:
   - Nama jadwal (contoh: "Bel Masuk")
   - Pilih hari
   - Tentukan waktu (format 24 jam)
   - Pilih file audio
4. Klik **Simpan**

### Upload File Audio

1. Buka halaman **Audio**
2. Klik tombol **Upload Audio**
3. Masukkan nama display
4. Pilih file audio (MP3/WAV/OGG, max 50MB)
5. Klik **Upload**

### Pengumuman Manual

1. Buka halaman **Pengumuman**
2. Pilih audio dari dropdown
3. Atur volume jika perlu
4. Klik **Putar Sekarang**

### Mode Libur

1. Di Dashboard, toggle **Mode Libur**
2. Saat aktif, semua bel terjadwal tidak akan berbunyi
3. Pengumuman manual tetap bisa digunakan

## Konfigurasi Hardware

### Koneksi Audio

#### Opsi 1: Bluetooth Speaker (Recommended)
```bash
# Pair Bluetooth speaker melalui sistem operasi
# Aplikasi akan otomatis menggunakan audio output default
```

#### Opsi 2: Kabel Aux/Speaker Jack
- Hubungkan kabel audio dari komputer ke sistem audio sekolah
- Lebih stabil dan tidak ada delay

### Server Requirements

**Minimum:**
- Raspberry Pi 3/4 atau PC bekas
- 1GB RAM
- 8GB Storage
- Python 3.7+
- Audio output (Bluetooth/Jack)

**Recommended:**
- Raspberry Pi 4 (4GB RAM)
- 16GB+ Storage
- Koneksi internet (untuk remote access)
- UPS untuk backup power

## Auto-Start Setup

### Linux (systemd)

Buat file `/etc/systemd/system/school-bell.service`:

```ini
[Unit]
Description=School Bell Management System
After=network.target

[Service]
Type=simple
User=YOUR_USERNAME
WorkingDirectory=/path/to/school-bell-system
ExecStart=/usr/bin/python3 /path/to/school-bell-system/app.py
Restart=always
RestartSec=10

[Install]
WantedBy=multi-user.target
```

Enable dan start:
```bash
sudo systemctl enable school-bell.service
sudo systemctl start school-bell.service
```

### Windows (Task Scheduler)

1. Buat file `start-bell.bat`:
```batch
@echo off
cd C:\path\to\school-bell-system
python app.py
```

2. Buat scheduled task:
   - Trigger: At startup
   - Action: Start program `start-bell.bat`
   - Run with highest privileges

## Troubleshooting

### Audio tidak keluar

1. Cek koneksi speaker
2. Cek volume sistem
3. Cek audio output default
4. Test dengan pengumuman manual

### Jadwal tidak berjalan

1. Cek status jadwal (aktif/non-aktif)
2. Cek mode libur
3. Cek log untuk error
4. Restart aplikasi

### Database error

```bash
# Reset database
rm database/school_bell.db
python database.py
```

## API Endpoints

### Schedules
- `GET /api/schedules` - Get all schedules
- `POST /api/schedules` - Add new schedule
- `PUT /api/schedules/<id>` - Update schedule
- `DELETE /api/schedules/<id>` - Delete schedule
- `POST /api/schedules/<id>/toggle` - Toggle schedule status

### Audio
- `GET /api/audio` - Get all audio files
- `POST /api/audio/upload` - Upload audio file
- `DELETE /api/audio/<id>` - Delete audio file

### Playback
- `POST /api/play` - Play audio manually
- `POST /api/stop` - Stop audio

### System
- `GET /api/status` - Get system status
- `GET /api/settings` - Get settings
- `POST /api/settings` - Update settings
- `GET /api/logs` - Get play logs

## Backup & Restore

### Backup
```bash
# Backup database
cp database/school_bell.db backup/school_bell_$(date +%Y%m%d).db

# Backup audio files
cp -r static/audio backup/audio_$(date +%Y%m%d)
```

### Restore
```bash
# Restore database
cp backup/school_bell_YYYYMMDD.db database/school_bell.db

# Restore audio
cp -r backup/audio_YYYYMMDD/* static/audio/
```

## Kontribusi

Untuk kontribusi atau bug report, silakan buat issue atau pull request.

## License

MIT License - Free to use and modify

## Support

Untuk pertanyaan atau bantuan, silakan hubungi administrator sistem.

---

**Dibuat dengan ❤️ untuk pendidikan yang lebih baik**
