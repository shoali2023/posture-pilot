# PosturePilot — Screenshots

This folder contains annotated screenshots for documentation, the README, and academic submission.

## Expected screenshots

Capture these in Chrome at 1280×800 with the live session running.

| Filename | Screen | Notes |
|---|---|---|
| `01-welcome-screen.png` | Welcome / first launch | Shows PosturePilot logo, tagline, "Set up your profile" button |
| `02-home-profile-setup.png` | Home tab — Profile Setup | Role cards, dropdowns, Save profile button |
| `03-live-check-start.png` | Live Check — ready state | Start session button, CalibrationPanel below viewport |
| `04-live-check-good-posture.png` | Live Check — good posture | Green skeleton overlay, PostureOverlay frame, Confidence |
| `05-live-check-warning-state.png` | Live Check — warning posture | Amber skeleton, condition card (e.g. Uneven shoulders) |
| `06-live-check-bad-posture.png` | Live Check — bad posture | Red skeleton and overlay |
| `07-low-visibility-state.png` | Live Check — too far from camera | Low visibility condition card, faded skeleton |
| `08-posture-details-panel.png` | Live Check — "Show posture details" open | Shoulder tilt, trunk angle, neck offset metrics visible |
| `09-calibration-countdown.png` | CalibrationPanel — counting | "Hold still… 2" countdown |
| `10-calibration-preview.png` | CalibrationPanel — preview | Baseline values, Accept / Try again buttons |
| `11-calibration-accepted.png` | CalibrationPanel — accepted | "Calibrated — HH:MM:SS" badge, live deviation rows |
| `12-session-paused.png` | Live Check — session paused | "Session paused. Your progress is saved." message |
| `13-reminders-tab.png` | Reminders tab | Countdown timer, posture checklist, template title |
| `14-analytics-current-session.png` | Analytics — Current session | Duration, frames, posture distribution pie chart |
| `15-analytics-history.png` | Analytics — History tab | Session records table with date/time |
| `16-analytics-habit-tracker.png` | Analytics — Habit tracker | 28-day grid, coloured cells, legend |
| `17-settings-smoothing.png` | Settings tab | Skeleton smoothing selector, profile form |

## How to capture

1. Run `npm run dev` and open `http://localhost:5173` in Chrome.
2. Open DevTools → Device toolbar → set to 1280×800.
3. Use Chrome's built-in screenshot (DevTools → `Ctrl+Shift+P` → "Capture screenshot").
4. Save to this folder with the names above.

## Notes

- Use good lighting when capturing live camera screenshots.
- Sit 1.5–2 m from the camera so head, shoulders and hips are visible.
- Crop or blur any personally identifiable background if needed.
