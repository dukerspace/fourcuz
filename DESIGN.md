# Design System Specification: Focused Emerald Productivity

## 1. Overview & Creative North Star: "The Verdant Focus Chamber"
This design system rejects the cluttered, utility-first aesthetic of traditional task managers. Our Creative North Star is **The Verdant Focus Chamber**—a digital experience that feels like a calm deep-work studio bathed in emerald light.

We move beyond "standard" dashboard UI by prioritizing **frosted glass surfaces floating on an energetic gradient** rather than flat gray canvases. The system breaks the boxed-in look through soft dual-layer shadows, gentle hover lift, and a single mint signal for intent. Data and tasks live inside breathable panels; the timer is the hero numeric of the product, not another widget in a grid.

---

## 2. Color Theory & Tonal Depth
We utilize a singular emerald vocabulary where Mint (`primary` / `#34d399`) is the high-intent signal, and Deep Emerald (`canvas` gradient stops) provides the atmospheric world. Dark mode keeps the same mint voltage and swaps surfaces to cool ink violet (`surface-dark` / `#1e1e2e`).

### The "One Accent" Rule
**Explicit Instruction:** Designers are prohibited from introducing a second accent family (indigo, purple, terracotta). Brand, CTAs, selection, focus rings, and work-timer energy all use `primary` (`#34d399`). Hover deepens to `primary-hover` (`#10b981`). Soft fills use `primary-muted` at 12–24% opacity.

### Canvas & Surface Hierarchy
Treat the UI as frosted panels suspended over a living gradient—not nested gray boxes on white.
- **World Layer:** Light canvas `linear-gradient(135deg, #065f46 → #047857 → #059669)`. Dark canvas `#022c22 → #065f46 → #047857`.
- **Content Layer:** `surface` (`rgba(255, 255, 255, 0.98)`) for light panels; `surface-dark` (`rgba(30, 30, 46, 0.95)`) for dark panels.
- **Elevated Logic:** `surface-elevated-dark` (`#2d2d44`) for dark-mode hover / input focus interiors.
- **Ink:** Titles use `ink` (`#1f2937`) / `ink-dark` (`#f3f4f6`). Supporting copy uses `body` (`#4b5563`) / `body-dark` (`#9ca3af`).

### The "Glass" Rule
Floating chrome (nav, footer, modals) must use **Glassmorphism**: frosted `surface` / `surface-dark` with `12px`–`xl` backdrop blur and a hairline edge (`hairline` / `rgba(0,0,0,0.05)` or `hairline-dark` / `rgba(255,255,255,0.08)`).
*Signature Polish:* Primary CTAs use flat `primary` (`#34d399`) with `on-primary` (`#ffffff`) text and control radius (`10px`).

### Semantic Signals
- **Warning:** `warning` (`#ffc107`) / `warning-ink` (`#d97706`) with `warning-muted` fills (offline, caution).
- **Destructive:** `destructive` (`#ff4444`) / `destructive-soft` (`#ef4444`) — delete / confirm only.
- **Priority chips:** low `#4caf50`, medium `#ff9800`, high `#f44336`.
- **Timer modes:** work `#34d399`, short break `#6ee7b7`, long break `#10b981`.

---

## 3. Typography: Calm System Authority
We use the **system UI stack** exclusively—character comes from scale and weight, not custom display faces.

| Level | Token | Font | Size | Weight | Intent |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Timer** | `timer-display` | System UI | 3rem (2.5rem mobile) | 700 | Hero countdown — the product’s numeric center. |
| **Page** | `page-title` | System UI | 2rem | 600 | Dashboard / page headlines on the canvas (near-white). |
| **Section** | `section-title` | System UI | 1.5rem | 600 | Panel headings (e.g., “Active Tasks”). |
| **Card** | `card-title` | System UI | 1.125rem | 600 | Widget titles inside frosted cards. |
| **Brand** | `brand` | System UI | 1.25rem | 600 | Nav wordmark in `primary`. |
| **Body** | `body-md` | System UI | 1rem | 400 | Standard reading text; leading ~1.625. |
| **Label** | `label-md` | System UI | 0.875rem | 500 | Buttons, form labels, nav links. |
| **Caption** | `caption` / `label-caps` | System UI | 0.75–0.875rem | 500–600 | Priority tags, timer mode (uppercase + tracking). |

*Usage Note:* Page titles on the emerald canvas use near-white ink with a light text-shadow. Everything inside frosted cards uses `ink` / `body` (or dark equivalents). Prefer semibold for hierarchy; reserve 700 for the timer only.

**System stack:** `-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Fira Sans', 'Droid Sans', 'Helvetica Neue', sans-serif`

---

## 4. Elevation & Depth: Glass Atmosphere
We do not use heavy Material elevation to create “pop”; we use frosted glass and soft dual shadows to create atmosphere.

