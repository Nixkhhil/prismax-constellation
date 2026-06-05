import styles from './CenterLogo.module.css'

export default function CenterLogo({ isMobile }) {
  const size = isMobile ? 80 : 110
  return (
    <div
      className={styles.wrapper}
      style={{ width: size, height: size }}
      aria-label="PrismaX — center of the constellation"
    >
      <span className={styles.pulse1} aria-hidden="true" />
      <span className={styles.pulse2} aria-hidden="true" />
      <span className={styles.pulse3} aria-hidden="true" />
      <div className={styles.disk}>
        <img
          src="/assets/logo.png"
          alt="PrismaX"
          className={styles.logo}
          draggable={false}
        />
      </div>
    </div>
  )
}
