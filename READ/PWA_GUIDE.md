# 📱 PWA Guide - School Bell Management System

## 🎯 Overview

Sistem School Bell sekarang mendukung **Progressive Web App (PWA)** yang memungkinkan:
- ✅ **Offline functionality** - Berjalan tanpa internet
- ✅ **Client-side audio playback** - Audio diputar di device client
- ✅ **Mobile-friendly interface** - UI optimal untuk mobile
- ✅ **Installable app** - Bisa diinstall ke homescreen
- ✅ **Push notifications** - Notifikasi untuk jadwal
- ✅ **Background sync** - Sinkronisasi otomatis

## 🚀 Quick Start PWA

### 1. Akses PWA Interface
```
http://your-server:5000/pwa
```

### 2. Install App
1. Buka URL PWA di browser Chrome/Safari
2. Klik icon "Install" (biasanya di address bar)
3. Konfirmasi instalasi
4. App akan muncul di homescreen

### 3. Grant Permissions
- **Notifications** - Untuk notifikasi jadwal
- **Audio** - Untuk playback audio
- **Storage** - Untuk offline data

## 📱 PWA Features

### Dashboard PWA
- **Status real-time** - Online/offline indicator
- **Jadwal hari ini** - List jadwal aktif
- **Next schedule** - Jadwal berikutnya
- **Volume control** - Slider volume 0-100%
- **Holiday mode** - Toggle mode libur
- **Quick actions** - Akses cepat ke fitur

### Client-side Scheduling
- **Auto-check** - Cek jadwal setiap menit
- **Local storage** - Data tersimpan offline
- **Background sync** - Sync saat online kembali
- **IndexedDB** - Database lokal untuk schedules

### Audio Playback
- **Web Audio API** - High-quality audio playback
- **HTML5 fallback** - Kompatibilitas maksimal
- **Audio caching** - Preload audio files
- **Volume control** - Real-time volume adjustment
- **Multiple formats** - MP3, WAV, OGG support

## 🔄 Sync Mechanism

### Online Mode
1. **Auto-sync** - Sync schedules dari server
2. **Real-time updates** - Perubahan langsung terlihat
3. **Server logs** - Log tersimpan di server
4. **Cloud backup** - Data aman di server

### Offline Mode
1. **Local data** - Gunakan cached schedules
2. **Local logs** - Log tersimpan di device
3. **Queue sync** - Pending sync saat online
4. **Full functionality** - Semua fitur tetap bekerja

### Sync Process
```
Device Online → Check Server Changes → Download Updates → Update Local Storage
Device Offline → Use Local Data → Queue Changes → Sync When Online
```

## 🎵 Audio Management

### Upload Audio
1. Buka menu "Audio" di PWA
2. Klik "Upload Audio"
3. Pilih file (MP3/WAV/OGG, max 50MB)
4. Isi nama display
5. Klik "Upload"

### Audio Caching
- **Automatic cache** - Audio di-cache untuk offline
- **Smart preload** - Preload jadwal hari ini
- **Cache management** - Auto cleanup cache lama
- **Storage info** - Monitor penggunaan storage

### Playback Options
- **Scheduled playback** - Otomatis sesuai jadwal
- **Manual playback** - Play kapan saja
- **Preview** - Preview audio sebelum digunakan
- **Volume control** - Adjust volume per playback

## 🔔 Notifications

### Schedule Notifications
- **1-minute warning** - Notifikasi 1 menit sebelum jadwal
- **Play notification** - Notifikasi saat bel berbunyi
- **Missed schedule** - Notifikasi jika terlewat
- **Custom sound** - Bisa custom notification sound

### Push Notifications
- **Browser permission** - Request permission otomatis
- **Background delivery** - Notifikasi saat app closed
- **Action buttons** - Play/Stop dari notification
- **Quiet hours** - Tidak notifikasi di jam tertentu

## 📊 Data Management

### Local Storage
- **Schedules** - Disimpan di IndexedDB
- **Settings** - Volume, holiday mode, dll
- **Logs** - History playback lokal
- **Audio cache** - Cached audio files

