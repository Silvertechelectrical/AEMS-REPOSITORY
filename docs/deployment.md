# Deployment Guide

## Local development

1. Copy `.env.example` to `.env`
2. Start PostgreSQL
3. Run:
   ```bash
   npm install
   npm run prisma:generate
   npm run prisma:migrate
   npm run prisma:seed
   npm run dev:api
   npm run dev:web
   ```

## Production

- Build the application:
  ```bash
  npm run build
  ```
- Deploy the API and web apps using the Docker configuration or your preferred Node.js hosting service.
- Set production environment variables for `DATABASE_URL`, `JWT_SECRET`, and storage credentials.
