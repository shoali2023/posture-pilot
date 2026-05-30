import type { UserRole } from '../types/userProfile'

export interface ReminderTemplate {
  title: string
  items: string[]
}

const REMOTE_WORKER_TEMPLATES: ReminderTemplate[] = [
  {
    title: 'Posture reset',
    items: [
      'Align your head with your shoulders.',
      'Relax your shoulders away from your ears.',
      'Sit tall and take one slow breath.',
      'Check that your feet are flat on the floor.',
    ],
  },
  {
    title: 'Screen break',
    items: [
      'Look away from the screen for 20 seconds.',
      'Blink slowly a few times.',
      'Drop your shoulders and unclench your jaw.',
      'Check your screen is at eye level.',
    ],
  },
  {
    title: 'Standing micro-break',
    items: [
      'Stand up for one minute.',
      'Gently roll your shoulders back.',
      'Reset your sitting position when you return.',
      'Take a short walk if you can.',
    ],
  },
  {
    title: 'Neck and shoulder check',
    items: [
      'Tuck your chin slightly and lengthen your neck.',
      'Let your shoulders fall naturally.',
      'Adjust your chair height if needed.',
      'Rest your eyes for a moment.',
    ],
  },
]

const DEVELOPER_TEMPLATES: ReminderTemplate[] = [
  {
    title: 'Neck and screen check',
    items: [
      'Take a micro-break — step away for 2 minutes.',
      'Roll your shoulders back and relax them.',
      'Check that your screen is at eye level.',
      'Stretch your fingers and wrists.',
    ],
  },
  {
    title: 'Wrist and shoulder reset',
    items: [
      'Shake out your wrists gently.',
      'Relax your grip on the mouse or keyboard.',
      'Sit back from the screen for a moment.',
      'Take three slow breaths.',
    ],
  },
  {
    title: 'Focus break',
    items: [
      'Look away from the screen at something distant.',
      'Stand up and stretch your arms above your head.',
      'Roll your neck gently side to side.',
      'Hydrate — take a sip of water.',
    ],
  },
  {
    title: 'Posture reset',
    items: [
      'Sit back in your chair with your back supported.',
      'Bring your shoulders back and down.',
      'Check that your elbows are at a comfortable angle.',
      'Relax your face and jaw.',
    ],
  },
]

const STUDENT_TEMPLATES: ReminderTemplate[] = [
  {
    title: 'Study posture reset',
    items: [
      'Sit with your back straight against the chair.',
      'Keep the screen at 50–70 cm from your eyes.',
      'Relax your jaw and unclench your teeth.',
      'Place your feet flat on the floor.',
    ],
  },
  {
    title: 'Reading break',
    items: [
      'Take a 5-minute break and move around.',
      'Look at something far away for 20 seconds.',
      'Roll your shoulders gently.',
      'Drink some water.',
    ],
  },
  {
    title: 'Eye break',
    items: [
      'Close your eyes for 30 seconds.',
      'Blink several times to refresh your vision.',
      'Look at a distant object and then back to your screen.',
      'Adjust your screen brightness if it feels harsh.',
    ],
  },
]

const RESEARCHER_TEMPLATES: ReminderTemplate[] = [
  {
    title: 'Reading posture check',
    items: [
      'Check your neck is not bent forward while reading.',
      'Position documents close to screen height.',
      'Straighten your back and relax your shoulders.',
      'Rest your eyes — look at a distant object for 20 seconds.',
    ],
  },
  {
    title: 'Neck alignment',
    items: [
      'Sit back and lengthen your spine.',
      'Bring your head back over your shoulders.',
      'Relax the muscles at the back of your neck.',
      'Take a slow, deep breath.',
    ],
  },
  {
    title: 'Long-focus reset',
    items: [
      'Stand up and stretch for a minute.',
      'Rotate your ankles and flex your feet.',
      'Roll your shoulders back.',
      'Return to your seat with a refreshed posture.',
    ],
  },
]

const OFFICE_WORKER_TEMPLATES: ReminderTemplate[] = [
  {
    title: 'Chair and desk reset',
    items: [
      'Adjust your chair so your feet are flat on the floor.',
      'Keep your screen at arm\'s length.',
      'Relax your shoulders and avoid hunching.',
      'Stand up and walk for one minute.',
    ],
  },
  {
    title: 'Shoulder symmetry',
    items: [
      'Check that both shoulders are level.',
      'Avoid cradling the phone between your ear and shoulder.',
      'Sit evenly on both hips.',
      'Breathe in and let your shoulders drop on the exhale.',
    ],
  },
  {
    title: 'Screen distance check',
    items: [
      'Sit at arm\'s length from your screen.',
      'The top of the screen should be at or just below eye level.',
      'Take a 20-second eye break.',
      'Loosen your grip on the mouse.',
    ],
  },
]

const OTHER_TEMPLATES: ReminderTemplate[] = [
  {
    title: 'Quick posture reset',
    items: [
      'Check your head is aligned over your shoulders.',
      'Relax your shoulders and arms.',
      'Take a short break and move.',
      'Look away from the screen.',
    ],
  },
  {
    title: 'Stretch and breathe',
    items: [
      'Sit tall and take three slow breaths.',
      'Gently roll your shoulders.',
      'Unclench your jaw and relax your face.',
      'Look at something in the distance.',
    ],
  },
  {
    title: 'Movement break',
    items: [
      'Stand up for a minute.',
      'Move your arms above your head.',
      'Walk to the window or another room.',
      'Return with a relaxed, upright posture.',
    ],
  },
]

const TEMPLATES_BY_ROLE: Record<UserRole, ReminderTemplate[]> = {
  remote_worker: REMOTE_WORKER_TEMPLATES,
  developer:     DEVELOPER_TEMPLATES,
  student:       STUDENT_TEMPLATES,
  researcher:    RESEARCHER_TEMPLATES,
  office_worker: OFFICE_WORKER_TEMPLATES,
  other:         OTHER_TEMPLATES,
}

const DEFAULT_TEMPLATES = OTHER_TEMPLATES

/**
 * Return the reminder template for a given cycle index.
 * Rotates through available templates, never repeating two consecutive ones
 * unless there is only one template available.
 */
export function getTemplateForCycle(
  role: UserRole | null | undefined,
  cycleIndex: number
): ReminderTemplate {
  const templates = role ? (TEMPLATES_BY_ROLE[role] ?? DEFAULT_TEMPLATES) : DEFAULT_TEMPLATES
  if (templates.length === 1) return templates[0]
  // Use modulo but skip if same as previous to avoid immediate repeat
  const idx = cycleIndex % templates.length
  return templates[idx]
}

export function getAllTemplatesForRole(role: UserRole | null | undefined): ReminderTemplate[] {
  return role ? (TEMPLATES_BY_ROLE[role] ?? DEFAULT_TEMPLATES) : DEFAULT_TEMPLATES
}
