# PosturePilot Logo Assets — Usage Guide

| Filename | Where to use | Background | Notes |
|---|---|---|---|
| posturepilot-logo-mark.svg | Main logo / README hero | transparent | Primary brand mark, 200×200 |
| posturepilot-logo-mark.png | README, landing page | transparent | Same, raster fallback |
| posturepilot-logo-horizontal-dark.svg | App header / navbar | dark | Icon + wordmark + subtitle |
| posturepilot-logo-horizontal-dark.png | Docs, social | dark | Raster fallback |
| posturepilot-logo-horizontal-light.svg | README light section, docs | light/white | No subtitle, dark text |
| posturepilot-logo-horizontal-light.png | Light docs / export | light/white | Raster fallback |
| posturepilot-app-icon-512.png | PWA icon, social preview | transparent | manifest.json icons[512] |
| posturepilot-app-icon-192.png | PWA manifest | transparent | manifest.json icons[192] |
| posturepilot-favicon-64.png | public/favicon-64.png | transparent | Browser tab / docs |
| posturepilot-favicon-32.png | public/favicon.png | transparent | Standard browser favicon |
| posturepilot-favicon-16.png | public/favicon-16.png | transparent | Small favicon fallback |
| posturepilot-logo-mono-dark.svg | Light bg, 1-color usage | transparent | Dark square icon |
| posturepilot-logo-mono-dark.png | Docs, print | transparent | Raster fallback |
| posturepilot-logo-mono-light.svg | Dark bg, 1-color usage | transparent | Light square icon |
| posturepilot-logo-mono-light.png | Inverted docs | transparent | Raster fallback |
| posturepilot-symbol-bare.svg | Small UI, loading indicators | transparent | No bg square, bare mark |
| posturepilot-symbol-bare.png | Inline icons, avatars | transparent | Raster fallback |
| posturepilot-og-image.png | README og:image, GitHub social | dark | 1200×630, meta og:image tag |

## Placement in a React/Vite project

```
public/
  favicon.png                          ← posturepilot-favicon-32.png
  favicon-16.png                       ← posturepilot-favicon-16.png
  favicon-64.png                       ← posturepilot-favicon-64.png
  logo-mark.svg                        ← posturepilot-logo-mark.svg
  og-image.png                         ← posturepilot-og-image.png
  manifest.json                        ← reference app-icon-512.png + 192.png

src/assets/
  posturepilot-logo-horizontal-dark.svg
  posturepilot-logo-horizontal-light.svg
  posturepilot-symbol-bare.svg
```

## index.html head tags

```html
<link rel="icon" type="image/png" sizes="32x32" href="/favicon.png">
<link rel="icon" type="image/png" sizes="16x16" href="/favicon-16.png">
<link rel="apple-touch-icon" sizes="192x192" href="/posturepilot-app-icon-192.png">
<meta property="og:image" content="/og-image.png">
<meta property="og:image:width" content="1200">
<meta property="og:image:height" content="630">
```

## Brand Colors

| Token | Hex | Usage |
|---|---|---|
| Primary Indigo | #6172F3 | P-arc, wordmark accent, buttons |
| Accent Teal | #2DD4BF | Arc endpoint, nodes, highlights |
| Light Stroke | #F1F5F9 | Icon mark elements on dark bg |
| Dark Background | #0F1117 | App bg, OG image bg |
| Surface | #181C27 | Cards, panels |
