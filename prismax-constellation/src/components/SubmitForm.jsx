/**
 * SubmitForm — "Become a Star" submission modal
 */
import { useState, useRef, useEffect } from 'react'
import { ROLES } from '../lib/starSystem'
import { uploadAvatar, insertContributor, isSupabaseReady } from '../lib/supabase'
import { assignOrbitParams } from '../lib/starSystem'
import styles from './SubmitForm.module.css'

const CloseIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
    <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
  </svg>
)
const StarIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
  </svg>
)

const MAX_FILE_MB = 5
const ALLOWED_TYPES = ['image/jpeg','image/png','image/webp','image/gif']

export default function SubmitForm({ onClose, onSuccess, existingCount }) {
  const overlayRef = useRef(null)
  const dialogRef  = useRef(null)
  const fileRef    = useRef(null)

  const [step, setStep]       = useState('form')   // 'form' | 'submitting' | 'success' | 'error'
  const [preview, setPreview] = useState(null)
  const [file, setFile]       = useState(null)
  const [fileError, setFileError] = useState('')
  const [form, setForm]       = useState({
    name: '', role: '', join_date: '', why_joined: '', message_to_future: '',
  })
  const [errors, setErrors]   = useState({})
  const [errMsg, setErrMsg]   = useState('')

  useEffect(() => { dialogRef.current?.focus() }, [])
  useEffect(() => {
    document.body.style.overflow = 'hidden'
    return () => { document.body.style.overflow = '' }
  }, [])
  useEffect(() => {
    function onKey(e) { if (e.key === 'Escape') onClose() }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [onClose])

  function handleOverlay(e) { if (e.target === overlayRef.current) onClose() }

  function set(field, val) {
    setForm(f => ({ ...f, [field]: val }))
    setErrors(e => ({ ...e, [field]: '' }))
  }

  function handleFile(e) {
    const f = e.target.files?.[0]
    if (!f) return
    setFileError('')

    if (!ALLOWED_TYPES.includes(f.type)) {
      setFileError('Please upload a JPG, PNG, WebP, or GIF image.')
      return
    }
    if (f.size > MAX_FILE_MB * 1024 * 1024) {
      setFileError(`Image must be under ${MAX_FILE_MB}MB.`)
      return
    }
    setFile(f)
    setPreview(URL.createObjectURL(f))
  }

  function validate() {
    const e = {}
    if (!form.name.trim())           e.name         = 'Name is required.'
    if (!form.role)                  e.role         = 'Please choose a role.'
    if (!form.join_date)             e.join_date    = 'Join date is required.'
    if (!form.why_joined.trim())     e.why_joined   = 'Tell us why you joined.'
    if (!form.message_to_future.trim()) e.message_to_future = 'Share a message to the future.'
    if (!file)                       e.file         = 'Profile picture is required.'
    return e
  }

  async function handleSubmit() {
    const e = validate()
    if (Object.keys(e).length > 0) { setErrors(e); return }

    setStep('submitting')
    setErrMsg('')

    try {
      const id      = `community_${Date.now()}`
      const avatarUrl = await uploadAvatar(file, id)
      const orbit   = assignOrbitParams(existingCount)

      const payload = {
        id,
        name:             form.name.trim(),
        role:             form.role,
        avatar_url:       avatarUrl,
        join_date:        form.join_date,
        why_joined:       form.why_joined.trim(),
        message_to_future: form.message_to_future.trim(),
        is_founder:       false,
        orbit_radius:     orbit.orbitRadius,
        orbit_speed:      orbit.orbitSpeed,
        orbit_angle_offset: orbit.orbitAngleOffset,
      }

      const { data, error } = await insertContributor(payload)
      if (error && !error.message?.includes('offline')) throw error

      const newContributor = {
        id,
        name:             payload.name,
        role:             payload.role,
        image:            avatarUrl,
        join_date:        payload.join_date,
        why_joined:       payload.why_joined,
        messageToFuture:  payload.message_to_future,
        isFounder:        false,
        isVanguard:       payload.role === 'prismax_vanguard',
        brightness:       0.4,
        orbitRadius:      orbit.orbitRadius,
        orbitSpeed:       orbit.orbitSpeed,
        orbitAngleOffset: orbit.orbitAngleOffset,
      }

      setStep('success')
      setTimeout(() => onSuccess(newContributor), 1800)
    } catch (err) {
      console.error('[SubmitForm]', err)
      setErrMsg(err?.message || 'Something went wrong. Please try again.')
      setStep('error')
    }
  }

  const todayStr = new Date().toISOString().split('T')[0]

  return (
    <div ref={overlayRef} className={styles.overlay} onClick={handleOverlay} role="dialog" aria-modal="true" aria-label="Become a Star">
      <div ref={dialogRef} className={styles.modal} tabIndex={-1}>

        {/* Close */}
        <button className={styles.closeBtn} onClick={onClose} aria-label="Close"><CloseIcon /></button>

        {step === 'success' && (
          <div className={styles.successState}>
            <div className={styles.successOrb} aria-hidden="true">
              <span className={styles.successStar}>✦</span>
            </div>
            <h2 className={styles.successTitle}>You're now a star.</h2>
            <p className={styles.successSub}>Your light joins the constellation.</p>
          </div>
        )}

        {step === 'submitting' && (
          <div className={styles.loadingState}>
            <div className={styles.spinner} aria-hidden="true" />
            <p className={styles.loadingText}>Launching into orbit…</p>
          </div>
        )}

        {(step === 'form' || step === 'error') && (
          <>
            <div className={styles.header}>
              <StarIcon />
              <h2 className={styles.title}>Become a Star</h2>
              <p className={styles.subtitle}>Join the PrismaX Constellation and leave your mark on the future of physical AI.</p>
            </div>

            {!isSupabaseReady && (
              <div className={styles.offlineBanner}>
                ◎ Demo mode — submissions won't be saved to the database.
              </div>
            )}

            {step === 'error' && errMsg && (
              <div className={styles.errorBanner}>{errMsg}</div>
            )}

            <div className={styles.form}>
              {/* Avatar upload */}
              <div className={styles.avatarSection}>
                <button
                  className={styles.avatarUpload}
                  onClick={() => fileRef.current?.click()}
                  type="button"
                  aria-label="Upload profile picture"
                >
                  {preview
                    ? <img src={preview} alt="Preview" className={styles.avatarPreview} />
                    : <span className={styles.avatarPlaceholder}>＋<br/><em>Photo</em></span>
                  }
                </button>
                <input
                  ref={fileRef}
                  type="file"
                  accept="image/jpeg,image/png,image/webp,image/gif"
                  className={styles.fileInput}
                  onChange={handleFile}
                  tabIndex={-1}
                />
                {(fileError || errors.file) && (
                  <p className={styles.fieldError}>{fileError || errors.file}</p>
                )}
                <p className={styles.fileHint}>JPG, PNG, WebP · max 5 MB</p>
              </div>

              {/* Name */}
              <div className={styles.field}>
                <label className={styles.label} htmlFor="sf-name">Name</label>
                <input
                  id="sf-name"
                  className={`${styles.input} ${errors.name ? styles.inputError : ''}`}
                  type="text"
                  placeholder="Your name"
                  value={form.name}
                  onChange={e => set('name', e.target.value)}
                  maxLength={60}
                  autoComplete="name"
                />
                {errors.name && <p className={styles.fieldError}>{errors.name}</p>}
              </div>

              {/* Role */}
              <div className={styles.field}>
                <label className={styles.label} htmlFor="sf-role">Role</label>
                <div className={styles.selectWrap}>
                  <select
                    id="sf-role"
                    className={`${styles.select} ${errors.role ? styles.inputError : ''}`}
                    value={form.role}
                    onChange={e => set('role', e.target.value)}
                  >
                    <option value="">Select your role</option>
                    {ROLES.map(r => (
                      <option key={r.id} value={r.id}>
                        {r.id === 'prismax_vanguard' ? '◈ ' : ''}{r.label}
                      </option>
                    ))}
                  </select>
                  <span className={styles.selectArrow} aria-hidden="true">▾</span>
                </div>
                {form.role === 'prismax_vanguard' && (
                  <p className={styles.vanguardNote}>✦ PrismaX Vanguard is our special ambassador role.</p>
                )}
                {errors.role && <p className={styles.fieldError}>{errors.role}</p>}
              </div>

              {/* Join date */}
              <div className={styles.field}>
                <label className={styles.label} htmlFor="sf-date">Join Date</label>
                <input
                  id="sf-date"
                  className={`${styles.input} ${errors.join_date ? styles.inputError : ''}`}
                  type="date"
                  value={form.join_date}
                  max={todayStr}
                  onChange={e => set('join_date', e.target.value)}
                />
                <p className={styles.fieldHint}>The date you joined or connected with PrismaX.</p>
                {errors.join_date && <p className={styles.fieldError}>{errors.join_date}</p>}
              </div>

              {/* Why joined */}
              <div className={styles.field}>
                <label className={styles.label} htmlFor="sf-why">Why did you join PrismaX?</label>
                <textarea
                  id="sf-why"
                  className={`${styles.textarea} ${errors.why_joined ? styles.inputError : ''}`}
                  placeholder="What brought you here…"
                  value={form.why_joined}
                  onChange={e => set('why_joined', e.target.value)}
                  rows={3}
                  maxLength={400}
                />
                <span className={styles.charCount}>{form.why_joined.length}/400</span>
                {errors.why_joined && <p className={styles.fieldError}>{errors.why_joined}</p>}
              </div>

              {/* Message to future */}
              <div className={styles.field}>
                <label className={styles.label} htmlFor="sf-msg">Message to the Future</label>
                <textarea
                  id="sf-msg"
                  className={`${styles.textarea} ${errors.message_to_future ? styles.inputError : ''}`}
                  placeholder="What do you want the future to know…"
                  value={form.message_to_future}
                  onChange={e => set('message_to_future', e.target.value)}
                  rows={3}
                  maxLength={400}
                />
                <span className={styles.charCount}>{form.message_to_future.length}/400</span>
                {errors.message_to_future && <p className={styles.fieldError}>{errors.message_to_future}</p>}
              </div>

              {/* Submit */}
              <button className={styles.submitBtn} onClick={handleSubmit} type="button">
                <StarIcon />
                Join the Constellation
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
