import { useEffect, useRef, useState, useCallback } from 'react'
import type { PoseLandmarker } from '@mediapipe/tasks-vision'
import { createPoseLandmarker } from '../lib/pose/createPoseLandmarker'
import { drawSkeleton } from '../lib/pose/drawSkeleton'
import { analyzePosture } from '../lib/pose/postureMath'
import { computeSessionSummary } from '../lib/session/computeSessionSummary'
import { LandmarkSmoother, ScalarSmoother } from '../lib/pose/smoothing'
import { PostureStatusStabilizer } from '../lib/pose/statusStabilizer'
import { PostureReport } from './PostureReport'
import { SessionPanel } from './SessionPanel'
import { SessionSummary } from './SessionSummary'
import type { PostureResult, NormalizedLandmark } from '../types/posture'
import type { SessionStats, SessionSummary as SessionSummaryType, SessionCheckpoint } from '../types/session'
import type { PostureBaseline } from '../types/calibration'
import { PostureOverlay } from './PostureOverlay'

// ── Smoother alpha presets ────────────────────────────────────
export type SmoothingLevel = 'low' | 'balanced' | 'high'

const ALPHA: Record<SmoothingLevel, number> = {
  low:      0.55,  // fast, more jitter
  balanced: 0.35,  // default
  high:     0.20,  // smooth, slightly delayed
}

type CameraState = 'initializing' | 'ready' | 'requesting-camera' | 'running' | 'paused' | 'stopped' | 'error'

const EMPTY_STATS: SessionStats = {
  elapsedSeconds: 0,
  frameCount: 0,
  statusCounts: { good: 0, warning: 0, bad: 0 },
}

interface Props {
  onSessionEnd?: (summary: SessionSummaryType, conditionFrequency: Record<string, number>) => void
  onSessionStart?: () => void
  onSessionPause?: (checkpoint: SessionCheckpoint) => void
  onPostureUpdate?: (result: PostureResult | null) => void
  calibrationBaseline?: PostureBaseline | null
  /** Restored checkpoint from a previous paused session */
  sessionCheckpoint?: SessionCheckpoint | null
  smoothingLevel?: SmoothingLevel
  /** When false the camera is paused automatically (e.g. user switched tabs) */
  isActive?: boolean
}

