export interface SessionRecord {
  id: string
  startedAt: string   // ISO date string
  endedAt: string     // ISO date string
  durationSeconds: number
  framesAnalyzed: number
  goodPercentage: number
  warningPercentage: number
  badPercentage: number
  mostFrequentCondition?: string
  conditionFrequency: Record<string, number>
  profileRole?: string
}
