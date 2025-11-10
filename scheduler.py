"""
Scheduler Module untuk School Bell System
Menggunakan APScheduler untuk menjalankan bel otomatis sesuai jadwal
"""

from apscheduler.schedulers.background import BackgroundScheduler
from apscheduler.triggers.cron import CronTrigger
from datetime import datetime
import database
import audio_player

class BellScheduler:
    """Class untuk menangani penjadwalan bel sekolah"""
    
    def __init__(self):
        """Initialize background scheduler"""
        self.scheduler = BackgroundScheduler()
        self.scheduler.start()
        self.jobs = {}
        print("⏰ Scheduler initialized")
        
    def load_schedules(self):
        """
        Load semua jadwal dari database dan daftarkan ke scheduler
        Fungsi ini dipanggil saat:
        - Aplikasi pertama kali jalan
        - Ada perubahan jadwal (tambah/edit/delete)
        """
        # Hapus semua job yang ada
        self.clear_all_jobs()
        
        # Ambil semua jadwal aktif dari database
        schedules = database.get_all_schedules()
        
        loaded_count = 0
        for schedule in schedules:
            if schedule['is_active']:
                success = self.add_job(schedule)
                if success:
                    loaded_count += 1
        
        print(f"✅ Loaded {loaded_count} active schedules")
    
    def add_job(self, schedule):
        """
        Menambahkan job ke scheduler
        Args:
            schedule: dictionary dengan data jadwal dari database
        Returns:
            bool: True jika sukses
        """
        try:
            schedule_id = schedule['id']
            day_of_week = schedule['day_of_week']
            time_str = schedule['time']  # Format: HH:MM
            audio_file = schedule['audio_file']
            
            # Parse time
            hour, minute = map(int, time_str.split(':'))
            
            # Mapping hari ke number (0=Monday, 6=Sunday)
            day_mapping = {
                'Senin': 0,
                'Selasa': 1,
                'Rabu': 2,
                'Kamis': 3,
                'Jumat': 4,
                'Sabtu': 5,
                'Minggu': 6
            }
            
            day_num = day_mapping.get(day_of_week)
            
            if day_num is None:
                print(f"❌ Invalid day: {day_of_week}")
                return False
            
            # Buat cron trigger (ini yang bikin schedule jalan otomatis)
            trigger = CronTrigger(
                day_of_week=day_num,
                hour=hour,
                minute=minute
            )
            
            # Tambahkan job ke scheduler
            job = self.scheduler.add_job(
                func=self._play_scheduled_bell,
                trigger=trigger,
                args=[schedule_id, audio_file, schedule['name']],
                id=f"schedule_{schedule_id}",
                replace_existing=True
            )
            
            self.jobs[schedule_id] = job
            print(f"  📅 {schedule['name']} - {day_of_week} {time_str}")
            
            return True
            
        except Exception as e:
            print(f"❌ Error adding job: {e}")
            return False
    
    def _play_scheduled_bell(self, schedule_id, audio_file, schedule_name):
        """
        Function yang dipanggil otomatis saat jadwal tiba
        (Internal function - dipanggil oleh scheduler)
        """
        print(f"\n{'='*60}")
        print(f"🔔 WAKTU BEL: {schedule_name}")
        print(f"⏰ Time: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
        print(f"🎵 Audio: {audio_file}")
        print(f"{'='*60}\n")
        
        # Cek holiday mode
        holiday_mode = database.get_setting('holiday_mode')
        if holiday_mode == '1':
            print("🏖️  Holiday mode aktif - bel dibatalkan")
            database.add_play_log(
                schedule_id, 
                audio_file, 
                'cancelled', 
                'Holiday mode active'
            )
            return
        
        # Play audio
        audio_path = f"static/audio/{audio_file}"
        success = audio_player.play_audio(audio_path)
        
        # Log ke database
        if success:
            database.add_play_log(schedule_id, audio_file, 'success')
            print("✅ Audio berhasil diputar")
        else:
            database.add_play_log(
                schedule_id, 
                audio_file, 
                'failed', 
                'Audio file not found or error playing'
            )
            print("❌ Gagal memutar audio")
    
    def remove_job(self, schedule_id):
        """
        Menghapus job dari scheduler
        Args:
            schedule_id: ID schedule yang mau dihapus
        """
        job_id = f"schedule_{schedule_id}"
        try:
            self.scheduler.remove_job(job_id)
            if schedule_id in self.jobs:
                del self.jobs[schedule_id]
            print(f"🗑️  Removed job: {job_id}")
            return True
        except:
            return False
    
    def clear_all_jobs(self):
        """Menghapus semua jobs (biasanya sebelum reload)"""
        self.scheduler.remove_all_jobs()
        self.jobs = {}
    
    def get_next_run_time(self, schedule_id):
        """
        Mendapatkan waktu eksekusi berikutnya untuk schedule
        Args:
            schedule_id: ID schedule
        Returns:
            datetime: waktu eksekusi berikutnya
        """
        job_id = f"schedule_{schedule_id}"
        job = self.scheduler.get_job(job_id)
        if job:
            return job.next_run_time
        return None
    
    def list_jobs(self):
        """List semua jobs yang aktif (untuk debugging)"""
        jobs = self.scheduler.get_jobs()
        print(f"\n📋 Active Jobs ({len(jobs)}):")
        print("-" * 70)
        for job in jobs:
            print(f"ID: {job.id}")
            print(f"Next run: {job.next_run_time}")
            print(f"Trigger: {job.trigger}")
            print("-" * 70)
    
    def shutdown(self):
        """Shutdown scheduler (dipanggil saat aplikasi ditutup)"""
        self.scheduler.shutdown()
        print("🛑 Scheduler shutdown")


# Global scheduler instance (singleton pattern)
bell_scheduler = None

def init_scheduler():
    """
    Initialize global scheduler
    Panggil fungsi ini saat aplikasi start
    """
    global bell_scheduler
    bell_scheduler = BellScheduler()
    bell_scheduler.load_schedules()
    return bell_scheduler

def reload_schedules():
    """
    Reload semua jadwal dari database
    Panggil setiap kali ada perubahan jadwal
    """
    if bell_scheduler:
        bell_scheduler.load_schedules()
    else:
        print("⚠️  Scheduler belum diinisialisasi")

def get_scheduler():
    """Get scheduler instance"""
    return bell_scheduler


# Testing jika file dijalankan langsung
if __name__ == '__main__':
    print("🧪 Testing Scheduler...")
    print("=" * 60)
    
    # Initialize database dulu
    database.init_db()
    
    # Initialize scheduler
    scheduler = init_scheduler()
    
    # List semua jobs
    scheduler.list_jobs()
    
    print("\n💡 Scheduler berjalan di background")
    print("💡 Bel akan berbunyi otomatis sesuai jadwal")
    print("💡 Press Ctrl+C untuk stop")
    
    try:
        # Keep running
        import time
        while True:
            time.sleep(1)
    except KeyboardInterrupt:
        print("\n\n🛑 Stopping scheduler...")
        scheduler.shutdown()
        print("✅ Scheduler stopped")
