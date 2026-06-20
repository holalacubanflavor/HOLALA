# HOLALA Cuban Flavor — Design System

This document captures the design system **as it is already built and shipped**, not a
new proposal. It was written by reading the live code (`tailwind.config.ts`,
`app/globals.css`, marketing components, and the accessibility fixes in `DEVNOTES.md`)
so that future work — new pages, new components, AI-assisted changes — stays
consistent with what's already in production.

If you're about to add a new section, page, or component: match the patterns below
before inventing a new one.

---

## 1. Brand Essence

**Positioning:** "Latin tropical street food experience — Cuban roots, modern flavor."
Cuban food truck in San Antonio, TX, with an ambition to grow into a physical
location and multiple units.

**Visual mood:** warm, tropical, a little playful, but not childish. Dark espresso
grounds it so the orange/teal don't read as a kids'-menu palette. Think *late-night
food truck string lights*, not *cartoon beach mascot*.

**Bilingual by default.** Every page and every content field exists in Spanish and
English (`_es` / `_en` suffixes). Design decisions must work in both — no
layout that only has room for the shorter of the two languages.

---

## 2. Color System

Defined in `tailwind.config.ts` (Tailwind color names) and `app/globals.css`
(shadcn/ui CSS variables, HSL-without-function format). The comment in
`globals.css` calls this the **"Paleta oficial HOLALA Cuban Flavor"** — treat it as
fixed brand color, not a starting point.

| Token | Hex | Tailwind class | Role |
|---|---|---|---|
| Tropical Teal | `#0E7C86` (dark `#0a5f67`) | `teal` / `teal-dark` | Primary brand color. Links, primary CTAs (catering), price text, focus rings. |
| Sunset Orange | `#F97316` (dark `#ea6c0a`) | `orange` / `orange-dark` | Secondary/accent. Main "Order/Menu" CTAs, highlights, popular-item badges. **Contrast rules apply — see 2.1.** |
| Cuban Red | `#C62828` (dark `#a81f1f`) | `red` / `red-dark` | Required-field asterisks, error states. Used sparingly — this is not a third action color. |
| Warm Cream | `#FFF4E6` (dark `#f5e8d0`) | `cream` / `cream-dark` | Light backgrounds, text-on-dark (espresso sections), the `--background` token. |
| Palm Green | `#3F7D3A` (dark `#2f5f2c`) | `green` / `green-dark` | Vegetarian markers, "fresh/natural" signals only. |
| Dark Espresso | `#2A1A12` (light `#3d2a1e`) | `espresso` / `espresso-light` | Dark sections (Hero, Navbar, Footer, Social CTA), the `--foreground` token, text on cream. |

shadcn semantic aliases (`primary`, `secondary`, `accent`, `destructive`, `muted`,
`card`, `popover`, `border`, `input`, `ring`) map onto this palette via CSS
variables in `globals.css` — `primary` = teal, `secondary`/`accent` = orange,
`destructive` = red, `background`/`muted` = cream tones, `foreground` = espresso.

### 2.1 Critical rule: orange never passes WCAG AA as light text

