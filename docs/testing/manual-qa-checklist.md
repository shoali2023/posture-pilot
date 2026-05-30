# PosturePilot — Manual QA Checklist

## Welcome screen

| # | Test | Expected | Pass/Fail |
|---|------|----------|-----------|
| W1 | Open app with no saved profile | WelcomeScreen shown with "Set up your profile" and "Skip for now" | |
| W2 | Click "Skip for now" | Enters app on Live Check tab, no profile chip shown | |
| W3 | Click "Set up your profile" | Enters app on Home tab, ProfileSetup form visible | |
| W4 | Open app with saved profile | WelcomeScreen shows "Welcome back" with saved role name | |
| W5 | Click "Continue with saved setup" | Enters app on Live Check tab, profile chip visible in header | |
| W6 | Click "Edit setup" | Enters app on Home tab, ProfileSetup in edit mode | |
| W7 | Click "Start fresh" | All data cleared, enters Home tab with empty profile form | |
| W8 | Disclaimer visible on WelcomeScreen | "not a medical diagnosis tool" shown | |

## Profile setup

| # | Test | Expected | Pass/Fail |
|---|------|----------|-----------|
| PR1 | Select "Remote Worker" role | Card highlights, Save enables | |
| PR2 | Select "Student" role | Student card highlights | |
| PR3 | Click "Save profile" | Profile chip appears in header | |
| PR4 | Click "Skip for now" / "Cancel" | No profile saved, returns to previous state | |
| PR5 | Open Home tab after profile saved | Profile summary card shown | |
| PR6 | Click "Edit profile" | Form opens with pre-filled values | |
| PR7 | Refresh page, "Continue with saved setup" | Profile still present after reload | |

## Tab navigation

| # | Test | Expected | Pass/Fail |
|---|------|----------|-----------|
| T1 | Click Home tab | ProfileSetup + UserGuide visible | |
| T2 | Click Live Check tab | Camera controls + CalibrationPanel visible | |
| T3 | Click Reminders tab | Countdown timer and checklist visible | |
| T4 | Click Analytics tab | Sub-tabs (Current session / History / Habit tracker) visible | |
| T5 | Click Settings tab | Profile form + Data section + About visible | |
| T6 | Switch tabs and return | Content is correct each time | |

## Live session

| # | Test | Expected | Pass/Fail |
|---|------|----------|-----------|
| L1 | Click "Start session" | Browser requests camera permission | |
| L2 | Allow camera | Video on canvas, skeleton overlay appears | |
| L3 | Deny camera | Error message with instructions | |
| L4 | Posture changes | PostureOverlay frame colour changes (green/amber/red) | |
| L5 | Move to warning posture | Amber frame + "Small posture adjustment suggested" | |
| L6 | Move to bad posture | Red frame + "Posture check recommended" | |
| L7 | Move far from camera (> 3 m) | Low-visibility hint overlay appears | |
| L8 | Click "Stop session" | Camera stops, session summary shown | |
| L9 | Click "Reset session" | Stats cleared, camera ready state | |
| L10 | Stop session → open Analytics | Session data visible in Current Session sub-tab | |
| L11 | Stop session → check History tab | New session record appears in table | |

## Calibration (in Live Check tab)

| # | Test | Expected | Pass/Fail |
|---|------|----------|-----------|
| CA1 | Live Check tab — no session | "Not calibrated" badge, Calibrate button disabled | |
| CA2 | Start session, sit comfortably upright | Calibrate button enables | |
| CA3 | Click "Calibrate posture" while seeing yourself | "Calibrated — HH:MM:SS" badge + baseline values shown | |
| CA4 | Change posture after calibrating | Live deviation rows update in real time (Shoulders / Trunk / Neck) | |
| CA5 | Good deviation (< 0.05) | Row shows green colour | |
| CA6 | Larger deviation (≥ 0.12) | Row shows red colour | |
| CA7 | Click "Reset calibration" | "Not calibrated" badge, baseline values disappear, deviation gone | |
| CA8 | Recalibrate | New baseline values appear, no old values remain | |
| CA9 | Refresh page → "Continue with saved setup" | Baseline still present | |

## Global reminder timer (does NOT reset on tab switch)

