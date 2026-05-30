import { useEffect, useRef, useState } from 'react'
import type { PostureBaseline, BaselineDeviation } from '../types/calibration'
import type { PostureResult } from '../types/posture'
import {
  calculateDeviationFromBaseline,
  calculateCalibrationBaselineFromSamples,
  validateCalibrationQuality,
} from '../lib/calibration/calibrationLogic'

interface Props {
  baseline: PostureBaseline | null
  currentPosture: PostureResult | null
  onCalibrate: (baseline: PostureBaseline) => void
  onReset: () => void
  inline?: boolean
}

type CalibStep = 'idle' | 'counting' | 'preview'

const COUNTDOWN_SECONDS = 3
const SAMPLE_TARGET = 30       // frames to collect during countdown window

function fmt3(n: number) { return n.toFixed(3) }
function fmt1(n: number) { return n.toFixed(1) }

function deviationClass(value: number): string {
  if (value < 0.05) return 'deviation--ok'
  if (value < 0.12) return 'deviation--warn'
  return 'deviation--bad'
}

function DeviationRow({ label, value }: { label: string; value: number }) {
  return (
    <li className={`deviation-row ${deviationClass(value)}`}>
      <span className="deviation-row__label">{label}</span>
      <span className="deviation-row__value">{fmt3(value)}</span>
    </li>
  )
}

