import { login, signUp, onAuthChange, logout, loginWithGoogle, sendPhoneVerificationCode, verifyPhoneCode, updateDisplayName } from "./auth.js";

if (window.location.protocol === "file:") {
  document.body.innerHTML = "<div style='font-family: system-ui; max-width: 420px; margin: 2rem auto; padding: 1.5rem; background: #1e293b; color: #e2e8f0; border-radius: 8px;'>" +
    "<h2 style='margin-top: 0;'>This page must be served over HTTP</h2>" +
    "<p>From the project folder run: <code>npm start</code> or <code>npx serve SmileGame-main/web</code></p>" +
    "<p>Then open the exact Local URL shown in the terminal.</p>" +
    "</div>";
  throw new Error("Smile Game: serve over HTTP");
}

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
const profileDisplayNameInput = document.getElementById("profile-display-name");
const profileSaveBtn = document.getElementById("profile-save-btn");
const profilePage = document.getElementById("profile-page");
const profileAvatarBtn = document.getElementById("profile-avatar-btn");
const profileBackBtn = document.getElementById("profile-back-btn");
const profileAvatarDisplay = document.getElementById("profile-avatar-display");
const profileAvatarLarge = document.getElementById("profile-avatar-large");
const profileAvatarGrid = document.getElementById("profile-avatar-grid");
const profileStatGames = document.getElementById("profile-stat-games");
const profileStatBest = document.getElementById("profile-stat-best");
const profileStatStreak = document.getElementById("profile-stat-streak");
const profileLogoutBtn = document.getElementById("profile-logout-btn");
const gameContentInner = document.querySelector(".game-content-inner");
const gameTopBar = document.querySelector(".game-top-bar");
const gameAreaFooter = document.querySelector(".game-area-footer");
const welcomeHeading = document.getElementById("welcome-heading");
const gameQuestionEl = document.querySelector(".game-question");
const gameImageWrap = document.getElementById("game-image-wrap");
const gameImage = document.getElementById("game-image");
const gameImagePlaceholder = document.getElementById("game-image-placeholder");
const gameEquationEl = document.getElementById("game-equation-text");
const gameRoundEl = document.getElementById("game-round");
const gameTimerEl = document.getElementById("game-timer");
const gameScoreEl = document.getElementById("game-score");
const gameComboEl = document.getElementById("game-combo");
const streakCurrentEl = document.getElementById("streak-current-value");
const streakBestEl = document.getElementById("streak-best-value");
const streakRoundEl = document.getElementById("streak-round-value");
const streakCardCurrentEl = document.getElementById("streak-card-current");
const extraTimeBtn = document.getElementById("extra-time-btn");
const gameAchievementsEl = document.getElementById("game-achievements");
const gameLevelSelectEl = document.getElementById("game-level-select");
const gameLevelBadgeEl = document.getElementById("game-level-badge");
const gameFeedbackEl = document.getElementById("game-feedback");
const gameButtonsEl = document.getElementById("game-buttons");
const restartBtn = document.getElementById("restart-btn");

const FEEDBACK_AUTO_HIDE_MS = 2000;