This was discovered the hard way across three rounds of Lighthouse accessibility
fixes (`DEVNOTES.md`, session 5— see PR #2 and its follow-up review):

> **`text-orange` / `text-orange-dark` on `bg-orange/10` or `bg-orange/20` never
> reaches 4.5:1 contrast.** Orange's luminance (~0.32) makes any light-orange-on-orange
> or orange-text-on-light-bg combination fail WCAG AA, no matter the opacity.

**Always invert orange to a solid chip instead:**
- `bg-orange text-espresso` (≈5.97:1) — orange background, dark text
- `bg-espresso text-orange` (≈5.97:1) — dark background, orange text
- or skip orange-on-orange entirely and use `text-espresso` (14.0:1) for the text

This same "light tint + colored text" trap applies more generally — `text-teal` on
`bg-teal/10` was also fixed to `text-teal-dark` on `bg-teal/10` for the same reason.
**When adding any new badge/chip/pill, check contrast before shipping — don't reuse
a light-tint-background + colored-text combo without verifying it against AA.**
Minimum bar for this project: **4.5:1** (confirmed standard, not a suggestion —
Lighthouse Accessibility is tracked as a release gate).

---

## 3. Typography

Loaded via `next/font/google` in `app/[locale]/layout.tsx`:

- **Body — Poppins** (`--font-body`), weights 400/500/600/700. Used for all running
  text, nav, buttons, form labels.
- **Display — Baloo 2** (`--font-display`), weights 400/600/700/800. Used for all
  headings (`h1`–`h6` get `font-display` automatically via `globals.css`), and
  selectively for emphasis (price callouts, quote pull-text, step numbers).
  Chosen deliberately for "carácter cubano/tropical" — a rounder, friendlier
  display face than the body font, per the code comment in the layout file.

**Don't introduce a third typeface.** Don't use `font-display` for body copy or
`font-body` for headings — the contrast between the two is part of the brand voice.

Sizing in practice (from Hero/section headers):
- Page H1: `text-4xl sm:text-5xl md:text-6xl font-extrabold`
- Section H2: `text-3xl sm:text-4xl font-bold`
- Card/item H3: `text-lg font-semibold`
- Body copy: `text-base` / `text-lg` with `leading-relaxed`
- Eyebrow/label text above headings: `text-sm font-semibold uppercase tracking-widest` (or `tracking-wide`)

---

## 4. Layout & Spacing

- **Page container:** `max-w-7xl mx-auto px-4 sm:px-6 lg:px-8` for full-width
  sections (Navbar, Footer, hours strip). Narrower content (FAQ, forms) uses
  `max-w-3xl` or `max-w-4xl`.
- **Section vertical rhythm:** `py-16 sm:py-20` (sometimes `sm:py-24` for Hero).
  Stay inside this range for new sections — don't introduce a tighter or looser
  vertical cadence without a reason.
- **Grid gaps:** `gap-5` for card grids (menu items), `gap-3`/`gap-4` for tight
  chip/badge groups, `gap-8`–`gap-12` for multi-column footer/about layouts.
- **Breakpoints:** standard Tailwind (`sm`, `md`, `lg`). Mobile-first throughout —
  base classes target mobile, `sm:`/`md:`/`lg:` scale up. This matches the
  CLAUDE.md mandate that the catering form and admin are mobile-first.

---

## 5. Border Radius

Two radius languages coexist by design, not by accident:

- **Pills (`rounded-full`)** — every CTA button/link (`Hero` buttons, navbar
  "Order" button, footer links-as-buttons, FAQ CTA buttons). Pills signal
  "action."
- **Soft rectangles (`rounded-2xl` cards / `rounded-xl` inputs / `rounded-3xl`
  large visual blocks)** — content containers: menu item cards, form
  containers, FAQ accordion items, admin stat cards, the About visual panel.
  Rectangles signal "content."

When building a new component, ask "is this clickable-action or
content-container?" and pick the matching radius language. Don't mix — e.g.
don't make a content card `rounded-full` or a CTA `rounded-2xl`.

shadcn's `--radius: 0.5rem` token (and the `rounded-lg`/`md`/`sm` scale derived
from it) exists in `globals.css`/`tailwind.config.ts` for shadcn primitives, but
the marketing surface doesn't use it directly — see §7.1.

---

## 6. Effects

A small, deliberate set of textures reused across dark (espresso) sections:

- **`.bg-tropical-glow`** (`globals.css`) — two radial gradients (teal top-left,
  orange bottom-right) over espresso. Used on Hero.
- **Diagonal stripe overlay** — `repeating-linear-gradient(45deg, ...)` at very
  low opacity (`opacity-[0.04]` to `opacity-10`), color matches the section's
  accent (orange on Hero, cream on the teal-to-espresso gradient panel in
  AboutTeaser). Adds texture without adding visual noise.
- **`.shadow-warm`** (`globals.css`) — warm orange-tinted drop shadow
  (`rgba(249, 115, 22, 0.35)`) for "premium" visual blocks (About image panel).
