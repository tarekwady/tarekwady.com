# Supabase setup

The app uses Supabase for notes (`public.notes`) and photos (`public.photos` + `storage.buckets.photos`). Migrations live in `supabase/migrations/`.

## Required env vars

Set these in `.env.local` for dev and in Vercel project settings for prod:

| var | source | scope |
|-----|--------|-------|
| `NEXT_PUBLIC_SUPABASE_URL` | Project Settings → API → Project URL | client + server |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Project Settings → API → `anon` `public` key | client + server |
| `SUPABASE_SERVICE_ROLE_KEY` | Project Settings → API → `service_role` key | **server only** — never expose |

## Apply migrations to a hosted project

```bash
# one-time link
npx supabase link --project-ref <your-project-ref>

# push all migrations in supabase/migrations/
npx supabase db push
```

The project ref is the subdomain of your Supabase URL (`https://<ref>.supabase.co`).

If you'd rather paste SQL: open the SQL editor in Supabase Studio and run the files in `supabase/migrations/` in filename order.

## What the migrations create

- `20240710180237_initial.sql` — `notes` table, RLS policies, `select_notes` RPC
- `20260114000000_photos.sql` — `photos` table, `select_photos` RPC, public `photos` storage bucket with upload/read policies

## Local Supabase (optional)

Requires Docker.

```bash
npx supabase start    # boots a local stack on ports 54321/54322
npx supabase db reset # re-applies all migrations to the local DB
```

`npx supabase start` prints local API URL + anon/service keys you can drop into `.env.local`.
