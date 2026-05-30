import type { UserProfile } from '../../types/userProfile'
import type { SessionSummary } from '../../types/session'

export interface Recommendation {
  id: string
  title: string
  body: string
  priority: 'high' | 'medium' | 'low'
}

export function generateRecommendations(
  profile: UserProfile | null,
  conditionFrequency: Record<string, number>,
  sessionSummary: SessionSummary | null
): Recommendation[] {
  const recs: Recommendation[] = []

  // Role-based recommendations
  if (profile) {
    switch (profile.role) {
      case 'remote_worker':
        recs.push({
          id: 'role_remote',
          title: 'Standing breaks',
          body: 'You may benefit from brief standing breaks every 30–45 minutes. This can help with posture awareness and reduce prolonged sitting.',
          priority: 'high',
        })
        break
      case 'developer':
        recs.push({
          id: 'role_dev',
          title: 'Micro-breaks',
          body: 'Consider taking a 2-minute break away from the screen every 30 minutes. This can help reduce eye and shoulder strain over long coding sessions.',
          priority: 'high',
        })
        break
      case 'student':
        recs.push({
          id: 'role_student',
          title: 'Study breaks',
          body: 'Consider the 20-20-20 rule: every 20 minutes, look at something 20 feet away for 20 seconds. This can support posture and eye comfort.',
          priority: 'medium',
        })
        break
      case 'researcher':
        recs.push({
          id: 'role_researcher',
          title: 'Document positioning',
          body: 'Consider positioning reading materials close to your screen height. This can help reduce neck rotation during extended reading sessions.',
          priority: 'medium',
        })
        break
      case 'office_worker':
        recs.push({
          id: 'role_office',
          title: 'Desk ergonomics check',
          body: 'You may benefit from checking that your monitor is at eye level and your chair height supports your feet flat on the floor.',
          priority: 'medium',
        })
        break
      default:
        break
    }

    // Computer hours
    if (profile.computerHours === 'more_than_8') {
      recs.push({
        id: 'hours_high',
        title: 'Shorter reminders recommended',
        body: 'With more than 8 hours at a computer, consider setting reminders every 30 minutes. Frequent short breaks can support posture awareness throughout the day.',
        priority: 'high',
      })
    }

    // Goal-based
    switch (profile.mainGoal) {
      case 'neck_posture':
        recs.push({
          id: 'goal_neck',
          title: 'Screen height check',
          body: 'Consider checking that your screen is at eye level. Looking down at a screen for extended periods may contribute to neck discomfort.',
          priority: 'medium',
        })
        break
      case 'reduce_sitting_time':
        recs.push({
          id: 'goal_sitting',
          title: 'Sit-stand routine',
          body: 'You may benefit from a sit-stand routine. Consider standing for 5–10 minutes every hour to vary your working position.',
          priority: 'high',
        })
        break
      case 'shoulder_alignment':
        recs.push({
          id: 'goal_shoulders',
          title: 'Shoulder awareness',
          body: 'Consider relaxing your shoulders regularly. Tension often builds up unnoticed during focused work. Rolling your shoulders back gently can help.',
          priority: 'medium',
        })
        break
      default:
        break
    }
  }

  // Condition-frequency-based recommendations
  const totalConditionFrames = Object.values(conditionFrequency).reduce((s, n) => s + n, 0)
  const sortedConditions = Object.entries(conditionFrequency)
    .filter(([, count]) => count > 0)
    .sort(([, a], [, b]) => b - a)

  const topCondition = sortedConditions.length > 0 ? sortedConditions[0] : null
  if (topCondition && totalConditionFrames > 0) {
    const [topId, topCount] = topCondition
    const pct = (topCount / totalConditionFrames) * 100

    if (pct > 30) {
      switch (topId) {
        case 'head_misalignment':
          recs.push({
            id: 'cond_head',
            title: 'Screen height adjustment',
            body: 'Head misalignment was detected frequently in your session. Consider adjusting your screen so the top of the monitor is at or slightly below eye level.',
            priority: 'high',
          })
          break
        case 'shoulder_imbalance':
          recs.push({
            id: 'cond_shoulder',
            title: 'Shoulder relaxation',
            body: 'Uneven shoulders were detected frequently. Consider checking your seating position and whether one arm is resting higher than the other.',
            priority: 'high',
          })
          break
        case 'trunk_lean':
          recs.push({
            id: 'cond_trunk',
            title: 'Back support check',
            body: 'Trunk leaning was detected frequently. Consider using a lumbar support cushion or adjusting your chair to support a more upright position.',
            priority: 'high',
          })
          break
        case 'low_visibility':
          recs.push({
            id: 'cond_visibility',
            title: 'Camera positioning',
            body: 'The system had difficulty detecting your body in several frames. Consider positioning the camera at chest height and improving room lighting for better results.',
            priority: 'medium',
          })
          break
        default:
          break
      }
    }
  }

  // Session-based recommendations
  if (sessionSummary) {
    if (sessionSummary.badPct > 50) {
      recs.push({
        id: 'session_bad',
        title: 'Posture awareness opportunity',
        body: 'More than half of your session showed posture issues. This can be a useful moment to review your workstation setup. If you experience any discomfort, consider consulting a healthcare professional.',
        priority: 'high',
      })
    }
    if (sessionSummary.durationSeconds > 3600) {
      recs.push({
        id: 'session_long',
        title: 'Long session detected',
        body: 'This was a session of over one hour. Consider taking a longer break of 10–15 minutes before continuing. If you experience any discomfort, consult a healthcare professional.',
        priority: 'medium',
      })
    }
  }

  // No profile nudge
  if (!profile) {
    recs.push({
      id: 'no_profile',
      title: 'Personalise your experience',
      body: 'Set up your profile in the Home tab to receive role-based posture recommendations tailored to your work habits.',
      priority: 'low',
    })
  }

  // Deduplicate by id, limit to 5 to avoid overwhelming the UI
  const seen = new Set<string>()
  return recs.filter(r => {
    if (seen.has(r.id)) return false
    seen.add(r.id)
    return true
  }).slice(0, 5)
}
