# AutoHub — MVP Gap Analysis

**Reviewer stance:** senior architect pass over the codebase as it exists today (not as any doc claims it exists). Every classification below was checked against `apps/web` source — `lib/`, `app/`, `prisma/schema.prisma`, and the server actions/queries that back each route. `docs/architecture/*.md` was found to be stale (it describes an earlier project phase) and `docs/product-workflow.md`, while much closer to current, is itself slightly behind in at least one place (ServiceStore staff/multi-user — see §3). This document supersedes both for MVP-readiness purposes; treat it, in turn, as a snapshot that needs re-verification once more work lands.

**Scope:** every bounded context under `apps/web/lib/`, plus the cross-cutting platform concerns (RBAC, multi-tenancy, testing, infra) that don't map to a single `lib/` folder.

**Priority scale:**

- **Critical** — security/data-integrity risk, or blocks the core money/booking loop. Fix before any external pilot.
- **High** — materially limits the MVP's usefulness or creates operational pain; fix before general availability.
- **Medium** — real gap, workable around short-term (manual process, UI stub, "contact the shop").
- **Low** — polish, future-phase, or infrastructure that's provisioned but not yet needed.

---

## 1. Classification at a Glance

| # | Module | Status | Priority (if gap) |
|---|--------|--------|--------------------|
| 1 | Authentication (LINE OAuth / Better Auth) | **Completed** | — |
| 2 | Identity Linking (`AuthUser` ↔ `User`) | **Completed** | — |
| 3 | Multi-Tenancy | **Partial** | Medium |
| 4 | Customer Auto-Provisioning | **Completed** | — |
| 5 | Customer Profile | **Partial** | Low |
| 6 | Vehicle Management | **Partial** | Medium |
| 7 | Marketplace / Discovery (Browse) | **Partial** | Medium |
| 8 | Booking Engine (slots, availability, creation) | **Completed** | — |
| 9 | Booking Status Lifecycle | **Partial** | High |
| 10 | Walk-in Booking | **Completed** | — |
| 11 | Customer Booking Cancellation / Reschedule | **Missing** | High |
| 12 | ServiceStore Onboarding (claim / request) | **Partial** | Medium |
| 13 | ServiceStore Setup Wizard & Readiness | **Completed** | — |
| 14 | ServiceStore Member Management & Portal RBAC | **Completed** | — |
| 15 | Admin ServiceStore Request Approval | **Partial** | **Critical** |
| 16 | Branch / Service / Operating Hours Management | **Completed** | — |
| 17 | ServiceStore Customer CRM | **Partial** | Low |
| 18 | Billing (generation, review, payment) | **Partial** | High |
| 19 | Platform Settings | **Completed** | — |
| 20 | Background Jobs Framework | **Completed** | — |
| 21 | LINE Outbound Notifications | **Partial** | Medium |
| 22 | LIFF Integration | **Missing** | High |
| 23 | Inbound LINE (webhook / Rich Menu / OA chat) | **Missing** | Medium |
| 24 | Google Places Integration | **Completed** (conditional) | Low |
| 25 | File Storage | **Partial** | Medium |
| 26 | Admin Reporting / Export | **Partial** | High |
| 27 | Admin Platform Dashboard | **Completed** | — |
| 28 | Platform-Level RBAC (`Role`/`UserRole`) | **Missing** | **Critical** |
| 29 | Payments (customer-facing payment collection) | **Missing** | Medium |
| 30 | Automated Testing | **Missing** | High |
| 31 | Redis / Caching / Queueing | **Missing** | Low |
| 32 | Audit Trail | **Missing** | Medium |

---

## 2. Completed Modules (brief)

These are functionally complete for MVP purposes — server actions, queries, validation, and UI all exist and are wired together. They're listed for completeness; no gap write-up follows since the brief asks for that only on Partial/Missing items.

