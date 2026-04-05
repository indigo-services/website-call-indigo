# Indigo Admin Asset Kit

This folder is the clean handoff point for replacing Strapi admin branding with Indigo assets.

## Exact Strapi replacement surface

Strapi's admin customization hooks support these minimum asset replacements:

- `config.auth.logo`
- `config.menu.logo`
- `config.head.favicon`

These are wired from `strapi/src/admin/app.tsx`.

## Core behavior from Strapi

- unauthenticated auth logo is rendered at `height: 7.2rem`
- accepted formats are `image/jpeg`, `image/png`, `image/svg+xml`
- admin upload constraints for branding assets are:
  - max dimension: `750x750`
  - max size: `100KB`

## Recommended Indigo deliverables

1. `auth-logo`
   A horizontal Indigo wordmark for the login screen.

2. `menu-logo`
   A compact Indigo wordmark or mark+wordmark lockup for the left nav.

3. `favicon`
   A square Indigo app icon for browser tab/favicon use.

## Source references

- `source/indigo-icon-source.png`
- `source/indigo-wordmark-source.png`
- `source/current-strapi-login-reference.png`
- `source/strapi-default-logo-reference.svg`

## Output targets

Place generated production-ready assets in:

- `generated/indigo-auth-logo.svg`
- `generated/indigo-menu-logo.svg`
- `generated/indigo-favicon.svg`

SVG is preferred for auth and menu logos. Favicon can be SVG or PNG.

## Suggested integration

Once final assets exist, wire them in `strapi/src/admin/app.tsx` like:

```ts
import AuthLogo from './branding/generated/indigo-auth-logo.svg';
import MenuLogo from './branding/generated/indigo-menu-logo.svg';
import Favicon from './branding/generated/indigo-favicon.svg';

export default {
  config: {
    locales: [],
    auth: { logo: AuthLogo },
    menu: { logo: MenuLogo },
    head: { favicon: Favicon },
  },
};
```