- **Hover lift** — `hover:-translate-y-1` + shadow increase on interactive cards
  (menu items, event-type cards). Standard `transition-all duration-300`.

---

## 7. Component Patterns

### 7.1 Buttons / CTAs — pills, not the shadcn `Button`

There's a shadcn `Button` primitive at `components/ui/button.tsx`
(`base-ui/react` + `cva` variants), but **it is not imported anywhere in the
app** — every CTA on the marketing and admin surfaces is a hand-styled
`<Link>`/`<button>`/`<a>` with the same recurring class pattern:

```
inline-flex items-center justify-center gap-2
bg-{color} hover:bg-{color}-dark
text-{contrasting-color} font-semibold
px-6–8 py-2.5–3.5
rounded-full
transition-colors
```

Variants in active use:
- **Primary action** (e.g. "Ver Menú"): `bg-orange hover:bg-orange-dark text-espresso`
- **Secondary action on dark bg** (e.g. "Catering" next to primary): `border border-cream/30 hover:border-cream/60 text-cream`
- **Brand/neutral action** (e.g. "Volver al inicio", footer-adjacent CTAs): `bg-espresso hover:bg-espresso-light text-cream`
- **Outline action**: `border border-teal text-teal hover:bg-teal hover:text-cream`

**This is the actual button system for this project.** If you need a new CTA,
copy this pattern rather than reaching for `components/ui/button.tsx`. (Whether
to eventually consolidate onto the shadcn primitive is a real question, but
it's a deliberate call for the project owner — not something to silently
change while building something else.)

### 7.2 Cards

`bg-white rounded-2xl border border-border` is the default content card
(menu items, FAQ items, form containers, admin stat cards). Add
`hover:shadow-md` or `hover:shadow-lg hover:-translate-y-1` only on cards that
represent a navigable/interactive item (menu items yes; static admin stat
cards no).

### 7.3 Badges / chips / pills (eyebrow labels)

`inline-block` or `inline-flex`, `rounded-full`, `px-3 py-1`, `text-xs font-bold
uppercase tracking-widest`. Color combo must clear AA contrast — see §2.1
before picking a tint.

### 7.4 Forms

`CateringForm.tsx` is the reference implementation for any future form:
- Container: `bg-white rounded-2xl border border-border p-6 sm:p-8`
- Inputs: `w-full px-4 py-2.5 rounded-xl border border-border ... focus:ring-2 focus:ring-teal/40 focus:border-teal`
- Required-field marker: `<span className="text-red ml-0.5">*</span>`
- Multi-step pattern: numbered circle badge (`w-6 h-6 rounded-full bg-teal text-cream text-xs font-bold`) + "Step X of Y" muted text + step summary chip (`bg-teal/5 border border-teal/20`) with an inline "Edit" link back to the previous step
- Bot protection: hidden honeypot field (`tabIndex={-1}`, visually hidden, stripped before sending) — reuse this pattern for any future public form rather than adding a CAPTCHA dependency
- Submit button disabled state: `disabled:opacity-40 disabled:cursor-not-allowed` (step 1) — note step 2's submit uses `disabled:opacity-60` for the "submitting" spinner state specifically, not for disabled-incomplete; keep that distinction if you touch this file

### 7.5 Navigation

Sticky header: `bg-espresso/95 backdrop-blur-sm border-b border-espresso-light`.
Active link state is `text-orange` (vs. default `text-cream/80`). Language
toggle is a plain text link with the *other* locale's label, not a dropdown.

### 7.6 FAQ / disclosure pattern

Native `<details>`/`<summary>` (no JS accordion library) styled as a card,
with a rotating `+` glyph (`group-open:rotate-45`). Prefer this over a JS
accordion component for any future disclosure UI — it's accessible by default
and has zero JS cost.

### 7.7 Page header pattern

Every secondary page (`about`, `faq`, `location`, `catering`, `blog`) opens
with the same triplet: eyebrow badge chip → `font-display` H1 → muted
subtitle paragraph, centered. Reuse this for any new page rather than
inventing a new header treatment.

