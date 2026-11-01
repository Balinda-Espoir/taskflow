# API Reference (`/api/v1`)

All responses: `{ success: boolean, data?, meta?, message?, details? }`.
Authentication uses httpOnly cookies (`accessToken` 15 min, `refreshToken` 7 days, rotated on every refresh).
Every non-GET request must send `X-Requested-With: XMLHttpRequest` (CSRF mitigation) — the frontend does this automatically.

| Method | Path | Auth | Description |
|---|---|---|---|
| POST | `/auth/register` | – | Create account (`name`, `email`, `password`). Role is always `user`. Rate limited. |
| POST | `/auth/login` | – | Sign in, sets cookies. Rate limited (10 / 15 min). |
| POST | `/auth/refresh` | refresh cookie | Rotate tokens. Reuse of an old refresh token revokes the session. |
| POST | `/auth/logout` | – | Revoke refresh token and clear cookies. |
| GET | `/auth/me` | user | Current user. |
| GET | `/tasks` | user | List own tasks. Query: `page, limit(≤50), status, priority, search, sort(newest|oldest|dueDate|title)`. Returns `meta {total,page,limit,pages}`. |
| GET | `/tasks/stats` | user | Counts by status + overdue. |
| POST | `/tasks` | user | Create (`title` required; `description,status,priority,dueDate` optional). |
| GET | `/tasks/:id` | user | Get one (own tasks only; others → 404). |
| PATCH | `/tasks/:id` | user | Partial update. |
| DELETE | `/tasks/:id` | user | Soft delete. |
| GET | `/users` | admin | List users (`page, limit, search`), includes `online` flag. |
| PATCH | `/users/:id` | admin | Change `role` / `isActive`. Cannot modify yourself. Deactivating revokes sessions. |
| GET | `/health` (no prefix) | – | Liveness + DB status (200/503). |

## Socket.IO
Connect to the API origin with credentials (cookie auth is verified in the handshake).

| Event | Direction | Payload |
|---|---|---|
| `task:created` / `task:updated` | server → owner's sockets | task |
| `task:deleted` | server → owner's sockets | `{ _id }` |
| `presence:update` | server → admins (and the connecting client) | `{ online }` |
