# PosturePilot — Manual QA Checklist

Brief manual validation checks for the main browser-dependent flows. Automated tests cover logic and components; this checklist covers camera, notifications, and browser APIs that cannot be tested in jsdom.

---

## Welcome and profile

- App opens with a welcome screen on first visit.
- "Skip for now" enters the app without requiring a profile.
- "Set up your profile" opens the profile form.
- Returning users see "Welcome back" with their saved role.
- "Start fresh" clears all saved data.
- Disclaimer ("not a medical diagnosis tool") is visible.

## Tab navigation

- All five tabs (Home, Live Check, Reminders, Analytics, Settings) are accessible.
- Switching tabs does not reset app state.

## Live Check and camera

- Starting a session requests camera permission.
- Denying camera shows a clear error message.
- Skeleton overlay appears on the canvas when landmarks are detected.
- Posture overlay border changes colour: green (good), amber (warning), red (bad).
- Low-visibility condition appears when body landmarks fall below the confidence threshold.
- Session can be paused, resumed, and stopped.
- Stopping a session generates a summary.

## Calibration

- Calibration button is disabled until a session is running.
- Calibrating captures a 3-second countdown and shows a preview.
- Accepted baseline appears as "Calibrated — HH:MM:SS".
- Live deviation rows update in real time after calibration.
- Resetting calibration removes the baseline completely.
- Baseline persists after page reload.

## Reminders and notifications

- Reminder timer starts and counts down correctly.
- Timer does not reset when switching tabs.
- Pause and resume controls work.
- Browser notification permission is requested only after an explicit user action.
- Notifications fire when the reminder interval expires (if permission granted).
- No notification fires while reminders are paused.

## Analytics

- Current session summary shows duration, frame count, and posture distribution.
- Session history records accumulate across sessions.
- Analytics — History shows session rows newest first.
- Habit tracker renders a 28-day grid with colour-coded cells.
- Recommendations match the saved profile role.

## Settings and data

- "Clear session history" removes history records only.
- "Reset all data" removes profile, calibration, and history.
- Smoothing level selector (Low / Balanced / High) persists after reload.

## Privacy

- No video, landmarks, or personal data are uploaded during a session.
- Clearing all data from Settings removes every localStorage entry.

## Safety

- Disclaimer ("not a medical diagnosis tool") is visible in the footer, welcome screen, and Home tab.
- No medical language ("diagnose", "treat", "clinical guarantee") appears in recommendations.
- Healthcare professional notice is visible where relevant.

## Heuristic spot checks

| Heuristic | Check |
|---|---|
| Visibility of system status | Status badge, session timer, confidence indicator, and LIVE indicator are all visible |
| Match with real world | Condition names and feedback use plain language |
| User control | Start / Stop / Reset, pause / resume reminders, reset calibration, and clear data all work |
| Consistency | Green = good, amber = warning, red = bad throughout the UI |
| Error prevention | UserGuide explains camera setup before session starts |
| Recognition over recall | Condition cards show state and instructions inline |
| Flexibility | Profile, calibration, and notifications are all optional |
| Minimalist design | Technical metrics are hidden by default behind "Show posture details" |
| Error recovery | Camera errors show actionable messages per error type |
| Help and documentation | UserGuide is always accessible from the Home tab |

## Browser compatibility

| Browser | Expected |
|---|---|
| Chrome (latest) | Full functionality including notifications |
| Edge (latest) | Full functionality including notifications |
| Firefox (latest) | Full functionality; notifications may vary by OS |
