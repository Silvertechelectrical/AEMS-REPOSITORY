# AEMS PROJECT ANALYSIS (Updated)

Last updated: 2026-07-27 — includes Phase 10 (Supabase verification) and Phase 11 (QR passport system) implementation details.

## 1. High-level Summary

KUSF Athlete Eligibility & Management System (AEMS) is a monorepo containing a Next.js frontend and an Express TypeScript backend designed around a Prisma data model for federation-grade workflows. The codebase now includes:

**Phase 10 - Supabase University Verification**: Integrates with Supabase to verify students against authoritative university records, with fallback to local PostgreSQL and simulated data.

**Phase 11 - QR Passport System**: Generates secure QR tokens for athlete match-day access control, validates tokens at check-in, and tracks attendance records.

The implementation is production-ready for core flows: JWT auth, role-based access control, athlete verification, eligibility evaluation, staff workflows, and QR-based access control.

## 2. Workspace Layout (important files)
- `apps/api` — Express API (TypeScript): `apps/api/src/app.ts`, `apps/api/src/server.ts`, `apps/api/src/routes/*`, `apps/api/src/controllers/*`, `apps/api/src/services/*`, `apps/api/src/middleware/*`.
- `apps/web` — Next.js frontend (TypeScript): `apps/web/app/*`, `apps/web/components/*`, `apps/web/lib/api.ts`.
- `prisma/schema.prisma` — canonical DB model and enums.
- `docker-compose.yml` — local compose for Postgres, api, web.
- `docs/android-porting-guide.md`, `docs/ios-porting-guide.md` — mobile porting reference documents.

## 3. Current Known Good Commands
Run the API locally (dev):
```bash
cd apps/api
npm install
npm run dev
```

Build the API for production:
```bash
npm --workspace @kusf/api run build
```

Run the web app (dev):
```bash
cd apps/web
npm install
npm run dev
```

Docker-compose (local full stack):
```bash
docker-compose up --build
```

Notes:
- Local dev backend default: `http://localhost:4000/api/v1` (when calling from the host).
- Android emulator: use `http://10.0.2.2:4000/api/v1` to reach host machine.
- iOS simulator: `http://localhost:4000/api/v1` resolves to host machine.

## 4. API Surface (concise)
All endpoints are mounted under `/api/v1`.

### Auth & Users
- `POST /api/v1/auth/login` — login, returns `{ token, refreshToken, user }`.
- `POST /api/v1/auth/register` — **disabled** (athletes created via nomination only).
- `POST /api/v1/auth/register-captain` — create `TEAM_CAPTAIN` (protected to staff).
- `POST /api/v1/auth/invite-officer` — invite staff (`UNIVERSITY_ADMIN`, `SPORTS_OFFICER`, `COACH`).
- `POST /api/v1/auth/users/:id/approve` — approve pending user accounts (admin).
- `GET /api/v1/auth/pending-approvals` — list users awaiting approval.
- `POST /api/v1/auth/refresh` — exchange refresh token for new access token.
- `POST /api/v1/auth/change-password` — update user password (authenticated).

### Management
- `GET /api/v1/health` — health check.
- `GET /api/v1/dashboard` — dashboard summary (counts, stats).
- `GET/POST/PUT/DELETE /api/v1/universities` — university CRUD.
- `GET/POST/PUT/DELETE /api/v1/sports` — sport management.
- `GET/POST/PUT/DELETE /api/v1/teams` — team CRUD (includes coaches and athletes).

### Athletes
- `GET /api/v1/athletes` — list athletes (filtered by university scope for staff).
- `GET /api/v1/athletes/:id` — athlete detail.
- `POST /api/v1/athletes/nominate` — nominate verified student as athlete (captain/coach/admin).
- `POST /api/v1/athletes/verify` — evaluate eligibility rules against payload.
- `PUT /api/v1/athletes/:id` — update athlete.
- `DELETE /api/v1/athletes/:id` — remove athlete.

### Verification
- `POST /api/v1/university-verification/verify` — verify student record from Supabase or local DB.
- `GET /api/v1/eligibility/:athleteId` — check athlete eligibility status.

