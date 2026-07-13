# AutoHub UI Development Rules

**Status:** Official engineering standard
**Applies to:** `apps/web` (Next.js App Router) and `packages/ui` (shared component library)
**Audience:** Every engineer — human or AI — writing frontend code in this repository

This document is the single source of truth for how UI is built in AutoHub. It is deliberately opinionated. Where this document conflicts with a pattern already in the codebase, treat the older pattern as debt to be migrated, not as precedent to copy. Where this document is silent, default to the simplest option consistent with the principles in §2.

---

## 1. Design Philosophy

AutoHub's interface is a working tool for two very different audiences using the same codebase: car-care shop operators running their business (Service Store Portal) and platform administrators (Admin Portal), while customers experience the product entirely inside LINE. This means the "web app" surface is 100% B2B/operator tooling — it is closer to a back-office SaaS console than a consumer product, and it should look and behave like one.

We take inspiration from a specific set of products, for specific reasons:

- **Stripe** — information density without clutter. Numbers, tables, and statuses are the content; chrome gets out of the way.
- **Linear** — speed and restraint. Fast transitions, no decorative motion, keyboard-friendly.
- **Vercel** — a monochrome-first neutral palette with a single, disciplined accent color used sparingly and consistently.
- **Shopify (Polaris)** — dense operational dashboards (orders, inventory, staff) that stay legible under real business data, not lorem ipsum.
- **Notion** — calm typography, generous whitespace, and content that reads before it decorates.

**We do not copy any of these products' visual identity.** No component should be recognizable as "the Stripe button" or "the Linear sidebar." What we borrow is the *discipline* behind them: restraint, consistency, and a bias toward function over flourish.

### AutoHub's own principles

| Principle | What it means in practice |
|---|---|
| **Modern** | Current-generation patterns: soft shadows, large radii on cards (`rounded-2xl`/`rounded-4xl`), subtle borders instead of heavy drop shadows, OKLCH-based color tokens. No skeuomorphism, no gradients-for-decoration. |
| **Simple** | Every screen has one obvious primary action. If a page needs a legend to explain itself, the design has failed, not the user. |
| **Clean** | Generous whitespace over visual noise. When in doubt, remove a border, a background tint, or a redundant label before adding one. |
| **Professional** | This is software people use to run their livelihood. No playful copy, no unnecessary illustrations, no marketing language inside the portal. Data is presented plainly and accurately — see §20 on never fabricating data in the UI. |
| **Minimal** | Ship the smallest UI that fully solves the task. Do not add a settings toggle, a filter, or a view mode "for later." See §17 (naming) and §6 (component architecture) for how this shapes structure. |
| **Enterprise-ready** | Every list has pagination. Every async action has a loading and error state. Every empty state is designed, not left blank. Multi-tenant and role-aware by default — the UI must degrade gracefully when data is missing, permissions are absent, or a feature is mid-rollout. |

If you are unsure whether a UI decision fits AutoHub, ask: *"Would this look at home in a Stripe dashboard used by a small business owner who is not a designer?"* If the answer is no, simplify.

---

## 2. UI Principles

These are non-negotiable defaults. Deviating from them requires a specific, stated reason in the PR description — not just "it looked better this way."

1. **Consistency over novelty.** Reuse an existing pattern before inventing a new one. Two similar-but-slightly-different card layouts is a bug, not a feature.
2. **Simplicity over cleverness.** Prefer a plain `<table>` over a custom virtualized grid unless you have measured a real performance problem. Prefer server-rendered HTML over client-side state unless interactivity requires it.
3. **Reusability over duplication.** If you are about to copy-paste a block of JSX for the second time, extract a component *before* the third copy exists (see §20, "Copy-paste components").
4. **Accessibility is not optional.** Every interactive element has a keyboard path, a focus state, and a correct accessible name. This is a correctness requirement, not a nice-to-have — see §14.
5. **Responsive-first.** Design and implement for the narrowest viewport that has to support the feature, then expand. Do not design at 1440px and "fix it for mobile later."
6. **Dark-mode-first, not dark-mode-also.** Every color decision is made in terms of semantic tokens (§4) that already resolve correctly in both themes. There is no separate dark-mode pass — if you hardcode a color, dark mode was never actually supported.
7. **Production-ready, not prototype-ready.** No `console.log` left in committed code, no `TODO: handle error` in a shipped path, no placeholder copy like "Lorem ipsum" or "Coming soon" button that does nothing. If a feature isn't ready, don't render its entry point.
8. **Real data or no data.** Never invent numbers, trends, or activity to make a screen look fuller (see §20). An honest empty state beats a fabricated metric.

---

## 3. Design System

AutoHub's design system is built on Tailwind CSS v4's `@theme` tokens and shadcn/ui (`style: base-luma`, configured in `packages/ui/components.json`). The tokens are defined once in `packages/ui/src/styles/globals.css` and consumed everywhere via Tailwind utility classes — never via raw hex values.

### Spacing

Use Tailwind's default spacing scale exclusively. Pick from this restricted set for the vast majority of UI — do not invent one-off values like `p-[13px]`.

| Use case | Utility |
|---|---|
| Gap between related inline elements (icon + label) | `gap-1.5` / `gap-2` |
| Gap between cards in a grid | `gap-4` (dense) or `gap-6` (airy) |
| Vertical rhythm between sections on a page | `space-y-6` |
| Card internal padding | handled by the `Card` primitive's `--card-spacing` (default `p-6`, compact `size="sm"` → `p-4`) |
| Page container padding | `p-4 md:p-6 lg:p-8` (matches the existing portal shell) |

Rule of thumb: **4 / 6 / 8** are the three paddings you should reach for 90% of the time, scaling up with breakpoint, not with nesting depth.

### Typography

- Base font is the project's configured sans stack (`--font-sans`); do not import ad-hoc fonts.
- Headings use `font-semibold` with `tracking-tight`, not `font-bold`. Bold is reserved for emphasis inside body text, not for structural headings.
- Scale:

