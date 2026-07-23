# Architecture Overview

## Frontend
- Next.js App Router
- Tailwind CSS
- Framer Motion
- React Query
- React Hook Form with Zod

## Backend
- Express.js with modular routers and controllers
- Service-layer pattern for business logic
- JWT authentication and bcrypt hashing
- Prisma-ready data access layer

## Security
- JWT access tokens
- Helmet and CORS in the API layer
- Input validation through Zod schemas
- Audit logs and role-based request handling

## Deployment
- Docker Compose for local orchestration
- Nginx-ready reverse proxy layout
- CI workflow via GitHub Actions
