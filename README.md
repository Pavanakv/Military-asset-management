# Military Asset Management System

An enterprise-grade Military Asset Management System that tracks critical
military assets (vehicles, weapons, ammunition) across multiple military
bases — providing end-to-end asset visibility, operational accountability
for cross-base transfers, granular role-based access control, and a full
audit trail of every mutation.

Submitted by **Pavana K V** as an assignment.

---

## Live Application Links

| | URL |
|---|---|
| Frontend | https://military-asset-management-rose.vercel.app |
| Backend API | https://military-asset-management-apmk.onrender.com |
| Source Code | https://github.com/Pavanakv/Military-asset-management|

> **Note for reviewers:** the backend is hosted on Render's free tier, which
> spins down after periods of inactivity. The first request after idle time
> may take 30–60 seconds to respond while the server wakes up — this is
> expected behavior, not a defect. Subsequent requests are fast.

## Sample Test Accounts

| Role                | Username             | Password              | Base Assigned            |
|-----------------------|-------------------------|--------------------------|-----------------------------|
| Admin                  | `admin_user`            | `AdminPass123!`          | All Bases (Global)           |
| Base Commander         | `commander_alpha`       | `CommandPass123!`        | Fort Alpha (Base #1)         |
| Logistics Officer      | `logistics_officer`     | `LogisticsPass123!`      | Fort Alpha (Base #1) / Global Ops |

Log in with any of the above at the frontend URL to explore role-specific
views and permissions.

---

## 1. Objective

- **End-to-End Asset Visibility** — real-time opening balances, net
  movements, assignments, expenditures, and closing balances.
- **Operational Accountability** — cross-base asset transfers with strict
  audit trails.
- **Granular Security** — RBAC ensures Base Commanders only see their base,
  Logistics Officers manage movements, and Admins retain global control.
- **Auditability** — every mutation (purchase, transfer, assignment,
  expenditure) is automatically logged to a central audit trail.

## 2. Architecture

```
React (Vite + Tailwind) ──axios──▶ Express API ──Prisma ORM──▶ PostgreSQL
      │                                  │
      └── JWT stored client-side          └── JWT auth + RBAC middleware
                                              on every route
```

- **Frontend:** React (Vite), Tailwind CSS, Lucide React icons, Recharts,
  Axios, React Router.
- **Backend:** Node.js, Express.js, Prisma ORM, JWT auth, bcrypt password
  hashing.
- **Database:** PostgreSQL — chosen over NoSQL to guarantee ACID compliance
  during complex, simultaneous cross-base transfers.

Balances (opening, net movement, closing) are **computed on read** from the
`purchases`, `transfers`, `assignments`, and `expenditures` tables rather
than stored redundantly, keeping the ledger authoritative and avoiding sync
bugs.

## 3. ER Schema Diagram

```
        +---------------+                 +------------------+
        |     Bases     |                 |  EquipmentTypes  |
        +---------------+                 +------------------+
        | id (PK)       |                 | id (PK)          |
        | name          |                 | name             |
        | location      |                 | category         |
        +---+---+---+---+                 +---+---+---+---+--+
            |   |   |   |                     |   |   |   |
            |   |   |   +----< Purchases >-----+   |   |   |
            |   |   +-------< Transfers  >---------+   |   |
            |   +-----------< Assignments >-------------+   |
            +---------------< Expenditures >----------------+
            |
            +----< Users >---- AuditLogs
```

Relational integrity is enforced via foreign keys on every movement table
back to `bases`, `equipment_types`, and `users` (who performed the action).
Full DDL: `backend/prisma/schema.prisma` (source of truth) and
`backend/prisma/schema.sql` (plain SQL reference dump).

**Balance formula**
```
Net Movement    = Purchases + Transfers In − Transfers Out
Closing Balance = Opening Balance + Net Movement − Assigned − Expended
```

## 4. RBAC Authorization Matrix

| Action                           | Admin | Base Commander            | Logistics Officer            |
|------------------------------------|:-------:|:----------------------------:|:--------------------------------:|
| View dashboard (all bases)         | ✅      | ❌ (own base only)           | ❌ (own base only)               |
| View dashboard (own base)          | ✅      | ✅                            | ✅                                |
| Create / view bases                | ✅      | ❌                            | ❌                                |
| Create equipment types             | ✅      | ❌                            | ❌                                |
| Log purchases                      | ✅      | ❌                            | ✅ (own base)                     |
| View purchase history              | ✅      | ✅ (own base)                 | ✅ (own base)                     |
| Initiate transfers                 | ✅      | ❌                            | ✅ (own base as source)           |
| View transfer history              | ✅      | ✅ (own base)                 | ✅ (own base)                     |
| Record assignments / expenditures  | ✅      | ✅ (own base)                 | ❌                                |
| View audit log                     | ✅      | ❌                            | ❌                                |
| Create users                       | ✅      | ❌                            | ❌                                |

Enforced in `backend/middlewares/rbacMiddleware.js`: `authorizeRoles(...)`
gates routes by role, and `enforceBaseScope` / `enforceBaseScopeBody` /
`enforceTransferSourceScope` silently pin non-admin requests to their own
`base_id` — a Base Commander cannot read or write another base's data even
by tampering with the request payload.

## 5. API Endpoint Listing

| Method   | Endpoint                       | Access                                                      |
|----------|----------------------------------|-----------------------------------------------------------------|
| POST     | `/api/auth/login`                | Public                                                            |
| GET      | `/api/auth/me`                   | Authenticated                                                     |
| POST     | `/api/auth/register`             | Admin                                                              |
| GET      | `/api/assets/dashboard`          | Authenticated (base-scoped)                                       |
| GET      | `/api/assets/bases`              | Authenticated (base-scoped)                                       |
| POST     | `/api/assets/bases`              | Admin                                                              |
| GET      | `/api/assets/equipment-types`    | Authenticated                                                     |
| POST     | `/api/assets/equipment-types`    | Admin                                                              |
| GET/POST | `/api/purchases`                 | Admin, Logistics Officer (write); all roles (read, base-scoped)   |
| GET/POST | `/api/transfers`                 | Admin, Logistics Officer (write); all roles (read, base-scoped)   |
| GET/POST | `/api/assignments`               | Admin, Base Commander (write); all roles (read, base-scoped)      |
| GET/POST | `/api/expenditures`              | Admin, Base Commander (write); all roles (read, base-scoped)      |
| GET      | `/api/audit-logs`                | Admin                                                              |
| GET      | `/api/health`                    | Public health check                                                |

## 6. Local Setup Steps

### Prerequisites
- Node.js v18+, npm
- A PostgreSQL database (Neon / Supabase / Render Postgres / local / Docker)

### Backend
```bash
cd backend
npm install
cp .env.example .env        # set DATABASE_URL and JWT_SECRET
npx prisma migrate dev --name init
npm run seed                # creates sample bases, equipment, and test accounts
npm run dev                 # http://localhost:5000
```

### Frontend
```bash
cd frontend
npm install
cp .env.example .env        # VITE_API_BASE_URL=http://localhost:5000/api
npm run dev                 # http://localhost:5173
```

## 7. Deployment Configuration

- **Backend (Render):** Root directory `backend`; build command
  `npm install && npx prisma generate && npx prisma migrate deploy`;
  start command `npm start`; environment variables `DATABASE_URL`,
  `JWT_SECRET`, `JWT_EXPIRES_IN`, `CORS_ORIGIN` (deployed frontend URL, no
  trailing slash), `NODE_ENV=production`.
- **Frontend (Vercel):** Root directory `frontend`; framework preset Vite;
  environment variable `VITE_API_BASE_URL` set to the deployed backend URL
  + `/api` (e.g. `https://military-asset-management-apmk.onrender.com/api`).
- **Database:** PostgreSQL hosted on Neon.

## 8. Project Structure

```
military-asset-management/
├── backend/
│   ├── config/db.js               # Prisma client singleton
│   ├── controllers/                # auth, asset, purchase, transfer, assignment
│   ├── middlewares/                 # authMiddleware, rbacMiddleware, loggerMiddleware
│   ├── prisma/schema.prisma         # source-of-truth data model
│   ├── prisma/schema.sql            # plain SQL reference dump
│   ├── prisma/seed.js               # sample data + test accounts
│   ├── routes/
│   └── server.js
└── frontend/
    ├── src/components/              # Navbar, Sidebar, StatCard, NetMoveModal, ProtectedRoute
    ├── src/pages/                   # Login, Dashboard, Purchases, Transfers, Assignments
    ├── src/context/AuthContext.jsx
    └── src/services/api.js
```

## 9. Submission Checklist

- [x] Source Code Archive (GitHub repository, `node_modules` excluded)
- [x] Live Hosted Links (frontend + backend, above)
- [x] Sample Test Credentials (above)
