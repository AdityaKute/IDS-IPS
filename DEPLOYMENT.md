# IDS/IPS Security System - Complete Implementation Guide

## System Overview

This is a comprehensive Intrusion Detection System (IDS) and Intrusion Prevention System (IPS) with:
- Real-time threat detection and prevention
- Live dashboard with WebSocket/SSE updates
- Automated threat response
- Machine learning-based unknown threat analysis
- RBAC (Role-Based Access Control)
- Complete audit logging

## Architecture

```
Agent (Windows) → Backend API → Database → Frontend
     ↓                  ↓           ↓           ↓
  Monitors        Threat Engine  Storage    Real-time UI
  Processes       IPS Actions    Analytics  RBAC
  Network         WebSocket/SSE
  Files
```

## Prerequisites

- **Python 3.8+**
- **Node.js 16+**
- **MySQL 8.0+** (or compatible)
- **Windows Agent** (for agent component)

## Quick Start

### 1. Backend Setup

```bash
cd backend

# Create Python virtual environment
python -m venv venv
.\venv\Scripts\activate  # Windows
# or: source venv/bin/activate  # Linux/Mac

# Install dependencies
pip install -r requirements.txt

# Configure environment
cp .env.example .env
# Edit .env with your database credentials

# Initialize database
python -c "from app.db import Base, engine; Base.metadata.create_all(engine)"

# Seed threat database with known patterns
python initial_threat_db.py

# Run backend
python -m uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

### 2. Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Configure API base URL in .env.local
echo "VITE_API_BASE=http://localhost:8000" > .env.local

# Run development server
npm run dev

# Open browser: http://localhost:5173
```

### 3. Windows Agent Setup

```bash
cd agent

# Install Python dependencies
pip install -r requirements.txt

# Configure agent
# Edit agent_windows.py with your backend API URL

# Run agent (as Administrator)
python agent_windows.py
```

## Database Setup

### Create Database (MySQL)

```sql
CREATE DATABASE ids_ips_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE ids_ips_db;

-- Run migrations
-- See migrations/ folder for schema
```

### Initialize Roles and Admin User

```python
python -c "
from backend.app.db import SessionLocal
from backend.app import models, crud, auth
from backend.app.schemas import UserCreate, RoleCreate

db = SessionLocal()

# Create roles
admin_role = models.Role(name='Admin', description='Administrator')
user_role = models.Role(name='Member', description='Regular user')
db.add(admin_role)
db.add(user_role)
db.commit()

# Create admin user
admin_user = models.User(
    email='admin@example.com',
    password_hash=auth.hash_password('admin123'),
    role_id=admin_role.id,
    is_active=True
)
db.add(admin_user)
db.commit()

print('Admin user created: admin@example.com / admin123')
"
```

## System Features

### 1. Real-Time Threat Detection

**Automatic Detection:**
- Port scanning attempts
- Brute force login attacks
- DDoS patterns
- SQL injection
- Malware execution
- Suspicious process spawning
- Data exfiltration
- Privilege escalation attempts

**Detection Flow:**
```
Agent monitors → Event logged → Pattern matched → Alert created 
   → Auto-response → Dashboard updated (WebSocket/SSE)
```

### 2. Automated IPS Actions

When a threat is detected, the system can automatically:

- **Kill Process**: Terminate malicious process
- **Block IP**: Add to firewall blocklist
- **Block Port**: Prevent network communication
- **Quarantine File**: Move to isolated location
- **Stop Service**: Disable compromised service

**Example automatic action for malware detection:**
```
Malware Pattern Match → Alert Created → Kill Process (background thread)
  → Audit Log Entry → Notify Dashboard
```

### 3. Unknown Threat Learning

**For unrecognized events:**
1. Event captured and analyzed
2. Behavioral heuristics applied (high CPU, suspicious cmdline, etc.)
3. Severity assigned
4. Stored in `unrecognized_attacks` table
5. Periodic learning job analyzes patterns
6. Proposals generated for admin review
7. Admin approves → Added to threat database
8. Future similar events detected automatically

**Learning Flow:**
```
Unrecognized Event → Heuristic Analysis → Store as PENDING 
   → Admin Review → Approve → Pattern Created 
   → Future Events → Auto-detected
```

### 4. User Management & RBAC

**Admin Features:**
- Register new employees
- Assign roles (Admin/Member)
- Enable/disable monitoring
- View organization-wide analytics
- Configure threat patterns
- Review alerts & proposals
- Execute manual response actions

**Employee (Member) Features:**
- View their own activity
- See alerts related to their account
- Cannot access other users' data
- Cannot modify system configuration

**Login:**
```
POST /token
{
  "username": "admin@example.com",
  "password": "password"
}
```

### 5. Live Dashboard

**Real-Time Updates:**
- WebSocket/SSE for live alert stream
- Process events
- Network connections
- Unrecognized threats
- Statistics refresh every 5 seconds

**Dashboard Sections:**
- Quick Stats (Intrusions, Threats, False Positives, Connections)
- Threat Activity Chart (7-day trend)
- Network Traffic Pie Chart
- Top Attacks List
- Recent Intrusions Table

### 6. Audit & Compliance

Every action logged:
- User login/logout
- Resource access
- Configuration changes
- Automated response actions
- Threat detections
- Pattern approvals

**Audit Log Entry:**
```python
{
  "action_type": "detection.matched",
  "actor": "detection_engine",
  "target": "process_id_1234",
  "details": { "process_name": "cmd.exe", "severity": "HIGH" },
  "timestamp": "2024-01-29T10:30:00Z"
}
```

## API Endpoints

### Authentication
- `POST /token` - Login and get JWT token

