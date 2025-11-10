# 🏗️ Arsitektur School Bell Management System

## 📊 Overview

```
┌─────────────────────────────────────────────────────────┐
│                    USER INTERFACE                       │
│         (Browser - Desktop/Mobile/Tablet)               │
│  Dashboard │ Jadwal │ Audio │ Pengumuman │ Log          │
└────────────────────┬────────────────────────────────────┘
                     │ HTTP/REST API
                     ▼
┌─────────────────────────────────────────────────────────┐
│              FLASK WEB APPLICATION                      │
│  ┌──────────┬──────────┬──────────┬──────────┐         │
│  │Dashboard │Schedules │  Audio   │  Logs    │         │
│  │  Routes  │  Routes  │  Routes  │  Routes  │         │
│  └──────────┴──────────┴──────────┴──────────┘         │
│                                                          │
│  ┌────────────────────────────────────────────┐         │
│  │           API Endpoints Layer               │         │
│  │  /api/schedules  /api/audio  /api/play    │         │
│  └────────────────────────────────────────────┘         │
└────────────┬──────────────┬──────────────┬──────────────┘
             │              │              │
             ▼              ▼              ▼
┌─────────────────┐  ┌─────────────┐  ┌──────────────┐
│   SCHEDULER     │  │  DATABASE   │  │ AUDIO PLAYER │
│                 │  │             │  │              │
│  APScheduler    │  │  SQLite     │  │   Pygame     │
│  - Cron Jobs    │  │  - schedules│  │   Mixer      │
│  - Auto Trigger │  │  - audio    │  │              │
│                 │  │  - logs     │  │              │
└────────┬────────┘  │  - settings │  └──────┬───────┘
         │           └──────┬──────┘         │
         │                  │                │
         └──────────────────┼────────────────┘
                            │
                            ▼
                  ┌──────────────────┐
                  │  FILE SYSTEM     │
                  │                  │
                  │  static/audio/   │
                  │  - MP3 files     │
                  │  - WAV files     │
                  └─────────┬────────┘
                            │
                            ▼
                  ┌──────────────────┐
                  │  AUDIO OUTPUT    │
                  │                  │
                  │  - Bluetooth     │
                  │  - Aux Cable     │
                  │  - Speakers      │
                  └──────────────────┘
```

## 🔧 Komponen Utama

### 1. Frontend Layer
**Technology**: HTML5, CSS3, JavaScript, Bootstrap 5

**Files**:
- `templates/*.html` - Jinja2 templates
- `static/css/style.css` - Custom styling
- `static/js/*.js` - Client-side logic

**Fitur**:
- Responsive design (mobile-friendly)
- Real-time status updates
- AJAX calls untuk async operations
- Form validations
- File upload dengan progress

### 2. Backend Layer
**Technology**: Python 3, Flask

**Main File**: `app.py`

**Responsibilities**:
- HTTP request handling
- Route management
- API endpoints
- File upload handling
- Session management

**Key Routes**:
```python
GET  /                    # Dashboard
GET  /schedules           # Schedule management page
GET  /audio               # Audio management page
GET  /announcements       # Manual announcements
GET  /logs                # Play logs

POST /api/schedules       # Create schedule
PUT  /api/schedules/<id>  # Update schedule
DELETE /api/schedules/<id># Delete schedule
POST /api/audio/upload    # Upload audio
POST /api/play            # Play audio
POST /api/settings        # Update settings
```

### 3. Scheduler Module
**Technology**: APScheduler (BackgroundScheduler)

**File**: `scheduler.py`

**Responsibilities**:
- Load schedules from database
- Create cron jobs
- Execute scheduled bells
- Handle timezone
- Auto-reload on schedule change

**Flow**:
```python
1. Load schedules from DB
2. Parse day_of_week and time
3. Create CronTrigger
4. Register job with scheduler
5. On trigger → play audio
6. Log to database
```

### 4. Audio Player Module
**Technology**: Pygame Mixer

**File**: `audio_player.py`

**Responsibilities**:
- Initialize audio system
- Load and play MP3/WAV/OGG
- Volume control
- Monitor playback status
- Get audio duration

**Features**:
- Singleton pattern (global instance)
- Callback on playback complete
- Thread-safe playback monitoring
- Stop/pause/resume controls

### 5. Database Layer
**Technology**: SQLite3

**File**: `database.py`

**Schema**:

#### Table: `schedules`
```sql
- id (PRIMARY KEY)
- name (TEXT)
- day_of_week (TEXT)
- time (TEXT)
- audio_file (TEXT)
- is_active (INTEGER)
- created_at (TIMESTAMP)
```

#### Table: `audio_files`
```sql
- id (PRIMARY KEY)
- filename (TEXT UNIQUE)
- display_name (TEXT)
- file_path (TEXT)
- duration (REAL)
- uploaded_at (TIMESTAMP)
```

#### Table: `play_logs`
```sql
- id (PRIMARY KEY)
- schedule_id (INTEGER FK)
- audio_file (TEXT)
- played_at (TIMESTAMP)
- status (TEXT)
- notes (TEXT)
```

