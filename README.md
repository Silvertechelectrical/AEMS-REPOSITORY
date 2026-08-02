# AEMS Repository

A full-stack Athlete Eligibility & Management System with Supabase verification integration and QR-based match-day access control.

## Stack
- Frontend: Next.js 19 + React 19 + TypeScript + Tailwind CSS
- Backend: Node.js + Express + TypeScript
- Database: PostgreSQL + Prisma ORM
- Auth: JWT + bcrypt
- Verification: Supabase tables (configurable)
- QR Tokens: Secure match-day passport generation and validation
- Deploy: Docker Compose (local), GitHub Actions (CI/CD)

## Features
- **Phase 10**: Supabase university student verification integration
- **Phase 11**: QR passport token generation and verification for match-day access
- Role-based access control (SUPER_ADMIN, KUSF_ADMIN, UNIVERSITY_ADMIN, SPORTS_OFFICER, TEAM_CAPTAIN, COACH, ATHLETE, MATCH_OFFICIAL)
- Athlete nomination and eligibility evaluation
- Staff invitation and approval workflows
- University and competition management

## Run locally

```bash
npm install
npm run dev:web    # Frontend on http://localhost:3000
npm run dev:api    # Backend on http://localhost:4000/api/v1
```

Full stack with Docker:
```bash
docker-compose up --build
```

## Environment setup

C
## Demo credentials



Or use `/captains`, `/staff`, `/nominate`, `/qr` routes in the admin dashboard.
