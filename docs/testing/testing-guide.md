# PosturePilot — Testing Guide

## Test files

| File | Type | What it covers |
|---|---|---|
| `postureMath.test.ts` | Unit | analyzePosture, angle formulas, visibility threshold |
| `gestureDictionary.test.ts` | Unit | 5 conditions, all required fields, severity |
| `heuristicEvaluation.test.ts` | Unit | 10 heuristics, score ranges, improvement values |
| `heuristicMetrics.test.ts` | Unit | Average and sort helpers |
| `profilePresets.test.ts` | Unit | 6 role presets, defaults, label maps |
| `reminderLogic.test.ts` | Unit | Intervals, checklist, progress, fatigue limit |
| `recommendationEngine.test.ts` | Unit | Condition/role/session rules, no medical language |
| `calibrationLogic.test.ts` | Unit | Baseline creation, deviation, localStorage round-trip |
| `sessionHistoryStorage.test.ts` | Unit | Save/load/delete records, weekly/monthly filter, averages, top condition |
| `notificationService.test.ts` | Unit | Permission states (granted/denied/default/unsupported), notification creation |
| `useReminderTimer.test.ts` | Hook | Global timer state, pause/resume/reset, toggleItem, countdown, notifications |
| `FeedbackBadge.test.tsx` | Component | Correct label and CSS per status |
| `PostureReport.test.tsx` | Component | Metrics, condition cards, null handling |
| `UserGuide.test.tsx` | Component | Setup steps, gesture cards, collapsible details |
| `ProfileSetup.test.tsx` | Component | Role selection, save, skip, edit mode |
| `PostureOverlay.test.tsx` | Component | good/warning/bad/low-visibility states |
| `CalibrationPanel.test.tsx` | Component | Baseline display, live deviation, inline mode, calibrate/reset actions |
| `ReminderPanel.test.tsx` | Component | Countdown display, pause/resume, checklist toggle, fatigue, notifications UI |
| `AnalyticsDashboard.test.tsx` | Component | Empty state, session stats, recommendations, sub-tab navigation, history table |
| `AppTabs.test.tsx` | Component | All 5 tabs rendered, active state, click handler |
| `HabitTracker.test.tsx` | Component | 28-day grid, empty/high/mid/low day cells, legend |
| `SessionHistoryTable.test.tsx` | Component | Empty state, record rows, duration, good%, top condition, delete |
| `AppFooter.test.tsx` | Component | Author name, GitHub/LinkedIn links, disclaimer |
| `WelcomeScreen.test.tsx` | Component | No profile / saved profile flows, all action buttons |
| `App.test.tsx` | Integration | WelcomeScreen stage, tab switching, profile chip, AppFooter |

---

## How to run

```bash
# Run all tests once
npm test

# Watch mode
npm run test:watch

# Coverage report (HTML in coverage/)
npm run test:coverage
```

The vitest config allocates 4 GB heap per worker (`--max-old-space-size=4096`) to handle 25 simultaneous jsdom environments.

---

## Architecture: where state lives

| State | Owner | Why |
|---|---|---|
| `userProfile` | `App.tsx` | Persists across tabs, drives all personalization |
| `baseline` | `App.tsx` | Persists across tabs; CalibrationPanel receives it as prop |
| `sessionSummary`, `conditionFrequency` | `App.tsx` | Analytics receives them as props |
| `sessionHistory` | `App.tsx` | Loaded from `localStorage` on mount; updated after each Stop |
| `postureResult` | `App.tsx` (via `onPostureUpdate` from PoseCamera) | Calibration and overlay both need it at App level |
| Timer state (remainingSeconds, isPaused, items…) | `useReminderTimer` hook | Global — does NOT reset when Reminders tab is unmounted |
| `activeTab` | `App.tsx` | Controls which content is rendered |

**Rule:** no critical state lives inside tab-mounted components. Tabs are pure view layers.

---

## What IS tested

**Posture logic**
- Mathematical correctness of `analyzePosture` for all 5 posture conditions
- Angle formula behavior and visibility/confidence thresholds
- Defensive handling of empty/incomplete landmark arrays

