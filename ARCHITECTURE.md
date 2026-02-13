# Architecture & Knowledge Transfer Guide

> Deep-dive into how **ts-auth-service-1625** works — architecture, auth flows, database design, security model, and codebase walkthrough.

---

## Table of Contents

- [Architecture Overview](#architecture-overview)
- [Request Lifecycle](#request-lifecycle)
- [Authentication Flows](#authentication-flows)
  - [Registration](#registration-flow)
  - [Login + Session Creation](#login--session-flow)
  - [Token Refresh](#token-refresh-flow)
  - [Token Verification](#token-verification)
- [Session Lifecycle](#session-lifecycle)
- [Database Schema](#database-schema)
- [Project Structure](#project-structure)
- [Security Model](#security-model)
- [API Reference (Detailed)](#api-reference-detailed)
- [Seeded Data](#seeded-data)
- [DevOps](#devops)

---

## Architecture Overview

```mermaid
graph TB
    subgraph Client
        A[HTTP Client / Frontend]
    end

    subgraph "Express App (Port 1625)"
        MW1[CORS]
        MW2[Transaction ID]
        MW3[JSON + Cookie Parser]
        MW4[Morgan Logger]

        subgraph Routes
            R1["/v2/api/auth"]
            R2["/v2/api/roles"]
            R3["/v2/api/sessions"]
            R4["/v2/api/health"]
        end

        subgraph Controllers
            C1[authController]
            C2[roleController]
            C3[sessionController]
        end

        subgraph Services
            S1[authService]
            S2[roleService]
            S3[sessionService]
        end

        subgraph Middleware
            MW5[Auth Middleware - JWT verify]
            MW6[Rate Limiter]
            MW7[Admin Only Guard]
        end

        subgraph Cron
            CR["Session Cleanup (every 10 min)"]
        end
    end

    subgraph Infrastructure
        DB[(MySQL Database)]
        DOC[Swagger UI at /api-docs]
    end

    A --> MW1 --> MW2 --> MW3 --> MW4
    MW4 --> R1 & R2 & R3 & R4
    R1 --> MW6 --> C1 --> S1
    R2 --> MW5 --> MW7 --> C2 --> S2
    R3 --> MW5 --> C3 --> S3
    S1 & S2 & S3 --> DB
    CR --> S3
```

---

## Request Lifecycle

Every incoming request passes through this middleware chain before reaching any route:

```
Client Request
  → CORS (allow all origins)
  → Transaction ID Middleware (attaches UUID to req.transactionId)
  → JSON Body Parser
  → Cookie Parser
  → Morgan HTTP Logger
  → Route Handler
```

**Transaction IDs** — Every API response includes a unique `transactionId` field for traceability. This is generated in `transactionIdMiddleware.ts` and threaded through controllers into response utils.

**Protected Routes** — Routes under `/sessions` (except `/validate-session`) and `/roles` pass through the `authMiddleware` which extracts and verifies the JWT from the `Authorization: Bearer <token>` header. Role routes additionally pass through `adminOnly` which checks for superuser role (`roleId: 0001`).

---

## Authentication Flows

### Registration Flow

```mermaid
sequenceDiagram
    participant Client
    participant Validator
    participant AuthController
    participant AuthService
    participant DB

    Client->>Validator: POST /v2/api/auth/register
    Note over Validator: Validates:<br/>• Email format + normalization<br/>• Password strength (8+ chars,<br/>  upper, lower, number, special)<br/>• Role name in whitelist

    Validator->>AuthController: Validated request
    AuthController->>AuthService: registerUser(email, password, roleName)
    AuthService->>DB: Check if email exists
    DB-->>AuthService: Not found ✓
    AuthService->>DB: Find role by roleName
    DB-->>AuthService: Role found ✓
    AuthService->>AuthService: Hash password (bcrypt, 10 rounds)
    AuthService->>DB: Create user (id = uuid.slice(0,8))
    DB-->>AuthService: User created
    AuthService-->>AuthController: User data
    AuthController-->>Client: 201 - User registered successfully
```

**Key logic in `authService.ts → registerUser()`:**
1. Validates email/password/roleName are present
2. Checks for duplicate email
3. Looks up role by name (must exist in DB)
4. Hashes password with bcrypt (10 salt rounds)
5. Creates user with truncated UUID as ID

---

### Login + Session Flow

```mermaid
sequenceDiagram
    participant Client
    participant RateLimiter
    participant AuthController
    participant AuthService
    participant SessionService
    participant DB

    Client->>RateLimiter: POST /v2/api/auth/login
    Note over RateLimiter: Max 10 attempts<br/>per 15 min per IP

    RateLimiter->>AuthController: Allowed
    AuthController->>AuthService: loginUser(email, password)
    AuthService->>DB: Find user by email
    DB-->>AuthService: User record
    AuthService->>AuthService: bcrypt.compare(password, hash)
    AuthService->>AuthService: Generate access token (1h expiry)
    AuthService->>AuthService: Generate refresh token (30d expiry)
    AuthService->>DB: Update lastLoginAt timestamp
    AuthService-->>AuthController: { accessToken, refreshToken, email, roleId, roleName, userId }

    AuthController->>AuthController: Set httpOnly cookies
    Note over AuthController: refreshToken → httpOnly, secure, 7d<br/>accessToken → non-httpOnly, secure, 15min
    AuthController-->>Client: 201 - Tokens + user info

    Client->>SessionService: POST /v2/api/sessions/store-session
    Note over SessionService: Auto-detects IP (request-ip),<br/>geo-location (geoip-lite),<br/>receives device/browser/OS from client
    SessionService->>DB: Create Session (7d expiry, isActive: true)
    DB-->>SessionService: Session stored
```

**Key logic in `authService.ts → loginUser()`:**
1. Finds user by email (throws if not found)
2. Compares password with bcrypt
3. Generates JWT access token (1h) with `{ userId, roleId, email }`
4. Generates JWT refresh token (30d) with `{ userId }`
5. Updates `lastLoginAt` in DB
6. Returns tokens + role info

**Cookie behavior (`authController.ts → setCookies()`):**
- `refreshToken` cookie: httpOnly, secure in production, sameSite: none, 7 days
- `accessToken` cookie: NOT httpOnly (client JS can read), secure in production, 15 min

---

### Token Refresh Flow

```mermaid
sequenceDiagram
    participant Client
    participant AuthController
    participant AuthService
    participant DB

    Note over Client: Access token expired (after 1h)

    Client->>AuthController: POST /v2/api/auth/refresh-token
    AuthController->>AuthService: refreshToken(token)
    AuthService->>AuthService: jwt.verify(token, REFRESH_TOKEN_SECRET)
    AuthService->>DB: Find user by decoded userId
    DB-->>AuthService: User exists ✓
    AuthService->>AuthService: jwt.sign new access token (1h)
    AuthService-->>AuthController: New access token
    AuthController-->>Client: 201 - { accessToken }
```

**Note:** The refresh token endpoint in `authService.ts` creates a new access token with `{ userId, roleId }` (15 min expiry hardcoded), while `generateTokens.ts` uses 1h. This is an intentional override for refresh-generated tokens.

---

### Token Verification

Used by other microservices to validate a token issued by this service.

```mermaid
sequenceDiagram
    participant ExternalService
    participant AuthController
    participant AuthService

    ExternalService->>AuthController: POST /verify/verify-token { token }
    AuthController->>AuthService: verifyTokenService(token)
    AuthService->>AuthService: jwt.verify(token, ACCESS_TOKEN_SECRET)
    AuthService-->>AuthController: { success, userId, roleId, iat, exp }
    AuthController-->>ExternalService: 201 - Token is valid
```

---

## Session Lifecycle

```mermaid
stateDiagram-v2
    [*] --> Active: User logs in + stores session
    Active --> Active: touchSession() updates lastActiveAt
    Active --> Revoked: User calls PATCH /:id/revoke
    Active --> Expired: expiresAt < now (7 days)
    Revoked --> Deleted: Cron cleanup (every 10 min)
    Expired --> Deleted: Cron cleanup (every 10 min)
    Deleted --> [*]
```

**Session metadata captured:**
- IP address (auto-detected via `request-ip`)
- Geo-location (city, country via `geoip-lite` — falls back to client-provided timezone on localhost)
- Device, Browser, OS (sent by client)
- User-Agent header

**Session cleanup (`cron/sessionCleanup.ts`):**
- Runs on server startup, then every 10 minutes
- Deletes sessions where `isActive = false` OR `expiresAt < now`
- Logs cleanup results via Winston

**Session validation (`/validate-session`):**
Returns one of three statuses:
- `ACTIVE` → Session is valid, updates `lastActiveAt`
- `REVOKED` → Session was terminated by user
- `NOT_FOUND` → Session doesn't exist
- `EXPIRED` → Session past expiry date

---

## Database Schema

```mermaid
erDiagram
    User {
        String id PK "UUID (8 chars)"
        String email UK "Unique email"
        String password "bcrypt hash"
        String roleId FK "Links to Role"
        DateTime createdAt
        DateTime updatedAt
        DateTime lastLoginAt "Updated on login"
    }
    Role {
        String id PK "0001-0010"
        String roleName UK "e.g. superuser, admin"
        DateTime createdAt
    }
    Session {
        String id PK "UUID (36 chars)"
        String userId FK "Links to User"
        String refreshToken UK "JWT refresh token"
        String ipAddress "Auto-detected"
        String device "Client-provided"
        String browser "Client-provided"
        String os "Client-provided"
        String location "Geo or fallback"
        String userAgent "From header"
        Boolean isActive "false = revoked"
        DateTime createdAt
        DateTime lastActiveAt "Updated on touch"
        DateTime expiresAt "Created + 7 days"
    }

    Role ||--o{ User : "has many"
    User ||--o{ Session : "has many (cascade delete)"
```

**Cascade behavior:** Deleting a `User` automatically deletes all their `Session` records (`onDelete: Cascade`).

**Additional models** in the schema (`user_profile`, `billing`, `group_table`, `project`, `team`) are organizational placeholders not yet integrated into the auth logic.

---

## Project Structure

```
src/
├── app.ts                          # Express app: middleware chain + route mounting
├── server.ts                       # Entry: starts HTTP server, connects DB, inits cron
│
├── config/
│   ├── db.ts                       # Prisma client singleton + connectToDatabase()
│   ├── mail.ts                     # Nodemailer Gmail transport
│   ├── seed.ts                     # Seeds 10 roles + 5 default users
│   └── swagger.ts                  # Swagger/OpenAPI setup → serves at /api-docs
│
├── controller/
│   ├── authController.ts           # register, login, changePassword, refreshToken, verifyToken
│   ├── roleController.ts           # addRole, editRole
│   └── sessionController.ts        # storeSession, getSessions, revokeSession, validateSession
│
├── services/
│   ├── authService.ts              # Core auth: register, login, password, tokens
│   ├── roleService.ts              # Role CRUD (create, update)
│   └── sessionService.ts           # Session CRUD, validation, cleanup
│
├── routes/
│   ├── authRoutes.ts               # POST /register, /login, /change-password, /refresh-token, /verify
│   ├── roleRoutes.ts               # POST /add-roles, PUT /edit-roles (admin-protected)
│   ├── sessionRoutes.ts            # Session CRUD routes (auth-protected except validate)
│   └── healthCheckRoutes.ts        # GET /health-check
│
├── middleware/
│   ├── authMiddleware.ts           # JWT verification → sets req.user; adminOnly role check
│   ├── rateLimitMiddleware.ts      # 10 requests / 15 min window on login
│   ├── transactionIdMiddleware.ts  # Attaches UUID to every request
│   └── loggerConsole.ts            # Morgan 'combined' HTTP logging
│
├── utils/
│   ├── generateTokens.ts           # JWT: access (1h) + refresh (30d) generators
│   ├── hashPassword.ts             # bcrypt hash & compare wrappers
│   ├── logger.ts                   # Winston: console + file (combined.log)
│   ├── responseUtils.ts            # Standardized { success, transactionId, message, data } format
│   ├── transactionId.ts            # UUID v4 generator
│   └── validator.ts                # Email normalization, password rules, role whitelist
│
├── types/
│   ├── ApiResponse.ts              # Generic response interface
│   └── express.d.ts                # Global augmentation: req.transactionId, req.user
│
└── cron/
    └── sessionCleanup.ts           # Runs on startup + every 10 min; purges dead sessions
```

---

## Security Model

| Layer | Mechanism | Detail |
|---|---|---|
| **Password storage** | bcrypt | 10 salt rounds |
| **Password policy** | Validator middleware | Min 8 chars, 1 uppercase, 1 lowercase, 1 number, 1 special |
| **Access tokens** | JWT | 1 hour expiry, payload: `{ userId, roleId, email }` |
| **Refresh tokens** | JWT | 30 day expiry, payload: `{ userId }` |
| **Token storage** | httpOnly cookie | Refresh token in httpOnly cookie (XSS protection) |
| **Brute force** | express-rate-limit | 10 login attempts per 15 min per IP |
| **Authorization** | Role-based | `authMiddleware` verifies JWT; `adminOnly` checks roleId = 0001 |
| **Session hygiene** | Cron job | Cleans expired/revoked sessions every 10 min |
| **Traceability** | Transaction IDs | UUID on every request for logging/debugging |
| **Input validation** | validator.js | Email normalization, role whitelist |

---

## API Reference (Detailed)

### POST `/v2/api/auth/register`

```json
// Request
{
  "email": "user@example.com",
  "password": "MyStr0ng!Pass",
  "roleName": "user"
}

// Success (201)
{
  "success": true,
  "transactionId": "a43282df-...",
  "message": "User registered successfully",
  "data": {
    "id": "c3e70bd9",
    "email": "user@example.com",
    "password": "$2b$10$...",
    "roleId": "0005",
    "createdAt": "2024-09-13T20:12:09.808Z",
    "updatedAt": "2024-09-13T20:12:09.808Z",
    "lastLoginAt": null
  }
}

// Error (400)
{ "success": false, "message": "Registration error", "error": "User already exists with this email." }
```

### POST `/v2/api/auth/login`

```json
// Request
{ "email": "user@example.com", "password": "MyStr0ng!Pass" }

// Success (201) — sets refreshToken + accessToken cookies
{
  "success": true,
  "transactionId": "f206b71c-...",
  "message": "User logged in successfully",
  "data": {
    "accessToken": "eyJhbG...",
    "refreshToken": "eyJhbG...",
    "email": "user@example.com",
    "roleId": "0005",
    "roleName": "user",
    "userId": "c3e70bd9"
  }
}

// Error (401)
{ "success": false, "message": "Login error", "error": "Invalid credentials" }
// Error (429) — rate limited
"Too many login attempts, please try again later."
```

### POST `/v2/api/auth/refresh-token`

```json
// Request
{ "refreshToken": "eyJhbG..." }

// Success (201)
{ "success": true, "message": "Refresh token generated", "data": { "accessToken": "eyJhbG..." } }
```

### POST `/v2/api/auth/verify/verify-token`

```json
// Request
{ "token": "eyJhbG..." }

// Success (201)
{
  "success": true,
  "message": "Token verified successfully",
  "data": { "success": true, "message": "Token is valid", "userId": "c3e70bd9", "roleId": "0001", "iat": 1726305708, "exp": 1726306608 }
}
```

### POST `/v2/api/auth/change-password`

```json
// Request
{ "email": "user@example.com", "currentPassword": "MyStr0ng!Pass", "newPassword": "NewStr0ng!Pass" }

// Success (201)
{ "success": true, "message": "Password changed successfully", "data": "Password updated successfully" }
```

### POST `/v2/api/sessions/store-session` (Auth required)

```json
// Request
{
  "refreshToken": "eyJhbG...",
  "device": "Desktop",
  "browser": "Chrome 120",
  "os": "Windows 11",
  "location": "Asia/Kolkata"
}

// Success (201)
{ "success": true, "message": "Session stored", "data": { "id": "uuid-...", "userId": "c3e70bd9", ... } }
```

### POST `/v2/api/sessions/validate-session`

```json
// Request
{ "refreshToken": "eyJhbG..." }

// Response (200) — always 200, check isValid
{
  "success": true,
  "message": "Session validation completed",
  "data": { "isValid": true, "status": "ACTIVE", "message": "Session is valid" }
}
// or
{ "data": { "isValid": false, "status": "REVOKED", "message": "Session has been terminated" } }
// or
{ "data": { "isValid": false, "status": "EXPIRED", "message": "Session has expired" } }
```

---

## Seeded Data

Run `npm run seed` to populate:

**10 Roles:**

| ID | Role |
|---|---|
| 0001 | superuser |
| 0002 | admin |
| 0003 | editor |
| 0004 | viewer |
| 0005 | user |
| 0006 | guest |
| 0007 | moderator |
| 0008 | operator |
| 0009 | analyst |
| 0010 | developer |

**5 Default Users** (all with password: `password`):
- superuser@gmail.com (superuser)
- admin@gmail.com (admin)
- user@gmail.com (user)
- guest@gmail.com (guest)
- developer@gmail.com (developer)

---

## DevOps

### Docker

```dockerfile
# Dockerfile: Node 18, npm install, prisma generate, exposes 1625
docker compose up -d
```

### Jenkins CI/CD

4-stage pipeline in `Jenkinsfile`:

```
Checkout → Build & Test (npm ci + npm test) → Docker Build → Deploy (docker compose up)
```

### Logging

- **Winston** → Console (colorized) + `combined.log` (JSON format)
- **Morgan** → HTTP request logging in `combined` format
- All logs include timestamps in `YYYY-MM-DD HH:mm:ss` format