export function PoseCamera({
  onSessionEnd,
  onSessionStart,
  onSessionPause,
  onPostureUpdate,
  sessionCheckpoint,
  smoothingLevel = 'balanced',
  isActive = true,
}: Props) {
  const videoRef    = useRef<HTMLVideoElement>(null)
  const canvasRef   = useRef<HTMLCanvasElement>(null)
  const landmarkerRef = useRef<PoseLandmarker | null>(null)
  const rafRef      = useRef<number>(0)
  const streamRef   = useRef<MediaStream | null>(null)

  // ── Session tracking refs ─────────────────────────────────
  const sessionStartTimeRef   = useRef<number>(0)
  const priorElapsedRef       = useRef<number>(0)     // seconds carried from a resumed checkpoint
  const frameCountRef         = useRef<number>(0)
  const statusCountsRef       = useRef({ good: 0, warning: 0, bad: 0 })
  const conditionFrequencyRef = useRef<Record<string, number>>({})
  const sessionStartedAtRef   = useRef<string>('')

  // ── Smoothers (persist across re-renders via refs) ────────
  const landmarkSmootherRef = useRef<LandmarkSmoother>(new LandmarkSmoother({ alpha: ALPHA[smoothingLevel] }))
  // Display-only smoothers use lower alpha (0.15) for calmer numbers in the UI
  const shoulderTiltSmootherRef = useRef(new ScalarSmoother(0.15))
  const trunkAngleSmootherRef   = useRef(new ScalarSmoother(0.15))
  const neckOffsetSmootherRef   = useRef(new ScalarSmoother(0.15))
  const confidenceSmootherRef   = useRef(new ScalarSmoother(0.2))
  const statusStabilizerRef     = useRef(new PostureStatusStabilizer())

  // Throttle React state updates to ~8 fps so displayed numbers are visually calm
  const lastUiUpdateRef = useRef(0)
  const UI_UPDATE_INTERVAL_MS = 125 // ~8 fps

  const [cameraState, setCameraState] = useState<CameraState>('initializing')
  // Ref mirror so effects that must not re-run on cameraState change can still read it
  const cameraStateRef = useRef<CameraState>('initializing')
  useEffect(() => { cameraStateRef.current = cameraState }, [cameraState])

  const [errorMessage, setErrorMessage] = useState<string>('')
  const [postureResult, setPostureResult] = useState<PostureResult | null>(null)
  const [sessionDisplay, setSessionDisplay] = useState<SessionStats>(EMPTY_STATS)
  const [sessionSummary, setSessionSummary] = useState<SessionSummaryType | null>(null)
  const [hasResumableSession, setHasResumableSession] = useState(!!sessionCheckpoint)

  // Restore checkpoint counts when provided
  useEffect(() => {
    if (sessionCheckpoint) {
      frameCountRef.current         = sessionCheckpoint.frameCount
      statusCountsRef.current       = { ...sessionCheckpoint.statusCounts }
      conditionFrequencyRef.current = { ...sessionCheckpoint.conditionFrequency }
      priorElapsedRef.current       = sessionCheckpoint.elapsedSeconds
      sessionStartedAtRef.current   = sessionCheckpoint.startedAt
      setHasResumableSession(true)
    }
  }, []) // intentionally empty — only on mount

  // Rebuild smoother when smoothingLevel changes
  useEffect(() => {
    landmarkSmootherRef.current = new LandmarkSmoother({ alpha: ALPHA[smoothingLevel] })
  }, [smoothingLevel])

  // Auto-pause camera when the tab becomes inactive (e.g. user switched tabs)
  useEffect(() => {
    if (!isActive && cameraStateRef.current === 'running') {
      pauseCamera()
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isActive])

  // ── Frame processor ───────────────────────────────────────
  const processFrame = useCallback(() => {
    const video    = videoRef.current
    const canvas   = canvasRef.current
    const landmarker = landmarkerRef.current

    if (!video || !canvas || !landmarker || video.readyState < 2) {
      rafRef.current = requestAnimationFrame(processFrame)
      return
    }

    const ctx = canvas.getContext('2d')
    if (!ctx) { rafRef.current = requestAnimationFrame(processFrame); return }

    if (canvas.width !== video.videoWidth || canvas.height !== video.videoHeight) {
      canvas.width  = video.videoWidth
      canvas.height = video.videoHeight
    }

    ctx.drawImage(video, 0, 0, canvas.width, canvas.height)
    const result = landmarker.detectForVideo(video, performance.now())

    if (result.landmarks && result.landmarks.length > 0) {
      const rawLandmarks = result.landmarks[0] as NormalizedLandmark[]

      // 1. Smooth landmarks
      const smoothedLandmarks = landmarkSmootherRef.current.smooth(rawLandmarks) ?? rawLandmarks

      // 2. Analyse with smoothed landmarks
      const rawPosture = analyzePosture(smoothedLandmarks)

      // 3. Smooth individual metrics
      const stablePosture: PostureResult = {
        ...rawPosture,
        shoulderTilt: shoulderTiltSmootherRef.current.smooth(rawPosture.shoulderTilt),
        trunkAngle:   trunkAngleSmootherRef.current.smooth(rawPosture.trunkAngle),
        neckOffset:   neckOffsetSmootherRef.current.smooth(rawPosture.neckOffset),
        confidence:   confidenceSmootherRef.current.smooth(rawPosture.confidence),
      }

      // 4. Stabilise status (hysteresis)
      const displayPosture = statusStabilizerRef.current.update(stablePosture)

      // 5. Draw skeleton with smoothed landmarks + stable status + confidence for opacity
      drawSkeleton(ctx, smoothedLandmarks, displayPosture.status, canvas.width, canvas.height, displayPosture.confidence)

      // Throttle React state updates to ~8 fps — skeleton canvas still draws every frame
      const now = performance.now()
      if (now - lastUiUpdateRef.current >= UI_UPDATE_INTERVAL_MS) {
        lastUiUpdateRef.current = now
        setPostureResult(displayPosture)
        onPostureUpdate?.(displayPosture)
      }

      frameCountRef.current += 1
      statusCountsRef.current[displayPosture.status] += 1
      displayPosture.activeConditions.forEach(c => {
        conditionFrequencyRef.current[c.id] = (conditionFrequencyRef.current[c.id] ?? 0) + 1
      })
    } else {
      landmarkSmootherRef.current.smooth(null) // track missing frames
      setPostureResult(null)
      onPostureUpdate?.(null)
    }

    rafRef.current = requestAnimationFrame(processFrame)
  }, [onPostureUpdate])

  // ── Load model ────────────────────────────────────────────
  useEffect(() => {
    let cancelled = false
    createPoseLandmarker()
      .then(lm => {
        if (cancelled) { lm.close(); return }
        landmarkerRef.current = lm
        setCameraState(hasResumableSession ? 'paused' : 'ready')
      })
      .catch(() => {
        if (cancelled) return
        setCameraState('error')
        setErrorMessage('Failed to load the pose model. Check your internet connection and reload.')
      })
    return () => { cancelled = true }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  // ── Push stats to display every 500 ms ───────────────────
  useEffect(() => {
    if (cameraState !== 'running') return
    const iv = setInterval(() => {
      const elapsed = priorElapsedRef.current +
        (sessionStartTimeRef.current > 0
          ? Math.floor((performance.now() - sessionStartTimeRef.current) / 1000)
          : 0)
      setSessionDisplay({
        elapsedSeconds: elapsed,
        frameCount: frameCountRef.current,
        statusCounts: { ...statusCountsRef.current },
      })
    }, 500)
    return () => clearInterval(iv)
  }, [cameraState])

  // ── Cleanup on unmount — save checkpoint if mid-session ──
  useEffect(() => {
    return () => {
      cancelAnimationFrame(rafRef.current)
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(t => t.stop())
        streamRef.current = null
      }
      landmarkerRef.current?.close()
    }
  }, [])

  // ── Helpers ───────────────────────────────────────────────
  function resetAllSmoothers() {
    landmarkSmootherRef.current.reset()
    shoulderTiltSmootherRef.current.reset()
    trunkAngleSmootherRef.current.reset()
    neckOffsetSmootherRef.current.reset()
    confidenceSmootherRef.current.reset()
    statusStabilizerRef.current.reset()
  }

  function resetSessionData() {
    frameCountRef.current         = 0
    priorElapsedRef.current       = 0
    sessionStartTimeRef.current   = 0
    statusCountsRef.current       = { good: 0, warning: 0, bad: 0 }
    conditionFrequencyRef.current = {}
    sessionStartedAtRef.current   = ''
    resetAllSmoothers()
  }

  function buildCheckpoint(): SessionCheckpoint {
    const elapsed = priorElapsedRef.current +
      (sessionStartTimeRef.current > 0
        ? Math.floor((performance.now() - sessionStartTimeRef.current) / 1000)
        : 0)
    return {
      frameCount:         frameCountRef.current,
      statusCounts:       { ...statusCountsRef.current },
      conditionFrequency: { ...conditionFrequencyRef.current },
      elapsedSeconds:     elapsed,
      startedAt:          sessionStartedAtRef.current || new Date().toISOString(),
    }
  }

  // ── Actions ───────────────────────────────────────────────
  async function startCamera(resuming = false) {
    try {
      setCameraState('requesting-camera')
      if (!resuming) {
        resetSessionData()
        setSessionDisplay(EMPTY_STATS)
        setSessionSummary(null)
        setHasResumableSession(false)
      }
      setPostureResult(null)

      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: { ideal: 1280 }, height: { ideal: 720 }, facingMode: 'user' },
        audio: false,
      })
      streamRef.current = stream
      const video = videoRef.current!
      video.srcObject = stream
      await video.play()

      sessionStartTimeRef.current = performance.now()
      if (!resuming) {
        sessionStartedAtRef.current = new Date().toISOString()
        onSessionStart?.()
      }
      resetAllSmoothers()
      setCameraState('running')
      rafRef.current = requestAnimationFrame(processFrame)
    } catch (err) {
      setCameraState('error')
      if (err instanceof DOMException) {
        if (err.name === 'NotAllowedError')
          setErrorMessage('Camera permission denied. Please allow camera access and reload the page.')
        else if (err.name === 'NotFoundError')
          setErrorMessage('No camera found. Please connect a webcam and reload the page.')
        else
          setErrorMessage(`Camera error: ${err.message}`)
      } else if (err instanceof Error) {
        setErrorMessage(`Initialization error: ${err.message}`)
      } else {
        setErrorMessage('An unknown error occurred.')
      }
    }
  }

  function pauseCamera() {
    cancelAnimationFrame(rafRef.current)
    streamRef.current?.getTracks().forEach(t => t.stop())
    streamRef.current = null

    const checkpoint = buildCheckpoint()
    priorElapsedRef.current = checkpoint.elapsedSeconds
    sessionStartTimeRef.current = 0

    setPostureResult(null)
    setCameraState('paused')
    setHasResumableSession(true)
    onSessionPause?.(checkpoint)
  }

  function stopCamera() {
    cancelAnimationFrame(rafRef.current)
    streamRef.current?.getTracks().forEach(t => t.stop())
    streamRef.current = null

    const totalElapsed = priorElapsedRef.current +
      (sessionStartTimeRef.current > 0
        ? Math.floor((performance.now() - sessionStartTimeRef.current) / 1000)
        : 0)

    const summary = computeSessionSummary(totalElapsed, frameCountRef.current, {
      ...statusCountsRef.current,
    })
    const frequency = { ...conditionFrequencyRef.current }

    setSessionSummary(summary)
    setPostureResult(null)
    setCameraState('stopped')

    onSessionEnd?.(summary, frequency)
  }

  function handleReset() {
    cancelAnimationFrame(rafRef.current)
    streamRef.current?.getTracks().forEach(t => t.stop())
    streamRef.current = null

    resetSessionData()
    setSessionDisplay(EMPTY_STATS)
    setSessionSummary(null)
    setPostureResult(null)
    setHasResumableSession(false)
    setCameraState('ready')
  }

  const isLoading = cameraState === 'initializing' || cameraState === 'requesting-camera'
  const isPaused  = cameraState === 'paused'

  return (
    <div className="pose-camera">
      {/* Controls */}
      <div className="pose-camera__controls">
        <div className="pose-camera__controls-primary">
          {(cameraState === 'ready') && (
            <button className="btn btn--primary" onClick={() => { void startCamera(false) }}>
              Start session
            </button>
          )}
          {isPaused && (
            <>
              <button className="btn btn--primary" onClick={() => { void startCamera(true) }}>
                Resume session
              </button>
              <button className="btn btn--secondary" onClick={stopCamera}>
                End session
              </button>
            </>
          )}
          {cameraState === 'running' && (
            <button className="btn btn--danger" onClick={stopCamera}>
              Stop session
            </button>
          )}
          {cameraState === 'stopped' && (
            <button className="btn btn--primary" onClick={() => { void startCamera(false) }}>
              Start new session
            </button>
          )}
          {cameraState === 'initializing' && (
            <button className="btn btn--primary" disabled>Loading model…</button>
          )}
          {cameraState === 'requesting-camera' && (
            <button className="btn btn--primary" disabled>Requesting camera…</button>
          )}
          {cameraState === 'error' && (
            <button className="btn btn--secondary" onClick={() => setCameraState('ready')}>
              Try again
            </button>
          )}
        </div>

        {(cameraState === 'running' || isPaused) && (
          <button className="btn btn--secondary" onClick={handleReset}>
            Reset session
          </button>
        )}

        {cameraState === 'running' && (
          <span className="session-live-indicator">
            <span className="session-live-dot" />
            Live
          </span>
        )}
      </div>

      {/* Viewport */}
      <div className="pose-camera__viewport" style={{ position: 'relative' }}>
        {isLoading && (
          <div className="pose-camera__overlay">
            <div className="spinner" />
            <p className="pose-camera__status">
              {cameraState === 'initializing'     && 'Loading pose model…'}
              {cameraState === 'requesting-camera' && 'Requesting camera access…'}
            </p>
          </div>
        )}

        {cameraState === 'error' && (
          <div className="pose-camera__overlay pose-camera__overlay--error">
            <p className="pose-camera__error">{errorMessage}</p>
          </div>
        )}

        {cameraState === 'ready' && (
          <div className="pose-camera__overlay pose-camera__overlay--ready">
            <p className="pose-camera__ready-msg">
              Press <strong>Start session</strong> to begin
            </p>
          </div>
        )}

        {isPaused && (
          <div className="pose-camera__overlay pose-camera__overlay--paused">
            <p className="pose-camera__paused-msg">Session paused — your progress is saved.</p>
            <p className="pose-camera__paused-sub">Camera paused for privacy. Resume when ready.</p>
          </div>
        )}

        {cameraState === 'stopped' && (
          <div className="pose-camera__overlay pose-camera__overlay--ready">
            <p className="pose-camera__ready-msg">Session complete.</p>
          </div>
        )}

        <video ref={videoRef} playsInline muted style={{ display: 'none' }} />
        <canvas ref={canvasRef} className="pose-camera__canvas" />
        {cameraState === 'running' && (
          <PostureOverlay
            status={postureResult?.status ?? null}
            lowVisibility={postureResult?.activeConditions.some(c => c.id === 'low_visibility') ?? false}
          />
        )}
      </div>

      {cameraState === 'running' && <SessionPanel stats={sessionDisplay} />}
      {isPaused && frameCountRef.current > 0 && (
        <SessionPanel stats={{
          elapsedSeconds: priorElapsedRef.current,
          frameCount: frameCountRef.current,
          statusCounts: { ...statusCountsRef.current },
        }} />
      )}
      {cameraState === 'running' && <PostureReport result={postureResult} />}
      {cameraState === 'stopped' && sessionSummary && (
        <SessionSummary summary={sessionSummary} />
      )}
    </div>
  )
}
