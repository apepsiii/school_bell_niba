"""
School Bell Management System - VPS Version
Enhanced dengan WebSocket dan CORS untuk client remote
"""

from flask import Flask, render_template, request, jsonify, send_from_directory
from flask_cors import CORS
from flask_socketio import SocketIO, emit
from werkzeug.utils import secure_filename
import os
import database
import audio_player
import scheduler
from datetime import datetime
import json

# Initialize Flask app
app = Flask(__name__)
app.config['SECRET_KEY'] = 'school-bell-secret-key-2024'
app.config['UPLOAD_FOLDER'] = 'static/audio'
app.config['MAX_CONTENT_LENGTH'] = 50 * 1024 * 1024  # Max 50MB

# Enable CORS for client access from any domain
CORS(app, resources={r"/api/*": {"origins": "*"}})

# Initialize SocketIO for real-time communication
socketio = SocketIO(app, cors_allowed_origins="*")

ALLOWED_EXTENSIONS = {'mp3', 'wav', 'ogg'}

def allowed_file(filename):
    """Check if file extension is allowed"""
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

# ==================== AUTH ROUTES ====================

@app.route('/login', methods=['GET', 'POST'])
def login():
    """Login page - dummy for now (no auth implemented)"""
    # For now, just redirect to index
    # TODO: Implement actual authentication if needed
    return render_template('index.html')

@app.route('/logout')
def logout():
    """Logout - dummy for now"""
    # For now, just redirect to index
    # TODO: Implement actual logout if needed
    return render_template('index.html')

# ==================== ADMIN PAGES ====================

@app.route('/')
def index():
    """Admin dashboard"""
    return render_template('index.html')

@app.route('/schedules')
def schedules_page():
    """Schedule management page"""
    schedules = database.get_all_schedules()
    audio_files = database.get_all_audio_files()
    return render_template('schedules.html', schedules=schedules, audio_files=audio_files)

@app.route('/audio')
def audio_page():
    """Audio management page"""
    audio_files = database.get_all_audio_files()
    return render_template('audio.html', audio_files=audio_files)

@app.route('/announcements')
def announcements_page():
    """Manual announcements page"""
    audio_files = database.get_all_audio_files()
    return render_template('announcements.html', audio_files=audio_files)

@app.route('/logs')
def logs_page():
    """Play logs page"""
    logs = database.get_recent_logs(100)
    return render_template('logs.html', logs=logs)

# ==================== PUBLIC CLIENT PLAYER ====================

@app.route('/player')
def player_page():
    """Public client player page"""
    return send_from_directory('client', 'index.html')

@app.route('/client/<path:filename>')
def serve_client(filename):
    """Serve client static files"""
    return send_from_directory('client', filename)

# ==================== REST API FOR CLIENT ====================

@app.route('/api/client/status', methods=['GET'])
def get_client_status():
    """API for client to get current status"""
    is_playing = audio_player.is_playing()
    current_file = None
    
    if is_playing:
        # Get current playing file info
        pass  # Will be implemented with audio_player tracking
    
    # Get today's schedules
    today = datetime.now()
    day_name = today.strftime('%A')
    schedules = database.get_schedules_by_day(day_name)
    
    # Find next schedule
    current_time = today.strftime('%H:%M')
    next_schedule = None
    holiday_mode = database.get_setting('holiday_mode') == '1'
    
    for schedule in schedules:
        if schedule['is_active'] and schedule['time'] > current_time:
            next_schedule = {
                'name': schedule['name'],
                'time': schedule['time'],
                'audio_file': schedule['audio_file'],
                'in_seconds': calculate_seconds_until(schedule['time'])
            }
            break
    
    return jsonify({
        'success': True,
        'is_playing': is_playing,
        'current_file': current_file,
        'holiday_mode': holiday_mode,
        'current_time': today.strftime('%H:%M:%S'),
        'current_date': today.strftime('%Y-%m-%d'),
        'current_day': day_name,
        'next_schedule': next_schedule,
        'server_time': today.isoformat()
    })

@app.route('/api/client/schedules/today', methods=['GET'])
def get_today_schedules():
    """API to get all schedules for today"""
    today = datetime.now()
    day_name = today.strftime('%A')
    schedules = database.get_schedules_by_day(day_name)
    
    # Filter only active schedules
    active_schedules = [s for s in schedules if s['is_active']]
    
    # Add status (past, current, upcoming)
    current_time = today.strftime('%H:%M')
    for schedule in active_schedules:
        if schedule['time'] < current_time:
            schedule['status'] = 'past'
        else:
            schedule['status'] = 'upcoming'
            schedule['countdown'] = calculate_seconds_until(schedule['time'])
    
    return jsonify({
        'success': True,
        'day': day_name,
        'date': today.strftime('%Y-%m-%d'),
        'schedules': [dict(s) for s in active_schedules]
    })

