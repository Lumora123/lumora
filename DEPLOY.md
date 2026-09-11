# Deploying Lumora to Vercel + Hostinger subdomain (lumora.gulplaza.net)

Lumora is a Next.js 14 app that needs a Node.js server, so it cannot run on
Hostinger's Premium shared hosting (PHP/static only). This guide deploys the app
on **Vercel (free tier)** and points your **Hostinger subdomain** at it via DNS.

Total time: ~15–20 minutes (most of it DNS propagation).

---

## What's already configured in this project

- `vercel.json` — sets `NEXT_PUBLIC_SITE_URL=https://lumora.gulplaza.net` at build
  time (canonical URLs, sitemap.xml, robots.txt and OG tags all use it).
- `lib/db.ts` — detects Vercel (`process.env.VERCEL`) and automatically stores its
  JSON datastore in `/tmp/lumora-data` (the only writable location on serverless),
  with synchronous writes so nothing is lost between invocations.
- `.gitignore` — excludes `node_modules`, `.next` and `data/db.json` (the datastore
  re-seeds itself automatically on first run).

## Step 1 — Get the code onto GitHub

From your computer (after downloading this project folder):

```bash
cd lumora
npm install          # not strictly needed for Vercel, but good to verify locally
git init
git add .
git commit -m "Lumora — legal streaming platform"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/lumora.git
git push -u origin main
```

Create the empty `lumora` repository on github.com first (no README/license).

## Step 2 — Import into Vercel

1. Go to https://vercel.com → **Sign up** (use "Continue with GitHub" — easiest).
2. Dashboard → **Add New… → Project** → import your `lumora` repo.
3. Framework preset: **Next.js** (auto-detected). Don't change build settings —
   `next build` is correct.
4. Environment variables: **none needed** — `vercel.json` already provides
   `NEXT_PUBLIC_SITE_URL`. (If you ever change the domain, update it there or add
   an override in Project → Settings → Environment Variables.)
5. Click **Deploy**. First build takes 1–3 minutes. You'll get a
   `lumora-xxxx.vercel.app` URL — verify the site works there first.

## Step 3 — Point your Hostinger subdomain at Vercel

In Vercel: Project → **Settings → Domains** → add `lumora.gulplaza.net`.
Vercel will show the expected DNS record (a CNAME to `cname.vercel-dns.com`).

In Hostinger hPanel:

1. **Domains → gulplaza.net → DNS / Nameservers** (DNS Zone Editor).
2. If you previously created "lumora" as a *website/subdomain* in hPanel, delete
   its auto-created A record (it would conflict).
3. Add a record:
   - Type: **CNAME**
   - Name: **lumora**
   - Target: **cname.vercel-dns.com**
   - TTL: default (3600 is fine)
4. Save. Propagation usually takes 5–30 minutes (can be up to a few hours).
5. Back in Vercel's Domains page, the record will turn green ("Valid
   Configuration") and Vercel automatically issues the Let's Encrypt SSL
   certificate. Wait for it — HTTPS becomes active on its own.

Verify: open `https://lumora.gulplaza.net` — you should see Lumora, and
`https://lumora.gulplaza.net/sitemap.xml` should list the subdomain URLs.

## Step 4 — Smoke test checklist

- [ ] Homepage, Movies, TV Shows, Genres, Search (⌘K) all load
- [ ] Play Big Buck Bunny (`/watch/movie/big-buck-bunny`) — video streams directly
      from archive.org / mux.dev test streams, so Vercel bandwidth is not used
- [ ] Sign in as `demo@lumora.tv` / `LumoraDemo!2026` — My List, Continue Watching
      and History are pre-populated
- [ ] Sign in as `admin@lumora.tv` / `LumoraAdmin!2026` — Admin dashboard opens
- [ ] `/robots.txt` and `/sitemap.xml` return 200 and reference the subdomain

> ⚠️ **Change the two demo passwords after going live** (Admin → Users, or via
> the reset flow). They are seeded credentials published in this guide.

---

## Serverless data persistence — read this

Vercel has **no permanent disk**. The JSON datastore behaves like this:

| What | Behavior on Vercel |
|---|---|
| Browsing, detail pages, search, playback, SEO | ✅ Always works (catalog is seeded from code) |
| Guest watchlist / resume points | ✅ Stored in the visitor's own browser — fully persistent |
| Demo accounts (`admin@` / `demo@lumora.tv`) | ✅ Re-seeded on every cold start, always available |
| New sign-ups, admin edits, server-side sync | ⚠️ Persist while the serverless function is warm; **reset when a cold container boots** (minutes–hours of inactivity, or on every redeploy) |

That is perfectly fine for a portfolio/demo deployment. If you want real durable
accounts later, the storage layer is isolated in `lib/db.ts` — swap it for
**Vercel Postgres / Upstash Redis / Neon** (all have free tiers) without touching
any UI or API code. Alternatively, a Hostinger **VPS** (KVM 1) runs this exact
project with permanent disk: `npm run build && pm2 start npm --name lumora -- start`
behind Nginx.

## Updating the site later

Push to your GitHub `main` branch — Vercel rebuilds and redeploys automatically.
