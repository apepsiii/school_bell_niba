# 🔔 School Bell Management System - Quick Start Guide

## 📋 Langkah-langkah Instalasi dan Penggunaan

### 1️⃣ Persiapan

#### Kebutuhan Sistem:
- **Python 3.7+** sudah terinstall
- **pip** (Python package manager)
- **Audio output** (Bluetooth speaker atau kabel audio)
- Koneksi internet (untuk download dependencies)

#### Cek Python:
```bash
python3 --version
# atau
python --version
```

### 2️⃣ Instalasi

#### **Untuk Linux/Mac:**
```bash
# 1. Masuk ke folder project
cd school-bell-system

# 2. Jalankan script startup
chmod +x start.sh
./start.sh
```

#### **Untuk Windows:**
```cmd
# 1. Masuk ke folder project
cd school-bell-system

# 2. Double-click file start.bat
# atau jalankan di command prompt:
start.bat
```

#### **Manual Installation:**
```bash
# 1. Install dependencies
pip install -r requirements.txt --break-system-packages

# 2. Initialize database
python database.py

# 3. (Optional) Add sample data
python setup_sample_data.py

# 4. Run application
python app.py
```

### 3️⃣ Akses Aplikasi

Setelah aplikasi berjalan, buka browser dan akses:
```
http://localhost:5000
```

Atau dari komputer lain di jaringan yang sama:
```
http://[IP-ADDRESS]:5000
```

### 4️⃣ Langkah Awal Penggunaan

#### A. Upload File Audio
1. Klik menu **Audio**
2. Klik tombol **Upload Audio**
3. Isi nama display (contoh: "Bel Masuk")
4. Pilih file MP3
5. Klik **Upload**

#### B. Buat Jadwal
1. Klik menu **Jadwal**
2. Klik tombol **Tambah Jadwal**
3. Isi form:
   - **Nama**: Bel Masuk
   - **Hari**: Senin
   - **Waktu**: 07:00
   - **Audio**: Pilih audio yang sudah diupload
4. Klik **Simpan**
5. Ulangi untuk jadwal lainnya

#### C. Test Pengumuman
1. Klik menu **Pengumuman**
2. Pilih audio dari dropdown
3. Klik **Putar Sekarang**
4. Audio akan langsung diputar

### 5️⃣ Koneksi Audio

#### **Bluetooth Speaker:**
1. Pair Bluetooth speaker dengan komputer/Raspberry Pi
2. Set sebagai audio output default
3. Test di menu Pengumuman

#### **Kabel Audio:**
1. Hubungkan kabel aux dari komputer ke sistem audio
2. Pastikan volume sudah diatur dengan baik
3. Test di menu Pengumuman

### 6️⃣ Tips & Trik

#### Format Audio yang Didukung:
- ✅ MP3 (recommended)
- ✅ WAV
- ✅ OGG

#### Best Practices:
1. **File Audio**: Gunakan file dengan kualitas baik tapi tidak terlalu besar (1-5MB)
2. **Durasi**: Ideal 3-10 detik untuk bel
3. **Volume**: Set volume global di Dashboard, bukan di speaker
4. **Backup**: Backup database dan audio secara berkala
5. **Mode Libur**: Aktifkan saat hari libur untuk disable semua bel

#### Jadwal Umum Sekolah:
```
07:00 - Bel Masuk
10:00 - Bel Istirahat 1 (15 menit)
10:15 - Bel Masuk Kelas
12:00 - Bel Istirahat 2 (30 menit)
12:30 - Bel Masuk Kelas
15:00 - Bel Pulang
```

### 7️⃣ Auto-Start (Production)

#### **Linux (systemd):**
```bash
# 1. Copy file service
sudo nano /etc/systemd/system/school-bell.service

# 2. Paste konfigurasi (edit path sesuai lokasi):
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

# 3. Enable dan start
sudo systemctl enable school-bell
sudo systemctl start school-bell
```

#### **Windows (Startup):**
1. Buat shortcut dari `start.bat`
2. Copy shortcut ke folder Startup:
   - Tekan `Win + R`
   - Ketik `shell:startup`
   - Paste shortcut di folder tersebut

### 8️⃣ Troubleshooting

#### Audio tidak keluar:
```bash
# Cek audio device
python3 -c "import pygame; pygame.mixer.init(); print('Audio OK')"

# Cek volume sistem
# Linux: alsamixer
# Mac: System Preferences > Sound
# Windows: Volume Mixer
```

#### Port 5000 sudah digunakan:
Edit `app.py`, ubah port:
```python
app.run(debug=True, host='0.0.0.0', port=5001)
```

#### Permission error saat install:
```bash
pip install -r requirements.txt --user
# atau
pip install -r requirements.txt --break-system-packages
```

### 9️⃣ Maintenance

#### Backup Database:
```bash
cp database/school_bell.db backup/school_bell_$(date +%Y%m%d).db
```

#### Backup Audio:
```bash
cp -r static/audio backup/audio_$(date +%Y%m%d)
```

#### Clear Logs (jika terlalu besar):
```bash
# Via web: Tidak ada auto-clear
# Manual: Hapus entries lama dari tabel play_logs
```

### 🎯 Fitur Lengkap

✅ **Dashboard**: Monitoring real-time, status sistem, jadwal berikutnya  
✅ **Manajemen Jadwal**: CRUD jadwal, toggle aktif/nonaktif  
✅ **Manajemen Audio**: Upload, preview, delete audio files  
✅ **Pengumuman**: Play audio manual kapan saja  
✅ **Log**: History lengkap semua pemutaran  
✅ **Settings**: Volume control, holiday mode  
✅ **Responsive**: Bisa diakses dari HP/tablet  

### 📱 Akses Remote

Untuk akses dari HP atau komputer lain:
1. Cari IP address komputer server:
   ```bash
   # Linux/Mac
   ifconfig
   
   # Windows
   ipconfig
   ```
2. Akses dari browser: `http://[IP]:5000`

### 🔒 Security Note

Untuk production:
- Tambahkan authentication
- Gunakan HTTPS
- Batasi akses ke IP tertentu
- Gunakan firewall

### 📞 Support

Jika ada masalah:
1. Cek log aplikasi di terminal
2. Cek file README.md untuk dokumentasi lengkap
3. Cek jadwal aktif/nonaktif
4. Cek mode libur
5. Test audio di menu Pengumuman

### 🎉 Selamat!

Sistem bel sekolah Anda sudah siap digunakan! 

**Tips Terakhir:**
- Test semua jadwal sebelum digunakan untuk hari pertama
- Siapkan beberapa file audio backup
- Monitor log secara berkala
- Gunakan UPS untuk mencegah mati listrik mendadak

---

**Dibuat dengan ❤️ untuk memudahkan manajemen bel sekolah**
