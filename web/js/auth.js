import {
  auth,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  signOut,
  updateProfile,
  GoogleAuthProvider,
  signInWithPopup,
  signInWithPhoneNumber,
  RecaptchaVerifier,
} from "./firebase-config.js";

/**
 * Sign in with email and password using Firebase Auth.
 * @param {string} email
 * @param {string} password
 * @returns {Promise<import("firebase/auth").UserCredential>}
 */
export async function login(email, password) {
  return signInWithEmailAndPassword(auth, email, password);
}

/**
 * Create a new user with email and password.
 * @param {string} email
 * @param {string} password
 * @returns {Promise<import("firebase/auth").UserCredential>}
 */
export async function signUp(email, password) {
  return createUserWithEmailAndPassword(auth, email, password);
}

/**
 * Sign out the current user.
 */
export async function logout() {
  return signOut(auth);
}

/**
 * Subscribe to auth state changes (e.g. to redirect when user logs in/out).
 * @param {(user: import("firebase/auth").User | null) => void} callback
 * @returns {import("firebase/auth").Unsubscribe}
 */
export function onAuthChange(callback) {
  return onAuthStateChanged(auth, callback);
}

/**
 * Sign in with Google popup.
 * @returns {Promise<import("firebase/auth").UserCredential>}
 */
export async function loginWithGoogle() {
  const provider = new GoogleAuthProvider();
  return signInWithPopup(auth, provider);
}

/**
 * Start phone sign-in: sends SMS verification code.
 * @param {HTMLElement} recaptchaContainer - Element to render reCAPTCHA (e.g. invisible)
 * @param {string} phoneNumber - E.164 format (e.g. +1234567890)
 * @returns {Promise<import("firebase/auth").ConfirmationResult>} - Call .confirm(code) with the SMS code
 */
export async function sendPhoneVerificationCode(recaptchaContainer, phoneNumber) {
  if (!recaptchaContainer) {
    throw new Error("reCAPTCHA container not found. Please refresh the page.");
  }
  // Clear previous reCAPTCHA so each attempt gets a fresh verifier
  recaptchaContainer.innerHTML = "";
  const verifier = new RecaptchaVerifier(auth, recaptchaContainer, {
    size: "normal",
    callback: () => {},
  });
  const confirmationResult = await signInWithPhoneNumber(auth, phoneNumber, verifier);
  return confirmationResult;
}

/**
 * Complete phone sign-in with the SMS code.
 * @param {import("firebase/auth").ConfirmationResult} confirmationResult - From sendPhoneVerificationCode
 * @param {string} code - 6-digit code from SMS
 * @returns {Promise<import("firebase/auth").UserCredential>}
 */
export async function verifyPhoneCode(confirmationResult, code) {
  return confirmationResult.confirm(code);
}

/**
 * Update the current user's display name (for profile/settings).
 * @param {import("firebase/auth").User} user
 * @param {string} displayName
 */
export async function updateDisplayName(user, displayName) {
  if (!user) throw new Error("No user signed in.");
  return updateProfile(user, { displayName: (displayName && displayName.trim()) || "" });
}
