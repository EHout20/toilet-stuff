# 🚽 Toilet Incidents Ranker

**The ultimate toilet incident ranking app** — Upload your most epic bathroom disasters and let the community vote on them!

Meet **Splashy the Sweaty Sausage** 🌭💦, your friendly mascot who helps you rank the most legendary toilet incidents from around the world.

## 🎬 Features

- **Instagram Reels-style interface** — Swipe through toilet incidents like TikTok
- **Upload any media** — Videos, audio, whatever captures the incident
- **Vote & rank** — Thumbs up/down system with real-time leaderboard  
- **Auto-advance** — Automatically moves to next incident after voting
- **Cloud storage** — All incidents stored forever in Firebase
- **Multi-format support** — MP4, MOV, MP3, and more

## 🚀 How It Works

1. **Upload** your toilet incident (video/audio)
2. **Community votes** with thumbs up 👍 or thumbs down 👎  
3. **Real-time leaderboard** ranks the most legendary incidents
4. **Browse & enjoy** the chaos in fullscreen Instagram-style feed

## 🛠️ Tech Stack

- **React + Vite** — Fast development and builds
- **Firebase Firestore** — Real-time database for votes and leaderboard
- **Firebase Storage** — Cloud storage for incident media
- **Instagram Reels UI** — Fullscreen vertical video feed
- **Real-time updates** — Live vote counts and leaderboard changes

## 🚀 Getting Started

### 1. Install Dependencies
```bash
npm install
```

### 2. Set up Firebase (Optional)
Create a `.env.local` file with your Firebase config:
```env
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_domain
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_bucket
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
```

### 3. Run Development Server
```bash
npm run dev
```
Open [http://localhost:5173](http://localhost:5173) to see your toilet incident ranker!

### 4. Build for Production
```bash
npm run build
```

## 📱 How to Use

1. **Upload Incident** — Click the upload button and select your media file
2. **Privacy Warning** — App warns that uploads are public (safety first!)
3. **Vote on Incidents** — Swipe through and vote 👍 or 👎
4. **Check Leaderboard** — See top-ranked incidents on the right
5. **Navigate** — Click leaderboard items or scroll indicators to jump around

## 🎮 Controls

- **Mouse Wheel** — Scroll through incidents
- **Click Indicators** — Jump to specific incident
- **Vote Buttons** — Thumbs up/down (right side)
- **Leaderboard** — Click items to jump to that incident

## ⚠️ Safety Features

- **Public Upload Warning** — Users are warned uploads are public
- **MOV File Detection** — Warns about slow upload times  
- **File Size Limits** — 100MB maximum file size
- **Spam Protection** — 250ms cooldown between votes
- **Error Handling** — Comprehensive error logging and recovery

## 🌭 Meet Splashy

**Splashy the Sweaty Sausage** is your friendly toilet incident mascot! He appears in the top-right with a bright orange gradient and helps guide users through the ranking experience.

## 🚽 Sample Incidents

The app comes pre-loaded with 4 sample toilet incident videos to get you started. Upload your own to add to the chaos!

## 🔥 Deployment

The built `dist/` folder is ready to deploy to:
- **Netlify** (recommended for media files)
- **Vercel** 
- **Firebase Hosting**
- **GitHub Pages**

Just drag and drop the `dist/` folder to any static hosting service!

## 🏆 Leaderboard System

- **Real-time voting** — Vote counts update instantly
- **Score calculation** — Likes minus dislikes
- **Auto-sorting** — Highest scores appear at top
- **Clickable navigation** — Jump directly to any ranked incident

## 🎯 File Support

**Supported formats:**
- **Video**: MP4, MOV, AVI, WMV, FLV, WebM, MKV, M4V, 3GP
- **Audio**: MP3, WAV, M4A, AAC, OGG

**File size limit:** 100MB maximum

---

**⚠️ Disclaimer**: This app is for entertainment purposes only. Please be respectful and don't upload anything inappropriate or harmful!

**🎉 Have fun ranking those toilet incidents!** 🚽💦