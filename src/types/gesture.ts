export type GestureSeverity = 'good' | 'warning' | 'bad'

export interface GestureDefinition {
  id: string
  name: string
  description: string
  usedLandmarks: string[]
  ruleSummary: string[]
  userInstruction: string
  feedback: string
  severity: GestureSeverity
  heuristicPurpose: string[]
}
