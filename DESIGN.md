# Design System: CEO Dashboard — Agency Tier

## 1. Visual Theme & Atmosphere

A restrained, gallery-airy dashboard interface with confident asymmetric layouts and fluid spring-physics motion. The atmosphere is clinical yet warm — like a well-lit architecture studio reviewing blueprints. Soft structuralism meets high-density data: silver-white surfaces, diffused ambient shadows, and typography-driven hierarchy. Every element breathes through macro-whitespace; nothing touches the edge.

- **Density:** 6/10 — Daily App Balanced with pockets of high-density data tables
- **Variance:** 7/10 — Offset Asymmetric bento grids, varying card scales
- **Motion:** 6/10 — Fluid CSS + Framer Motion spring physics, staggered reveals

## 2. Color Palette & Roles

- **Canvas White** (#FAFAFA) — Primary background surface, subtle warm silver
- **Pure Surface** (#FFFFFF) — Card inner core fill, elevated planes
- **Charcoal Ink** (#18181B) — Primary text, headlines, weight-bearing typography
- **Muted Steel** (#71717A) — Secondary text, descriptions, metadata, eyebrow labels
- **Whisper Border** (rgba(24,24,27,0.06)) — Structural rings, 1px hairlines on shell wrappers
- **Deep Sky Blue** (#0A84FF) — Single accent for CTAs, active tabs, focus rings, data highlights. Saturation restrained, no neon glow.
- **Signal Rose** (#FF453A) — Alert states only: overdue tasks, critical warnings. Used sparingly.
- **Success Mint** (#30D158) — Positive indicators: completion, success rates. Used sparingly.

**Banned:** Pure black (#000000), purple/blue neon gradients, oversaturated accents, multiple accent colors fighting for attention.

## 3. Typography Rules

- **Display / Headlines:** `Geist` Sans — Track-tight (`tracking-tight`), controlled scale. Hierarchy through weight (font-black, font-bold) and color, not just massive size. Headings use negative letter-spacing for dense, confident lockups.
- **Body:** `Geist` Sans — Relaxed leading (`leading-relaxed`), max 65ch per line. Neutral secondary color for paragraphs.
- **Mono / Data:** `Geist Mono` — All numbers, timestamps, percentages, codes. Tabular nums enabled. High-density override: every numeric cell uses monospace.
- **Eyebrow Tags:** `Geist` Sans — Microscopic pill badges (`rounded-full px-3 py-1 text-[10px] uppercase tracking-[0.2em] font-medium`) in Muted Steel or accent fill.
- **Banned:** Inter, Roboto, Arial, Open Sans, Helvetica. Generic serif fonts (Times, Georgia, Garamond).

## 4. Component Stylings

### Double-Bezel Cards (Doppelrand)
Never place a card flatly on the background. Every major container uses nested architecture:

- **Outer Shell:** `rounded-[2rem] p-2 bg-black/[0.03] ring-1 ring-black/[0.04]` — subtle wrapper with hairline outer border
- **Inner Core:** `rounded-[calc(2rem-0.5rem)] bg-white` with `shadow-[0_2px_24px_-10px_rgba(24,24,27,0.04)]` — diffused ambient shadow, pure white surface
- **Inset Highlight:** Inner core optionally carries `shadow-[inset_0_1px_1px_rgba(255,255,255,0.8)]` for physical machined feel

### Buttons
- **Primary:** `rounded-full px-6 py-3 bg-[#18181B] text-white` with `hover:scale-[1.02] active:scale-[0.98]` spring physics. No neon glow.
- **Secondary / Ghost:** `rounded-full px-5 py-2.5 bg-transparent ring-1 ring-black/[0.08] text-[#18181B]` — hairline ring, not solid border.
- **Trailing Icon:** If button has arrow, icon sits inside its own circular wrapper (`w-8 h-8 rounded-full bg-black/5`) flush with right inner padding.

### Badges
- `rounded-full px-3 py-1 text-[11px] font-semibold` — soft pills, never sharp corners.
- Alert badge: `bg-[#FF453A]/10 text-[#FF453A]` — tinted background, not solid fill.

### Tables
- No visible outer borders. Header row uses `bg-[#FAFAFA]` with `border-b border-black/[0.06]`.
- Row hover: `hover:bg-black/[0.02]` with `transition-colors duration-300`.
- Cell padding generous: `py-4 px-5`.

### Inputs / Selects
- `rounded-[1.25rem]` — generous squircle radius.
- Focus ring in accent color: `focus:ring-2 focus:ring-[#0A84FF]/30`.
- No floating labels. Label above input in Muted Steel.

## 5. Layout Principles

- **Asymmetrical Bento Grid:** KPIs use masonry-like CSS Grid with varying card sizes (`col-span-2 row-span-2` next to stacked `col-span-1` cards). Never 8 equal cards in a row.
- **Macro-Whitespace:** Section padding minimum `py-10 px-6`. Between major sections, `gap-6` minimum.
- **Containment:** Max-width `max-w-[1440px] mx-auto` for the dashboard content area.
- **No Overlapping:** Every element occupies its own clean spatial zone. No absolute-positioned content stacking.
- **CSS Grid over Flexbox:** Use grid for all multi-column layouts. No `calc()` percentage hacks.

### Responsive Rules
- **Mobile First (< 768px):** All multi-column bento grids collapse to single column (`grid-cols-1`). `px-4` padding. Touch targets minimum 44px.
- **Tablet (768px+):** 2-column grids restored. Standard padding.
- **Desktop (1024px+):** Full asymmetric bento with varying spans.

## 6. Motion & Interaction

- **Spring Physics Default:** `stiffness: 100, damping: 20` — premium, weighty feel.
- **Custom Cubic-Bezier:** `cubic-bezier(0.32, 0.72, 0, 1)` for all CSS transitions. Never linear or ease-in-out.
- **Staggered Reveals:** Lists and grids cascade in with `staggerChildren: 0.04` and `delayChildren: 0.1`.
- **Entry Animations:** Every section enters viewport with `translate-y-8 opacity-0` → `translate-y-0 opacity-100` over 600ms+.
- **Hover Physics:** Cards lift subtly (`hover:-translate-y-0.5 hover:shadow-lg`), buttons scale (`active:scale-[0.98]`).
- **Perpetual Micro-Interactions:** Active tabs have subtle pulse. Loading states use skeletal shimmer matching exact layout dimensions.
- **Performance:** Animate exclusively via `transform` and `opacity`. Never `top`, `left`, `width`, `height`. `backdrop-blur` only on fixed/sticky elements.

## 7. Anti-Patterns (Banned)

- No `Inter` font anywhere
- No pure black `#000000`
- No neon / outer glow shadows
- No oversaturated accent colors (no purple button glows)
- No visible 1px solid gray borders — use shadow/space/rings
- No generic 3-column equal card grids
- No `h-screen` — always `min-h-[100dvh]`
- No static elements without entry animation
- No centered hero layouts when variance > 4
- No AI copywriting clichés: "Elevate", "Seamless", "Unleash", "Next-Gen"
- No filler UI: "Scroll to explore", bouncing chevrons, scroll arrows
- No emojis in UI
- No `backdrop-blur` on scrolling containers
- No linear or ease-in-out transitions
