"""
Main Application untuk School Bell Management System
Flask web server yang menghubungkan frontend dan backend
"""

from flask import Flask, render_template, request, jsonify, redirect, url_for, session, flash, send_from_directory
from auth import login_required, admin_required, verify_password, get_user_role
from werkzeug.utils import secure_filename
import os
import database
import audio_player
import scheduler
from datetime import datetime

# Inisialisasi Flask app
app = Flask(__name__)
app.config['SECRET_KEY'] = 'fufufafa'
app.config['UPLOAD_FOLDER'] = 'static/audio'
app.config['MAX_CONTENT_LENGTH'] = 50 * 1024 * 1024  # Max 50MB

ALLOWED_EXTENSIONS = {'mp3', 'wav', 'ogg'}

def allowed_file(filename):
    """Cek apakah file extension diizinkan"""
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

# ==================== AUTHENTICATION ROUTES ====================

@app.route('/login', methods=['GET', 'POST'])
def login():
    """Login page"""
    if request.method == 'POST':
        username = request.form.get('username')
        password = request.form.get('password')
        
        if verify_password(username, password):
            session['username'] = username
            session['role'] = get_user_role(username)
            flash(f'Selamat datang, {username}!', 'success')
            
            # Redirect ke halaman yang diminta atau dashboard
            next_page = request.args.get('next')
            return redirect(next_page or url_for('index'))
        else:
            flash('Username atau password salah!', 'danger')
    
    return render_template('login.html')

@app.route('/logout')
def logout():
    """Logout"""
    username = session.get('username')
    session.clear()
    flash(f'Anda telah logout, {username}', 'info')
    return redirect(url_for('login'))

# ========== ROUTES UNTUK HALAMAN HTML ==========

@app.route('/')
@login_required
def index():
    """Dashboard utama"""
    return render_template('index.html')

@app.route('/schedules')
@login_required
def schedules_page():
    """Halaman manajemen jadwal"""
    schedules = database.get_all_schedules()
    audio_files = database.get_all_audio_files()
    return render_template('schedules.html', schedules=schedules, audio_files=audio_files)

@app.route('/audio')
@login_required
def audio_page():
    """Halaman manajemen audio"""
    audio_files = database.get_all_audio_files()
    return render_template('audio.html', audio_files=audio_files)

@app.route('/announcements')
@login_required
def announcements_page():
    """Halaman pengumuman manual"""
    audio_files = database.get_all_audio_files()
    return render_template('announcements.html', audio_files=audio_files)

@app.route('/logs')
@login_required
def logs_page():
    """Halaman log pemutaran"""
    logs = database.get_recent_logs(100)
    return render_template('logs.html', logs=logs)


# ========== API ENDPOINTS UNTUK SCHEDULES ==========

@app.route('/api/schedules', methods=['GET'])
@login_required
def get_schedules():
    """API untuk mendapatkan semua jadwal"""
    schedules = database.get_all_schedules()
    return jsonify([dict(s) for s in schedules])

@app.route('/api/schedules', methods=['POST'])
@login_required
def add_schedule():
    """API untuk menambah jadwal baru"""
    data = request.json
    
    if not data:
        return jsonify({'success': False, 'error': 'No data provided'}), 400
    
    schedule_id = database.add_schedule(
        name=data.get('name', ''),
        day_of_week=data.get('day_of_week', ''),
        time=data.get('time', ''),
        audio_file=data.get('audio_file', '')
    )
    
    # Reload scheduler agar jadwal baru langsung aktif
    scheduler.reload_schedules()
    
    return jsonify({'success': True, 'id': schedule_id})

@app.route('/api/schedules/<int:schedule_id>', methods=['PUT'])
@login_required
def update_schedule(schedule_id):
    """API untuk update jadwal"""
    data = request.json
    
    if not data:
        return jsonify({'success': False, 'error': 'No data provided'}), 400
    
    database.update_schedule(
        schedule_id=schedule_id,
        name=data.get('name', ''),
        day_of_week=data.get('day_of_week', ''),
        time=data.get('time', ''),
        audio_file=data.get('audio_file', '')
    )
    
    # Reload scheduler
    scheduler.reload_schedules()
    
    return jsonify({'success': True})

@app.route('/api/schedules/<int:schedule_id>', methods=['DELETE'])
@login_required
def delete_schedule(schedule_id):
    """API untuk hapus jadwal"""
    database.delete_schedule(schedule_id)
    scheduler.reload_schedules()
    return jsonify({'success': True})