### 7.8 Secondary CTA box

A recurring "anything else?" closer pattern: `bg-{color}/5 border
border-{color}/20 rounded-2xl p-8`, centered text, one or two pill buttons.
Seen at the bottom of FAQ and in the homepage CateringCTA. Reuse for any new
page that needs a closing nudge.

---

## 8. Iconography

[Lucide](https://lucide.dev) (`lucide-react`) exclusively, plus one custom
brand icon (`components/icons/InstagramIcon.tsx`) for the one glyph Lucide
doesn't cover well on brand. Icon sizing is contextual (`size={14}` for inline
badge icons up to `size={32}`–`36` for standalone feature icons) — there's no
fixed icon-size token, match the surrounding text size.

Category emojis (🥘🍟🥤🍮⭐) are used as lightweight category markers in
`MenuGrid` and the catering event-type picker — a deliberate, low-effort
alternative to commissioning custom icon art per category. Keep using emoji
for category/event-type selectors; don't replace with custom iconography
without discussing scope.

---

## 9. Imagery

- Logo: `public/logo/holala-logo.svg` (preferred — also `.png`/`.webp`
  fallbacks exist). On dark footer it's inverted via `brightness-0 invert`
  rather than a separate light-mode asset.
- Brand cover photo: `public/brand/hero-cover.png`, reused both as the
  full Hero image and (cropped, low-opacity, dark-overlaid) as the
  Instagram CTA section background — one asset, two treatments, rather than
  sourcing a second photo.
- Menu item photos are optional (`imageUrl?`) — when absent, `MenuPreview`
  falls back to a teal-to-espresso gradient block with a centered translucent
  `UtensilsCrossed` icon rather than a broken image or empty space. Reuse this
  fallback for any future image-optional grid.

---

## 10. Bilingual Content Pattern

Per CLAUDE.md: every Sanity field and every hardcoded string has `_es`/`_en`
variants (`name_es`/`name_en`, `description_es`/`description_en`, etc.) or goes
through `next-intl` (`useTranslations`/`getTranslations`) with locale-keyed
message files. Inline conditional (`locale === 'es' ? x_es : x_en`) is the
established pattern for Sanity-sourced content; `next-intl` namespaces are
used for static UI copy. When adding new content, follow whichever of the two
the surrounding code already uses — don't introduce a third
internationalization mechanism.

---

## 11. Admin Surface

`/admin/*` reuses the exact same tokens (cream/espresso/teal, `font-display`
headings, `rounded-2xl` cards) at a denser, simpler information layout — there
is no separate "admin design system." Keep it that way: admin should look like
an internal extension of the same product, not a different tool.

---

## 12. Open Items / Known Inconsistencies

Things worth a deliberate decision later, not a silent fix:

- **`components/ui/button.tsx` is dead code.** A shadcn `Button` primitive
  exists but nothing imports it — all real CTAs hand-roll the pill pattern in
  §7.1. Either start using the primitive (and reconcile its rounded-corner /
  sizing defaults with the pill pattern) or remove it.
- **`components/ui/` shadcn baseColor is `neutral`**, but the actual palette is
  warm (cream/espresso), so the raw shadcn primitives (if ever used directly)
  will look slightly off-brand out of the box — they'd need the same
  token overrides the marketing surface already gets via `globals.css`
  CSS variables.

---

## Reference Map

| Concern | File |
|---|---|
| Color tokens (Tailwind names) | `tailwind.config.ts` |
| Color tokens (CSS vars, shadcn) | `app/globals.css` |
| Fonts | `app/[locale]/layout.tsx` |
| Reference button/CTA patterns | `app/[locale]/page.tsx` (Hero, CateringCTA, AboutTeaser) |
| Reference form pattern | `components/marketing/CateringForm.tsx` |
| Reference card grid | `components/menu/MenuGrid.tsx` |
| Nav / footer | `components/marketing/Navbar.tsx`, `Footer.tsx` |
| Contrast fix history (why the rules in §2.1 exist) | `DEVNOTES.md`, session 5 log |