| Role | Classes |
|---|---|
| Page title | `text-2xl font-semibold tracking-tight md:text-3xl` |
| Section title (card header) | `text-sm font-semibold` or shadcn `CardTitle` (`text-base font-medium`) |
| Body text | `text-sm` (default UI density is compact, not `text-base`) |
| Secondary / muted text | `text-sm text-muted-foreground` or `text-xs text-muted-foreground` |
| Numeric emphasis (stat values) | `text-2xl font-semibold` |

Never use more than 3 font sizes on a single screen. If a fourth size feels necessary, the hierarchy is probably wrong, not the type scale.

### Radius

The theme defines a radius scale derived from one base variable, so changing `--radius` re-scales the whole app:

```css
--radius-sm:  calc(var(--radius) * 0.6);
--radius-md:  calc(var(--radius) * 0.8);
--radius-lg:  var(--radius);
--radius-xl:  calc(var(--radius) * 1.4);
--radius-2xl: calc(var(--radius) * 1.8);
--radius-4xl: calc(var(--radius) * 2.6);
```

| Element | Radius |
|---|---|
| Cards, modals, large surfaces | `rounded-4xl` (matches the shared `Card` primitive) or `rounded-2xl` for denser contexts |
| Buttons, badges, pills | `rounded-3xl` / `rounded-full` |
| Inputs, small controls | `rounded-xl` |
| Avatars | `rounded-full` |

Never use a bare pixel radius (`rounded-[6px]`). Always use a theme radius step.

### Shadow

Shadows are used sparingly, to lift interactive/floating surfaces off the page — not decoratively on every box.

- Static cards: **no shadow**, a `border` is enough (`border border-border`) or the shared `Card` primitive's `shadow-md ring-1 ring-foreground/5` for elevated surfaces (menus, popovers).
- Hover affordance on a clickable card: `hover:shadow-md transition-shadow`.
- Never stack more than one shadow utility. Never use `shadow-2xl` outside of a true overlay (dialog, dropdown).

### Borders

- Always `border-border`, never `border-gray-200` or a hex value.
- Default border width is 1px (`border`). Reserve `border-2` for deliberate emphasis (e.g., a "current step" indicator, a dashed empty-state drop zone).
- Dashed borders (`border-dashed`) are reserved for "add new" / empty affordances, e.g., the "+ Create New Service Store" ghost card pattern already used on the Workspace Home.

### Icons

- **Lucide only.** Do not mix icon sets.
- Default size `size-4` inline with text, `size-5` for stat-card/nav icons, `size-6`–`size-7` for empty-state or hero icons. Never resize an icon with inline `style`.
- Icons are always paired with a visible label or an `aria-label` — never an icon-only button with no accessible name (see §14).

### Buttons

Use the shared `Button` / `buttonVariants` from `@workspace/ui/components/button`. Do not hand-roll button styling with raw `<button className="...">` unless you are building a genuinely new primitive inside `packages/ui`.

```tsx
import { Button, buttonVariants } from "@workspace/ui/components/button";
import { cn } from "@workspace/ui/lib/utils";

<Button>Save changes</Button>
<Button variant="outline">Cancel</Button>
<Button variant="ghost" size="icon" aria-label="Notifications"><Bell className="size-4" /></Button>

// As a Link (Button doesn't render <a>, so style the Link with the same variant):
<Link href="/app/bookings/new" className={cn(buttonVariants({ variant: "outline" }))}>
  New booking
</Link>
```

Variant usage:

| Variant | When |
|---|---|
| `default` | The one primary action on the screen/section. There should rarely be more than one per view. |
| `outline` | Secondary actions. |
| `ghost` | Toolbar/icon actions, low-emphasis inline actions. |
| `destructive` | Irreversible or dangerous actions only (delete, reject, suspend). Always paired with a confirmation step for anything non-undoable. |
| `link` | Inline text actions inside prose ("View all", "Edit"). |

### Badges

Use `Badge` from `@workspace/ui/components/badge` for status pills. Status-to-color mapping must be centralized (see the existing `STATUS_STYLES`/`STATUS_BADGE_CLASS` pattern in `components/service-store/ui/status-badge.tsx` and `app/app/page.tsx`) — never inline a one-off color decision at the call site.

```tsx
<Badge>Active</Badge>
<Badge variant="outline">Draft</Badge>
<Badge className="bg-amber-500/15 text-amber-600 dark:text-amber-400">Under review</Badge>
```

### Cards

Use `Card` / `CardHeader` / `CardTitle` / `CardDescription` / `CardContent` / `CardFooter` from `@workspace/ui/components/card` for new surfaces. A card is a *content boundary*, not a spacing hack — don't wrap something in a `Card` just to get padding; use `space-y-*` on a plain `div` instead.

```tsx
<Card>
  <CardHeader>
    <CardTitle>Recent bookings</CardTitle>
    <CardDescription>Last 8 bookings across all branches</CardDescription>
  </CardHeader>
  <CardContent className="space-y-2">{/* rows */}</CardContent>
</Card>
```

### Dividers

Use `Separator` from `@workspace/ui/components/separator`, not a bare `<hr>` or a `border-t` div, so spacing/color stay consistent and screen readers get the correct `role="separator"`.

### Containers

- Portal shells (`ServiceStorePortalShell`, `ServiceStoreWorkspaceShell`) are full-width: `flex min-h-svh flex-col`, header spans 100% viewport width, sidebar is a fixed `w-56`, main content is `flex-1` with no `max-w-*` cap. Do not reintroduce a centered `max-w-7xl mx-auto` wrapper inside page content — the shell already owns the outer width.
- Marketing/public pages (landing, login) are the exception: they are centered, narrow (`max-w-3xl`/`max-w-4xl`), single-column reading experiences. Do not apply the portal's full-width rules there.

### Grid

