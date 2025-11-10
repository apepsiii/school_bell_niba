from apscheduler.schedulers.background import BackgroundScheduler
from apscheduler.triggers.cron import CronTrigger
from datetime import datetime
import database
import audio_player

class BellScheduler:
    """Class untuk menangani penjadwalan bel sekolah"""
    
    def __init__(self):
        self.scheduler = BackgroundScheduler()
        self.scheduler.start()
        self.jobs = {}
        
    def load_schedules(self):
        """Load semua jadwal dari database dan daftarkan ke scheduler"""
        # Hapus semua job yang ada
        self.clear_all_jobs()
        
        # Ambil semua jadwal aktif
        schedules = database.get_all_schedules()
        
        for schedule in schedules:
            if schedule['is_active']:
                self.add_job(schedule)
        
        print(f"Loaded {len(self.jobs)} active schedules")
    
    def add_job(self, schedule):
        """Menambahkan job ke scheduler"""
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
                print(f"Invalid day: {day_of_week}")
                return False
            
            # Buat cron trigger
            trigger = CronTrigger(
                day_of_week=day_num,
                hour=hour,
                minute=minute
            )
            
            # Tambahkan job
            job = self.scheduler.add_job(
                func=self._play_scheduled_bell,
                trigger=trigger,
                args=[schedule_id, audio_file, schedule['name']],
                id=f"schedule_{schedule_id}",
                replace_existing=True
            )
            
            self.jobs[schedule_id] = job
            print(f"Added job: {schedule['name']} - {day_of_week} {time_str}")
            
            return True
            
        except Exception as e:
            print(f"Error adding job: {e}")
            return False
    
    def _play_scheduled_bell(self, schedule_id, audio_file, schedule_name):
        """Function yang dipanggil saat jadwal tiba"""
        print(f"\n{'='*50}")
        print(f"Waktu bel: {schedule_name}")
        print(f"Time: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
        print(f"Audio: {audio_file}")
        print(f"{'='*50}\n")
        
        # Cek holiday mode
        holiday_mode = database.get_setting('holiday_mode')
        if holiday_mode == '1':
            print("Holiday mode aktif - bel dibatalkan")
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
        else:
            database.add_play_log(
                schedule_id, 
                audio_file, 
                'failed', 
                'Audio file not found or error playing'
            )
    
    def remove_job(self, schedule_id):
        """Menghapus job dari scheduler"""
        job_id = f"schedule_{schedule_id}"
        try:
            self.scheduler.remove_job(job_id)
            if schedule_id in self.jobs:
                del self.jobs[schedule_id]
            print(f"Removed job: {job_id}")
            return True
        except:
            return False
    
    def clear_all_jobs(self):
        """Menghapus semua jobs"""
        self.scheduler.remove_all_jobs()
        self.jobs = {}
        print("All jobs cleared")
    
    def get_next_run_time(self, schedule_id):
        """Mendapatkan waktu eksekusi berikutnya untuk schedule"""
        job_id = f"schedule_{schedule_id}"
        job = self.scheduler.get_job(job_id)
        if job:
            return job.next_run_time
        return None
    
    def list_jobs(self):
        """List semua jobs yang aktif"""
        jobs = self.scheduler.get_jobs()
        print(f"\nActive Jobs ({len(jobs)}):")
        print("-" * 70)
        for job in jobs:
            print(f"ID: {job.id}")
            print(f"Next run: {job.next_run_time}")
            print(f"Trigger: {job.trigger}")
            print("-" * 70)
    
    def shutdown(self):
        """Shutdown scheduler"""
        self.scheduler.shutdown()
        print("Scheduler shutdown")

# Global scheduler instance
bell_scheduler = None

def init_scheduler():
    """Initialize global scheduler"""
    global bell_scheduler
    bell_scheduler = BellScheduler()
    bell_scheduler.load_schedules()
    return bell_scheduler

def reload_schedules():
    """Reload semua jadwal"""
    if bell_scheduler:
        bell_scheduler.load_schedules()

def get_scheduler():
    """Get scheduler instance"""
    return bell_scheduler