- **Authentication** — Better Auth + LINE OAuth (`genericOAuth` + `line()`), PKCE, three independent portal entry points, session helpers per portal.
- **Identity Linking** — `resolveIdentityLink()`, `customSession` plugin, deprecated-alias cleanup already done (`requireLinkedIdentity` → `requireCustomerIdentity`).
- **Customer Auto-Provisioning** — `ensureCustomerProfile()` creates `User` + `Customer` transactionally on first customer-surface hit, with real conflict handling (`LINE_USER_ALREADY_LINKED`, `LINE_CUSTOMER_ALREADY_LINKED`).
- **Booking Engine core** — slot generation respects operating hours, `slotIntervalMinutes`, `duration + bufferMinutes`, `concurrentCapacity`; server-side re-validation on submit closes the "slot taken between pick and submit" race.
- **Walk-in Booking** — `createWalkInBooking()` bypasses marketplace-bookability/future-date checks correctly, handles both existing and temporary (`isWalkIn: true`) customers.
- **ServiceStore Setup Wizard & Readiness** — `verify-business → services → hours → payment → team → complete`, backed by `evaluateServiceStoreReadiness()` (7 concrete checks: owner, branch, service, hours, contact, payment, `READY_FOR_BOOKING`/`ACTIVE` status).
- **ServiceStore Member Management & Portal RBAC** — see §3, this is more complete than the project's own `docs/product-workflow.md` claims.
- **Branch / Service / Operating Hours CRUD** — full create/update/delete with proper uniqueness constraints (`[serviceStoreId, code]`, `[branchId, code]`).
- **Billing generation & review workflow** — idempotent generation (unique constraint as the real safety net), full `DRAFT → SUBMITTED → APPROVED → PAYMENT_SUBMITTED → PAID` state machine with rejection branches.
- **Platform Settings** — singleton CRUD for fees, VAT, company/bank/storage/locale config, correctly snapshotted onto `Billing` at generation time (not retroactive).
- **Background Jobs Framework** — registry + runner + 4 registered jobs (`monthly-billing-generation`, `pending-booking-expiration`, `billing-due-reminder`, `storage-cleanup`), execution logged to `JobExecution`.
- **Admin Platform Dashboard** — real aggregate queries (`lib/reporting/queries.ts`) across serviceStores, bookings, billings, pending queues.
- **Google Places Integration** — real HTTP calls to the Places API (autocomplete + details), not a stub; correctly gated behind `GOOGLE_MAPS_API_KEY` presence (see §3 for the one caveat).

---

## 3. Partial / Missing Modules — Detail

### 3.1 Multi-Tenancy — **Partial** (Medium)

**Why partial:** `Tenant` exists and every relevant model carries `tenantId`, and onboarding correctly restricts selection to `ACTIVE` tenants (never auto-creating one). But isolation is structural (FK) only.

**What's missing:**
- No query-level tenant-scoping middleware or helper — every Prisma query is individually responsible for filtering by `tenantId`. A single missed `where: { tenantId }` in a future query is a cross-tenant data leak, and there's no test or lint rule that would catch it.
- No tenant CRUD UI/admin flow — tenants must be seeded directly in the database.
- No tenant-scoped configuration (timezone, branding, business rules) beyond the single global `PlatformSettings` singleton, which is not tenant-scoped at all.

**Priority:** Medium. Not urgent while there's effectively one production tenant (`AUTOHUB`), but this becomes a Critical item the moment a second tenant is onboarded, since nothing currently prevents a query bug from crossing tenant boundaries.

---

### 3.2 Customer Profile — **Partial** (Low)

**Why partial:** Profile view works (`requireDomainUser()` loads customer context, LINE display name/avatar shown), but it is read-only.

**What's missing:** No profile edit (name, phone, email cannot be changed by the customer after auto-provisioning, which leaves them null unless populated elsewhere).

**Priority:** Low. Doesn't block the core booking loop; phone/email being null just means the shop can't call the customer outside LINE.

---

### 3.3 Vehicle Management — **Partial** (Medium)

**Why partial:** Creation works end-to-end (`createCustomerVehicle()`, duplicate-plate protection via `@@unique([customerId, licensePlate])`, return-to-booking flow with `safeReturnTo()` open-redirect protection).

