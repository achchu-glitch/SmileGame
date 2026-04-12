# Smile Game — Web app

This folder is the **main web application**: Firebase Authentication, the puzzle game UI, and (when served with PHP) REST-style endpoints under **`api/`** for MySQL-backed profiles, scores, leaderboard, and feedback.

For installation, scripts, database setup, and repository overview, see the **[project README](../README.md)** in the repository root.

## Firebase

1. Enable **Email/Password**, **Google**, and **Phone** in Firebase Console for your project.
2. Configure **`js/firebase-config.js`** with your web app keys.
3. Detailed steps: **[../docs/FIREBASE_SETUP.md](../docs/FIREBASE_SETUP.md)**.

## How to run

From the **repository root** (parent of `web/`):

```bash
npm start
```

Then open **http://localhost:3000**. Use this mode whenever you need **`api/register.php`**, **`api/leaderboard.php`**, **`api/save_score.php`**, or **`api/feedback.php`**.

Static-only example (`npx serve web`) is fine for quick UI checks; **PHP APIs will not run**, so the live leaderboard and server-side registration sync will fail or return non-JSON responses.

## Key files

| Path | Role |
|------|------|
| `index.html` | Shell: auth form, game area, modals (how-to, leaderboard, feedback, profile) |
| `js/firebase-config.js` | Firebase SDK initialization |
| `js/auth.js` | `login`, `signUp`, `logout`, Google/phone helpers |
| `js/login-app.js` | Auth UI, game loop, profile/leaderboard/daily challenge |
| `api/schema.sql` | MySQL `users`, `leaderboard`, `feedback` |
| `api/register.php` | Upsert Firebase user into MySQL |
| `api/leaderboard.php` | JSON: top players by best score (registered users) |
| `api/save_score.php` | POST `user_id` + `score` after a completed game |
| `api/db.local.example.php` | Template for **`db.local.php`** (local DB credentials) |