@app.route('/api/schedules/<int:schedule_id>/toggle', methods=['POST'])
@login_required
def toggle_schedule(schedule_id):
    """API untuk toggle aktif/non-aktif jadwal"""
    database.toggle_schedule(schedule_id)
    scheduler.reload_schedules()
    return jsonify({'success': True})


# ========== API ENDPOINTS UNTUK AUDIO ==========

@app.route('/api/audio', methods=['GET'])
@login_required
def get_audio_files():
    """API untuk mendapatkan semua file audio"""
    audio_files = database.get_all_audio_files()
    return jsonify([dict(a) for a in audio_files])

@app.route('/api/audio/upload', methods=['POST'])
@login_required
def upload_audio():
    """API untuk upload file audio"""
    if 'file' not in request.files:
        return jsonify({'success': False, 'error': 'No file part'}), 400
    
    file = request.files['file']
    
    if not file or file.filename == '':
        return jsonify({'success': False, 'error': 'No selected file'}), 400
    
    if file and allowed_file(file.filename):
        filename = secure_filename(file.filename or '')
        
        # Tambahkan timestamp untuk mencegah duplikasi nama
        timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
        name, ext = os.path.splitext(filename)
        filename = f"{name}_{timestamp}{ext}"
        
        filepath = os.path.join(app.config['UPLOAD_FOLDER'], filename)
        file.save(filepath)
        
        # Get duration
        duration = audio_player.audio_player.get_audio_duration(filepath)
        
        # Save to database
        display_name = request.form.get('display_name', filename)
        audio_id = database.add_audio_file(
            filename=filename,
            display_name=display_name,
            file_path=filepath,
            duration=duration
        )
        
        return jsonify({
            'success': True, 
            'id': audio_id,
            'filename': filename,
            'duration': duration
        })
    
    return jsonify({'success': False, 'error': 'Invalid file type'}), 400

@app.route('/api/audio/<int:audio_id>', methods=['DELETE'])
@login_required
def delete_audio(audio_id):
    """API untuk hapus file audio"""
    database.delete_audio_file(audio_id)
    return jsonify({'success': True})


# ========== API ENDPOINTS UNTUK PLAYBACK ==========

@app.route('/api/play', methods=['POST'])
@login_required
def play_audio():
    """API untuk play audio manual (pengumuman)"""
    data = request.json
    
    if not data:
        return jsonify({'success': False, 'error': 'No data provided'}), 400
    
    audio_file = data.get('audio_file')
    
    if not audio_file:
        return jsonify({'success': False, 'error': 'No audio file specified'}), 400
    
    audio_path = f"static/audio/{audio_file}"
    
    if not os.path.exists(audio_path):
        return jsonify({'success': False, 'error': 'Audio file not found'}), 404
    
    success = audio_player.play_audio(audio_path)
    
    # Log manual play
    if success:
        database.add_play_log(None, audio_file, 'manual_play', 'Played from announcements')
    
    return jsonify({'success': success})

@app.route('/api/stop', methods=['POST'])
@login_required
def stop_audio():
    """API untuk stop audio yang sedang diputar"""
    audio_player.stop_audio()
    return jsonify({'success': True})

@app.route('/api/status', methods=['GET'])
@login_required
def get_status():
    """API untuk mendapatkan status sistem"""
    is_playing = audio_player.is_playing()
    current_file = audio_player.audio_player.current_file
    holiday_mode = database.get_setting('holiday_mode') == '1'
    volume = int(database.get_setting('volume') or 80)
    
    # Get next schedule
    now = datetime.now()
    day_name = ['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu', 'Minggu'][now.weekday()]
    today_schedules = database.get_active_schedules_by_day(day_name)
    
    next_schedule = None
    current_time = now.strftime('%H:%M')
    
    for schedule in today_schedules:
        if schedule['time'] > current_time:
            next_schedule = {
                'name': schedule['name'],
                'time': schedule['time'],
                'audio_file': schedule['audio_file']
            }
            break
    
    return jsonify({
        'is_playing': is_playing,
        'current_file': current_file,
        'holiday_mode': holiday_mode,
        'volume': volume,
        'next_schedule': next_schedule,
        'current_time': now.strftime('%H:%M:%S'),
        'current_day': day_name
    })


# ========== API ENDPOINTS UNTUK SETTINGS ==========

