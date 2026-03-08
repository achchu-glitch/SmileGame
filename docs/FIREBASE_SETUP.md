# Firebase Authentication – Enable sign-in methods

Your app uses project **smilegame-f0d54**. To remove the error *"This sign-in method is not enabled"*, enable the sign-in methods in Firebase Console.

## Direct link (open this first)

**[Open Firebase Console → Sign-in method (smilegame-f0d54)](https://console.firebase.google.com/project/smilegame-f0d54/authentication/providers)**

---

## Step-by-step

### 1. Open your project

1. Go to **[Firebase Console](https://console.firebase.google.com/)** and sign in.
2. Click the project **SmileGame** (or **smilegame-f0d54**).
3. In the left sidebar, click **Build** → **Authentication**.

### 2. Open Sign-in method

1. Click the **Sign-in method** tab at the top.
2. You will see a list: **Email/Password**, **Phone**, **Google**, etc., each with a **Status** (Enabled / Disabled).

### 3. Enable Email/Password

1. Click the row **Email/Password**.
2. Turn **Enable** **ON** (toggle at the top).
3. (Optional) Turn **Email link** ON if you want passwordless sign-in.
4. Click **Save**.

### 4. Enable Google (for “Continue with Google”)

1. Click the row **Google**.
2. Turn **Enable** **ON**.
3. Choose a **Project support email** (e.g. your Gmail).
4. Click **Save**.

### 5. Enable Phone (for “Continue with Phone”)

1. Click the row **Phone**.
2. Turn **Enable** **ON**.
3. (Optional) Add **test phone numbers** so you can test without sending real SMS (Firebase allows 10 free SMS/day on Spark plan):
   - In the Phone provider screen, scroll to **Phone numbers for testing**.
   - Click **Add phone number**.
   - Enter a number (e.g. `+94 712 345 678`) and a **verification code** (e.g. `123456`).
   - Save. When you use that number in the app, Firebase will accept the code you set instead of sending SMS.
4. Click **Save**.

### 6. Authorized domains (important)

1. In Authentication, click the **Settings** tab.
2. Open **Authorized domains**.
3. Ensure **localhost** is in the list (so `http://localhost:3000` etc. work).
4. For production, add your real domain (e.g. `yourapp.web.app`).

---

## Your Firebase config (already in the app)

The app already uses this config in `js/firebase-config.js`:

- **Project ID:** smilegame-f0d54  
- **Auth domain:** smilegame-f0d54.firebaseapp.com  

No code change is needed; only the Console settings above.

---

## After enabling

1. Wait a few seconds (settings apply quickly).
2. Refresh your login page (e.g. `http://localhost:3000`).
3. Try **Login** / **Create an account** (Email/Password), **Continue with Google**, or **Continue with Phone**.

If you still see the error, do a **hard refresh** (Ctrl+Shift+R) or try in an **incognito** window.
