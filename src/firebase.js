// Firebase v9 modular init
import { initializeApp } from 'firebase/app'
import { getFirestore } from 'firebase/firestore'
import { getStorage } from 'firebase/storage'

// Your actual Firebase config
const firebaseConfig = {
  apiKey: "AIzaSyCvUAsyx2EcwcWJihANUE92GBJShEFLwdQ",
  authDomain: "dnav-f39ac.firebaseapp.com",
  projectId: "dnav-f39ac",
  storageBucket: "dnav-f39ac.firebasestorage.app",
  messagingSenderId: "841118364997",
  appId: "1:841118364997:web:d28a928e617a48f2577a2c",
  measurementId: "G-R2SWKCWPBT"
}

let app, db, storage;

try {
  app = initializeApp(firebaseConfig)
  db = getFirestore(app)
  storage = getStorage(app)
  console.log('✅ Firebase connected successfully!')
} catch (error) {
  console.error('❌ Firebase connection failed:', error.message)
  // Fallback to local storage
  db = null
  storage = null
}

export { db, storage }
