import type { ComputerHours, PostureGoal, RemoteWorkStatus, ReminderFrequency, UserRole } from '../types/userProfile'

export interface ProfilePreset {
  role: UserRole
  label: string
  description: string
  focusAreas: string[]
  defaultReminderMinutes: number
  suggestedChecklist: string[]
  postureTips: string[]
}

export const PROFILE_PRESETS: Record<UserRole, ProfilePreset> = {
  remote_worker: {
    role: 'remote_worker',
    label: 'Remote Worker',
    description: 'Working from home or a remote location',
    focusAreas: ['neck alignment', 'shoulder relaxation', 'reduce prolonged sitting', 'screen ergonomics'],
    defaultReminderMinutes: 45,
    suggestedChecklist: [
      'Check that your head is aligned with your shoulders.',
      'Relax your shoulders — drop them away from your ears.',
      'Stand up and stretch for one minute.',
      'Look away from the screen for 20 seconds (20-20-20 rule).',
    ],
    postureTips: [
      'Set your screen at eye level to reduce neck strain.',
      'Use a chair with lumbar support.',
      'Take a short walk between video calls.',
    ],
  },
  student: {
    role: 'student',
    label: 'Student',
    description: 'Studying with long hours at a desk or computer',
    focusAreas: ['study break awareness', 'screen distance', 'back support', 'neck position'],
    defaultReminderMinutes: 45,
    suggestedChecklist: [
      'Sit with your back straight against the chair.',
      'Keep the screen at 50–70 cm from your eyes.',
      'Take a 5-minute break and move around.',
      'Relax your jaw and shoulders.',
    ],
    postureTips: [
      'Try the Pomodoro technique: 25 min work, 5 min break.',
      'Keep study materials at eye level where possible.',
      'Avoid studying in bed for long sessions.',
    ],
  },
  researcher: {
    role: 'researcher',
    label: 'Researcher',
    description: 'Long reading, writing and analysis sessions',
    focusAreas: ['neck alignment', 'reading posture', 'document positioning', 'wrist position'],
    defaultReminderMinutes: 60,
    suggestedChecklist: [
      'Check your neck is not bent forward while reading.',
      'Position documents close to screen height.',
      'Straighten your back and relax your shoulders.',
      'Rest your eyes — look at a distant object for 20 seconds.',
    ],
    postureTips: [
      'Use a document holder to avoid neck rotation.',
      'Alternate between sitting and standing if possible.',
      'Keep frequently used items within easy reach.',
    ],
  },
  developer: {
    role: 'developer',
    label: 'Developer / Programmer',
    description: 'Extended coding and screen time sessions',
    focusAreas: ['micro-breaks', 'shoulder relaxation', 'screen height', 'wrist and arm position'],
    defaultReminderMinutes: 30,
    suggestedChecklist: [
      'Take a micro-break — step away from the screen for 2 minutes.',
      'Roll your shoulders back and relax them.',
      'Check that your screen is at eye level.',
      'Stretch your fingers and wrists.',
    ],
    postureTips: [
      'Consider a standing desk or adjustable workstation.',
      'Use keyboard shortcuts to reduce mouse movement.',
      'Set an automatic screen dimmer for evening work.',
    ],
  },
  office_worker: {
    role: 'office_worker',
    label: 'Office Worker',
    description: 'Standard office environment with desk work',
    focusAreas: ['desk ergonomics', 'posture awareness', 'break frequency', 'eye strain'],
    defaultReminderMinutes: 45,
    suggestedChecklist: [
      'Adjust your chair so your feet are flat on the floor.',
      'Keep your screen at arm\'s length.',
      'Relax your shoulders and avoid hunching.',
      'Stand up and walk for one minute.',
    ],
    postureTips: [
      'Position your monitor directly in front of you.',
      'Use a headset for long calls to avoid neck strain.',
      'Organise your desk to minimise awkward reaching.',
    ],
  },
  other: {
    role: 'other',
    label: 'Other / Custom',
    description: 'General posture awareness',
    focusAreas: ['general alignment', 'break frequency', 'neck and shoulder health'],
    defaultReminderMinutes: 45,
    suggestedChecklist: [
      'Check your head is aligned over your shoulders.',
      'Relax your shoulders and arms.',
      'Take a short break and move.',
      'Look away from the screen.',
    ],
    postureTips: [
      'Regular short breaks are better than infrequent long ones.',
      'Good posture is about movement variety, not just sitting up straight.',
      'If you experience discomfort, consider consulting a healthcare professional.',
    ],
  },
}

export const ROLE_LABELS: Record<UserRole, string> = {
  remote_worker: 'Remote Worker',
  student: 'Student',
  researcher: 'Researcher',
  developer: 'Developer / Programmer',
  office_worker: 'Office Worker',
  other: 'Other / Custom',
}

export const HOURS_LABELS: Record<ComputerHours, string> = {
  less_than_2: 'Less than 2 h/day',
  '2_to_4': '2–4 h/day',
  '4_to_6': '4–6 h/day',
  '6_to_8': '6–8 h/day',
  more_than_8: 'More than 8 h/day',
}

export const GOAL_LABELS: Record<PostureGoal, string> = {
  neck_posture: 'Neck posture',
  shoulder_alignment: 'Shoulder alignment',
  back_posture: 'Back posture',
  general_awareness: 'General awareness',
  reduce_sitting_time: 'Reduce sitting time',
}

export const REMOTE_LABELS: Record<RemoteWorkStatus, string> = {
  yes: 'Yes, fully remote',
  no: 'Office-based',
  sometimes: 'Hybrid / sometimes remote',
}

export const REMINDER_LABELS: Record<ReminderFrequency, string> = {
  '30': 'Every 30 minutes',
  '45': 'Every 45 minutes',
  '60': 'Every hour',
  '90': 'Every 90 minutes',
  custom: 'Custom interval',
}
