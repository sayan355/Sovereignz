# Design System Specification: The Sovereign Vault (Dark Mode)

## 1. Overview & Creative North Star: "The Digital Obsidian"
The Creative North Star for this design system is **The Digital Obsidian**. In high-end finance, trust isn't built with loud colors or rigid boxes; it’s built through depth, weight, and the quiet authority of a physical vault. 

This system rejects the "flat web" aesthetic. Instead, it treats the screen as a multi-dimensional space carved out of dark stone and frosted glass. We break the template look by using **intentional asymmetry**—hero elements should bleed off-canvas, and typography scales should jump aggressively from massive display headers to micro-labeling to create an editorial, "prestige magazine" feel.

## 2. Colors & Atmospheric Depth
Our palette is rooted in the depth of `#121416` (Surface), punctuated by the sharp, medicinal glow of `#96CEEB` (Primary) and `#00DAF3` (Tertiary).

### The "No-Line" Rule
**Borders are prohibited for sectioning.** To separate a sidebar from a main feed or a header from a body, you must use a background shift. 
*   *Example:* Place a `surface-container-low` (#1A1C1E) section directly against the `surface` (#121416) background. The 2% tonal shift is enough for the human eye to perceive a boundary without the "cheap" look of a 1px line.

### Surface Hierarchy & Nesting
Treat the UI as a series of nested trays. Each level of "importance" or "focus" moves the user higher or lower in the stack:
*   **Background:** `surface` (#121416)
*   **Recessed Content (Secondary Info):** `surface-container-lowest` (#0C0E10)
*   **Standard Cards:** `surface-container-low` (#1A1C1E)
*   **Elevated Modals/Popovers:** `surface-container-highest` (#333537)

### The Glass & Gradient Rule
To achieve the "Sovereign" feel, main CTAs and high-impact areas should use **Atmospheric Gradients**. 
*   **CTA Base:** Linear gradient (135°) from `primary_container` (#004B63) to `on_primary_fixed_variant` (#044D65).
*   **Glassmorphism:** For floating navigation or overlays, use `surface_bright` (#37393B) at 60% opacity with a `24px` backdrop-blur.

## 3. Typography: The Manrope Editorial
Manrope is our voice. It is a geometric sans-serif that feels technical yet approachable.

*   **The Power Scale:** Use `display-lg` (3.5rem) for hero numbers (e.g., Portfolio Balance). This should be set with `letter-spacing: -0.04em` to feel like a high-end watch face.
*   **The Utility Scale:** Use `label-md` (0.75rem) in All Caps with `0.1em` letter-spacing for data headers. This provides a "financial terminal" authority.
*   **Hierarchy via Tone:** Never use pure white (#FFFFFF) for body text. Use `on_surface_variant` (#C0C7CD) for secondary descriptions and `on_surface` (#E2E2E5) for primary headings. This reduces eye strain and maintains the premium "slate" atmosphere.

## 4. Elevation & Depth: Tonal Layering
In this design system, shadows are light, not dark.

*   **The Layering Principle:** Depth is achieved by placing a darker surface on a lighter one (Inward Depth) or a lighter surface on a darker one (Outward Depth). 
*   **Ambient Shadows:** For floating elements, use a shadow with a 40px blur, 0px offset, and 6% opacity using the `primary` color (#96CEEB) instead of black. This creates a subtle "glow" that feels like an illuminated interface.
*   **Ghost Borders:** If a boundary is strictly required for accessibility (e.g., input fields), use `outline_variant` (#40484C) at 20% opacity. It should feel like a suggestion of a line, not a wall.

## 5. Components

### Buttons & Interaction
*   **Primary:** No sharp corners. Use `rounded-md` (0.375rem). The fill is `primary_container` (#004B63). On hover, transition to a subtle inner glow.
*   **Tertiary/Ghost:** Use `on_tertiary_container` (#00C5DB) text. No background, no border. The interaction is signaled by a slight increase in letter-spacing or a color shift to `tertiary`.

### Form Fields (The "Vault" Input)
*   **Container:** `surface_container_low` (#1A1C1E).
*   **Bottom Indicator:** Instead of a full box border, use a 2px bottom-accent in `outline_variant` that transforms into `primary` (#96CEEB) when focused.

### Cards & Lists (The "Anti-Divider" Pattern)
*   **Prohibition:** Divider lines (`<hr>`) are banned. 
*   **Separation:** Separate list items using the spacing scale (e.g., `spacing-4` / 1rem). 
*   **Grouping:** Group related items by placing them inside a `surface_container` (#1E2022) with a `0.375rem` radius.

### Financial Data Visualization
*   **The "Cyan Spark":** Use `tertiary` (#00DAF3) for positive trends and `error` (#FFB4AB) for negative.
*   **Background Fill:** Area charts should use a gradient from `tertiary_container` (at 30% opacity) fading to transparent, rather than a solid fill.

## 6. Do’s and Don’ts

### Do:
*   **Use Large Whitespace:** Use `spacing-20` (5rem) between major sections to let the "Sovereign" identity breathe.
*   **Embrace Asymmetry:** Align text to the left but place supporting data visualizations slightly off-center to the right to create visual tension.
*   **Nesting:** Put `surface-container-high` cards on top of a `surface-container-low` sidebar.

### Don’t:
*   **Don't use pure black (#000000):** It kills the depth of the teal accents. Always use `surface` (#121416).
*   **Don't use 1px solid borders:** They look like bootstrap templates. Use background shifts.
*   **Don't use standard drop shadows:** They look muddy on dark backgrounds. Use the "Ambient Glow" method described in Section 4.