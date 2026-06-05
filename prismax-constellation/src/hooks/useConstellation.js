import { useState, useEffect, useRef, useCallback } from 'react'

/**
 * Manages orbital animation for all constellation stars.
 * Re-initialises cleanly when the contributors list changes (new member joins).
 */
export function useConstellation(contributors) {
  const [angles, setAngles] = useState(() =>
    Object.fromEntries(contributors.map(c => [c.id, c.orbitAngleOffset ?? 0]))
  )
  const rafRef    = useRef(null)
  const lastRef   = useRef(null)
  const pausedRef = useRef(false)

  // When contributors list changes, seed any new member's starting angle
  useEffect(() => {
    setAngles(prev => {
      const next = { ...prev }
      contributors.forEach(c => {
        if (!(c.id in next)) next[c.id] = c.orbitAngleOffset ?? 0
      })
      return next
    })
  }, [contributors])

  const pause  = useCallback(() => { pausedRef.current = true  }, [])
  const resume = useCallback(() => { pausedRef.current = false }, [])

  useEffect(() => {
    function tick(ts) {
      if (lastRef.current === null) lastRef.current = ts
      const delta = ts - lastRef.current
      lastRef.current = ts

      if (!pausedRef.current) {
        setAngles(prev => {
          const next = { ...prev }
          contributors.forEach(c => {
            const degsPerMs = 360 / ((c.orbitSpeed ?? 40) * 1000)
            next[c.id] = ((prev[c.id] ?? 0) + degsPerMs * delta) % 360
          })
          return next
        })
      }
      rafRef.current = requestAnimationFrame(tick)
    }
    rafRef.current = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(rafRef.current)
  }, [contributors])

  function getPosition(contributor) {
    const rad = (angles[contributor.id] ?? 0) * (Math.PI / 180)
    const rx  = contributor.orbitRadius ?? 220
    const ry  = rx * 0.42
    return { x: Math.cos(rad) * rx, y: Math.sin(rad) * ry }
  }

  return { angles, getPosition, pause, resume }
}
