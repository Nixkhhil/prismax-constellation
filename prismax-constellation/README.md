# The PrismaX Constellation v2

A living, interactive universe of contributors building the future of physical AI.

## ✦ Quick Start

```bash
npm install
cp .env.example .env.local   # fill in Supabase keys (optional — see below)
npm run dev
```

The app runs in **demo mode** without Supabase configured — fully functional, submissions are local only.

## ✦ Project Structure

```
prismax-constellation/
├── public/assets/
│   ├── logo.png
│   └── members/  bayley · chyna · shaye · vivian
│
├── src/
│   ├── data/
│   │   └── contributors.json         ← Core team (static, always loaded)
│   │
│   ├── lib/
│   │   ├── starSystem.js             ← Roles, brightness, orbit math
│   │   └── supabase.js               ← DB client, upload, insert, fetch
│   │
│   ├── hooks/
│   │   ├── useConstellation.js       ← rAF orbit animation engine
│   │   ├── useContributors.js        ← Merges seed + Supabase data
│   │   └── useMediaQuery.js
│   │
│   └── components/
│       ├── ConstellationCanvas       ← Orbit stage
│       ├── ConstellationStar         ← Individual star (brightness-aware)
│       ├── CenterLogo                ← Pulsing PrismaX center
│       ├── StarLines                 ← SVG orbital path ellipses
│       ├── ContributorModal          ← Glassmorphism profile + age meter
│       ├── ContributorGrid           ← Filtered grid view
│       ├── SearchBar                 ← Name/role search
│       ├── RoleFilter                ← Chip filter by role
│       ├── BecomeStarButton          ← Fixed floating CTA
│       ├── SubmitForm                ← Submission modal with upload
│       ├── JoinAnimation             ← New star fly-in animation
│       ├── CommunityStats            ← Stats section
│       └── Footer
│
├── .env.example                      ← Copy to .env.local
├── SUPABASE_SETUP.md                 ← Full DB + storage instructions
└── vercel.json
```

## ✦ Adding a New Core Team Member

Edit `src/data/contributors.json` and drop their image in `public/assets/members/`.

## ✦ Role System

| Role | Description |
|------|-------------|
| Reactant | Entry-level contributor |
| Assistant | Supporting contributor |
| Proactive | Active contributor |
| Exploratory | Investigative contributor |
| Stabilized | Consistent contributor |
| Navigational | Directional contributor |
| Groundbreaker | High-impact contributor |
| **PrismaX Vanguard** ◈ | **Special ambassador — golden glow** |

## ✦ Star Aging

- **Join date** determines brightness
- Oldest non-founder contributors = brightest glow + largest size
- **Founders** (Bayley, Chyna) = always maximum brightness + golden treatment
- New community members start dim and grow as others join after them

## ✦ Supabase Setup

See **[SUPABASE_SETUP.md](./SUPABASE_SETUP.md)** for the complete database schema, storage bucket config, RLS policies, and Vercel deployment guide.

## ✦ Deploy to Vercel

```bash
# CLI
npx vercel

# Or: push to GitHub → import in vercel.com
# Add VITE_SUPABASE_URL + VITE_SUPABASE_ANON_KEY in Vercel env vars
```

## ✦ Credits

Built by [Nickhil](https://x.com/nixkhhil)