- Stat rows: `grid gap-4 sm:grid-cols-2 lg:grid-cols-4` (1 → 2 → 4 columns).
- Card galleries (e.g., the store picker grid): `grid gap-4 sm:grid-cols-2 lg:grid-cols-3` (1 → 2 → 3 columns), matching the mobile/tablet/desktop breakpoints in §12.
- Two-column detail layouts: `grid gap-4 lg:grid-cols-[2fr_1fr]` — collapse to a single column below `lg`, never force two columns on mobile.

---

## 4. Colors

**Never hardcode a color.** No `#15202b`, no `text-gray-600`, no `bg-white`, no `border-gray-200`, no `rgba(...)` in a `className` or inline `style`. Every color must resolve through a semantic Tailwind token defined in `packages/ui/src/styles/globals.css`.

> The codebase currently has a real gap here: several `components/service-store/*` files (built early in the project) still use hardcoded hex values like `#f4f7fa`, `#15202b`, `#8a97a5`. This is **known debt, not the standard.** New code must use semantic tokens. When you touch one of those legacy files for an unrelated reason, migrate the colors you touch — don't leave a half-hex, half-token component behind, but don't go on an unrelated repaint spree either.

### The tokens, and why each exists

| Token | Purpose | Why not a fixed color |
|---|---|---|
| `bg-background` / `text-foreground` | The page canvas and its default text color. | Flips automatically between light and dark — this is *the* base pairing every screen sits on. |
| `bg-card` / `text-card-foreground` | Any elevated surface: cards, panels, table containers. | Distinct from `background` so cards visually separate from the page in **both** themes (in dark mode, `card` is lighter than `background`, not the reverse). |
| `bg-muted` / `text-muted-foreground` | De-emphasized backgrounds and secondary text. | Guarantees sufficient contrast against `foreground` without you having to pick a gray by eye. |
| `bg-accent` / `text-accent-foreground` | Hover/focus backgrounds on interactive rows and menu items. | Distinct from `muted` so "hovering" and "muted text" never accidentally look identical. |
| `bg-primary` / `text-primary-foreground` | The one brand accent color — buttons, active nav state, focus rings. AutoHub's `--primary` is tuned to the LINE-green brand hue; it already renders correctly in both themes. | Using `primary` instead of a green hex means the brand color can be retuned once, in one file, without hunting through components. |
| `border-border` | Every border, everywhere. | The only border color that is guaranteed legible on both `background` and `card` in both themes. |
| `ring-ring` / `ring-primary` | Focus rings. | Ties focus visibility to the same accent used for primary actions — a consistent, deliberate signal, not an arbitrary blue outline. |
| `text-destructive` / `bg-destructive` | Errors, destructive actions, invalid states. | Never spell red as `text-red-600` — `destructive` is theme-aware and reserved exclusively for this meaning, so it stays meaningful. |
| `bg-popover` / `text-popover-foreground` | Menus, dropdowns, tooltips (anything in a portal). | Popovers sit above cards, so they need their own elevation step distinct from `card`. |

### Practical rule

If you find yourself typing a `#` or an arbitrary Tailwind color (`red-500`, `slate-800`, `gray-100`), stop and ask which semantic token you actually mean. The only sanctioned exception is a **status color system** with an explicit, centralized mapping (e.g., booking status → `emerald-500/15` for "completed", `amber-500/15` for "pending") — and even then, the mapping lives in exactly one file per domain, not inline at every call site.

```tsx
// ❌ Never
<div className="bg-white border border-gray-200 text-[#15202b]">

// ✅ Always
<div className="bg-card border border-border text-card-foreground">
```

---

## 5. Layout Rules

Every page type below has one canonical shape. Don't invent a new page shape for a one-off screen — fit it into the closest category.

### Dashboard

Header (title + context) → stat row → primary content (table/list + secondary panel in a `2fr/1fr` split) → secondary content (two more panels side-by-side). See §8 for the full breakdown.

### CRUD (list + create/edit)

List page: toolbar (search + filters) → table → pagination. Create/Edit page: a single-column form inside a `Card`, `max-w-2xl`, with a sticky or trailing action bar (Cancel / Save).

### Settings

Single column, `max-w-2xl`–`max-w-3xl`. Group related fields under a `CardHeader`/`CardTitle` per logical section rather than one giant form. Save action is explicit (no silent autosave) unless the field is a low-stakes toggle.

### Form (standalone)

See §9 in full. In short: label above field, helper text below field, error replaces helper text (not both), submit button reflects loading state.

### Wizard (multi-step)

Horizontal step indicator at the top (reuse the pattern already established for onboarding/application-progress steppers — numbered circles, connecting line, current step highlighted). One step's fields per screen. Back is always available except on the first step; Next is disabled until the current step validates.

### Detail Page

Header: entity name/title + status badge + primary action(s), reusing `PageShell`'s `backHref`/`title`/`description`/`actions`. Body: key facts in a `StatCard` row or definition list, then related records (bookings for a customer, services for a branch) as cards/tables below.

### List Page

Toolbar → table (desktop) or card list (mobile, see §10) → pagination. Always support empty and loading states (below).

### Empty State

Centered content inside the card/section that would otherwise hold data: an icon, a one-line explanation, and — if the emptiness is actionable — a single CTA. Never leave a blank card with no explanation.

```tsx
<div className="flex flex-col items-center gap-2 py-10 text-center">
  <CalendarX className="size-8 text-muted-foreground" />
  <p className="text-sm text-muted-foreground">No bookings yet today.</p>
</div>
```

### Loading State

Server Components loading is handled by route-level `loading.tsx` using skeletons that mirror the real layout's shape (same grid, same card count) — never a generic spinner for a whole page. Client-triggered loading (a button submitting a form) disables the trigger and shows an inline spinner/label change, not a full-page overlay.

### 404