### Monitoring Data
- `GET /processes/recent` - Get recent process events
- `POST /processes/log` - Log process event (from agent)
- `GET /network/recent` - Get recent network events
- `POST /network/log` - Log network event (from agent)
- `GET /alerts` - Get all alerts
- `POST /alerts` - Create alert

### Threat Intelligence
- `GET /attack-intel/types` - List threat types
- `POST /attack-intel/types` - Create threat type
- `GET /attack-intel/patterns` - List attack patterns
- `POST /attack-intel/patterns` - Create pattern
- `GET /attack-intel/unrecognized` - List unknown threats
- `POST /attack-intel/unrecognized/{id}/propose` - Generate proposal
- `GET /attack-intel/proposals` - List proposals
- `POST /attack-intel/proposals/{id}/approve` - Approve & activate pattern

### User Management (Admin Only)
- `POST /users` - Create user
- `GET /users` - List all users
- `GET /users/me` - Get current user info

### Threat Reporting
- `GET /threats/statistics` - 24h threat stats
- `GET /threats/active` - Active high/critical threats
- `GET /threats/trending` - Trending attack types
- `POST /threats/respond/{alert_id}` - Manual threat response

### Real-Time
- `GET /realtime/sse/alerts?token={jwt}` - SSE stream (alerts, unrecognized, network)
- `WS /realtime/ws/alerts?token={jwt}` - WebSocket stream

### Audit
- `GET /audit-logs` - Get audit logs

## Configuration

### Backend (.env)

```dotenv
# Database
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=yourpassword
DB_NAME=ids_ips_db
DATABASE_URL=mysql+pymysql://root:yourpassword@localhost:3306/ids_ips_db

# Security
SECRET_KEY=your-super-secret-key-change-this
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=60

# Logging
LOG_LEVEL=INFO
```

### Frontend (.env.local)

```
VITE_API_BASE=http://localhost:8000
```

### Agent (agent_windows.py)

```python
BACKEND_URL = "http://localhost:8000"
API_KEY = "your-agent-api-key"  # For agent authentication
```

## Deployment

### Production Backend

```bash
# Install gunicorn
pip install gunicorn

# Run with production ASGI server
gunicorn app.main:app --workers 4 --worker-class uvicorn.workers.UvicornWorker --bind 0.0.0.0:8000

# Or behind Nginx reverse proxy
```

**Nginx Configuration:**
```nginx
server {
    listen 80;
    server_name yourdomain.com;

    location / {
        proxy_pass http://127.0.0.1:8000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # WebSocket support
    location /realtime/ws {
        proxy_pass http://127.0.0.1:8000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
    }
}
```

### Production Frontend

```bash
# Build for production
npm run build

# Serve dist folder with web server (nginx, apache, etc.)
# Or use static hosting (S3, Netlify, Vercel, etc.)
```

### Windows Agent Deployment

```powershell
# Create scheduled task for automatic agent startup
$action = New-ScheduledTaskAction -Execute "python.exe" -Argument "C:\path\to\agent_windows.py"
$trigger = New-ScheduledTaskTrigger -AtStartup
Register-ScheduledTask -Action $action -Trigger $trigger -TaskName "IDS-IPS-Agent" -RunLevel Highest
```

## Security Checklist

- [ ] Change `SECRET_KEY` in .env to a strong random value
- [ ] Use HTTPS/TLS in production (not HTTP)
- [ ] Enable firewall rules on backend server
- [ ] Use strong database passwords
- [ ] Enable database encryption
- [ ] Use VPN/private network for agent-backend communication
- [ ] Enable CORS properly (not `*` in production)
- [ ] Regular database backups
- [ ] Rotate API keys periodically
- [ ] Monitor audit logs for suspicious activity
- [ ] Use environment variables for all secrets
- [ ] Enable rate limiting on API endpoints
- [ ] Implement 2FA for admin accounts
- [ ] Use signed/verified agent connections

## Troubleshooting

### Backend Won't Start
```bash
# Check dependencies
pip list | grep -i fastapi

# Check database connection
python -c "from app.db import engine; print(engine.execute('SELECT 1'))"

# Check logs
python -m uvicorn app.main:app --reload
```

### Frontend Blank/Not Loading
```bash
# Check API connectivity
curl http://localhost:8000

# Check browser console for CORS errors
# Check VITE_API_BASE variable
echo $VITE_API_BASE
```

### Agent Not Reporting Events
```powershell
# Check network connectivity
Test-NetConnection -ComputerName localhost -Port 8000

# Run agent in foreground to see errors
python agent_windows.py
```

### SSE/WebSocket Not Working
```javascript
// Check browser network tab
// Should see EventSource or WebSocket connection
// Check backend logs for connection errors
```

## Performance Optimization

1. **Database Indexing:** Add indexes on frequently queried columns
2. **Caching:** Implement Redis for threat patterns cache
3. **Event Batching:** Batch multiple events before database insert
4. **Connection Pooling:** Configure SQLAlchemy pool size
5. **Frontend Pagination:** Implement table pagination
6. **Alert Deduplication:** Don't alert on identical threats within timeframe

## Monitoring & Maintenance

**Daily Tasks:**
- Check active high/critical alerts
- Review audit logs
- Verify agent connectivity
- Monitor system resources

**Weekly Tasks:**
- Review threat trends
- Check false positive rate
- Update threat patterns
- Backup database

**Monthly Tasks:**
- Review user access logs
- Update attack patterns from threat intel
- Performance analysis
- Security audit

## Support & Documentation

- API docs (when running): http://localhost:8000/docs
- Database schema: See `backend/migrations/`
- Agent source: `agent/agent_windows.py`
- Frontend components: `frontend/src/pages/`

## License

Proprietary - Internal Use Only
