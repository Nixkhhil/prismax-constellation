import styles from './StarLines.module.css'

/**
 * Renders the orbital ellipse paths as SVG overlays.
 * Lives behind the stars in z-order.
 */
export default function StarLines({ contributors, size, isMobile }) {
  const cx = size / 2
  const cy = size / 2

  return (
    <svg
      className={styles.svg}
      width={size}
      height={size}
      viewBox={`0 0 ${size} ${size}`}
      aria-hidden="true"
    >
      <defs>
        <radialGradient id="orbitGrad" cx="50%" cy="50%" r="50%">
          <stop offset="0%"   stopColor="rgba(200,176,138,0.12)" />
          <stop offset="100%" stopColor="rgba(200,176,138,0)" />
        </radialGradient>

        {contributors.map(c => (
          <filter key={`glow-${c.id}`} id={`glow-${c.id}`} x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        ))}
      </defs>

      {/* Ambient center glow */}
      <circle cx={cx} cy={cy} r={isMobile ? 60 : 90} fill="url(#orbitGrad)" />

      {/* Orbital ellipses */}
      {contributors.map(c => {
        const scale = isMobile ? 0.55 : 1
        const rx = c.orbitRadius * scale
        const ry = rx * 0.42
        return (
          <ellipse
            key={c.id}
            cx={cx}
            cy={cy}
            rx={rx}
            ry={ry}
            fill="none"
            stroke="rgba(200,176,138,0.1)"
            strokeWidth="0.8"
            strokeDasharray="3 8"
          />
        )
      })}
    </svg>
  )
}
