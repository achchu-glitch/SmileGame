SmileGame 🎮

SmileGame is a simple interactive game developed using Java and Web technologies with Firebase authentication.

Features
- Firebase Login
- Interactive Smile Game
- Web Interface
- Simple Game Logic

Technologies
- Java
- JavaScript
- HTML/CSS
- Firebase

Project Structure
```
SmileGame-main/
├── README.md
├── .gitignore
├── index.html              # Redirects to web app
├── docs/                   # Documentation
│   ├── README.md
│   └── FIREBASE_SETUP.md
├── src/                    # Java source code
│   └── com/perisic/smile/
│       ├── engine/         # GameEngine
│       ├── auth/           # LoginFrame
│       └── gui/            # GameGUI
├── assets/                 # Game images for Java desktop app
│   ├── smile1.png
│   └── smile2.png
└── web/                    # Web interface (Firebase auth + game)
    ├── index.html
    ├── js/
    │   ├── auth.js
    │   ├── firebase-config.js
    │   └── login-app.js
    └── assets/             # Game images (copy for web)
        ├── smile1.png
        └── smile2.png
```

Installation

**1. Clone the repository**
```bash
git clone https://github.com/achchu-glitch/SmileGame.git
cd SmileGame
```

**2. Java desktop app (IntelliJ / Eclipse)**  
- Open the project and set **`src`** as the **Sources Root**.  
- Set **`assets`** as the **Resources Root** (IntelliJ: right‑click `assets` → Mark Directory as → Resources Root) so the game finds the puzzle images.  
- Run **`LoginFrame`** (with login) or **`GameGUI`** (game only) from the `gui` or `auth` package.

**3. Web app (recommended)**  
From the project folder (the one that contains `web` and `package.json`):
```bash
npm start
```
Then open **http://localhost:3000** in your browser. Sign in with email or Google, then play the puzzle game.

Alternatively, run `npx serve web` and open the URL shown (e.g. http://localhost:3000).  
**Note:** The app must be served over HTTP (not opened as a file). If you see 404, run the server from the project folder and use the URL it prints.

Author
Archaga A
