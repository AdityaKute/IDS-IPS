#!/usr/bin/env python
"""
Quick verification script to test all components
"""

import sys
import subprocess
import os
from pathlib import Path

def check_python_version():
    """Verify Python 3.8+"""
    if sys.version_info < (3, 8):
        print("❌ Python 3.8+ required")
        return False
    print(f"✓ Python {sys.version.split()[0]}")
    return True

def check_backend_deps():
    """Check backend dependencies"""
    try:
        import fastapi
        import sqlalchemy
        import jose
        import bcrypt
        print("✓ Backend dependencies installed")
        return True
    except ImportError as e:
        print(f"❌ Missing backend dependency: {e}")
        return False

def check_database():
    """Check database connectivity"""
    try:
        from app.db import engine
        engine.execute("SELECT 1")
        print("✓ Database connected")
        return True
    except Exception as e:
        print(f"❌ Database error: {e}")
        return False

def check_env_files():
    """Check for .env files"""
    backend_env = Path("backend/.env")
    frontend_env = Path("frontend/.env.local")
    
    if backend_env.exists():
        print("✓ backend/.env exists")
    else:
        print("⚠ backend/.env missing (copy from .env.example)")
    
    if frontend_env.exists():
        print("✓ frontend/.env.local exists")
    else:
        print("⚠ frontend/.env.local missing (will use defaults)")
    
    return True

def main():
    print("\n" + "="*50)
    print("  IDS-IPS System Verification")
    print("="*50 + "\n")
    
    checks = [
        ("Python Version", check_python_version),
        ("Backend Dependencies", check_backend_deps),
        ("Environment Files", check_env_files),
        ("Database", check_database),
    ]
    
    passed = 0
    failed = 0
    
    for name, check in checks:
        print(f"\n[*] Checking {name}...")
        try:
            if check():
                passed += 1
            else:
                failed += 1
        except Exception as e:
            print(f"❌ {name}: {e}")
            failed += 1
    
    print("\n" + "="*50)
    print(f"Results: {passed} passed, {failed} failed")
    print("="*50 + "\n")
    
    if failed == 0:
        print("✅ All checks passed!")
        print("\nQuick Start:")
        print("  Backend:  cd backend && python -m uvicorn app.main:app --reload")
        print("  Frontend: cd frontend && npm run dev")
        print("  Agent:    cd agent && python agent_windows.py (as Administrator)")
        return 0
    else:
        print("❌ Some checks failed. See above for details.")
        return 1

if __name__ == "__main__":
    sys.exit(main())