#### Table: `settings`
```sql
- key (PRIMARY KEY)
- value (TEXT)
- updated_at (TIMESTAMP)
```

### 6. File Storage
**Location**: `static/audio/`

**Supported Formats**:
- MP3 (recommended)
- WAV
- OGG

**Naming Convention**:
- Original filename + timestamp
- Example: `bell_morning_20241103_123456.mp3`

## 🔄 Data Flow

### Scenario 1: Membuat Jadwal Baru
```
1. User fills form → Frontend JS validates
2. POST /api/schedules → Flask receives data
3. database.add_schedule() → Insert to DB
4. scheduler.reload_schedules() → Refresh jobs
5. Response success → Page reload
```

### Scenario 2: Bel Otomatis Berbunyi
```
1. Scheduler triggers job (cron)
2. scheduler._play_scheduled_bell() called
3. Check holiday mode → Continue if not holiday
4. audio_player.play_audio() → Load & play MP3
5. database.add_play_log() → Log to database
6. Audio plays → Complete
```

### Scenario 3: Pengumuman Manual
```
1. User selects audio → Click "Play"
2. POST /api/play → Flask receives request
3. audio_player.play_audio() → Immediate playback
4. database.add_play_log() → Log as 'manual_play'
5. Frontend polls status → Update UI
```

## 🎯 Design Patterns

### 1. **Singleton Pattern**
- `audio_player` global instance
- `bell_scheduler` global instance

### 2. **Factory Pattern**
- Database connection factory (`get_db_connection()`)

### 3. **Observer Pattern**
- Scheduler observes time and triggers jobs
- Frontend polls API for status updates

### 4. **MVC Pattern**
```
Model      → database.py (Data layer)
View       → templates/*.html (Presentation)
Controller → app.py (Business logic)
```

## 🔐 Security Considerations

### Current Implementation:
- ✅ Filename sanitization (secure_filename)
- ✅ File type validation
- ✅ File size limits (50MB)
- ✅ SQL injection prevention (parameterized queries)

### For Production (TODO):
- ⚠️ Add user authentication
- ⚠️ Add CSRF protection
- ⚠️ Use HTTPS
- ⚠️ Add rate limiting
- ⚠️ Input sanitization
- ⚠️ Add logging and monitoring

## ⚡ Performance

### Optimizations:
- SQLite with indexes
- Static file serving by Flask
- Minimal database queries
- Background scheduler (non-blocking)
- AJAX for async operations

### Bottlenecks:
- File upload size (limit: 50MB)
- Concurrent audio playback (single channel)
- Database locks (SQLite limitation)

### Scaling Recommendations:
- For > 100 schedules: Use PostgreSQL
- For multiple audio channels: Multi-instance
- For high traffic: Add caching (Redis)
- For redundancy: Add backup server

## 🛠️ Development vs Production

### Development Mode:
```python
app.run(debug=True, use_reloader=False)
```
- Debug mode ON
- Auto-reload disabled (because of scheduler)
- Run on localhost:5000

### Production Mode:
```python
# Use production WSGI server
gunicorn -w 4 -b 0.0.0.0:5000 app:app
# or
waitress-serve --port=5000 app:app
```
- Debug mode OFF
- Multiple workers
- Better performance
- Process management

## 📦 Deployment Options

### Option 1: Raspberry Pi (Recommended)
```
Hardware: Raspberry Pi 4 (4GB)
OS: Raspberry Pi OS
Python: 3.9+
Audio: USB Bluetooth + Speaker
Power: UPS recommended
```

### Option 2: Ubuntu Server
```
Hardware: Any PC/Server
OS: Ubuntu 20.04+
Python: 3.8+
Audio: PulseAudio + Bluetooth/Aux
Service: systemd
```

### Option 3: Windows PC
```
Hardware: Any Windows PC
OS: Windows 10/11
Python: 3.8+
Audio: Default audio device
Service: Task Scheduler or NSSM
```

## 🔍 Monitoring

### Logs to Monitor:
1. Play logs (success/failed)
2. Scheduler execution
3. Audio player errors
4. File upload errors
5. API errors

### Health Checks:
- `/api/status` endpoint
- Database connectivity
- Audio device availability
- Disk space
- Scheduler running

## 🚀 Future Enhancements

### Planned Features:
- [ ] Web-based audio preview
- [ ] Bulk schedule import (CSV)
- [ ] Multiple audio zones
- [ ] Mobile app (React Native)
- [ ] Email notifications on errors
- [ ] Advanced analytics dashboard
- [ ] Cloud backup integration
- [ ] Multi-user with roles
- [ ] REST API documentation (Swagger)
- [ ] Docker containerization

### Advanced Features:
- [ ] Text-to-speech for announcements
- [ ] Audio mixing (background music + announcement)
- [ ] Network audio streaming (Icecast)
- [ ] Integration with school management system
- [ ] Automatic volume adjustment by time
- [ ] Weather-based schedule adjustment

---

**Architecture Version**: 1.0  
**Last Updated**: November 2024  
**Maintained by**: School IT Team
