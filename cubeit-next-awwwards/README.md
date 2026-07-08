# CubeIT Awwwards-Exact Next Project

A light-first / dark-mode Next.js + TypeScript + Tailwind v4 website for CubeIT, styled to closely match the supplied UpSunday reference screenshots while replacing the content with CubeIT/Qubit software, brand, web, and automation positioning.

## Included

- Frosted-glass top navigation matching the reference spacing, radius, shadow, and blur tone.
- Oversized rounded hero typography with inline media chips, orange scribble arrow, and a video slot.
- Scroll-triggered hero video morph: the small video stretches like cloth and expands into the full reel section, then reverses when scrolling up.
- Services, Works, Awards/proof slider, Metrics, Blog, and Footer sections following the provided reference rhythm.
- Dark mode and light mode with a Magic UI-style `AnimatedThemeToggler` using the View Transitions API and `variant="star"` reveal.
- React Bits component code integrated locally:
  - `BorderGlow`
  - `DotField`
  - `BlobCursor`
- Smooth scroll and scroll-triggered animations using Lenis + GSAP ScrollTrigger.
- Fluid blob cursor layer that spreads evenly through the viewport.
- Reduced-motion fallback.

## Run

```bash
npm install
npm run dev
```

Open `http://localhost:3000`.

## Verify

```bash
npm run lint
npm run build
```

Both commands passed in the sandbox before packaging.

## Notes

The official shadcn registry install command for `@magicui/animated-theme-toggler` could not run inside the sandbox because DNS to `ui.shadcn.com` failed. The component was added manually from the official Magic UI raw source/docs pattern, with the requested star variant and center-origin transition.
