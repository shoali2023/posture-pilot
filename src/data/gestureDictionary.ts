import type { GestureDefinition } from '../types/gesture'
import type { PostureCondition, PostureConditionId } from '../types/posture'

export const GESTURE_DICTIONARY: GestureDefinition[] = [
  {
    id: 'upright_posture',
    name: 'Upright posture',
    description: 'The user maintains head, shoulders and hips vertically aligned.',
    usedLandmarks: ['nose', 'left_shoulder', 'right_shoulder', 'left_hip', 'right_hip'],
    ruleSummary: [
      'shoulderTilt ≤ 0.06',
      'trunkAngle ≤ 15°',
      'neckOffset ≤ 0.10',
      'confidence ≥ 0.5',
    ],
    userInstruction:
      'Sit or stand in front of the camera with a straight back and relaxed shoulders.',
    feedback: 'Good posture. Keep your head, shoulders and hips aligned.',
    severity: 'good',
    heuristicPurpose: ['Visibility of System Status', 'Match Between System and Real World'],
  },
  {
    id: 'shoulder_imbalance',
    name: 'Uneven shoulders',
    description: 'One shoulder appears noticeably higher than the other.',
    usedLandmarks: ['left_shoulder', 'right_shoulder'],
    ruleSummary: ['shoulderTilt > 0.06'],
    userInstruction:
      'Face the camera and relax both shoulders. Make sure they are at the same level.',
    feedback: 'Try to relax your shoulders and keep them level.',
    severity: 'warning',
    heuristicPurpose: [
      'Error Prevention',
      'Help Users Recognize, Diagnose and Recover from Errors',
    ],
  },
  {
    id: 'trunk_lean',
    name: 'Trunk lean',
    description: 'The trunk is leaning too far from the vertical axis.',
    usedLandmarks: ['left_shoulder', 'right_shoulder', 'left_hip', 'right_hip'],
    ruleSummary: ['trunkAngle > 15°'],
    userInstruction:
      'Keep your trunk straight and align your shoulders with your hips. Support your back against the chair.',
    feedback: 'Try to straighten your trunk and keep your shoulders aligned with your hips.',
    severity: 'warning',
    heuristicPurpose: ['Visibility of System Status', 'Match Between System and Real World'],
  },
  {
    id: 'head_misalignment',
    name: 'Head misalignment',
    description: 'The head appears displaced from the central axis of the body.',
    usedLandmarks: ['nose', 'left_shoulder', 'right_shoulder'],
    ruleSummary: ['neckOffset > 0.10'],
    userInstruction:
      'Look straight ahead and centre your head over your shoulders. Avoid tilting your neck sideways.',
    feedback: 'Move your head towards the central line of your shoulders.',
    severity: 'warning',
    heuristicPurpose: ['Error Prevention', 'Recognition Rather than Recall'],
  },
  {
    id: 'low_visibility',
    name: 'Low body visibility',
    description:
      'The system cannot reliably detect your head, shoulders or hips.',
    usedLandmarks: ['nose', 'left_shoulder', 'right_shoulder', 'left_hip', 'right_hip'],
    ruleSummary: ['confidence < 0.5'],
    userInstruction:
      'Make sure your head, shoulders and hips are fully visible in the frame. Improve the lighting and move closer to the camera.',
    feedback:
      'Your body cannot be detected reliably. Reposition yourself in front of the camera with good lighting.',
    severity: 'bad',
    heuristicPurpose: [
      'Error Prevention',
      'Help Users Recognize, Diagnose and Recover from Errors',
    ],
  },
]

export function getCondition(id: PostureConditionId): PostureCondition {
  const def = GESTURE_DICTIONARY.find((g) => g.id === id)
  if (!def) throw new Error(`Unknown gesture ID: ${id}`)
  return {
    id,
    name: def.name,
    description: def.description,
    feedback: def.feedback,
    userInstruction: def.userInstruction,
  }
}