**What's missing:** Edit and delete are UI stubs only (sheets open but don't persist changes) — no `updateCustomerVehicle()` / `deleteCustomerVehicle()` server actions exist.

**Priority:** Medium. A customer who mis-types a plate or sells a car has no way to fix or remove it; workable short-term but a real pre-GA gap.

---

### 3.4 Marketplace / Discovery (Browse) — **Partial** (Medium)

**Why partial:** Listing, search, and the bookability-badge logic (`BOOKABLE` / `DISCOVERED` / `CLAIM_PENDING` / `SETUP_INCOMPLETE` via `isServiceStoreBookable()`) are real and correctly gate the "Book Now" CTA.

**What's missing:**
- Store hours shown on browse/detail pages are **hardcoded placeholders**, not sourced from `BranchOperatingHours` — a customer can see "Open until 8 PM" on the UI while the actual configured hours say otherwise.
- Ratings and "starting price" on shop cards are placeholder UI values, not derived from real data.
- "Nearby" sort uses a fixed Bangkok reference point, not device geolocation.
- `ServiceStore.bookingEnabled` is not filtered in the browse list itself (any `ACTIVE` shop is listed regardless of whether it can actually take bookings) — only the CTA respects it.

**Priority:** Medium. These are trust/credibility issues (wrong hours shown to a paying customer) more than functional blockers — nothing crashes, but it actively misleads users, which makes it higher-priority than typical polish.

---

### 3.5 Booking Status Lifecycle — **Partial** (High)

**Why partial:** The state machine itself (`lib/booking/engine/state-machine.ts`) is correctly implemented and guarded (`assertBookingStatusTransition`, terminal-state protection), and all five reachable transitions (`confirmBooking`, `startBooking`, `completeBooking`, `cancelBookingAsServiceStore`, `markBookingNoShow`) are wired to server actions and LINE notifications.

**What's missing:**
- `CHECKED_IN` is a defined `BookingStatus` enum value with **no transition into it anywhere** — `ALLOWED_TRANSITIONS` jumps straight from `CONFIRMED` to `IN_PROGRESS`. There is no front-desk "customer arrived" step, which most car-wash/service-shop operators will expect operationally.
- No notification to the ServiceStore when a new `PENDING` booking arrives — shops must actively poll `/service-store/bookings` to notice new work, which is a real operational risk (missed bookings = lost revenue + bad customer experience).

**Priority:** High. This directly affects the core booking-fulfillment loop that the whole product exists to support. `CHECKED_IN` itself is only Medium in isolation, but the missing new-booking alert is High — a shop that doesn't notice a `PENDING` booking in time effectively fails the customer.

---

### 3.6 Customer Booking Cancellation / Reschedule — **Missing** (High)

**Why missing:** By design in this MVP — the customer-facing booking detail page explicitly tells customers to "contact the shop directly" instead of offering any self-service action. No `cancelBookingAsCustomer()` or reschedule action exists anywhere in `lib/booking/`.

**What's missing:** Any customer-initiated status change. Customers depend entirely on phone/LINE contact with the shop, and there's no mechanism (booking or notification) triggered when a customer wants to change plans — it's fully manual and out-of-band.

**Priority:** High. This is a basic expectation for any consumer booking product; its absence pushes support load onto shop operators and creates a bad first impression for anyone whose plans change (a near-certainty at scale).

---

### 3.7 ServiceStore Onboarding (claim / request) — **Partial** (Medium)

**Why partial:** Both paths (claim existing shop, request new shop) work end-to-end: search, form validation (`^[a-z0-9-]+$` business code format, checked at both submit and approval time), `PENDING` record creation, waiting-page display.

**What's missing:**
- No resubmission flow after rejection — a rejected claim/request is a dead end; the user must start over from scratch with no guided path, and the waiting page doesn't even clearly message the rejected state (per `product-workflow.md`, confirmed by the absence of any rejection-branch UI in the onboarding components).
- No exclusivity enforcement on claims — multiple different users can submit a pending claim on the same `ServiceStore` simultaneously (only one pending claim *per user* is blocked), so an admin could approve the wrong claimant with no system-level tiebreaker.

