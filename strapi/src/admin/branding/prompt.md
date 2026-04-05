# Indigo Admin Branding Prompt

Use this prompt with an image generator or sub-agent to create the minimum Strapi admin rebrand asset set.

## Prompt

Create a minimal, production-ready admin branding kit for an Indigo CMS built on top of Strapi.

Deliver exactly 3 assets:

1. `indigo-auth-logo`
2. `indigo-menu-logo`
3. `indigo-favicon`

Style requirements:

- Indigo brand palette, based on deep navy and rich indigo blue
- premium B2B software aesthetic
- calm, precise, modern, and technical
- no playful startup gradients
- no purple neon look
- no generic AI blob iconography
- typography should feel crisp and corporate, not futuristic or ornamental
- consistent geometry across all three assets
- same visual system, same corner language, same contrast model

Asset-specific requirements:

### 1. `indigo-auth-logo`

- horizontal wordmark or mark + wordmark lockup
- designed for Strapi login screen use
- readable on a dark admin background
- should feel centered and stable at approximately `7.2rem` rendered height
- export as SVG

### 2. `indigo-menu-logo`

- compact left-nav logo for admin shell
- may be wordmark-only or icon + short wordmark
- must remain legible at small sizes
- export as SVG

### 3. `indigo-favicon`

- square app icon
- strong silhouette
- instantly recognizable at small sizes
- export as SVG, plus optionally PNG

Technical constraints:

- keep each final asset within Strapi admin branding limits where possible
- max preferred artboard dimension: `750x750`
- max preferred file size target: under `100KB`
- avoid embedded raster effects unless necessary
- prefer vector-first output

Reference intent:

- preserve the seriousness and clarity of the current Strapi admin login layout
- replace Strapi identity with Indigo identity only
- no redesign of the full admin UI

Output requirements:

- transparent background where appropriate
- dark-background preview variants
- filenames:
  - `indigo-auth-logo.svg`
  - `indigo-menu-logo.svg`
  - `indigo-favicon.svg`
