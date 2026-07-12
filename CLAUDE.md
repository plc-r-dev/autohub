# AutoHub — Agent Operating Rules

These rules govern how Claude Code works in this repository. They apply to every task by default; a user can override them explicitly for a specific request.

## Goal

- Minimize token usage.
- Maximize coding speed.
- Preserve code quality.
- Follow the existing architecture (see the Architecture Knowledge Base below).

## General Rules

- Never scan the entire repository unless explicitly requested.
- Read only the files required to complete the task.
- Stop searching once the target implementation is found.
- Avoid unnecessary exploration.
- Never inspect unrelated modules.
- Never analyze the whole project.

## Editing Rules

- Modify only the requested files.
- Keep changes minimal.
- Preserve existing architecture.
- Preserve business logic.
- Reuse existing components.
- Reuse existing utilities.
- Avoid creating new files unless required.
- Never perform unrelated refactoring.

## Search Strategy

Always search in this order:

1. Exact file path
2. Component name
3. Function name
4. Repository search (only if previous steps fail)

Maximum dependency depth:

- Current file
- Direct imports
- One additional level only

Never recursively inspect the entire project.

## UI Rules

- Follow the existing design system.
- Reuse shadcn/ui components.
- Keep spacing, typography, and colors consistent.
- Do not redesign unless requested.

## Backend Rules

- Do not inspect backend code for frontend tasks.
- Do not inspect frontend code for backend tasks.

## Output Rules

Keep responses concise. Return only:

- Files changed
- Summary
- Required user decision (if any)

Do not explain generated code unless requested.

## Performance Rules

Always optimize for, in this order:

1. Lowest possible token usage.
2. Fast execution.
3. Minimal code changes.
4. Reusing existing code.
5. Keeping business logic unchanged.

## AutoHub Tech Stack

- Next.js App Router
- React
- TypeScript (Strict)
- Tailwind CSS
- shadcn/ui
- Prisma
- PostgreSQL

Respect the current project structure — see §2 (Tech Stack) and §3 (Repository / Folder Structure) below for the full stack table and folder layout.

---

# CLAUDE.md — AutoHub Architecture Knowledge Base

This file is a reference for anyone (human or AI agent) working in this repository. It documents the system **as implemented in the codebase**, not as originally planned. Where the implementation has gaps or known issues, they are called out explicitly so nobody builds on top of an assumption that isn't true.

> **Note on `docs/architecture/*.md`:** This repository already contains an `docs/architecture/` folder (README, authentication, booking, database, merchant, onboarding, rbac, roadmap, tenant). Those files describe an **earlier phase** of the project (through "ServiceStore Approval") and are now stale — they say booking, billing, and RBAC-adjacent features are "schema only" or "not implemented," which is no longer true. `docs/product-workflow.md` is the newer, actively maintained document and reflects the current MVP. This CLAUDE.md is written from the current code and treats `product-workflow.md` as the more trustworthy source where the two disagree. Update or retire `docs/architecture/*.md` as a follow-up; do not trust it for booking/billing/RBAC status.

---

## 1. What AutoHub Is

AutoHub is a multi-tenant, LINE-native car-care booking platform for Thailand. It has **three independent portals** sharing one codebase and one database:

| Portal | Users | Auth | Home |
|---|---|---|---|
| Customer | Car owners, via LINE OA / LIFF | LINE OAuth (Better Auth) | `/browse` |
| ServiceStore | Car wash / service shop operators | LINE OAuth (separate session context) | `/service-store/dashboard` |
| Admin | Platform operators | LINE OAuth (separate session context) | `/admin/dashboard` |

All three portals authenticate via the same LINE OAuth flow and the same `AuthUser`/`AuthSession` tables, but each portal has its own route guards, its own "home," and its own domain-provisioning rules (see §7 Authentication). A single LINE identity can simultaneously be a `Customer` and a serviceStore operator.

---

## 2. Tech Stack

| Layer | Technology |
|---|---|
| Monorepo | pnpm workspaces + Turborepo (`turbo.json`, `pnpm-workspace.yaml`) |
| App framework | Next.js 16 (App Router, React 19, **`proxy.ts`** instead of `middleware.ts` — this is a Next 16 rename, see `AGENTS.md`) |
| Language | TypeScript, strict, `@workspace/typescript-config` base |
| UI | shadcn/ui (`style: base-luma`) on Tailwind CSS v4, shared via `packages/ui` |
| Icons | lucide-react |
| Auth | Better Auth v1.6.x, Prisma adapter, `genericOAuth` + `line()` plugin, `customSession`, `nextCookies` |
| ORM / DB | Prisma 7 (`prisma-client` generator, output to `apps/web/lib/generated/prisma`) + PostgreSQL 17, via `@prisma/adapter-pg` (`pg` driver, not the older binary engine) |
| Validation | Zod v4 |
| Local infra | Docker Compose: Postgres 17, Redis 8 (present but not yet wired into app code — no cache/queue usage found), pgAdmin |
| Lint/format | ESLint 9 (`@workspace/eslint-config`), Prettier 3 + `prettier-plugin-tailwindcss` |
| Package manager | pnpm 10.33.4, Node >= 20 |

No test framework, CI config, or payment SDK is present in the repo at the time of writing.

**Key env vars** (`turbo.json` `globalEnv`, `.env.example`, plus additional vars read directly via `process.env` in `lib/`):
`DATABASE_URL`, `BETTER_AUTH_SECRET`, `BETTER_AUTH_URL`, `NEXT_PUBLIC_BETTER_AUTH_URL`, `LINE_CHANNEL_ID`, `LINE_CHANNEL_SECRET`, `NODE_ENV`, `REDIS_URL`, `NEXT_PUBLIC_APP_NAME`. Two more are required for features to function but are **not** declared in `turbo.json` `globalEnv` or `.env.example` (a real gap — see §12): `LINE_CHANNEL_ACCESS_TOKEN` (`lib/line/line-client.ts` — separate from the OAuth `LINE_CHANNEL_ID`/`SECRET` pair; required for outbound push notifications, checked via `isConfigured()`) and `GOOGLE_MAPS_API_KEY` (`lib/google-places/client.ts` — gates the Places autocomplete/details integration used in ServiceStore setup; silently returns empty/null results when absent rather than erroring).

