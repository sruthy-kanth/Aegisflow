# 🛡️ AegisFlow: Phase 1 Foundation Summary

![AegisFlow Command Preview](C:\Users\sruth\.gemini\antigravity-ide\brain\b5c6a3e9-4c4a-43d6-a13b-f96c3ea7c3e3\aegisflow_command_preview_1792194147063.jpg)

## 📌 Phase 1 Objectives & Achievements

Phase 1 established the mission-critical foundation for **AegisFlow**, a regional early-warning and evacuation-coordination platform for landslide and flash-flood risk in mountain regions.

### 1. Monorepo & Modular Architecture
- Monorepo structure with `/server` (Node.js, Express, MongoDB with Mongoose, Zod, JWT, bcrypt, Helmet, rate-limiting, Pino logging) and `/client` (React, Vite, TanStack Query, Tailwind CSS, Leaflet, react-i18next).
- Configured root [package.json](file:///c:/Users/sruth/OneDrive/Desktop/AegisFlow/package.json), [.env.example](file:///c:/Users/sruth/OneDrive/Desktop/AegisFlow/.env.example), and [README.md](file:///c:/Users/sruth/OneDrive/Desktop/AegisFlow/README.md).

### 2. Role-Based Access Control & Regional Data Isolation
- **SUPERADMIN**: Platform owner managing regions, admins, global rainfall thresholds, sensor API key generation, provider gateways, and audit logs.
- **ADMIN**: Government official strictly scoped to exactly one region (`regionId`). Middleware in [regionScope.js](file:///c:/Users/sruth/OneDrive/Desktop/AegisFlow/server/src/middleware/regionScope.js) denies access with HTTP 403 if an admin attempts to query, mutate, or inspect another region.
- **USER (Household), VOLUNTEER, WARDEN**: Zero-trust architecture. No password login. Authorized via 32+ byte high-entropy cryptographically unguessable URL tokens (`/h/:token`, `/w/:token`, `/v/:token`). Tokens are stored in the database hashed with SHA-256 and are revocable.

### 3. Comprehensive Data Models
All models feature geospatial indexing (`2dsphere`) on GeoJSON Points, LineStrings, and Polygons:
- [Region.js](file:///c:/Users/sruth/OneDrive/Desktop/AegisFlow/server/src/models/Region.js): Bounding coordinates, center location point, emergency contacts, operational settings.
- [User.js](file:///c:/Users/sruth/OneDrive/Desktop/AegisFlow/server/src/models/User.js): Role, password hash, refresh token hash, region assignment.
- [AuditLog.js](file:///c:/Users/sruth/OneDrive/Desktop/AegisFlow/server/src/models/AuditLog.js): Actor, action, entity, before/after states, IP, user-agent.
- [ThresholdConfig.js](file:///c:/Users/sruth/OneDrive/Desktop/AegisFlow/server/src/models/ThresholdConfig.js): Versioned 24h, 72h, and forecast thresholds with bilingual (English & Malayalam) alert templates.
- [Zone.js](file:///c:/Users/sruth/OneDrive/Desktop/AegisFlow/server/src/models/Zone.js): GeoJSON Polygon boundary, centroid, population, slope risk score.
- [Camp.js](file:///c:/Users/sruth/OneDrive/Desktop/AegisFlow/server/src/models/Camp.js): GeoJSON Point, capacity, current occupancy, relief facilities.
- [Route.js](file:///c:/Users/sruth/OneDrive/Desktop/AegisFlow/server/src/models/Route.js): GeoJSON LineString path, status (`clear` / `blocked`), blocked reasons.
- [Household.js](file:///c:/Users/sruth/OneDrive/Desktop/AegisFlow/server/src/models/Household.js): Location point, head name, masked & encrypted phone numbers, vulnerability flags, assigned camp & route, token hash.
- [Volunteer.js](file:///c:/Users/sruth/OneDrive/Desktop/AegisFlow/server/src/models/Volunteer.js): Assigned zone/route, volunteer/warden role, token hash.
- [Sensor.js](file:///c:/Users/sruth/OneDrive/Desktop/AegisFlow/server/src/models/Sensor.js) & [SensorReading.js](file:///c:/Users/sruth/OneDrive/Desktop/AegisFlow/server/src/models/SensorReading.js): Rain/soil telemetry, battery, elevation, device key hash.
- [AlertProposal.js](file:///c:/Users/sruth/OneDrive/Desktop/AegisFlow/server/src/models/AlertProposal.js), [Alert.js](file:///c:/Users/sruth/OneDrive/Desktop/AegisFlow/server/src/models/Alert.js), [Delivery.js](file:///c:/Users/sruth/OneDrive/Desktop/AegisFlow/server/src/models/Delivery.js), [Confirmation.js](file:///c:/Users/sruth/OneDrive/Desktop/AegisFlow/server/src/models/Confirmation.js), [DoorKnockTask.js](file:///c:/Users/sruth/OneDrive/Desktop/AegisFlow/server/src/models/DoorKnockTask.js), [IncidentLog.js](file:///c:/Users/sruth/OneDrive/Desktop/AegisFlow/server/src/models/IncidentLog.js).

### 4. Database Seed Data (Wayanad District, Kerala)
Seeded realistic emergency data:
- **Superadmin**: `superadmin@aegisflow.gov.in` / `SuperAdmin@123!`
- **Demo Region**: Wayanad District (`WYD`), Kerala (Centroid near Kalpetta / Meppadi, emergency control room: `1077`).
- **Regional Admin**: Sri. Arun Kumar IAS (`admin.wayanad@aegisflow.gov.in` / `WayanadAdmin@123!`).
- **3 Realistic Hazard Zones**:
  1. `Meppadi - Chooralmala - Mundakkai Sector` (Extreme steep-slope landslide risk, slope score: 9.2/10)
  2. `Vythiri - Pozhuthana Catchment Sector` (High flash-flood runoff risk, slope score: 7.8/10)
  3. `Mananthavady - Kabini River Basin` (Riverine flood & landslide zone)
- **3 Relief Shelters**: Meppadi Govt Higher Secondary School (capacity: 450), St. Joseph Community Hall (capacity: 300), Vythiri Model Camp (capacity: 350).
- **Evacuation Routes**: Chooralmala PWD Road (Clear), Estate Bypass (Clear), Lower Mundakkai Stream Crossing (Blocked - Debris flow & mud accumulation).
- **3 IoT Telemetry Stations**: Rain Gauge (`SNS-WYD-RAIN-01`), Soil Moisture Probe (`SNS-WYD-SOIL-01`), Vythiri Rain Gauge (`SNS-WYD-RAIN-02`).
- **4 Sample Households**: With hashed tokens and vulnerability records (e.g. bedridden elderly, dialysis patients).
- **Warden & Volunteer**: Token links generated.

### 5. Superadmin Console UI
The frontend features a dark emergency command aesthetic with:
1. **System Health & Telemetry**: Live database status, worker cron job heartbeats (Risk Engine, Escalation Monitor, Sensor Liveness), Open-Meteo weather API ping latency, and messaging dispatch queues.
2. **Regions Management**: View monitored regions, statistics counters (zones, households, camps, sensors), and modal to create new regions with bounding boxes.
3. **Regional Admin Provisioning**: Create regional admins, assign to regions, manage status.
4. **Thresholds & Templates**: View active versioned 24h/72h/forecast thresholds and bilingual alert messages. Modal to publish new versions.
5. **Sensor Registry & Device API Keys**: Register stations, automatically generates 32-byte (64-char) API keys, one-time copy modal.
6. **Messaging & Siren Gateways**: Switch providers (Mock / Twilio / MSG91), physical buzzer webhook endpoint, and interactive "Trigger Test Siren" button.
7. **Platform Audit Log**: Immutable log of every state-changing event with state diff inspection.
8. **Bilingual Toggle**: English and Malayalam (മലയാളം) toggle throughout the platform.
9. **Instant Demo Switcher**: Header buttons to toggle between Superadmin view and Wayanad Admin view.

---

## 🧪 Verification & Test Results
- **Unit Tests (`npm test` in `/server`)**: 10 tests passed (entropy generation, SHA-256 deterministic hashing, phone number masking, AES-256-GCM reversible encryption, role checking, regional data isolation).
- **End-to-End Integration Suite (`tests/e2e.js`)**: All 10 phases passed:
  - Health check: `HTTP 200`
  - Superadmin Login: `Role SUPERADMIN, JWT issued`
  - Regions API: `1 Region (Wayanad District, WYD)`
  - Admins API: `2 Users (Superadmin + Sri. Arun Kumar IAS)`
  - Thresholds API: `Version 1 active`
  - Sensors API: `3 Sensors verified`
  - System Health: `DB Connected, Open-Meteo latency 896ms reachable`
  - Simulated Buzzer Gateway: `HTTP 200 OK`
  - **Regional Scope Isolation**: Regional admin querying another region was **strictly blocked with HTTP 403**.
  - Client Delivery: `Vite index.html HTTP 200 OK`.