**Priority:** Medium. Rare-but-real edge cases; the missing rejection UX is more urgent than the claim-race issue since it affects every rejected applicant, not just a race condition.

---

### 3.8 Admin ServiceStore Request Approval — **Partial** (Critical)

**Why partial:** The approve/reject workflow itself is fully implemented and correct (claim approval sets `serviceStoreId`/`tenantId`/`status: ACTIVE`; request approval creates the `ServiceStore` from submitted data; both paths fire `sendServiceStoreApproved`).

**What's missing:** `assertRequestManager()` (`lib/service-store/actions.ts`) checks **only** that a session exists and resolves to a linked `User` — there is no role or permission check. Confirmed directly in code: it calls `resolveIdentityLink()` and `isIdentityLinked()` only. **Any authenticated domain user — a customer, a serviceStore staff member, anyone who has completed onboarding — can call `approveServiceStoreClaim()` / `approveServiceStoreOnboardingRequest()` / their reject counterparts directly.** This is a Server Action, so it's callable from any authenticated browser session that knows (or guesses) the endpoint exists; there is no UI-only protection here.

**Priority:** Critical. This is a genuine authorization vulnerability, not a UX gap — it allows any signed-in user to grant themselves or a colluding party control of any ServiceStore on the platform (and by extension, its bookings and billing). This should be the single highest-priority item in this document, ahead of any feature work.

---

### 3.9 ServiceStore Customer CRM — **Partial** (Low)

**Why partial:** Search and detail views work (`searchServiceStoreCustomersPaginated()`, `getServiceStoreCustomerDetail()`, `getServiceStoreVehicleDetail()`), scoped correctly to customers with a booking relationship at the shop's branches, with real aggregated metrics computed from `COMPLETED` bookings.

**What's missing:** Entirely read-only — no way for shop staff to edit customer notes/contact info or annotate a customer record from the CRM itself (the `Customer.notes` field exists in the schema but nothing in the CRM UI writes to it).

**Priority:** Low. Nice-to-have for shop operators; doesn't block booking or billing flows.

---

### 3.10 Billing — **Partial** (High)

**Why partial:** The core money-relevant logic is solid — idempotent generation via the DB unique constraint (`[serviceStoreId, periodStart, periodEnd]`), correct Decimal-based fee math, proper snapshotting of `bookingFee`/`vatRate` at generation time, and a full statement + payment review lifecycle with number assignment (`invoiceNumber`/`receiptNumber`).

**What's missing:**
- **No resubmission path for `REJECTED` billing statements** — a rejected billing is a dead end for the serviceStore with no corrective action available in the UI.
- **No rejection notifications** — statement rejection, payment rejection, and claim/request rejection all skip the LINE push (only approvals notify). A serviceStore operator can be silently stuck with no signal that something needs their attention.
- **Scheduled billing generation sends no notification** — the monthly cron job (`monthly-billing-generation`) creates `DRAFT` billings correctly but does not call `sendBillingGenerated`; only the manual admin-triggered path does. A serviceStore relying on the automatic monthly cycle will not know a new billing exists until they happen to check the portal.
- **Billing-due reminders are DB-only** — `BillingReminderEvent` rows are written but never translated into an actual LINE push, so the "reminder" system currently reminds no one.

**Priority:** High. This is the platform's revenue-collection mechanism; silent billing generation and no rejection feedback loop directly risk late/missed payments purely due to lack of notification, not any fault of the serviceStore.

---

### 3.11 LINE Outbound Notifications — **Partial** (Medium)

**Why partial:** The delivery mechanism itself is well-built — flex-message-with-text-fallback, typed non-throwing results (`NotificationSendResult`), structured logging, and correct "missing `lineUserId` is not an error" handling for walk-in customers. Six of the seven booking lifecycle events fire correctly.

