# Supabase Setup Guide — PrismaX Constellation

## 1. Create a Supabase Project

1. Go to [supabase.com](https://supabase.com) and sign in
2. Click **New Project**
3. Choose a name (e.g. `prismax-constellation`) and a strong database password
4. Select the region closest to your users
5. Click **Create new project** and wait ~2 minutes

---

## 2. Database Schema

Open the **SQL Editor** in your Supabase dashboard and run:

```sql
-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- Contributors table
create table public.contributors (
  id                  text primary key,
  name                text not null,
  role                text not null,
  avatar_url          text,
  join_date           date not null,
  why_joined          text,
  message_to_future   text,
  is_founder          boolean default false,
  orbit_radius        integer,
  orbit_speed         integer,
  orbit_angle_offset  integer,
  created_at          timestamptz default now()
);

-- Enable Row Level Security
alter table public.contributors enable row level security;

-- Allow anyone to read contributors
create policy "Anyone can read contributors"
  on public.contributors for select
  using (true);

-- Allow anyone to insert (public submissions)
create policy "Anyone can submit"
  on public.contributors for insert
  with check (true);
```

---

## 3. Storage Bucket

1. Go to **Storage** in your Supabase dashboard
2. Click **New bucket**
3. Name it: `avatars`
4. Check **Public bucket** ✓
5. Click **Create bucket**

Then set up storage policies via **SQL Editor**:

```sql
-- Allow public reads from avatars bucket
create policy "Public avatar reads"
  on storage.objects for select
  using ( bucket_id = 'avatars' );

-- Allow authenticated uploads (or public if you prefer)
create policy "Public avatar uploads"
  on storage.objects for insert
  with check ( bucket_id = 'avatars' );
```

---

## 4. Environment Variables

1. In Supabase → **Project Settings** → **API**, copy:
   - **Project URL** → `VITE_SUPABASE_URL`
   - **anon / public key** → `VITE_SUPABASE_ANON_KEY`

2. In your project root:
```bash
cp .env.example .env.local
```

3. Fill in `.env.local`:
```
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5c...
```

---

## 5. Vercel Deployment

In Vercel → Project → **Settings** → **Environment Variables**, add:
- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`

Both as **Production** + **Preview** + **Development**.

---

## 6. Offline / Demo Mode

If Supabase env vars are missing, the app runs in **demo mode**:
- Submissions work locally (in-memory)
- The join animation still plays
- No data is persisted between sessions
- The form shows an "Demo mode" banner

This lets you develop and demo without a database configured.

---

## 7. Seed Data Note

The four founding team members (Bayley, Chyna, Shaye, Vivian) live in
`src/data/contributors.json` and are **never stored in Supabase**.
They are always loaded from the static file and merged with live data.
This protects their profiles from accidental deletion.
