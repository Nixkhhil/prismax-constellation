import { useRef, useState, useEffect } from 'react'
import { useConstellation } from '../hooks/useConstellation'
import { useMediaQuery } from '../hooks/useMediaQuery'
import ConstellationStar from './ConstellationStar'
import CenterLogo from './CenterLogo'
import StarLines from './StarLines'
import styles from './ConstellationCanvas.module.css'

export default function ConstellationCanvas({ contributors, onStarClick, newStarId }) {
  const containerRef = useRef(null)
  const [size, setSize]     = useState(700)
  const isMobile  = useMediaQuery('(max-width: 640px)')
  const isTablet  = useMediaQuery('(max-width: 960px)')

  const { getPosition, pause } = useConstellation(contributors)

  useEffect(() => {
    function measure() {
      if (!containerRef.current) return
      const w = containerRef.current.offsetWidth
      setSize(Math.min(w, isMobile ? 380 : isTablet ? 560 : 700))
    }
    measure()
    const ro = new ResizeObserver(measure)
    if (containerRef.current) ro.observe(containerRef.current)
    return () => ro.disconnect()
  }, [isMobile, isTablet])

  function handleStarClick(contributor) {
    pause()
    onStarClick(contributor)
  }

  return (
    <div ref={containerRef} className={styles.outer}>
      <div
        className={styles.canvas}
        style={{ width: size, height: isMobile ? size * 0.72 : size * 0.68 }}
      >
        <StarLines contributors={contributors} size={size} isMobile={isMobile} />
        <CenterLogo isMobile={isMobile} />

        {contributors.map(c => {
          const scale = isMobile ? 0.55 : isTablet ? 0.78 : 1
          const { x, y } = getPosition({ ...c, orbitRadius: c.orbitRadius * scale })
          return (
            <ConstellationStar
              key={c.id}
              contributor={c}
              x={x}
              y={y}
              onClick={() => handleStarClick(c)}
              isMobile={isMobile}
              isNew={c.id === newStarId}
            />
          )
        })}
      </div>
    </div>
  )
}
