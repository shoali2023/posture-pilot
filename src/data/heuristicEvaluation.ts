export type HeuristicStatus = 'absent' | 'weak' | 'partial' | 'good'

export interface HeuristicMetric {
  id: number
  name: string
  statusBefore: HeuristicStatus
  statusAfter: HeuristicStatus
  scoreBefore: number   // 0–10
  scoreAfter: number    // 0–10
  improvement: number   // scoreAfter - scoreBefore
  evidence: string[]
  implementedChanges: string[]
}

export const HEURISTIC_EVALUATION: HeuristicMetric[] = [
  {
    id: 1,
    name: 'Visibility of System Status',
    statusBefore: 'partial',
    statusAfter: 'good',
    scoreBefore: 5,
    scoreAfter: 8,
    improvement: 3,
    evidence: ['FeedbackBadge', 'SessionPanel', 'PostureReport', 'loading states', 'LIVE indicator'],
    implementedChanges: [
      'A spinner and status message inform the user while the pose model loads.',
      'A pulsing LIVE indicator is shown during an active session.',
      'The posture status badge (Good / Warning / Poor) updates on every analysis frame.',
      'Confidence % is displayed in the PostureReport header so users know when detection is unreliable.',
      'A session stats bar shows elapsed time and frame count throughout the session.',
    ],
  },
  {
    id: 2,
    name: 'Match Between System and the Real World',
    statusBefore: 'weak',
    statusAfter: 'partial',
    scoreBefore: 4,
    scoreAfter: 7,
    improvement: 3,
    evidence: ['gestureDictionary', 'PostureReport', 'UserGuide', 'condition names in plain English'],
    implementedChanges: [
      'All posture conditions use natural English names: Upright posture, Uneven shoulders, Trunk lean, Head misalignment, Low body visibility.',
      'Feedback text describes observable body behaviour rather than internal metric values.',
      'A "What to do:" instruction is included on every issue condition card.',
      'The setup guide uses everyday measurements (1.5–2 metres recommended distance, good front-facing lighting).',
    ],
  },
  {
    id: 3,
    name: 'User Control and Freedom',
    statusBefore: 'partial',
    statusAfter: 'good',
    scoreBefore: 6,
    scoreAfter: 8,
    improvement: 2,
    evidence: ['PoseCamera controls', 'PostureReport details toggle', 'Reset + Stop buttons'],
    implementedChanges: [
      'Start, Stop, and Reset session buttons are always accessible during a session.',
      'A "Show posture details" toggle gives users control over information density — technical metrics are hidden by default.',
      'Reset is available both during and immediately after a session.',
      'Camera error states show a "Try again" button with an explanation of the cause.',
    ],
  },
  {
    id: 4,
    name: 'Consistency and Standards',
    statusBefore: 'partial',
    statusAfter: 'partial',
    scoreBefore: 5,
    scoreAfter: 7,
    improvement: 2,
    evidence: ['CSS custom properties', 'FeedbackBadge', 'condition cards', 'gesture cards', 'SessionSummary bars'],
    implementedChanges: [
      'A shared colour system (--color-good, --color-warning, --color-bad) is applied consistently across the skeleton overlay, status badges, condition cards, and session summary bars.',
      'Condition IDs are consistent across gestureDictionary, postureMath, and PostureReport — the same identifier resolves to the same name and description everywhere.',
      'Session lifecycle states (idle, running, paused, stopped) follow predictable naming throughout the codebase.',
    ],
  },
  {
    id: 5,
    name: 'Error Prevention',
    statusBefore: 'weak',
    statusAfter: 'good',
    scoreBefore: 3,
    scoreAfter: 8,
    improvement: 5,
    evidence: ['UserGuide', 'low_visibility condition', 'setup steps', 'camera error messages'],
    implementedChanges: [
      'The UserGuide on the Home tab shows 10 camera setup steps before the user starts a session — covering distance, lighting, body visibility, and session controls.',
      'Low visibility is treated as an explicit condition: when confidence drops below threshold, the skeleton fades and a condition card immediately tells the user how to reposition.',
      'Camera permission errors, missing camera, and generic hardware failures each produce a specific message with an actionable resolution.',
      'Missing or incomplete landmarks are handled gracefully — the analysis falls back safely without crashing the session.',
    ],
  },
  {
    id: 6,
    name: 'Recognition Rather than Recall',
    statusBefore: 'weak',
    statusAfter: 'partial',
    scoreBefore: 3,
    scoreAfter: 7,
    improvement: 4,
    evidence: ['UserGuide gesture cards', 'condition cards with userInstruction', 'setup steps list'],
    implementedChanges: [
      'All five posture conditions are shown in the UserGuide with name, description, and corrective instruction — users do not need to remember what each status means.',
      'Active condition cards in the posture report display a "What to do:" instruction directly next to the detected issue.',
      'Gesture cards in the UserGuide include a collapsible "Body points analysed" section listing the tracked landmarks and detection rules for users who want to understand the system.',
    ],
  },
  {
    id: 7,
    name: 'Flexibility and Efficiency of Use',
    statusBefore: 'partial',
    statusAfter: 'good',
    scoreBefore: 6,
    scoreAfter: 8,
    improvement: 2,
    evidence: ['Start/Stop/Reset', 'PostureReport details toggle', 'session resume without reload'],
    implementedChanges: [
      'The pose model loads once on startup; subsequent sessions do not require a page reload or model re-download.',
      'Technical metrics are hidden by default and revealed on demand, reducing noise for casual users while remaining available for advanced inspection.',
      'Switching tabs preserves the session — the camera pauses and can be resumed without losing accumulated data.',
    ],
  },
  {
    id: 8,
    name: 'Aesthetic and Minimalist Design',
    statusBefore: 'partial',
    statusAfter: 'partial',
    scoreBefore: 6,
    scoreAfter: 7,
    improvement: 1,
    evidence: ['"Show posture details" toggle', 'condition IDs in monospace', 'collapsible gesture card details', 'dark theme'],
    implementedChanges: [
      'Shoulder tilt, trunk angle, and neck offset metrics are hidden behind a "Show posture details" toggle — the default view shows only the status badge, confidence, and condition cards.',
      'Condition IDs are displayed in a small monospace tag, visually secondary to the human-readable condition name.',
      'Gesture cards in the UserGuide use a collapsible section for body-point and rule details, keeping the default view clean for non-technical users.',
    ],
  },
  {
    id: 9,
    name: 'Help Users Recognize, Diagnose, and Recover from Errors',
    statusBefore: 'weak',
    statusAfter: 'partial',
    scoreBefore: 4,
    scoreAfter: 7,
    improvement: 3,
    evidence: ['condition cards with feedback + userInstruction', 'low_visibility card', 'camera error messages'],
    implementedChanges: [
      'Each issue condition card explains what was detected (feedback) and what the user should do to correct it (userInstruction).',
      'The low_visibility condition provides a specific recovery instruction: reposition closer to the camera, improve lighting, and ensure the head, shoulders, and hips are in frame.',
      'Camera errors distinguish between permission denied (NotAllowedError), no camera found (NotFoundError), and unexpected hardware failures — each with a clear resolution message.',
    ],
  },
  {
    id: 10,
    name: 'Help and Documentation',
    statusBefore: 'absent',
    statusAfter: 'good',
    scoreBefore: 2,
    scoreAfter: 8,
    improvement: 6,
    evidence: ['UserGuide component', 'setup steps', 'gesture reference cards', 'Home tab as onboarding hub'],
    implementedChanges: [
      'The UserGuide on the Home tab presents 10 setup steps covering camera placement, body visibility, lighting, and session controls — visible before the user starts their first session.',
      'The Home tab acts as a persistent onboarding reference that users can return to at any time.',
      'All five posture conditions are documented in the UserGuide with name, description, severity level, and recovery instruction.',
      'Setup steps include the recommended camera distance (1.5–2 metres) and explain the meaning of Start, Stop, and Reset.',
    ],
  },
]
