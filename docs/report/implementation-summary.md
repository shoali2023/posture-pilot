# PosturePilot — Implementation Summary

> Academic prototype developed for the Master's programme in Intelligent Systems at the University of Salamanca, 2025–2026.

## Overview

PosturePilot is a browser-based posture awareness assistant built with React 18, Vite, TypeScript, and MediaPipe PoseLandmarker. It provides real-time skeleton overlay, posture condition detection, personalised reminders, calibration, session history, and habit analytics — all running locally without any server-side component.

---

## Technology choices

| Concern | Choice | Rationale |
|---|---|---|
| Pose detection | MediaPipe PoseLandmarker (WASM) | Runs entirely client-side; widely documented; battle-tested in production |
| Framework | React 18 + Vite + TypeScript | Industry standard; strong ecosystem; fast iteration |
| Charts | Recharts | React-native; supports pie and bar charts needed for analytics |
| Testing | Vitest + React Testing Library | Fast; native ESM; compatible with Vite config |
| Storage | localStorage | No backend required; privacy-first; zero infrastructure cost |

---

## Architecture summary

### State ownership

All critical session and user state lives at `App.tsx` level. Tab components are pure view layers — none of them own data that must survive a tab switch.

| State | Lives in |
|---|---|
| User profile | `App.tsx` ← `profileStorage.ts` |
| Calibration baseline | `App.tsx` ← `calibrationLogic.ts` |
| Session summary + condition frequency | `App.tsx` |
| Session history | `App.tsx` ← `sessionHistoryStorage.ts` |
| Reminder timer | `useReminderTimer` hook (App level) |
| Active tab | `App.tsx` |

### Component hierarchy

```
App
├── WelcomeScreen (first launch)
└── Main layout
    ├── AppTabs
    ├── Home tab — ProfileSetup, UserGuide, PrivacyFirstCard
    ├── Live Check tab (always mounted, hidden when inactive)
    │   ├── PoseCamera (camera + skeleton + smoothing + session lifecycle)
    │   └── CalibrationPanel (countdown → preview → accept flow)
    ├── Reminders tab — ReminderPanel
    ├── Analytics tab — AnalyticsDashboard (Current session / History / Habit tracker)
    └── Settings tab — smoothing selector, profile, data management
```

### Data flow (Live Check)

```
Camera frame
→ MediaPipe PoseLandmarker.detectForVideo()
→ LandmarkSmoother (EMA α=0.35)
→ analyzePosture(smoothedLandmarks)
→ ScalarSmoother (EMA α=0.15, display-only)
→ PostureStatusStabilizer (hysteresis: bad=3f, warning=5f, good=7f)
→ drawSkeleton(canvas)  [every frame, ~30–60 fps]
→ setPostureResult()    [throttled to ~8 fps for stable UI numbers]
```

---

## Key design decisions

### Privacy-first
No backend. No accounts. No video uploaded. MediaPipe model files are downloaded once from public CDNs (Google Storage + jsDelivr) and cached. All posture processing happens in the browser.

### Session persistence across tab switches
The Live Check `<div>` is always mounted with `display: none` when inactive. `PoseCamera` receives an `isActive` prop — when it becomes `false` while running, the camera auto-pauses and a session checkpoint is preserved. The user returns to a "Session paused" state.

### Smoothing strategy
Two layers:
1. **Landmark EMA** (α=0.35, configurable Low/Balanced/High) — reduces skeleton jitter
2. **Display metric EMA** (α=0.15) — calms visible numbers without delaying posture logic

### Calibration UX
3-step flow: idle → 3-second countdown (collects ≥30 frames) → preview with Accept / Try again. Baseline is the average of collected samples rather than a single frame, giving more reliable reference values.

### Reminder templates
Multiple named checklists per user role (3–4 templates each). The active template rotates on each reminder cycle using modulo, so the same checklist is never shown twice in a row. Template title is shown as the checklist heading.

### Notification architecture
Browser notifications are triggered from a `useEffect` watching `reminderCount`, not from inside a React state updater. This avoids silent failures in React's concurrent mode.

---

## Test coverage

**29 test files · 534 tests · 100% passing**

Covers: posture math, gesture dictionary, heuristic evaluation, profile presets, reminder logic + template rotation, recommendation engine, calibration logic, session history storage, notification service, landmark smoothing, posture status stabilizer, all UI components, App integration, session lifecycle.

Not covered by automated tests: MediaPipe WASM inference, webcam hardware, canvas drawing, real browser notification dialog, cross-browser timing.

---

## Limitations

- Accuracy depends on lighting, camera angle, clothing, and body visibility.
- Recommended distance: 1.5–2 m from camera, head and shoulders in frame.
- Not clinically validated. Not a medical device.
- No offline mode for first load — MediaPipe model downloaded from CDN.

---

## Author

Ali Shoeibi  
MSc Intelligent Systems — University of Salamanca  
GitHub: [github.com/shoali2023](https://github.com/shoali2023)  
LinkedIn: [linkedin.com/in/ali-shoeibi01](https://www.linkedin.com/in/ali-shoeibi01)
