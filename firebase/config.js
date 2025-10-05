import { initializeApp, getApps } from 'firebase/app';
import { getAuth, signInAnonymously, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut, updateProfile, onAuthStateChanged, GoogleAuthProvider, signInWithCredential } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage, ref as storageRef, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import Constants from 'expo-constants';

let app = null;
let auth = null;
let firestore = null;
let storage = null;

export function initializeFirebase() {
  if (getApps().length) return;
  // Read values from environment. Use NEXT_PUBLIC_ vars from your .env.local (Expo web/managed projects).
  const extra = (Constants && Constants.expoConfig && Constants.expoConfig.extra) || (Constants && Constants.manifest && Constants.manifest.extra) || {};
  const firebaseConfig = {
    apiKey: extra.FIREBASE_API_KEY || process.env.NEXT_PUBLIC_FIREBASE_API_KEY || process.env.FIREBASE_API_KEY,
    authDomain: extra.FIREBASE_AUTH_DOMAIN || process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || process.env.FIREBASE_AUTH_DOMAIN,
    projectId: extra.FIREBASE_PROJECT_ID || process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || process.env.FIREBASE_PROJECT_ID,
    storageBucket: extra.FIREBASE_STORAGE_BUCKET || process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || process.env.FIREBASE_STORAGE_BUCKET,
    messagingSenderId: extra.FIREBASE_MESSAGING_SENDER_ID || process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || process.env.FIREBASE_MESSAGING_SENDER_ID,
    appId: extra.FIREBASE_APP_ID || process.env.NEXT_PUBLIC_FIREBASE_APP_ID || process.env.FIREBASE_APP_ID,
  };
  try {
    app = initializeApp(firebaseConfig);
    auth = getAuth(app);
    firestore = getFirestore(app);
  storage = getStorage(app);
    // Sign in anonymously for demo leaderboard
    signInAnonymously(auth).catch((e) => console.warn('Anonymous sign-in failed', e));
    // Optional: basic auth state logging
    onAuthStateChanged(auth, (user) => {
      if (user) {
        // user signed in
        // console.log('Auth state:', user.uid, user.displayName);
      } else {
        // signed out
      }
    });
  } catch (err) {
    console.warn('Firebase init failed (did you set env vars?)', err);
  }
}

// Getter helpers to avoid referencing before initialization
export function getAuthRef() {
  return auth;
}

export function getFirestoreRef() {
  return firestore;
}

export function getStorageRef() {
  return storage;
}

// Upload a local file URI to Firebase Storage and return download URL
export async function uploadFileToStorage(fileUri, path, onProgress) {
  if (!storage) throw new Error('Storage not initialized');
  // fetch the file as blob
  const resp = await fetch(fileUri);
  const blob = await resp.blob();
  const ref = storageRef(storage, path);
  const task = uploadBytesResumable(ref, blob);
  return new Promise((resolve, reject) => {
    task.on('state_changed', (snapshot) => {
      if (onProgress) onProgress(snapshot);
    }, reject, async () => {
      try {
        const url = await getDownloadURL(ref);
        resolve(url);
      } catch (e) { reject(e); }
    });
  });
}

// Backwards-compatible exports used by screens (they should call initializeFirebase first)
// Auth helper functions
export async function authSignInEmail(email, password) {
  if (!auth) throw new Error('Auth not initialized');
  return await signInWithEmailAndPassword(auth, email, password);
}

export async function authCreateUserEmail(email, password, displayName) {
  if (!auth) throw new Error('Auth not initialized');
  const cred = await createUserWithEmailAndPassword(auth, email, password);
  if (displayName) {
    await updateProfile(cred.user, { displayName });
  }
  return cred;
}

export async function authSignInWithGoogle(idToken, accessToken) {
  if (!auth) throw new Error('Auth not initialized');
  try {
    const credential = GoogleAuthProvider.credential(idToken, accessToken);
    return await signInWithCredential(auth, credential);
  } catch (err) {
    console.warn('Google sign-in failed', err);
    throw err;
  }
}

export async function authSignOut() {
  if (!auth) throw new Error('Auth not initialized');
  return await signOut(auth);
}

export async function authSetDisplayName(user, displayName) {
  if (!auth) throw new Error('Auth not initialized');
  if (!user) throw new Error('No user provided');
  return await updateProfile(user, { displayName });
}

export function onAuthChange(cb) {
  if (!auth) throw new Error('Auth not initialized');
  return onAuthStateChanged(auth, cb);
}

export { auth, firestore };
