import { getRoleMeta, ROLE_LABELS, FOUNDER_IDS } from '../lib/starSystem'
import styles from './ContributorGrid.module.css'

export default function ContributorGrid({ contributors, onSelect }) {
  if (contributors.length === 0) {
    return (
      <div className={styles.empty}>
        <p>No contributors match your search.</p>
      </div>
    )
  }

  return (
    <div className={styles.grid}>
      {contributors.map((c, i) => {
        const isFounder  = c.isFounder  || FOUNDER_IDS.includes(c.id)
        const isVanguard = c.isVanguard || c.role === 'prismax_vanguard'
        const roleMeta   = getRoleMeta(c.role)
        const roleLabel  = ROLE_LABELS[c.role] ?? c.role
        const brightness = c.brightness ?? 0.7

        return (
          <button
            key={c.id}
            className={`${styles.card} ${isFounder ? styles.founder : ''} ${isVanguard && !isFounder ? styles.vanguard : ''}`}
            onClick={() => onSelect(c)}
            style={{
              animationDelay: `${i * 55}ms`,
              '--role-color': isFounder || isVanguard ? '#FFD700' : roleMeta.color,
              '--brightness': brightness,
            }}
            aria-label={`View ${c.name}`}
          >
            <div className={styles.avatarWrap}>
              <img src={c.image} alt={c.name} className={styles.avatar} />
              {isFounder  && <span className={styles.badgeF} title="Founder">✦</span>}
              {isVanguard && !isFounder && <span className={styles.badgeV} title="Vanguard">◈</span>}
            </div>
            <div className={styles.info}>
              <span className={styles.name}>{c.name}</span>
              <span className={styles.role} style={{ color: isFounder || isVanguard ? '#FFD700' : roleMeta.color }}>
                {roleLabel}
              </span>
              {c.join_date && (
                <span className={styles.date}>
                  {new Date(c.join_date).toLocaleDateString('en-US', { year: 'numeric', month: 'short' })}
                </span>
              )}
            </div>
            {/* Brightness bar */}
            <div className={styles.brightBar}>
              <div
                className={styles.brightFill}
                style={{
                  width: `${brightness * 100}%`,
                  background: isFounder || isVanguard ? '#FFD700' : roleMeta.color,
                }}
              />
            </div>
          </button>
        )
      })}
    </div>
  )
}