**What's missing (beyond what's already covered under Billing, §3.10):**
- `sendBookingReminder` / `sendUpcomingBookingReminder` are fully implemented functions that are **never called** — there is no job or trigger anywhere in `lib/jobs/` that invokes them, so customers never receive a pre-appointment reminder despite the capability existing.
- No notification on pending-booking auto-cancellation (the `pending-booking-expiration` job cancels bookings silently).
- No notification to the ServiceStore on a new `PENDING` booking (cross-referenced in §3.5).

**Priority:** Medium overall (the billing-specific notification gaps in §3.10 are already called out as High on their own). The booking-reminder gap is a straightforward, self-contained fix since the message-building and send infrastructure already exist — it just needs a scheduled job wired up, similar to the existing `pending-booking-expiration` job.

---

### 3.12 LIFF Integration — **Missing** (High)

**Why missing:** `lib/liff/` is scaffolding only. `auth-bridge.ts` explicitly throws/returns `LIFF_AUTH_BRIDGE_NOT_IMPLEMENTED`. In-LIFF detection is a stub header check, not real LIFF SDK usage. The customer flow currently authenticates via standard browser LINE OAuth (the same mechanism as the other two portals), not the LIFF ID-token bridge.

**What's missing:** `@line/liff` SDK integration, the ID-token auth bridge, and genuine in-client detection. Without this, the product cannot function as a true LINE OA-embedded mini-app — it works today only as a browser-based site that happens to use LINE for login.

**Priority:** High, **conditional on product direction**. If the go-to-market plan depends on customers reaching AutoHub through the LINE OA Rich Menu / chat (as the "LINE-native" positioning in `docs/product-workflow.md` implies), this is a launch blocker, not a nice-to-have. If a plain mobile-web entry point is acceptable for initial pilot, this can be deferred.

---

### 3.13 Inbound LINE (webhook / Rich Menu / OA chat) — **Missing** (Medium)

**Why missing:** `lib/messaging/webhook-registry.ts` is a registration/dispatch scaffold (`registerLineWebhookHandler`, `dispatchLineWebhookEvent`) with **no route handler wired to receive actual LINE webhook POSTs**, and no handlers registered against it anywhere in the codebase. There is no Rich Menu configuration and no OA chat integration.

**What's missing:** An actual `app/api/line/webhook/route.ts` (or equivalent) receiving and verifying LINE webhook signatures, plus at least one registered handler (even a minimal "thanks, use the Rich Menu" auto-reply) to make the registry meaningful.

**Priority:** Medium. Outbound push notifications already cover the critical customer-facing signals (booking lifecycle); inbound chat is a richer experience layer, not a blocker for the core booking loop.

---

### 3.14 File Storage — **Partial** (Medium)

**Why partial:** The abstraction is clean (`StorageProvider` interface: `upload`/`delete`/`getSignedUrl`) and the local provider works for the payment-slip-upload flow used by billing today, including a working signed-URL mechanism and a daily orphan-cleanup job.

**What's missing:** `PlatformSettings.storageProvider` is a free-text field that accepts `"s3"`, `"r2"`, `"azure"`, `"gcs"` as valid-looking values, but `getStorageProvider()` **throws at runtime** for all four (`"Storage provider ... is not implemented yet."`). Only `"local"` (or any unrecognized value, via the `default` case) actually works. This means local disk storage is a hidden hard dependency — the app cannot currently be deployed to a horizontally-scaled or ephemeral-filesystem environment (e.g., most container platforms) without losing uploaded payment slips.

**Priority:** Medium for the MVP as a single-instance deployment; this becomes Critical the moment the app needs to scale beyond one server/container or run on ephemeral storage, since uploaded payment slips would not survive a redeploy.

---

### 3.15 Admin Reporting / Export — **Partial** (High)

**Why partial:** Report preview (50-row) and full export work for all five report types (`booking`, `billing`, `settlement`, `customer`, `vehicle`), with real filter support (date range, serviceStore, branch, booking status).