**Personalization**
- Profile presets for 6 roles — completeness, defaults, label maps
- ProfileSetup form: role selection, save, skip, edit
- Reminder intervals per role and custom frequency
- Checklist items differ correctly per role

**Global reminder timer (hook-level)**
- Correct interval initialised from profile
- Pause/resume changes `isPaused` without resetting countdown
- `reset()` restores full interval and clears `reminderCount`
- `toggleItem` marks/unmarks items and updates `progress`
- Timer counts down when not paused (fake timers)
- Timer does NOT count down when paused

**Calibration**
- Baseline captured from `PostureResult` (shoulderTilt, trunkAngle, neckOffset)
- Deviation calculated correctly and uses absolute values
- localStorage round-trip (save → load → reset)
- Live deviation display: shown when both baseline and posture present
- After reset: all values disappear, no stale numbers remain
- Inline mode: no title heading, compact description

**Desktop notifications**
- `isNotificationSupported` returns false when `window.Notification` is undefined
- `getNotificationPermission` returns current state or 'denied' when unsupported
- `requestNotificationPermission` calls browser API and returns result
- `showPostureReminderNotification` creates notification only when granted
- No notification when denied or unsupported

**Session history**
- Records saved newest-first, max 60 kept
- `clearSessionHistory` wipes all records
- `deleteSessionRecord` removes by id
- `getSessionsByWeek` filters to last 7 days
- `averagePostureStats` returns correct averages
- `topConditionAcrossRecords` sums across sessions

**Habit tracker**
- 28 cells rendered (one per day)
- Correct colour class based on average good %
- Empty days use empty class

**Session history table**
- Empty state message when no records
- Table headers and one row per record
- Formatted duration, percentages, top condition
- Delete button calls `onDelete` with record id

**Footer and welcome screen**
- Author name, GitHub/LinkedIn links with correct href and target=_blank
- WelcomeScreen shows correct flow for no-profile vs saved-profile
- All action buttons call their callbacks

**Navigation**
- All 5 tabs render and respond to click
- Active tab has correct `aria-selected` state

**App integration**
- WelcomeScreen shown on first load; skipping enters app
- Tab content switches correctly
- AppFooter always visible

---

## What is NOT tested

| Excluded | Reason |
|---|---|
| MediaPipe inference | WASM/GPU/real model — unavailable in jsdom |
| Webcam / getUserMedia | Hardware — mocked at module level |
| Canvas drawing | jsdom Canvas API is mocked; verified manually |
| Notification dialog (real browser) | Browser UI — verified in manual QA |
| Real timer accuracy (long intervals) | Wall-clock drift — covered by fake-timer tests |
| Cross-browser webcam differences | Physical browser testing required |
| Clinical validation | This system is a posture-awareness prototype, not a medical device |

---

## Mocking strategy

**PoseCamera** — mocked entirely in App tests:
```typescript
vi.mock('../components/PoseCamera', () => ({
  PoseCamera: () => <div data-testid="mock-pose-camera" />,
}))
```

**Storage modules** — mocked in App tests to avoid localStorage dependency:
```typescript
vi.mock('../lib/storage/profileStorage', () => ({
  loadProfile: () => null, saveProfile: vi.fn(), clearProfile: vi.fn(),
}))
vi.mock('../lib/history/sessionHistoryStorage', () => ({ ... }))
vi.mock('../lib/calibration/calibrationLogic', () => ({ ... }))
```

**useReminderTimer** — mocked in App tests:
```typescript
vi.mock('../hooks/useReminderTimer', () => ({
  useReminderTimer: () => ({ intervalMinutes: 45, ... }),
}))
```

**Notification API** — stubbed per test in `notificationService.test.ts`:
```typescript
vi.stubGlobal('Notification', undefined)           // unsupported
vi.stubGlobal('Notification', mockCtor)            // granted/denied/default
```

**localStorage** — stubbed in pure `.ts` unit tests:
```typescript
vi.stubGlobal('localStorage', { getItem, setItem, removeItem, clear })
```

**Recharts** — mocked in AnalyticsDashboard tests (SVG not available in jsdom):
```typescript
vi.mock('recharts', () => ({ ResponsiveContainer: ..., PieChart: ..., ... }))
```
