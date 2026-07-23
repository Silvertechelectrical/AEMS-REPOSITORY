# Swagger API Documentation

This project exposes a versioned REST API at `/api/v1`.

## Endpoints
- `GET /health` — service health check
- `GET /api/v1/dashboard` — dashboard summary

## Notes
- Add OpenAPI/Swagger generation in the API service once Prisma and route modules are expanded.
- Secure all auth endpoints with JWT and rate limiting.