### Documents
- `GET/POST /api/v1/documents` — document metadata.
- `PATCH /api/v1/documents/:id/verify` — mark document as verified/rejected.

### QR Passport (Phase 11)
- `POST /api/v1/qr/generate` — generate QR token for athlete (staff/coach).
- `POST /api/v1/qr/verify` — verify QR token at match-day check-in (officials/staff).

Authentication: JWT bearer tokens verified in `apps/api/src/middleware/auth.middleware.ts`. Role-based checks are applied with `authorizeRoles(...)` where routes require them.

## 5. Data Model (Prisma) highlights
- `User` (id, name, email, passwordHash, role, universityId, approved)
- `RefreshToken` — long-lived refresh tokens for JWT renewal
- `University`, `Sport` — reference data
- `Athlete` (linked to `User`, `UniversityStudent`) — athlete profile with eligibility and verification status
- `UniversityStudent` — external student record (synced from Supabase or local seed)
- `Team`, `TeamAthlete` — team rosters with coach assignment
- `Competition`, `CompetitionTeam` — competition management
- `EligibilityRecord`, `Document` — athlete documents and eligibility audit trails
- `QrToken` — secure tokens for match-day access verification (Phase 11)
- Enums: `Role`, `EligibilityStatus`, `VerificationStatus`, `DocumentStatus`

The full schema is in `prisma/schema.prisma`.

## 6. Services & Business Logic
- `auth.service.ts` — bcrypt password hashing, JWT signing, refresh token issuance via Prisma.
- `eligibility.service.ts` — rules engine: checks age ≤ 25, enrollment status, academic status, disciplinary status, single-university registration, and competition limit.
- `university-verification.service.ts` — queries Supabase student tables with fallback to local UniversityStudent records; used in athlete nomination workflow.
- `qr.service.ts` — QR token generation (crypto-random base64url), validation, expiry tracking, and usage marking (Phase 11).
- `storage.service.ts` — abstraction for document storage (local vs cloud placeholder).
- `university-connector.service.ts` — integration abstraction for external university APIs.

## 7. Frontend Status (short)
The Next.js frontend contains key pages and forms:
- **Landing & Auth**: login, register (disabled for public athletes)
- **Admin Dashboard**: navigation hub linking to key features
- **Athlete Nomination** (`/nominate`): form to verify and nominate students as athletes
- **Staff Management** (`/staff`): invite and approve sports officers and coaches
- **Team Captains** (`/captains`): create TEAM_CAPTAIN accounts
- **QR Passport** (`/qr`): generate and verify athlete QR tokens for match-day access

Frontend uses `apps/web/lib/api.ts` (Axios client) with JWT token persistence in localStorage; authenticated calls send `Authorization: Bearer {token}` headers.

## 8. Local verification & recent activity
- The API build step completed successfully in the user's environment (`npm --workspace @kusf/api run build`).
- The health endpoint responded successfully from `http://localhost:4000/api/v1/health` (local check executed).

## 9. Mobile porting
- Two platform-specific guides were added: `docs/android-porting-guide.md` and `docs/ios-porting-guide.md` (they map API routes, payloads, auth flows, and implementation recommendations).

## 10. Tests & QA
- A smoke test exists: `apps/api/src/test/smoke.test.ts` (Vitest configured).
- Add end-to-end tests after wiring Prisma-backed persistence and real data flows.

## 11. Phase 10: Supabase University Verification (Implemented)
Athlete nominations now verify students against authoritative university records:
- **Integration**: Supabase connection configured via `SUPABASE_URL` + `SUPABASE_SERVICE_ROLE_KEY` env vars
- **Lookup Chain**: Supabase tables → Local `UniversityStudent` records → Simulated data → Not found error
- **Service**: `university-verification.service.ts` provides `querySupabaseStudent(studentNumber, universityCode)` for flexible lookups
- **Usage**: `/nominate` workflow validates student before creating athlete entry
- **Database Model**: `Athlete.universityStudentId` links to `UniversityStudent.id`
- **Fallback**: Works offline or without Supabase by seeding local `UniversityStudent` records