---

## 3. Repository / Folder Structure

```
autohub/
├── apps/
│   └── web/                        # The only application (Next.js 16)
│       ├── app/                    # App Router — pages, layouts, API routes
│       │   ├── (customer)/         # Customer portal route group: /browse, /bookings, /vehicles, /profile
│       │   ├── admin/              # Admin portal: dashboard, billings, jobs, reports, settings, service-store-requests
│       │   ├── service-store/      # ServiceStore portal: dashboard, branches, bookings, customers, billings, setup wizard
│       │   ├── onboarding/         # Legacy customer/merchant onboarding (superseded, redirected by proxy.ts)
│       │   ├── open-in-line/       # Unauthenticated customer entry gate
│       │   ├── login/              # Dev-only LINE login fallback (non-LIFF)
│       │   └── api/                # Route Handlers: auth catch-all, booking slots, jobs runner, storage, Google Places proxy
│       ├── auth.ts                 # Better Auth configuration (server)
│       ├── proxy.ts                # Route protection — Next.js 16's replacement for middleware.ts
│       ├── lib/                    # All domain/business logic, organized by bounded context (see §4)
│       │   └── generated/prisma/   # Generated Prisma client — do not hand-edit
│       ├── components/             # React components, mirrors lib/ contexts (admin, auth, billing, booking, browse, customer, onboarding, service-store, layout, listing, liff, reporting)
│       ├── hooks/                  # Shared React hooks
│       ├── prisma/                 # schema.prisma, migrations/, seed.ts
│       └── scripts/                # One-off maintenance scripts
├── packages/
│   ├── ui/                         # Shared shadcn/ui component library (@workspace/ui)
│   ├── eslint-config/               # Shared ESLint flat configs
│   └── typescript-config/           # Shared tsconfig bases
├── docker/docker-compose.yml       # Local Postgres 17 + Redis 8 + pgAdmin
├── docs/
│   ├── architecture/                # STALE — describes an earlier project phase (see note at top of this file)
│   └── product-workflow.md         # Current, detailed MVP workflow spec — best secondary reference
└── scripts/                        # Repo-level one-off refactor scripts (service-store rename tooling)
```

`apps/web` is the entire product; `packages/ui` is presentational only. There is no separate backend service — Server Actions and Route Handlers inside `apps/web` are the entire API surface.

### `lib/` is organized by bounded context, each typically with:

- `schemas.ts` — Zod input validation
- `queries.ts` — read-only Prisma queries
- `actions.ts` — `"use server"` mutations
- `domain/` or `engine/` — pure business logic, framework-free where possible

Contexts: `auth/`, `billing/`, `booking/` (+ `booking/engine/`), `customer/`, `geo/`, `google-places/`, `jobs/` (+ `jobs/services/`), `liff/`, `line/`, `listing/`, `marketplace/`, `media/`, `messaging/`, `onboarding/` (legacy), `platform-settings/`, `reporting/`, `service-store/` (+ `service-store/application/`, `service-store/domain/`), `storage/`.

---

## 4. Domain Model

### 4.1 Identity chain

```
AuthUser (Better Auth: LINE OAuth identity)
    └── User (domain profile, tenant-scoped, linked via authUserId)
            ├── Customer?         (auto-provisioned the first time the LINE user hits a customer route)
            └── serviceStoreId?   (set once an admin approves a claim/onboarding request)
```

- `AuthUser` / `AuthSession` / `AuthAccount` / `AuthVerification` are Better Auth's own tables (mapped via `modelName` in `auth.ts` to `authUser`, `authAccount`, `authVerification`, and session config in the `session` block — table names `authUser`, `authSession`, `authAccount`, `authVerification`).
- `User` is the domain identity: `authUserId` (unique, nullable) links back to `AuthUser.id`; `tenantId` is required; `serviceStoreId` is optional and set on serviceStore approval.
- `Customer` has a **1:1 optional relation to `User`** (`Customer.userId @unique`), separate from `User.lineUserId`. Both `User` and `Customer` independently store `lineUserId` (both unique) — this is a real duplication in the schema, not a mistake to "fix" casually; a lot of code paths read `lineUserId` off whichever record is at hand.
- A single `User` row can carry **both** a `Customer` relation and a `serviceStoreId` — that's how the "same LINE user as customer and shop owner" case works.

### 4.2 Tenant

`Tenant` is the multi-tenancy boundary (`code`, `name`, `status: ACTIVE|INACTIVE`). The default/seeded tenant is `AUTOHUB`. Tenants are **never auto-created**; `resolveDefaultTenantId()` (in `lib/customer/ensure-customer-profile.ts`) picks the `AUTOHUB` tenant if active, else the first active tenant, else throws `NO_ACTIVE_TENANT`. Tenant isolation is structural (FK-based) only — there is no query-level tenant-scoping middleware, so every read/write is responsible for filtering by `tenantId` itself.

### 4.3 ServiceStore hierarchy

```
Tenant → ServiceStore → Branch → Service
                      → BranchOperatingHours (7 rows/branch, one per day-of-week)
ServiceStore → ServiceStoreMember (role: OWNER/MANAGER/STAFF/FINANCE/VIEWER)
ServiceStore → ServiceStoreClaim (operator claims an existing shop)
Tenant → ServiceStoreOnboardingRequest (operator requests a brand-new shop)
```