@app.route('/api/settings', methods=['GET'])
@login_required
def get_settings():
    """API untuk mendapatkan semua settings"""
    return jsonify({
        'volume': int(database.get_setting('volume') or 80),
        'holiday_mode': database.get_setting('holiday_mode') == '1',
        'auto_start': database.get_setting('auto_start') == '1'
    })

@app.route('/api/settings', methods=['POST'])
@login_required
def update_settings():
    """API untuk update settings"""
    data = request.json
    
    if not data:
        return jsonify({'success': False, 'error': 'No data provided'}), 400
    
    if 'volume' in data:
        volume = max(0, min(100, int(data.get('volume', 80))))
        database.update_setting('volume', str(volume))
        audio_player.set_volume(volume)
    
    if 'holiday_mode' in data:
        database.update_setting('holiday_mode', '1' if data.get('holiday_mode') else '0')
    
    if 'auto_start' in data:
        database.update_setting('auto_start', '1' if data.get('auto_start') else '0')
    
    return jsonify({'success': True})

@app.route('/api/logs', methods=['GET'])
@login_required
def get_logs():
    """API untuk mendapatkan logs"""
    limit = request.args.get('limit', 50, type=int)
    logs = database.get_recent_logs(limit)
    return jsonify([dict(log) for log in logs])


# ========== MAIN - JALANKAN APLIKASI ==========

# ========== PWA ROUTES ==========

@app.route('/pwa')
def pwa_page():
    """PWA mobile-friendly interface"""
    return render_template('pwa.html')

@app.route('/share')
def share_handler():
    """Handle file sharing from other apps"""
    return render_template('share.html')

@app.route('/api/sync', methods=['POST'])
@login_required
def sync_data():
    """Sync data for PWA"""
    data = request.json
    
    if not data:
        return jsonify({'success': False, 'error': 'No data provided'}), 400
    
    if 'schedules' in data:
        # Sync schedules from PWA
        for schedule in data['schedules']:
            if 'id' in schedule and schedule['id']:
                # Update existing
                database.update_schedule(
                    schedule['id'],
                    schedule.get('name', ''),
                    schedule.get('day_of_week', ''),
                    schedule.get('time', ''),
                    schedule.get('audio_file', '')
                )
            else:
                # Add new
                database.add_schedule(
                    schedule.get('name', ''),
                    schedule.get('day_of_week', ''),
                    schedule.get('time', ''),
                    schedule.get('audio_file', '')
                )
    
    if 'logs' in data:
        # Sync logs from PWA
        for log in data['logs']:
            database.add_play_log(
                log.get('schedule_id'),
                log.get('audio_file', ''),
                log.get('status', ''),
                log.get('notes', '')
            )
    
    return jsonify({'success': True})

@app.route('/api/audio-files')
def get_audio_files_list():
    """Get list of audio files for PWA caching"""
    try:
        audio_files = database.get_all_audio_files()
        return jsonify([dict(a) for a in audio_files])
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/push-subscription', methods=['POST'])
@login_required
def save_push_subscription():
    """Save push notification subscription"""
    try:
        subscription = request.json
        # Save to database or file
        # For now, just return success
        return jsonify({'success': True})
    except Exception as e:
        return jsonify({'error': str(e)}), 500

# ========== SERVE STATIC FILES FOR PWA ==========

@app.route('/static/manifest.json')
def serve_manifest():
    """Serve PWA manifest"""
    return send_from_directory('static', 'manifest.json', mimetype='application/manifest+json')

@app.route('/static/js/service-worker.js')
def serve_service_worker():
    """Serve service worker with correct headers"""
    response = send_from_directory('static/js', 'service-worker.js')
    response.headers['Service-Worker-Allowed'] = '/'
    response.headers['Cache-Control'] = 'no-cache, no-store, must-revalidate'
    return response

# ========== MAIN - JALANKAN APLIKASI ==========

if __name__ == '__main__':
    print("\n" + "="*60)
    print("🔔 SCHOOL BELL MANAGEMENT SYSTEM")
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
    print("🌐 Web Interface: http://localhost:5000")
    print("📱 PWA Interface: http://localhost:5000/pwa")
    print("🔗 Or from other device: http://[YOUR-IP]:5000")
    print("="*60 + "\n")
    
    # Run Flask app
    # debug=True untuk development, set False untuk production
    # use_reloader=False karena scheduler sudah running di background
    app.run(debug=True, host='0.0.0.0', port=5000, use_reloader=False)