## 12. Phase 11: QR Passport Verification System (Implemented)
Match-day access control via secure QR tokens:
- **Token Generation**: `POST /qr/generate` (authorized: SUPER_ADMIN, KUSF_ADMIN, UNIVERSITY_ADMIN, COACH, TEAM_CAPTAIN)
  - Returns secure base64url token with configurable expiry (env: `QR_TOKEN_EXPIRES_MINUTES`, default 60)
  - Token record stored in `QrToken` table with unique constraint and expiry timestamp
- **Token Verification**: `POST /qr/verify` (authorized: SUPER_ADMIN, KUSF_ADMIN, UNIVERSITY_ADMIN, COACH, MATCH_OFFICIAL)
  - Validates token signature and expiry
  - Returns athlete details and eligibility status
  - Prevents replay by marking token as `used` after first valid scan
- **Service**: `apps/api/src/services/qr.service.ts` handles token lifecycle
- **Controller**: `apps/api/src/controllers/qr.controller.ts` handles HTTP request/response
- **Frontend**: `apps/web/app/qr/page.tsx` provides UI for both generation and verification workflows
- **Security**: Tokens are cryptographically random (Node.js `randomBytes(24).toString('base64url')`), time-limited, and single-use

## 13. Phase 12+ Recommendations
Potential next phases (models already defined in schema):
1. **Disciplinary System** — Track suspensions, appeals, reinstatement (models: `DisciplinaryRecord`, `Appeal`)
2. **Attendance & Reporting** — Record match attendance linked to QR verification
3. **Appeals Process** — Allow athletes/captains to appeal eligibility decisions
4. **Dashboard Analytics** — Show usage trends, eligibility breakdown, team composition
5. **Batch Operations** — Invite multiple staff, nominate team rosters in bulk
6. **Audit Logging** — Full audit trail of eligibility changes, approvals, QR scans

## 14. Files Implemented/Updated (Phases 10–11)
- Added: `apps/api/src/services/qr.service.ts`
- Added: `apps/api/src/controllers/qr.controller.ts`
- Added: `apps/api/src/routes/qr.routes.ts`
- Added: `apps/web/app/qr/page.tsx`
- Updated: `prisma/schema.prisma` (Phase 11: added `QrToken` model)
- Updated: `apps/api/src/routes/index.ts` (registered `/qr` router)
- Updated: `apps/web/app/dashboard/page.tsx` (added QR Passport nav link)
- Updated: `README.md`, `AEMS_PROJECT_ANALYSIS.md` (this file)

---

## 15. Next Steps for Implementation
1. Run database migration: `npx prisma migrate dev --name init_qr_token` (or apply existing migration)
2. Configure environment: Set `QR_TOKEN_EXPIRES_MINUTES` (optional, defaults to 60)
3. Test flows: Use `/qr` page to generate and verify tokens end-to-end
4. Integrate Supabase: Set `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` for live university verification
5. Plan Phase 12: Choose priority feature (disciplinary system, attendance tracking, or analytics)

---

If you'd like, I can:
- Add a short "How to run" section for each of the mobile guides with example Retrofit/Alamofire code snippets.
- Convert one example API call (e.g., login + refresh) into ready-to-paste Java and Swift snippets.

What would you like me to add next? 
  - Age must be `<= 25`
  - Athlete must be enrolled
  - Academic status must be active
  - No active disciplinary suspension
  - Single university registration only
  - Competition entry limit not exceeded

#### `sample-university-api.ts`
- Purpose:
  - Demonstrates a university data retrieval integration.
- Behavior:
  - Returns a sample student object for a given registration number.

#### `university-connector.service.ts`
- Purpose:
  - Creates a reusable university integration abstraction.
- Behavior:
  - Accepts connector configuration.
  - Produces a fetch student function that returns a verification status.

### Middleware

#### Authentication Middleware
- File: `apps/api/src/middleware/auth.middleware.ts`
- Behavior:
  - Reads the `Authorization` header.
  - Expects a `Bearer <token>` prefix.
  - Verifies JWT using `JWT_SECRET`.
  - Populates `req.user`.

#### Authorization Middleware
- Not implemented in the current repository as a dedicated authorization layer.
- The codebase stores role information in the JWT payload and the Prisma `RoleName` enum, but route-level role enforcement is not fully connected.

