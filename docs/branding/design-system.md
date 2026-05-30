# PosturePilot Design System

## Color tokens

| Token | Hex | Usage |
|---|---|---|
| `--color-primary` | `#6172F3` | Buttons, active tabs, links, logo wordmark, accent |
| `--color-secondary` | `#2DD4BF` | Arc endpoints, privacy card border, highlights |
| `--color-bg` | `#0F1117` | App background, OG image background |
| `--color-surface` | `#181C27` | Cards, panels, form backgrounds |
| `--color-surface-2` | `#222840` | Secondary surfaces, metric blocks |
| `--color-border` | `#2E3650` | All borders and dividers |
| `--color-text` | `#F1F5F9` | Primary text |
| `--color-text-muted` | `#64748B` | Secondary text, labels, hints |
| `--color-card` | `#1C2133` | Card backgrounds |
| `--color-focus` | `rgba(97,114,243,0.45)` | Focus rings |
| `--color-success` | `#4ADE80` | Good posture status |
| `--color-warning` | `#FBBF24` | Warning posture status |
| `--color-danger` | `#F87171` | Bad posture status, danger buttons |

**Semantic aliases** (map to above for backward compatibility):
- `--color-good` → `--color-success`
- `--color-bad` → `--color-danger`
- `--color-accent` → `--color-primary`

---

## Typography

Font stack: `system-ui, -apple-system, 'Segoe UI', sans-serif`

| Role | Size | Weight | Notes |
|---|---|---|---|
| Page title (logo fallback) | 1.5–2 rem | 700 | Use BrandLogo instead where possible |
| Section heading (h2) | 1.25 rem | 700 | — |
| Sub-section heading (h3) | 0.95–1 rem | 700 | — |
| Label / chip text | 0.7–0.8 rem | 600 | Uppercase, 0.06em spacing |
| Body | 0.875–0.9 rem | 400 | line-height 1.5–1.6 |
| Caption / hint | 0.72–0.78 rem | 400 | `--color-text-muted` |

---

## Spacing

The app uses a consistent `gap: 1.25rem` baseline between major sections. Cards use `padding: 1.25rem 1.5rem`.

---

## Border radius

| Token | Value | Usage |
|---|---|---|
| `--radius-sm` | 4px | Tags, badges, small chips |
| `--radius-md` (`--radius`) | 8px | Buttons, inputs, metric blocks |
| `--radius-card` | 12px | Cards, panels, calibration panel |
| `--radius-modal` | 20px | Dialogs, welcome screen card |

---

## Status badges / posture feedback

| State | Border / overlay | Text |
|---|---|---|
| Good | Green glow `#4ADE80` | No message |
| Warning | Amber frame `#FBBF24` | "A small adjustment might help." |
| Bad | Red frame `#F87171` | "Try sitting upright — a posture check can help." |
| Low visibility | Dark tint | "Not enough body is visible. Try adjusting your distance, lighting, or camera angle." |

---

## Button variants

| Class | Background | Text color | Use for |
|---|---|---|---|
| `.btn--primary` | `--color-primary` (#6172F3) | white | Primary actions (Save, Start session) |
| `.btn--secondary` | `--color-surface-2` | `--color-text` | Secondary actions (Reset, Pause) |
| `.btn--danger` | `--color-danger` (#F87171) | white | Destructive actions (Stop session) |
| `.btn--ghost` | transparent | `--color-primary` | Low-emphasis (Skip, Edit) |

---

## Card style

```css
background: var(--color-surface);
border: 1px solid var(--color-border);
border-radius: var(--radius-card);
padding: 1.25rem 1.5rem;
```

Accent left border for contextual cards (e.g. PrivacyFirstCard):
```css
border-left: 3px solid var(--color-secondary);
```

---

## Overlay style (PostureOverlay)

Applied over camera viewport with `position: absolute; inset: 0; pointer-events: none`.

| State | Box shadow | Background |
|---|---|---|
| Good | Green glow, inset | transparent |
| Warning | Amber frame, inset | warm translucent |
| Bad | Red frame, inset | red translucent |
| Low visibility | — | dark 60% opacity |

---

## Chart color rules

- Good: `#4ADE80`
- Warning: `#FBBF24`
- Bad: `#F87171`
- Condition bars: `--color-primary` (#6172F3)
- Priority high: `#F87171`, medium: `#FBBF24`, low: secondary teal

---

## Microcopy principles

1. **Calm over alarmist** — never say "Bad posture detected." Say "A small adjustment might help."
2. **Supportive, not prescriptive** — use "Consider…", "You may benefit from…", "Try…"
3. **Non-medical** — avoid "diagnose", "treat", "clinical". Use "posture awareness", "habit-building".
4. **Human voice** — write as if a thoughtful colleague is watching your back, not a robot.
5. **Privacy-positive** — remind users their data is local and theirs to delete.
6. **Concise** — one clear sentence beats three hedged ones.

---

## Logo usage summary

See `asset-usage-guide.md` for full details.

| Context | Asset |
|---|---|
| App header / navbar (dark bg) | `posturepilot-logo-horizontal-dark.svg` |
| Welcome screen / hero | `posturepilot-logo-mark.svg` |
| Small UI, footer symbol | `posturepilot-symbol-bare.svg` |
| README / docs (light bg) | `posturepilot-logo-horizontal-light.svg` |
| OG / social preview | `posturepilot-og-image.png` |
