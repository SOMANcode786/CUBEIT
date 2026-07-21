# CubeIQ page for the existing CubeIT website

This is a page package, not a separate project.

## Place the files

```text
app/
└── cubeiq/
    ├── page.tsx
    └── cubeiq.module.css
```

The page intentionally does **not** render another navbar or footer. It should inherit CubeIT's existing shared layout.

## Existing packages used

```text
next
react
three
@react-three/fiber
@react-three/drei
gsap
framer-motion
lucide-react
```

## Existing public assets used

The page uses the current `/public/cubeiq-assets/*` images and platform SVGs plus `/public/brand/cubeit-logo.png`. No remote assets or placeholders are included.

## Existing navigation

Add one item to the current shared CubeIT navigation data/component without restructuring it:

```tsx
{ label: "CubeIQ", href: "/cubeiq" }
```

Keep the shared navbar and mobile-menu implementation exactly as they already are.
