import styles from './BecomeStarButton.module.css'

const StarIcon = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
  </svg>
)

export default function BecomeStarButton({ onClick }) {
  return (
    <div className={styles.wrapper}>
      <button className={styles.btn} onClick={onClick} aria-label="Become a Star — join the constellation">
        <span className={styles.glow} aria-hidden="true" />
        <StarIcon />
        <span>Become a Star</span>
      </button>
    </div>
  )
}