export function CalibrationPanel({
  baseline,
  currentPosture,
  onCalibrate,
  onReset,
  inline = false,
}: Props) {
  const [step, setStep]           = useState<CalibStep>('idle')
  const [countdown, setCountdown] = useState(COUNTDOWN_SECONDS)
  const [preview, setPreview]     = useState<PostureBaseline | null>(null)
  const [qualityMsg, setQualityMsg] = useState<string | null>(null)

  const samplesRef = useRef<PostureResult[]>([])

  // Collect frames from currentPosture while counting
  useEffect(() => {
    if (step !== 'counting' || !currentPosture) return
    if (samplesRef.current.length < SAMPLE_TARGET) {
      samplesRef.current = [...samplesRef.current, currentPosture]
    }
  })

  // Drive countdown
  useEffect(() => {
    if (step !== 'counting') return
    if (countdown <= 0) {
      // Enough time elapsed — evaluate samples
      const quality = validateCalibrationQuality(samplesRef.current)
      if (!quality.valid) {
        setQualityMsg(quality.message ?? 'Try again with better visibility.')
        setStep('idle')
        setCountdown(COUNTDOWN_SECONDS)
        samplesRef.current = []
        return
      }
      const computed = calculateCalibrationBaselineFromSamples(samplesRef.current)
      setPreview(computed)
      setQualityMsg(null)
      setStep('preview')
      return
    }
    const t = setTimeout(() => setCountdown(c => c - 1), 1000)
    return () => clearTimeout(t)
  }, [step, countdown])

  function startCalibration() {
    samplesRef.current = []
    setQualityMsg(null)
    setPreview(null)
    setCountdown(COUNTDOWN_SECONDS)
    setStep('counting')
  }

  function acceptCalibration() {
    if (!preview) return
    onCalibrate(preview)
    setPreview(null)
    setStep('idle')
  }

  function tryAgain() {
    setPreview(null)
    setStep('idle')
    setCountdown(COUNTDOWN_SECONDS)
  }

  function handleReset() {
    setStep('idle')
    setPreview(null)
    setQualityMsg(null)
    setCountdown(COUNTDOWN_SECONDS)
    samplesRef.current = []
    onReset()
  }

  const canStart = currentPosture !== null && currentPosture.status !== 'bad'

  const deviation: BaselineDeviation | null =
    baseline && currentPosture && step === 'idle'
      ? calculateDeviationFromBaseline(currentPosture, baseline)
      : null

  return (
    <div className={`calibration-panel${inline ? ' calibration-panel--inline' : ''}`}>
      {!inline && <h3 className="calibration-panel__title">Posture Calibration</h3>}

      {/* ── Status badge ─────────────────────── */}
      <div className="calibration-panel__status">
        {baseline && step === 'idle' ? (
          <span className="calibration-panel__status-badge calibration-panel__status-badge--active">
            Calibrated — {new Date(baseline.createdAt).toLocaleTimeString()}
          </span>
        ) : step === 'idle' ? (
          <span className="calibration-panel__status-badge calibration-panel__status-badge--none">
            Not calibrated
          </span>
        ) : null}
      </div>

      {/* ── Step: idle ───────────────────────── */}
      {step === 'idle' && (
        <>
          <p className="calibration-panel__description">
            Sit comfortably upright with your head, shoulders, and hips visible, then start calibration.
          </p>

          {qualityMsg && (
            <p className="calibration-panel__quality-msg">{qualityMsg}</p>
          )}

          {baseline && (
            <div className="calibration-panel__values">
              <ul className="calibration-panel__value-list">
                <li>Shoulder tilt: {fmt3(baseline.shoulderTilt)}</li>
                <li>Trunk angle: {fmt1(baseline.trunkAngle)}°</li>
                <li>Neck offset: {fmt3(baseline.neckOffset)}</li>
              </ul>
            </div>
          )}

          {deviation && (
            <div className="calibration-panel__deviation">
              <span className="calibration-panel__value-label">Live deviation from baseline:</span>
              <ul className="deviation-list">
                <DeviationRow label="Shoulders" value={deviation.shoulderTiltDeviation} />
                <DeviationRow label="Trunk"     value={deviation.trunkAngleDeviation} />
                <DeviationRow label="Neck"      value={deviation.neckOffsetDeviation} />
              </ul>
              <p className="calibration-panel__deviation-legend">
                <span className="deviation--ok">■</span> good &nbsp;
                <span className="deviation--warn">■</span> slight &nbsp;
                <span className="deviation--bad">■</span> notable
              </p>
            </div>
          )}

          <div className="calibration-panel__actions">
            <button
              className="btn btn--primary"
              onClick={startCalibration}
              disabled={!canStart}
              type="button"
              title={!canStart ? 'Start a live session first and adopt a comfortable posture' : undefined}
            >
              {baseline ? 'Recalibrate' : 'Start calibration'}
            </button>
            {baseline && (
              <button className="btn btn--secondary" onClick={handleReset} type="button">
                Reset calibration
              </button>
            )}
          </div>

          {!canStart && (
            <p className="calibration-panel__hint">
              Start a live session first, then adopt a comfortable upright posture.
            </p>
          )}
        </>
      )}

      {/* ── Step: counting ───────────────────── */}
      {step === 'counting' && (
        <div className="calibration-panel__counting">
          <p className="calibration-panel__counting-label">Hold still…</p>
          <span className="calibration-panel__countdown" aria-live="polite">
            {countdown > 0 ? countdown : '…'}
          </span>
          <p className="calibration-panel__counting-hint">
            Keep your head, shoulders, and hips visible.
          </p>
          <button
            className="btn btn--secondary"
            onClick={() => { setStep('idle'); setCountdown(COUNTDOWN_SECONDS); samplesRef.current = [] }}
            type="button"
          >
            Cancel
          </button>
        </div>
      )}

      {/* ── Step: preview ────────────────────── */}
      {step === 'preview' && preview && (
        <div className="calibration-panel__preview">
          <p className="calibration-panel__preview-label">Calibration preview</p>
          <ul className="calibration-panel__value-list">
            <li>Shoulder tilt: {fmt3(preview.shoulderTilt)}</li>
            <li>Trunk angle: {fmt1(preview.trunkAngle)}°</li>
            <li>Neck offset: {fmt3(preview.neckOffset)}</li>
          </ul>
          <p className="calibration-panel__preview-hint">
            Does this look like your comfortable upright posture?
          </p>
          <div className="calibration-panel__actions">
            <button className="btn btn--primary" onClick={acceptCalibration} type="button">
              Accept calibration
            </button>
            <button className="btn btn--secondary" onClick={tryAgain} type="button">
              Try again
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
