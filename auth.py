"""
Authentication Module
Simple username/password authentication
"""

from functools import wraps
from flask import session, redirect, url_for, request, flash
import hashlib

# Default credentials (ganti ini!)
DEFAULT_USERS = {
    'admin': {
        'password': hashlib.sha256('nopassword'.encode()).hexdigest(),
        'role': 'admin'
    },
    'operator': {
        'password': hashlib.sha256('nopassword'.encode()).hexdigest(),
        'role': 'operator'
    }
}

def hash_password(password):
    """Hash password dengan SHA256"""
    return hashlib.sha256(password.encode()).hexdigest()

def verify_password(username, password):
    """Verifikasi username dan password"""
    if username in DEFAULT_USERS:
        hashed = hash_password(password)
        if DEFAULT_USERS[username]['password'] == hashed:
            return True
    return False

def get_user_role(username):
    """Get user role"""
    if username in DEFAULT_USERS:
        return DEFAULT_USERS[username]['role']
    return None

def login_required(f):
    """Decorator untuk halaman yang perlu login"""
    @wraps(f)
    def decorated_function(*args, **kwargs):
        if 'username' not in session:
            flash('Silakan login terlebih dahulu', 'warning')
            return redirect(url_for('login', next=request.url))
        return f(*args, **kwargs)
    return decorated_function

def admin_required(f):
    """Decorator untuk halaman yang hanya bisa diakses admin"""
    @wraps(f)
    def decorated_function(*args, **kwargs):
        if 'username' not in session:
            flash('Silakan login terlebih dahulu', 'warning')
            return redirect(url_for('login', next=request.url))
        
        if session.get('role') != 'admin':
            flash('Akses ditolak. Hanya admin yang bisa mengakses halaman ini', 'danger')
            return redirect(url_for('index'))
        
        return f(*args, **kwargs)
    return decorated_function