@app.route('/api/client/audio/<filename>', methods=['GET'])
def stream_audio(filename):
    """Stream audio file to client"""
    try:
        return send_from_directory(app.config['UPLOAD_FOLDER'], filename)
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 404

@app.route('/api/client/audio/list', methods=['GET'])
def get_audio_list():
    """Get list of all audio files for offline caching"""
    audio_files = database.get_all_audio_files()
    return jsonify({
        'success': True,
        'files': [dict(f) for f in audio_files]
    })

# ==================== WEBSOCKET EVENTS ====================

@socketio.on('connect')
def handle_connect():
    """Handle client connection"""
    print(f'Client connected: {request.sid}')
    emit('connection_status', {'status': 'connected'})

@socketio.on('disconnect')
def handle_disconnect():
    """Handle client disconnection"""
    print(f'Client disconnected: {request.sid}')

@socketio.on('request_status')
def handle_status_request():
    """Handle status request from client"""
    status = get_client_status().get_json()
    emit('status_update', status)

def broadcast_bell_event(schedule_name, audio_file):
    """Broadcast bell event to all connected clients"""
    socketio.emit('bell_triggered', {
        'schedule_name': schedule_name,
        'audio_file': audio_file,
        'time': datetime.now().isoformat()
    })
    print(f"📡 Broadcasted bell event: {schedule_name}")

def broadcast_status_update():
    """Broadcast status update to all clients"""
    status = get_client_status().get_json()
    socketio.emit('status_update', status)

# ==================== ADMIN API ENDPOINTS ====================

@app.route('/api/schedules', methods=['GET'])
def get_schedules():
    """Get all schedules"""
    schedules = database.get_all_schedules()
    return jsonify([dict(s) for s in schedules])

@app.route('/api/schedules', methods=['POST'])
def add_schedule():
    """Add new schedule"""
    data = request.json
    
    schedule_id = database.add_schedule(
        name=data['name'],
        day_of_week=data['day_of_week'],
        time=data['time'],
        audio_file=data['audio_file']
    )
    
    scheduler.reload_schedules()
    broadcast_status_update()
    
    return jsonify({'success': True, 'id': schedule_id})

@app.route('/api/schedules/<int:schedule_id>', methods=['PUT'])
def update_schedule(schedule_id):
    """Update schedule"""
    data = request.json
    
    database.update_schedule(
        schedule_id=schedule_id,
        name=data['name'],
        day_of_week=data['day_of_week'],
        time=data['time'],
        audio_file=data['audio_file']
    )
    
    scheduler.reload_schedules()
    broadcast_status_update()
    
    return jsonify({'success': True})

@app.route('/api/schedules/<int:schedule_id>', methods=['DELETE'])
def delete_schedule(schedule_id):
    """Delete schedule"""
    database.delete_schedule(schedule_id)
    scheduler.reload_schedules()
    broadcast_status_update()
    
    return jsonify({'success': True})

@app.route('/api/schedules/<int:schedule_id>/toggle', methods=['POST'])
def toggle_schedule(schedule_id):
    """Toggle schedule active status"""
    database.toggle_schedule(schedule_id)
    scheduler.reload_schedules()
    broadcast_status_update()
    
    return jsonify({'success': True})

@app.route('/api/audio', methods=['GET'])
def get_audio_files():
    """Get all audio files"""
    audio_files = database.get_all_audio_files()
    return jsonify([dict(a) for a in audio_files])

@app.route('/api/audio/upload', methods=['POST'])
def upload_audio():
    """Upload audio file"""
    if 'file' not in request.files:
        return jsonify({'success': False, 'error': 'No file provided'}), 400
    
    file = request.files['file']
    display_name = request.form.get('display_name', '')
    
    if file.filename == '':
        return jsonify({'success': False, 'error': 'No file selected'}), 400
    
    if not allowed_file(file.filename):
        return jsonify({'success': False, 'error': 'Invalid file type'}), 400
    
    # Generate unique filename
    timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
    original_name = secure_filename(file.filename)
    name, ext = os.path.splitext(original_name)
    filename = f"{name}_{timestamp}{ext}"
    
    # Save file
    filepath = os.path.join(app.config['UPLOAD_FOLDER'], filename)
    file.save(filepath)
    
    # Get audio duration
    try:
        duration = audio_player.get_duration(filepath)
    except:
        duration = 0
    
    # Save to database
    audio_id = database.add_audio_file(
        filename=filename,
        display_name=display_name or original_name,
        file_path=filepath,
        duration=duration
    )
    
    return jsonify({'success': True, 'id': audio_id, 'filename': filename})