- `ServiceStoreStatus`: `DRAFT`, `PENDING_VERIFICATION`, `ONBOARDING`, `ACTIVE`, `READY_FOR_BOOKING`, `SUSPENDED`. In practice, only `DRAFT`/`ACTIVE`/`SUSPENDED` are actively used by current code paths; `PENDING_VERIFICATION` and `READY_FOR_BOOKING` exist in the enum but are not driven by any transition logic found in `lib/service-store/`.
- `ServiceStore.bookingEnabled` (boolean) is the actual gate for whether a shop shows a "Book Now" CTA in the marketplace — this is **separate from `status`**. A shop can be `ACTIVE` but `bookingEnabled: false` (still "joining").
- **Correction (verified against source, supersedes an earlier draft of this file and `docs/product-workflow.md` §7.2, both of which claim staff/multi-user is "Missing — one user per serviceStore"):** `ServiceStoreMember` is fully wired, not schema-only. `lib/service-store/member-actions.ts` implements invite, role change, remove, and ownership transfer as real permission-gated Server Actions (`inviteServiceStoreMember`, `updateServiceStoreMemberRole`, `removeServiceStoreMember`, `transferServiceStoreOwnership`), each enforcing real invariants (can't remove the last `OWNER`, an `OWNER` can't self-demote without transferring first). `lib/service-store/context.ts`'s `requireServiceStoreContext(permission)` is the enforcement point — it resolves the caller's active `ServiceStoreMember` row and checks `roleHasPermission()` before allowing the action, redirecting to the dashboard if the permission is missing. A single `User` can belong to multiple `ServiceStore`s as different members and switch between them (`switchActiveServiceStore`). This is a genuine, working, portal-scoped RBAC system — see `lib/service-store/domain/permissions.ts` for the five-role → permission-set mapping. Don't rebuild this; it's a real strength of the codebase (see §12 for the distinction from platform-level RBAC, which is *not* implemented).
- `Role` / `UserRole` also exist in the schema (tenant-scoped) but are **not used for access control anywhere** — this is a separate, still-real gap from the `ServiceStoreMember` system above. See §6 Business Rules / Known Gaps.

### 4.4 Booking domain

```
Customer → Vehicle (unique [customerId, licensePlate])
Customer → Booking → BookingItem → Service (price snapshotted on BookingItem.unitPrice)
Branch → Booking, Branch → Service, Branch → BranchOperatingHours
Booking.bookingNumber (unique, format AH-YYMMDD-######, via BookingNumberCounter)
```

`Booking` carries full timeline timestamps (`confirmedAt`, `startedAt`, `completedAt`, `cancelledAt`, `noShowAt`) in addition to `status`. See §8 Booking Engine for the state machine and slot logic.

### 4.5 Billing domain

```
ServiceStore → Billing (one per [serviceStoreId, periodStart, periodEnd])
Billing → BillingItem (one per completed Booking; BillingItem.bookingId is unique)
Billing → BillingPayment (serviceStore-submitted payment slip)
Billing → BillingReminderEvent
PlatformSettings (singleton, id="default") — bookingFee, vatRate, currency, billingDueDays, company/bank/storage/locale config
InvoiceNumberCounter / ReceiptNumberCounter — sequence generators for invoice/receipt numbers
```

See §9 Billing for the full lifecycle.

### 4.6 Operational / infra models

- `JobExecution` — log of every background job run (`status: RUNNING/SUCCESS/FAILED/SKIPPED`).
- `BookingNumberCounter`, `InvoiceNumberCounter`, `ReceiptNumberCounter` — per-day or per-month numbering sequences, each a simple `{ key, lastNumber }` row incremented transactionally.

---

## 5. Full Database Schema Reference

Schema source of truth: `apps/web/prisma/schema.prisma`. Generated client: `apps/web/lib/generated/prisma/` (never hand-edit; regenerate with `pnpm prisma generate`).

### Enums

| Enum | Values |
|---|---|
| `UserStatus` | `ACTIVE`, `INACTIVE`, `SUSPENDED` |
| `TenantStatus` | `ACTIVE`, `INACTIVE` |
| `ServiceStoreStatus` | `DRAFT`, `PENDING_VERIFICATION`, `ONBOARDING`, `ACTIVE`, `READY_FOR_BOOKING`, `SUSPENDED` |
| `ServiceStoreMemberRole` | `OWNER`, `MANAGER`, `STAFF`, `FINANCE`, `VIEWER` |
| `ClaimStatus` | `PENDING`, `APPROVED`, `REJECTED` |
| `OnboardingRequestStatus` | `PENDING`, `APPROVED`, `REJECTED` |
| `CustomerStatus` | `ACTIVE`, `INACTIVE` |
| `BookingSource` | `AUTOHUB`, `WALK_IN`, `PHONE`, `MANUAL` |
| `BookingStatus` | `PENDING`, `CONFIRMED`, `CHECKED_IN`, `IN_PROGRESS`, `COMPLETED`, `CANCELLED`, `NO_SHOW` (`CHECKED_IN` is enum-only, no code path sets it) |
| `BillingStatus` | `DRAFT`, `SUBMITTED`, `APPROVED`, `REJECTED`, `PAYMENT_SUBMITTED`, `PAYMENT_REJECTED`, `PAID` |
| `BillingPaymentReviewStatus` | `PENDING`, `APPROVED`, `REJECTED` |
| `JobExecutionStatus` | `RUNNING`, `SUCCESS`, `FAILED`, `SKIPPED` |

### Models (business layer)

