# AutoHub Design System

**Status:** Official design handbook
**Owner:** Design + Frontend Engineering
**Applies to:** Merchant (Service Store) Dashboard, Admin Dashboard, and all future AutoHub surfaces built on `packages/ui`
**Companion document:** [`docs/frontend/ui-development-rules.md`](../frontend/ui-development-rules.md) covers engineering process (component architecture, naming, page structure). This document covers the **visual language**: tokens, color, type, spacing, and component appearance. Where the two overlap, this document is the source of truth for *values*; the other is the source of truth for *process*.

> **Note on the reference image:** no image file was attached to the request that produced this document. The system below was built directly from the extremely detailed written brief (Stripe / Linear / Vercel / Shopify / Notion inspiration, explicitly *not* Material Design, full token/scale/component requirements). If a reference image is provided later, treat it the same way this document already treats all its inspirations — as a mood signal to interpret, never as a file to trace.

---

## 0. How to read this document

Every color, size, and spacing value below is a **recommendation with a reason**, not an arbitrary number. Where AutoHub's current shipped implementation (`packages/ui/src/styles/globals.css`) already matches this system, that's confirmed inline. Where this document *extends* the current implementation (e.g., adding `warning`/`info` as first-class tokens, which don't exist yet), that's called out explicitly as a **recommended addition**, not a claim about what's already live. Never present an aspirational value as if it's already implemented — that's how design systems rot into documentation nobody trusts.

---

## 1. Brand Identity

### Brand personality

AutoHub is the operating system for a car-care business, not a consumer app. Its personality is **the calm, competent shop manager**: it knows the schedule, the revenue, and the customer history without needing to perform confidence through decoration. Five words define it:

| Trait | What it looks like in the UI |
|---|---|
| **Modern** | OKLCH-based color tokens, soft large radii, no gradients-for-decoration, no drop-shadow skeuomorphism. |
| **Premium** | Generous whitespace, restrained color use (one accent, everything else neutral), typography that never shouts. |
| **Enterprise** | Every state is designed (loading, empty, error, permission-denied); nothing is a placeholder; the product behaves the same at 5 bookings/day and 5,000. |
| **Friendly** | Warm micro-copy ("Welcome back, {name}."), a single approachable accent color (green — evokes "go," "confirmed," "healthy business" without resorting to primary-color blue like every other B2B tool). |
| **Data-focused** | Numbers are large and confident (`text-2xl font-semibold`); charts and stats are the content, not an illustration next to the content. |

### Visual language

- **One accent color, used sparingly.** AutoHub's brand color is a confident emerald-green (see §2). It appears on primary buttons, active navigation states, focus rings, and positive/brand moments — nowhere else. A screen with green everywhere has no hierarchy; a screen with exactly one green element has an obvious next action.
- **Neutral does the heavy lifting.** 90% of any AutoHub screen is neutral gray-scale (backgrounds, borders, body text). Color is a pointer, not a wash.
- **Large, soft radii over sharp corners.** Cards and dialogs round generously (`rounded-2xl`–`rounded-4xl`); this is one of the clearest ways AutoHub visually distances itself from boxy, sharp-cornered Material Design.
- **Borders over shadows for static structure.** A 1px `border-border` separates a card from the page. Shadow is reserved for things that are genuinely elevated — menus, popovers, dialogs, and hover states on clickable surfaces (§7).
- **Numbers are typographically the loudest thing on the page.** Nothing outranks a stat value in visual weight except a page title.

### Design philosophy

1. **Function before decoration.** Every visual choice must answer "does this help the operator understand their business faster?" If not, remove it.
2. **One system, two audiences.** The same tokens, the same components, the same rules serve the Merchant Dashboard and the Admin Dashboard. They differ in *content*, never in *visual language*.
3. **Consistency compounds.** A design system's value is not any single rule — it's that 200 screens built by different people, over years, still look like one product.
4. **Honest data, always.** A design system is not just color and spacing — it also governs what the UI is allowed to claim. AutoHub never fabricates a trend arrow, a sparkline, or an activity feed entry that isn't backed by a real, currently-computed value. An honest zero beats a fabricated twelve percent.

---

## 2. Color System

AutoHub uses seven color families. Each is a full 11-step scale (`50`→`950`), generated with roughly even *perceptual* lightness steps (this is why the implementation token in `globals.css` is OKLCH, not hex/HSL — OKLCH steps look evenly spaced to the human eye, HSL steps do not).

Values below are given as hex for readability in this document; the shipped implementation encodes the same ramps as OKLCH custom properties.

### Primary — AutoHub Green

The brand color. Used for primary actions, active nav/tab state, focus rings, links, and brand moments. **Never** used for large background fills (no green page backgrounds) — it's a pointer color, not a wash.

| Step | Hex | Typical use |
|---|---|---|
| 50 | `#ECFDF5` | Success/brand-tinted card backgrounds, subtle highlight fills |
| 100 | `#D1FAE5` | Hover background behind a primary-colored icon/badge |
| 200 | `#A7F3D0` | Disabled-but-visible primary chip backgrounds |
| 300 | `#6EE7B7` | Decorative accents on marketing surfaces only |
| 400 | `#34D399` | **Dark-mode primary** (text/icons/borders on dark backgrounds — lighter step needed for contrast, see §4) |
| 500 | `#10B981` | Secondary emphasis — icon fills, chart accents |
| **600** | **`#059669`** | **Light-mode primary** — solid button fill, active nav indicator, focus ring, links |
| 700 | `#047857` | Primary button hover/pressed state (light mode) |
| 800 | `#065F46` | High-emphasis text on light, tinted backgrounds |
| 900 | `#064E3B` | Rarely used directly; reserved for extreme-contrast edge cases |
| 950 | `#022C22` | Reserved |

### Secondary — Slate (reuses the Neutral ramp)

AutoHub does not maintain a second, separate brand-adjacent hue for "secondary." Reusing Neutral avoids introducing a color nobody can explain the purpose of. `secondary` background = Neutral-100 (light) / Neutral-800 (dark); `secondary-foreground` = Neutral-900 (light) / Neutral-50 (dark). Used for secondary buttons, low-emphasis pills, and any "the other choice, not the highlighted one" affordance.

### Success — Green

Deliberately **hue-shifted away from Primary** (Primary leans teal/emerald; Success leans a purer grass-green) so a reviewer can tell "this is the brand color" from "this is a positive status" at a glance, even though both are green. **Rule: Primary = brand/interactive. Success = confirmation/positive status only. Never use one to mean the other.**

| Step | Hex | Typical use |
|---|---|---|
| 50 | `#F0FDF4` | Success alert/banner background |
| 100 | `#DCFCE7` | Success badge background (light mode) |
| 200 | `#BBF7D0` | Success badge border |
| 300 | `#86EFAC` | — |
| 400 | `#4ADE80` | **Dark-mode success text/icon** |
| 500 | `#22C55E` | Success icon fill |
| **600** | **`#16A34A`** | **Light-mode success text/icon**, "Paid," "Completed," "Active" status |
| 700 | `#15803D` | Success text on tinted background (higher contrast) |
| 800 | `#166534` | — |
| 900 | `#14532D` | — |
| 950 | `#052E16` | — |

### Warning — Amber

| Step | Hex | Typical use |
|---|---|---|
| 50 | `#FFFBEB` | Warning banner background |
| 100 | `#FEF3C7` | Warning badge background |
| 200 | `#FDE68A` | Warning badge border |
| 300 | `#FCD34D` | — |
| 400 | `#FBBF24` | **Dark-mode warning text/icon** |
| 500 | `#F59E0B` | Warning icon fill |
| **600** | **`#D97706`** | **Light-mode warning text**, "Pending," "Under Review," "Outstanding" |
| 700 | `#B45309` | Warning text on tinted background |
| 800 | `#92400E` | — |
| 900 | `#78350F` | — |
| 950 | `#451A03` | — |

### Danger — Red

Reserved exclusively for destructive actions, errors, and failure states. Never used decoratively.

| Step | Hex | Typical use |
|---|---|---|
| 50 | `#FEF2F2` | Error banner/alert background |
| 100 | `#FEE2E2` | Error badge background |
| 200 | `#FECACA` | Error badge border, destructive button hover ring |
| 300 | `#FCA5A5` | — |
| 400 | `#F87171` | **Dark-mode danger text/icon** |
| 500 | `#EF4444` | Danger icon fill |
| **600** | **`#DC2626`** | **Light-mode danger text**, destructive button background |
| 700 | `#B91C1C` | Destructive button hover/pressed |
| 800 | `#991B1B` | — |
| 900 | `#7F1D1D` | — |
| 950 | `#450A0A` | — |

### Info — Blue

Reserved for neutral, non-urgent informational messaging (tips, "did you know," system notices). AutoHub's only use of blue — kept intentionally distinct from Primary's green so information never reads as an action.

| Step | Hex | Typical use |
|---|---|---|
| 50 | `#EFF6FF` | Info banner background |
| 100 | `#DBEAFE` | Info badge background |
| 200 | `#BFDBFE` | Info badge border |
| 300 | `#93C5FD` | — |
| 400 | `#60A5FA` | **Dark-mode info text/icon** |
| 500 | `#3B82F6` | Info icon fill |
| **600** | **`#2563EB`** | **Light-mode info text** |
| 700 | `#1D4ED8` | — |
| 800 | `#1E40AF` | — |
| 900 | `#1E3A8A` | — |
| 950 | `#172554` | — |

### Neutral — Slate

The workhorse scale: backgrounds, borders, and 90%+ of all text.

| Step | Hex | Typical use |
|---|---|---|
| 50 | `#F8FAFC` | Page background (light mode) |
| 100 | `#F1F5F9` | Hover background, muted surface background |
| 200 | `#E2E8F0` | Borders (light mode), dividers |
| 300 | `#CBD5E1` | Input borders, disabled control borders |
| 400 | `#94A3B8` | Placeholder text, disabled text |
| 500 | `#64748B` | Muted/secondary text (light mode) |
| 600 | `#475569` | Icon default color on light backgrounds |
| 700 | `#334155` | Secondary heading text |
| 800 | `#1E293B` | Card background (dark mode elevation step) |
| 900 | `#0F172A` | Primary text (light mode), page background (dark mode) |
| 950 | `#020617` | Highest-emphasis text/near-black surfaces |

### Shade-selection rule of thumb

- **50–100**: backgrounds and fills only, never text (fails contrast).
- **200–300**: borders and dividers.
- **400–500**: placeholder text, icons, disabled states, decorative accents.
- **600**: the default "colored text/icon on a light background" step for every family — this is the step used for badges, links, and status text in light mode.
- **700–800**: hover/pressed states for step-600 elements; high-emphasis text.
- **900–950**: reserved for maximum-contrast edge cases (rarely used directly; usually you want `foreground`/`900` for text instead of reaching into a color family this deep).

---

## 3. Light Theme

| Role | Value | Rationale |
|---|---|---|
| **Background** | Neutral-50 (`#F8FAFC`) | A near-white, not pure white — lets white/near-white cards visually lift off the page without needing a shadow. |
| **Card** | White (`#FFFFFF`) | One elevation step above Background — the single most important light-mode contrast to get right. |
| **Sidebar** | Same as Background (`#F8FAFC`), 1px `border-r` in Neutral-200 | A colored/dark sidebar rail is a Material-Design signature AutoHub deliberately avoids — the sidebar recedes, navigation items provide their own visual weight. |
| **Header** | Same as Card (`#FFFFFF`), 1px `border-b` in Neutral-200 | Reads as "the topmost elevated strip," consistent with Card's elevation. |
| **Border** | Neutral-200 (`#E2E8F0`) | Visible enough to define structure, never loud enough to compete with content. |
| **Hover** | Neutral-100 (`#F1F5F9`) | A one-step-up wash from Background — perceptible, not jarring. |
| **Muted** | bg Neutral-100 / text Neutral-500 | For de-emphasized surfaces: secondary stat hints, disabled-but-visible sections. |
| **Primary** | Primary-600 (`#059669`) text/icon on white; Primary-600 fill + white text for solid buttons | 600 is the first step in the Primary ramp that clears 4.5:1 contrast against white. |
| **Text** | Neutral-900 (`#0F172A`) primary, Neutral-500 (`#64748B`) secondary | Two steps only — see §12 for why a third gray is a smell. |

---

## 4. Dark Theme

Dark mode is not "light mode with colors flipped" — every value below is independently chosen, because saturated colors that work on white frequently fail (or glow uncomfortably) on near-black.

| Role | Value | Rationale |
|---|---|---|
| **Background** | Custom near-black with a cool tint, `#0B0F14` (≈ Neutral-950 with a slight blue-green shift) | A *tinted* black, not `#000000` — pure black creates harsh edges against any colored icon or badge; a tinted near-black feels intentional. |
| **Card** | `#12171D` — one step **lighter** than Background | Dark-mode elevation is the inverse of light mode: surfaces closer to the viewer get *lighter*, not darker. Getting this backwards is the single most common dark-mode bug. |
| **Sidebar** | Same as Background (`#0B0F14`), 1px `border-r` in `white/10%` | Mirrors the light-mode "sidebar recedes" rule. |
| **Header** | Same as Card (`#12171D`), 1px `border-b` in `white/10%` | Consistent elevation with Card. |
| **Border** | White at 10% opacity (`rgb(255 255 255 / 0.10)`), **not** a fixed gray hex | An alpha-based border remains correctly visible against *any* of the elevation steps above (Background, Card, Popover) without needing a different gray per surface — this is the technique already used in AutoHub's shipped dark theme and should be treated as the standard, not a one-off. |
| **Hover** | White at 5–8% opacity overlay | Same alpha-over-content technique as Border, for the same reason. |
| **Muted** | bg `#171C23` (Card + a touch more lightness) / text Neutral-400 (`#94A3B8`) | |
| **Primary** | Primary-400 (`#34D399`) for text/icons/borders on dark surfaces; Primary-500/600 acceptable for solid button fills (white text still passes) | Saturated dark greens (600–700) lose contrast against near-black — dark mode always shifts a color family *lighter*, not just "the same 600." |
| **Text** | Neutral-50 (`#F8FAFC`) primary, Neutral-400 (`#94A3B8`) secondary | Never pure white (`#FFFFFF`) for body text at this scale — it vibrates against a dark background; an off-white is calmer and still passes AA easily. |

---

## 5. Semantic Tokens

Components must **only** reference semantic tokens — never a raw color-family step, and never a hardcoded value. The table below is the authoritative token list; the CSS block after it is the literal, drop-in implementation (Tailwind v4 `@theme` syntax, matching the pattern already in `packages/ui/src/styles/globals.css`).

| Token | Light | Dark |
|---|---|---|
| `background` | Neutral-50 | `#0B0F14` |
| `foreground` | Neutral-900 | Neutral-50 |
| `card` | White | `#12171D` |
| `card-foreground` | Neutral-900 | Neutral-50 |
| `popover` | White | `#171C23` |
| `popover-foreground` | Neutral-900 | Neutral-50 |
| `primary` | Primary-600 | Primary-400 |
| `primary-foreground` | White | Neutral-950 |
| `secondary` | Neutral-100 | Neutral-800 |
| `secondary-foreground` | Neutral-900 | Neutral-50 |
| `muted` | Neutral-100 | `#171C23` |
| `muted-foreground` | Neutral-500 | Neutral-400 |
| `accent` | Neutral-100 | `white/10%` |
| `accent-foreground` | Neutral-900 | Neutral-50 |
| `border` | Neutral-200 | `white/10%` |
| `input` | Neutral-200 | `white/15%` |
| `ring` | Primary-600 | Primary-400 |
| `destructive` | Danger-600 | Danger-400 |
| `destructive-foreground` | White | Neutral-950 |
| `warning` *(recommended addition)* | Warning-600 | Warning-400 |
| `warning-foreground` *(recommended addition)* | White | Neutral-950 |
| `success` *(recommended addition)* | Success-600 | Success-400 |
| `success-foreground` *(recommended addition)* | White | Neutral-950 |
| `info` *(recommended addition)* | Info-600 | Info-400 |
| `info-foreground` *(recommended addition)* | White | Neutral-950 |

> **Current state vs. recommendation:** `background` through `ring` and `destructive` already exist in `globals.css` today. `warning`, `success`, and `info` do **not** yet exist as CSS tokens — today's code approximates them ad hoc with raw Tailwind utilities like `bg-amber-500/15 text-amber-600` (see the Service Store dashboard/badges). This document's recommendation is to promote those three to real tokens so status color is themeable and consistent, the same way `destructive` already is. Until that migration happens, the ad hoc `amber-600`/`emerald-600` Tailwind classes are an acceptable, explicitly-sanctioned bridge — not a violation — provided the mapping is centralized (one status→color function per domain), never inlined per call site.

### Theme tokens (drop-in CSS)

```css
@theme inline {
  --color-background: var(--background);
  --color-foreground: var(--foreground);
  --color-card: var(--card);
  --color-card-foreground: var(--card-foreground);
  --color-popover: var(--popover);
  --color-popover-foreground: var(--popover-foreground);
  --color-primary: var(--primary);
  --color-primary-foreground: var(--primary-foreground);
  --color-secondary: var(--secondary);
  --color-secondary-foreground: var(--secondary-foreground);
  --color-muted: var(--muted);
  --color-muted-foreground: var(--muted-foreground);
  --color-accent: var(--accent);
  --color-accent-foreground: var(--accent-foreground);
  --color-border: var(--border);
  --color-input: var(--input);
  --color-ring: var(--ring);
  --color-destructive: var(--destructive);
  --color-destructive-foreground: var(--destructive-foreground);
  --color-warning: var(--warning);
  --color-warning-foreground: var(--warning-foreground);
  --color-success: var(--success);
  --color-success-foreground: var(--success-foreground);
  --color-info: var(--info);
  --color-info-foreground: var(--info-foreground);
}

:root {
  --background: oklch(0.98 0.005 247);       /* Neutral-50 */
  --foreground: oklch(0.21 0.03 259);        /* Neutral-900 */
  --card: oklch(1 0 0);                       /* White */
  --card-foreground: oklch(0.21 0.03 259);
  --popover: oklch(1 0 0);
  --popover-foreground: oklch(0.21 0.03 259);
  --primary: oklch(0.6 0.13 163);             /* Primary-600 */
  --primary-foreground: oklch(1 0 0);
  --secondary: oklch(0.95 0.01 247);          /* Neutral-100 */
  --secondary-foreground: oklch(0.21 0.03 259);
  --muted: oklch(0.95 0.01 247);
  --muted-foreground: oklch(0.55 0.02 252);   /* Neutral-500 */
  --accent: oklch(0.95 0.01 247);
  --accent-foreground: oklch(0.21 0.03 259);
  --border: oklch(0.91 0.015 253);            /* Neutral-200 */
  --input: oklch(0.91 0.015 253);
  --ring: oklch(0.6 0.13 163);                /* Primary-600 */
  --destructive: oklch(0.55 0.22 26);         /* Danger-600 */
  --destructive-foreground: oklch(1 0 0);
  --warning: oklch(0.65 0.16 66);             /* Warning-600 */
  --warning-foreground: oklch(1 0 0);
  --success: oklch(0.6 0.15 149);             /* Success-600 */
  --success-foreground: oklch(1 0 0);
  --info: oklch(0.55 0.2 260);                /* Info-600 */
  --info-foreground: oklch(1 0 0);
  --radius: 0.625rem;
}

.dark {
  --background: oklch(0.16 0.02 247);         /* #0B0F14-ish */
  --foreground: oklch(0.98 0.005 247);
  --card: oklch(0.2 0.02 247);                /* #12171D-ish */
  --card-foreground: oklch(0.98 0.005 247);
  --popover: oklch(0.22 0.02 247);
  --popover-foreground: oklch(0.98 0.005 247);
  --primary: oklch(0.75 0.15 164);            /* Primary-400 */
  --primary-foreground: oklch(0.16 0.02 247);
  --secondary: oklch(0.28 0.02 253);          /* Neutral-800 */
  --secondary-foreground: oklch(0.98 0.005 247);
  --muted: oklch(0.24 0.02 247);
  --muted-foreground: oklch(0.66 0.02 253);   /* Neutral-400 */
  --accent: oklch(1 0 0 / 10%);
  --accent-foreground: oklch(0.98 0.005 247);
  --border: oklch(1 0 0 / 10%);
  --input: oklch(1 0 0 / 15%);
  --ring: oklch(0.75 0.15 164);
  --destructive: oklch(0.7 0.19 26);          /* Danger-400 */
  --destructive-foreground: oklch(0.16 0.02 247);
  --warning: oklch(0.78 0.14 66);             /* Warning-400 */
  --warning-foreground: oklch(0.16 0.02 247);
  --success: oklch(0.76 0.15 149);            /* Success-400 */
  --success-foreground: oklch(0.16 0.02 247);
  --info: oklch(0.68 0.15 260);               /* Info-400 */
  --info-foreground: oklch(0.16 0.02 247);
}
```

**Rule: no component ever writes a color outside this token list.** If a component needs a color that isn't here, that's a signal to add a token — not to reach for a raw Tailwind palette class.

---

## 6. Typography

### Font family

- **UI sans:** Geist Sans (already the loaded font in AutoHub's App Router root layout) — a geometric, neutral grotesk that reads as "engineered," not "designed-at" — the correct register for Stripe/Linear/Vercel-adjacent products.
- **Monospace:** Geist Mono — reserved for booking numbers (`AH-260713-000042`), currency figures in tabular contexts, and code-like identifiers (service codes, branch codes). Never use monospace for body prose.
- **Thai text:** Noto Sans Thai — loaded alongside Geist Sans for Thai-language content (customer names, addresses, business names). Both fonts share the same `font-sans` variable stack so mixed Thai/English strings render evenly without a visible font-switch seam.

### Scale

| Role | Size / Line-height | Weight | Letter-spacing | Usage |
|---|---|---|---|---|
| **Display** | 36px / 44px (`text-4xl`) | 600 (semibold) | `-0.02em` | Marketing hero headlines only — never inside the dashboard shell. |
| **Heading (H1)** | 28px / 36px (`text-3xl`) | 600 | `-0.015em` | Page titles (`PageShell`'s `title`). One per page. |
| **Title (H2)** | 20px / 28px (`text-xl`) | 600 | `-0.01em` | Card/section titles (`CardTitle`). |
| **Subtitle (H3)** | 16px / 24px (`text-base`) | 500 (medium) | `0` | Secondary headers, list-group labels. |
| **Body** | 14px / 20px (`text-sm`) | 400 (regular) | `0` | Default UI text — the workhorse size. AutoHub's UI density is compact; `text-base` (16px) is reserved for marketing pages, not the dashboard. |
| **Caption** | 12px / 16px (`text-xs`) | 400 | `0.01em` | Timestamps, metadata, helper text under form fields. |
| **Label** | 12px / 16px (`text-xs`) | 600 | `0.04em`, uppercase | Stat-card labels, table column headers, form field labels *when used as an eyebrow* (most form labels use Body weight/size instead — see §14). |
| **Button** | 14px / 20px (`text-sm`) | 500 | `0` | All button text, regardless of button size variant. |

### Rules

- **Maximum 3 sizes visible on one screen at once.** A dashboard showing Heading + Body + Caption is correct; a dashboard also showing Title and Subtitle in the same view usually means the hierarchy needs simplifying, not a fourth size.
- **Numbers get their own treatment.** Any standalone stat value (`StatCard`'s `value`) is `text-2xl font-semibold` regardless of what size governs the label above it — numbers are always the loudest element in their card.
- **Never justify text.** Left-align everything; centered text is reserved for empty states and single-column marketing sections only.

---

## 7. Radius

Derived from one base variable (`--radius: 0.625rem` / 10px) so the whole system re-scales from a single number if the brand ever needs to feel sharper or softer.

| Token | Value | Applied to |
|---|---|---|
| `rounded-md` (`--radius-md`) | 8px | Checkboxes, small inline controls |
| `rounded-lg` (`--radius-lg`) | 10px | **Inputs**, **Select triggers**, small buttons |
| `rounded-xl` (`--radius-xl`) | 14px | **Buttons** (default size), **Dropdown/Popover** content |
| `rounded-2xl` (`--radius-2xl`) | 18px | **Dialogs**, dense **Cards** |
| `rounded-3xl` (`--radius-3xl`) | 22px | **Badges** (pill shape at this radius reads as fully rounded at badge height) |
| `rounded-4xl` (`--radius-4xl`) | 26px | **Cards** (default/spacious), the shared `Card` primitive's default |
| `rounded-full` | 50% | **Avatars**, icon-only circular buttons, status dots |

Rule: **radius increases with surface size, never decreases.** A button nested inside a card always has a *smaller* radius than its parent card — this is what makes nested rounded corners look intentional instead of arbitrary (a small radius nested inside a small radius looks like a mistake; a small radius nested inside a large one looks designed).

---

## 8. Shadows

AutoHub's shadows are soft, low-opacity, and used to signal **elevation above the page**, never to add generic "depth" to static content. A card sitting flat on the page background needs a border, not a shadow (see §1).

| Token | Recipe | When |
|---|---|---|
| `shadow-xs` | `0 1px 2px 0 rgb(0 0 0 / 0.04)` | Inputs on focus, subtle button press feedback |
| `shadow-sm` | `0 1px 3px 0 rgb(0 0 0 / 0.06), 0 1px 2px -1px rgb(0 0 0 / 0.06)` | Hover state on a clickable card/row |
| `shadow-md` | `0 4px 6px -1px rgb(0 0 0 / 0.08), 0 2px 4px -2px rgb(0 0 0 / 0.06)` | Dropdown menus, tooltips, popovers (matches the shared `Card`/`DropdownMenuContent` primitives' `shadow-md ring-1 ring-foreground/5`) |
| `shadow-lg` | `0 10px 15px -3px rgb(0 0 0 / 0.08), 0 4px 6px -4px rgb(0 0 0 / 0.06)` | Dialogs, drawers — the modal layer |
| `shadow-xl` | `0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.06)` | Reserved for the rare full-screen overlay or a dragged element mid-drag |

In dark mode, pair every shadow with a `ring-1 ring-foreground/5`–`10` (already the shared `Card` component's pattern) — shadows alone barely register against a dark background; the hairline ring is what actually communicates the edge.

---

## 9. Spacing System

An 8pt grid with a 4px half-step for fine adjustments. This is the entire palette — if a spacing need doesn't fit one of these, round to the nearest one rather than inventing a value.

| Token | Px | Typical role |
|---|---|---|
| `1` | 4px | Icon-to-text gap inside a compact inline group |
| `1.5` | 6px | Tight label-to-control gap in dense forms |
| `2` | 8px | Base unit. Gap between closely related inline items (avatar + name) |
| `3` | 12px | Gap between a row's internal elements (icon, label, badge) |
| `4` | 16px | **Default `gap`** for grids of cards; internal padding for compact card variants |
| `6` | 24px | **Default section-to-section spacing** (`space-y-6`); default `Card` internal padding |
| `8` | 32px | Gap between major page regions on desktop |
| `12` | 48px | Marketing section spacing only — never inside the dashboard shell |
| `16` | 64px | Marketing hero spacing only |

### Applied rules

- **Gap** (flex/grid `gap-*`): use `gap-2` for tightly-related inline content, `gap-4` for card grids, `gap-6` for major layout regions.
- **Padding**: container padding scales with viewport (`p-4 md:p-6 lg:p-8`); a component's *internal* padding does not scale with viewport (a `Card` is `p-6` at every breakpoint — only the page shell around it breathes).
- **Margin**: prefer `gap`/`space-y-*` on a parent over `margin` on children wherever the parent is a flex/grid container you control — margins on siblings are how spacing bugs (double-margins, collapsed margins) happen.
- **Section spacing**: `space-y-6` between top-level sections of a page (stat row → quick actions → tables).
- **Card spacing**: `gap-4` between cards in a grid; `p-6` (or `p-4` for the compact `size="sm"` variant) inside each card.
- **Page spacing**: `p-4 md:p-6 lg:p-8` on the outermost content container, provided by the shell — individual pages never add their own outer padding on top of the shell's.

---

## 10. Grid System

| Breakpoint | Width | Sidebar | Content columns (typical) |
|---|---|---|---|
| **Mobile** | `< 640px` | Hidden (replaced by horizontal pill nav) | 1 |
| **Tablet** | `640px`–`1023px` | Hidden until `lg` | 2 |
| **Desktop** | `≥ 1024px` | Visible, fixed `256px` (`w-64`) | 3–4 |

- **Container width:** the portal shell is **full-bleed** — header spans 100% of the viewport, content area is `flex-1` with no `max-w-*` cap. This is a deliberate departure from the "centered `max-w-7xl` app" pattern common in older admin templates; AutoHub's dashboards should use the space a monitor actually has, the way Linear and Vercel's own consoles do. Marketing/auth pages are the one exception and stay centered/narrow (`max-w-3xl`–`max-w-4xl`).
- **Column layout:** content areas use CSS Grid with responsive column counts, not a rigid 12-column system — `grid-cols-1 sm:grid-cols-2 lg:grid-cols-3` (card galleries) or `grid-cols-1 lg:grid-cols-[2fr_1fr]` (primary content + sidebar panel).
- **Dashboard layout:** header → `sm:grid-cols-2 lg:grid-cols-4` stat row → quick actions → `lg:grid-cols-[2fr_1fr]` primary/secondary split → `lg:grid-cols-2` secondary panels.
- **CRUD layout:** list pages get the full width (toolbar + table); create/edit forms are capped at `max-w-2xl` even inside the full-width shell — a 1200px-wide form is *worse* usability, not better.
- **Settings layout:** single column, `max-w-2xl`–`max-w-3xl`, grouped into cards by logical section.

---

## 11. Components

Visual rules only — see the companion engineering doc for behavior/interaction/data rules where not repeated here.

| Component | Radius | Key visual rules |
|---|---|---|
| **Button** | `rounded-xl` | Height 36px (default) / 32px (`sm`) / 40px (`lg`) / 36px square (`icon`). `default` variant = `bg-primary text-primary-foreground`; never more than one `default`-variant button visible per view. Active/pressed state nudges 1px down (`active:translate-y-px`), not a color change alone. |
| **Input** | `rounded-lg` | Height 40px. 1px `border-input`, `bg-background`. Focus: `ring-2 ring-primary/30` + border shifts to `border-primary`. |
| **Textarea** | `rounded-lg` | Same border/focus treatment as Input; minimum 3 visible rows; resize vertical only. |
| **Select** | `rounded-lg` | Visually identical to Input at rest; chevron icon `size-4` in `text-muted-foreground`, right-aligned. |
| **Checkbox** | `rounded-md` | 16×16px box, `border-input` at rest, `bg-primary border-primary` + white check when checked. |
| **Radio** | `rounded-full` | 16×16px circle, same state colors as Checkbox. |
| **Switch** | `rounded-full` | Track 20px tall, `bg-muted` off / `bg-primary` on; thumb is a white circle with `shadow-sm`. |
| **Badge** | `rounded-3xl` (pill) | Height ~20px, `text-xs font-medium`, `px-2 py-0.5`. Status color always from the centralized status-color map (§2), never inlined. |
| **Card** | `rounded-4xl` (default) / `rounded-2xl` (dense contexts) | `bg-card`, `border border-border` **or** `shadow-md ring-1 ring-foreground/5` for elevated/floating cards — pick one elevation method, never both on the same card. |
| **Table** | `rounded-xl` container | Header row `text-xs font-semibold uppercase text-muted-foreground`, sticky when scrollable. Row hover `bg-muted`. Row height 44–48px. |
| **Tabs** | `rounded-lg` (tab list container), `rounded-md` (active tab indicator) | Underline **or** pill indicator, never both. Active tab = `text-foreground font-medium`; inactive = `text-muted-foreground`. |
| **Dialog** | `rounded-2xl` | Max width `max-w-lg` for confirmation dialogs, `max-w-2xl` for form dialogs. Always includes a visible close affordance and a scrim (`bg-background/80 backdrop-blur-sm`). |
| **Drawer** | `rounded-t-2xl` (bottom sheet) / square edge (side panel) | Used on mobile in place of a Dialog when the content is a full form; side-panel variant on desktop for detail "peek" views. |
| **Toast** | `rounded-xl` | Bottom-right on desktop, bottom-center on mobile. Auto-dismiss 4–6s for informational, persists until dismissed for errors requiring action. |
| **Alert** | `rounded-xl` | Left-border accent (`border-l-4`) in the semantic color, tinted background at the `-50` step, icon + text in the `-600`/`-700` step. |
| **Dropdown** | `rounded-xl` | Matches Popover shadow/ring treatment; items `rounded-lg` internally with `hover:bg-accent`. |
| **Pagination** | `rounded-lg` per control | Current page = `bg-primary text-primary-foreground`; others = `ghost` button style. |
| **Avatar** | `rounded-full` | Sizes: 24px (inline/table), 32px (list rows, default), 40px (header/profile). Fallback = initials on `bg-primary/10 text-primary`. |
| **Timeline** | n/a (structural) | Vertical connector `w-px bg-border`; dot markers `size-2.5 rounded-full`, filled (`bg-primary`) for the current/next entry, `bg-border` for the rest. |
| **Progress** | `rounded-full` (bar) | Track `bg-muted`, fill `bg-primary`, height 6–8px. Never animate the fill on every render — only on genuine value change. |
| **Chart** | n/a | Only rendered when backed by real aggregated data (§1, philosophy #4). Category colors pull from the Neutral scale plus one Primary accent for the "current/highlighted" series — never a rainbow of unrelated hues. |
| **Stat Card** | `rounded-4xl`/`rounded-2xl` (matches Card) | Label (`Label` type style) + icon chip (`size-8 rounded-xl bg-primary/10 text-primary`) in the header row; value in `text-2xl font-semibold` below; optional `hint` in `Caption` style. |
| **Quick Action Card/Tile** | `rounded-xl` | Icon chip + label + one-line "Open"-style caption; `hover:border-primary hover:shadow-sm` — the whole tile is a single `Link`, never a click-target smaller than the visible card. |
| **Empty State** | n/a | Centered, `py-10`+, one `size-8` muted icon, one line of `text-sm text-muted-foreground`, optional single CTA button. Never blank. |
| **Loading Skeleton** | matches the real component's radius | Shape and count mirror the real content exactly (same card count, same row count) — a skeleton that doesn't match the eventual layout causes a visible "jump" on load, which reads as jankier than a plain spinner would have. |

---

## 12. Icons

**Lucide only** — never mix in another icon set, and never hand-draw a one-off SVG icon that duplicates something Lucide already has.

| Size | Token | Context |
|---|---|---|
| 16px | `size-4` | Inline with `text-sm` body text, inside badges, inside compact buttons |
| 18px | `size-[18px]` | Form field adornments (leading/trailing icons in an Input) |
| 20px | `size-5` | Sidebar navigation items, stat-card icon chips, default-size button icons |
| 24px | `size-6` | Empty-state icons, section-header icons, dialog header icons |
| 32px | `size-8` | Large empty states, onboarding/welcome illustrations-as-icons |

Rule: **one icon size per context, applied consistently.** Nav items are always `size-5`; mixing `size-4` and `size-5` icons within the same sidebar is an immediate visual-QA flag.

---

## 13. Dashboard Standards

| Region | Spacing | Hierarchy |
|---|---|---|
| **Header** | Sits in the shared shell header, not per-page | Greeting/title = Heading style; context line = Body/Caption, `text-muted-foreground` |
| **Stat Cards** | `gap-4`, `sm:grid-cols-2 lg:grid-cols-4` | Value outranks everything else on the card — see §6, §11 |
| **Quick Actions** | `gap-3` inside one `Card`, tiles in `grid-cols-2 lg:grid-cols-4` | Icon chip + label + caption; never more than 4–6 tiles (more than that, it's a menu, not "quick") |
| **Charts** | Full card width, `p-6` | Legend/labels in Caption style; only rendered with real data (§1) |
| **Recent Activities / Lists** | `gap-2` between rows, `space-y-6` between the list and its siblings | Bounded (`take: 8`–`10`) with a "View all" link — never unbounded on a dashboard |
| **Timeline** | see §11 | Reserved for genuinely sequential data (upcoming schedule, application progress) — not a generic list dressed up with dots |
| **Tables** | see §11 | Only when the data is comparably-shaped rows the user will scan/sort — a list is usually the better fit for a dashboard; a table is usually the better fit for a dedicated list page |
| **Cards / Widgets** | `gap-4`–`gap-6` between top-level cards, `space-y-6` between rows of cards | Every widget gets its own empty and loading state — never a dashboard with three data widgets and one that's silently blank |

Overall page rhythm: `space-y-6` between each of the regions above. Nothing on a dashboard should feel like it's touching its neighbor.

---

## 14. Motion

Motion exists to answer "what just changed," never to entertain. Default to **no animation**; every transition below is deliberately subtle.

| State | Treatment |
|---|---|
| **Hover** | `transition-colors` background/border shift (~150ms); clickable cards additionally get `transition-shadow hover:shadow-sm`. |
| **Focus** | Instant `ring` appearance — focus rings must never be animated in (a delayed focus ring reads as broken, not smooth). |
| **Pressed** | `active:translate-y-px` (a physical 1px "give," already the shared `Button` primitive's behavior) instead of a color-only change. |
| **Loading** | A static or gently pulsing skeleton (`animate-pulse`, default Tailwind timing) — never a spinning icon as the *primary* loading signal for content; spinners are for buttons/inline actions only. |
| **Transitions (menus/dialogs)** | Handled by the underlying base-ui primitives' built-in `data-open:animate-in data-open:fade-in-0 data-open:zoom-in-95` classes — never layer a second, competing animation on top. |

**Duration:** ~150ms for hover/color transitions, ~100–150ms for open/close animations on menus and popovers, ~200ms max for dialogs. Nothing in the product UI should exceed ~250ms — longer reads as sluggish, not elegant. **Never** use bounce/spring easing, auto-playing motion, parallax, or page-transition animations anywhere inside the dashboard shell; those are, at most, acceptable on the public marketing site, never in the operator tool.

---

## 15. Accessibility

Target: **WCAG 2.1 AA**, verified before merge, not audited after a complaint.

- **Contrast:** every token pairing in §5 is chosen to clear 4.5:1 for text, 3:1 for large text/icons — this is *why* the token system exists; using it correctly makes AA compliance the path of least resistance, not an extra step.
- **Keyboard navigation:** every interactive element reachable via `Tab`, operable via `Enter`/`Space`, with a visible focus ring at all times (§14) — never `outline-none` without a replacement `focus-visible:ring-*`.
- **Focus:** focus order follows visual/DOM order; modals trap focus while open and return it to the triggering element on close (handled by the shared Dialog/DropdownMenu primitives — don't build a custom modal that skips this).
- **ARIA:** used only where semantic HTML can't express the pattern (custom menus, tab sets). Icon-only controls always get `aria-label`. Decorative icons get no accessible name at all.
- **Semantic HTML:** `<button>` for actions, `<a>`/`Link` for navigation, real `<table>` markup for tabular data, one true `<h1>`-equivalent per page.
- **Screen reader:** status changes that matter (booking confirmed, payment approved) are announced via a polite live region if they happen without a page navigation — not communicated by color alone.

---

## 16. Tailwind Rules

| Do | Instead of |
|---|---|
| `bg-background`, `text-foreground` | `bg-white`, `text-black` |
| `bg-card`, `text-card-foreground` | `bg-white`, hardcoded hex text color |
| `bg-muted`, `text-muted-foreground` | `bg-gray-100`, `text-gray-500` |
| `border-border` | `border-gray-200`, `border-slate-300` |
| `text-primary`, `bg-primary`, `ring-primary` | any raw green/blue hex |
| `text-destructive`, `bg-destructive` | `text-red-600` |
| `rounded-2xl` / `rounded-4xl` | `rounded-[18px]` |
| `gap-6`, `space-y-6` | `mt-[13px]`, arbitrary margins between siblings |
| `shadow-sm` / `shadow-md` (§8) | `shadow-2xl` on static content |

**Never:**
- `bg-white` / `text-black` anywhere inside `apps/web` or `packages/ui` component code.
- A hardcoded hex value (`#...`) inside a `className` or inline `style`.
- An arbitrary Tailwind palette class (`bg-slate-100`, `text-red-500`) as a substitute for the equivalent semantic token, **except** inside a centralized, single-source status-color mapping function (§2, §11 Badge row) — and even there, prefer promoting the mapping to a real `warning`/`success`/`info` token (§5) as soon as that migration lands.

---

## 17. Dark Mode Strategy

Dark mode is **first-class**, not a theme option bolted on afterward:

1. **One implementation.** `next-themes`, toggled by a single shared `ThemeToggle` component, resolved through the semantic tokens in §5. There is no second theming mechanism anywhere in the app.
2. **Everything routes through semantic tokens.** A component that correctly uses `bg-card`/`text-card-foreground`/`border-border` gets dark mode for free — there should be **zero** `dark:` variant classes inside feature components. If you're typing `dark:`, you're almost certainly fighting the token system instead of using it (the only legitimate `dark:` usages in the whole codebase should live inside `packages/ui`'s own primitive definitions, if anywhere).
3. **No duplicated styling.** Never write a component twice (a "light version" and a "dark version"). Never define a second set of hardcoded dark colors parallel to the token system. One component, one set of token classes, two theme definitions in `globals.css` (§3, §4) — that's the entire mechanism.
4. **Elevation inverts correctly.** Light mode: elevation gets *whiter*. Dark mode: elevation gets *lighter-gray*, never darker (§4). This single rule, applied consistently, is what makes a dark-mode UI feel "designed" instead of "inverted."

---

## 18. Design Rules

### Always
- Always use a semantic token for color (§5).
- Always give an interactive element a visible focus state (§15).
- Always pair a `shadow` with a `ring-foreground/5–10` in dark mode (§8).
- Always design the empty state and loading state at the same time as the "happy path" state — not as an afterthought.
- Always keep exactly one `default`-variant (solid, primary-colored) button visible per view.

### Never
- Never hardcode a color, in any form — hex, `rgb()`, or a raw Tailwind palette class outside a centralized status-color map (§16).
- Never use Primary green to mean "success" or Success green to mean "brand/primary action" — they are visually close on purpose and semantically distinct on purpose (§2).
- Never fabricate a metric, trend, or activity-feed entry that isn't backed by a real, currently-computed value (§1).
- Never animate anything longer than ~250ms inside the dashboard shell, or use bounce/spring/parallax motion anywhere in the product UI (§14).
- Never nest a larger corner radius inside a smaller one (§7).

### Prefer
- Prefer a border over a shadow for static, non-elevated content (§1, §8).
- Prefer reusing the Neutral scale over inventing a new gray for "secondary" (§2).
- Prefer extending an existing component with a new optional prop over forking it into a near-duplicate (companion doc §20).
- Prefer `gap`/`space-y-*` on a parent over `margin` on children (§9).

### Avoid
- Avoid more than 3 text sizes visible on one screen (§6).
- Avoid more than 4–6 tiles in a "Quick Actions" panel — beyond that, it's navigation, and belongs in the sidebar (§13).
- Avoid centered, narrow (`max-w-*`) containers *inside* the full-width portal shell (§10).

### Best Practice
- Build new status-color logic as a single exported function/map per domain (e.g., one function that maps `BookingStatus` → badge tone), imported everywhere that status renders — never re-decided at each call site.
- Treat this document and its companion engineering doc as living — update both in the same PR that changes a token value or introduces a new component pattern.

### Anti-pattern
- A page that looks correct in light mode and breaks in dark mode is not "80% done" — it is a bug, with the same priority as a broken layout.
- A component with five boolean props controlling five slightly different visual variants is usually five uses of one prop (`variant: "a" | "b" | "c" | "d" | "e"`) that never got consolidated — refactor before adding a sixth boolean.

---

## 19. Deliverables Index

This document satisfies the seven requested deliverables as follows — nothing below is a separate file; each is a section (or set of sections) above:

1. **Design System Documentation** — this document, in full.
2. **Theme Tokens** — §5, "Theme tokens (drop-in CSS)" — a literal, ready-to-paste `@theme`/`:root`/`.dark` block.
3. **Tailwind Theme Mapping** — §16, plus the "Do / Instead of" table mapping every semantic need to its exact utility class.
4. **shadcn/ui Theme Recommendation** — **keep the current configuration**: `style: "base-luma"`, `baseColor: "neutral"`, `cssVariables: true` (as already set in `packages/ui/components.json` and `apps/web/components.json`). This document's token values (§5) are designed to slot into that existing configuration, not replace it — there is no reason to migrate to a different shadcn style/base color; base-luma's neutral foundation is exactly the "one accent, everything else neutral" philosophy in §1.
5. **Design Guidelines** — §18 ("Design Rules"), plus §1 ("Design philosophy").
6. **Component Standards** — §11 ("Components").
7. **Dashboard Standards** — §13 ("Dashboard Standards").

---

*This document describes AutoHub's design system as of the date it was written. Token values, once implemented in `globals.css`, become the actual source of truth — if this document and the shipped CSS ever disagree, that's a bug in one of the two, and it should be resolved (by updating whichever is wrong) in the same change that's touching either.*