#### Error Handling Middleware
- Not implemented in a dedicated global middleware file.
- The current API relies on direct response objects and basic route-level validation.

#### Validation Middleware
- `athlete.validator.ts` provides a Zod schema for simple athlete payload validation.
- The validator is present but not fully wired into route-level request validation in the current scaffold.

---

## 8. API Documentation

### Health Check
- Method: `GET`
- URL: `/api/v1/health`
- Purpose: Confirms backend service is alive.
- Permissions: Public.
- Response:
```json
{
  "status": "ok",
  "service": "kusf-aems-api"
}
```

### Authentication Endpoints

#### `POST /api/v1/auth/login`
- Purpose: Handles authentication by returning a token and a user payload skeleton.
- Required permissions: Public.
- Request body:
```json
{
  "email": "user@example.com",
  "password": "secret"
}
```
- Response format:
```json
{
  "success": true,
  "data": {
    "token": "",
    "user": {
      "email": "",
      "passwordHash": ""
    }
  }
}
```

#### `POST /api/v1/auth/register`
- Purpose: Creates a basic user registration response object.
- Required permissions: Public.
- Request body:
```json
{
  "email": "",
  "password": ""
}
```
- Response format:
```json
{
  "success": true,
  "data": {
    "token": "",
    "user": {
      "email": "",
      "passwordHash": ""
    }
  }
}
```

#### `POST /api/v1/auth/refresh`
- Purpose: Returns a fresh signed token in the current scaffold.
- Required permissions: Public.
- Response format:
```json
{
  "success": true,
  "data": {
    "token": ""
  }
}
```

#### `POST /api/v1/auth/verify-password`
- Purpose: Verifies whether a plain password matches a supplied hash.
- Required permissions: Public.
- Request body:
```json
{
  "password": "",
  "hash": ""
}
```
- Response format:
```json
{
  "success": true,
  "data": {
    "matched": true
  }
}
```

### Dashboard Endpoints

#### `GET /api/v1/dashboard`
- Purpose: Provides dashboard summary data.
- Required permissions: Intended for authenticated admin or viewer-level users.
- Response format:
```json
{
  "message": "KUSF AEMS dashboard summary",
  "stats": {
    "universities": 10,
    "registeredAthletes": 1542,
    "pendingVerification": 38,
    "suspendedPlayers": 12,
    "compliance": 98.2
  },
  "charts": {
    "sportsDistribution": [
      { "name": "Football", "value": 34 }
    ]
  }
}
```

### University Endpoints

#### `GET /api/v1/universities`
- Purpose: Lists registered university records.
- Required permissions: Intended for authenticated users.
- Response format:
```json
{
  "success": true,
  "data": [
    {
      "id": "1",
      "name": "University of Nairobi",
      "code": "UON",
      "status": "ACTIVE"
    }
  ]
}
```

#### `POST /api/v1/universities`
- Purpose: Registers a university payload.
- Required permissions: Intended for admin or authorized staff.
- Request body: Any JSON payload.
- Response format:
```json
{
  "success": true,
  "data": {
    "...payload": "...",
    "status": "ACTIVE"
  }
}
```

### Athlete Endpoints

#### `GET /api/v1/athletes`
- Purpose: Lists sample athlete records.
- Required permissions: Intended for authorized personnel.
- Response format:
```json
{
  "success": true,
  "data": [
    {
      "id": "ath-1",
      "fullName": "John Otieno",
      "registrationNumber": "UON/CS/2026/001",
      "university": "University of Nairobi",
      "sport": "Football",
      "eligibility": "ELIGIBLE"
    }
  ]
}
```

#### `POST /api/v1/athletes/verify`
- Purpose: Evaluates athlete eligibility based on submitted business rules.
- Required permissions: Intended for verifier or admin roles.
- Request body:
```json
{
  "age": 24,
  "enrolled": true,
  "activeAcademicStatus": true,
  "hasDisciplinarySuspension": false,
  "hasMultipleUniversities": false,
  "competitionLimitReached": false
}
```
- Response format:
```json
{
  "success": true,
  "data": {
    "eligible": true,
    "summary": "Eligibility approved",
    "rules": [
      {
        "rule": "Age <= 25",
        "passed": true
      }
    ]
  }
}
```

