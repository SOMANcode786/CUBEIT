# CubeIQ Page — CubeIT Website Integration

This package contains **only the CubeIQ page** and its page-scoped components. It is not a separate project, microsite, or standalone application.

## Place the files

Put these files in the same route folder as `cubeit-site.tsx`:

```text
app/cubeiq/
├── page.tsx
├── cubeit-site.tsx              # already exists in your project
├── CubeIQCanvas.tsx
├── GrowthDiagnostic.tsx
├── AnimatedText.tsx
├── MagneticLink.tsx
├── cubeiq.data.ts
└── cubeiq.module.css
```

`page.tsx` imports the existing global navbar with:

```tsx
import { Navbar } from "./cubeit-site";
```

The navbar code supplied in the brief already contains the `/cubeiq` link, so this package does not duplicate or replace the navigation.

## Existing dependencies used

The implementation uses libraries that already appeared in the supplied CubeIT/CubeIQ code:

- `next`
- `react`
- `three`
- `gsap`
- `lucide-react`

No additional animation framework, smooth-scroll library, post-processing package, or 3D model dependency is introduced.

## Existing public assets used

```text
/public/cubeiq-assets/meta.svg
/public/cubeiq-assets/instagram.svg
/public/cubeiq-assets/facebook.svg
/public/cubeiq-assets/google ads.svg
/public/cubeiq-assets/googleconsole.svg
/public/cubeiq-assets/shopify.svg
/public/cubeiq-assets/whatsapp.svg
/public/cubeiq-assets/campaign-creators-pypeCEaJeZY-unsplash.jpg
/public/cubeiq-assets/1981-digital-bf9sZBcGQl4-unsplash.jpg
```

The Google Ads file is referenced as `/cubeiq-assets/google%20ads.svg` because the existing filename contains a space.

## What is implemented

- CubeIT → CubeIQ positioning and story
- Cinematic hero with a connected Three.js architecture
- Broken-growth-system SVG sequence
- Six outcome-led service layers
- Ten-stage scroll-controlled growth engine
- Individual platform explanations using the supplied SVG assets
- Major CubeIT + CubeIQ relationship section
- Connected-vs-fragmented agency comparison
- Seven-stage CubeIQ operating method
- Deliverables and client experience
- Proof framework without fake results or testimonials
- Interactive audience self-selection
- Four-step growth diagnostic connected to `/contact`
- Earned final conversion sequence
- Reusable accessible text splitting
- ScrollTrigger SVG drawing, reveals, scrubbed progress and active states
- Raw Three.js scene using a single render loop and no deprecated `THREE.Clock`
- Light mode and neutral-charcoal dark mode
- Responsive mobile layouts and simplified mobile canvas
- Reduced-motion and WebGL fallback states
- Page-scoped CSS only

## Contact flow

The diagnostic and CTAs route into the existing contact page with query parameters, for example:

```text
/contact?source=cubeiq-diagnostic&goal=Qualified+leads&...
```

Your current contact page can ignore these parameters, or later read them to prefill context.

## Validation performed on this package

- TypeScript/TSX transpilation syntax check
- CSS parser validation
- CSS-module reference coverage check
- Asset-path inventory check
- No `THREE.Clock`
- No Lenis instance
- No duplicate navbar component
- No remote image URLs
- No invented client logos, testimonials, revenue claims, or performance figures

A full `next build` must still be run inside the real CubeIT repository because the complete project configuration, aliases, global CSS, installed package versions, and shared application files are not available in this sandbox.