| Model | Key fields / constraints |
|---|---|
| `Tenant` | `code` unique, `status` default `ACTIVE` |
| `User` | `authUserId` unique nullable, `lineUserId` unique nullable, `email` unique nullable, `tenantId` FK, `serviceStoreId` FK nullable; indexes on `tenantId`, `serviceStoreId` |
| `Role` / `UserRole` | `Role` unique `[tenantId, code]`; `UserRole` composite PK `[userId, roleId]` — schema exists, unused by app logic |
| `ServiceStore` | unique `[tenantId, code]`; `status` default `DRAFT`; `bookingEnabled` default `false`; Google Places fields (`googlePlaceId`, `businessCategory`); payout fields (`payoutBankName/AccountName/AccountNumber/BankBranch`) |
| `ServiceStoreMember` | unique `[serviceStoreId, userId]`; `role` default `STAFF` |
| `ServiceStoreClaim` | proposed-* fields for shop details (name/phone/email/website/description/address/lat/long), `googlePlaceId`, `businessCategory`; `status` default `PENDING` |
| `ServiceStoreOnboardingRequest` | `businessName`, `businessCode`, contact fields; `status` default `PENDING` |
| `Branch` | unique `[serviceStoreId, code]`; `slotIntervalMinutes` default `15`; `concurrentCapacity` default `1`; lat/long |
| `BranchOperatingHours` | composite PK `[branchId, dayOfWeek]`; `openTime`/`closeTime` as `String` (`"HH:MM"`), `isClosed` |
| `Service` | unique `[branchId, code]`; `duration` (min), `bufferMinutes` default `0`, `price` Decimal, `isActive` default `true` |
| `Customer` | `userId` unique nullable (1:1 to `User`), `lineUserId` unique nullable, `isWalkIn` default `false`, indexed on `tenantId` |
| `Vehicle` | unique `[customerId, licensePlate]`, `province` optional |
| `Booking` | `bookingNumber` unique, `source`, `status` default `PENDING`, full timeline timestamps, indexed on `tenantId`, `customerId`, `branchId`, `bookingDate`, `vehicleId` |
| `BookingNumberCounter` | PK `dateKey` |
| `BookingItem` | `unitPrice` snapshot, indexed on `bookingId`, `serviceId` |
| `Billing` | unique `[serviceStoreId, periodStart, periodEnd]`, `invoiceNumber`/`receiptNumber` unique nullable, full status timeline, `rejectReason` |
| `BillingItem` | `bookingId` **unique** (one billing line per booking, enforced at DB level) |
| `BillingPayment` | slip metadata (`slipKey`, `slipUrl`, `fileName`, `fileSize`, `mimeType`), `reviewStatus` default `PENDING` |
| `BillingReminderEvent` | unique `[billingId, reminderDate]` |
| `InvoiceNumberCounter` / `ReceiptNumberCounter` | PK `monthKey` |
| `PlatformSettings` | singleton `id = "default"`; billing/company/bank/storage/locale config, all with defaults |
| `JobExecution` | indexed `[jobName, startedAt desc]`, `[status, startedAt desc]` |

### Auth-layer tables (Better Auth, mapped via `@@map`)

`AuthUser` → `authUser`, `AuthSession` → `authSession`, `AuthAccount` → `authAccount`, `AuthVerification` → `authVerification`. These are managed by the Better Auth Prisma adapter — don't write to them directly outside of `auth.ts` configuration.

### Migration history (chronological, `apps/web/prisma/migrations/`)

`init` → `add_better_auth` → `add_user_auth_user_id` → `add_merchant_onboarding_request` → `add_user_merchant_id` → `add_customer_user_id` → `add_service_buffer_minutes` → `add_branch_operating_hours` → `add_booking_operations` → `add_billing_settlement` → `add_platform_settings_and_object_storage` → `add_customer_vehicle_crm` → `add_background_jobs_framework` → `add_merchant_booking_enabled` → `rename_merchant_to_service_store` → `service_store_onboarding_flow`

Note the `rename_merchant_to_service_store` migration: the codebase used to call the shop entity "merchant" everywhere and was renamed to "serviceStore." Remnants of the old name still exist deliberately for backward compatibility (see §6.5) — `/merchant/*` and `/onboarding/merchant` routes still resolve via redirects in `proxy.ts`, and `scripts/fix-service-store-paths.mjs` / `scripts/refactor-service-store.mjs` at the repo root are the one-off scripts used for that rename.

Commands:
```bash
cd apps/web
pnpm prisma generate
pnpm prisma migrate dev        # development
pnpm prisma migrate deploy     # production
pnpm db:seed                   # via root: pnpm db:seed
```

---

## 6. Business Rules

### 6.1 Identity & provisioning

- Email/password login is disabled everywhere; **LINE OAuth is the only sign-in method**, for all three portals.
- A domain `User` is never created at OAuth callback time. It's created lazily:
  - **Customer portal**: first authenticated visit to a customer route triggers `ensureCustomerProfile()` (called from both `proxy.ts` and `requireCustomerIdentity()`), which creates `User` + `Customer` together in a transaction, using LINE profile `displayName`/`image` split into `firstName`/`lastName`.
  - **ServiceStore/Admin portals**: no auto-provisioning. A `User` is created explicitly during serviceStore claim/onboarding-request submission.
- Default tenant resolution for auto-provisioning: prefer tenant `code = "AUTOHUB"` if `ACTIVE`, else first `ACTIVE` tenant, else throw `NO_ACTIVE_TENANT`.
- Uniqueness is enforced at the DB level for `lineUserId` and `email` on both `User` and `Customer` — provisioning code explicitly checks for `LINE_USER_ALREADY_LINKED` / `LINE_CUSTOMER_ALREADY_LINKED` conflicts before creating and surfaces them as thrown errors, caught upstream to redirect to `/login?error=auth`.

### 6.2 Tenancy

- Tenants are **never auto-created**. Onboarding/claim flows only ever select from existing `ACTIVE` tenants.
- No query-level tenant isolation middleware exists — every Prisma query that needs tenant scoping filters by `tenantId` explicitly in application code. When adding new queries, follow the existing pattern (explicit `where: { tenantId }`) rather than assuming isolation is automatic.

### 6.3 ServiceStore lifecycle

- Two ways to become a serviceStore operator: **claim** an existing (seeded/discovered) `ServiceStore`, or **request** a brand-new one. Both create a `PENDING` record (`ServiceStoreClaim` or `ServiceStoreOnboardingRequest`) reviewed by an admin.
- On claim approval: `User.serviceStoreId` + `tenantId` set, `ServiceStore.status → ACTIVE`, `ServiceStore.bookingEnabled → true`.
- On request approval: a new `ServiceStore` is created (`ACTIVE`, `bookingEnabled: true`), and the requesting `User` is linked.
- Business code uniqueness (`^[a-z0-9-]+$` format) is validated **twice**: once at submission, once again at admin approval (protects against a code being taken by another approval in between).
- Rejected claims/requests have **no resubmission flow** — this is a known gap, not a bug to silently "fix" without discussion.
- `/admin/service-store-requests` approve/reject actions use `assertRequestManager()`, which checks **session + linked `User` only** — not an admin role. `Role`/`UserRole` are unused. **Any authenticated domain user can approve serviceStore requests.** This is the single biggest access-control gap in the system — flag it in any security-relevant work.

