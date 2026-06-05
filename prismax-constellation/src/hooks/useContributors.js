/**
 * useContributors
 * Merges static seed data with live Supabase contributors.
 * Falls back gracefully when Supabase is not configured.
 */
import { useState, useEffect, useCallback } from 'react'
import seedData from '../data/contributors.json'
import { fetchContributors } from '../lib/supabase'
import { normalizeContributor, computeBrightness, mergeContributors, assignOrbitParams } from '../lib/starSystem'

function enrichSeed(list) {
  return list.map(c => ({
    ...c,
    brightness: computeBrightness(c, list),
    isVanguard: c.role === 'prismax_vanguard',
  }))
}

export function useContributors() {
  const [contributors, setContributors] = useState(() => enrichSeed(seedData))
  const [loading, setLoading]           = useState(true)
  const [error, setError]               = useState(null)

  const load = useCallback(async () => {
    setLoading(true)
    const { data, error: err } = await fetchContributors()
    setLoading(false)

    if (err) { setError(err); return }
    if (!data || data.length === 0) return

    // Normalize Supabase rows
    const live = data.map(row => normalizeContributor(row, data))

    // Merge with seed, recompute brightness across full set
    const merged = mergeContributors(enrichSeed(seedData), live)
    const allDates = merged.filter(c => c.join_date)
    const final = merged.map(c => ({ ...c, brightness: computeBrightness(c, allDates) }))
    setContributors(final)
  }, [])

  useEffect(() => { load() }, [load])

  /**
   * Optimistically add a newly submitted contributor to the local state.
   */
  const addContributor = useCallback((newC) => {
    setContributors(prev => {
      const orbit = assignOrbitParams(prev.length)
      const full = {
        ...newC,
        ...orbit,
        isVanguard: newC.role === 'prismax_vanguard',
        isNew: true,
      }
      const next = [...prev, full]
      const allDates = next.filter(c => c.join_date)
      return next.map(c => ({ ...c, brightness: computeBrightness(c, allDates) }))
    })
  }, [])

  return { contributors, loading, error, addContributor, reload: load }
}
