# PosturePilot — Screenshot Checklist

Use this checklist when capturing screenshots for the README, docs, or portfolio.

## Recommended browser setup

- Chrome (latest), 1280×800 viewport
- Dark theme (default)
- Camera permission granted
- Recommended distance: 1.5–2 m from camera

---

## Screens to capture

| # | Screen | State | Notes |
|---|---|---|---|
| 1 | Welcome screen — first visit | No saved profile | Shows logo mark + tagline + "Set up your profile" |
| 2 | Welcome screen — returning user | Profile saved | Shows "Welcome back" + saved role label |
| 3 | Home — profile setup | No profile selected | Role card grid visible |
| 4 | Home — profile saved | Remote Worker selected | Profile summary card + UserGuide below |
| 5 | Home — UserGuide | Expanded | Shows 10 setup steps and gesture cards |
| 6 | Live Check — ready state | Camera not started | "Press Start session to begin" placeholder |
| 7 | Live Check — good posture | Session running | Green overlay glow, skeleton visible, PostureReport shows good status |
| 8 | Live Check — warning posture | Session running | Amber frame, "Small posture adjustment suggested", condition card |
| 9 | Live Check — bad posture | Session running | Red frame, "Posture check recommended", multiple condition cards |
| 10 | Live Check — low visibility | Session running | Dark overlay hint, "Not enough body is visible" |
| 11 | Live Check — calibration | Session running, baseline set | CalibrationPanel shows baseline values + live deviation rows |
| 12 | Reminders tab | Profile set, countdown active | Timer, personalised checklist, pause button |
| 13 | Reminders tab — notifications | Permission granted | "Notifications on" label visible |
| 14 | Analytics — current session | After stopping a session | Stat cards, pie chart, bar chart, recommendation cards |
| 15 | Analytics — history | 2+ sessions recorded | Session table with dates, durations, percentages |
| 16 | Analytics — habit tracker | Multiple sessions on different days | 28-day grid with coloured cells |
| 17 | Settings — profile edit | Profile form open | Role cards, select fields |
| 18 | Settings — data management | Default | "Clear session history" and "Reset all data" buttons |
| 19 | Mobile responsive | 375px width | Ensure no overflow or broken layout |
| 20 | Footer | Any tab | Ali Shoeibi, GitHub/LinkedIn links, PosturePilot symbol |

---

## Naming convention

```
screenshots/
  01-welcome-first-visit.png
  02-welcome-returning.png
  03-home-profile-setup.png
  ...
```

---

## Notes

- Capture with no browser UI in frame if possible (use screenshot tool, not browser dev tools screenshot).
- The overlay screenshots (7–10) are best captured mid-session with natural lighting.
- Session history screenshots require at least 2 completed sessions.
- Habit tracker is most visually interesting with 10+ days of activity.
