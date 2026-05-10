# 🎵 AMAX Music Player

A full-featured music streaming web application built with Next.js. Search, play, and download songs with a premium dark UI and background playback.

---

## Features

- **🎧 Background Playback** — Music keeps playing while you browse different pages
- **🔍 Search** — Search songs, albums, artists, and playlists
- **📥 Download** — Download songs directly to your device in MP3 format
- **❤️ Favorites** — Like and save your favorite songs
- **📜 History** — Track your recently played songs
- **🎵 Queue** — Manage your playback queue
- **🔀 Shuffle & Repeat** — Full playback controls including shuffle and repeat modes
- **🎨 Premium UI** — Dark theme with premium design, responsive across all devices
- **📱 Mobile Optimized** — Full-screen mobile player with gesture support
- **🎤 Lyrics** — View lyrics for supported songs
- **📀 Browse** — Explore albums, artists, and curated playlists
- **⚙️ Quality Settings** — Choose from 48kbps to 320kbps audio quality
- **🖥️ Media Session** — Native OS media controls (lock screen, notification bar)

---

## Tech Stack

- **Next.js 14** (App Router)
- **React 18**
- **TypeScript**
- **Tailwind CSS**
- **JioSaavn API** via [saavn.sumit.co](https://saavn.sumit.co)

---

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn

### Installation

```bash
git clone https://github.com/Aman262626/ria-bot.git
cd ria-bot
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Production Build

```bash
npm run build
npm start
```

---

## Deploy on Vercel

The easiest way to deploy is via [Vercel](https://vercel.com):

1. Push your code to GitHub
2. Import the repo on [vercel.com/new](https://vercel.com/new)
3. Deploy — no environment variables needed!

---

## Project Structure

```
├── app/                   # Next.js App Router pages
│   ├── api/              # API routes (proxy to JioSaavn)
│   ├── album/[id]/       # Album detail page
│   ├── artist/[id]/      # Artist detail page
│   ├── playlist/[id]/    # Playlist detail page
│   ├── search/           # Search page
│   ├── library/          # Your Library (favorites, history, settings)
│   ├── layout.tsx        # Root layout with player
│   └── page.tsx          # Home page
├── components/           # React components
│   ├── Player.tsx        # Global music player (desktop + mobile)
│   ├── Sidebar.tsx       # Desktop navigation sidebar
│   ├── MobileNav.tsx     # Mobile bottom navigation
│   ├── QueueDrawer.tsx   # Queue management panel
│   ├── SongCard.tsx      # Song card (grid view)
│   ├── SongRow.tsx       # Song row (list view)
│   ├── AlbumCard.tsx     # Album card
│   ├── ArtistCard.tsx    # Artist card
│   ├── PlaylistCard.tsx  # Playlist card
│   └── SearchBar.tsx     # Search input with debounce
├── contexts/
│   └── PlayerContext.tsx  # Global player state management
├── lib/
│   ├── api.ts            # JioSaavn API client
│   ├── storage.ts        # localStorage helpers
│   ├── types.ts          # TypeScript interfaces
│   └── utils.ts          # Utility functions
└── public/               # Static assets
```

---

## Credits

All copyrights reserved to **cantarellabots** and its affiliated parties.

Star ⭐ and Fork 🍽️
