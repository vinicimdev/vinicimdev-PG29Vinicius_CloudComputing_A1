# SponderBird

A totally cool game obviously not similar to Flappy Bird. Made with React + Firebase and Firestore

## What this app does

- Authenticates users with Firebase
- Creates and stores user profiles in Firestore
- Displays separate screens for Admin and User roles

## Setup

1. Install dependencies

```bash
npm install
```

2. Create a `.env` file in the project root and add your Firebase keys

```env
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_auth_domain
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_storage_bucket
VITE_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
VITE_FIREBASE_APP_ID=your_app_id
VITE_GAME_URL=https://your-game-url.com
```

3. Run the app in dev mode

```bash
npm run dev
```

4. Open the app in the browser at the URL shown in the terminal

## Notes

- The game source is configured from `VITE_GAME_URL`

## Author
Made by PG29 Vinicius Januzzi, @VFS 2025-2026
