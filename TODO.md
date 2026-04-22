# Project TODOs

A short checklist to track the signup removal and related tasks.

- [x] Inspect DB config vars: search project files and `docker-compose.yml` for DB credentials.
- [x] Verify app TypeORM env usage: confirm `DB_SYNCHRONIZE` and env variables used in `src/app.module.ts`.
- [x] Check `docker-compose.yml` Postgres service: confirm `POSTGRES_PASSWORD`, `POSTGRES_USER`, and volume behavior.
- [x] Propose fix or next steps: suggested non-destructive password reset or destructive volume recreate.

- [ ] Remove signup from API
  - Goal: Prevent HTTP signup; only allow creating clients from webhook.
  - Status: ✅ COMPLETED - `POST /api/v1/auth/signup` removed from controller
  - Implementation: Clients created via `POST /api/v1/webhooks/clients/create` webhook endpoint (encrypted, signed)
  - Files: `src/auth/auth.controller.ts` (signup endpoint removed)
  - Notes: Only admin backend can create clients via webhook. Users sign up via admin portal only.

- [ ] Add CLI-only signup / seed command
  - Goal: Provide a command-line script or NestJS CLI command to create initial users (organization owners/admins) for local development.
  - Requirements: Use existing user service for validation and password hashing; accept arguments or read from a secure env/file.
  - Suggested location: `scripts/seed-user.ts` or a `nest` command under `src/scripts/`.
  - Note: In production, clients are created only via webhook from admin backend.

- [ ] Update docs and developer guide
  - Status: ✅ PARTIALLY COMPLETED
  - Updated: `WEBHOOK_SETUP.md` with new client creation webhook endpoint docs
  - Still needed: Update `README.md` and `TESTING_GUIDE.md` to reference webhook endpoint instead of signup

- [ ] Update tests and Postman collection
  - Status: ✅ PARTIALLY COMPLETED
  - Action: Remove signup test cases from Postman collection
  - Still needed: Add webhook client creation test case with signature verification examples

- [x] Create webhook listener for secure admin corridor creation
  - Implemented: `src/webhooks/` module with RSA-2048 encryption
  - Files: `webhooks.controller.ts`, `webhooks.service.ts`, `encryption.util.ts`
  - Features: Two-way encryption (RSA), response signatures, audit logs
  - Encryption: Language-agnostic via `npm run webhook:encrypt` script
  - Docs: `WEBHOOK_SETUP.md` with examples in Node.js, Python, Go, Java

- [ ] Remove Create Corridor from API controller
  - Goal: Force corridor creation through secure webhook endpoint only
  - Status: ✅ COMPLETED - `POST /api/v1/corridors` removed from controllers
  - Only endpoint to create corridors is now: `POST /api/v1/webhooks/corridors/create` (encrypted, no auth)
  - Action: Remove `@Post()` handler or return 410 Gone (deprecated)
  - Files: `src/corridors/corridors.controller.ts` (line ~47)
  - Notes: Update Postman and tests to use webhook endpoint instead

---

## Webhook Implementation Notes

**Architecture:**
- Admin backend calls `POST /webhooks/corridors/create` with encrypted payload
- No JWT auth needed; RSA encryption validates authenticity
- Server responds with signed confirmation (verifiable by client)
- All webhook calls logged in `webhook_logs` table for audit trail

**Security:**
- RSA-2048 OAEP encryption for payloads
- SHA-256 digital signatures for request/response verification
- Correlation IDs for distributed tracing
- Setup guide: `WEBHOOK_SETUP.md`

