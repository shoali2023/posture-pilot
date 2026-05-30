import logoDark    from '../assets/posturepilot-logo-horizontal-dark.svg'
import logoLight   from '../assets/posturepilot-logo-horizontal-light.svg'
import logoMark    from '../assets/posturepilot-logo-mark.svg'
import symbolBare  from '../assets/posturepilot-symbol-bare.svg'

export type LogoVariant = 'horizontal-dark' | 'horizontal-light' | 'mark' | 'symbol'

interface Props {
  variant?: LogoVariant
  /** CSS height value, e.g. "32px" or "2rem" */
  size?: string
  className?: string
  ariaLabel?: string
}

const SOURCES: Record<LogoVariant, string> = {
  'horizontal-dark':  logoDark,
  'horizontal-light': logoLight,
  'mark':             logoMark,
  'symbol':           symbolBare,
}

const DEFAULT_LABELS: Record<LogoVariant, string> = {
  'horizontal-dark':  'PosturePilot',
  'horizontal-light': 'PosturePilot',
  'mark':             'PosturePilot logo mark',
  'symbol':           'PosturePilot symbol',
}

export function BrandLogo({
  variant = 'horizontal-dark',
  size = '32px',
  className,
  ariaLabel,
}: Props) {
  const src    = SOURCES[variant]
  const label  = ariaLabel ?? DEFAULT_LABELS[variant]

  return (
    <img
      src={src}
      alt={label}
      aria-label={label}
      style={{ height: size, width: 'auto', display: 'block' }}
      className={className}
    />
  )
}
