# Deployment Guide

## Local Development

1. Copy `.env.example` to `.env`
2. Start PostgreSQL using Docker Compose
   ```bash
   docker compose up -d postgres
   ```
3. Run Prisma migration
   ```bash
   npx prisma migrate dev
   ```
4. Start the API and web apps
   ```bash
   npm run dev:api
   npm run dev:web
   ```

## Production

- Use Docker Compose for container orchestration.
- Configure TLS and reverse proxy with Nginx.
- Store all secrets in environment variables.
- Keep Prisma, API, and web builds separate for independent scaling.
