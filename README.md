# SmileGame

SmileGame is a browser-based puzzle game with **Firebase Authentication** and an optional **PHP + MySQL** backend for profiles, feedback, and a **live leaderboard** of registered players.

## Features

- **Sign-in:** Email/password, Google, and phone verification (Firebase).
- **Gameplay:** Timed rounds, streaks, levels (easy / medium / hard), relax mode, optional daily challenge.
- **Profile:** Display name, avatar, local stats; sync to MySQL when the API is available.
- **Leaderboard:** Top scores from the database (registered users only), auto-refresh while the modal is open.
- **Achievements** and in-game audio feedback.
- **Java desktop client** (legacy): same puzzle idea with `LoginFrame` / `GameGUI`.

## Tech stack

| Area | Stack |
|------|--------|
| Web UI | HTML, CSS, JavaScript (ES modules) |
| Auth | Firebase Authentication |
| Game server (optional) | PHP 8+, MySQL 5.7+ / 8+ |
| Desktop | Java (`src/com/perisic/smile/`) |

## Quick start (web, full stack)

Clone or download the project, then open a terminal in the **repository root** (the folder that contains `web/` and `package.json`):

```bash
npm start
```

Open **http://localhost:3000** (or the host/port your terminal prints). The dev server uses PHP’s built-in server with `web/` as the document root so **`/api/*.php`** routes work.

1. Enable Firebase sign-in methods for your project (see **docs/FIREBASE_SETUP.md**).
2. Sign in or create an account.
3. Play a full game to completion; if your user is linked to MySQL (`register.php` / profile sync), your score is stored for the leaderboard.

## MySQL setup (leaderboard, registration, feedback)

1. Create the database and tables (phpMyAdmin or CLI):

   ```bash
   mysql -u root -p < web/api/schema.sql
   ```

2. Configure credentials. Copy **`web/api/db.local.example.php`** to **`web/api/db.local.php`** and edit host, port, database name, user, and password. `db.local.php` is gitignored.

3. Check connectivity: open **`http://localhost:3000/api/health.php`** after `npm start`.

Without MySQL, the game still runs; API-backed features will show errors or empty data where documented in the UI.

## npm scripts

| Script | Purpose |
|--------|---------|
| `npm start` | PHP server on **0.0.0.0:3000**, docroot **`web/`** — use this for APIs and leaderboard. |
| `npm run start:php` | Same as above on port **8080**. |
| `npm run start:static` | Static files only (`serve`). **No PHP:** MySQL registration, scores, leaderboard, and feedback **will not work**. |

The app must be loaded over **http://** or **https://** (not `file://`), because ES modules and Firebase expect a real origin.

## Java desktop app

- Open the project in **IntelliJ** or **Eclipse**.
- Mark **`src`** as **Sources Root** and **`assets`** as **Resources Root** so puzzle images resolve.
- Run **`LoginFrame`** (with login) or **`GameGUI`** (game only) under `com.perisic.smile`.

## Repository layout

```
SmileGame-main/
├── README.md
├── package.json
├── index.html                 # Redirects into the web app
├── docs/
│   ├── README.md
│   └── FIREBASE_SETUP.md      # Firebase Console sign-in steps
├── src/                       # Java desktop sources
│   └── com/perisic/smile/
│       ├── engine/
│       ├── auth/
│       └── gui/
├── assets/                    # Images for the Java app
└── web/                       # Primary web app
    ├── index.html
    ├── assets/
    ├── js/                    # auth.js, firebase-config.js, login-app.js, …
    └── api/                   # PHP + MySQL
        ├── schema.sql
        ├── db.php
        ├── db.local.example.php
        ├── register.php
        ├── login.php
        ├── leaderboard.php    # JSON top players
        ├── save_score.php     # POST game score (MySQL user id)
        ├── feedback.php
        └── health.php
```

## Documentation

- **docs/FIREBASE_SETUP.md** — Enable Email/Password, Google, and Phone in Firebase.
- **docs/README.md** — Index of documentation files.

## Author

Archaga A
