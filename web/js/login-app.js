import { login, signUp, onAuthChange, logout, loginWithGoogle, sendPhoneVerificationCode, verifyPhoneCode, updateDisplayName } from "./auth.js";

const form = document.getElementById("auth-form");
const emailInput = document.getElementById("email");
const passwordInput = document.getElementById("password");
const submitBtn = document.getElementById("submit-btn");
const formMessage = document.getElementById("form-message");
const toggleModeLink = document.getElementById("toggle-mode");
const loginFormEl = document.getElementById("login-form");
const gameAreaEl = document.getElementById("game-area");
const userEmailEl = document.getElementById("user-email");
const logoutBtn = document.getElementById("logout-btn");
const googleBtn = document.getElementById("google-btn");
const phoneBtn = document.getElementById("phone-btn");
const phoneAuthSection = document.getElementById("phone-auth-section");
const phoneInput = document.getElementById("phone");
const sendCodeBtn = document.getElementById("send-code-btn");
const phoneCodeSection = document.getElementById("phone-code-section");
const phoneCodeInput = document.getElementById("phone-code");
const verifyCodeBtn = document.getElementById("verify-code-btn");
const phoneCancelBtn = document.getElementById("phone-cancel-btn");
const recaptchaPhoneContainer = document.getElementById("recaptcha-phone-container");
const socialSigninSection = document.getElementById("social-signin-section");
const signupNameWrap = document.getElementById("signup-name-wrap");
const displayNameSignupInput = document.getElementById("display-name-signup");
const profileBtn = document.getElementById("profile-btn");
const profileSettings = document.getElementById("profile-settings");
const profileDisplayNameInput = document.getElementById("profile-display-name");
const profileSaveBtn = document.getElementById("profile-save-btn");
const profileCancelBtn = document.getElementById("profile-cancel-btn");
const welcomeHeading = document.getElementById("welcome-heading");
const gameImageWrap = document.getElementById("game-image-wrap");
const gameImage = document.getElementById("game-image");
const gameImagePlaceholder = document.getElementById("game-image-placeholder");
const gameScoreEl = document.getElementById("game-score");
const gameFeedbackEl = document.getElementById("game-feedback");
const gameButtonsEl = document.getElementById("game-buttons");

const FEEDBACK_AUTO_HIDE_MS = 2000;

if (!form || !submitBtn || !loginFormEl || !gameAreaEl) {
  document.body.innerHTML = "<div style='font-family: system-ui; max-width: 420px; margin: 2rem auto; padding: 1.5rem; background: #1e293b; color: #e2e8f0; border-radius: 8px;'>" +
    "<h2 style='margin-top: 0;'>Page could not load</h2>" +
    "<p>Run a local server from the project folder: <code>npx serve web</code></p>" +
    "<p>Then open <strong>http://localhost:3000</strong></p>" +
    "</div>";
  throw new Error("Smile Game: required DOM elements not found");
}

let isSignUp = false;
let phoneConfirmationResult = null;
let currentUser = null;

/** Firebase Console link for this project (Authentication → Sign-in method) */
const FIREBASE_AUTH_CONSOLE_URL = "https://console.firebase.google.com/project/smilegame-f0d54/authentication/providers";

/**
 * Map Firebase Auth error codes to user-friendly messages.
 * @param {string} code - Firebase error code (e.g. auth/invalid-credential)
 * @returns {string}
 */