**What's missing:**
- **Export claims "Excel" but produces CSV with an `.xls` MIME type** (confirmed directly in `app/admin/reports/export/route.ts`: `format === "excel"` only changes the `Content-Type` header and file extension, the body is still built by the same `buildCsv()` function). Anyone opening this in modern Excel will get a "file format doesn't match extension" warning, and any downstream tooling expecting real `.xlsx` structure (multiple sheets, formatting, formulas) will fail.
- **No admin-specific authorization** — the export route checks only `requireServerSession()` + a linked `identity.domainUserId`, identical in strength to the ServiceStore-approval gap in §3.8. Any authenticated user can export platform-wide booking/billing/customer/vehicle data for any serviceStore, which is a data-exposure issue (PII: customer names, phones, vehicle plates) in addition to being an authorization gap.

**Priority:** High. The fake-Excel issue is a UX/trust problem (Medium on its own), but the missing admin-only guard means this endpoint currently permits any signed-in user — including ordinary customers — to bulk-export cross-tenant customer PII. Bundled with §3.8 and §3.16 below, this is part of the platform's most urgent security gap.

---

### 3.16 Platform-Level RBAC (`Role` / `UserRole`) — **Missing** (Critical)

**Why missing:** `Role` and `UserRole` exist in `schema.prisma` (tenant-scoped roles, composite-PK join table) but are **never read or written by any application code** — confirmed by their total absence from every server action and query file outside the generated Prisma client. No `Permission` model exists at all; the schema stops at `Role`/`UserRole` with no resource/action granularity.

**Important nuance vs. the project's own docs:** `docs/product-workflow.md` and `docs/architecture/rbac.md` describe *all* RBAC in AutoHub as unimplemented. That's no longer accurate for the **ServiceStore portal**: `lib/service-store/domain/permissions.ts` + `ServiceStoreMember` + `requireServiceStoreContext(permission)` form a real, working, portal-scoped RBAC system (five roles — `OWNER`/`MANAGER`/`STAFF`/`FINANCE`/`VIEWER` — each mapped to a concrete permission set, enforced on every member/branch/booking/billing/ownership-transfer action). That system is genuinely **Completed** (see §2) and should not be re-built.

What remains genuinely missing is everything **outside** the ServiceStore-portal member system:
- The schema-level `Role`/`UserRole` tables are dead weight — either wire them up for **Admin-portal** access control or remove them; leaving them schema-only invites someone to assume they're in effect.
- **No Admin-portal RBAC at all** — `requireAdminSession()` is session-only, identical in strength to any other authenticated session (confirmed in `lib/auth/require-admin.ts`). Combined with §3.8 and §3.15, this means the entire `/admin/*` surface — serviceStore approval, billing approval, platform settings, report export — is currently reachable by any authenticated LINE user, customer or otherwise.

**Priority:** Critical. This is the same underlying issue as §3.8 and §3.15, viewed at the platform level: there is no tier distinguishing "platform admin" from "any signed-in user" anywhere in the system. This should be treated as one workstream (introduce an actual admin-role check — using the existing `Role`/`UserRole` tables or a simpler allowlist — and apply it to `requireAdminSession()`, `assertRequestManager()`, and the report export route in one pass) rather than three separate tickets.

---

### 3.17 Payments (customer-facing payment collection) — **Missing** (Medium)

**Why missing:** No payment provider SDK or integration exists anywhere in the codebase or `package.json`. This is distinct from Billing (§3.10), which is the platform's own fee invoicing *to* serviceStores — there is no mechanism for a *customer* to pay a serviceStore (or AutoHub) for a service through the app itself.

**What's missing:** Any payment provider integration (Stripe, Omise, 2C2P, or a Thai QR/PromptPay flow would be typical for this market), booking-time payment collection, and refund handling.

**Priority:** Medium. The current model (pay the shop in person, platform bills the shop separately for the booking fee) is a workable MVP pattern and may be an intentional phase-2 item rather than an oversight — flagged here as Missing rather than a gap in something that was supposed to exist, per the project roadmap.

---

### 3.18 Automated Testing — **Missing** (High)

**Why missing:** No test framework is present in any `package.json` (root or `apps/web`), no `*.test.ts`/`*.spec.ts` files exist anywhere in the repository, and no CI configuration was found.