@app.route('/api/audio/<int:audio_id>', methods=['DELETE'])
def delete_audio(audio_id):
    """Delete audio file"""
    audio = database.get_audio_file(audio_id)
    
    if audio:
        # Delete physical file
        try:
            os.remove(audio['file_path'])
        except:
            pass
        
        # Delete from database
        database.delete_audio_file(audio_id)
        
        return jsonify({'success': True})
    
    return jsonify({'success': False, 'error': 'File not found'}), 404

@app.route('/api/play', methods=['POST'])
def play_audio():
    """Play audio manually"""
    data = request.json
    audio_file = data.get('audio_file')
    
    if not audio_file:
        return jsonify({'success': False, 'error': 'No audio file specified'}), 400
    
    filepath = os.path.join(app.config['UPLOAD_FOLDER'], audio_file)
    
    if not os.path.exists(filepath):
        return jsonify({'success': False, 'error': 'Audio file not found'}), 404
    
    audio_player.play_audio(filepath)
    database.add_play_log(None, audio_file, 'manual_play')
    
    # Broadcast to all clients
    broadcast_bell_event('Manual Play', audio_file)
    broadcast_status_update()
    
    return jsonify({'success': True})

@app.route('/api/stop', methods=['POST'])
def stop_audio():
    """Stop audio playback"""
    audio_player.stop()
    return jsonify({'success': True})

@app.route('/api/status', methods=['GET'])
def get_status():
    """Get system status"""
    is_playing = audio_player.is_playing()
    holiday_mode = database.get_setting('holiday_mode') == '1'
    volume = int(database.get_setting('volume') or 80)
    
    # Get next schedule
    now = datetime.now()
    day_name = now.strftime('%A')
    current_time = now.strftime('%H:%M')
    
    schedules = database.get_schedules_by_day(day_name)
    next_schedule = None
    
    for schedule in schedules:
        if schedule['is_active'] and schedule['time'] > current_time:
            next_schedule = {
                'name': schedule['name'],
                'time': schedule['time'],
                'audio_file': schedule['audio_file']
            }
            break
    
    return jsonify({
        'is_playing': is_playing,
        'holiday_mode': holiday_mode,
        'volume': volume,
        'next_schedule': next_schedule,
        'current_time': now.strftime('%H:%M:%S'),
        'current_day': day_name
    })

@app.route('/api/settings', methods=['GET'])
def get_settings():
    """Get settings"""
    return jsonify({
        'volume': int(database.get_setting('volume') or 80),
        'holiday_mode': database.get_setting('holiday_mode') == '1',
        'auto_start': database.get_setting('auto_start') == '1'
    })

@app.route('/api/settings', methods=['POST'])
def update_settings():
    """Update settings"""
    data = request.json
    
    if 'volume' in data:
        volume = max(0, min(100, int(data['volume'])))
        database.update_setting('volume', str(volume))
        audio_player.set_volume(volume)
    
    if 'holiday_mode' in data:
        database.update_setting('holiday_mode', '1' if data['holiday_mode'] else '0')
    
    if 'auto_start' in data:
        database.update_setting('auto_start', '1' if data['auto_start'] else '0')
    
    broadcast_status_update()
    return jsonify({'success': True})

@app.route('/api/logs', methods=['GET'])
def get_logs():
    """Get play logs"""
    limit = request.args.get('limit', 50, type=int)
    logs = database.get_recent_logs(limit)
    return jsonify([dict(log) for log in logs])

# ==================== HELPER FUNCTIONS ====================

def calculate_seconds_until(time_str):
    """Calculate seconds until specified time (HH:MM format)"""
    now = datetime.now()
    target_time = datetime.strptime(f"{now.date()} {time_str}", "%Y-%m-%d %H:%M")
    
    if target_time < now:
        return 0
    
    delta = target_time - now
    return int(delta.total_seconds())

# ==================== MAIN ====================

if __name__ == '__main__':
    print("\n" + "="*60)
    print("🔔 SCHOOL BELL MANAGEMENT SYSTEM - VPS VERSION")
    print("="*60)
    
    # Initialize database
    print("\n📁 Initializing database...")
    database.init_db()
    
    # Initialize scheduler
    print("\n⏰ Starting scheduler...")
    scheduler.init_scheduler()
    
    # Set volume from settings
    volume = int(database.get_setting('volume') or 80)
    audio_player.set_volume(volume)
    
    print("\n" + "="*60)
    print("✅ Server ready!")
    print("🌐 Admin Panel: http://localhost:5000")
    print("📱 Client Player: http://localhost:5000/player")
    print("🔗 API Endpoint: http://localhost:5000/api")
    print("="*60 + "\n")
    
    # Run with SocketIO
    socketio.run(app, debug=False, host='0.0.0.0', port=5000, allow_unsafe_werkzeug=True)