function getAuthErrorMessage(code) {
  const messages = {
    "auth/invalid-credential": "Invalid email or password.",
    "auth/user-not-found": "No account found with this email.",
    "auth/wrong-password": "Invalid email or password.",
    "auth/invalid-email": "Please enter a valid email address.",
    "auth/email-already-in-use": "This email is already registered. Try logging in.",
    "auth/weak-password": "Password should be at least 6 characters.",
    "auth/too-many-requests": "Too many attempts. Please try again later.",
    "auth/network-request-failed": "Network error. Check your connection and try again.",
    "auth/operation-not-allowed": "This sign-in method is not enabled. Enable it in Firebase Console (Authentication → Sign-in method).",
    "auth/popup-blocked": "Sign-in popup was blocked. Allow popups for this site and try again.",
    "auth/popup-closed-by-user": "Sign-in was cancelled.",
    "auth/cancelled-popup-request": "Sign-in was cancelled.",
    "auth/invalid-phone-number": "Use a valid phone number with country code (e.g. +1 2345678900 or +91 9876543210).",
    "auth/invalid-verification-code": "Invalid or expired code. Try again.",
    "auth/captcha-check-failed": "Verification failed. Reload the page and try again.",
    "auth/quota-exceeded": "SMS limit reached. Try again later or add billing in Firebase Console.",
    "auth/missing-phone-number": "Please enter your phone number.",
    "auth/unauthorized-domain": "This domain is not allowed. Add it in Firebase Console → Authentication → Settings → Authorized domains.",
    "auth/requires-recent-login": "Please sign out and sign in again to continue.",
    "auth/account-exists-with-different-credential": "An account already exists with the same email but a different sign-in method.",
    "auth/credential-already-in-use": "This credential is already linked to another account.",
    "auth/argument-error": "Invalid input. Check your email and password.",
    "auth/internal-error": "A server error occurred. Please try again later.",
  };
  return messages[code] || (code ? `Sign-in failed: ${code}` : null);
}

function showMessage(text, isError = true) {
  formMessage.innerHTML = "";
  formMessage.textContent = text;
  formMessage.className = isError ? "error" : "success";
  formMessage.style.display = text ? "block" : "none";
  if (text) formMessage.setAttribute("role", "alert");
}

/** Show error with a link to Firebase Console (for operation-not-allowed, unauthorized-domain) */
function showMessageWithConsoleLink(message) {
  formMessage.innerHTML = `${message} <a href="${FIREBASE_AUTH_CONSOLE_URL}" target="_blank" rel="noopener" style="color: inherit; text-decoration: underline;">Open Firebase Console →</a>`;
  formMessage.className = "error";
  formMessage.style.display = "block";
  formMessage.setAttribute("role", "alert");
}

function setLoading(loading) {
  submitBtn.disabled = loading;
  submitBtn.textContent = loading ? "Please wait…" : (isSignUp ? "Create account" : "Login");
}

/**
 * Handle form submit: Firebase sign-in or sign-up depending on mode.
 */
form.addEventListener("submit", async (e) => {
  e.preventDefault();
  const email = emailInput.value.trim();
  const password = passwordInput.value;

  if (!email || !password) {
    showMessage("Please fill in email and password.");
    return;
  }

  showMessage("");
  setLoading(true);

  try {
    if (isSignUp) {
      const cred = await signUp(email, password);
      const name = displayNameSignupInput && displayNameSignupInput.value.trim();
      if (name) await updateDisplayName(cred.user, name);
      showMessage("Account created. You are now logged in.", false);
    } else {
      await login(email, password);
      // onAuthStateChanged will show game area
    }
  } catch (err) {
    console.error("Firebase auth error:", err.code, err.message, err);
    const code = err.code || "";
    const message = getAuthErrorMessage(code) || err.message || "An error occurred. Please try again.";
    if (code === "auth/operation-not-allowed" || code === "auth/unauthorized-domain") {
      showMessageWithConsoleLink(message);
    } else {
      showMessage(message);
    }
  } finally {
    setLoading(false);
  }
});

/**
 * Toggle between Login and Create account.
 */
toggleModeLink.addEventListener("click", (e) => {
  e.preventDefault();
  isSignUp = !isSignUp;
  submitBtn.textContent = isSignUp ? "Create account" : "Login";
  toggleModeLink.textContent = isSignUp ? "Already have an account? Login" : "Create an account";
  if (socialSigninSection) {
    if (isSignUp) socialSigninSection.classList.add("hidden");
    else socialSigninSection.classList.remove("hidden");
  }
  if (signupNameWrap) {
    if (isSignUp) signupNameWrap.classList.remove("hidden");
    else {
      signupNameWrap.classList.add("hidden");
      if (displayNameSignupInput) displayNameSignupInput.value = "";
    }
  }
  if (isSignUp) {
    phoneAuthSection.classList.add("hidden");
    recaptchaPhoneContainer.innerHTML = "";
  }
  showMessage("");
});

/**
 * Smile game state (matches Java GameEngine: two images, correct answer is 1).
 */
