# Backend (FastAPI)

Important notes for local deployment:

- The backend reads configuration from `.env`. `SECRET_KEY` environment variable **must** be set; the application will fail to start without it.
- The code no longer creates database tables implicitly at startup; use the SQL migration in `migrations/` or your migration tooling.
- CORS is configured to allow the Vite dev server by default. Adjust as needed for production.

Common issue: ModuleNotFoundError: No module named 'app'

- Cause: This happens when Python's module search path doesn't include the `backend/` folder (so `app` package isn't found). It commonly occurs if you run `uvicorn app.main:app` from the repository root without adjusting the working directory or PYTHONPATH.

- Fixes:
  1. Start the backend from the `backend/` directory:
     - PowerShell example:
       & .venv\Scripts\Activate.ps1
       cd backend
       uvicorn app.main:app --reload
  2. Or run from repository root using the module path `backend.app.main`:
     - uvicorn backend.app.main:app --reload
     - (This requires `backend` to be importable from your current PYTHONPATH.)
  3. Use the convenience script `backend/start_backend.ps1` on Windows (it will try to use the repo `.venv` Python):
     - cd backend
     - ./start_backend.ps1

If you still see the error, ensure you're running with the correct Python interpreter (the project's virtual environment) and that your working directory or PYTHONPATH includes `backend/`.

Common endpoints:
- POST `/token` — login (OAuth2 password flow)
- POST `/users/` — register
- GET `/users/me` — returns current user's info (requires auth)
- GET `/alerts` — list alerts (requires auth)
- POST `/alerts/` — create alert (requires auth)
- GET `/rules` — list rules (requires auth)
- POST `/rules` — upsert rule (admin only)
- GET `/processes/recent` — recent process events (requires auth)
- POST `/processes/log` — post process event
- POST `/actions/*` — agent actions (admin only)
