# 🛡️ AegisFlow: Regional Landslide & Flash-Flood Early-Warning & Evacuation-Coordination Platform

A mission-critical disaster management system built with the **MERN stack** for mountainous regions prone to debris flows, slope failures, and rapid riverine floods (specifically demoed with **Wayanad District, Kerala, India**).

---

## 🏛️ System Architecture & Roles

AegisFlow enforces **strict role boundaries and regional data isolation**:

| Role | Access Pattern | Authority / Scope |
| :--- | :--- | :--- |
| **SUPERADMIN** | Password + JWT (Access + Refresh) | Platform owner. Multi-region governance, global threshold calibrator, sensor key generator, system health, audit logs. |
| **ADMIN** | Password + JWT (Access + Refresh) | District Disaster Management Authority (DDMA) official. **Strictly scoped to exactly one assigned `regionId`** via middleware. Cannot see or touch other regions' records. |
| **USER (Household)** | **No login** (Zero-trust unguessable token `/h/:token`) | 32+ byte cryptographic tokens (stored hashed with SHA-256). Can only view own household data, assigned camp, evacuation routes, and post confirmation. |
| **VOLUNTEER / WARDEN**| **No login** (Unguessable token `/v/:token`, `/w/:token`) | Wardens update route status (clear/blocked); Volunteers manage door-knock verification tasks for vulnerable unconfirmed citizens. |

---

## 📁 Monorepo Structure

```
AegisFlow/
├── server/                     # Express.js + Mongoose Backend
│   ├── src/
│   │   ├── config/             # DB connection, Zod env validation, Pino logger
│   │   ├── controllers/        # Auth, Region, User, Threshold, Sensor, System, Audit
│   │   ├── middleware/         # JWT auth, Role check, Regional data isolation, Tokens, Audit
│   │   ├── models/             # GeoJSON models with 2dsphere indexes (Region, Zone, Camp, Route, Household, etc.)
│   │   ├── routes/             # Modular Express routers
│   │   ├── seed/               # Database seed script for Wayanad demo
│   │   ├── utils/              # Crypto (SHA-256, AES-256-GCM, masking), JWT
│   │   └── server.js           # Server entry point with Helmet, CORS, Rate Limiters
│   ├── tests/                  # Unit tests for token auth and regional scoping
│   └── package.json
├── client/                     # Vite + React Frontend
│   ├── src/
│   │   ├── components/         # Header, StatCards, Modals, Badges
│   │   ├── context/            # AuthContext with demo role switchers
│   │   ├── i18n/               # react-i18next bilingual support (English & Malayalam)
│   │   ├── pages/              # Login, Superadmin Dashboard, Regional Admin View
│   │   └── services/           # Axios API client with automatic token refresh
│   └── package.json
├── .env.example                # Global environment variable documentation
├── package.json                # Root package for workspace orchestration
└── README.md
```

---

## ⚙️ Environment Configuration

Copy `.env.example` to `server/.env`:
```env
PORT=5000
NODE_ENV=development
CLIENT_URL=http://localhost:5173
MONGODB_URI=mongodb://127.0.0.1:27017/aegisflow

JWT_ACCESS_SECRET=aegisflow_super_secret_access_key_change_in_production_min32chars
JWT_REFRESH_SECRET=aegisflow_super_secret_refresh_key_change_in_production_min32chars
JWT_ACCESS_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d

ENCRYPTION_KEY=0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef
OPEN_METEO_BASE_URL=https://api.open-meteo.com/v1/forecast
BUZZER_GATEWAY_URL=http://localhost:5000/api/mock/buzzer

SMS_PROVIDER=mock
VOICE_PROVIDER=mock
```

---

## 🚀 Setup & Execution

### 1. Install Dependencies
```bash
# In server directory:
cd server && npm install

# In client directory:
cd ../client && npm install
```

### 2. Run Database Seeding
Populates Superadmin, Wayanad region, Wayanad DDMA Admin, sample zones (Meppadi, Vythiri, Mananthavady), camps, routes, IoT sensors, and tokenized households:
```bash
cd server
npm run seed
```

### 3. Run Unit Tests
Verifies cryptographic token entropy, SHA-256 deterministic hashing, phone number masking, AES-256-GCM reversible encryption, and role-based regional scoping middleware:
```bash
cd server
npm test
```

### 4. Start Development Servers
Start server and client concurrently or in separate terminals:
```bash
# Start backend on http://localhost:5000:
npm run dev:server

# Start frontend on http://localhost:5173:
npm run dev:client
```

---

## 🔑 Demo Credentials

| Portal / Role | Email | Password | Scope |
| :--- | :--- | :--- | :--- |
| **Superadmin (National)** | `superadmin@aegisflow.gov.in` | `SuperAdmin@123!` | All Regions & System Health |
| **Wayanad Admin (DDMA)** | `admin.wayanad@aegisflow.gov.in` | `WayanadAdmin@123!` | Scoped to Wayanad District (`WYD`) |

*Tip: The Login page contains **one-click autofill buttons** to instantly test either role, and the top navigation bar includes an instant **Demo View Switcher**.*

---

## 🌐 Bilingual Support (English & Malayalam)
AegisFlow features full native support for **Malayalam (മലയാളം)** and **English**, critical for local disaster coordination in Kerala's Western Ghats. Toggle anytime in the top bar.

---

## 📈 Roadmap & Phases
- **Phase 1 (Completed)**: Monorepo setup, auth, roles, regional data isolation middleware, superadmin console (Regions, Admins, Thresholds, Sensor Keys, System Health, Audit Log), Wayanad seed data, and unit tests.
- **Phase 2 (Upcoming)**: Core data & Risk Engine (Open-Meteo 72h + 24h forecast ingestion, cumulative rainfall computing, confidence component scoring, interactive Leaflet zone map).
- **Phase 3 (Upcoming)**: Human-approved alert flow, proposals, time-boxed escalation, delivery fan-out, tokenized mobile-first household pages, door-knock task dispatch for volunteers.
- **Phase 4 (Upcoming)**: IoT sensor ingestion endpoint (`/api/ingest/readings`), simulator scripts, incident logs, reports.