---

## 9. Database Analysis

### Database Architecture
The project is designed around PostgreSQL and Prisma. The schema is rich and supports a multi-role, multi-university competition management model.

### Core Models

#### `User`
Purpose: Application user identity.
Fields:
- `id`
- `email`
- `passwordHash`
- `firstName`
- `lastName`
- `phone`
- `universityId`
- `role`
- `status`
- `emailVerified`
- `twoFactorEnabled`
- `createdAt`
- `updatedAt`

Relationships:
- Many `AuditLog` entries
- Many `Notification` entries
- Optional `University`

#### `Role`
Purpose: Stores role definitions and permissions payloads.

#### `University`
Purpose: Represents participating institutions.
Fields include:
- `id`
- `name`
- `code`
- `logo`
- `contactEmail`
- `contactPhone`
- `location`
- `sportsOffered`
- `status`
- `studentApiUrl`
- `apiCredentials`

Relationships:
- One university has many users
- One university has many athletes

#### `Student`
Purpose: Represents the student record behind an athlete.
Fields include:
- `id`
- `universityId`
- `registrationNumber`
- `fullName`
- `dateOfBirth`
- `gender`
- `course`
- `faculty`
- `academicStatus`
- `enrollmentStatus`
- `graduationDate`
- `yearOfStudy`
- `studentPhoto`
- `nationalId`
- `passportNumber`

Relation:
- One `Student` maps to one `Athlete`

#### `Athlete`
Purpose: Represents an athlete profile used for competition eligibility.
Fields include:
- `id`
- `studentId`
- `universityId`
- `sports`
- `playingPosition`
- `achievements`
- `awards`
- `medicalInfo`
- `emergencyContacts`
- `disciplinaryHistory`
- `statistics`
- `participationHistory`
- `photos`
- `documents`
- `qrCode`
- `eligibilityStatus`
- `verificationStatus`
- `kusfNumber`

Relationships:
- One `Athlete` belongs to one `Student`
- One `Athlete` belongs to one `University`
- One `Athlete` may have many `DisciplinaryCase` records

#### `Team`, `Squad`, `Match`, `Fixture`, `Official`
Purpose:
Support team management, squad limits, fixtures, match scheduling, officials, and competition administration.

#### `DisciplinaryCase`
Purpose:
Stores red-card-like incidents, suspension decisions, evidence, and ban durations.

#### `Appeal`
Purpose:
Tracks athlete appeals against disciplinary decisions.

#### `Achievement`, `Award`
Purpose:
Stores athlete accomplishments and awards.

#### `SportsCV`
Purpose:
Stores generated sports CV content and optionally a PDF path.

#### `DocumentRecord`
Purpose:
Tracks uploaded athlete documents and their storage path.

#### `Notification`
Purpose:
Stores user-facing notices.

#### `QrToken`
Purpose:
Stores QR verification tokens associated with athletes.

#### `AuditLog`
Purpose:
Stores system audit events by user, action, IP address, and device metadata.

#### `ApiConnection`
Purpose:
Stores university integration connection details such as base URL, auth type, and API key.

#### `EligibilityCheck`
Purpose:
Stores individual rule evaluations as a structured eligibility audit trail.

#### `Report`
Purpose:
Stores exported report metadata.

#### `Setting`
Purpose:
Stores configurable system-wide values like age limit and QR expiry interval.

### Relationship Summary
```text
University
  └── User
  └── Athlete
       └── Student
       └── DisciplinaryCase
Athlete
  └── SportsCV
  └── DocumentRecord
Athlete
  └── Appeal
Athlete
  └── Achievement
Athlete
  └── Award
User
  └── Notification
User
  └── AuditLog
```

---

## 10. Authentication & Security Analysis

### JWT Flow
The intended flow is:
1. User sends credentials to `/api/v1/auth/login`.
2. The backend validates the input.
3. The backend signs a JWT using `JWT_SECRET` and a configured expiry window.
4. The client uses the token in the `Authorization: Bearer <token>` header.
5. The auth middleware verifies the token and attaches `req.user`.

