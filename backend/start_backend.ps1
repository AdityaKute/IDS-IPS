# Start the backend (Windows PowerShell convenience script)
# Usage (from repository root):
# & .venv\Scripts\Activate.ps1
# cd backend
# ./start_backend.ps1

Push-Location -Path $PSScriptRoot

# Prefer using the venv Python if present in repository root
$venvPython = Join-Path -Path (Resolve-Path "..\.venv\Scripts\python.exe" -ErrorAction SilentlyContinue) -ChildPath ""
if (-not (Test-Path $venvPython)) {
  Write-Host "Warning: Could not find .venv Python at ../.venv. Falling back to system Python." -ForegroundColor Yellow
  & python -m uvicorn app.main:app --reload --host 127.0.0.1 --port 8000
} else {
  & $venvPython -m uvicorn app.main:app --reload --host 127.0.0.1 --port 8000
}

Pop-Location
