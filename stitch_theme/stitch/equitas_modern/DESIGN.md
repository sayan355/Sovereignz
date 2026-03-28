# Design System Strategy: The Financial Architect

## 1. Overview & Creative North Star
The North Star for this design system is **"The Sovereign Vault."** 

In the world of high-end finance, "clean" is the baseline, but "premium" is the differentiator. We are moving away from the cluttered, line-heavy spreadsheets of the past and toward a digital experience that feels like a private banking lounge—quiet, authoritative, and meticulously curated. 

To break the "standard dashboard" mold, this system rejects the rigid 12-column grid in favor of **Intentional Asymmetry**. Large-scale editorial typography (Manrope) is paired with data-dense Inter blocks to create a rhythm of "Rest and Information." We use overlapping surfaces and depth-based layering to ensure the UI feels like a cohesive physical space rather than a flat screen.

## 2. Colors: Tonal Depth & Atmospheric Trust
We leverage a palette of deep teals and aquatic blues to establish a foundation of stability. These are not just "brand colors"; they are functional tools for hierarchy.

### The "No-Line" Rule
**Explicit Instruction:** Sectioning via 1px solid borders is strictly prohibited. Use background shifts to define boundaries. 
- A card should never have a border; it should be a `surface_container_lowest` (#ffffff) element resting on a `surface` (#f8f9fa) or `surface_container_low` (#f3f4f5) background.

### Surface Hierarchy & Nesting
Treat the UI as a series of nested physical layers. 
- **Base Level:** `surface` (#f8f9fa)
- **Primary Layout Sections:** `surface_container` (#edeeef)
- **Interactive Cards:** `surface_container_lowest` (#ffffff)
- **High-Priority Modals:** Use `surface_bright` (#f8f9fa) with an elevation-based shadow.

### The "Glass & Gradient" Rule
For prominent CTAs or high-level summary widgets, use a linear gradient transitioning from `primary` (#003345) to `primary_container` (#004b63) at a 135° angle. This adds a "weighted" feel to the most important data points. Use Glassmorphism (Background Blur: 20px) on the Light/Dark mode toggle to make it feel like an object floating above the interface.

## 3. Typography: Editorial Authority
We utilize a dual-font strategy to balance character with clinical precision.

- **Display & Headlines (Manrope):** These are our "Editorial" voices. Use `display-lg` and `headline-lg` for portfolio totals and welcome messages. The wide apertures of Manrope convey modern transparency.
- **Data & Body (Inter):** Inter is our "Functional" voice. Its tall x-height ensures that complex financial tables remain legible even at `body-sm` (0.75rem).
- **The Financial Scale:**
    - **Total Balance:** `display-md` (Manrope) - High tracking (-0.02em) for a tighter, premium feel.
    - **Captions/Labels:** `label-md` (Inter) - Uppercase with +0.05em letter spacing for a "metadata" aesthetic.

## 4. Elevation & Depth: Tonal Layering
Hierarchy is achieved through light and shadow, not lines.

- **The Layering Principle:** Instead of a shadow, place a `surface_container_highest` (#e1e3e4) element inside a `surface_container_low` (#f3f4f5) container to create a "recessed" look for data tables.
- **Ambient Shadows:** For floating elements (modals/dropdowns), use a multi-layered shadow: `0 4px 20px rgba(0, 51, 69, 0.04), 0 12px 40px rgba(0, 51, 69, 0.08)`. The tinting uses our `primary` blue to keep shadows feeling "airy" rather than "dirty."
- **The "Ghost Border" Fallback:** If a divider is essential for accessibility, use `outline_variant` (#c0c7cd) at **15% opacity**. It should be felt, not seen.

## 5. Components: Precision Crafted
### Data Tables
- **Rule:** Forbid the use of vertical and horizontal divider lines. 
- **Execution:** Use `spacing-3` (1rem) for row padding and a subtle `surface_container_low` background on `:hover`. Header labels should use `label-sm` in `on_surface_variant` (#40484c).

### Progress Bars & Charts
- **Progress Bars:** Use a `surface_variant` (#e1e3e4) track with a `secondary` (#006a62) fill for income or `tertiary_container` (#822200) for expenses. The bar should have a `DEFAULT` (0.5rem) corner radius.
- **Charts:** Line charts should utilize a 2px stroke width. Use a subtle gradient fill below the line (from 10% opacity of the line color to 0%) to give the data "weight."

### Input Fields
- **Style:** Background should be `surface_container_high` (#e7e8e9). No border. On focus, apply a 1px "Ghost Border" using `primary` at 40% and a 4px soft outer glow.

### The Mode Toggle
- **Style:** A wide, pill-shaped `full` radius (9999px) container using `surface_container_highest`. The active state should be a `surface_container_lowest` circle with a `display-sm` shadow.

### Additional Signature Component: The "Quick-Action Glass Card"
A small, floating glassmorphic card for "Transfer Funds" or "Add Entry" that sits at the bottom right, using `surface_tint` at 80% opacity with a 24px backdrop blur.

## 6. Do’s and Don’ts

### Do:
- **Use White Space as a Separator:** Use `spacing-8` (2.75rem) between major dashboard modules to allow the user’s eyes to "reset."
- **Vary the Corner Radii:** Use `xl` (1.5rem) for main dashboard containers but `sm` (0.25rem) for small action chips to create a sophisticated visual hierarchy.
- **Color Context:** Use `secondary` (#006a62) strictly for positive financial growth and `tertiary` (#5b1500) for outflows.

### Don’t:
- **Don’t use 100% black:** For text, always use `on_surface` (#191c1d) to maintain the soft, premium feel.
- **Don’t crowd charts:** Ensure every chart has a "breathing room" margin of at least `spacing-5` (1.7rem) from its container edges.
- **No high-contrast borders:** Never use #000000 or high-opacity grays to box in content. Let the surfaces do the work.