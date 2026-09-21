# VaniBackend — Repo Audit & Gap Analysis

Date: 2026-07-03

Purpose: Rapid audit of the current backend codebase against the project's mandatory requirements. This file lists existing components, gaps, security observations, and a prioritized set of next tasks to bring the project to the required production-ready standard.

## 1) What currently exists (summary)
- `server.js` — production-minded Express setup with `helmet`, `cors`, `rate-limit`, `morgan`, `mongo-sanitize`, `hpp` and global error handler.
- `models/index.js` — all Mongoose schemas defined in a single file (User, Product, Category, Cart, Booking, Address, Request, ContentConfig).
- `middleware/auth.js` — JWT-based `protect` and `authorizeRoles` middleware.
- `routes/*.js` — route files for `auth`, `products`, `cart`, `bookings`, `users`, `admin` present. Routes contain logic using `utils/storage` functions.
- `utils/storage.js` — a single file acting as a combined DAO/service layer handling many operations (users, cart, bookings, addresses, content config, seeding, etc.).
- `utils/db.js` — DB connection helper.
- `utils/location.js` — added IP-based location helper (ip-api.com).

## 2) Compliance gaps vs mandatory requirements

Major gaps (must-fix):

- Missing separation of concerns: No dedicated `controllers/` and `services/` folders. Routes contain business logic and `utils/storage.js` mixes service+DAO responsibilities.
- Models use simple String ids for relations (e.g., `userId: String`); they do not consistently use `ObjectId` references and `ref` relationships required for relational integrity and population.
- No `validators/` or schema validation files beyond inline `express-validator` usage in some routes. A centralized validation layer with reusable validators is missing.
- No `controllers`/`services` comments per mandatory documentation template. Many functions lack the required descriptive comments.
- No refresh token mechanism for JWTs and no secure refresh token rotation flow.
- Password reset flow is a stub (forgot-password route does not send tokens/emails). No secure reset token storage or verification.
- No audit logging infrastructure for admin actions (e.g., audit collection or audit service).
- No tests or CI configuration. No integration/unit tests for auth, cart, booking flows.
- No dedicated `validators/` or `middleware/validate.js` to centralize request validation and sanitization.
- No file upload restrictions or signed upload flow (multer present in `package.json` but not wired to secure uploads in routes).
- `utils/storage.js` currently performs DB and business logic directly — risk of duplicated logic and missing transactional consistency (e.g., booking should decrement stock atomically).
- No transactions handling (MongoDB transactions using session) for multi-document updates like booking creation -> stock decrement -> address save.
- Incomplete relationships: bookings reference `address: Object` instead of an `addressId` or `ObjectId` reference.

Security gaps:
- Refresh tokens missing.
- No rate-limited endpoints per sensitive routes (rate limit applied globally but sensitive flows like auth endpoints may need stricter rules).
- No audit logs for admin actions.
- Email sending not configured for password resets — secrets/SMTP config missing.

Developer experience gaps:
- No folder-level controllers/services/validators structure.
- Lack of consistent file/function-level comments and documentation as required.
- No API docs (Swagger/OpenAPI) or README describing endpoints and payloads.

## 3) Suggested minimal file/folder structure (priority)

- `controllers/` — small, route-specific controllers that call services.
- `services/` — business logic, orchestrations, transactions, calls to models.
- `models/` — separate files per model (e.g., `models/User.js`, `models/Booking.js`) using `mongoose.Schema` and `ref` ObjectId relationships.
- `routes/` — thin adapters that call controllers.
- `validators/` — request validation middleware (Joi or express-validator wrappers).
- `middleware/` — auth, role-based, rate-limit per-route, input sanitizers, error wrapper.
- `utils/` — small utils (email, logger, storage adapters). Keep `storage.js` trimmed to model-only helpers or replace with services.
- `docs/` — architecture and flow diagrams (create `docs/backend_documentation.md`).

## 4) Concrete prioritized tasks (short-term)

1. Split `models/index.js` into per-model files and convert string IDs to `mongoose.Schema.Types.ObjectId` refs (User -> Address, User->Cart, Booking->User, Booking->Address, Booking->Products referencing Product ids).
2. Create `controllers/` and `services/`; move business logic out of `routes/*` and `utils/storage.js` into well-named service functions.
3. Implement booking creation in a transactional service: create booking, decrement product stock, save address, create notification, all in a MongoDB transaction session.
4. Implement refresh token flow with secure httpOnly cookie storage and refresh token rotation (store hashed refresh tokens in DB per user/session).
5. Implement secure password-reset tokens: generate single-use tokens with expiry, store hashed token in DB, send email via SMTP (nodemailer) — include templates.
6. Add audit logging collection and middleware for admin routes.
7. Add comprehensive function/file comments following required template.
8. Add per-route validators and sanitize inputs.
9. Add integration tests for auth, booking, cart flows and add `npm test` scripts.

## 5) Estimated implementation plan & effort
- Phase 1 (2–4 days): Models refactor, controllers/services scaffold, booking transactional service, basic validators.
- Phase 2 (1–2 days): Auth refresh tokens + password reset + email configuration.
- Phase 3 (1–2 days): Audit logging, admin endpoints refactor, per-route rate limits, tests.
- Phase 4 (1–2 days): Documentation, diagrams, and final QA.

## 6) Recommended next immediate steps (I can start these now)
1. Create per-model files and update code to use ObjectId references. (Required for data integrity)
2. Scaffold `controllers/` and `services/` for `auth`, `bookings`, `cart`. Move existing logic into services with detailed comments. (Improves maintainability)

If you confirm, I will begin with step 1 (models refactor) and update the todo list accordingly.

---

Generated by: Automated repo audit performed in workspace.
