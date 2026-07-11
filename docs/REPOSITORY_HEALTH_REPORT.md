# AutoHub — Repository Health Report

**Reviewer stance:** senior architect health check, scored against evidence read directly from `apps/web` source — `schema.prisma`, `auth.ts`, `proxy.ts`, `next.config.ts`, both ESLint/TypeScript config layers, and representative files from every `lib/` bounded context. Every score below is followed by the specific evidence it rests on, not a general impression. This report complements (and in places corrects nuances in) `CLAUDE.md` and `docs/MVP_GAP_ANALYSIS.md` already in this repo — read together, the three give architecture reference, feature-completeness, and structural-quality views of the same codebase.

**Scoring scale (1–10):** 1–3 = broken/absent, 4–5 = present but with significant gaps, 6–7 = solid with known weaknesses, 8–9 = strong, industry-good practice, 10 = exemplary/no notes. A score of 10 is intentionally rare.

---

## Scorecard

| # | Category | Score |
|---|----------|:---:|
| 1 | Architecture | **7/10** |
| 2 | Folder Structure | **7/10** |
| 3 | Naming Consistency | **5/10** |
| 4 | Business Logic Separation | **7/10** |
| 5 | Clean Architecture | **5/10** |
| 6 | DDD Boundaries | **5/10** |
| 7 | TypeScript Quality | **8/10** |
| 8 | Prisma Schema | **7/10** |
| 9 | Security | **4/10** |
| 10 | Scalability | **4/10** |
| 11 | Performance | **6/10** |
| 12 | Technical Debt | **4/10** |
| | **Overall** | **5.8/10** |

**One-line summary:** a genuinely well-typed, sensibly-layered MVP codebase let down by an incomplete access-control model and a handful of concrete, fixable scale/debt issues — not a rewrite candidate, a hardening candidate.

---

## 1. Architecture — 7/10

**What's strong:**
- Three portals (Customer/ServiceStore/Admin) share one codebase but are cleanly separated by route group, guard function, and "home" — `PORTALS` constant (`lib/auth/portals.ts`) is the single source of truth for every route the guards and redirects reference, so there's no hardcoded-path drift between `proxy.ts` and the rest of the app.
- Server Actions are correctly used as the primary mutation mechanism, with Route Handlers reserved for the few cases that genuinely need them (auth catch-all, polling-friendly slot availability, signed upload URLs, CSV export, Google Places proxy). This is the right call for a Next.js 16 App Router app and it's applied consistently — there is no stray parallel REST API.
- Better Auth is deliberately decoupled from the domain `User` model (separate tables, explicit `authUserId` link, `resolveIdentityLink()` as the one join point) — this is a real architectural decision, documented and followed everywhere, not an accident of the ORM.
- A real background-job framework exists (registry → scheduler → runner → `JobExecution` audit log) rather than ad hoc cron scripts.

**What's weak:**
- Legacy-route handling is implemented **twice**: `next.config.ts`'s `redirects()` config and `proxy.ts`'s manual `/merchant` → `/service-store` rewrite logic both exist and both fire for overlapping paths. Two systems doing the same job is an architecture smell — a future edit to one and not the other will silently reintroduce the old routes.
- Functions named `listBrowseServiceStoresPaginated` / marketplace "paginated" queries do not actually paginate at the database layer (see §10 Scalability) — the naming implies an architectural guarantee (bounded query cost) that the implementation doesn't provide.
- No query-level tenant-isolation layer exists despite multi-tenancy being a stated architectural pillar — every one of ~35 `findMany`/query call sites is individually responsible for remembering `where: { tenantId }`. This works today because there is effectively one tenant in use, but it's a structural gap, not a stylistic one.

---

## 2. Folder Structure — 7/10

**What's strong:**
- The `lib/<context>/{schemas,queries,actions}.ts` convention is followed with real discipline across almost all 19 bounded contexts — a developer who learns the pattern once in `billing/` can navigate `booking/`, `onboarding/`, or `platform-settings/` without re-learning anything.
- `components/<context>/` mirrors `lib/<context>/` naming, and `app/` route groups (`(customer)/`) correctly isolate layouts without leaking into the URL — this is idiomatic Next.js App Router usage, not a workaround.
- Generated Prisma output is isolated to `lib/generated/prisma/` and never manually touched (confirmed — no edits to generated files anywhere in the diff-worthy code).

