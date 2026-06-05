import { useEffect, useRef, useState } from 'react'
import { getRoleMeta, FOUNDER_IDS } from '../lib/starSystem'
import styles from './JoinAnimation.module.css'

/**
 * Fullscreen overlay that shows a new star flying in from the edge
 * of the screen, arcing toward the center, then locking into orbit.
 *
 * After ~3.8s it calls onComplete() to clean up.
 */
export default function JoinAnimation({ contributor, onComplete }) {
  const [phase, setPhase] = useState('flying')   // 'flying' | 'locking' | 'locked'
  const timerRef = useRef(null)

  const isFounder  = contributor.isFounder || FOUNDER_IDS.includes(contributor.id)
  const isVanguard = contributor.isVanguard || contributor.role === 'prismax_vanguard'
  const roleMeta   = getRoleMeta(contributor.role)
  const glowColor  = isFounder || isVanguard ? 'rgba(255,215,0,0.7)' : roleMeta.glow

  useEffect(() => {
    // Phase timeline
    timerRef.current = setTimeout(() => setPhase('locking'), 1800)
    const t2 = setTimeout(() => setPhase('locked'), 2600)
    const t3 = setTimeout(() => onComplete(), 3900)
    return () => {
      clearTimeout(timerRef.current)
      clearTimeout(t2)
      clearTimeout(t3)
    }
  }, [onComplete])

  return (
    <div className={styles.overlay} aria-hidden="true">
      {/* Sweeping trail */}
      <div className={`${styles.trail} ${styles[phase]}`} style={{ '--glow': glowColor }} />

      {/* Star */}
      <div
        className={`${styles.star} ${styles[phase]}`}
        style={{ '--glow': glowColor }}
      >
        <img src={contributor.image} alt="" className={styles.img} />
        <span className={styles.ring} />
        <span className={styles.ring2} />
      </div>

      {/* Lock confirmation */}
      {phase === 'locked' && (
        <div className={styles.lockMsg}>
          <span className={styles.lockIcon}>✦</span>
          <span className={styles.lockName}>{contributor.name}</span>
          <span className={styles.lockSub}>has joined the constellation</span>
        </div>
      )}
    </div>
  )
}
