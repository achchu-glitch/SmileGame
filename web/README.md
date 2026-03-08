# Smile Game – Web Login (Firebase Auth)

This folder contains a web login page that uses **Firebase Authentication** with your project **smilegame-f0d54**.

## Setup

1. **Enable sign-in methods in Firebase (required)**  
   If you see *"This sign-in method is not enabled"*, you must enable the providers in Firebase Console:
   - **Direct link:** [Open Sign-in method (smilegame-f0d54)](https://console.firebase.google.com/project/smilegame-f0d54/authentication/providers)
   - Enable **Email/Password**, **Google**, and **Phone** (turn **Enable** ON and click **Save** for each).
   - **Full steps:** see **[FIREBASE_SETUP.md](./FIREBASE_SETUP.md)** in this folder.

2. **Serve the page over HTTP**
   - ES modules and Firebase require a real origin (no `file://`). From the project root you can run:
   - **Node:** `npx serve web` or `npx http-server web -p 8080`
   - **Python 3:** `python -m http.server 8080` (run from inside `web`)

3. Open in the browser, e.g. `http://localhost:8080` (or the port shown).

## Usage

- **Login:** Enter email and password, or use “Create an account” to register.
- **Continue with Google:** Click to sign in with a Google account (popup).
- **Continue with Phone:** Click, enter phone number (e.g. +1234567890), click “Send verification code”, then enter the SMS code and “Verify and sign in”.
- **Log out:** Use the “Sign out” button on the welcome screen.

## Files

- `index.html` – Login/sign-up form and post-login area
- `js/firebase-config.js` – Your Firebase config and Auth initialization
- `js/auth.js` – Wrappers for `login`, `signUp`, `logout`, `onAuthChange`
- `js/login-app.js` – Form handling and auth state UI
