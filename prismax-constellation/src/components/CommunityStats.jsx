import { useMemo } from 'react'
import { ROLE_LABELS } from '../lib/starSystem'
import styles from './CommunityStats.module.css'

export default function CommunityStats({ contributors }) {
  const stats = useMemo(() => {
    const total      = contributors.length
    const roleSet    = new Set(contributors.map(c => c.role))
    const vanguards  = contributors.filter(c => c.role === 'prismax_vanguard').length

    const oldest = contributors
      .filter(c => c.join_date)
      .sort((a, b) => new Date(a.join_date) - new Date(b.join_date))[0]

    return { total, roleCount: roleSet.size, vanguards, oldest }
  }, [contributors])

  return (
    <section className={styles.section} aria-label="Community statistics">
      <p className={styles.eyebrow}>Constellation metrics</p>

      <div className={styles.grid}>
        <div className={styles.card}>
          <span className={styles.num}>{stats.total}</span>
          <span className={styles.label}>Total Stars</span>
        </div>

        <div className={styles.card}>
          <span className={styles.num}>{stats.roleCount}</span>
          <span className={styles.label}>Active Roles</span>
        </div>

        <div className={styles.card}>
          <span className={`${styles.num} ${styles.gold}`}>{stats.vanguards}</span>
          <span className={styles.label}>Vanguard Members</span>
        </div>

        <div className={`${styles.card} ${styles.cardWide}`}>
          {stats.oldest ? (
            <>
              <div className={styles.oldestImg}>
                <img src={stats.oldest.image} alt={stats.oldest.name} />
              </div>
              <div className={styles.oldestInfo}>
                <span className={styles.oldestLabel}>Oldest Contributor</span>
                <span className={styles.oldestName}>{stats.oldest.name}</span>
                <span className={styles.oldestRole}>
                  {ROLE_LABELS[stats.oldest.role] ?? stats.oldest.role}
                </span>
                <span className={styles.oldestDate}>
                  Since {new Date(stats.oldest.join_date).toLocaleDateString('en-US', { year: 'numeric', month: 'long' })}
                </span>
              </div>
            </>
          ) : (
            <span className={styles.label}>No data yet</span>
          )}
        </div>
      </div>
    </section>
  )
}