**What's weak:**
- Layering is inconsistent between contexts: `service-store/`, `customer/`, and `line/` each have `domain/` and/or `application/` subfolders; `booking/` uses `engine/` for the equivalent pure-logic layer instead; `billing/`, `onboarding/`, `platform-settings/`, `reporting/` have no such subfolder at all and put everything flat in `service.ts`/`actions.ts`/`queries.ts`. None of these choices is wrong in isolation, but there's no single documented convention, so which pattern to use for the *next* new context is a judgment call, not a lookup.
- Two stray empty directories were found: `lib/google/` (0 files, superseded by `lib/google-places/`) and an empty `app/api/auth/[...nextauth]/` route folder with no `route.ts` inside it (a NextAuth-era leftover next to the real Better Auth catch-all at `app/api/auth/[...all]/`). Neither is harmful, but both are exactly the kind of debris that makes a codebase feel less trustworthy to a new contributor scanning the tree.

---

## 3. Naming Consistency — 5/10

**What's strong:**
- The "ServiceStore" rename is >90% complete and consistently applied in all *new* surface area — routes, component folders, permission constants, and the domain model all say "ServiceStore," not "Merchant."

**What's weak (quantified, not a vibe):**
- 5 non-generated source files still contain literal "merchant" identifiers: `lib/auth/identity.ts`, `lib/booking/engine/validate-create.ts` (the user-facing error string is literally `"This service shop has not joined AutoHub yet."` assigned to a constant named `MERCHANT_NOT_JOINED_MESSAGE`), `lib/line/line-notification-service.ts` (event name `"MERCHANT_APPROVED"` sent to the LINE API/logs, permanently baking the old name into notification event telemetry), `lib/messaging/search.ts`, `lib/onboarding/actions.ts`.
- `prisma/seed.ts` has a genuine bug from the rename, not just stale naming: `seedTenantRole()` upserts `where: { code: "MERCHANT_OWNER" }` but `create: { code: "SERVICE_STORE_OWNER" }` — on any environment re-seeded after the rename, this will either silently leave a stale `MERCHANT_OWNER` role in place forever (never found, never updated) or throw a unique-constraint violation on the next seed run, depending on seed history. This is a correctness bug wearing a naming-consistency costume.
- Redirect/legacy-path handling for `/merchant/*` exists in three separate places (`next.config.ts`, `proxy.ts`, and route-level 301s) — functionally redundant, and each one is a place the old name has to be remembered and kept in sync.
- The git working tree (as of this review) has large in-flight renames (`app/browse/[merchantId]/...` → `app/(customer)/browse/[merchantId]/...`) uncommitted — the `merchantId` route param itself hasn't been renamed even as the folder is being moved into the new route group, so the rename is still actively incomplete, not finished-but-undocumented.

---

## 4. Business Logic Separation — 7/10

**What's strong:**
- Pure, framework-free business logic is genuinely pulled out where it matters most: `lib/booking/engine/state-machine.ts` (status transitions), `available-slots.ts`/`occupancy.ts` (slot math), and `lib/service-store/domain/{permissions,readiness}.ts` (RBAC + setup-completeness rules) are all plain TypeScript functions with no Prisma/Next.js imports in their core logic, which makes them trivially unit-testable even though no tests exist yet (see §12).
- Money math is consistently isolated behind `Prisma.Decimal` and small helpers (`toDecimal()` in `billing/service.ts`) rather than scattered `Number()` coercions.
- Server Actions consistently validate with Zod before touching Prisma, and return typed result objects (`{ ok, ... }` / `{ error, fieldErrors }`) rather than throwing across the server/client boundary — this is applied uniformly enough to be a real convention, not a one-off pattern.

**What's weak:**
- Some business logic still lives directly in Route Handlers instead of `lib/`: `app/admin/reports/export/route.ts` builds the CSV serialization (`csvEscape`, `buildCsv`) inline in the route file rather than in `lib/reporting/`, so the "how do we export data" logic is split across two layers depending on which report you're looking at (the *querying* is in `lib/reporting/queries.ts`, the *formatting* is in the route).
- `prisma` is imported directly in 60+ files across almost every context — there's no repository/data-access abstraction, so a query written against the wrong `tenantId` filter (or none at all) is a business-logic bug that compiles cleanly and passes type-checking. This is more a DDD/Clean-Architecture concern (§5, §6) than a pure separation-of-concerns one, but it's the same root cause.

---

## 5. Clean Architecture — 5/10