### Sync Data
- **Schedules** - 2-way sync server↔device
- **Logs** - Upload logs saat online
- **Settings** - Sync preferences
- **Audio files** - Sync metadata & cache

### Backup & Restore
- **Export data** - Download semua data lokal
- **Import data** - Restore dari backup
- **Cloud sync** - Auto sync ke server
- **Local backup** - Backup ke device storage

## 🛠️ Technical Implementation

### Service Worker
```javascript
// Cache strategy
- Static files: Cache First
- API calls: Network First, Cache Fallback
- Audio files: Cache First
- Navigation: Stale While Revalidate
```

### Client-side Scheduler
```javascript
// Scheduling logic
- Check every minute
- Compare current time with schedules
- Trigger audio playback
- Log to local storage
- Queue for server sync
```

### Audio Player
```javascript
// Audio playback
- Web Audio API (primary)
- HTML5 Audio (fallback)
- Multiple backend support
- Volume control
- Playback monitoring
```

## 📱 Browser Compatibility

### Supported Browsers
- ✅ **Chrome 80+** - Full PWA support
- ✅ **Firefox 75+** - Good PWA support
- ✅ **Safari 13+** - iOS PWA support
- ✅ **Edge 80+** - Chromium-based support

### Feature Support
| Feature | Chrome | Firefox | Safari | Edge |
|---------|--------|---------|--------|------|
| Service Worker | ✅ | ✅ | ✅ | ✅ |
| Web Audio API | ✅ | ✅ | ✅ | ✅ |
| IndexedDB | ✅ | ✅ | ✅ | ✅ |
| Push Notifications | ✅ | ✅ | ⚠️ | ✅ |
| Background Sync | ✅ | ⚠️ | ❌ | ✅ |

## 🔧 Configuration

### PWA Settings
```javascript
// Service worker settings
CACHE_VERSION = 'v1.0.0'
CACHE_SIZE_LIMIT = '100MB'
SYNC_INTERVAL = '5 minutes'
NOTIFICATION_TIMEOUT = '5 seconds'
```

### Audio Settings
```javascript
// Audio player settings
DEFAULT_VOLUME = 0.8
FADE_DURATION = 1.0
PRELOAD_COUNT = 5
CACHE_STRATEGY = 'cache-first'
```

### Scheduler Settings
```javascript
// Scheduler settings
CHECK_INTERVAL = 60000 // 1 minute
WARNING_TIME = 60000 // 1 minute before
MAX_LOG_ENTRIES = 100
SYNC_RETRY_COUNT = 3
```

## 🐛 Troubleshooting

### Common Issues

#### Audio tidak berbunyi
```bash
# Check browser permissions
1. Buka browser settings
2. Cek permissions untuk site
3. Pastikan audio diizinkan

# Check audio context
console.log(navigator.audioContext || navigator.webkitAudioContext)

# Test audio playback
const audio = new Audio('/static/audio/test.mp3');
audio.play();
```

#### PWA tidak bisa diinstall
```bash
# Check requirements
1. HTTPS required (kecuali localhost)
2. Service worker registered
3. Manifest valid
4. Icons available

# Debug install prompt
window.addEventListener('beforeinstallprompt', (e) => {
    console.log('Install prompt ready');
    e.prompt();
});
```

#### Sync tidak berjalan
```bash
# Check service worker
navigator.serviceWorker.getRegistration()
    .then(reg => console.log('SW active:', reg.active))

# Check IndexedDB
indexedDB.open('SchoolBellDB')
    .then(db => console.log('DB ready:', db))

# Check network status
console.log('Online:', navigator.onLine);
```

#### Cache issues
```bash
# Clear cache
if ('caches' in window) {
    caches.keys().then(names => {
        names.forEach(name => caches.delete(name));
    });
}

# Clear IndexedDB
indexedDB.deleteDatabase('SchoolBellDB');
```

## 📈 Performance Optimization

### Caching Strategy
- **Static assets** - Cache first, 1 year expiry
- **API responses** - Network first, 5 minute cache
- **Audio files** - Cache first, 30 day expiry
- **Service worker** - No cache, always fresh