### 6.4 Marketplace / bookability

- Browse only shows `ServiceStore.status === ACTIVE`. `bookingEnabled` is *not* filtered in the browse list (any active shop is discoverable) but *is* required for the "Book Now" CTA and for `createBooking()` to succeed.
- `isServiceStoreBookable()` (`lib/marketplace/booking-availability.ts`) is the canonical bookability check: approved claim + `ACTIVE` status + at least one branch with an active service.
- Store hours and ratings shown on browse/detail pages are **currently hardcoded placeholders**, not sourced from `BranchOperatingHours` — do not assume the UI reflects real operating hours.
- "Nearby" sorting uses a fixed Bangkok reference point, not device geolocation.

### 6.5 Naming: "merchant" vs "serviceStore"

The domain entity was renamed from "Merchant" to "ServiceStore" partway through development (migration `rename_merchant_to_service_store`). Both names still appear in the codebase:
- Legacy routes `/merchant/*` and `/onboarding/merchant` still exist and are 301-redirected to `/service-store/*` in `proxy.ts`.
- Some internal identifiers still say "merchant" (e.g., seed data variable `MERCHANTS`, seeded role code `MERCHANT_OWNER` referenced in an `upsert.where`, while the `create` branch uses `SERVICE_STORE_OWNER` — this is an inconsistency in `prisma/seed.ts`, not a documented feature).
- When writing new code, use "ServiceStore" — "merchant" is legacy-only and should not be introduced in new modules.

### 6.6 Data snapshotting

- `BookingItem.unitPrice` snapshots the service price at booking time (service price changes later don't retroactively change historical bookings).
- `Billing.bookingFee` / `Billing.vatRate` snapshot `PlatformSettings` at generation time — changing platform settings later does not retroactively alter already-generated billings.

---

## 7. Authentication

**Framework:** Better Auth v1.6.x, configured in `apps/web/auth.ts`.

### Configuration highlights (`auth.ts`)

- `emailAndPassword.enabled: false` — no password auth anywhere.
- Model names remapped: `user → authUser`, `account → authAccount`, `verification → authVerification`, session table `authSession`. This is deliberate separation from the domain `User` model (see §4.1).
- Session: `expiresIn` 7 days, `updateAge` 1 day.
- Plugins:
  - `genericOAuth` with a single `line()` provider config — `providerId: "line"`, PKCE enabled, redirect URI `${BETTER_AUTH_URL}/api/auth/callback/line`. `mapProfileToUser` derives a synthetic email `${lineUserId}@line.autohub.local` when LINE doesn't return one (LINE often doesn't).
  - `customSession` — enriches the session with `identity` (`{ status: "linked"|"unlinked", domainUserId }`) and `user.domainUserId`, computed via `resolveIdentityLink()`.
  - `nextCookies` — Next.js cookie integration.

### Identity resolution

`lib/auth/identity.ts` exposes `resolveIdentityLink(authUserId)`, which looks up `User.authUserId` and returns `linked`/`unlinked` + `domainUserId`. This is the join between the auth layer and the domain layer everywhere in the app — never assume `session.user.id` is a domain `User.id`; it's always the `AuthUser.id`.

### Session helpers (`lib/auth/`)

| Function | File | Behavior |
|---|---|---|
| `getServerSession()` | `session.ts` | Returns Better Auth session or `null` |
| `requireAuthSession(loginPath)` | `require-identity.ts` | Redirects to `loginPath` if no session; session-only, no provisioning |
| `requireCustomerIdentity()` | `require-identity.ts` | Auth-guards **and** auto-provisions `Customer` via `ensureCustomerProfile()`; redirects to `/open-in-line` if unauthenticated, `/login?error=auth` on provisioning failure |
| `requireServiceStoreSession()` | `require-identity.ts` | Auth-guards only, redirects to `/service-store/login`; **does not** provision a `Customer` |
| `requireAdminSession()` | `require-admin.ts` | Auth-guards only, redirects to `/admin/login`; **no role check** — any authenticated LINE session can access admin pages |
| `requireLinkedIdentity()` | `require-identity.ts` | `@deprecated` alias for `requireCustomerIdentity()` — don't use in new code |

### Route protection (`proxy.ts`)

Next.js 16 renamed `middleware.ts` to `proxy.ts` — see `AGENTS.md` at repo root: *"This is NOT the Next.js you know... Read the relevant guide in `node_modules/next/dist/docs/` before writing any code."* Don't assume training-data Next.js conventions apply; verify against the installed version's docs when touching routing/middleware-equivalent code.

`proxy.ts` logic, per request:
1. Legacy path rewrites: `/merchant/*` → `/service-store/*`, `/onboarding/merchant` → `/service-store/onboarding` (redirects, not rewrites).
2. `/api/auth/*` always passes through untouched.
3. **Unauthenticated**: marketing/login/service-store-public/admin-public paths pass through; serviceStore app paths → `/service-store/login?callbackUrl=`; admin app paths → `/admin/login?callbackUrl=`; customer app paths (and legacy `/onboarding/*`) → `/open-in-line?callbackUrl=`.
4. **Authenticated**: resolves identity; on the **customer surface only** (not serviceStore/admin), auto-provisions via `ensureCustomerProfile()` if unlinked, redirecting to `/login?error=auth` on failure.
5. Computes `serviceStoreAccessState` (`approved`/`pending`/`none`) and routes serviceStore app paths accordingly: approved → dashboard, pending → waiting, none → onboarding. `/dashboard` (legacy) always redirects to `/browse`.

Server Actions perform **their own** session checks — `proxy.ts` does not protect them directly.

### What's NOT implemented in auth

