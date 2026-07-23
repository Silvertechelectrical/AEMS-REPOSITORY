# Installation Guide

## Requirements
- Node.js 22+
- npm 10+
- PostgreSQL 16+
- Docker Desktop (optional for local orchestration)

## Steps
1. Install dependencies:
   ```bash
   npm install
   ```
2. Copy `.env.example` to `.env` and fill in values.
3. Run database setup:
   ```bash
   npx prisma migrate dev --name init
   npx prisma db seed
   ```
4. Launch the application:
   ```bash
   npm run dev:api
   npm run dev:web
   ```