### Bundle Size Optimization
- **Minified JS** - Reduce file size
- **Compressed audio** - Use optimized formats
- **Lazy loading** - Load components on demand
- **Tree shaking** - Remove unused code

### Memory Management
- **Audio buffer cleanup** - Free unused buffers
- **Log rotation** - Limit log entries
- **Cache cleanup** - Remove old cache
- **Event listener cleanup** - Prevent memory leaks

## 🔒 Security Considerations

### PWA Security
- **HTTPS required** - Mandatory for production
- **CSP headers** - Content Security Policy
- **Service worker scope** - Limited to app domain
- **Local storage encryption** - Sensitive data protection

### Data Protection
- **Local encryption** - Encrypt sensitive data
- **Secure sync** - HTTPS for all communications
- **Permission model** - Minimal required permissions
- **Data retention** - Auto-cleanup old data

## 🚀 Deployment

### Production Setup
```bash
# 1. Build for production
npm run build-pwa

# 2. Configure HTTPS
# Use SSL certificate
# Update manifest.json URLs
# Configure CSP headers

# 3. Deploy to server
# Copy files to web root
# Configure server for PWA
# Test installation
```

### Server Configuration
```nginx
# Nginx configuration
location /static/ {
    expires 1y;
    add_header Cache-Control "public, immutable";
}

location /static/js/service-worker.js {
    add_header Service-Worker-Allowed "/";
    expires off;
}
```

## 📱 Testing

### Manual Testing
1. **Install PWA** - Test installation flow
2. **Offline mode** - Disconnect network, test functionality
3. **Audio playback** - Test various audio formats
4. **Notifications** - Test notification delivery
5. **Sync** - Test online/offline sync

### Automated Testing
```javascript
// Service worker test
self.addEventListener('message', (event) => {
    if (event.data.type === 'TEST') {
        // Run tests
        testCache();
        testAudio();
        testNotifications();
    }
});
```

## 📚 API Reference

### PWA-specific Endpoints
```
GET  /pwa                    # PWA interface
GET  /share                  # Share handler
POST /api/sync               # Sync data
GET  /api/audio-files         # Audio file list
POST /api/push-subscription  # Save push subscription
```

### Client-side APIs
```javascript
// PWA Scheduler
window.pwaScheduler.addSchedule(schedule)
window.pwaScheduler.updateSchedule(id, data)
window.pwaScheduler.deleteSchedule(id)
window.pwaScheduler.getNextSchedule()

// PWA Audio Player
window.pwaAudioPlayer.play(filename)
window.pwaAudioPlayer.stop()
window.pwaAudioPlayer.setVolume(level)
window.pwaAudioPlayer.getCacheInfo()

// PWA UI
window.pwaUI.showNotification(message, type)
window.pwaUI.exportData()
window.pwaUI.importData(file)
```

## 🎯 Best Practices

### User Experience
- **Progressive enhancement** - Core features work everywhere
- **Offline-first** - Design for offline first
- **Fast loading** - Optimize for slow networks
- **Intuitive UI** - Simple, clear interface

### Development
- **Modular code** - Separate concerns
- **Error handling** - Graceful degradation
- **Performance monitoring** - Track usage metrics
- **Accessibility** - WCAG 2.1 compliance

### Maintenance
- **Regular updates** - Keep PWA current
- **Cache management** - Prevent storage bloat
- **Log monitoring** - Track issues
- **User feedback** - Collect and act on feedback

---

## 📞 Support

### Documentation
- **Main README** - System overview
- **QUICKSTART.md** - Quick start guide
- **ARCHITECTURE.md** - Technical details
- **PWA_GUIDE.md** - This guide

### Troubleshooting
- **Check console** - Browser dev tools
- **Network tab** - Check failed requests
- **Application tab** - Inspect storage
- **Service Worker** - Debug SW issues

---

**PWA Version**: 1.0.0  
**Last Updated**: November 2024  
**Compatible**: School Bell System v1.0+