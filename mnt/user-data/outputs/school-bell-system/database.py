import sqlite3
import os
from datetime import datetime

DATABASE_PATH = 'database/school_bell.db'

def get_db_connection():
    """Membuat koneksi ke database"""
    conn = sqlite3.connect(DATABASE_PATH)
    conn.row_factory = sqlite3.Row
    return conn

def init_db():
    """Inisialisasi database dan membuat tabel-tabel yang dibutuhkan"""
    conn = get_db_connection()
    cursor = conn.cursor()
    
    # Tabel untuk jadwal bel
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS schedules (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            day_of_week TEXT NOT NULL,
            time TEXT NOT NULL,
            audio_file TEXT NOT NULL,
            is_active INTEGER DEFAULT 1,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    ''')
    
    # Tabel untuk file audio
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS audio_files (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            filename TEXT NOT NULL UNIQUE,
            display_name TEXT NOT NULL,
            file_path TEXT NOT NULL,
            duration REAL,
            uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    ''')
    
    # Tabel untuk log pemutaran
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS play_logs (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            schedule_id INTEGER,
            audio_file TEXT NOT NULL,
            played_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            status TEXT NOT NULL,
            notes TEXT,
            FOREIGN KEY (schedule_id) REFERENCES schedules (id)
        )
    ''')
    
    # Tabel untuk pengumuman
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS announcements (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            title TEXT NOT NULL,
            audio_file TEXT NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    ''')
    
    # Tabel untuk pengaturan sistem
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS settings (
            key TEXT PRIMARY KEY,
            value TEXT NOT NULL,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    ''')
    
    # Insert default settings
    cursor.execute('''
        INSERT OR IGNORE INTO settings (key, value) VALUES 
        ('volume', '80'),
        ('holiday_mode', '0'),
        ('auto_start', '1')
    ''')
    
    conn.commit()
    conn.close()
    print("Database initialized successfully!")

def add_schedule(name, day_of_week, time, audio_file):
    """Menambah jadwal bel baru"""
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute('''
        INSERT INTO schedules (name, day_of_week, time, audio_file)
        VALUES (?, ?, ?, ?)
    ''', (name, day_of_week, time, audio_file))
    conn.commit()
    schedule_id = cursor.lastrowid
    conn.close()
    return schedule_id

def get_all_schedules():
    """Mengambil semua jadwal"""
    conn = get_db_connection()
    schedules = conn.execute('''
        SELECT * FROM schedules ORDER BY day_of_week, time
    ''').fetchall()
    conn.close()
    return schedules

def get_active_schedules_by_day(day_of_week):
    """Mengambil jadwal aktif berdasarkan hari"""
    conn = get_db_connection()
    schedules = conn.execute('''
        SELECT * FROM schedules 
        WHERE day_of_week = ? AND is_active = 1
        ORDER BY time
    ''', (day_of_week,)).fetchall()
    conn.close()
    return schedules

def update_schedule(schedule_id, name, day_of_week, time, audio_file):
    """Update jadwal"""
    conn = get_db_connection()
    conn.execute('''
        UPDATE schedules 
        SET name = ?, day_of_week = ?, time = ?, audio_file = ?
        WHERE id = ?
    ''', (name, day_of_week, time, audio_file, schedule_id))
    conn.commit()
    conn.close()

def delete_schedule(schedule_id):
    """Hapus jadwal"""
    conn = get_db_connection()
    conn.execute('DELETE FROM schedules WHERE id = ?', (schedule_id,))
    conn.commit()
    conn.close()

def toggle_schedule(schedule_id):
    """Toggle status aktif/non-aktif jadwal"""
    conn = get_db_connection()
    conn.execute('''
        UPDATE schedules 
        SET is_active = CASE WHEN is_active = 1 THEN 0 ELSE 1 END
        WHERE id = ?
    ''', (schedule_id,))
    conn.commit()
    conn.close()

def add_audio_file(filename, display_name, file_path, duration=0):
    """Menambah file audio"""
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute('''
        INSERT INTO audio_files (filename, display_name, file_path, duration)
        VALUES (?, ?, ?, ?)
    ''', (filename, display_name, file_path, duration))
    conn.commit()
    audio_id = cursor.lastrowid
    conn.close()
    return audio_id

def get_all_audio_files():
    """Mengambil semua file audio"""
    conn = get_db_connection()
    audio_files = conn.execute('''
        SELECT * FROM audio_files ORDER BY uploaded_at DESC
    ''').fetchall()
    conn.close()
    return audio_files

def delete_audio_file(audio_id):
    """Hapus file audio dari database"""
    conn = get_db_connection()
    audio = conn.execute('SELECT * FROM audio_files WHERE id = ?', (audio_id,)).fetchone()
    if audio:
        # Hapus file fisik
        if os.path.exists(audio['file_path']):
            os.remove(audio['file_path'])
        # Hapus dari database
        conn.execute('DELETE FROM audio_files WHERE id = ?', (audio_id,))
        conn.commit()
    conn.close()

def add_play_log(schedule_id, audio_file, status, notes=''):
    """Menambah log pemutaran"""
    conn = get_db_connection()
    conn.execute('''
        INSERT INTO play_logs (schedule_id, audio_file, status, notes)
        VALUES (?, ?, ?, ?)
    ''', (schedule_id, audio_file, status, notes))
    conn.commit()
    conn.close()

def get_recent_logs(limit=50):
    """Mengambil log pemutaran terbaru"""
    conn = get_db_connection()
    logs = conn.execute('''
        SELECT l.*, s.name as schedule_name
        FROM play_logs l
        LEFT JOIN schedules s ON l.schedule_id = s.id
        ORDER BY l.played_at DESC
        LIMIT ?
    ''', (limit,)).fetchall()
    conn.close()
    return logs

def get_setting(key):
    """Mengambil nilai setting"""
    conn = get_db_connection()
    result = conn.execute('SELECT value FROM settings WHERE key = ?', (key,)).fetchone()
    conn.close()
    return result['value'] if result else None

def update_setting(key, value):
    """Update setting"""
    conn = get_db_connection()
    conn.execute('''
        INSERT OR REPLACE INTO settings (key, value, updated_at)
        VALUES (?, ?, CURRENT_TIMESTAMP)
    ''', (key, value))
    conn.commit()
    conn.close()

if __name__ == '__main__':
    init_db()
