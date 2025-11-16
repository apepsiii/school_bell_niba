# 📡 School Bell System - API Documentation

## Base URL

```
https://bell.smkniba.sch.id/api
```

## Authentication

Client API endpoints are **public** and do not require authentication.  
Admin API endpoints may require authentication (if configured).

---

## Client API Endpoints

### 1. Get System Status

Get current system status including next bell schedule.

**Endpoint:** `GET /api/client/status`

**Response:**
```json
{
  "success": true,
  "is_playing": false,
  "current_file": null,
  "holiday_mode": false,
  "current_time": "14:30:45",
  "current_date": "2024-11-16",
  "current_day": "Saturday",
  "next_schedule": {
    "name": "Bel Masuk",
    "time": "07:00",
    "audio_file": "bell_morning.mp3",
    "in_seconds": 59415
  },
  "server_time": "2024-11-16T14:30:45.123456"
}
```

### 2. Get Today's Schedules

Get all active schedules for today.

**Endpoint:** `GET /api/client/schedules/today`

**Response:**
```json
{
  "success": true,
  "day": "Saturday",
  "date": "2024-11-16",
  "schedules": [
    {
      "id": 1,
      "name": "Bel Masuk",
      "time": "07:00",
      "audio_file": "bell_morning.mp3",
      "is_active": 1,
      "status": "upcoming",
      "countdown": 59415
    },
    {
      "id": 2,
      "name": "Bel Istirahat",
      "time": "10:00",
      "audio_file": "bell_break.mp3",
      "is_active": 1,
      "status": "upcoming",
      "countdown": 70215
    }
  ]
}
```

**Schedule Status:**
- `past` - Sudah lewat
- `upcoming` - Belum tiba
- `active` - Sedang berbunyi (jarang)

### 3. Stream Audio File

Stream audio file for client playback.

**Endpoint:** `GET /api/client/audio/{filename}`

**Parameters:**
- `filename` (string) - Audio filename

**Example:**
```
GET /api/client/audio/bell_morning.mp3
```

**Response:** Audio file stream (MP3/WAV/OGG)

### 4. Get Audio List

Get list of all available audio files (for caching).

**Endpoint:** `GET /api/client/audio/list`

**Response:**
```json
{
  "success": true,
  "files": [
    {
      "id": 1,
      "filename": "bell_morning.mp3",
      "display_name": "Bel Masuk Pagi",
      "file_path": "/path/to/file",
      "duration": 5.2,
      "uploaded_at": "2024-11-16 10:00:00"
    }
  ]
}
```

---

## WebSocket Events

Connect to WebSocket for real-time updates.

**URL:** `wss://bell.smkniba.sch.id/socket.io/`

### Client → Server Events

#### 1. Connect
```javascript
socket.on('connect', function() {
    console.log('Connected to server');
});
```

#### 2. Request Status
```javascript
socket.emit('request_status');
```

### Server → Client Events

#### 1. Connection Status
```javascript
socket.on('connection_status', function(data) {
    // data: { status: 'connected' }
});
```

#### 2. Status Update
```javascript
socket.on('status_update', function(data) {
    // data: Same as /api/client/status response
});
```

#### 3. Bell Triggered
```javascript
socket.on('bell_triggered', function(data) {
    // data: {
    //   schedule_name: "Bel Masuk",
    //   audio_file: "bell_morning.mp3",
    //   time: "2024-11-16T07:00:00"
    // }
});
```

---

## Admin API Endpoints

### 1. Get All Schedules

**Endpoint:** `GET /api/schedules`

**Response:**
```json
[
  {
    "id": 1,
    "name": "Bel Masuk",
    "day_of_week": "Monday",
    "time": "07:00",
    "audio_file": "bell_morning.mp3",
    "is_active": 1,
    "created_at": "2024-11-16 10:00:00"
  }
]
```

### 2. Add Schedule

**Endpoint:** `POST /api/schedules`

**Request Body:**
```json
{
  "name": "Bel Masuk",
  "day_of_week": "Monday",
  "time": "07:00",
  "audio_file": "bell_morning.mp3"
}
```

**Response:**
```json
{
  "success": true,
  "id": 1
}
```

### 3. Update Schedule

**Endpoint:** `PUT /api/schedules/{id}`

**Request Body:**
```json
{
  "name": "Bel Masuk Updated",
  "day_of_week": "Monday",
  "time": "07:15",
  "audio_file": "bell_morning.mp3"
}
```

**Response:**
```json
{
  "success": true
}
```

### 4. Delete Schedule

**Endpoint:** `DELETE /api/schedules/{id}`

**Response:**
```json
{
  "success": true
}
```

### 5. Toggle Schedule

**Endpoint:** `POST /api/schedules/{id}/toggle`

**Response:**
```json
{
  "success": true
}
```

### 6. Upload Audio

**Endpoint:** `POST /api/audio/upload`

**Content-Type:** `multipart/form-data`

**Form Data:**
- `file` (file) - Audio file (MP3/WAV/OGG)
- `display_name` (string) - Display name for audio