*   **The Floating Principle:** Content lives on frosted cards over the canvas gradient. Never flatten the app to a solid gray page background.
*   **Ambient Shadows (Cards):** Rest state `box-shadow: 0 2px 16px rgba(0,0,0,0.08), 0 1px 4px rgba(0,0,0,0.04)`. Dark mode uses stronger black opacity. Hover slightly increases blur/spread.
*   **Chrome Shadows:** Nav / footer use a lighter dual shadow plus hairline. Modals use `0 8px 32px` depth with `backdrop-blur-xl`.
*   **Selection Glow:** Selected tasks use mint-tinted shadow `0 2px 12px rgba(52, 211, 153, 0.2–0.3)` — signal, not decoration.
*   **Motion Lift:** Interactive hover may use `-translate-y-0.5` / `-translate-y-px` with 200–300ms transitions. Keep motion intentional and scarce.

### Shape Language
*   **Cards / modals:** `20px` — signature surface.
*   **Buttons, inputs, nav chips:** `10px`.
*   **Task rows / inner panels:** `12px`.
*   **Icon / close / complete controls:** full pill (`9999px`).
*   Avoid sharp 0px corners and avoid pill-everything; pills are reserved for circular icon buttons and mode dots.

### Layout Rhythm
Content is constrained to **max-width 1200px**, centered. Page padding scales `16–40px`; section gaps `24–40px`; card padding `16–40px`. Dashboard uses a two-column layout at large breakpoints (timer + tasks) with equal breathing room.

---

## 5. Component Architecture

### Buttons: The Tactile Mint
*   **Primary:** Background: flat `primary` (`#34d399`). Corner radius: `10px`. Text: `on-primary`. Hover: `primary-hover` + soft mint shadow + slight lift.
*   **Secondary:** Background: gray-100 / gray-800. Text: `body` / `body-dark`. Mint-tinted border on hover.
*   **Destructive:** Soft red fill (`destructive-soft`). Isolated to confirm-delete flows only.
*   **Nav / Tertiary:** No fill until active. Active: `primary` text + `primary-muted` fill.

### Cards & Focus Surfaces
*   **Default Card:** Frosted `surface` / `surface-dark`, `20px` radius, ambient dual shadow, hairline border. Used for timer, task list, statistics widgets.
*   **Task Rows:** Gray-50 / gray-800 fill, `12px` radius, 2px border. Selected: mint border + `primary-muted` fill + selection glow.
*   **The Rule of One Job:** Each card has one purpose and one clear heading. Do not pack stats strips, promo chips, or secondary marketing into the first viewport.

### Input Fields
*   **Default State:** Background: surface / gray-800. Border: 2px `border` / `border-dark`. Corner radius: `10px`. Padding: `14px`.
*   **Active State:** Border `primary`; optional soft mint ring (`0 0 0 3px` at ~12–20% opacity). Dark interiors shift to `surface-elevated-dark`.

### Timer
*   Centered card ≤ `400px` wide.
*   Hero countdown in `timer-display` + `primary`.
*   Mode label: uppercase caption under the digits.
*   Mode tabs share nav chip language (`10px`); active = primary fill.

### Nav & Footer
*   Full-bleed frosted bars, blur `12px`, hairline edge.
*   Brand wordmark in `primary`. Language toggle as a compact segmented control.

### Status Indicators
*   **Priority:** Uppercase caption colored with `priority-low` / `priority-medium` / `priority-high`.
*   **Offline / caution:** `warning-muted` panel with `warning` / `warning-ink` text.
*   **Error pulse:** `destructive` text/border at low opacity fill — scarce and loud.

---

## 6. Do’s and Don’ts

### Do:
*   **Keep One Accent:** Use `primary` (`#34d399`) exclusively for brand, CTA, selection, and focus.
*   **Float on Emerald:** Place content on frosted cards over the canvas gradient; preserve the Verdant Focus Chamber atmosphere.
*   **Match Radii:** Cards `20px`, controls `10px`, task rows `12px` — consistently.
*   **Support Both Themes:** Same token roles in light and dark; swap surface/ink, keep mint.
*   **Prefer Tokens:** Reference named colors (`primary`, `surface-dark`, `priority-*`) instead of one-off hex.

### Don’t:
*   **Don't Invent Accents:** No purple/indigo rings, cream editorial themes, or broadsheet newspaper layouts.
*   **Don't Flatten the Canvas:** Never replace the emerald gradient with a solid utility gray page background.
*   **Don't Over-Glow:** No neon multi-layer glows; selection mint glow is enough.
*   **Don't Over-Emoji:** Brand/footer character is fine — don’t expand emoji into structural UI.
*   **Don't Densify the Hero:** Timer + tasks are the core job; no promo chips or metadata strips competing in the first viewport.
