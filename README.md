# Military Asset Management System

An enterprise-style asset tracking system for managing vehicles, weapons, and
ammunition across multiple military bases — with real-time balance
calculations, cross-base transfers, role-based access control, and a full
audit trail.

## 1. Architecture

```
React (Vite + Tailwind) ──axios──▶ Express API ──Prisma ORM──▶ PostgreSQL
      │                                  │
      └── JWT stored client-side          └── JWT auth + RBAC middleware
                                              on every route
```

- **Frontend:** React (Vite), Tailwind CSS, Recharts, Axios, React Router.
- **Backend:** Node.js + Express, Prisma ORM, JWT auth, bcrypt password hashing.
- **Database:** PostgreSQL — chosen over NoSQL for ACID guarantees during
  concurrent, multi-step transfer transactions.

Balances (opening, net movement, closing) are **computed on read** from the
`purchases`, `transfers`, `assignments`, and `expenditures` tables rather than
stored redundantly — this keeps the ledger authoritative and avoids sync bugs.

## 2. Data Model (ER overview)

```
Bases ──< Users
Bases ──< Purchases >── EquipmentTypes
Bases ──< Transfers (source) / Transfers (destination) >── EquipmentTypes
Bases ──< Assignments >── EquipmentTypes
Bases ──< Expenditures >── EquipmentTypes
Users ──< AuditLogs
```

Full DDL: `backend/prisma/schema.prisma` (source of truth) and
`backend/prisma/schema.sql` (plain SQL reference dump).

**Balance formula**

```
Net Movement    = Purchases + Transfers In − Transfers Out
Closing Balance = Opening Balance + Net Movement − Assigned − Expended
```

## 3. RBAC Matrix

| Action                          | Admin | Base Commander          | Logistics Officer        |
|----------------------------------|:-----:|:-------------------------:|:---------------------------:|
| View dashboard (all bases)       | ✅    | ❌ (own base only)        | ❌ (own base only)          |
| View dashboard (own base)        | ✅    | ✅                         | ✅                           |
| Create / view bases              | ✅    | ❌                         | ❌                           |
| Create equipment types           | ✅    | ❌                         | ❌                           |
| Log purchases                    | ✅    | ❌                         | ✅ (own base)                |
| View purchase history            | ✅    | ✅ (own base)              | ✅ (own base)                |
| Initiate transfers               | ✅    | ❌                         | ✅ (own base as source)      |
| View transfer history            | ✅    | ✅ (own base)              | ✅ (own base)                |
| Record assignments/expenditures  | ✅    | ✅ (own base)              | ❌                           |
| View audit log                   | ✅    | ❌                         | ❌                           |
| Create users                     | ✅    | ❌                         | ❌                           |

Enforcement lives in `backend/middlewares/rbacMiddleware.js`:
`authorizeRoles(...)` gates routes by role, and `enforceBaseScope` /
`enforceBaseScopeBody` / `enforceTransferSourceScope` silently force
non-admin requests onto their own `base_id`, so a Base Commander cannot read
or write another base's data even by tampering with the request.

## 4. API Endpoints

| Method   | Endpoint                     | Access                                                       |
|----------|-------------------------------|----------------------------------------------------------------|
| POST     | `/api/auth/login`             | Public                                                          |
| GET      | `/api/auth/me`                | Authenticated                                                   |
| POST     | `/api/auth/register`          | Admin                                                            |
| GET      | `/api/assets/dashboard`       | Authenticated (base-scoped)                                     |
| GET      | `/api/assets/bases`           | Authenticated (base-scoped)                                     |
| POST     | `/api/assets/bases`           | Admin                                                            |
| GET      | `/api/assets/equipment-types` | Authenticated                                                   |
| POST     | `/api/assets/equipment-types` | Admin                                                            |
| GET/POST | `/api/purchases`              | Admin, Logistics Officer (write); all (read, base-scoped)      |
| GET/POST | `/api/transfers`              | Admin, Logistics Officer (write); all (read, base-scoped)      |
| GET/POST | `/api/assignments`            | Admin, Base Commander (write); all (read, base-scoped)         |
| GET/POST | `/api/expenditures`           | Admin, Base Commander (write); all (read, base-scoped)         |
| GET      | `/api/audit-logs`             | Admin                                                            |
| GET      | `/api/health`                 | Public health check                                              |

## 5. Local Setup

### Prerequisites
- Node.js v18+
- A PostgreSQL database (local, Docker, or a free instance on Neon/Supabase/Render)

### Backend

```bash
cd backend
npm install
cp .env.example .env        # fill in DATABASE_URL and JWT_SECRET
npx prisma migrate dev --name init
npm run seed                # creates sample bases, equipment, and test accounts
npm run dev                 # starts on http://localhost:5000
```

### Frontend

```bash
cd frontend
npm install
cp .env.example .env        # VITE_API_BASE_URL=http://localhost:5000/api
npm run dev                 # starts on http://localhost:5173
```

## 6. Sample Test Accounts (created by `npm run seed`)

| Role               | Username             | Password              | Base Assigned          |
|----------------------|------------------------|--------------------------|---------------------------|
| Admin                 | `admin_user`           | `AdminPass123!`          | All Bases (Global)         |
| Base Commander        | `commander_alpha`      | `CommandPass123!`        | Fort Alpha (Base #1)       |
| Logistics Officer     | `logistics_officer`    | `LogisticsPass123!`      | Fort Alpha (Base #1)       |

## 7. Deployment

- **Backend:** Render / Railway — set `DATABASE_URL`, `JWT_SECRET`,
  `CORS_ORIGIN` (your frontend URL) as environment variables, and run
  `npx prisma migrate deploy` as a release/build step.
- **Frontend:** Vercel / Netlify — set `VITE_API_BASE_URL` to your deployed
  backend's `/api` URL.

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
