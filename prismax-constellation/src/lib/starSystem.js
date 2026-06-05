/**
 * Role definitions with display metadata.
 * Ordered from entry-level to most prestigious.
 */
export const ROLES = [
  { id: 'reactant',         label: 'Reactant',          color: '#8B9EC7', glow: 'rgba(139,158,199,0.4)'  },
  { id: 'assistant',        label: 'Assistant',          color: '#7EB89A', glow: 'rgba(126,184,154,0.4)'  },
  { id: 'proactive',        label: 'Proactive',          color: '#C8B08A', glow: 'rgba(200,176,138,0.4)'  },
  { id: 'exploratory',      label: 'Exploratory',        color: '#B87D8E', glow: 'rgba(184,125,142,0.4)'  },
  { id: 'stabilized',       label: 'Stabilized',         color: '#7DBFCC', glow: 'rgba(125,191,204,0.4)'  },
  { id: 'navigational',     label: 'Navigational',       color: '#C89A5C', glow: 'rgba(200,154, 92,0.4)'  },
  { id: 'groundbreaker',    label: 'Groundbreaker',      color: '#D4856A', glow: 'rgba(212,133,106,0.4)'  },
  { id: 'prismax_vanguard', label: 'PrismaX Vanguard',   color: '#FFD700', glow: 'rgba(255,215,  0,0.65)', special: true },
]

export const ROLE_IDS  = ROLES.map(r => r.id)
export const ROLE_LABELS = Object.fromEntries(ROLES.map(r => [r.id, r.label]))

export function getRoleMeta(roleId) {
  return ROLES.find(r => r.id === roleId) ?? ROLES[0]
}

/** Founders always have golden max brightness regardless of date. */
export const FOUNDER_IDS = ['bayley', 'chyna']

/**
 * Calculate a brightness factor [0.35 → 1.0] based on join_date.
 * Oldest contributor in the set = 1.0, newest = 0.35.
 * Founders always return 1.0.
 */
export function computeBrightness(contributor, allContributors) {
  if (FOUNDER_IDS.includes(contributor.id) || contributor.isFounder) return 1.0

  const dates = allContributors
    .filter(c => !FOUNDER_IDS.includes(c.id) && c.join_date)
    .map(c => new Date(c.join_date).getTime())
    .filter(Boolean)

  if (dates.length === 0) return 0.7

  const oldest = Math.min(...dates)
  const newest = Math.max(...dates)
  const myDate = contributor.join_date ? new Date(contributor.join_date).getTime() : newest

  if (oldest === newest) return 0.7

  const ratio = (newest - myDate) / (newest - oldest)
  return 0.35 + ratio * 0.65
}

export function brightnessToSize(brightness) {
  return 0.78 + brightness * 0.28
}

/**
 * Assign orbit params to a new community contributor deterministically.
 */
export function assignOrbitParams(existingCount) {
  const baseAngles = [45, 135, 225, 315, 22, 90, 180, 270, 60, 150, 240, 330, 15, 105, 195, 285]
  const radii      = [195, 245, 265, 215, 230, 255, 200, 240, 220, 260, 235, 250, 210, 248, 272, 225]
  const speeds     = [34,  46,  50,  38,  42,  48,  36,  44,  40,  52,  39,  47,  35,  49,  43,  37]

  const i = existingCount % baseAngles.length
  return {
    orbitRadius:      radii[i],
    orbitSpeed:       speeds[i],
    orbitAngleOffset: baseAngles[i],
  }
}

/**
 * Map a raw Supabase row to the contributor shape used by the UI.
 */
export function normalizeContributor(row, allRows) {
  return {
    id:               row.id,
    name:             row.name,
    role:             row.role,
    image:            row.avatar_url || '/assets/placeholder.svg',
    join_date:        row.join_date,
    why_joined:       row.why_joined,
    messageToFuture:  row.message_to_future,
    isFounder:        FOUNDER_IDS.includes(row.id) || !!row.is_founder,
    isVanguard:       row.role === 'prismax_vanguard',
    brightness:       computeBrightness(row, allRows),
    orbitRadius:      row.orbit_radius,
    orbitSpeed:       row.orbit_speed,
    orbitAngleOffset: row.orbit_angle_offset,
  }
}

/**
 * Merge static seed contributors with live Supabase contributors.
 * Static entries (founders + core team) take precedence by id.
 */
export function mergeContributors(staticList, liveList) {
  const staticIds = new Set(staticList.map(c => c.id))
  const merged = [...staticList]
  for (const c of liveList) {
    if (!staticIds.has(c.id)) merged.push(c)
  }
  return merged
}
