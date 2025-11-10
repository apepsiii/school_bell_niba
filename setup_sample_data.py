import database

# Initialize database
database.init_db()

print("Database initialized successfully!")
print("\nAdding sample schedules...")

# Sample schedules untuk Senin-Jumat
days = ['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat']

for day in days:
    # Bel Masuk
    database.add_schedule(
        name=f"Bel Masuk - {day}",
        day_of_week=day,
        time="07:00",
        audio_file="sample_bell_in.mp3"
    )
    
    # Bel Istirahat 1
    database.add_schedule(
        name=f"Bel Istirahat 1 - {day}",
        day_of_week=day,
        time="10:00",
        audio_file="sample_bell_break.mp3"
    )
    
    # Bel Masuk Kelas setelah Istirahat 1
    database.add_schedule(
        name=f"Bel Masuk Kelas - {day}",
        day_of_week=day,
        time="10:15",
        audio_file="sample_bell_in.mp3"
    )
    
    # Bel Istirahat 2
    database.add_schedule(
        name=f"Bel Istirahat 2 - {day}",
        day_of_week=day,
        time="12:00",
        audio_file="sample_bell_break.mp3"
    )
    
    # Bel Masuk Kelas setelah Istirahat 2
    database.add_schedule(
        name=f"Bel Masuk Kelas 2 - {day}",
        day_of_week=day,
        time="12:30",
        audio_file="sample_bell_in.mp3"
    )
    
    # Bel Pulang
    database.add_schedule(
        name=f"Bel Pulang - {day}",
        day_of_week=day,
        time="15:00",
        audio_file="sample_bell_home.mp3"
    )

print(f"\nSample schedules added for {', '.join(days)}")

# Add sample audio entries (note: files don't exist yet)
print("\nAdding sample audio entries...")
database.add_audio_file(
    filename="sample_bell_in.mp3",
    display_name="Bel Masuk Kelas",
    file_path="static/audio/sample_bell_in.mp3",
    duration=5.0
)

database.add_audio_file(
    filename="sample_bell_break.mp3",
    display_name="Bel Istirahat",
    file_path="static/audio/sample_bell_break.mp3",
    duration=5.0
)

database.add_audio_file(
    filename="sample_bell_home.mp3",
    display_name="Bel Pulang",
    file_path="static/audio/sample_bell_home.mp3",
    duration=5.0
)

print("Sample audio entries added!")

print("\n" + "="*50)
print("Setup completed successfully!")
print("="*50)
print("\nIMPORTANT:")
print("- Upload actual MP3 files melalui web interface")
print("- Atau copy file MP3 ke folder 'static/audio/'")
print("- File yang ada di sample data:")
print("  * sample_bell_in.mp3")
print("  * sample_bell_break.mp3")
print("  * sample_bell_home.mp3")
print("\nJalankan aplikasi dengan: python app.py")
print("Atau gunakan: ./start.sh (Linux/Mac) atau start.bat (Windows)")
