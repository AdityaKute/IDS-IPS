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
- POST `/processes/log` — post process event (agents may authenticate via `X-API-KEY` header)
- POST `/actions/*` — agent actions (admin only or agents with `X-API-KEY`)

Realtime endpoints:
- WebSocket `/realtime/ws/alerts?token=<JWT_or_agent_api_key>` — primary low-latency channel for alerts and commands
- SSE `/realtime/sse/alerts?token=<JWT_or_agent_api_key>` — continuous alert stream (fallback)

Agent registration:
- Admins can register devices via POST `/agents/register` which returns an `api_token` for the agent.
- Agents should store the `api_token` as `X-API-KEY` when calling the API or provide it as the WebSocket token.

Unrecognized & Learning endpoints (admin-only):
- GET `/attack-intel/unrecognized` — list recent unrecognized events
- POST `/attack-intel/unrecognized/{id}/propose` — create a proposal from an unrecognized event
- GET `/attack-intel/proposals` — list auto and admin proposals
- POST `/attack-intel/proposals/{id}/approve` — approve a proposal (creates `AttackType` and `AttackPattern`)
- POST `/attack-intel/learning/run` — manually trigger learning analysis

Additional endpoints:
- POST `/network/log` — post network event (agents may authenticate via `X-API-KEY` header)
- GET `/network/recent` — recent network events
- GET `/audit-logs` — admin-only: list audit logs

Background jobs:
- The backend starts a background daemon that runs `analyze_recent_unrecognized` every 5 minutes to auto-generate proposals from clusters of unrecognized events. For production, replace this lightweight thread with a persistent job runner (Redis / Celery / RQ).

