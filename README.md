# CashOrClout

> BS detector for AI money claims. Free preview. €19 to unlock the verdict.

## Stack
- React + Vite (frontend)
- Netlify Functions (serverless backend)
- Claude API (analysis engine)
- Stripe (payments)
- Supabase (result storage + shareable links)

## Setup

### 1. Install dependencies
```bash
npm install
cd netlify/functions && npm install @anthropic-ai/sdk stripe
```

### 2. Environment variables
Copy `.env.example` to `.env.local` and fill in your keys.

Add the same variables in **Netlify dashboard → Site settings → Environment variables**.

### 3. Stripe
- Create a one-time price of €19 in your Stripe dashboard
- Copy the `price_id` (looks like `price_xxxxxxxxxx`) into your env vars

### 4. Supabase (optional for MVP — can add later)
- Create a free project at supabase.com
- Create a table called `analyses` with columns: `id` (text), `data` (jsonb), `created_at` (timestamp)
- Uncomment the Supabase code in `netlify/functions/analyze.js`

### 5. Deploy
```bash
# Push to GitHub, connect repo to Netlify
# Netlify auto-builds on push
git init
git add .
git commit -m "init"
git remote add origin YOUR_GITHUB_REPO
git push -u origin main
```

## Local dev
```bash
npm run dev
# For functions: install Netlify CLI
npx netlify dev
```