if (!form || !submitBtn || !loginFormEl || !gameAreaEl) {
  document.body.innerHTML = "<div style='font-family: system-ui; max-width: 420px; margin: 2rem auto; padding: 1.5rem; background: #1e293b; color: #e2e8f0; border-radius: 8px;'>" +
    "<h2 style='margin-top: 0;'>Page could not load</h2>" +
    "<p>Run a local server from the project folder: <code>npm start</code> or <code>npx serve SmileGame-main/web</code></p>" +
    "<p>Then open the Local URL shown in terminal.</p>" +
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
let roundNumber = 1;
let remainingSeconds = 0;
let timerId = null;
let gameOver = false;
let isLoadingPuzzle = false;
let currentCorrectAnswer = 1;
let consecutiveCorrect = 0;
let extraTimeUsedThisGame = 0;
let maxComboReachedThisGame = 0;
let bestStreakThisGame = 0;
let totalTimeBonusThisGame = 0;
let lastRoundSecondsLeft = 0;
let sessionBestScore = 0;
const GAME_IMAGES = ["assets/smile1.png", "assets/smile2.png"];
const PUZZLE_ANSWERS = [1, 1];

/** Easy: simple addition/subtraction. Answer is single digit 0–9. */
const EASY_EQUATIONS = [
  { eq: "1 + ? = 3", answer: 2 }, { eq: "? + 2 = 5", answer: 3 }, { eq: "4 + ? = 7", answer: 3 },
  { eq: "9 - ? = 2", answer: 7 }, { eq: "? - 1 = 4", answer: 5 }, { eq: "6 - 3 = ?", answer: 3 },
  { eq: "0 + ? = 8", answer: 8 }, { eq: "? + 5 = 9", answer: 4 }, { eq: "7 - ? = 3", answer: 4 },
  { eq: "2 + ? = 6", answer: 4 }, { eq: "5 + ? = 9", answer: 4 }, { eq: "? - 2 = 6", answer: 8 },
  { eq: "8 - 5 = ?", answer: 3 }, { eq: "? + 1 = 7", answer: 6 }, { eq: "3 + 4 = ?", answer: 7 },
];

/** Hard: multiplication/division. Answer is single digit 0–9. */
const HARD_EQUATIONS = [
  { eq: "2 × ? = 6", answer: 3 }, { eq: "? × 3 = 9", answer: 3 }, { eq: "4 × ? = 8", answer: 2 },
  { eq: "? × 2 = 8", answer: 4 }, { eq: "9 ÷ 3 = ?", answer: 3 }, { eq: "8 ÷ ? = 4", answer: 2 },
  { eq: "6 ÷ 2 = ?", answer: 3 }, { eq: "? × 5 = 5", answer: 1 }, { eq: "3 × ? = 6", answer: 2 },
  { eq: "? × 4 = 12", answer: 3 }, { eq: "5 × ? = 10", answer: 2 }, { eq: "6 ÷ ? = 2", answer: 3 },
  { eq: "? × 2 = 6", answer: 3 }, { eq: "4 × ? = 4", answer: 1 }, { eq: "10 ÷ 2 = ?", answer: 5 },
];

const BANANA_API_URL = "http://marcconrad.com/uob/banana/api.php?out=json&base64=yes";
const SMILE_API_URL = "http://marcconrad.com/uob/smile/api.php?out=json&base64=yes";
const CORS_PROXY_PREFIX = "https://corsproxy.io/?";
const PUZZLE_QUOTES = [
  "Every puzzle is a door to a sharper mind.",
  "Small clues, big breakthroughs.",
  "Think slow, solve smart.",
  "Pattern first, answer next.",
  "Great minds play with possibilities.",
  "A calm mind finds hidden logic.",
  "One step at a time, one win at a time.",
  "Curiosity turns confusion into clarity.",
];
const TOTAL_ROUNDS = 10;
const ROUND_SECONDS = 60;
const NEXT_PUZZLE_DELAY_MS = 650;
const TIME_BONUS_PER_5_SEC = 1;
const COMBO_MAX = 3;
const EXTRA_TIME_SECONDS = 15;
const EXTRA_TIME_USES_PER_GAME = 1;

const LEVELS = {
  easy:   { name: "Easy",   seconds: 60, label: "Level 1" },
  medium: { name: "Medium", seconds: 45, label: "Level 2" },
  hard:   { name: "Hard",   seconds: 20, label: "Level 3" },
};

const PROFILE_AVATARS = ["😊", "🦊", "🐱", "🐶", "🦁", "🐸", "🦄", "🐵", "🐻", "🦋", "🐰", "🐼", "🦝", "🐨", "🦉", "🐯"];
const STORAGE_KEYS = { avatar: "smilegame_avatar", gamesPlayed: "smilegame_games", bestScore: "smilegame_best", bestStreak: "smilegame_streak" };

function getStoredAvatar() {
  try {
    const v = localStorage.getItem(STORAGE_KEYS.avatar);
    return PROFILE_AVATARS.includes(v) ? v : PROFILE_AVATARS[0];
  } catch (_) { return PROFILE_AVATARS[0]; }
}
function setStoredAvatar(emoji) {
  try { localStorage.setItem(STORAGE_KEYS.avatar, emoji); } catch (_) {}
}
function getProfileStats() {
  try {
    return {
      games: Math.max(0, parseInt(localStorage.getItem(STORAGE_KEYS.gamesPlayed) || "0", 10)),
      best: Math.max(0, parseInt(localStorage.getItem(STORAGE_KEYS.bestScore) || "0", 10)),
      streak: Math.max(0, parseInt(localStorage.getItem(STORAGE_KEYS.bestStreak) || "0", 10)),
    };
  } catch (_) { return { games: 0, best: 0, streak: 0 }; }
}
function saveProfileStatsAfterGame(score, bestStreakThisGame) {
  try {
    const games = getProfileStats().games + 1;
    const best = Math.max(getProfileStats().best, score);
    const streak = Math.max(getProfileStats().streak, bestStreakThisGame);
    localStorage.setItem(STORAGE_KEYS.gamesPlayed, String(games));
    localStorage.setItem(STORAGE_KEYS.bestScore, String(best));
    localStorage.setItem(STORAGE_KEYS.bestStreak, String(streak));
  } catch (_) {}
}
let currentLevel = "easy";
let roundSecondsForCurrentGame = LEVELS.easy.seconds;
let relaxMode = false;

function getGameImageUrl(name) {
  try {
    return new URL(name, window.location.href).href;
  } catch {
    return name;
  }
}

function getEquationPuzzleForLevel(level) {
  if (level === "easy") {
    const list = EASY_EQUATIONS;
    return list[Math.floor(Math.random() * list.length)];
  }
  if (level === "hard") {
    const list = HARD_EQUATIONS;
    return list[Math.floor(Math.random() * list.length)];
  }
  return null;
}

function showEquationPuzzle(eq, answer) {
  if (gameEquationEl) {
    const display = eq.replace("?", "<span class=\"equation-blank\">?</span>");
    gameEquationEl.innerHTML = display;
    gameEquationEl.classList.remove("hidden");
  }
  if (gameImage) gameImage.style.display = "none";
  if (gameImagePlaceholder) gameImagePlaceholder.classList.add("hidden");
}

function hideEquationPuzzle() {
  if (gameEquationEl) gameEquationEl.classList.add("hidden");
  if (gameEquationEl) gameEquationEl.textContent = "";
}

async function fetchWithUrl(url) {
  const res = await fetch(url, { cache: "no-store" });
  if (!res.ok) throw new Error(`Puzzle API failed: ${res.status}`);
  return res.json();
}

function parsePuzzleData(data) {
  const answer = Number(data.solution);
  if (!Number.isInteger(answer) || answer < 0 || answer > 9) {
    throw new Error("Puzzle API returned invalid solution");
  }
  const raw = String(data.question || "").trim();
  if (!raw) throw new Error("Puzzle API returned empty puzzle image");
  let imageSrc =
    raw.startsWith("http://") ||
    raw.startsWith("https://") ||
    raw.startsWith("data:image/")
      ? raw
      : `data:image/png;base64,${raw.replace(/\s/g, "")}`;
  if (!isValidImageSrc(imageSrc)) throw new Error("Puzzle image data invalid");
  return { imageSrc, answer };
}

function isValidImageSrc(src) {
  if (!src || typeof src !== "string") return false;
  if (src.startsWith("http://") || src.startsWith("https://")) return true;
  if (src.startsWith("data:image/")) {
    const base64 = src.indexOf(",") >= 0 ? src.slice(src.indexOf(",") + 1) : "";
    return base64.length > 100 && /^[A-Za-z0-9+/=]+$/.test(base64.replace(/\s/g, ""));
  }
  return false;
}

function getApiUrlWithCacheBuster(baseUrl) {
  const sep = baseUrl.includes("?") ? "&" : "?";
  return baseUrl + sep + "_=" + Date.now() + "&r=" + Math.random().toString(36).slice(2);
}

async function fetchPuzzleFromUrl(baseUrl) {
  const url = getApiUrlWithCacheBuster(baseUrl);
  try {
    const data = await fetchWithUrl(url);
    return parsePuzzleData(data);
  } catch (directErr) {
    const proxyUrl = CORS_PROXY_PREFIX + encodeURIComponent(url);
    const data = await fetchWithUrl(proxyUrl);
    return parsePuzzleData(data);
  }
}

async function fetchPuzzleFromApi() {
  return fetchPuzzleFromUrl(BANANA_API_URL);
}

async function fetchSmilePuzzleFromApi() {
  return fetchPuzzleFromUrl(SMILE_API_URL);
}

function setButtonsDisabled(disabled) {
  if (!gameButtonsEl) return;
  const buttons = gameButtonsEl.querySelectorAll("button");
  buttons.forEach((b) => (b.disabled = disabled));
}

function updateMeta() {
  if (gameLevelBadgeEl) gameLevelBadgeEl.textContent = LEVELS[currentLevel] ? LEVELS[currentLevel].label : "Level 2";
  if (gameRoundEl) gameRoundEl.textContent = `Round: ${roundNumber}/${TOTAL_ROUNDS}`;
  const timerEl = document.getElementById("game-timer");
  if (timerEl) timerEl.textContent = relaxMode ? "Time: —" : `Time: ${remainingSeconds}s`;
  if (relaxMode && extraTimeBtn) extraTimeBtn.classList.add("hidden");
  if (gameComboEl) {
    if (consecutiveCorrect >= 2) {
      gameComboEl.textContent = `${Math.min(consecutiveCorrect, COMBO_MAX)}x`;
      gameComboEl.classList.remove("hidden");
    } else {
      gameComboEl.classList.add("hidden");
    }
  }
  if (streakCurrentEl) streakCurrentEl.textContent = String(consecutiveCorrect);
  if (streakBestEl) streakBestEl.textContent = String(bestStreakThisGame);
  if (streakRoundEl) streakRoundEl.textContent = `${roundNumber}/${TOTAL_ROUNDS}`;
  if (streakCardCurrentEl) {
    if (consecutiveCorrect >= 2) streakCardCurrentEl.classList.add("streak-card-hot");
    else streakCardCurrentEl.classList.remove("streak-card-hot");
  }
  const roundProgress = document.getElementById("round-progress");
  if (roundProgress) {
    roundProgress.querySelectorAll(".round-dot").forEach((dot) => {
      const r = parseInt(dot.getAttribute("data-round"), 10);
      dot.classList.toggle("filled", r < roundNumber);
      dot.classList.toggle("current", r === roundNumber);
    });
  }
}

function setLevelButtonsEnabled(enabled) {
  if (gameLevelSelectEl) {
    gameLevelSelectEl.querySelectorAll(".level-btn").forEach((btn) => {
      btn.disabled = !enabled;
    });
  }
  if (gameLevelBadgeEl) gameLevelBadgeEl.disabled = !enabled;
}

function stopTimer() {
  if (timerId) clearInterval(timerId);
  timerId = null;
}

function startRoundTimer() {
  stopTimer();
  if (relaxMode) {
    remainingSeconds = 0;
    updateMeta();
    return;
  }
  remainingSeconds = roundSecondsForCurrentGame ?? 60;
  updateMeta();
  timerId = setInterval(() => {
    if (gameOver) return;
    remainingSeconds -= 1;
    updateMeta();
    if (remainingSeconds <= 0) {
      endGame("⏰ Time’s up!");
    }
  }, 1000);
}

function startWinSparkle() {
  const wrap = document.getElementById("win-sparkle-wrap");
  if (!wrap) return;
  wrap.innerHTML = "";
  const dim = document.createElement("div");
  dim.className = "win-game-dim";
  dim.setAttribute("aria-hidden", "true");
  wrap.appendChild(dim);
  const popup = document.createElement("div");
  popup.className = "win-congrats-popup";
  popup.setAttribute("aria-hidden", "true");
  const banner1 = document.createElement("div");
  banner1.className = "win-banner win-banner-congrats";
  banner1.textContent = "Congratulations!";
  popup.appendChild(banner1);
  const banner2 = document.createElement("div");
  banner2.className = "win-banner win-banner-gifts";
  banner2.textContent = "You get gifts";
  popup.appendChild(banner2);
  const giftWrap = document.createElement("div");
  giftWrap.className = "win-gift-wrap";
  const rays = document.createElement("div");
  rays.className = "win-gift-rays";
  for (let r = 0; r < 12; r++) {
    const ray = document.createElement("div");
    ray.className = "win-gift-ray";
    rays.appendChild(ray);
  }
  giftWrap.appendChild(rays);
  for (let s = 0; s < 14; s++) {
    const spark = document.createElement("div");
    spark.className = "win-gift-sparkle";
    const angle = (s / 14) * Math.PI * 2 + Math.random() * 0.4;
    const r = 28 + Math.random() * 12;
    spark.style.left = (50 + Math.cos(angle) * r) + "%";
    spark.style.top = (50 + Math.sin(angle) * r) + "%";
    spark.style.marginLeft = "-4px";
    spark.style.marginTop = "-4px";
    spark.style.animationDelay = (Math.random() * 1.2) + "s";
    giftWrap.appendChild(spark);
  }
  const uid = "g" + Date.now();
  const giftBox = document.createElement("span");
  giftBox.className = "win-gift-box";
  giftBox.innerHTML = `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
    <defs>
      <linearGradient id="${uid}-pink" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" style="stop-color:#ff8fa3"/>
        <stop offset="100%" style="stop-color:#e91e63"/>
      </linearGradient>
      <linearGradient id="${uid}-orange" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" style="stop-color:#ffb74d"/>
        <stop offset="100%" style="stop-color:#f57c00"/>
      </linearGradient>
    </defs>
    <rect x="22" y="42" width="56" height="40" rx="3" fill="url(#${uid}-pink)"/>
    <rect x="22" y="28" width="56" height="18" rx="2" fill="url(#${uid}-pink)"/>
    <rect x="46" y="28" width="8" height="54" fill="url(#${uid}-orange)"/>
    <ellipse cx="50" cy="26" rx="16" ry="10" fill="url(#${uid}-orange)"/>
    <path d="M36 30 Q50 18 64 30" stroke="url(#${uid}-orange)" stroke-width="6" fill="none" stroke-linecap="round"/>
    <rect x="26" y="46" width="48" height="5" rx="1" fill="url(#${uid}-orange)"/>
    <rect x="26" y="58" width="48" height="5" rx="1" fill="url(#${uid}-orange)"/>
  </svg>`;
  giftWrap.appendChild(giftBox);
  const prizeCard = document.createElement("div");
  prizeCard.className = "win-prize-card";
  prizeCard.innerHTML = `<span class="win-prize-icon">🏆</span><span class="win-prize-label">${gameScore} points</span>`;
  giftWrap.appendChild(prizeCard);
  popup.appendChild(giftWrap);
  wrap.appendChild(popup);
  const centerX = window.innerWidth / 2;
  const centerY = window.innerHeight / 2;
  const offset = 58;
  const sides = [
    { x: centerX - offset, y: centerY },
    { x: centerX + offset, y: centerY },
    { x: centerX, y: centerY + offset }
  ];
  const coinEmojis = ["💰", "🪙"];
  const coinCount = 28;
  const coinEls = [];
  for (let i = 0; i < coinCount; i++) {
    const c = coinEmojis[i % 2];
    const side = sides[i % 3];
    const el = document.createElement("span");
    el.className = "win-coin";
    el.textContent = c;
    el.setAttribute("aria-hidden", "true");
    el.style.left = side.x + "px";
    el.style.top = side.y + "px";
    wrap.appendChild(el);
    coinEls.push(el);
  }
  const sparkle = "✨";
  const count = 24;
  for (let i = 0; i < count; i++) {
    const el = document.createElement("span");
    el.className = "win-sparkle";
    el.textContent = sparkle;
    el.style.left = Math.random() * 100 + "%";
    el.style.top = Math.random() * 100 + "%";
    el.style.animationDelay = (Math.random() * 0.6) + "s";
    wrap.appendChild(el);
  }
  const flyToScore = () => {
    if (!gameScoreEl) return;
    const rect = gameScoreEl.getBoundingClientRect();
    const targetX = rect.left + rect.width / 2;
    const targetY = rect.top + rect.height / 2;
    coinEls.forEach((el, i) => {
      setTimeout(() => {
        el.classList.add("fly-to-score");
        el.style.left = targetX + "px";
        el.style.top = targetY + "px";
        el.addEventListener("transitionend", () => {
          el.style.opacity = "0";
          el.addEventListener("transitionend", () => el.remove(), { once: true });
        }, { once: true });
      }, i * 42);
    });
  };
  coinEls.forEach((el, i) => {
    setTimeout(() => el.classList.add("coin-visible"), 1100 + i * 45);
  });
  setTimeout(flyToScore, 1750);
  clearTimeout(wrap._sparkleTimer);
  wrap._sparkleTimer = setTimeout(() => { wrap.innerHTML = ""; }, 6000);
}

function endGame(message) {
  gameOver = true;
  stopTimer();
  setButtonsDisabled(true);
  setLevelButtonsEnabled(true);
  if (extraTimeBtn) {
    extraTimeBtn.classList.add("hidden");
  }
  const isWin = typeof message === "string" && message.includes("Finished");
  const achieved = getUnlockedAchievements();
  if (gameAchievementsEl && achieved.length > 0) {
    gameAchievementsEl.textContent = "🏆 " + achieved.join(" · ");
    gameAchievementsEl.classList.remove("hidden");
  }
  if (gameFeedbackEl) {
    gameFeedbackEl.textContent = message;
    gameFeedbackEl.className = isWin ? "correct" : "wrong";
    gameFeedbackEl.style.display = "block";
    clearTimeout(gameFeedbackEl._hideTimer);
  }
  if (isWin) {
    startWinSparkle();
    saveProfileStatsAfterGame(gameScore, bestStreakThisGame);
    sessionBestScore = Math.max(sessionBestScore, gameScore);
    const sessionBestEl = document.getElementById("session-best");
    if (sessionBestEl) sessionBestEl.textContent = String(sessionBestScore);
  }
  const achievementsPill = document.getElementById("achievements-pill");
  const achievementsCountEl = document.getElementById("achievements-count");
  if (achievementsPill && achievementsCountEl) {
    if (achieved.length > 0) {
      achievementsCountEl.textContent = String(achieved.length);
      achievementsPill.classList.remove("hidden");
    } else {
      achievementsPill.classList.add("hidden");
    }
  }
  if (restartBtn) restartBtn.classList.remove("hidden");
}

async function nextGame() {
  if (gameOver) return -1;
  isLoadingPuzzle = true;

  const idx = gameCounter % GAME_IMAGES.length;
  gameCounter += 1;

  if (gameQuestionEl) {
    const quoteIdx = (roundNumber - 1) % PUZZLE_QUOTES.length;
    gameQuestionEl.textContent = PUZZLE_QUOTES[quoteIdx];
  }
  hideEquationPuzzle();
  if (gameImage) {
    gameImage.style.display = "none";
    gameImage.removeAttribute("src");
  }
  if (gameImagePlaceholder) {
    gameImagePlaceholder.classList.add("hidden");
  }

  let src = "";
  try {
    const puzzle = await fetchPuzzleFromApi();
    currentCorrectAnswer = puzzle.answer;
    src = puzzle.imageSrc;
  } catch (err) {
    console.error("Puzzle API error, using fallback:", err);
    currentCorrectAnswer = PUZZLE_ANSWERS[idx] ?? 1;
    src = getGameImageUrl(GAME_IMAGES[idx]);
    if (gameQuestionEl) gameQuestionEl.textContent = "Using offline puzzle (API unavailable)";
  }

  if (!src || !isValidImageSrc(src)) {
    currentCorrectAnswer = PUZZLE_ANSWERS[idx] ?? 1;
    src = getGameImageUrl(GAME_IMAGES[idx]);
    if (gameQuestionEl) gameQuestionEl.textContent = "Using offline puzzle";
  }
  if (gameImage) {
    gameImage.alt = "Puzzle";
    gameImage.onload = () => {
      gameImage.style.display = "";
      if (gameImagePlaceholder) gameImagePlaceholder.classList.add("hidden");
    };
    gameImage.onerror = () => {
      gameImage.style.display = "none";
      gameImage.removeAttribute("src");
      if (gameImagePlaceholder) {
        gameImagePlaceholder.textContent = "Puzzle didn't load. Tap to retry.";
        gameImagePlaceholder.classList.remove("hidden");
        gameImagePlaceholder.style.cursor = "pointer";
      }
    };
    gameImage.style.display = "none";
    gameImage.src = src;
  }
  if (gameFeedbackEl) {
    gameFeedbackEl.textContent = "";
    gameFeedbackEl.style.display = "none";
    clearTimeout(gameFeedbackEl._hideTimer);
  }
  startRoundTimer();
  updateMeta();
  isLoadingPuzzle = false;
  if (!gameOver) {
    setButtonsDisabled(false);
    if (roundNumber > 1) setLevelButtonsEnabled(false);
  }
  return idx;
}

/** Reload the current puzzle for the selected level (e.g. after user changes Easy/Medium/Hard). Does not advance gameCounter. */
async function refreshPuzzleForCurrentLevel() {
  if (gameOver || isLoadingPuzzle) return;
  const idx = gameCounter % GAME_IMAGES.length;
  isLoadingPuzzle = true;
  hideEquationPuzzle();
  if (gameImage) {
    gameImage.style.display = "none";
    gameImage.removeAttribute("src");
  }
  if (gameImagePlaceholder) gameImagePlaceholder.classList.add("hidden");

  let src = "";
  try {
    const puzzle = await fetchPuzzleFromApi();
    currentCorrectAnswer = puzzle.answer;
    src = puzzle.imageSrc;
  } catch (err) {
    currentCorrectAnswer = PUZZLE_ANSWERS[idx] ?? 1;
    src = getGameImageUrl(GAME_IMAGES[idx]);
    if (gameQuestionEl) gameQuestionEl.textContent = "Using offline puzzle (API unavailable)";
  }
  if (!src || !isValidImageSrc(src)) {
    currentCorrectAnswer = PUZZLE_ANSWERS[idx] ?? 1;
    src = getGameImageUrl(GAME_IMAGES[idx]);
    if (gameQuestionEl) gameQuestionEl.textContent = "Using offline puzzle";
  }
  if (gameImage) {
    gameImage.alt = "Puzzle";
    gameImage.onload = () => {
      gameImage.style.display = "";
      if (gameImagePlaceholder) gameImagePlaceholder.classList.add("hidden");
    };
    gameImage.onerror = () => {
      gameImage.style.display = "none";
      gameImage.removeAttribute("src");
      if (gameImagePlaceholder) {
        gameImagePlaceholder.textContent = "Puzzle didn't load. Tap to retry.";
        gameImagePlaceholder.classList.remove("hidden");
        gameImagePlaceholder.style.cursor = "pointer";
      }
    };
    gameImage.style.display = "none";
    gameImage.src = src;
  }
  isLoadingPuzzle = false;
}

function getExplainMistakeMessage(answered) {
  if (answered < currentCorrectAnswer) return "That number is too low. The correct digit is higher.";
  if (answered > currentCorrectAnswer) return "That number is too high. The correct digit is lower.";
  return "Try a different digit — it doesn't satisfy the equation.";
}

function checkSolution(answered) {
  if (gameOver) return false;
  if (isLoadingPuzzle) return false;
  const correct = answered === currentCorrectAnswer;
  if (correct) {
    const timeBonus = Math.floor(remainingSeconds / 5) * TIME_BONUS_PER_5_SEC;
    const comboMultiplier = Math.min(consecutiveCorrect + 1, COMBO_MAX);
    const basePoint = 1;
    const points = basePoint * comboMultiplier + timeBonus;
    gameScore += points;
    totalTimeBonusThisGame += timeBonus;
    consecutiveCorrect += 1;
    bestStreakThisGame = Math.max(bestStreakThisGame, consecutiveCorrect);
    if (consecutiveCorrect >= COMBO_MAX) maxComboReachedThisGame = Math.max(maxComboReachedThisGame, consecutiveCorrect);
    updateMeta();
  } else {
    consecutiveCorrect = 0;
  }
  if (gameScoreEl) {
    gameScoreEl.textContent = "Score: " + gameScore;
    if (correct) {
      gameScoreEl.classList.add("score-bump");
      setTimeout(() => gameScoreEl.classList.remove("score-bump"), 350);
    }
  }
  if (gameFeedbackEl) {
    let msg = correct ? "✅ Correct!" : "❌ " + getExplainMistakeMessage(answered);
    if (correct) {
      const icons = [" 🪙"];
      if (Math.floor(remainingSeconds / 5) > 0) icons.push(" ⭐");
      if (consecutiveCorrect >= 2) icons.push(" 🔥");
      if (currentLevel === "hard") icons.push(" 💎");
      if (roundNumber >= TOTAL_ROUNDS) icons.push(" 👑");
      msg += icons.join("");
      if (consecutiveCorrect >= 2) msg += " " + Math.min(consecutiveCorrect, COMBO_MAX) + "x combo!";
      if (Math.floor(remainingSeconds / 5) > 0) msg += " +" + (Math.floor(remainingSeconds / 5) * TIME_BONUS_PER_5_SEC) + " time bonus.";
      msg += " Next puzzle…";
    }
    gameFeedbackEl.textContent = msg;
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
  if (!correct && gameButtonsEl) {
    gameButtonsEl.classList.remove("shake");
    void gameButtonsEl.offsetWidth;
    gameButtonsEl.classList.add("shake");
  }
  return correct;
}

const ACHIEVEMENTS = [
  { id: "first_win", name: "First Steps", desc: "Complete a game", check: (s, r, m, t) => r >= TOTAL_ROUNDS && s >= 1 },
  { id: "perfect", name: "Perfect 10", desc: "Score 10/10 correct", check: (s, r, m, t) => r >= TOTAL_ROUNDS && s >= 10 },
  { id: "combo_master", name: "Combo Master", desc: "Reach a 3x combo", check: (s, r, m, t) => m >= COMBO_MAX },
  { id: "time_saver", name: "Time Saver", desc: "Earn 20+ time bonus points in one game", check: (s, r, m, t) => t >= 20 },
  { id: "speedster", name: "Speedster", desc: "Finish with 30+ seconds left on the last round", check: (s, r, m, t) => r >= TOTAL_ROUNDS && lastRoundSecondsLeft >= 30 },
];

function getUnlockedAchievements() {
  return ACHIEVEMENTS.filter((a) => a.check(gameScore, roundNumber, maxComboReachedThisGame, totalTimeBonusThisGame)).map((a) => a.name);
}

function initGame() {
  gameCounter = 0;
  gameScore = 0;
  roundNumber = 1;
  gameOver = false;
  consecutiveCorrect = 0;
  extraTimeUsedThisGame = 0;
  maxComboReachedThisGame = 0;
  bestStreakThisGame = 0;
  totalTimeBonusThisGame = 0;
  roundSecondsForCurrentGame = LEVELS[currentLevel] ? LEVELS[currentLevel].seconds : 60;
  stopTimer();
  const sparkleWrap = document.getElementById("win-sparkle-wrap");
  if (sparkleWrap) {
    sparkleWrap.innerHTML = "";
    clearTimeout(sparkleWrap._sparkleTimer);
  }
  if (extraTimeBtn) {
    if (relaxMode) extraTimeBtn.classList.add("hidden");
    else {
      extraTimeBtn.classList.remove("hidden");
      extraTimeBtn.disabled = false;
    }
  }
  if (gameAchievementsEl) gameAchievementsEl.classList.add("hidden");
  const achievementsPill = document.getElementById("achievements-pill");
  if (achievementsPill) achievementsPill.classList.add("hidden");
  const sessionBestEl = document.getElementById("session-best");
  if (sessionBestEl) sessionBestEl.textContent = String(sessionBestScore);
  setLevelButtonsEnabled(true);
  if (!gameButtonsEl) return;
  gameButtonsEl.innerHTML = "";
  if (restartBtn) restartBtn.classList.add("hidden");
  for (let i = 0; i <= 9; i++) {
    const btn = document.createElement("button");
    btn.type = "button";
    btn.textContent = String(i);
    btn.addEventListener("click", () => {
      const correct = checkSolution(i);
      if (!correct) return;

      if (roundNumber >= TOTAL_ROUNDS) lastRoundSecondsLeft = remainingSeconds;
      stopTimer();
      setButtonsDisabled(true);

      if (roundNumber >= TOTAL_ROUNDS) {
        setTimeout(() => {
          endGame(`🎉 Finished! Final score: ${gameScore} points`);
        }, NEXT_PUZZLE_DELAY_MS);
        return;
      }

      roundNumber += 1;
      if (roundNumber === 2) setLevelButtonsEnabled(false);
      updateMeta();
      setTimeout(() => {
        void nextGame();
      }, NEXT_PUZZLE_DELAY_MS);
    });
    gameButtonsEl.appendChild(btn);
  }
  void nextGame();
  if (gameScoreEl) gameScoreEl.textContent = "Score: 0";
  updateMeta();
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
    const avatar = getStoredAvatar();
    if (profileAvatarDisplay) profileAvatarDisplay.textContent = avatar;
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

let selectedProfileAvatar = getStoredAvatar();

function openProfilePage() {
  if (!profilePage || !gameContentInner) return;
  profilePage.classList.remove("hidden");
  profilePage.setAttribute("aria-hidden", "false");
  if (gameTopBar) gameTopBar.classList.add("hidden");
  gameContentInner.classList.add("hidden");
  if (gameAreaFooter) gameAreaFooter.classList.add("hidden");
  if (profileDisplayNameInput) profileDisplayNameInput.value = (currentUser && currentUser.displayName) || "";
  selectedProfileAvatar = getStoredAvatar();
  if (profileAvatarLarge) profileAvatarLarge.textContent = selectedProfileAvatar;
  const stats = getProfileStats();
  if (profileStatGames) profileStatGames.textContent = stats.games;
  if (profileStatBest) profileStatBest.textContent = stats.best;
  if (profileStatStreak) profileStatStreak.textContent = stats.streak;
  if (profileAvatarGrid) {
    profileAvatarGrid.innerHTML = "";
    PROFILE_AVATARS.forEach((emoji) => {
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "profile-avatar-option" + (emoji === selectedProfileAvatar ? " selected" : "");
      btn.textContent = emoji;
      btn.setAttribute("aria-label", "Select avatar");
      btn.addEventListener("click", () => {
        selectedProfileAvatar = emoji;
        if (profileAvatarLarge) profileAvatarLarge.textContent = emoji;
        profileAvatarGrid.querySelectorAll(".profile-avatar-option").forEach((b) => b.classList.remove("selected"));
        btn.classList.add("selected");
      });
      profileAvatarGrid.appendChild(btn);
    });
  }
}

function closeProfilePage() {
  if (!profilePage || !gameContentInner) return;
  profilePage.classList.add("hidden");
  profilePage.setAttribute("aria-hidden", "true");
  if (gameTopBar) gameTopBar.classList.remove("hidden");
  gameContentInner.classList.remove("hidden");
  if (gameAreaFooter) gameAreaFooter.classList.remove("hidden");
}

if (profileAvatarBtn) profileAvatarBtn.addEventListener("click", openProfilePage);
if (profileBtn) profileBtn.addEventListener("click", openProfilePage);
if (profileBackBtn) profileBackBtn.addEventListener("click", closeProfilePage);

if (profileSaveBtn && profileDisplayNameInput) {
  profileSaveBtn.addEventListener("click", async () => {
    if (!currentUser) return;
    const name = profileDisplayNameInput.value.trim();
    try {
      await updateDisplayName(currentUser, name);
      currentUser.displayName = name || null;
      userEmailEl.textContent = name || currentUser.email || currentUser.phoneNumber || currentUser.uid;
      setStoredAvatar(selectedProfileAvatar);
      if (profileAvatarDisplay) profileAvatarDisplay.textContent = selectedProfileAvatar;
      closeProfilePage();
    } catch (err) {
      console.error("Update name failed", err);
    }
  });
}

if (profileLogoutBtn) {
  profileLogoutBtn.addEventListener("click", async () => {
    showMessage("");
    try {
      await logout();
    } catch (err) {
      console.error("Logout failed", err);
      showMessage("Sign out failed. Please try again.");
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

function setLevel(level) {
  if (!LEVELS[level]) return;
  currentLevel = level;
  roundSecondsForCurrentGame = LEVELS[level].seconds;
  if (gameLevelSelectEl) {
    gameLevelSelectEl.querySelectorAll(".level-btn").forEach((b) => {
      const isActive = b.getAttribute("data-level") === level;
      b.classList.toggle("level-btn-active", isActive);
      b.setAttribute("aria-pressed", isActive ? "true" : "false");
    });
  }
  remainingSeconds = relaxMode ? 0 : roundSecondsForCurrentGame;
  updateMeta();
  if (roundNumber >= 1 && !gameOver && !isLoadingPuzzle) {
    stopTimer();
    startRoundTimer();
    void refreshPuzzleForCurrentLevel();
  }
}

function toggleRelaxMode() {
  relaxMode = !relaxMode;
  const btn = document.getElementById("relax-mode-btn");
  if (btn) {
    btn.classList.toggle("relax-mode-active", relaxMode);
    btn.setAttribute("aria-pressed", relaxMode ? "true" : "false");
    btn.title = relaxMode ? "Relax mode: no timer" : "Timed play";
  }
  remainingSeconds = relaxMode ? 0 : roundSecondsForCurrentGame;
  updateMeta();
  if (roundNumber >= 1 && !gameOver && !isLoadingPuzzle) {
    stopTimer();
    if (!relaxMode) startRoundTimer();
  }
}

if (gameLevelSelectEl) {
  gameLevelSelectEl.querySelectorAll(".level-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      if (btn.disabled) return;
      const level = btn.getAttribute("data-level");
      if (!level || !LEVELS[level]) return;
      setLevel(level);
    });
  });
}

if (gameLevelBadgeEl) {
  gameLevelBadgeEl.addEventListener("click", () => {
    if (gameLevelBadgeEl.disabled) return;
    const levelOrder = ["easy", "medium", "hard"];
    const idx = levelOrder.indexOf(currentLevel);
    const nextLevel = levelOrder[(idx + 1) % levelOrder.length];
    setLevel(nextLevel);
  });
}

const relaxModeBtn = document.getElementById("relax-mode-btn");
if (relaxModeBtn) relaxModeBtn.addEventListener("click", toggleRelaxMode);

if (gameImagePlaceholder) {
  gameImagePlaceholder.addEventListener("click", () => {
    if (gameImagePlaceholder.classList.contains("hidden")) return;
    if (gameOver || isLoadingPuzzle) return;
    if (gameImagePlaceholder.textContent.includes("retry")) {
      void nextGame();
    }
  });
}

if (extraTimeBtn) {
  extraTimeBtn.addEventListener("click", () => {
    if (gameOver || isLoadingPuzzle || extraTimeUsedThisGame >= EXTRA_TIME_USES_PER_GAME) return;
    extraTimeUsedThisGame += 1;
    remainingSeconds += EXTRA_TIME_SECONDS;
    updateMeta();
    extraTimeBtn.classList.add("hidden");
    if (gameFeedbackEl) {
      gameFeedbackEl.textContent = "⏱ +15 seconds!";
      gameFeedbackEl.className = "correct";
      gameFeedbackEl.style.display = "block";
      clearTimeout(gameFeedbackEl._hideTimer);
      gameFeedbackEl._hideTimer = setTimeout(() => {
        gameFeedbackEl.textContent = "";
        gameFeedbackEl.style.display = "none";
      }, 1500);
    }
  });
}

if (restartBtn) {
  restartBtn.addEventListener("click", () => {
    initGame();
    setButtonsDisabled(false);
  });
}

const howToPlayModal = document.getElementById("how-to-play-modal");
const howToPlayBtn = document.getElementById("how-to-play-btn");
const howToPlayClose = document.getElementById("how-to-play-close");
const howToPlayBackdrop = document.querySelector(".how-to-play-backdrop");
if (howToPlayBtn && howToPlayModal) {
  howToPlayBtn.addEventListener("click", () => {
    howToPlayModal.classList.remove("hidden");
    howToPlayModal.setAttribute("aria-hidden", "false");
  });
}
function closeHowToPlayModal() {
  if (howToPlayModal) {
    howToPlayModal.classList.add("hidden");
    howToPlayModal.setAttribute("aria-hidden", "true");
  }
}
if (howToPlayClose) howToPlayClose.addEventListener("click", closeHowToPlayModal);
if (howToPlayBackdrop) howToPlayBackdrop.addEventListener("click", closeHowToPlayModal);

const achievementsPillEl = document.getElementById("achievements-pill");
if (achievementsPillEl) {
  achievementsPillEl.addEventListener("click", (e) => {
    e.preventDefault();
    openProfilePage();
  });
}