**What's strong:**
- There is a real inner/outer split in intent: `engine/` and `domain/` folders are meant to hold framework-agnostic rules, and `actions.ts`/`queries.ts` are meant to be the infrastructure-facing shell around them. Where this is followed (booking engine, service-store permissions/readiness), it's followed well.

**What's weak — and this is the honest reason the score isn't higher:**
- The "domain" layer is not actually decoupled from infrastructure types. `lib/booking/engine/state-machine.ts` imports `BookingStatus` directly from `@/lib/generated/prisma/client`; `lib/service-store/domain/readiness.ts`'s `ReadinessInput` type embeds `ServiceStoreStatus` from the same generated client. In Clean Architecture terms, the innermost layer (entities/business rules) should not depend on the ORM's generated types — here it does, everywhere. That's a pragmatic and defensible choice for a small team shipping an MVP, but it means "swap Prisma for something else without touching business logic" is not actually true today, which is the entire point Clean Architecture exists to guarantee.
- There are no repository interfaces or ports/adapters anywhere — `lib/line/domain/ports.ts` is the one file in the codebase that looks like it's reaching for this pattern (a `ports.ts` naming convention implies an intended interface boundary for the LINE integration), but it stands alone; no equivalent exists for Prisma/storage/Google Places, all of which are called directly from actions/queries with no interface in between (storage is the one partial exception — see §8/§10, it does have a `StorageProvider` interface, just not fully implemented behind it).
- No use-case/application-service layer distinct from Server Actions — the Server Action *is* the use case, which conflates the "adapt an HTTP-ish trigger into a call" concern with the "orchestrate the business operation" concern into one function, one file.

This is a reasonable, common pattern for a Next.js app of this size — calling it "Clean Architecture" would overstate what's actually enforced. Score reflects a layered-but-not-isolated reality.

---

## 6. DDD Boundaries — 5/10

**What's strong:**
- Bounded contexts map cleanly to real business capabilities (`booking`, `billing`, `service-store`, `customer`, `onboarding`) and the ubiquitous language is consistent — "ServiceStore," "Branch," "Booking," "Billing" mean the same thing in code, schema, and (mostly) UI copy.
- `ServiceStoreMember` + `permissions.ts` is a genuinely well-modeled aggregate: role, permission set, and the actions that mutate membership (`invite`/`remove`/`changeRole`/`transferOwnership`) are co-located and internally consistent, including real invariant protection (can't remove the last Owner, can't have an Owner change their own role without transferring first).

**What's weak:**
- No aggregate roots are enforced at the code level. `Booking` is conceptually the aggregate root for a booking's lifecycle, but `BookingItem`, `Customer`, and `Vehicle` are all mutated directly via `prisma.*` calls from multiple different contexts (`booking/actions.ts`, `customer/vehicle-actions.ts`, `billing/service.ts` all reach into booking-adjacent tables independently) rather than going through a single owning module. There's nothing preventing a future change in `billing/` from writing to `Booking` fields it shouldn't touch.
- The schema itself is a single shared kernel with no anti-corruption layers between contexts — `Billing.serviceStoreId`, `Booking.branchId`, `Customer.tenantId` are all just foreign keys any context can query across freely. That's normal for a Prisma monolith and not wrong per se, but it means context boundaries exist in the `lib/` folder structure and in developers' heads, not in anything the type system or database enforces.
- `User` straddling both "domain identity" and (via `Customer`, `serviceStoreId`, `ServiceStoreMember`) two other bounded contexts' concerns is a modeling tension the codebase itself flags (`Customer.lineUserId` and `User.lineUserId` both existing is called out in the schema as intentional duplication) — a sign the identity/customer/operator boundary was still being actively worked out rather than settled.

---

## 7. TypeScript Quality — 8/10

**What's strong:**
- `strict: true` **and** `noUncheckedIndexedAccess: true` in the shared `tsconfig` base — the latter is a meaningfully stricter setting most teams skip, and it's applied repo-wide, not just in one package.
- Zero occurrences of `any` (explicit `: any`, `as any`, `any[]`, `Record<string, any>`) found anywhere in non-generated application code — checked across all of `lib/`, `app/`, and `components/`. This is a genuinely strong result for a codebase of this size.
- Zero `@ts-ignore`/`@ts-expect-error` suppressions found anywhere.
- Exactly one non-null assertion (`!`) found in application code outside generated files — the type system is being worked *with*, not silenced.
- `typescript-eslint`'s recommended ruleset is active on top of the strict compiler settings.