Same portal shell as the rest of the app (header/sidebar stay, so navigation isn't lost) with a centered message, a short explanation, and a link back to the nearest sensible page (not always the homepage — e.g., "Back to bookings" from a missing booking detail).

### Error State

Distinguish **expected** errors (validation, not-found, permission-denied — shown inline, calmly, in place) from **unexpected** errors (network/server failure — shown as a dedicated error boundary with a retry action). Never show a raw stack trace or raw error message to an end user.

---

## 6. Component Architecture

`apps/web/components/` is organized by **feature domain**, mirroring `apps/web/lib/`'s bounded contexts — not by component "type" (no global `components/buttons/`, `components/modals/` dumping ground).

```
components/
  ui/               # presentational primitives specific to a portal's visual language
                     # (e.g. service-store/ui/* — Card, Badge, StatCard, form-theme)
  layout/           # cross-cutting shells: PageShell, nav configs
  auth/             # login screens, portal-selection UI
  dashboard/        # (reserved) dashboard-only composite widgets shared across dashboards
  booking/          # booking wizard, booking-status display helpers
  customer/         # customer-portal UI (browse, bookings, vehicles, profile)
  billing/          # billing/invoice UI
  service-store/    # Service Store portal: shell, sidebar, forms, setup wizard
  onboarding/       # claim/create-store wizard
  marketing/        # public landing page sections
  liff/             # LIFF-context providers/layout
```

`packages/ui/src/components/` holds **only** framework-agnostic shadcn primitives (`Button`, `Card`, `Badge`, `Avatar`, `DropdownMenu`, `Tooltip`, `Separator`, …) with no AutoHub business concepts inside them. A component belongs in `packages/ui` if and only if it has no opinion about bookings, customers, or service stores.

### When to create a reusable component

Extract a component when:
1. The same JSX shape appears **twice** with only data changing (extract on the second occurrence, don't wait for the third), **or**
2. A single JSX block mixes two responsibilities that could vary independently (e.g., a stat tile's *data formatting* vs. its *visual chrome* — see `StatCard`'s `icon` prop as a real example of extending a shared primitive without forking it).

Do **not** extract a component when:
- It would only ever have one caller and no anticipated second one — that's premature abstraction (see §20).
- The "reuse" is really just copy-pasting the same three Tailwind classes — that's what a design-token/utility convention is for, not a component.

### Single Responsibility Principle, applied to UI

A component should do exactly one of: **fetch data**, **hold interactive state**, or **render presentation**. The `*Loader` pattern already used in this codebase (`ServiceStoreSwitcherLoader`, `ServiceStorePortalUserMenuLoader`) is the canonical way to separate "an async Server Component that fetches" from "a client component that renders and handles interaction." Follow it:

```tsx
// service-store-portal-user-menu-loader.tsx — Server Component: data only
export async function ServiceStorePortalUserMenuLoader() {
  const { session } = await requireServiceStoreSession();
  return <ServiceStorePortalUserMenu displayName={session.user.name} avatarUrl={session.user.image} />;
}

// service-store-portal-user-menu.tsx — Client Component: presentation + interaction only
"use client";
export function ServiceStorePortalUserMenu({ displayName, avatarUrl }: Props) { /* ... */ }
```

---

## 7. Page Architecture

**Server Components are the default.** A file under `app/**/page.tsx` is a Server Component unless it has a hard requirement for client-side interactivity (state, effects, browser APIs, event handlers that can't be a Server Action).

Rules, in priority order:

1. **Fetch data in the page, not in a client component.** `page.tsx` calls the `lib/<domain>/queries.ts` function directly (`await getServiceStoreDashboardMetrics(...)`), server-side, no client-side `useEffect` fetch.
2. **Business logic lives in `lib/`, never in JSX.** A page component should read as a short, declarative story: *resolve context → fetch data → decide which view to render → render it.* Validation, permission checks, and status-machine transitions belong in `lib/<domain>/actions.ts` / `domain/` / `engine/`, called from the page or a Server Action — not inlined in a page's render body.
3. **The page orchestrates; it does not compute.** If a page has more than one non-trivial `if`/ternary deciding *what data to fetch*, that decision belongs in a named function in `lib/`, not inline in the component. It's fine for a page to have `if (status === "ONBOARDING") redirect(...)` — that's orchestration. It is not fine for a page to contain a 40-line function computing a "top services" ranking inline — that's business logic and belongs in `lib/reporting/queries.ts`.
4. **Client Components are an explicit, deliberate boundary**, not a default. Mark the *smallest* subtree `"use client"` — a single dropdown menu or form, never an entire page — so the rest of the tree stays server-rendered. See §15 for the performance reasoning.
5. **Server Actions over API routes** for mutations. This codebase has no generic `/api/bookings` REST layer by design — a page's forms call `"use server"` actions in `lib/<domain>/actions.ts` directly. Only reach for a Route Handler when a Server Action genuinely cannot do the job (webhooks, signed file URLs, polling endpoints — see the existing `app/api/` routes for the real precedent).

---

## 8. Dashboard Standards

Every dashboard (Service Store, Admin, Customer) follows the same anatomy, in this order:

1. **Dashboard Header** — via `PageShell`'s `title`/`description`. Title is a greeting or the page name ("Welcome back, {firstName}."); description gives context ("Performance overview for {store name}"). No redundant "Dashboard" breadcrumb above it.
2. **Stat Cards** — a `grid gap-4 sm:grid-cols-2 lg:grid-cols-4` row of `StatCard`s, each with an `icon`, a `label`, and a real, currently-true `value`. Every stat must be traceable to a real query — see §20 on fabricated metrics. If a comparison/trend isn't computed from real historical data, don't show a trend arrow.
3. **Quick Actions** — a small card or row of icon-tiles linking to the 3–5 most common *real* destinations (a real route that exists today, not an aspirational one). Reuse existing routes; don't invent a new page just to have a fourth quick action.
4. **Recent Activities** — the "recent bookings" / "recent customers" pattern: a bounded list (`take: 8`–`10`), each row a `Link` to the detail page, with a `View all` link to the full list page. Never an unbounded list on a dashboard.
5. **Charts** — only when there is a real time series to back them (see §20). A single stat number is honest; a fabricated sparkline is not. If/when real historical aggregates exist, prefer simple bar/line treatments over decorative chart libraries — Tailwind-drawn bars (`<div style={{width: '${pct}%'}} />`) are sufficient for proportion-style visualizations like "top services."
6. **Lists** — see §11.
7. **Empty State** — every one of the above sections needs its own empty state (§5); a dashboard with three data widgets and zero data should not be three empty gray boxes.
8. **Loading State** — a route-level skeleton matching the stat-row + two-column layout, not a spinner centered on a blank page.

### Recommended layout

```tsx
<PageShell title={...} description={...} nav={serviceStoreNav}>
  {/* context line: code · role · status badge */}

  <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
    <StatCard icon={...} label="..." value={...} />
    {/* × 4 */}
  </section>

  <Card>{/* Quick actions */}</Card>

  <section className="grid gap-4 lg:grid-cols-[2fr_1fr]">
    <Card>{/* Recent bookings + View all */}</Card>
    <Card>{/* Upcoming schedule */}</Card>
  </section>

  <section className="grid gap-4 lg:grid-cols-2">
    <Card>{/* Top services */}</Card>
    <Card>{/* Recent customers */}</Card>
  </section>
</PageShell>
```

---

## 9. Forms

Every field, in order top-to-bottom: **Label → Field → Description/Helper text → Error (replaces helper text when present)**.

```tsx
<div className="flex flex-col gap-1.5">
  <Label htmlFor="phone">Phone number</Label>
  <Input id="phone" placeholder="e.g. 081 234 5678" aria-invalid={!!error} aria-describedby="phone-help" />
  {error ? (
    <p id="phone-help" className="text-sm text-destructive">{error}</p>
  ) : (
    <p id="phone-help" className="text-sm text-muted-foreground">Used for booking confirmations only.</p>
  )}
</div>
```

- **Label** is always visible and always associated via `htmlFor`/`id` — never a placeholder-as-label.
- **Placeholder** shows an example value, never instructions ("e.g. 081 234 5678", not "Enter your phone number").
- **Description** is persistent helper text below the field, explaining *why* or *format*, shown even when there's no error.
- **Validation** happens on blur and on submit, not on every keystroke (don't punish the user mid-typing). Server-side validation (Zod schemas in `lib/<domain>/schemas.ts`) is the source of truth; client-side validation is a fast-feedback convenience layered on top, never a replacement.
- **Error State**: the description is replaced by the error message (don't show both at once), text goes `text-destructive`, and the field gets `aria-invalid="true"`.
- **Loading**: the submit button shows a spinner + disables itself; other fields stay enabled unless the whole form must lock during submission.
- **Disabled**: visually distinct (`disabled:opacity-50 disabled:cursor-not-allowed` — already built into the shared `Button`), and disabled fields are never the *only* explanation for why an action is unavailable — pair with a tooltip or helper text saying why.

Use `useActionState` with a Server Action for form submission (the established pattern — see `ServiceStoreOnboardingWizard`), not manual `fetch` + `useState` juggling.

---

## 10. Tables

- **Header**: `text-xs font-semibold uppercase text-muted-foreground`, never the same weight/size as body rows.
- **Sticky header**: for any table likely to scroll past one viewport (bookings, customers lists), the `<thead>` uses `sticky top-0 bg-card` so column meaning is never lost while scrolling.
- **Sorting**: sort state lives in the URL (`?sort=asc`), not component state — it must survive a refresh and be linkable. Reuse `parseSortOrder`/`parseListPaging` (existing `lib/listing/search-params.ts` helpers) rather than inventing a new query-param scheme per page.
- **Filtering**: same rule — filters are URL search params, rendered via a toolbar (`ListToolbar`) above the table, not client-only state.
- **Pagination**: every table is paginated server-side (`take`/`skip` in the query). Never fetch "all rows" and paginate client-side once the table can realistically exceed ~50 rows.
- **Hover**: `hover:bg-muted transition-colors` on rows that are clickable; rows that are not clickable get no hover treatment (don't imply interactivity that isn't there).
- **Selection**: if bulk actions exist, the selection checkbox column is pinned first, and a selection-count + bulk-action bar appears above the table only while ≥1 row is selected.
- **Responsive**: below `md`, prefer collapsing the table into a stacked card-per-row layout (label:value pairs) rather than horizontal-scrolling a cramped table. If horizontal scroll is unavoidable, wrap in `overflow-x-auto` and keep the first column (identity — name/ID) visually anchored.

---

## 11. Lists

"List" here means a compact, information-dense row layout — as distinct from a full data `<table>`. Used for: **Booking List**, **Customer List**, **Vehicle List**, **Timeline**, **Activity Feed**.

- Each row: `flex items-center gap-3 rounded-xl border border-border p-3 text-sm` (the exact pattern already used for "Recent bookings").
- An identity element always leads the row — an initials avatar (`bg-primary/10 text-primary` circle) or an icon — so the eye has a consistent anchor scanning down the list.
- Primary line is the "who/what" (customer name, vehicle plate); secondary line beneath it in `text-xs text-muted-foreground` is the "where/when" (branch · timestamp).
- A status `Badge` sits at the **end** of the primary line (right-aligned), never buried in the secondary line.
- **Timeline / Activity Feed** variant: a vertical connector line between entries (`w-px bg-border` between dot markers), most-recent entry visually emphasized (filled dot vs. hollow/muted dot for the rest) — see the "Upcoming schedule" and "Application Progress" stepper patterns already in the codebase.
- Row spacing between list items: `gap-2` for dense operational lists (bookings), `gap-4` for lighter-weight lists (recent customers).
- Every row is a single `<Link>` (not a `<div onClick>`) whenever it navigates — this is both an accessibility requirement (§14) and gets you hover/focus styling for free from the browser.

---

## 12. Responsive Design

Three target widths, using Tailwind's default breakpoints:

| Target | Breakpoint | Sidebar | Grid columns (typical) |
|---|---|---|---|
| Mobile | `< 640px` (base) | Hidden; replaced by a horizontal scroll pill-nav (`ServiceStoreMobileNav`) | 1 |
| Tablet | `sm:` (≥640px) / `md:` (≥768px) | Still hidden until `lg` | 2 |
| Desktop | `lg:` (≥1024px) and up | Visible, fixed `w-56` | 3–4 |

Rules:

- **Navigation**: the sidebar (`aside`) is `hidden lg:block`; below `lg`, `ServiceStoreMobileNav` renders instead, inside the page content, not as a drawer/hamburger overlay unless a screen genuinely has no room (this keeps navigation always one tap away, no modal state to manage).
- **Grid**: always specify the mobile (implicit `grid-cols-1`) and one or two breakpoint steps up — never jump straight to a 4-column grid with no intermediate step (`sm:grid-cols-2 lg:grid-cols-4`, not `lg:grid-cols-4` alone).
- **Spacing**: padding scales with breakpoint (`p-4 md:p-6 lg:p-8`), it does not stay fixed. Gaps inside a grid can stay constant (`gap-4`) across breakpoints — only the *container* padding needs to scale.
- **Header**: on narrow viewports, hide secondary header content (store-name text, welcome text) before hiding primary controls (avatar menu, theme toggle) — see the existing `hidden ... sm:flex` treatment on the portal header's welcome text.
- Test every new screen at 375px (mobile), 768px (tablet), and 1440px (desktop) before calling it done. If you cannot run a browser, at minimum reason through each breakpoint's grid/flex resolution explicitly.

---

## 13. Dark Mode

Dark mode is not a "theme feature," it is a **first-class rendering mode** — see §2, principle 6. There is exactly one implementation: `next-themes`'s `ThemeProvider` at the root layout, toggled via the shared `ThemeToggle` component, resolved via the semantic tokens in §4. Do not add a second theming mechanism.

- **Never hardcode a dark color.** No `dark:bg-gray-900`, no `dark:text-white`. If you're typing the `dark:` variant prefix at all outside of `packages/ui`'s own primitive definitions, you are almost certainly fighting the token system instead of using it — the tokens already flip automatically.
- **Contrast**: every text/background pairing must come from a token pair designed to go together (`bg-card` + `text-card-foreground`, not `bg-card` + `text-foreground`) so contrast is guaranteed correct in both themes without manual checking.
- **Background hierarchy**: `background` is the base canvas; `card` is one step *up* in elevation. In light mode, `card` is white-on-off-white (subtle). In dark mode, `card` is deliberately *lighter* than `background` (not darker) — this is the standard dark-mode elevation model (lighter = closer to the viewer) and is already correctly encoded in the tokens. Never invert this by hand.
- **Card hierarchy**: nested elevation (a card inside a card, a popover above a card) always steps up one token level (`background` → `card` → `popover`), never sideways.
- **Text hierarchy**: `foreground` (primary text) → `muted-foreground` (secondary) → disabled (`opacity-50` on top of either) — three steps, no more. Don't invent a fourth gray.

Verify: toggle the theme on any screen you touch and confirm no element visually disappears, no hardcoded box reveals itself as unreadable, and focus rings remain visible.

---

## 14. Accessibility

Accessibility is verified the same way correctness is: before merge, not after a complaint.

- **Semantic HTML first.** `<button>` for actions, `<a>`/`next/link` for navigation, `<table>` for tabular data, `<h1>`–`<h3>` in a real document outline (one `<h1>`-equivalent per page — `PageShell`'s `title` already renders as `<h1>`, don't add a second one). Do not build a "button" out of a `<div onClick>`.
- **ARIA is a last resort, not a first instinct.** Only add `role`/`aria-*` when semantic HTML genuinely cannot express the pattern (a custom menu, a tab set). Every icon-only control gets `aria-label`; every decorative icon gets no accessible name at all (rely on the sibling text) rather than a redundant one.
- **Keyboard navigation**: every interactive element must be reachable and operable via `Tab`/`Shift+Tab` and activated with `Enter`/`Space`. Custom components built on base-ui primitives (`DropdownMenu`, `Tooltip`) already handle this correctly out of the box — don't override their built-in keyboard handling.
- **Focus**: never remove a focus outline (`focus:outline-none` without a replacement `focus-visible:ring-*`). The shared `Button`/`Input` primitives already implement `focus-visible:ring-3 focus-visible:ring-ring/30` — reuse them instead of custom controls that drop this.
- **Contrast**: token pairs (§4, §13) already meet WCAG AA in both themes. The moment you introduce an arbitrary color, you are opting out of that guarantee and must verify contrast manually.
- **Screen reader**: form fields need a programmatically associated label (§9); status changes announced via polite live regions where relevant (e.g., "Booking confirmed" after an async action, not just a visual toast); images/avatars have meaningful `alt` text or `alt=""` if purely decorative.

---

## 15. Performance

- **Prefer Server Components** for anything that doesn't need interactivity — this is the default per §7, and it is also the primary performance lever in this stack: less client JS shipped, less hydration work, data fetched close to the database instead of round-tripping through the browser.
- **Avoid unnecessary Client Components.** A `"use client"` boundary at the top of a whole page drags every child (including ones that could've been server-rendered) into the client bundle. Push the boundary down to the smallest interactive leaf (one button, one dropdown, one form) — see the `*Loader` pattern in §6.
- **Avoid duplicated rendering / duplicated fetches.** If two sibling components need the same data, fetch it once in their common parent (a Server Component) and pass it down as props, rather than each child independently calling the same query. Where independent fetches are unavoidable (e.g., two unrelated `*Loader` components in a shared shell each resolving session context), that's an acceptable, explicit tradeoff — don't "fix" it by merging unrelated components together.
- **Memoization rules**: reach for `useMemo`/`useCallback` only when you have an actual, observed re-render cost (a large list re-filtering, a heavy computed value) — not by default on every value. Memoizing trivial computations adds complexity without benefit. Never memoize across a Server/Client boundary — Server Components don't re-render in the client sense at all.
- **Lazy loading**: images use `next/image` with appropriate `sizes`; below-the-fold, non-critical client widgets (a rarely-opened settings panel, a heavy chart) can use `next/dynamic` — but don't lazy-load something that's visible on initial paint, that just adds a loading flash.
- **Code splitting**: this is mostly automatic per-route in the App Router. The main thing you control is *not* importing a large client-only library into a Server Component's module graph unnecessarily — keep such imports inside the client leaf that actually needs them.

---

## 16. Animation

Motion in AutoHub exists to clarify state changes, not to entertain. Default to **no animation**; add one only when it answers "what just changed?"

Sanctioned, subtle transitions:

```tsx
className="transition-colors hover:bg-muted"          // hover/focus state changes
className="transition-shadow hover:shadow-md"          // clickable card lift
className="transition-all"                              // only when multiple simple properties change together (color + border), never as a catch-all for layout-affecting properties
```

- Duration: rely on Tailwind's default transition durations (~150ms). Never hand-write a duration longer than ~300ms for a UI micro-interaction — anything longer reads as sluggish, not elegant.
- Base-ui-driven components (menus, tooltips) already ship correct open/close animations (`data-open:animate-in data-open:fade-in-0 data-open:zoom-in-95`, etc.) — do not add a second competing animation on top.
- **Avoid excessive motion**: no bouncing, no spinning icons except a genuine loading spinner, no page-transition animations, no auto-playing carousels, no parallax. If a reviewer can describe an animation as "fun" or "delightful," it's probably out of place in an operator dashboard — reserve any such flourish for the public marketing site only, never the portal.
- Respect `prefers-reduced-motion` — rely on `tw-animate-css`'s defaults, which already do this; don't hand-roll a custom keyframe animation that ignores it.

---

## 17. Naming Conventions

| Category | Convention | Example |
|---|---|---|
| **Component (function/export name)** | `PascalCase`, noun phrase | `ServiceStoreWorkspaceShell`, `StatCard` |
| **File** | `kebab-case`, matches the primary export, one component's "family" per file | `service-store-workspace-shell.tsx` |
| **Folder** | `kebab-case`, named after the feature domain | `components/service-store/`, `lib/booking/` |
| **Props type** | `ComponentNameProps` or inline if trivial (≤2 fields) | `ServiceStorePortalShellProps` |
| **Hooks** | `useCamelCase`, verb-first when it performs an action | `useLiffContext`, not `useLiff` alone if it returns derived state vs. performs a side effect — name for what it *returns*, not what it wraps |
| **Types/Interfaces** | `PascalCase` noun; prefer `type` over `interface` unless you need declaration merging (you almost never do in this codebase) | `ServiceStoreWorkspaceSummary` |
| **Enums / literal unions** | Prefer a `const` object + derived union type over TypeScript `enum` (matches the existing `SERVICE_STORE_ACCESS_STATUS`/`ServiceStoreAccessStatus` pattern) | `const SERVICE_STORE_ACCESS_STATUS = { APPROVED: "approved", ... } as const` |
| **Constants** | `SCREAMING_SNAKE_CASE` for module-level fixed lists/config | `QUICK_ACTIONS`, `APPLICATION_STEPS` |
| **Boolean props** | `is`/`has`/verb-adjective, phrased so `true` reads naturally | `navLocked`, `showTitle` — not `noNav` (double negatives are a code smell: `navLocked={false}` reads fine, `noNavLocked={true}` does not) |
| **Event handler props** | `onX` for the prop, `handleX` for the local function passed to it | `onOpenChange` prop; `function handleOpenChange() {}` locally |

Never abbreviate domain nouns (`svc`, `cust`, `bkg`) — this codebase's own architecture doc is written in full words (`ServiceStore`, `Customer`, `Booking`) and component names should match exactly, so a reader can grep one term and find everything.

---

## 18. Folder Structure

```
apps/web/
├── app/                              # Routes (App Router) — thin orchestration only, see §7
│   ├── (customer)/                   # Customer portal route group
│   ├── admin/                        # Admin portal
│   ├── app/                          # Service Store portal ("/app/*")
│   │   ├── dashboard/
│   │   ├── bookings/
│   │   ├── branches/
│   │   ├── customers/
│   │   ├── billings/
│   │   ├── members/
│   │   ├── readiness/
│   │   ├── profile/
│   │   ├── setup/                    # post-approval onboarding wizard
│   │   └── page.tsx                  # bootstrap workspace (state-driven, no sub-routes)
│   └── api/                          # Route Handlers — only where a Server Action can't do the job
│
├── components/                       # UI, organized by feature domain (see §6)
│   ├── ui/                           # (reserved for cross-portal shared presentational bits, if any emerge)
│   ├── layout/                       # PageShell + nav config shared across contexts
│   ├── auth/                         # Portal login screen
│   ├── service-store/                # Service Store portal shell, sidebar, forms
│   │   ├── ui/                       # Service-Store-specific visual primitives (Card, Badge, StatCard, form theme)
│   │   └── setup/                    # onboarding-setup-wizard-specific components
│   ├── booking/
│   ├── customer/
│   ├── billing/
│   ├── onboarding/
│   ├── marketing/
│   └── liff/
│
├── lib/                              # Business logic, organized by bounded context — see §7
│   └── <domain>/
│       ├── schemas.ts                # Zod input validation
│       ├── queries.ts                # read-only Prisma queries
│       ├── actions.ts                # "use server" mutations
│       └── domain/ | engine/         # pure business logic, framework-free
│
├── hooks/                            # Cross-cutting React hooks
├── prisma/                           # schema.prisma, migrations, seed
└── scripts/                          # One-off maintenance scripts

packages/ui/
└── src/
    ├── components/                   # Framework-agnostic shadcn primitives only (no business concepts)
    ├── styles/globals.css            # The single source of truth for design tokens
    └── lib/utils.ts                  # cn() and other pure helpers
```

A new page's UI code should be findable by three questions, in order: *which portal?* → `app/<portal>/...`; *which feature domain?* → `components/<domain>/...`; *is it a generic primitive with zero business meaning?* → `packages/ui/src/components/...`. If you can't answer the third question with "yes, zero business meaning," it does not belong in `packages/ui`.

---

## 19. Code Review Checklist

Copy this into the PR description (or run through it mentally) before requesting review on any UI change.

**Responsive**
- [ ] Verified at mobile (375px), tablet (768px), and desktop (1440px) widths.
- [ ] No fixed-width elements that overflow on mobile; no forced multi-column grid below its intended breakpoint.

**Dark Mode**
- [ ] Toggled dark mode on the changed screen — nothing disappears, nothing is unreadable.
- [ ] Zero hardcoded colors (`grep`-able: no `#`, no `rgb(`, no `text-gray-`/`bg-gray-`/etc. Tailwind palette classes) introduced.

**Accessibility**
- [ ] Every interactive element has a visible label or `aria-label`.
- [ ] Tab order is logical; every action reachable and operable by keyboard alone.
- [ ] Focus rings are visible on every focusable element (none suppressed without replacement).
- [ ] Images/avatars have appropriate `alt`; decorative icons have no redundant accessible name.

**Spacing & Typography**
- [ ] Spacing values come from the standard scale (§3) — no arbitrary pixel values.
- [ ] No more than 3 font sizes on the screen; heading weights use `font-semibold`, not `font-bold`.

**Reusable Components**
- [ ] Checked for an existing component/pattern before writing new JSX from scratch.
- [ ] Any new shared component lives in the correct folder (§6, §18) and has no more than one responsibility.

**Performance**
- [ ] No unnecessary `"use client"` — the boundary is on the smallest interactive leaf, not the whole page.
- [ ] No duplicated data fetches for the same data within one render tree.

**Semantic Colors**
- [ ] All colors are semantic tokens (§4); any status-color mapping is centralized, not inlined per call site.

**Maintainability**
- [ ] `page.tsx` orchestrates only — no non-trivial business logic inlined in JSX (§7).
- [ ] No copy-pasted JSX block appearing 3+ times without being extracted.
- [ ] No fabricated data (trend arrows, activity feeds, chart series) not backed by a real query (§20).

---

## 20. UI Anti-Patterns

These are not style preferences — each one has caused, or will cause, a real bug or a real maintenance cost. Flag them in review without hesitation.

### Hardcoded colors
```tsx
// ❌
<div className="bg-white text-[#15202b] border-gray-200">
// ✅
<div className="bg-card text-card-foreground border-border">
```
Breaks dark mode by construction, and can't be retuned globally. See §4.

### Large `page.tsx`
A route file mixing data-fetching, business-rule branching, and 200 lines of JSX is unreviewable and untestable. Split: business logic to `lib/`, repeated JSX to `components/`. If a `page.tsx` needs a table of contents to read, it's too big.

### Repeated JSX
Three copies of the same card markup with different data is a bug waiting to happen — the next person who fixes a spacing issue will fix two of the three copies. Extract on the second repetition (§6).

### Magic spacing
```tsx
// ❌
<div className="mt-[13px] p-[7px]">
// ✅
<div className="mt-3 p-2">
```
Arbitrary pixel values don't compose with the spacing scale and signal "I eyeballed this," which means the next person will too, and drift accumulates.

### Inline styles
```tsx
// ❌
<div style={{ backgroundColor: "#f4f7fa", borderRadius: 12 }}>
// ✅
<div className="bg-muted rounded-xl">
```
Inline styles can't respond to dark mode, can't be themed, and bypass Tailwind's dedupe/purge entirely.

### Copy-paste components
Duplicating an existing component file with a new name and one small tweak (`ServiceStoreCard2.tsx`) instead of adding a prop to the original. This is how a design system rots into a pile of near-identical siblings — extend the original with an optional prop (see `StatCard`'s `icon` prop for the sanctioned pattern) instead.

### Massive Client Components
A `"use client"` directive at the top of an entire page, dragging every child into the client bundle "because one dropdown needed it." Push the boundary down to that one dropdown (§7, §15).

### Poor accessibility
`<div onClick={...}>` standing in for a button; icon-only controls with no `aria-label`; custom dropdowns that trap or lose keyboard focus; removed focus outlines with no replacement. Each of these silently excludes real users and is a defect, not a style nitpick (§14).

### Fabricated data
Trend arrows (`+12%`), sparklines, or "Live Activity" feeds not backed by a real, currently-computed value. This isn't just a code-quality issue — it actively misleads a business owner making decisions from this dashboard. If the data doesn't exist yet, omit the widget or show a real, honest empty/zero state instead of inventing a plausible-looking number (this was a deliberate decision made when building the Service Store dashboard — see the "Deliberately omitted" note in that page's history — and it applies everywhere else, not just there).

### Centered narrow containers inside the portal
Wrapping page content in `max-w-3xl mx-auto` *inside* a portal page, fighting the shell's own full-width layout (§3, §5). The shell already owns outer width; page content should use the full width it's given and organize itself with grids/columns, not re-narrow the viewport.

### Premature abstraction
Building a generic, configurable `<DataTable genericSortConfig={...} columnRenderers={...}>` for a single table that will only ever have one shape. Wait for a second real, concrete use case before generalizing — a slightly-duplicated plain table today is cheaper to fix later than an over-abstracted one nobody wants to touch.

---

*This document describes the standard as of the date it was written. When the underlying stack, token values, or established patterns change, update this file in the same PR — a stale standard is worse than no standard, because it actively misdirects the next contributor.*
