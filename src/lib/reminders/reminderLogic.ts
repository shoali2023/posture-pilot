import type { UserProfile } from '../../types/userProfile'
import { getTemplateForCycle } from '../../data/reminderTemplates'

export interface ChecklistItem {
  id: string
  text: string
  done: boolean
}

const DEFAULT_REMINDER_MINUTES = 45

export const SESSION_REMINDER_LIMIT = 8

export function getReminderInterval(profile: UserProfile | null): number {
  if (!profile) return DEFAULT_REMINDER_MINUTES
  if (profile.reminderFrequency === 'custom') {
    return profile.customReminderMinutes ?? DEFAULT_REMINDER_MINUTES
  }
  return parseInt(profile.reminderFrequency, 10)
}

/** Returns checklist items for the given cycle index, rotating templates. */
export function getChecklistForProfile(
  profile: UserProfile | null,
  cycleIndex = 0
): ChecklistItem[] {
  const template = getTemplateForCycle(profile?.role, cycleIndex)
  return template.items.map((text, i) => ({
    id: `item_${cycleIndex}_${i}`,
    text,
    done: false,
  }))
}

/** Returns the title of the current reminder template cycle. */
export function getReminderTitle(
  profile: UserProfile | null,
  cycleIndex = 0
): string {
  return getTemplateForCycle(profile?.role, cycleIndex).title
}

export function calculateChecklistProgress(items: ChecklistItem[]): { done: number; total: number } {
  return {
    done: items.filter(i => i.done).length,
    total: items.length,
  }
}

export function resetChecklist(items: ChecklistItem[]): ChecklistItem[] {
  return items.map(item => ({ ...item, done: false }))
}

export function hasReachedFatigueLimit(reminderCount: number): boolean {
  return reminderCount >= SESSION_REMINDER_LIMIT
}