**Response:**
```json
{
  "success": true,
  "id": 1,
  "filename": "bell_morning_20241116_120000.mp3"
}
```

### 7. Get Audio Files

**Endpoint:** `GET /api/audio`

**Response:**
```json
[
  {
    "id": 1,
    "filename": "bell_morning.mp3",
    "display_name": "Bel Masuk Pagi",
    "file_path": "/path/to/file",
    "duration": 5.2,
    "uploaded_at": "2024-11-16 10:00:00"
  }
]
```

### 8. Delete Audio

**Endpoint:** `DELETE /api/audio/{id}`

**Response:**
```json
{
  "success": true
}
```

### 9. Play Audio Manually

**Endpoint:** `POST /api/play`

**Request Body:**
```json
{
  "audio_file": "bell_morning.mp3"
}
```

**Response:**
```json
{
  "success": true
}
```

### 10. Stop Audio

**Endpoint:** `POST /api/stop`

**Response:**
```json
{
  "success": true
}
```

### 11. Get Settings

**Endpoint:** `GET /api/settings`

**Response:**
```json
{
  "volume": 80,
  "holiday_mode": false,
  "auto_start": true
}
```

### 12. Update Settings

**Endpoint:** `POST /api/settings`

**Request Body:**
```json
{
  "volume": 90,
  "holiday_mode": true,
  "auto_start": true
}
```

**Response:**
```json
{
  "success": true
}
```

### 13. Get Logs

**Endpoint:** `GET /api/logs?limit=50`

**Query Parameters:**
- `limit` (int) - Number of logs to return (default: 50)

**Response:**
```json
[
  {
    "id": 1,
    "schedule_id": 1,
    "audio_file": "bell_morning.mp3",
    "played_at": "2024-11-16 07:00:00",
    "status": "success",
    "notes": null
  }
]
```

---

## Error Responses

All endpoints return errors in this format:

```json
{
  "success": false,
  "error": "Error message here"
}
```

**HTTP Status Codes:**
- `200` - Success
- `400` - Bad Request
- `404` - Not Found
- `500` - Internal Server Error
- `503` - Service Unavailable (offline)

---

## Example Usage

### JavaScript (Fetch API)

```javascript
// Get system status
fetch('https://bell.smkniba.sch.id/api/client/status')
  .then(response => response.json())
  .then(data => {
    console.log('Status:', data);
    if (data.next_schedule) {
      console.log('Next bell:', data.next_schedule.name);
      console.log('At:', data.next_schedule.time);
    }
  });

// Get today's schedules
fetch('https://bell.smkniba.sch.id/api/client/schedules/today')
  .then(response => response.json())
  .then(data => {
    console.log('Today schedules:', data.schedules);
  });
```

### JavaScript (Socket.IO)

```javascript
// Connect to WebSocket
const socket = io('https://bell.smkniba.sch.id');

// Listen for connection
socket.on('connect', () => {
  console.log('Connected');
  socket.emit('request_status');
});

// Listen for status updates
socket.on('status_update', (data) => {
  console.log('Status updated:', data);
});

// Listen for bell events
socket.on('bell_triggered', (data) => {
  console.log('Bell triggered:', data.schedule_name);
  // Play audio
  const audio = new Audio(`/api/client/audio/${data.audio_file}`);
  audio.play();
});
```

### Python

```python
import requests

# Get system status
response = requests.get('https://bell.smkniba.sch.id/api/client/status')
data = response.json()

if data['success']:
    print(f"Current time: {data['current_time']}")
    if data['next_schedule']:
        print(f"Next bell: {data['next_schedule']['name']}")
        print(f"At: {data['next_schedule']['time']}")

# Get today's schedules
response = requests.get('https://bell.smkniba.sch.id/api/client/schedules/today')
data = response.json()

if data['success']:
    for schedule in data['schedules']:
        print(f"{schedule['time']} - {schedule['name']}")
```

### cURL

```bash
# Get status
curl https://bell.smkniba.sch.id/api/client/status

# Get today's schedules
curl https://bell.smkniba.sch.id/api/client/schedules/today

# Play audio manually (admin)
curl -X POST https://bell.smkniba.sch.id/api/play \
  -H "Content-Type: application/json" \
  -d '{"audio_file": "bell_morning.mp3"}'
```

---

## Rate Limiting

Currently no rate limiting is implemented. Consider adding it for production use.

---

## CORS

CORS is enabled for all origins on `/api/*` endpoints.

```
Access-Control-Allow-Origin: *
Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS
Access-Control-Allow-Headers: Content-Type, Authorization
```

---

## Best Practices

1. **Cache responses** - Cache status/schedules on client-side
2. **Use WebSocket** - For real-time updates instead of polling
3. **Handle errors** - Always check `success` field in response
4. **Offline support** - Implement Service Worker for offline functionality
5. **Audio preload** - Preload audio files for instant playback

---

## Support

For questions or issues:
- Check logs: `/var/log/school-bell/error.log`
- Review documentation: [DEPLOYMENT_GUIDE.md](DEPLOYMENT_GUIDE.md)
- Contact administrator

---

**API Version:** 2.0  
**Last Updated:** November 2024