let gameCounter = 0;
let gameScore = 0;
const GAME_IMAGES = ["assets/smile1.png", "assets/smile2.png"];
const CORRECT_ANSWER = 1;

function getGameImageUrl(name) {
  try {
    return new URL(name, window.location.href).href;
  } catch {
    return name;
  }
}

function nextGame() {
  const idx = gameCounter % GAME_IMAGES.length;
  gameCounter += 1;
  const src = getGameImageUrl(GAME_IMAGES[idx]);
  if (gameImage) {
    gameImage.onload = () => {
      gameImage.style.display = "";
      if (gameImagePlaceholder) gameImagePlaceholder.classList.add("hidden");
    };
    gameImage.onerror = () => {
      gameImage.style.display = "none";
      if (gameImagePlaceholder) {
        gameImagePlaceholder.textContent = "?";
        gameImagePlaceholder.classList.remove("hidden");
      }
    };
    gameImage.src = src;
    gameImage.style.display = "none";
    if (gameImagePlaceholder) gameImagePlaceholder.classList.add("hidden");
  }
  if (gameFeedbackEl) {
    gameFeedbackEl.textContent = "";
    gameFeedbackEl.style.display = "none";
    clearTimeout(gameFeedbackEl._hideTimer);
  }
  return idx;
}

function checkSolution(answered) {
  const correct = answered === CORRECT_ANSWER;
  if (correct) gameScore += 1;
  if (gameScoreEl) {
    gameScoreEl.textContent = "Score: " + gameScore;
    if (correct) {
      gameScoreEl.classList.add("score-bump");
      setTimeout(() => gameScoreEl.classList.remove("score-bump"), 350);
    }
  }
  if (gameFeedbackEl) {
    gameFeedbackEl.textContent = correct ? "✅ Correct!" : "❌ Try again";
    gameFeedbackEl.className = correct ? "correct" : "wrong";
    gameFeedbackEl.style.display = "block";
    clearTimeout(gameFeedbackEl._hideTimer);
    gameFeedbackEl._hideTimer = setTimeout(() => {
      gameFeedbackEl.textContent = "";
      gameFeedbackEl.style.display = "none";
    }, FEEDBACK_AUTO_HIDE_MS);
  }
  if (correct && gameImageWrap) {
    gameImageWrap.classList.add("puzzle-correct-flash");
    setTimeout(() => gameImageWrap.classList.remove("puzzle-correct-flash"), 500);
  }
  return correct;
}

function initGame() {
  gameCounter = 0;
  gameScore = 0;
  if (!gameButtonsEl) return;
  gameButtonsEl.innerHTML = "";
  for (let i = 0; i <= 9; i++) {
    const btn = document.createElement("button");
    btn.type = "button";
    btn.textContent = String(i);
    btn.addEventListener("click", () => {
      const correct = checkSolution(i);
      if (correct) nextGame();
    });
    gameButtonsEl.appendChild(btn);
  }
  nextGame();
  if (gameScoreEl) gameScoreEl.textContent = "Score: 0";
}

/**
 * Auth state: show login form or game area and current user email.
 */
onAuthChange((user) => {
  currentUser = user;
  if (user) {
    loginFormEl.classList.add("hidden");
    gameAreaEl.classList.add("visible");
    const displayLabel = user.displayName || user.email || user.phoneNumber || user.uid;
    userEmailEl.textContent = displayLabel;
    if (welcomeHeading) {
      welcomeHeading.textContent = user.displayName ? `Welcome back, ${user.displayName}!` : "Welcome back!";
    }
    if (profileSettings) profileSettings.classList.add("hidden");
    initGame();
  } else {
    loginFormEl.classList.remove("hidden");
    gameAreaEl.classList.remove("visible");
  }
});

/** Continue with Google */
googleBtn.addEventListener("click", async () => {
  showMessage("");
  googleBtn.disabled = true;
  try {
    await loginWithGoogle();
  } catch (err) {
    console.error("Google sign-in error:", err.code, err.message, err);
    const code = err.code || "";
    const message = getAuthErrorMessage(code) || err.message || "An error occurred. Please try again.";
    if (code === "auth/operation-not-allowed" || code === "auth/unauthorized-domain") {
      showMessageWithConsoleLink(message);
    } else {
      showMessage(message);
    }
  } finally {
    googleBtn.disabled = false;
  }
});

