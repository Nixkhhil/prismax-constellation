import styles from './RoleFilter.module.css'

export default function RoleFilter({ roles, active, onChange, contributors }) {
  // Build count map
  const counts = {}
  for (const c of contributors) {
    counts[c.role] = (counts[c.role] ?? 0) + 1
  }

  return (
    <div className={styles.wrapper} role="group" aria-label="Filter by role">
      <button
        className={`${styles.chip} ${active === '' ? styles.active : ''}`}
        onClick={() => onChange('')}
        aria-pressed={active === ''}
      >
        All
        <span className={styles.count}>{contributors.length}</span>
      </button>

      {roles.map(r => {
        const cnt = counts[r.id] ?? 0
        if (cnt === 0) return null
        return (
          <button
            key={r.id}
            className={`${styles.chip} ${active === r.id ? styles.active : ''} ${r.special ? styles.special : ''}`}
            onClick={() => onChange(r.id === active ? '' : r.id)}
            aria-pressed={active === r.id}
            style={{ '--role-color': r.color }}
          >
            {r.special && <span className={styles.vanguardDot} aria-hidden="true">◈</span>}
            {r.label}
            <span className={styles.count}>{cnt}</span>
          </button>
        )
      })}
    </div>
  )
}