**What's missing:** Any unit, integration, or end-to-end test coverage. Given the amount of business-critical logic that lives in pure functions (`lib/booking/engine/*`, `lib/service-store/domain/*`, the billing math in `lib/billing/service.ts`) and is explicitly designed to be framework-free/testable, this is a missed opportunity as much as a gap — the architecture already supports easy unit testing, it's just not exercised.

**Priority:** High. Not because it blocks a feature, but because every other gap in this document (especially the Critical RBAC ones) is riskier to fix without a safety net. Recommend starting with the booking state machine, slot-availability engine, and billing generation math — these are pure, high-value, and already isolated from Next.js/Prisma runtime concerns.

---

### 3.19 Redis / Caching / Queueing — **Missing** (Low)

**Why missing:** `docker-compose.yml` provisions a Redis 8 container and `REDIS_URL` is a recognized env var, but no application code (searched across all of `lib/`) reads from or writes to Redis. All "background jobs" run synchronously on-demand (`runDueJobs()` invoked via a Route Handler, not a real scheduler/worker) rather than through any queue.

**What's missing:** Actual use of the provisioned Redis instance — for caching (e.g., marketplace browse queries, Google Places responses) or as a real job queue (the current cron-string-matching `isDueCron()` approach in `lib/jobs/scheduler.ts` only works if something external pings the trigger route at the right minute; there's no durable scheduling).

**Priority:** Low for MVP scale. Becomes relevant once traffic or job volume grows enough that synchronous, externally-triggered job execution stops being reliable.

---

### 3.20 Audit Trail — **Missing** (Medium)

**Why missing:** No model or logging mechanism captures *who* performed sensitive actions (serviceStore approval/rejection, billing approval/rejection, platform settings changes) beyond the implicit `reviewedAt`/`updatedAt` timestamps already on individual records. There's no unified, queryable log of admin actions.

**What's missing:** An `AdminAuditLog`-style model (actor, action, target, timestamp, before/after or metadata) and write-side hooks on the sensitive actions identified throughout §3.8, §3.10, and §3.15-3.16.

**Priority:** Medium, and it compounds the urgency of the RBAC gaps above — right now, even *after* RBAC is fixed, there would be no record of who approved/rejected what. Worth bundling into the same workstream as §3.16.

---

## 4. Recommended Sequencing

This is a priority-ordered punch list, not a schedule — sizing/timeline is a product-management call, not an architectural one.

1. **Access control pass (Critical, do first, as one workstream):** §3.8 (ServiceStore approval), §3.15 (report export auth), §3.16 (Admin-portal RBAC). All three share the same root cause — no real admin-tier check exists anywhere — and should be fixed together rather than patched individually.
2. **Testing foundation (High, do alongside #1):** §3.18. Stand up a test runner and cover the pure `engine`/`domain` modules before touching the access-control code, so the RBAC fix itself has a regression safety net.
3. **Revenue-loop notification gaps (High):** §3.10's silent scheduled billing generation and missing rejection notifications — serviceStores currently have no reliable signal that money is owed or that something needs correction.
4. **Core booking loop completeness (High):** §3.6 (customer cancel/reschedule) and the new-`PENDING`-booking alert half of §3.5 — both directly affect whether the platform's central transaction (a booking) completes smoothly.
5. **Trust/data-correctness issues (Medium):** §3.4's hardcoded hours/ratings (actively misleading, not just incomplete) and §3.14's storage-provider trap (silent data-loss risk on redeploy).
6. **Everything else** (§3.1, 3.2, 3.3, 3.7, 3.9, 3.11 booking reminders, 3.12, 3.13, 3.17, 3.19, 3.20) — genuine gaps, none of them urgent enough to block a controlled pilot with a small number of known serviceStores.

---

*This analysis reflects a direct read of `apps/web` source as of the current session. Where it cites a specific file/function, that claim was verified by reading the file, not inferred from other documentation. Re-verify before treating any single line as ground truth once further development lands — this is a snapshot, not a living document.*
