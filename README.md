# KUSF Athlete Eligibility & Management System (AEMS)

This repository provides an enterprise-grade starter implementation of the KUSF Athlete Eligibility & Management System using a modern full-stack architecture.

## Stack
- Frontend: Next.js 19 + React 19 + TypeScript + Tailwind CSS
- Backend: Node.js + Express + TypeScript
- Database: PostgreSQL + Prisma ORM
- Auth: JWT + bcrypt
- Integrations: Swagger, nodemailer, Docker, Nginx, GitHub Actions

## Monorepo Layout
- `apps/web` — Next.js dashboard/landing experience
- `apps/api` — Express REST API with versioning
- `prisma` — Prisma schema and seed data
- `docs` — installation and operations notes

## Quick Start

1. Copy `.env.example` to `.env`
2. Install dependencies
   ```bash
   npm install
   ```
3. Start PostgreSQL and run Prisma migrations
   ```bash
   npx prisma migrate dev
   ```
4. Start the dev servers
   ```bash
   npm run dev:web
   npm run dev:api
   ```

## Production Notes
- Use Docker Compose for local orchestration.
- Configure secure environment variables.
- Integrate university APIs through the connector layer in the service modules.

## Included Modules
- Authentication and RBAC foundation
- University registry schema
- Athlete verification and eligibility engine model
- QR token and audit log models
- Dashboard shell and API routes
- CI/CD and Docker deployment setup