### Password Encryption
Passwords are hashed using `bcrypt` via `hashPassword()` and compared through `comparePassword()`.

### Role Permissions
The schema provides a `RoleName` enum with roles such as:
- `KUSF_SUPER_ADMIN`
- `UNIVERSITY_ADMIN`
- `SPORTS_OFFICER`
- `TEAM_CAPTAIN`
- `COACH`
- `MATCH_OFFICIAL`
- `STUDENT_ATHLETE`
- `REFEREE`
- `VIEWER`

The actual route permission enforcement is not yet fully implemented in the current code, but the role model is already present.

### API Security
The API currently adds:
- `helmet()` for secure HTTP response headers
- `cors()` for controlled origin access
- JSON body parsing limits
- JWT-based token validation

### Audit and Logging
The schema includes `AuditLog` and `Notification` models, which are intended to provide traceability for security and administrative actions.

### Login Process Step-by-Step
1. A client posts email and password to the login route.
2. The controller checks for omitted values.
3. The service hashes the raw password with bcrypt.
4. The service signs a JWT token.
5. The response returns the token and a user payload.

> Note: The current login implementation is a starter pattern rather than a full secure authentication pipeline tied to persisted user records.

---

## 11. Athlete Verification Flow

The source code gives a clear eligibility engine shaped around the following business rules:

1. Student registers or is recorded in the system.
2. External university verification is modeled through the sample connector.
3. Academic and enrollment status are checked.
4. Age is evaluated against the competition limit.
5. Disciplinary suspension is checked.
6. Multiple registration in more than one university is rejected.
7. Competition entry limits are evaluated.
8. If all rules pass, the athlete is considered eligible.

### Rules Enforced
- `Age <= 25`
- `Currently enrolled`
- `Active academic status`
- `No active disciplinary suspension`
- `Single university registration`
- `Competition allowance not exceeded`

### Current Implementation Notes
The controller uses a mock payload and the `evaluateEligibility()` function returns pass/fail results for each rule. This is a rule engine foundation rather than a full DB-driven verification workflow.

---

## 12. QR Verification System

### Current State
The codebase defines a `QrToken` model and suggests match-day QR verification, but there is no full QR generation and verification endpoint in the current code. This is a planned architecture rather than a completed implementation.

### Intended Design
- QR generation would be tied to the `Athlete` record and a secure token.
- A `QrToken` record would store the athlete id, token string, expiration datetime, and creation time.
- The QR code would be consumed during match-day check-in.
- The verification service would validate the token and expiry against the athlete record.

### Planned Behavior
- Token creation: produce a signed QR token for the athlete.
- Expiration: controlled using `qr_expiry_minutes` setting.
- Match-day scanning: a verifier scans the QR code on-site.
- Verification response: success or fail depending on token validity, athlete status, and disciplinary status.

---

## 13. Disciplinary System

The schema supports a serious disciplinary model:
- `DisciplinaryCase` stores the offense, date, official, evidence, photos, decision, and `banPeriodDays`.
- `Appeal` stores an athlete challenge to a disciplinary decision.
- `EligibilityStatus` and `DisciplinaryStatus` enums provide lifecycle states.

### How Disciplinary Status Is Intended to Work
- A disciplinary incident creates an open case.
- A decision is recorded.
- If a period of suspension is set, the athlete cannot be considered eligible in competition until the ban is lifted.
- An appeal can reopen or review the case.
- The rules engine checks `hasDisciplinarySuspension` and blocks eligibility when a suspension is active.

### How Another University Detects a Banned Player
The intended design is:
1. A university or match official queries the athlete profile and disciplinary history.
2. The system checks `DisciplinaryCase` records against the athlete.
3. If an active ban exists, the athlete is marked as ineligible.
4. The requesting university receives a rejected eligibility result or verification denial.

---

## 14. Environment Configuration

