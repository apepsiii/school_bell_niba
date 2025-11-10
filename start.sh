#!/bin/bash

# School Bell System - Startup Script

echo "======================================"
echo "School Bell Management System"
echo "======================================"
echo ""

# Install dependencies
echo "Installing dependencies..."
pip install -r requirements.txt --break-system-packages

# Initialize database if not exists
if [ ! -f "database/school_bell.db" ]; then
    echo "Initializing database..."
    python3 database.py
fi

# Start application
echo ""
echo "Starting School Bell System..."
echo "Access the application at: http://localhost:5000"
echo ""
python3 app.py