| # | Test | Expected | Pass/Fail |
|---|------|----------|-----------|
| R1 | Set up profile, stay on Home tab for 30 s | Timer is counting (not zero) | |
| R2 | Switch to Reminders tab | Timer shows elapsed time — it has NOT restarted | |
| R3 | Tick 2 checklist items, switch to Live Check, return to Reminders | Ticked items still ticked | |
| R4 | Switch tabs multiple times | Timer countdown continues uninterrupted | |
| R5 | Click "Pause reminders" | Timer shows "—", Resume button appears | |
| R6 | Click "Resume reminders" | Timer continues from where it paused | |
| R7 | Switch tabs while paused | Still paused when returning to Reminders | |
| R8 | Click "Reset timer & checklist" | Timer restarts, all items unchecked | |
| R9 | Complete 8 reminder cycles | Fatigue message appears: "enough posture reminders for this session" | |
| R10 | No profile set | Generic checklist (4 default items) | |
| R11 | Developer profile | Developer-specific checklist items | |
| R12 | Researcher profile | Researcher-specific checklist items | |

## Desktop notifications

| # | Test | Expected | Pass/Fail |
|---|------|----------|-----------|
| N1 | Open Reminders tab | Notifications section visible at bottom | |
| N2 | Browser supports notifications, permission = default | "Allow notifications" button shown | |
| N3 | Click "Allow notifications" | Browser permission dialog appears | |
| N4 | Grant permission | "Notifications on" label + "Disable" button appear | |
| N5 | Wait for reminder interval to expire | Browser desktop notification fires | |
| N6 | Pause reminders, wait for interval | No notification fires | |
| N7 | Permission denied | Warning message: "Notifications are blocked…" | |
| N8 | Browser does not support Notification API | "Your browser does not support desktop notifications" | |
| N9 | Click "Disable" | Notifications off, "Enable desktop notifications" button appears | |

## Analytics — Current session

| # | Test | Expected | Pass/Fail |
|---|------|----------|-----------|
| AN1 | Open Analytics before any session | "No session data yet" message | |
| AN2 | Stop a session, open Analytics | Duration, frames, good%, most frequent condition shown | |
| AN3 | Status distribution chart visible | Pie chart with good/warning/bad segments | |
| AN4 | Condition frequency chart (if conditions detected) | Bar chart shown | |
| AN5 | Recommendations match profile role | Remote worker → standing breaks, developer → micro-breaks | |
| AN6 | Second session better than first | Good posture stat shows "+X% vs previous" | |

## Analytics — History

| # | Test | Expected | Pass/Fail |
|---|------|----------|-----------|
| AH1 | Click "History" sub-tab | Session records table visible | |
| AH2 | No sessions recorded | "No sessions recorded yet" message | |
| AH3 | Complete a session, return to History | New row with date, duration, good/warning/bad % | |
| AH4 | Complete second session | Two rows, newest first | |
| AH5 | Weekly summary shows avg good posture | "This week (N sessions)" + average percentages | |
| AH6 | Click delete (×) on a record | Row removed from table | |
| AH7 | Refresh page → continue with saved setup | History still present | |
| AH8 | Settings → "Clear session history" | History wiped | |

## Analytics — Habit tracker

| # | Test | Expected | Pass/Fail |
|---|------|----------|-----------|
| HB1 | Click "Habit tracker" sub-tab | 28-day grid visible | |
| HB2 | Day with no session | Grey/empty cell | |
| HB3 | Day with session, good > 70% | Green cell | |
| HB4 | Day with session, good 40–70% | Amber cell | |
| HB5 | Day with session, good < 40% | Red cell | |
| HB6 | Hover over a cell | Tooltip shows date + session count + avg good% | |
| HB7 | Summary text visible | "You have completed N sessions in total." | |

## Footer (author info)

| # | Test | Expected | Pass/Fail |
|---|------|----------|-----------|
| F1 | Footer visible on all tabs | "Ali Shoeibi" and disclaimer always visible | |
| F2 | Click GitHub link | Opens https://github.com/shoali2023 in new tab | |
| F3 | Click LinkedIn link | Opens https://www.linkedin.com/in/ali-shoeibi01 in new tab | |
| F4 | Academic note visible | "Developed as an academic prototype…" | |

## State persistence (no resets on tab switch)

| # | Test | Expected | Pass/Fail |
|---|------|----------|-----------|
| P1 | Profile saved → switch all tabs | Profile chip stays in header throughout | |
| P2 | Calibration set → switch to Reminders → back to Live | Baseline still shown in Live Check | |
| P3 | Session summary → switch to Reminders → back to Analytics | Session stats still visible | |
| P4 | Reminder timer running → switch tabs → return | Timer has continued counting, not reset | |

## Safety and disclaimer

| # | Test | Expected | Pass/Fail |
|---|------|----------|-----------|
| S1 | Footer disclaimer visible everywhere | "not a medical diagnosis tool" text | |
| S2 | WelcomeScreen disclaimer visible | Same text | |
| S3 | Home tab inline disclaimer visible | Same text | |
| S4 | No medical language in recommendations | No "diagnose", "treat", "clinical guarantee" | |
| S5 | Healthcare professional prompt present | "If you experience pain, consult a healthcare professional" | |