### Environment Variables in `.env.example`
- `DATABASE_URL` — PostgreSQL connection string.
- `JWT_SECRET` — secret key used to sign JWT tokens.
- `JWT_EXPIRES_IN` — token validity duration.
- `REFRESH_TOKEN_SECRET` — secret reserved for refresh token generation.
- `PORT` — backend port.
- `NEXT_PUBLIC_API_URL` — frontend connection target for the backend API.
- `CLOUDINARY_CLOUD_NAME` — media upload provider identifier.
- `CLOUDINARY_API_KEY` — Cloudinary key.
- `CLOUDINARY_API_SECRET` — Cloudinary secret.
- `SMTP_HOST` — email server host.
- `SMTP_PORT` — email server port.
- `SMTP_USER` — SMTP user.
- `SMTP_PASS` — SMTP password.
- `APP_URL` — frontend base URL.

### Security Notes
The file uses example secrets and should never be committed with real credentials in production.

---

## 15. How To Run The Project

### Install Dependencies
```bash
npm install
```

### Copy Environment File
```bash
copy .env.example .env
```

### Run Database Setup
```bash
npx prisma migrate dev
npx prisma db seed
```

### Start Backend
```bash
npm run dev:api
```

### Start Frontend
```bash
npm run dev:web
```

### Run via Docker
```bash
docker compose up
```

### Production Build
```bash
npm run build
```

---

## 16. Deployment Explanation

### Frontend Hosting
The Next.js web application is designed to run as a standalone frontend service, potentially behind a reverse proxy or CDN.

### Backend Hosting
The Express backend can be deployed as a Node.js service, optionally behind Nginx or a container orchestrator.

### Database Hosting
PostgreSQL is the target database engine and is already represented in Docker Compose for local development.

### Domain Configuration
The repository suggests the need for a production domain and frontend base URL configuration via `APP_URL` and `NEXT_PUBLIC_API_URL`.

### SSL Certificate
TLS and SSL should be terminated by a reverse proxy or cloud load balancer in a production environment.

### CI/CD Pipeline
A GitHub Actions workflow in `.github/workflows/ci.yml` installs dependencies, builds the web and API workspaces, and runs tests.

---

## 17. Testing Analysis

### Unit Tests
- Present: `apps/api/src/test/smoke.test.ts`
- Purpose: Minimal package installation and runtime wiring smoke test.
- What it checks: It verifies the test environment is functioning by asserting `true === true`.

### Integration Tests
- Not implemented in the current codebase.
- The architecture supports Prisma-backed integration patterns, but the service endpoints are mostly mock-driven.

### API Tests
- No comprehensive API test suite exists yet.
- The scaffold is prepared for future route-level and controller-level integration tests.

---

## 18. Future Improvements

### AI Fraud Detection
Could be introduced to detect forged documentation, duplicate student records, or inconsistent academic submissions.

### Facial Recognition
Could be layered onto athlete registration and match-day verification for stronger identity confirmation.

### Biometric Verification
A secure biometric check could complement QR token verification and student photo validation.

### Mobile Application
A mobile client could enhance on-site verification, athlete registration, and direct match-day scanning.

### Blockchain Certificates
Academic and competition certificates could be publicly verifiable and tamper-resistant.

### Advanced Analytics
A data analytics layer could help identify repeat offenders, athlete performance trends, and suspicious university registration behavior.

---

## 19. Final Architecture Diagram

```text
                USERS
                  |
                  |
             Next.js Frontend
                  |
                  |
              REST API
                  |
                  |
          Express Backend
                  |
        ------------------------------
        |                            |
   PostgreSQL Database         University APIs
        |                            |
   Prisma ORM                External Verification
        |
   Eligibility Engine
        |
   QR Verification Layer
        |
   Sports CV / Document System
```

---

## Summary
This AEMS repository is a strong architectural starter for a university athlete eligibility management platform. It already contains the core structure of a monorepo, a Next.js frontend, an Express backend, Prisma models for a robust sport administration domain, JWT-based authentication, the beginnings of a rule evaluation engine, and deployment scaffolding via Docker and GitHub Actions.

The main caveat is that the current codebase is not yet a full production implementation. Several workflows are designed as demonstrative scaffolds with mock data and placeholder logic, particularly in authentication, university integration, QR verification, and athlete document generation.

Another developer can understand the intended system architecture from this codebase, but the next major step would be to connect the Prisma models to the controllers/services and complete the real data flow for registration, verification, approvals, QR scans, team selection, and sports CV generation.
