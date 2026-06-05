import { useEffect, useRef } from 'react'
import { getRoleMeta, ROLE_LABELS, FOUNDER_IDS } from '../lib/starSystem'
import styles from './ContributorModal.module.css'

const XIcon = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.746l7.73-8.835L1.254 2.25H8.08l4.253 5.622L18.244 2.25zm-1.161 17.52h1.833L7.084 4.126H5.117L17.083 19.77z" />
  </svg>
)

const CloseIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
    <line x1="18" y1="6" x2="6" y2="18" />
    <line x1="6" y1="6" x2="18" y2="18" />
  </svg>
)

export default function ContributorModal({ contributor, onClose }) {
  const overlayRef = useRef(null)
  const dialogRef  = useRef(null)

  const isFounder  = contributor.isFounder  || FOUNDER_IDS.includes(contributor.id)
  const isVanguard = contributor.isVanguard || contributor.role === 'prismax_vanguard'
  const roleMeta   = getRoleMeta(contributor.role)
  const roleLabel  = ROLE_LABELS[contributor.role] ?? contributor.role

  const brightness = contributor.brightness ?? 0.7
  const glowColor  = isFounder || isVanguard
    ? `rgba(255,215,0,${0.2 + brightness * 0.4})`
    : roleMeta.glow.replace(/[\d.]+\)$/, `${0.18 + brightness * 0.35})`)

  useEffect(() => {
    function onKey(e) { if (e.key === 'Escape') onClose() }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [onClose])

  useEffect(() => {
    document.body.style.overflow = 'hidden'
    return () => { document.body.style.overflow = '' }
  }, [])

  useEffect(() => { dialogRef.current?.focus() }, [])

  function handleOverlayClick(e) {
    if (e.target === overlayRef.current) onClose()
  }

  const joinDate = contributor.join_date
    ? new Date(contributor.join_date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
    : null

  return (
    <div
      ref={overlayRef}
      className={styles.overlay}
      onClick={handleOverlayClick}
      role="dialog"
      aria-modal="true"
      aria-label={`Profile of ${contributor.name}`}
    >
      <div
        ref={dialogRef}
        className={`${styles.modal} ${isFounder ? styles.founderModal : ''} ${isVanguard && !isFounder ? styles.vanguardModal : ''}`}
        tabIndex={-1}
        style={{ '--modal-glow': glowColor }}
      >
        <button className={styles.closeBtn} onClick={onClose} aria-label="Close profile">
          <CloseIcon />
        </button>

        {/* Special header stripe for Founders */}
        {isFounder && (
          <div className={styles.founderStripe} aria-hidden="true">
            <span>✦ Founder</span>
          </div>
        )}

        {/* Image */}
        <div className={styles.imageWrap}>
          <div className={styles.imageGlow} style={{ background: `radial-gradient(circle, ${glowColor} 0%, transparent 70%)` }} aria-hidden="true" />
          <img src={contributor.image} alt={contributor.name} className={styles.image} />
          {isFounder  && <span className={styles.founderBadge} title="Founder">✦</span>}
          {isVanguard && !isFounder && <span className={styles.vanguardBadge} title="PrismaX Vanguard">◈</span>}
        </div>

        {/* Identity */}
        <div className={styles.identity}>
          <h2 className={styles.name}>{contributor.name}</h2>
          <p
            className={styles.role}
            style={{ color: isFounder || isVanguard ? '#FFD700' : roleMeta.color }}
          >
            {roleLabel}
          </p>
          {contributor.twitterUrl && (
            <a href={contributor.twitterUrl} target="_blank" rel="noopener noreferrer" className={styles.twitter}>
              <XIcon /><span>{contributor.twitter}</span>
            </a>
          )}
          {joinDate && (
            <p className={styles.joinDate}>
              <span className={styles.joinLabel}>Joined</span>{joinDate}
            </p>
          )}
        </div>

        <div className={styles.divider} aria-hidden="true" />

        {/* Bio (founders/team) or Why Joined (community) */}
        {contributor.bio && (
          <div className={styles.section}>
            <span className={styles.sectionLabel}>About</span>
            <p className={styles.bio}>{contributor.bio}</p>
          </div>
        )}

        {contributor.why_joined && (
          <div className={styles.section}>
            <span className={styles.sectionLabel}>Why they joined</span>
            <p className={styles.bio}>{contributor.why_joined}</p>
          </div>
        )}

        {/* Message to Future */}
        {contributor.messageToFuture && (
          <div className={styles.section}>
            <span className={styles.sectionLabel}>Message to the future</span>
            <blockquote className={styles.quote}>
              <span className={styles.quoteMark} aria-hidden="true">"</span>
              {contributor.messageToFuture}
            </blockquote>
          </div>
        )}

        {/* Brightness indicator (age meter) */}
        {!isFounder && contributor.brightness !== undefined && (
          <div className={styles.ageMeter}>
            <span className={styles.ageMeterLabel}>Star Age</span>
            <div className={styles.ageMeterTrack}>
              <div
                className={styles.ageMeterFill}
                style={{ width: `${contributor.brightness * 100}%`, background: isVanguard ? '#FFD700' : roleMeta.color }}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
