Expo University Pissser — Safe Demo

Overview
- This is a safe demo Expo app that shows a fictional university-style logo overlay on the camera and a simulated water stream effect.
- Important: The app must NOT detect, identify, or target real-world logos, people, or property. It runs all frame processing locally and never uploads frames.

Files created
- `App.js` — Navigation and LogoContext
- `screens/HomeScreen.js`, `screens/CameraScreen.js`, `screens/UploadLogoScreen.js`, `screens/LeaderboardScreen.js`
- `components/StreamParticle.js` — tiny particle visual
- `firebase/config.js` — Firebase initializer (fill env vars)

Setup
1. Install Expo CLI and create a managed project, or drop these files into an existing Expo project.
2. Install dependencies:

```bash
expo install expo-camera expo-image-picker
npm install firebase
npm install @react-navigation/native @react-navigation/stack
expo install react-native-gesture-handler react-native-reanimated react-native-screens react-native-safe-area-context @react-native-community/masked-view
expo install expo-document-picker expo-av
```

3. Firebase: enable a Firestore project and anonymous auth. In your environment (Expo `app.config.js` or using `dotenv`), set:

```
FIREBASE_API_KEY=...
FIREBASE_AUTH_DOMAIN=...
FIREBASE_PROJECT_ID=...
FIREBASE_STORAGE_BUCKET=...
FIREBASE_MESSAGING_SENDER_ID=...
FIREBASE_APP_ID=...
```

4. Run locally:

```bash
expo start
```

Safety notes
- Do NOT upload or target real-world logos, people, or private property. The app includes an explicit warning modal on upload.
- No camera frames are ever uploaded; any motion detection must remain local. If you add extra code, keep it local-only.

Optional: Motion detector pseudo-code
- See `MOTION_DETECTOR.md` for a commented outline of a low-res frame-difference implementation that runs locally and doesn't attempt recognition.
# RankYourToilet (Next.js)

A silly Next.js app to rate toilets around campus — because someone needs to rank them.

Getting started

1. Install dependencies

```bash
npm install
```

2. Run the dev server

```bash
npm run dev
```

3. Open http://localhost:3000

What’s included

- Simple Next.js pages for listing toilets and viewing details
- API routes under `/api/toilets` with a small JSON file store at `data/db.json`
- Add toilets and add reviews from the UI

Map & OSM integration

- There's now a `/map` page (Next) that uses Leaflet and the OpenStreetMap Overpass API to find nearby public toilets and let users rate them with emoji.
- Ratings are saved server-side to `data/osm_ratings.json` via `/api/osm/ratings`.
- For Google Maps integration: you can replace the TileLayer or add Places API lookups (requires API key and billing).

New: Star rating UI and image uploads

- The toilet detail page now has a clickable 5-star rating widget (no more dropdowns).
- You can upload multiple images. If you configure Firebase the images upload to your Firebase Storage. Otherwise a fallback server endpoint saves images as files into `public/uploads` (useful for local testing).

Notes

- This is intentionally minimal. If you want persistence beyond the local JSON file or authentication, I can wire up SQLite/Postgres and auth next.

Firebase image uploads

1. Create a Firebase project at https://console.firebase.google.com and enable Firebase Storage.
2. Add a web app in your Firebase project and copy the config values.
3. In your project create a `.env.local` with these variables (replace values from Firebase):

```env
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=...
NEXT_PUBLIC_FIREBASE_APP_ID=...
```

4. Restart the dev server (if running) and open a toilet detail page to upload images.

Security note: This scaffold uploads directly from the browser to Firebase Storage. For a production app, lock your Storage rules and consider authenticated uploads.

Video upload notes
- The app supports uploading video files (user picks a file or records one). Uploaded videos are placed in Firebase Storage under `uploads/videos/{uid}/...`.
- A metadata document is stored at `stream_videos/{uid}` with `videoUrl`, `userId`, and `createdAt`. This is intended for safe, consented uploads only.
- Ensure your Firebase Storage rules only allow authenticated users to write to their own area, for example:

	match /uploads/videos/{userId}/{allPaths=**} {
		allow write: if request.auth != null && request.auth.uid == userId;
		allow read: if true;
	}


Google Sign-In (optional)
--------------------------------

We added Google Sign-In via Expo Auth Session. To enable it you'll need to create OAuth client IDs in Google Cloud and set them in your Expo config or environment.

Quick steps (Expo-managed app)

1) Create OAuth credentials
	- In Google Cloud Console > APIs & Services > Credentials create OAuth 2.0 Client IDs.
	- Create a Web client ID (for Expo dev / web). Use that for `GOOGLE_CLIENT_ID`.
	- Optionally create iOS / Android client IDs for standalone builds and set `GOOGLE_IOS_CLIENT_ID` / `GOOGLE_ANDROID_CLIENT_ID`.

2) Configure redirect URI for Expo (dev)
	- When using Expo Auth Session during development, the redirect URI used by Expo is of the form:
	  `https://auth.expo.io/@your-username/your-project-slug`
	- Add that URI in the Google Cloud Console as an authorized redirect URI for your web client.

3) Set env vars
	- Add the client IDs to your `.env.local` or CI environment and ensure `app.config.js` reads them into Expo `extra`:

```
EXPO_GOOGLE_CLIENT_ID=...     # web (used by Expo dev)
EXPO_GOOGLE_IOS_CLIENT_ID=...
EXPO_GOOGLE_ANDROID_CLIENT_ID=...
```

4) In Firebase Console > Authentication > Sign-in method enable 'Google' provider.

5) Restart Expo and test: open the Auth screen and tap 'Sign in with Google'.

Notes
 - Expo Auth Session requires the redirect URI to be registered with your Google OAuth client. Use the `expo whoami` and project slug to determine the exact redirect in dev.
 - For standalone builds, use the platform-specific client IDs you created.


Ranking behavior
--------------------------------
- Submitting a score now upserts a per-user document at `stream_scores/{uid}` (instead of appending many documents). This keeps the leaderboard as one row per user.
- The server-side Firestore rules should be adjusted if you require stricter write controls. For example, only allow users to write to `stream_scores/{request.auth.uid}`.

