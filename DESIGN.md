# Rare Cocoa™ — Design System Specification

> **Brand Identity:** Real Chocolate. Real Trust. Light Luxury, Warm Minimalism & Pure Single-Origin Cocoa.

---

## 1. Color Palette & Design Tokens

### Backgrounds
* `--bg-primary`: `#FFFCF7` (Alabaster Warm White — main page background)
* `--bg-secondary`: `#F8F3EB` (Soft Cream — sections, alternate strips)
* `--bg-tertiary`: `#F0E9DD` (Warm Parchment)
* `--bg-hero`: `#FBF7F0`
* `--bg-card`: `#FFFFFF` (Pure White Card Surface)
* `--bg-card-hover`: `#FFFDF9`
* `--bg-dark`: `#1A0E08` (Dark Cocoa Espresso)

### Typography Colors
* `--text-primary`: `#1A0E08` (Deep Cacao Brown / Soft Black)
* `--text-secondary`: `#3D2B1F` (Roast Chestnut)
* `--text-tertiary`: `#6B5544` (Muted Cocoa)
* `--text-muted`: `#9A8672` (Warm Gray)
* `--text-light`: `#B8A48E`

### Luxury Gold Accents
* `--accent`: `#8B6914` (Deep Antique Bronze Gold)
* `--accent-hover`: `#6E5310`
* `--accent-light`: `#C9A456` (Warm Polished Gold)
* `--accent-warm`: `#D4AF37` (Metallic Gold)
* `--accent-bg`: `#FAF5E8` (Pale Gold Tint)
* `--accent-glow`: `rgba(201, 164, 86, 0.15)`

### Borders & Shadows
* `--border`: `#E5D9C8`
* `--border-light`: `#EDE5D8`
* `--border-gold`: `rgba(201, 164, 86, 0.3)`
* `--shadow-sm`: `0 2px 8px rgba(26, 14, 8, 0.04)`
* `--shadow-md`: `0 8px 30px rgba(26, 14, 8, 0.06)`
* `--shadow-lg`: `0 16px 50px rgba(26, 14, 8, 0.08)`
* `--shadow-gold`: `0 8px 30px rgba(201, 164, 86, 0.12)`

---

## 2. Typography

* **Headings / Display:** `'Outfit', 'Helvetica Neue', sans-serif`
* **Body & UI Controls:** `'DM Sans', 'Helvetica Neue', 'Arial', sans-serif`

---

## 3. Modal & Option Components

### Option Groups
* `.modal-option-group`: Margin bottom `18px`.
* `.modal-option-label`: Uppercase letter-spacing `0.18em`, font size `0.72rem`, color `var(--text-tertiary)`.
* `.modal-option-pill`: Pill button with rounded radius `100px`, padding `10px 20px`, border `1px solid var(--border)`.
  * **Selected state (`.selected`):** `background: var(--text-primary)`, `color: var(--bg-primary)`.
  * **Hover state:** `border-color: var(--accent-light)`, `background: var(--accent-bg)`.

### Custom WhatsApp Notice Banner
* Container class: `.modal-option-group.custom-wa-notice-group`
* Styling: Emerald green accent border `rgba(37, 211, 102, 0.3)` with rounded corners (`12px`).
* **Critical Invariant:** Does NOT have a `.modal-option-label`. Any script looping over `.modal-option-group` MUST check `if (group.classList.contains('custom-wa-notice-group')) return;` to avoid null pointer crashes.

### Add to Selection CTA
* Class: `.modal-add-btn`
* Active feedback: `.btn-gold-glow` triggering brief pulse before modal close.

---

## 4. UI Safeguards
1. **Never use generic pure black (`#000000`) or plain saturated blue/red:** Always use `--text-primary` (`#1A0E08`) and the curated gold palette.
2. **Preserve Fluid Spacing:** Maintain container max-width `1280px` and fluid section padding `clamp(80px, 10vw, 150px)`.
3. **No destructive CSS overrides:** Add utility classes or component modifiers rather than changing global root tokens.
