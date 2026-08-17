---
name: KitArchive
colors:
  surface: "#101415"
  surface-dim: "#101415"
  surface-bright: "#363a3b"
  surface-container-lowest: "#0b0f10"
  surface-container-low: "#191c1e"
  surface-container: "#1d2022"
  surface-container-high: "#272a2c"
  surface-container-highest: "#323537"
  on-surface: "#e0e3e5"
  on-surface-variant: "#c6c6cd"
  inverse-surface: "#e0e3e5"
  inverse-on-surface: "#2d3133"
  outline: "#909097"
  outline-variant: "#45464d"
  surface-tint: "#bec6e0"
  primary: "#bec6e0"
  on-primary: "#283044"
  primary-container: "#0f172a"
  on-primary-container: "#798098"
  inverse-primary: "#565e74"
  secondary: "#b4c5ff"
  on-secondary: "#002a78"
  secondary-container: "#0053db"
  on-secondary-container: "#cdd7ff"
  tertiary: "#efc200"
  on-tertiary: "#3c2f00"
  tertiary-container: "#cea700"
  on-tertiary-container: "#4e3e00"
  error: "#ffb4ab"
  on-error: "#690005"
  error-container: "#93000a"
  on-error-container: "#ffdad6"
  primary-fixed: "#dae2fd"
  primary-fixed-dim: "#bec6e0"
  on-primary-fixed: "#131b2e"
  on-primary-fixed-variant: "#3f465c"
  secondary-fixed: "#dbe1ff"
  secondary-fixed-dim: "#b4c5ff"
  on-secondary-fixed: "#00174b"
  on-secondary-fixed-variant: "#003ea8"
  tertiary-fixed: "#ffe083"
  tertiary-fixed-dim: "#eec200"
  on-tertiary-fixed: "#231b00"
  on-tertiary-fixed-variant: "#574500"
  background: "#101415"
  on-background: "#e0e3e5"
  surface-variant: "#323537"
typography:
  display-lg:
    fontFamily: Sora
    fontSize: 48px
    fontWeight: "800"
    lineHeight: 56px
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: Sora
    fontSize: 32px
    fontWeight: "700"
    lineHeight: 40px
    letterSpacing: -0.01em
  headline-lg-mobile:
    fontFamily: Sora
    fontSize: 24px
    fontWeight: "700"
    lineHeight: 32px
  headline-md:
    fontFamily: Sora
    fontSize: 24px
    fontWeight: "600"
    lineHeight: 32px
  body-lg:
    fontFamily: Inter
    fontSize: 18px
    fontWeight: "400"
    lineHeight: 28px
  body-md:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: "400"
    lineHeight: 24px
  label-md:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: "600"
    lineHeight: 20px
    letterSpacing: 0.05em
  label-sm:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: "500"
    lineHeight: 16px
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  unit: 4px
  container-padding-mobile: 16px
  container-padding-desktop: 40px
  gutter: 20px
  stack-sm: 8px
  stack-md: 16px
  stack-lg: 32px
---

## Brand & Style

The design system is engineered for a premium archival experience, blending the high-energy spirit of football with the sophisticated precision of a curated gallery. The brand personality is "The Modern Curator"—it is authoritative, nostalgic yet forward-looking, and deeply respectful of sporting heritage.

The aesthetic follows a **Modern Corporate** foundation infused with **Glassmorphism** and **Minimalist** layouts. By prioritizing heavy whitespace (or "dark space") and expansive image containers, the UI recedes to let the textures and vibrant colors of football kits take center stage. The emotional response should be one of "Digital Prestige," making every shirt in a user's collection feel like a museum-grade artifact.

## Colors

The palette uses a "Deep Pitch" foundation to create a cinematic backdrop for photography.

- **Primary (Deep Navy):** Used for the global canvas and deep structural elements. It provides better depth than pure black, suggesting a premium, night-match atmosphere.
- **Secondary (Vibrant Blue):** The primary action color. Use for buttons, active states, and progress indicators. It represents modern performance.
- **Tertiary (Gold):** An "Achievement" accent. Use sparingly for rare kits, verified badges, special editions, or "favorite" states to denote value and prestige.
- **Surface/Neutral:** A range of grays from `#1E293B` (Surface) to `#F8FAFC` (Text) ensures high legibility and a crisp, modern finish.

## Typography

The typography system uses a dual-sans approach to balance athletic impact with functional clarity.

**Sora** is the display typeface. Its geometric construction and wide stance evoke modern sports branding and technical precision. It should be used for all major headings and numerical data (years, kit numbers).

**Inter** is the workhorse for all functional UI, descriptions, and metadata. Its neutral, systematic nature ensures that even dense kit specifications remain legible.

**Application Note:** Use all-caps with increased letter spacing for `label-md` to create a "technical spec" feel common in athletic equipment branding.

## Layout & Spacing

The layout follows a **Fluid Grid** system with a focus on asymmetrical balance.

- **Mobile:** 4-column grid with 16px margins. Cards usually span full width to maximize kit detail.
- **Desktop:** 12-column grid with 40px margins and 20px gutters.
- **The "Vault" Grid:** For kit galleries, use a "Masonry-lite" approach where vertical cards are primary.

Spacing follows a 4px baseline. Use larger `stack-lg` values between different kit eras or categories to create clear "archival chapters" within the scroll.

## Elevation & Depth

Depth in this design system is achieved through **Tonal Layering** and **Glassmorphism**, rather than traditional heavy shadows.

- **Level 0 (Pitch):** The primary background (#0F172A).
- **Level 1 (Plinth):** Cards and containers use a slightly lighter `#1E293B` to lift from the background.
- **Level 2 (Overlay):** Glassmorphism is used for navigation bars and floating action labels. Apply a `backdrop-filter: blur(12px)` with a 10% white tint.
- **Shadows:** When used, shadows should be "Ambient Glows"—highly diffused (24px+ blur) with a low opacity (15%) tint of the Secondary Blue, suggesting the kit is illuminated by stadium lights.

## Shapes

The shape language is "Sophisticated Softness." Large radii on primary containers prevent the athletic aesthetic from feeling too aggressive or "budget."

- **Cards/Images:** Use `rounded-xl` (24px on desktop, 16px on mobile) to frame photography.
- **Buttons/Inputs:** Use `rounded-lg` (12px) for a modern, tactile feel.
- **Tags/Badges:** Use "Pill" (full radius) for status indicators like "Authentic," "Replica," or "Sold."

Maintain a strict inner-border-radius relationship: the inner element's radius should be 4-8px smaller than the outer container's radius.

## Components

- **Kit Cards:** The centerpiece component. They must feature a high-aspect ratio image container. Metadata (Year, Team) should be overlaid using a glassmorphic bottom-shelf or placed directly below with high-contrast typography.
- **Action Buttons:** Primary buttons use a solid Vibrant Blue fill with white text. Secondary buttons should use a "Ghost" style (Deep Navy background with a 1px border of #334155).
- **The "Spec" List:** For kit details (fabric, size, manufacturer), use a horizontal list of badges with `label-sm` text.
- **Archival Filters:** Use segmented controls with a subtle sliding background animation to switch between "Home," "Away," and "Third" kits.
- **Image Treatment:** All kit photography should have a consistent "Studio" look. Apply a subtle vignette to the top and bottom of large image containers to ensure white text overlays remain legible.
- **Status Chips:** Small, high-contrast badges used for "Match Worn" or "Deadstock" tags, using the Tertiary Gold for high-value items.
