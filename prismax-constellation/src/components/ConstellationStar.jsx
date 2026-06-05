import { useState } from 'react'
import { getRoleMeta, FOUNDER_IDS } from '../lib/starSystem'
import styles from './ConstellationStar.module.css'

const FounderBadge = () => (
  <span className={styles.founderBadge} aria-label="Founder" title="Founder">✦</span>
)

const VanguardBadge = () => (
  <span className={styles.vanguardBadge} aria-label="PrismaX Vanguard" title="PrismaX Vanguard">◈</span>
)

export default function ConstellationStar({ contributor, x, y, onClick, isMobile, isNew }) {
  const [hovered, setHovered] = useState(false)

  const isFounder   = contributor.isFounder  || FOUNDER_IDS.includes(contributor.id)
  const isVanguard  = contributor.isVanguard || contributor.role === 'prismax_vanguard'
  const brightness  = contributor.brightness ?? 0.7
  const roleMeta    = getRoleMeta(contributor.role)

  // Size: base + brightness modifier + founder boost
  const baseSize    = isMobile ? 48 : 64
  const sizeBoost   = isFounder ? 1.18 : (brightness > 0.8 ? 1.08 : 1)
  const size        = Math.round(baseSize * sizeBoost)

  // Glow color: founders → gold, vanguard → gold, others → role color
  const glowColor   = isFounder || isVanguard
    ? `rgba(255,215,0,${0.3 + brightness * 0.5})`
    : roleMeta.glow.replace(/[\d.]+\)$/, `${0.2 + brightness * 0.45})`)

  const borderColor = isFounder
    ? `rgba(255,215,0,${0.5 + brightness * 0.4})`
    : isVanguard
    ? 'rgba(255,215,0,0.7)'
    : `${roleMeta.color}${Math.round((0.3 + brightness * 0.5) * 255).toString(16).padStart(2,'0')}`

  const classNames = [
    styles.star,
    hovered   ? styles.hovered   : '',
    isFounder ? styles.founder   : '',
    isVanguard ? styles.vanguard : '',
    isNew     ? styles.arriving  : '',
  ].filter(Boolean).join(' ')

  return (
    <button
      className={classNames}
      style={{
        width:  size,
        height: size,
        transform: `translate(calc(-50% + ${x}px), calc(-50% + ${y}px))`,
        '--glow-color':   glowColor,
        '--border-color': borderColor,
        '--brightness':   brightness,
      }}
      onClick={() => onClick(contributor)}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      aria-label={`View ${contributor.name}`}
    >
      {/* Glow rings */}
      <span className={styles.ring1} aria-hidden="true" />
      <span className={styles.ring2} aria-hidden="true" />
      {isFounder && <span className={styles.founderRing} aria-hidden="true" />}

      {/* Profile image */}
      <img
        src={contributor.image}
        alt={contributor.name}
        className={styles.image}
        draggable={false}
      />

      {/* Badges */}
      {isFounder  && <FounderBadge  />}
      {isVanguard && !isFounder && <VanguardBadge />}

      {/* Name tooltip */}
      <span className={styles.label} aria-hidden="true">
        {contributor.name}
        <em>{getRoleMeta(contributor.role)?.label ?? contributor.role}</em>
      </span>
    </button>
  )
}
