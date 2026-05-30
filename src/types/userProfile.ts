export type UserRole =
  | 'remote_worker'
  | 'student'
  | 'researcher'
  | 'developer'
  | 'office_worker'
  | 'other'

export type ComputerHours =
  | 'less_than_2'
  | '2_to_4'
  | '4_to_6'
  | '6_to_8'
  | 'more_than_8'

export type RemoteWorkStatus = 'yes' | 'no' | 'sometimes'

export type PostureGoal =
  | 'neck_posture'
  | 'shoulder_alignment'
  | 'back_posture'
  | 'general_awareness'
  | 'reduce_sitting_time'

export type ReminderFrequency = '30' | '45' | '60' | '90' | 'custom'

export interface UserProfile {
  role: UserRole
  computerHours: ComputerHours
  remoteWork: RemoteWorkStatus
  mainGoal: PostureGoal
  reminderFrequency: ReminderFrequency
  customReminderMinutes?: number
}
