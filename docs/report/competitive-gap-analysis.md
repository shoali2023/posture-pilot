# Competitive Gap Mapping — PosturePilot

> **Scope:** Web-based posture awareness tools and related physiotherapy motion-capture systems analysed in May 2025.  
> **Disclaimer:** PosturePilot is an academic prototype, not a clinical or commercial product. This document is for research and design purposes only.

---

## Summary table

| Competitor / Tool | Key Strengths | Limitations / Gaps | How PosturePilot addresses the gap |
|---|---|---|---|
| **Slouch Sniper** | Gentle webcam-based posture feedback; low-friction flow; no wearable; targets computer workers; privacy-first local processing; soft visual feedback (screen dimming) | Closed/commercial; mainly focused on slouching; no explicit gesture/posture dictionary; no visible heuristic evaluation layer; limited transparency of posture logic | Open academic prototype; browser-based with no account required; explicit `gestureDictionary` with named conditions, descriptions and landmark references; heuristic metrics panel; personalized reminders and analytics; **visual overlay uses its own soft frame/glow pattern** — does not copy Slouch Sniper's full-screen dimming |
| **SitSense** | Posture tracking for computer users; friendly feedback tone | Commercial/closed-source; limited transparency of detection logic; no explicit gesture dictionary accessible to users | Fully explainable posture conditions with names, descriptions and "what to do" instructions; open codebase; educational and HCI-oriented design; no subscription or account |
| **PostureGuard AI** | Open-source; uses MediaPipe; local in-browser processing; real-time skeleton overlay | Limited personalization by user role; no onboarding guidance for camera setup; no structured reminder system; no user profile system | Adds `ProfileSetup` with role-based presets (remote worker, student, researcher, developer, office worker); structured `ReminderPanel` with checklist and fatigue prevention; `UserGuide` with explicit setup steps; `AnalyticsDashboard` |
| **ExerSights** | MediaPipe-based; exercise angle tracking; visibility warnings; session charts | Oriented to fitness/exercise rather than desk posture; more complex setup; less focused on desk workers and study posture | Simple browser workflow with no installation; target users are remote workers, students, researchers and developers; posture awareness and micro-break focus; no fitness equipment or exercise library needed |
| **Physitrack / Kemtai / LainaHealth** | Strong clinical systems; advanced movement tracking and reporting; professional ecosystem; therapist integration | Closed-source or subscription-based; designed for clinical/professional context; not inspectable by students or researchers; not freely customizable | Fully open academic prototype; no backend, no subscription, no clinical claim; source code inspectable and extensible; safe posture-awareness language throughout (no medical claims) |
| **VALD HumanTrak / Vera / Reflexion Health** | High precision; clinical-grade biomechanics; 3D motion capture; validated in clinical literature | Requires expensive hardware or controlled environment; not accessible for standard laptop users; not designed for self-directed posture awareness | Webcam-only; runs in any modern browser; no additional hardware; designed for self-directed posture awareness at a desk; low cost and accessible for any user with a laptop |

---

## Gap summary — what PosturePilot uniquely addresses

| Gap in existing tools | PosturePilot response |
|---|---|
| Most are closed or require subscription | Open academic prototype, free to run locally |
| Lack of explicit posture/gesture dictionary | `gestureDictionary.ts` with named conditions, landmarks and instructions |
| No onboarding for camera positioning | `UserGuide.tsx` with 10-step setup guide |
| No role-based personalization | `ProfileSetup` with 5 role presets + customisation |
| Reminder fatigue (aggressive alerts) | `ReminderPanel` with pause/resume, session limit, gentle in-app reminders |
| No soft visual feedback for desk users | `PostureOverlay` — soft frame/glow (good: green; warning: amber; bad: red) without full-screen blocking |
| No calibration to individual baseline | `CalibrationPanel` — captures personal comfortable upright baseline and shows deviation |
| Analytics hard to understand | `AnalyticsDashboard` — friendly language, pie/bar charts, personalized recommendation cards |
| No HCI/heuristics layer | `heuristicMetrics.ts` + `HeuristicSummary.tsx` evaluating Nielsen's 10 heuristics |
| Medical/clinical framing | Safe language: "posture awareness", "physiotherapy-inspired suggestions", "not a medical diagnosis tool" |

---

## What was intentionally NOT adopted from Slouch Sniper

- No full-screen dimming or opacity overlay covering the whole browser window.
- No copy of its brand, colour scheme, or exact UX flow.
- No replication of its proprietary detection algorithms.

Inspiration adopted (conceptually, not copied):
- Gentle, non-intrusive posture feedback
- Low-friction correction flow
- Calm visual cues around the camera area
- Privacy-first, local-only processing
- Reminder intervals tuned to avoid notification fatigue