- **Platform/admin-level RBAC gate** — `Role`/`UserRole` exist in schema, unused everywhere. This is distinct from ServiceStore-portal RBAC, which *is* real (see §4.3) — the gap is specifically that nothing distinguishes "platform admin" from "any signed-in user."
- Admin-specific session distinction — `requireAdminSession()` is identical in strength to any other authenticated session; "admin" is a UI/route concept only, not an actual permission tier.
- LIFF SDK integration (`@line/liff`) — `lib/liff/*` are stubs (`auth-bridge.ts` throws/marks `LIFF_AUTH_BRIDGE_NOT_IMPLEMENTED`); in-LIFF detection is a header-check stub. The customer flow currently works via standard browser LINE OAuth, not the LIFF ID-token bridge.

---

## 8. Booking Engine

Code: `lib/booking/` (+ `lib/booking/engine/`), `lib/marketplace/booking-availability.ts`.

### State machine (`lib/booking/engine/state-machine.ts`)

```
PENDING → CONFIRMED → IN_PROGRESS → COMPLETED
PENDING → CANCELLED
CONFIRMED → CANCELLED | NO_SHOW
```

`CHECKED_IN` is a defined `BookingStatus` enum value but **has no transition into it anywhere** — `ALLOWED_TRANSITIONS` skips straight from `CONFIRMED` to `IN_PROGRESS`. Do not build UI or logic assuming `CHECKED_IN` is reachable without adding the transition first.

- `assertBookingStatusTransition(from, to)` is the guard every status-changing action must call; it rejects same-state transitions and transitions out of terminal states (`COMPLETED`/`CANCELLED`/`NO_SHOW`).
- `getTimelineUpdateForStatus(toStatus)` maps a target status to the corresponding timestamp field to set (`confirmedAt`, `startedAt`, `completedAt`, `cancelledAt`, `noShowAt`).
- Status-changing server actions and their effects (`lib/booking/actions.ts`): `confirmBooking` → `CONFIRMED`, `startBooking` → `IN_PROGRESS`, `completeBooking` → `COMPLETED`, `cancelBookingAsServiceStore` → `CANCELLED`, `markBookingNoShow` → `NO_SHOW`. Each triggers the matching LINE notification to the customer.

### Slot availability (`lib/booking/engine/available-slots.ts`, `occupancy.ts`, `time.ts`)

- Slots are generated by walking `openTime → closeTime` in `Branch.slotIntervalMinutes` increments, for the requested date's `BranchOperatingHours` row (fallback to `getDefaultOperatingHours()` if none seeded).
- A slot is only offered if `serviceDuration + bufferMinutes` fits before `closeTime`, the slot start is in the future, and existing overlapping bookings don't exceed `Branch.concurrentCapacity`.
- "Occupancy-blocking" statuses (count toward capacity) are `PENDING`, `CONFIRMED`, `CHECKED_IN`, `IN_PROGRESS` (`BLOCKING_STATUSES` in `occupancy.ts`) — `COMPLETED`/`CANCELLED`/`NO_SHOW` don't block slots.
- Overlap is computed against `[bookingDate, bookingDate + duration + buffer)` windows across all bookings at the branch for that day, summed by concurrent overlap count vs. `concurrentCapacity`.

### Booking creation (`lib/booking/actions.ts`, validated via `lib/booking/engine/validate-create.ts`)

`createBooking()` (customer, online) validates in order: future datetime, marketplace bookability (`isServiceStoreBookable`) + branch/service active, slot still available (re-checked server-side against `getAvailableSlots`, race-safe against "slot taken between pick and submit"), vehicle ownership. On success: creates `Booking` (`source: AUTOHUB`, `status: PENDING`) + `BookingItem` (price snapshot), assigns `bookingNumber` via `BookingNumberCounter`, fires `sendBookingCreated`.

`createWalkInBooking()` (serviceStore-initiated) sets `allowWalkIn: true`, which **bypasses** the marketplace-bookability check and the future-date requirement, enters directly at `status: CONFIRMED` with `confirmedAt` set, and either looks up an existing customer by phone or creates a temporary `Customer` (`isWalkIn: true`).

### Discovery / marketplace queries

`lib/booking/discovery-queries.ts`, `lib/marketplace/booking-availability.ts` — power the browse UI's bookability badges (`BOOKABLE` / `DISCOVERED` / `CLAIM_PENDING` / `SETUP_INCOMPLETE`).

### Background jobs touching bookings

`pending-booking-expiration` (every 5 minutes, `lib/jobs/services/pending-booking-expiration-job.ts`): finds `PENDING` bookings whose `bookingDate` has passed, sets `status: CANCELLED` + `cancelledAt`, batched up to 2000/run. **No customer notification is sent** for this auto-cancellation — a known gap.

### Known booking gaps

No customer-initiated cancel/reschedule (customers are told to "contact the shop directly"); no `CHECKED_IN` workflow; no serviceStore alert on a new `PENDING` booking; `sendBookingReminder` exists but nothing calls it.

---

## 9. Billing

Code: `lib/billing/` (`service.ts`, `actions.ts`, `queries.ts`, `numbering.ts`, `schemas.ts`, `format.ts`), `lib/jobs/services/monthly-billing-job.ts`, `lib/jobs/services/billing-due-reminder-job.ts`.

### Lifecycle

```
DRAFT --serviceStore submits--> SUBMITTED --admin approves--> APPROVED
                                    |                              |
                                    +--admin rejects--> REJECTED    |
                                                                   v
                                              serviceStore uploads slip
                                                                   |
                                                                   v
                                          PAYMENT_SUBMITTED --admin approves--> PAID
                                                    |
                                                    +--admin rejects--> PAYMENT_REJECTED --serviceStore re-uploads--> PAYMENT_SUBMITTED
```

### Generation (`generateBillingsForPeriod()`, `lib/billing/service.ts`)

