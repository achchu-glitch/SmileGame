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
│       └── gui/             # GameGUI
└── web/                    # Web interface (Firebase auth + game)
    ├── index.html
    ├── js/
    │   ├── auth.js
    │   ├── firebase-config.js
    │   └── login-app.js
    └── assets/              # Game images (smile1.png, smile2.png)
        ├── smile1.png
        └── smile2.png
```

Installation

Clone the repository

```bash
git clone https://github.com/achchu-glitch/SmileGame.git
```

Open in IntelliJ or Eclipse and run the project.

**Java desktop app:** In your IDE, mark **`web`** as a **Resources Root** (IntelliJ: right‑click `web` → Mark Directory as → Resources Root) so the game can load the puzzle images from `web/assets/`.

Author
Archaga A