## Heuristic / UX checks

| # | Heuristic | Check | Pass/Fail |
|---|-----------|-------|-----------|
| H1 | Visibility of system status | Loading spinner, live indicator, overlay, timer countdown all visible | |
| H2 | Match with real world | Plain English throughout, no raw variable names | |
| H3 | User control | Start/Stop/Reset, pause/resume reminders, reset calibration, clear data | |
| H4 | Consistency | Green = good, amber = warning, red = bad everywhere | |
| H5 | Error prevention | UserGuide + WelcomeScreen explains setup before camera starts | |
| H6 | Recognition over recall | All postures named with instructions | |
| H7 | Flexibility | Profile optional, calibration optional, notifications optional | |
| H8 | Minimalist design | Overlay subtle, sub-tabs keep analytics uncluttered | |
| H9 | Help recover from errors | Camera errors have actionable messages | |
| H10 | Help and documentation | UserGuide always accessible in Home tab | |

## Smoothing and visual stability

| # | Test | Expected | Pass/Fail |
|---|------|----------|-----------|
| SM1 | Start session, sit still for 10 seconds | Skeleton points do not jump around excessively | |
| SM2 | Sit still for 10 seconds | Shoulder tilt / trunk angle / neck offset values do not flicker wildly | |
| SM3 | Sit still for 10 seconds | Posture status (green/amber/red) does not rapidly flicker between states | |
| SM4 | Move between good and bad posture slowly | Status changes after a short delay (hysteresis), not instantly | |
| SM5 | Sit very close to or far from camera | Skeleton fades to semi-transparent (low-confidence opacity), does not disappear suddenly | |
| SM6 | Open Settings → Live Check section | "Skeleton smoothing" selector shows Low / Balanced / High | |
| SM7 | Change smoothing to "High", observe skeleton | Skeleton is visibly smoother but reacts slightly more slowly to movement | |
| SM8 | Change smoothing to "Low", observe skeleton | Skeleton tracks movement faster with slightly more jitter | |
| SM9 | Change smoothing to "Balanced", reload page | Setting is restored from localStorage (Balanced selected) | |

## Technical metrics details panel

| # | Test | Expected | Pass/Fail |
|---|------|----------|-----------|
| DT1 | Open Live Check | Technical metrics (Shoulder tilt, Trunk angle, Neck offset) are NOT visible by default | |
| DT2 | Open Live Check | "Show posture details" button is visible | |
| DT3 | Click "Show posture details" | Shoulder tilt, Trunk angle, Neck offset values appear | |
| DT4 | Metrics visible after opening | Shoulder tilt shows 3 decimal places, Trunk angle shows 1 decimal place + °, Neck offset shows 3 decimal places | |
| DT5 | Click "Hide posture details" | Metric values disappear again | |
| DT6 | Button label after opening | Shows "Hide posture details" | |
| DT7 | Button label after hiding | Shows "Show posture details" again | |
| DT8 | Confidence % always visible | "Confidence: XX%" shown in main header without clicking details | |

## Session lifecycle across tab switches

| # | Test | Expected | Pass/Fail |
|---|------|----------|-----------|
| SL1 | Start session, wait 20 seconds | Session timer is running | |
| SL2 | Switch to Analytics tab | Live tab content is hidden but NOT destroyed; session timer stops | |
| SL3 | Return to Live Check tab | "Session paused — your progress is saved" and "Camera paused for privacy" message visible | |
| SL4 | Return to Live Check tab | "Resume session" and "End session" buttons visible | |
| SL5 | Click "Resume session" after returning | Camera restarts, session continues (timer resumes, existing frame counts kept) | |
| SL6 | Click "End session" after returning from tab switch | Session summary shown with accumulated data | |
| SL7 | Switch tabs multiple times without stopping | Session remains paused, never reset silently | |
| SL8 | Start session → switch to Reminders → switch to Analytics → return to Live | Session still paused with correct data | |
| SL9 | Click "Stop session" while session running | Session summary shown, history record saved | |
| SL10 | After stopping, open Analytics → History sub-tab | New session record appears with correct duration and posture percentages | |
| SL11 | Click "Reset session" | Stats cleared, camera returns to ready state (no paused data left) | |

## Browser / device matrix

| Browser | Test | Pass/Fail |
|---------|------|-----------|
| Chrome (latest) | Full session + notifications | |
| Edge (latest) | Full session + notifications | |
| Firefox (latest) | Full session (notifications may vary) | |
| Laptop webcam | Skeleton visible, calibration works | |
| Low light | low_visibility triggers | |
| 1.5–2 m from camera | All conditions detectable | |
| > 3 m from camera | low_visibility triggers | |
