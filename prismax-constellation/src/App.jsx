import { useState, useMemo, useCallback } from 'react'
import { useContributors } from './hooks/useContributors'
import { ROLES, ROLE_LABELS } from './lib/starSystem'
import ConstellationCanvas from './components/ConstellationCanvas'
import ContributorModal from './components/ContributorModal'
import ContributorGrid from './components/ContributorGrid'
import SearchBar from './components/SearchBar'
import RoleFilter from './components/RoleFilter'
import CommunityStats from './components/CommunityStats'
import BecomeStarButton from './components/BecomeStarButton'
import JoinAnimation from './components/JoinAnimation'
import SubmitForm from './components/SubmitForm'
import Footer from './components/Footer'
import styles from './App.module.css'

export default function App() {
  const { contributors, loading, addContributor } = useContributors()

  const [selected, setSelected]         = useState(null)
  const [showForm, setShowForm]         = useState(false)
  const [newStar, setNewStar]           = useState(null)   // triggers join animation
  const [searchQuery, setSearchQuery]   = useState('')
  const [activeRole, setActiveRole]     = useState('')     // '' = all

  const isFiltering = searchQuery.trim().length > 0 || activeRole !== ''

  const filtered = useMemo(() => {
    let list = contributors
    if (activeRole)            list = list.filter(c => c.role === activeRole)
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase()
      list = list.filter(c =>
        c.name.toLowerCase().includes(q) ||
        (ROLE_LABELS[c.role] ?? c.role).toLowerCase().includes(q)
      )
    }
    return list
  }, [contributors, searchQuery, activeRole])

  const handleStarClick  = useCallback(c => setSelected(c), [])
  const handleCloseModal = useCallback(() => setSelected(null), [])

  const handleFormSuccess = useCallback((newC) => {
    addContributor(newC)
    setShowForm(false)
    setNewStar(newC)
  }, [addContributor])

  return (
    <div className={styles.root}>
      <div className={styles.bgGlow} aria-hidden="true" />

      {/* Header */}
      <header className={styles.header}>
        <img src="/assets/logo.png" alt="PrismaX" className={styles.headerLogo} />
      </header>

      <main className={styles.main}>

        {/* ── Hero ─────────────────────────────────────── */}
        <section className={styles.hero} aria-labelledby="hero-heading">
          <p className={styles.eyebrow}>Physical AI · Human Constellation</p>
          <h1 id="hero-heading" className={styles.headline}>
            The PrismaX<br /><em>Constellation</em>
          </h1>
          <p className={styles.subline}>
            Every star represents a contributor helping{' '}
            <br className={styles.breakDesktop} />
            shape the future of physical AI.
          </p>
        </section>

        {/* ── Living Constellation ──────────────────────── */}
        {!isFiltering && (
          <section aria-label="Interactive constellation" className={styles.constellationSection}>
            {loading ? (
              <div className={styles.loading} aria-label="Loading constellation">
                <span className={styles.loadingOrb} />
                <p>Mapping the constellation…</p>
              </div>
            ) : (
              <ConstellationCanvas
                contributors={contributors}
                newStarId={newStar?.id}
                onStarClick={handleStarClick}
              />
            )}
            {!loading && (
              <p className={styles.hint}>Click any star to learn more</p>
            )}
          </section>
        )}

        {/* ── Search + Role Filter ──────────────────────── */}
        <section className={styles.discoverSection} aria-label="Search and filter contributors">
          <SearchBar
            value={searchQuery}
            onChange={setSearchQuery}
            resultCount={filtered.length}
            totalCount={contributors.length}
          />
          <RoleFilter
            roles={ROLES}
            active={activeRole}
            onChange={setActiveRole}
            contributors={contributors}
          />
        </section>

        {/* ── Filtered grid ────────────────────────────── */}
        {isFiltering && (
          <section className={styles.gridSection} aria-label="Filtered results">
            <ContributorGrid contributors={filtered} onSelect={handleStarClick} />
          </section>
        )}

        {/* ── Community Stats ───────────────────────────── */}
        <CommunityStats contributors={contributors} />

      </main>

      <Footer />

      {/* ── Floating CTA ─────────────────────────────── */}
      <BecomeStarButton onClick={() => setShowForm(true)} />

      {/* ── Modals ───────────────────────────────────── */}
      {showForm && (
        <SubmitForm
          onClose={() => setShowForm(false)}
          onSuccess={handleFormSuccess}
          existingCount={contributors.length}
        />
      )}

      {selected && (
        <ContributorModal contributor={selected} onClose={handleCloseModal} />
      )}

      {/* ── Join animation ───────────────────────────── */}
      {newStar && (
        <JoinAnimation
          contributor={newStar}
          onComplete={() => setNewStar(null)}
        />
      )}
    </div>
  )
}
