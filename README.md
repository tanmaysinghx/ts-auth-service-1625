# 🔐 ts-auth-service-1625

A **JWT-based authentication microservice** built with Node.js, TypeScript, Express, and Prisma.

| | |
|---|---|
| **Runtime** | Node.js 18 + TypeScript |
| **Framework** | Express 4 |
| **Database** | MySQL (Prisma ORM) |
| **Auth** | JWT access tokens (1h) + refresh tokens (30d) |
| **Port** | 1625 |
| **API Docs** | Swagger at `/api-docs` |

## Features

- User registration & login with role-based access (10 roles)
- JWT access + refresh token flow with httpOnly cookies
- Session management with device/IP/location tracking
- Password change with strength validation
- Rate limiting on login (10 attempts / 15 min)
- Automated session cleanup via cron (every 10 min)
- Swagger/OpenAPI documentation
- Docker + Jenkins CI/CD ready

> 📖 **For detailed architecture, auth flows, and API reference** — see [ARCHITECTURE.md](./ARCHITECTURE.md)

---

## Quick Start

### Prerequisites

- Node.js v18+
- MySQL database

### 1. Clone & Install

```bash
git clone https://github.com/tanmaysinghx/ts-auth-service-1625.git
cd ts-auth-service-1625
npm install
```

### 2. Configure Environment

Create a `.env` file:

```env
DATABASE_URL="mysql://root:root@localhost:3306/testdb"
ACCESS_TOKEN_SECRET=your_strong_random_secret
REFRESH_TOKEN_SECRET=your_strong_random_secret
PORT=1625
API_VERSION=v2
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-email-app-password
```

### 3. Database Setup

```bash
npx prisma migrate deploy   # Run migrations
npm run seed                 # Seed roles + default users
```

### 4. Run

```bash
npm run dev     # Development (hot reload)
npm start       # Production
```

Server → `http://localhost:1625` | Swagger → `http://localhost:1625/api-docs`

---

## API Endpoints

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `POST` | `/v2/api/auth/register` | — | Register new user |
| `POST` | `/v2/api/auth/login` | — | Login (rate limited) |
| `POST` | `/v2/api/auth/change-password` | — | Change password |
| `POST` | `/v2/api/auth/refresh-token` | — | Refresh access token |
| `POST` | `/v2/api/auth/verify/verify-token` | — | Verify JWT token |
| `POST` | `/v2/api/sessions/store-session` | Bearer | Store session metadata |
| `GET` | `/v2/api/sessions/get-sessions` | Bearer | List user sessions |
| `PATCH` | `/v2/api/sessions/:id/revoke` | Bearer | Revoke a session |
| `POST` | `/v2/api/sessions/validate-session` | — | Check session status |
| `POST` | `/v2/api/roles/add-roles` | Admin | Create role |
| `PUT` | `/v2/api/roles/edit-roles/:roleId` | Admin | Update role |
| `GET` | `/v2/api/health/health-check` | — | Health check |

---

## Scripts

| Command | Description |
|---|---|
| `npm run dev` | Dev server with hot reload (nodemon) |
| `npm start` | Start with ts-node |
| `npm run build` | Compile TypeScript + Prisma generate |
| `npm run seed` | Seed database |
| `npm test` | Run Jest tests |
| `npm run lint` | Run ESLint |

---

## Docker

```bash
# Build the image
docker build -t ts-auth-service .

# Run with environment variables from your local .env file
docker run -p 1625:1625 --env-file .env ts-auth-service
```

> **Note**: Never bake your `.env` file into the Docker image. Always inject it at runtime using `--env-file` or `-e` flags for security.

---

## License

ISC
