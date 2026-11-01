# TaskFlow — MERN Starter

Full-stack MERN application: React + Vite + Tailwind frontend, Express + Mongoose backend, Socket.IO real-time updates, cookie-based JWT auth with refresh-token rotation, and role-based access control.

## Features
- Register / login / logout, bcrypt hashing, httpOnly cookies, refresh-token rotation with reuse detection
- Roles (`user`, `admin`) enforced on the server; admin panel for managing users (role, activate/deactivate, live online status)
- Tasks module: CRUD, search, filters, sorting, pagination, stats (aggregation), soft delete, per-user data isolation
- Real-time sync through authenticated Socket.IO (open the app in two tabs)
- Security: Helmet, strict CORS allow-list, rate limiting, zod validation on every route, CSRF header guard, body-size limit, no sensitive fields in responses, generic login errors
- UI: responsive, dark/light theme, toasts, modals, skeleton loaders, empty states, error boundary, lazy-loaded routes, protected routes
- Tests: 11 API tests (Vitest + Supertest + in-memory MongoDB), 2 component tests (Testing Library)

## Structure
```
backend/   Express API (config, models, middleware, validators, controllers, routes, sockets, tests)
frontend/  React app (components, pages, layouts, context, services, hooks, routes)
docs/API.md
render.yaml  frontend/vercel.json
```

## Run locally
Requirements: Node 18+, MongoDB (local or Atlas).

```bash
# 1. Install
npm run install:all

# 2. Configure
cp backend/.env.example backend/.env     # set MONGODB_URI and two long random JWT secrets
cp frontend/.env.example frontend/.env   # VITE_API_URL=http://localhost:5000/api/v1

# 3. Start (two terminals)
npm run dev:backend      # http://localhost:5000
npm run dev:frontend     # http://localhost:5173

# 4. (optional) create an admin
cd backend && ADMIN_EMAIL=you@example.com ADMIN_PASSWORD=StrongPass1 npm run seed:admin
```
Generate secrets: `node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"`

## Tests
```bash
npm test                          # backend (downloads a MongoDB binary on first run)
npm --prefix frontend test        # frontend
```
If the machine can't download MongoDB binaries, point to an installed one:
`MONGOMS_SYSTEM_BINARY=/path/to/mongod MONGOMS_VERSION=7.0.x npm test`

## Deploy
**Database — MongoDB Atlas:** create a free cluster, a DB user, allow Render's outbound IPs (or `0.0.0.0/0` while testing), copy the connection string.

**Backend — Render:** New Web Service → connect repo → Root Directory `backend`, build `npm install`, start `npm start` (or use `render.yaml`). Env vars:
`NODE_ENV=production`, `MONGODB_URI`, `JWT_ACCESS_SECRET`, `JWT_REFRESH_SECRET`, `CLIENT_URL=https://<your-app>.vercel.app` (comma-separate multiple origins, no trailing slash). Health check path: `/health`.

**Frontend — Vercel:** Import repo → Root Directory `frontend` → Framework Vite. Env var: `VITE_API_URL=https://<your-api>.onrender.com/api/v1`. `vercel.json` handles SPA routing.

**Cross-site cookies:** in production cookies are `Secure; SameSite=None` because Vercel and Render are different sites. Some browsers block third-party cookies in strict modes; for the most robust setup, serve both from one parent domain (e.g. `app.example.com` + `api.example.com`) and consider `SameSite=Lax`.

> Render's free tier sleeps when idle; the first request after a pause can take ~30–60 s.

## Adapting it to your own app
Replace the Task model/controller/routes/validators (backend) and `Dashboard`/`TaskForm`/`TaskItem` (frontend). Auth, RBAC, error handling, validation, sockets and layout are domain-independent.

## Not included (add when needed)
Email verification & password reset (needs an email provider), file uploads, payments, Playwright E2E tests, CI pipeline, PWA manifest/service worker, error-tracking service.


Developed By Ntwari Balinda Espoir and Mukeshimana Kevin