/** Show phone auth section */
phoneBtn.addEventListener("click", () => {
  phoneAuthSection.classList.remove("hidden");
  phoneInput.value = "";
  phoneCodeInput.value = "";
  phoneCodeSection.classList.add("hidden");
  phoneConfirmationResult = null;
  recaptchaPhoneContainer.innerHTML = "";
  showMessage("");
});

/** Cancel phone auth */
phoneCancelBtn.addEventListener("click", () => {
  phoneAuthSection.classList.add("hidden");
  recaptchaPhoneContainer.innerHTML = "";
  showMessage("");
});

/** Send phone verification code */
sendCodeBtn.addEventListener("click", async () => {
  const phone = phoneInput.value.trim().replace(/\s/g, "");
  if (!phone) {
    showMessage("Please enter your phone number (e.g. +1234567890).");
    return;
  }
  const normalized = phone.startsWith("+") ? phone : "+" + phone;
  showMessage("");
  sendCodeBtn.disabled = true;
  try {
    phoneConfirmationResult = await sendPhoneVerificationCode(recaptchaPhoneContainer, normalized);
    recaptchaPhoneContainer.innerHTML = "";
    phoneCodeSection.classList.remove("hidden");
    phoneCodeInput.value = "";
    phoneCodeInput.focus();
    showMessage("Code sent. Enter it above.", false);
  } catch (err) {
    console.error("Phone auth error:", err.code, err.message, err);
    const code = err.code || "";
    const message =
      getAuthErrorMessage(code) ||
      (err.message || "").trim() ||
      "Something went wrong. Use a phone number with country code (e.g. +1 2345678900).";
    if (code === "auth/operation-not-allowed" || code === "auth/unauthorized-domain") {
      showMessageWithConsoleLink(message);
    } else {
      showMessage(message);
    }
  } finally {
    sendCodeBtn.disabled = false;
  }
});

/** Verify phone code and sign in */
verifyCodeBtn.addEventListener("click", async () => {
  const code = phoneCodeInput.value.trim();
  if (!code || !phoneConfirmationResult) {
    showMessage("Enter the 6-digit code from the SMS.");
    return;
  }
  showMessage("");
  verifyCodeBtn.disabled = true;
  try {
    await verifyPhoneCode(phoneConfirmationResult, code);
    phoneAuthSection.classList.add("hidden");
    phoneConfirmationResult = null;
    recaptchaPhoneContainer.innerHTML = "";
  } catch (err) {
    console.error("Verify code error:", err.code, err.message, err);
    const errCode = err.code || "";
    const message = getAuthErrorMessage(errCode) || err.message || "Invalid or expired code. Try again.";
    if (errCode === "auth/operation-not-allowed" || errCode === "auth/unauthorized-domain") {
      showMessageWithConsoleLink(message);
    } else {
      showMessage(message);
    }
  } finally {
    verifyCodeBtn.disabled = false;
  }
});

if (profileBtn) {
  profileBtn.addEventListener("click", () => {
    if (profileSettings) {
      profileSettings.classList.remove("hidden");
      if (profileDisplayNameInput) profileDisplayNameInput.value = (currentUser && currentUser.displayName) || "";
    }
  });
}
if (profileCancelBtn) {
  profileCancelBtn.addEventListener("click", () => {
    if (profileSettings) profileSettings.classList.add("hidden");
  });
}
if (profileSaveBtn && profileDisplayNameInput) {
  profileSaveBtn.addEventListener("click", async () => {
    if (!currentUser) return;
    const name = profileDisplayNameInput.value.trim();
    try {
      await updateDisplayName(currentUser, name);
      currentUser.displayName = name || null;
      userEmailEl.textContent = name || currentUser.email || currentUser.phoneNumber || currentUser.uid;
      if (welcomeHeading) welcomeHeading.textContent = name ? `Welcome back, ${name}!` : "Welcome back!";
      if (profileSettings) profileSettings.classList.add("hidden");
    } catch (err) {
      console.error("Update name failed", err);
    }
  });
}

logoutBtn.addEventListener("click", async () => {
  showMessage("");
  try {
    await logout();
  } catch (err) {
    console.error("Logout failed", err);
    showMessage("Sign out failed. Please try again.");
  }
});
