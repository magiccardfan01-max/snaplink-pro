# SnapLink 🔗

**Smart URL Shortener with Real-time Analytics**

> Inspired by a viral project idea on X (Twitter):  
> *"url shortener with analytics — track clicks, device, referrer · add: qr codes, charts, custom slugs, expiring links"*

## Features

- ✂️ **Shorten any URL** with optional custom slug
- 📊 **Full analytics dashboard** — clicks, unique visitors, devices, browsers, referrers, time series
- 📱 **QR code generation** for every link
- ⏳ **Expiring links** — set a lifetime in days
- ⚡ **Instant redirects** with click tracking
- 🎨 **Modern dark UI** built with Next.js 16 + Tailwind CSS 4
- 📦 **Zero external database** for demo (file-based storage in `/tmp` on Vercel)

## Tech Stack

- **Framework**: Next.js 16 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS 4
- **Charts**: Recharts
- **QR Codes**: qrcode.react
- **Icons**: Lucide React

## Getting Started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Deploy

Deploy instantly on Vercel:

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/magiccardfan01-max/snaplink-pro)

## Project Structure

```
src/
├── app/
│   ├── page.tsx          # Homepage + shortener form
│   ├── dashboard/        # Analytics dashboard
│   ├── [slug]/           # Redirect + tracking
│   └── api/
│       ├── shorten/      # Create short link
│       └── links/        # List / detail / delete
├── lib/
│   ├── store.ts          # File-based persistence + helpers
│   └── utils.ts
└── components/
```

## Notes

- On Vercel the data lives in `/tmp` (ephemeral). For production, swap the store for Postgres, Redis, or Vercel KV.
- No authentication — open for demos and portfolios.

## License

MIT