**What holds this back from 9–10:**
- The shared ESLint config applies the `eslint-plugin-only-warn` plugin, which downgrades **every** rule — including `typescript-eslint`'s type-safety rules — from error to warning repo-wide. This means the excellent type-safety habits visible in the code today are a team-discipline achievement, not a tooling-enforced guarantee; nothing in CI would currently block a PR that introduces `any` or an unsafe cast. The habits are real; the safety net that would catch a regression is not.
- No `noImplicitOverride`, `exactOptionalPropertyTypes`, or similar "next tier" strictness flags are enabled — reasonable to skip for an MVP, but worth naming as the ceiling above the current strong baseline.

---

## 8. Prisma Schema — 7/10

**What's strong:**
- Consistent UUID primary keys, sensible composite unique constraints exactly where the business rules demand them (`[tenantId, code]` on `ServiceStore`, `[customerId, licensePlate]` on `Vehicle`, `[serviceStoreId, periodStart, periodEnd]` on `Billing`, `[billingId, reminderDate]` on reminders), and `BillingItem.bookingId` correctly made globally unique to enforce "one billing line per booking" at the database layer rather than trusting application code alone.
- Indexes are placed on the columns that are actually queried by in the codebase (`Booking` indexed on `tenantId`, `customerId`, `branchId`, `bookingDate`, `vehicleId` — all of which are real `where`/`orderBy` targets in `lib/booking/queries.ts` and the engine).
- Money is `Decimal` everywhere it should be, with sensible defaults (`bookingFee @default(10)`, `vatRate @default(0)`).
- Deletion semantics are deliberate, not default-accepted: `BillingItem.booking` is explicitly `onDelete: Restrict` (you cannot delete a booking that's already been billed), while most operational child records (`Branch → Service`, `ServiceStore → Branch`) cascade — the asymmetry is intentional and correct for the business rule it protects.

**What's weak:**
- `Role`/`UserRole` are fully modeled, indexed, and migrated — and completely dead. Unused schema is technical debt that actively misleads (see §12 and `docs/MVP_GAP_ANALYSIS.md` §3.16) — either wire it up for Admin-portal RBAC or remove it.
- `ServiceStoreStatus` has two enum values (`PENDING_VERIFICATION`, and effectively `ONBOARDING` alongside `READY_FOR_BOOKING`, whose semantics only partially overlap with actual code transitions) that aren't driven by any transition logic found in application code — an enum that's larger than the state machine that uses it invites bugs where a status check misses a value nobody realized was reachable (or unreachable).
- `BranchOperatingHours.openTime`/`closeTime` are stored as free-form `String` (`"HH:MM"`) rather than a `Time`/integer-minutes column — there's no database-level guarantee the string is well-formed; all validation is push-side in application code (`parseTimeToMinutes`).
- No soft-delete pattern anywhere — `Branch`/`Service` deletion is a hard delete with cascade, and per `docs/product-workflow.md`'s own admission, branch deletion doesn't check for existing bookings before deleting. Combined with `Booking.branchId` having no explicit `onDelete` behavior (defaulting to restrict-like referential-integrity error rather than a graceful in-app check), this is more likely to surface as an ugly unhandled database error than a clean validation message.

---

## 9. Security — 4/10

**What's strong:**
- No SQL injection surface: every raw query (`lib/reporting/queries.ts`, 11 call sites) uses `Prisma.sql` tagged templates with parameterized values, never `$queryRawUnsafe`/string concatenation. This was specifically checked and confirmed clean.
- No `dangerouslySetInnerHTML` anywhere in the component tree.
- OAuth uses PKCE, sessions have a real expiry/rotation policy (7-day expiry, 1-day update age), and secrets (`BETTER_AUTH_SECRET`, `LINE_CHANNEL_SECRET`, `DATABASE_URL`) are all environment-variable-sourced with no hardcoded fallback values found in source.
- File uploads go through a dedicated `lib/storage/validation.ts` module rather than trusting client-provided metadata blindly.

**What pulls this down to a 4, not higher:**
- This is the same root cause already flagged as **Critical** in `docs/MVP_GAP_ANALYSIS.md` §3.8/§3.15/§3.16, and it's severe enough to anchor the whole category: `requireAdminSession()`, `assertRequestManager()` (ServiceStore-claim approval), and the report-export Route Handler all check **only** "is there a valid session with a linked domain user" — there is no role or permission check anywhere on the admin surface. Any authenticated LINE user (including a plain customer) can, today, approve their own ServiceStore claim and bulk-export every customer's name/phone/vehicle-plate data. This is not a theoretical gap; it's confirmed directly in the three relevant source files.
- No security headers configured anywhere — no CSP, `X-Frame-Options`, `Strict-Transport-Security`, or `Referrer-Policy` in `next.config.ts` or `proxy.ts`. Default Next.js behavior only.
- No rate limiting or brute-force protection on any endpoint (auth or otherwise) — confirmed absent via search for rate-limiting libraries/patterns.
- No CSRF-specific handling beyond whatever Better Auth provides by default for its own auth endpoints; Server Actions rely entirely on Next.js's built-in Server Action origin-checking with no additional layer.

A codebase with clean injection hygiene and a wide-open authorization model is a common and dangerous combination — the "obvious" attack surface (SQLi, XSS) is closed, which can create false confidence, while the actual live gap (missing authorization tier) is easy to miss in a casual read because every individual check *looks* like a real guard — it's just checking the wrong thing.

---

## 10. Scalability — 4/10

**What's strong:**
- Prisma is wired through a proper singleton (`lib/prisma.ts`) backed by a `pg.Pool` connection pool, with the Next.js dev-hot-reload-safe `globalThis` caching pattern correctly applied — this is exactly right and avoids the classic "new connection per request" mistake.
- Billing generation is idempotent by design (relies on the DB unique constraint as the actual correctness guarantee, not just an application-level check), which is the right instinct for a job that might be retried or double-triggered.

**What pulls this down:**
- Functions explicitly named for pagination don't paginate at the query layer: `listBrowseServiceStores()` and `listBrowseServiceStoresPaginated()` (`lib/booking/discovery-queries.ts`) both call `prisma.serviceStore.findMany()` with no `take`/`skip` at all — the entire `ACTIVE` serviceStore table is fetched and mapped into memory on every browse request, and pagination (if any) happens after the fact in application code. At current seed-data scale (15 shops) this is invisible; at real marketplace scale it's an unbounded query on every page load of the app's primary landing page.
- Redis is provisioned in `docker-compose.yml` and wired as a recognized env var (`REDIS_URL`) but is not read or written by any application code found anywhere in `lib/`. There is no caching layer for anything — repeated Google Places lookups, marketplace browse queries, and dashboard aggregates all hit Postgres fresh every time.
- The job scheduler (`lib/jobs/scheduler.ts`) is a synchronous cron-string matcher (`isDueCron()`) that only runs when something external calls the trigger route at the right minute — there is no durable queue, no retry-with-backoff, and no worker process. This works as a demo/single-instance mechanism but is a single point of failure with no persistence if the trigger is missed.
- File storage is local-disk-only in practice (`getStorageProvider()` throws for `s3`/`r2`/`azure`/`gcs` — see `docs/MVP_GAP_ANALYSIS.md` §3.14), which caps the app at a single instance/persistent-filesystem deployment; this is as much a scalability ceiling as a feature gap.

---

## 11. Performance — 6/10

**What's strong:**
- The booking slot-availability engine avoids N+1 patterns where it matters most: `getAvailableSlots()` does one indexed query for the day's existing bookings and then does the overlap/capacity math in memory, rather than querying per-slot.
- Reporting dashboard metrics use raw aggregate SQL (`$queryRaw` with `COUNT`/`SUM` grouped in Postgres) rather than pulling full row sets into Node and reducing client-side — the one place this matters most (admin dashboard, likely the most frequently hit aggregate view) is done correctly.
- Indexes generally line up with actual query patterns (see §8), which is the single biggest lever for read performance and is mostly pulled correctly.

**What holds it back:**
- The flip side of §10's pagination gap: marketplace browse is a performance problem before it's a scalability problem — it's slow (not just eventually-unbounded) the moment the catalog grows past a page's worth of shops, because sorting/filtering/distance-calculation all happen in Node after a full table fetch rather than being pushed into the query.
- Billing generation (`generateBillingsForPeriod`) processes serviceStores sequentially in a `for...of` loop with an `await` per store (existence check, then create) rather than batching — fine for the current handful of seeded shops, a real linear-scaling concern once the platform has hundreds of active serviceStores generating billings once a month.
- No evidence of response caching, ISR, or `revalidate` tuning beyond a couple of ad hoc `next: { revalidate: 0 }` / `revalidate: 3600 }` calls in the Google Places client — most data-fetching paths (browse, dashboard, reports) are fully dynamic on every request.

---

## 12. Technical Debt — 4/10

This category aggregates findings already detailed above with the specific intent of asking "how much of this would slow down the next six months of feature work?"

**Concrete, itemized debt found:**
1. Incomplete "merchant → serviceStore" rename: 5 source files with lingering "merchant" identifiers (one of which — `MERCHANT_APPROVED` — is baked into LINE notification event names/logs permanently), a real seed-script bug (`MERCHANT_OWNER`/`SERVICE_STORE_OWNER` mismatch), and legacy-redirect logic duplicated across `next.config.ts` and `proxy.ts`.
2. Two stray empty directories (`lib/google/`, `app/api/auth/[...nextauth]/`) left over from earlier iterations.
3. `Role`/`UserRole` — fully migrated, indexed, unused schema that actively misrepresents the system's actual (missing) admin RBAC to anyone reading the schema in isolation.
4. Half-implemented storage-provider abstraction (`StorageProvider` interface exists, only `local` works, four other provider names are accepted by config but throw at runtime).
5. `docs/architecture/*.md` (pre-existing in the repo) is badly stale — describes an earlier project phase where booking/billing/RBAC were "schema only," which is no longer true. Anyone onboarding from those docs alone would build on false assumptions. (Already flagged and worked around in `CLAUDE.md`.)
6. The working tree itself, as of this review, has large in-flight uncommitted renames (route-group restructuring, `merchantId` → presumably `serviceStoreId` param renames not yet finished) — a sign of an actively-churning codebase where "current state" and "intended state" are still converging.
7. No automated test suite of any kind (already the anchor finding of `docs/MVP_GAP_ANALYSIS.md` §3.18) — every other item in this list is riskier to fix without one, which compounds the debt rather than sitting alongside it.

**Why 4 and not lower:** none of this debt is architecturally entangled — each item above is independently fixable in isolation (rename a few identifiers, delete two folders, decide Role/UserRole's fate, pick one storage provider to actually finish) without a rewrite or a cascading refactor. That's meaningfully better than debt that's load-bearing. It's still real, current, and enumerable — which is why it isn't a 6 or 7.

---

## Summary: Top 5 Strengths

1. **TypeScript discipline** — strict mode, `noUncheckedIndexedAccess`, zero `any`, zero suppressions, across the entire codebase. Rare at this consistency.
2. **Server Action + Zod + typed-result convention** — applied uniformly enough that it functions as a real architectural guarantee, not just a style preference.
3. **Prisma schema modeling** — constraints and indexes generally match real query/business-rule needs, not just CRUD defaults.
4. **ServiceStore-portal RBAC** (`ServiceStoreMember` + `permissions.ts`) — a genuinely well-designed, invariant-protected mini-system that's easy to miss because the project's own docs undersell it.
5. **Clean SQL-injection hygiene** — every raw query is parameterized via `Prisma.sql`, checked explicitly and confirmed.

## Summary: Top 5 Risks (in priority order)

1. **No admin-tier authorization anywhere** (Security, §9) — any signed-in user can approve ServiceStore claims and export all customer PII. Fix before any external exposure.
2. **Marketplace browse is unbounded at the query layer** (Scalability/Performance, §10–11) despite being named "paginated" — will degrade as the shop catalog grows, and misleads anyone reading the function name.
3. **No automated tests** (Technical Debt, §12) — makes every other fix on this list riskier than it needs to be, especially the authorization fix in #1.
4. **Storage is silently local-disk-only** (Scalability, §10) — deploying to any ephemeral-filesystem host loses uploaded payment slips with no warning at deploy time, only at first upload failure or redeploy.
5. **Incomplete rename + dead schema** (Naming/Technical Debt, §3, §12) — individually minor, collectively a tax on every new contributor's first few weeks of navigating the codebase, and the seed-script bug is a real (if low-stakes) correctness issue.

---

*This report reflects a direct read of repository source at the time of this session — file contents, config files, and targeted greps across `lib/`, `app/`, and `components/` (excluding generated code). Scores are evidence-anchored, not derived from any prior document in this repo. As with `CLAUDE.md` and `docs/MVP_GAP_ANALYSIS.md`, treat this as a snapshot to re-verify once further development lands, particularly given the in-flight renames observed in the working tree at review time.*