1. Snapshot `PlatformSettings` (`bookingFee`, `vatRate`) via `getBillingSettingsSnapshot()`.
2. Find all `Booking` rows with `status = COMPLETED` and `completedAt` inside `[periodStart, periodEnd]`.
3. Group by serviceStore (via `branch.serviceStoreId`).
4. **Skip** any `[serviceStoreId, periodStart, periodEnd]` combination that already has a `Billing` row (idempotent re-run; relies on the DB unique constraint as the actual safety net for overlapping-period races).
5. Create `Billing` (`status: DRAFT`) with `subtotal = bookingFee × bookingCount`, `vat = subtotal × vatRate / 100`, `discount` hardcoded to `0` in this MVP, `total = subtotal + vat - discount`, plus one `BillingItem` per booking (fee = per-booking flat fee, not the service's own price).
6. Triggered two ways: **manually** by an admin (`/admin/billings`, fires `sendBillingGenerated` to serviceStore users with a `lineUserId`) and by the **scheduled job** `monthly-billing-generation` (cron `5 0 1 * *`, Asia/Bangkok, 1st of month 00:05 — same generation logic, **no notification sent**).

### Review flow

- Statement review: `SUBMITTED → APPROVED` (assigns `invoiceNumber` via `InvoiceNumberCounter`) or `SUBMITTED → REJECTED` (+ `rejectReason`). Approve fires `sendBillingApproved`; reject sends **no notification** (gap).
- Payment review: serviceStore uploads a slip (creates `BillingPayment`, `reviewStatus: PENDING`, moves `Billing.status → PAYMENT_SUBMITTED`) when billing is `APPROVED` or `PAYMENT_REJECTED`. Admin approves (`PAYMENT_SUBMITTED → PAID`, assigns `receiptNumber` via `ReceiptNumberCounter`, fires `sendPaymentApproved`) or rejects (`→ PAYMENT_REJECTED`, no notification, serviceStore may re-upload).

### Business rules

- One `Billing` per serviceStore per period — hard unique constraint, `[serviceStoreId, periodStart, periodEnd]`.
- One `BillingItem` per booking — hard unique constraint on `BillingItem.bookingId`; a booking can only ever appear on one billing statement, enforced at the DB layer (not just app logic).
- Fee model is **flat per completed booking** (`PlatformSettings.bookingFee`), not a percentage of service price.
- `REJECTED` billings (statement-level) have no resubmission path in this MVP.
- `billing-due-reminder` job (daily 00:00) computes overdue billings as `approvedAt + billingDueDays` in the past, for statuses `APPROVED`/`PAYMENT_REJECTED`, and writes `BillingReminderEvent` rows — **it does not send a LINE push**; the reminder mechanism is DB-only at present.

### Storage

Payment slips go through `lib/storage/` (`local-provider.ts`, `signed-url.ts`, `upload-service.ts`, `validation.ts`). `PlatformSettings.storageProvider` defaults to `"local"`. A daily `storage-cleanup` job deletes orphaned uploaded files.

---

## 10. LINE Integration

LINE is used for two purposes: **authentication** (see §7) and **outbound push notifications**. There is currently **no inbound webhook / chat integration** — `lib/messaging/webhook-registry.ts` is a stub/registry with no live handler wired to a LINE webhook endpoint.

### Notification service (`lib/line/`)

- `line-client.ts` — thin wrapper over the LINE Messaging API push endpoint; `isConfigured()` gates on channel credentials being present.
- `message-builder.ts` / `flex-builder.ts` — build LINE Flex Message payloads (rich cards) with a **plain-text fallback**. `sendLineMessages()` in `line-notification-service.ts` tries the flex message first; if the LINE API rejects it, retries with the text fallback; if both fail, returns a `FAILED`/`ERROR` result (never throws — callers don't need try/catch, they get a typed result object).
- All sends are logged via `console.log/warn/error` with a `[line-notification]` prefix, including timestamp, event name, recipient, and response body — this is the only observability layer for notification delivery today (no external logging/monitoring integration found).
- **Failure never blocks the primary action** — e.g., a booking still gets created even if the LINE push fails; the notification result is returned/logged but not surfaced as an error to the user flow that triggered it.
- Notifications require the recipient to have a `lineUserId` on file. If missing, the send is skipped and logged as `FAILED` with reason `"Recipient LINE user id is missing."` — this is a normal, expected outcome (e.g., walk-in customers without LINE), not a bug.

### Notification catalog

| Function | Event | Implemented / called |
|---|---|---|
| `sendBookingCreated` | Booking created | Yes |
| `sendBookingConfirmed` | ServiceStore confirms | Yes |
| `sendBookingStarted` | ServiceStore starts service | Yes |
| `sendBookingCompleted` | ServiceStore completes | Yes |
| `sendBookingCancelled` | Cancellation | Yes |
| `sendBookingNoShow` | No-show marked | Yes |
| `sendBookingReminder` / `sendUpcomingBookingReminder` | Reminder | **Defined but never called** |
| `sendServiceStoreApproved` | Claim/request approved | Yes |
| `sendBillingGenerated` | Billing generated | Manual generation only, not the scheduled job |
| `sendBillingApproved` | Statement approved | Yes |
| `sendPaymentApproved` | Payment slip approved | Yes |

No LINE notification exists for: claim/request rejection, billing rejection, payment rejection, new `PENDING` booking (to the shop), pending-booking auto-cancellation, or billing-due reminders (DB event only, no push).

### LIFF (`lib/liff/`)

Present as scaffolding only: `runtime.ts`, `deep-links.ts`, `types.ts`, `auth-bridge.ts` (the ID-token bridge is explicitly unimplemented), `index.ts`. The customer flow in production is expected to run inside LIFF eventually, but today authentication goes through the same browser-based LINE OAuth as the other portals — treat any LIFF-specific claims in older docs skeptically and check `lib/liff/` directly before relying on LIFF behavior.

---

## 11. Coding Conventions

- **TypeScript strict**, path alias `@/*` → `apps/web/*`, `@workspace/ui/*` → `packages/ui/src/*`.
- **Prettier**: no semicolons, double quotes, 2-space tabs, 80-char print width, `es5` trailing commas, Tailwind class sorting via `prettier-plugin-tailwindcss` against `packages/ui/src/styles/globals.css`, with `cn`/`cva` recognized as class-merging functions.
- **ESLint**: flat config, root `.eslintrc.js` is a thin ignore-only wrapper; real rules live in each workspace's `eslint.config.js`, extending `@workspace/eslint-config`. `apps/web` uses the Next.js preset (`nextJsConfig`).
- **Server Actions** are the primary mutation mechanism (`"use server"` at top of file), not a REST API — there is no `/api/bookings`, `/api/billings`, etc. The few Route Handlers that exist (`app/api/`) are for things Server Actions can't do well: the auth catch-all, slot availability (client-side polling-friendly `GET`), background job triggering, signed storage URLs, and a Google Places autocomplete/details proxy.
- **`lib/<context>/` pattern**: `schemas.ts` (Zod) → `queries.ts` (reads) → `actions.ts` (writes) → optional `domain/` or `engine/` for pure logic. Follow this shape when adding a new bounded context rather than inventing a new structure.
- **UI**: shadcn/ui components (`style: base-luma`, neutral base color) generated into `packages/ui/src/components`, imported as `@workspace/ui/components/...`; app-specific components live in `apps/web/components/<context>/`, mirroring the `lib/` context names.
- **Route groups**: `app/(customer)/` is a route group (parens = doesn't affect URL) isolating the customer portal's layout from `app/service-store/` and `app/admin/`, which are plain folders.
- **Money**: always `Prisma.Decimal`, never `number`/`float`, for prices, fees, VAT, totals — see `lib/billing/service.ts`'s `toDecimal()` helper pattern.
- **Errors as typed results, not exceptions, at UI boundaries**: booking validation (`BookingValidationResult`), LINE sends (`NotificationSendResult`), and billing generation all return `{ ok/status, ... }` discriminated unions rather than throwing, so calling Server Actions/components can render errors without try/catch. Domain-internal code (e.g., `ensureCustomerProfile`) does throw typed `Error` messages (`"LINE_USER_ALREADY_LINKED"`, `"NO_ACTIVE_TENANT"`) that calling code is expected to catch by message string.
- **Next.js 16 caveat**: this repo pins a very new Next.js (16.2.6) with breaking changes from what most training data assumes — notably `proxy.ts` replaces `middleware.ts`. `AGENTS.md` explicitly instructs checking `node_modules/next/dist/docs/` before writing routing-adjacent code. Don't assume Next 13/14/15 conventions apply.
- **Naming migration in progress**: prefer "ServiceStore" in all new code/identifiers; "merchant" is legacy (see §6.5).

---

## 12. Known Gaps / Do-Not-Assume List

Use this as a pre-flight check before building on top of any of these areas — they're real gaps in the current MVP, not documentation lag:

- **No platform/admin-level RBAC enforcement.** `Role`/`UserRole` are schema-only and unused. Any authenticated LINE session (customer, serviceStore, or otherwise) can hit `/admin/*` pages and their Server Actions, including serviceStore-request approval (`assertRequestManager()` in `lib/service-store/actions.ts`, session-only) and report export (`app/admin/reports/export/route.ts`, session-only). **This is narrower than it sounds** — it does not mean RBAC is absent everywhere in the app. The ServiceStore portal has a real, separate, working RBAC layer (`ServiceStoreMember` + `lib/service-store/domain/permissions.ts`, enforced via `requireServiceStoreContext(permission)` — see §4.3). The gap is specifically: nothing distinguishes a platform admin from any other authenticated user.
- **`CHECKED_IN` booking status is unreachable** — enum value exists, no transition sets it.
- **No customer-initiated booking cancel/reschedule.**
- **No LIFF SDK / ID-token auth bridge** — customer LINE login is standard OAuth, not LIFF.
- **No inbound LINE webhook / OA chat / Rich Menu integration.**
- **Rejected serviceStore claims/requests and rejected billings have no resubmission flow.**
- **Report export claims "Excel" but produces CSV with an `.xls` MIME type**, not a true `.xlsx`.
- **Redis is provisioned in `docker-compose.yml` but not used by any application code found** — don't assume caching/queueing infra exists just because the container is defined.
- **No automated test suite** in the repo at the time of writing.
- **`docs/architecture/*.md` is stale** — always verify booking/billing/RBAC claims in that folder against actual code or `docs/product-workflow.md` before trusting them.

---

## 13. Where to Look for More Detail

| Topic | Primary file(s) |
|---|---|
| Route protection | `apps/web/proxy.ts`, `apps/web/lib/auth/portals.ts` |
| Auth config | `apps/web/auth.ts` |
| Identity linking | `apps/web/lib/auth/identity.ts`, `lib/auth/require-identity.ts` |
| Customer provisioning | `apps/web/lib/customer/ensure-customer-profile.ts` |
| Booking state machine | `apps/web/lib/booking/engine/state-machine.ts` |
| Slot availability | `apps/web/lib/booking/engine/available-slots.ts`, `occupancy.ts` |
| Booking creation/validation | `apps/web/lib/booking/actions.ts`, `lib/booking/engine/validate-create.ts` |
| Marketplace bookability | `apps/web/lib/marketplace/booking-availability.ts` |
| ServiceStore approval | `apps/web/lib/service-store/actions.ts` |
| ServiceStore-portal RBAC (roles/permissions) | `apps/web/lib/service-store/domain/permissions.ts`, `lib/service-store/context.ts`, `lib/service-store/member-actions.ts` |
| Billing generation/review | `apps/web/lib/billing/service.ts`, `lib/billing/actions.ts` |
| LINE notifications | `apps/web/lib/line/line-notification-service.ts`, `line-client.ts`, `message-builder.ts` |
| Background jobs | `apps/web/lib/jobs/definitions.ts`, `scheduler.ts`, `registry.ts`, `runner.ts` |
| Full schema | `apps/web/prisma/schema.prisma` |
| Seed data / dev fixtures | `apps/web/prisma/seed.ts` |
| Product workflow spec (current) | `docs/product-workflow.md` |
| Architecture docs (stale) | `docs/architecture/*.md` |

---

*This file documents the codebase as of the date it was generated. It was produced by reading the Prisma schema, `auth.ts`, `proxy.ts`, the booking/billing/LINE library code, and cross-referencing against `docs/product-workflow.md`. Treat it as a snapshot — re-verify against source when the codebase has moved on, especially around the "Known Gaps" list in §12, since those are exactly the areas most likely to change next.*
