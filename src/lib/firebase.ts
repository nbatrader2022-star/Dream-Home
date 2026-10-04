/// <reference types="vite/client" />
import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signOut as fbSignOut,
  onAuthStateChanged,
  User as FirebaseUser,
  Auth,
} from 'firebase/auth';
import {
  getFirestore,
  doc,
  setDoc,
  getDoc,
  updateDoc,
  Firestore,
} from 'firebase/firestore';
import { UserProfile } from '../types';

const env = (import.meta as any).env || {};

const firebaseConfig = {
  apiKey: env.VITE_FIREBASE_API_KEY || '',
  authDomain: env.VITE_FIREBASE_AUTH_DOMAIN || '',
  projectId: env.VITE_FIREBASE_PROJECT_ID || '',
  storageBucket: env.VITE_FIREBASE_STORAGE_BUCKET || '',
  messagingSenderId: env.VITE_FIREBASE_MESSAGING_SENDER_ID || '',
  appId: env.VITE_FIREBASE_APP_ID || '',
};

const isFirebaseConfigured = Boolean(
  firebaseConfig.apiKey && firebaseConfig.projectId
);

let app: FirebaseApp | null = null;
let auth: Auth | null = null;
let db: Firestore | null = null;
let googleProvider: GoogleAuthProvider | null = null;

if (isFirebaseConfigured) {
  try {
    app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
    auth = getAuth(app);
    db = getFirestore(app);
    googleProvider = new GoogleAuthProvider();
    googleProvider.setCustomParameters({ prompt: 'select_account' });
  } catch (error) {
    console.warn('Firebase initialization skipped or encountered error:', error);
  }
}

const LOCAL_STORAGE_USER_KEY = 'dream_home_auth_user';

export function getLocalStoredUser(): UserProfile | null {
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_USER_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function setLocalStoredUser(user: UserProfile | null) {
  try {
    if (user) {
      localStorage.setItem(LOCAL_STORAGE_USER_KEY, JSON.stringify(user));
    } else {
      localStorage.removeItem(LOCAL_STORAGE_USER_KEY);
    }
  } catch {}
}

export function isGoogleAuthAvailable(): boolean {
  return Boolean(isFirebaseConfigured && auth && googleProvider);
}

export async function signInWithGoogle(currentSavedList: string[] = []): Promise<UserProfile> {
  // If real Firebase Auth is configured and available
  if (auth && googleProvider) {
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const fbUser = result.user;
      
      const userProfile: UserProfile = {
        uid: fbUser.uid,
        displayName: fbUser.displayName || 'کاربر گرامی',
        email: fbUser.email || 'user@example.com',
        photoURL: fbUser.photoURL || undefined,
        phoneNumber: fbUser.phoneNumber || undefined,
        savedProperties: currentSavedList,
        role: 'vip',
        createdAt: new Date().toISOString(),
      };

      // Sync with Firestore if db is available
      if (db) {
        try {
          const userDocRef = doc(db, 'users', fbUser.uid);
          const snap = await getDoc(userDocRef);
          if (snap.exists()) {
            const data = snap.data();
            // Merge saved properties
            const merged = Array.from(new Set([...(data.savedProperties || []), ...currentSavedList]));
            userProfile.savedProperties = merged;
            await updateDoc(userDocRef, {
              lastLoginAt: new Date().toISOString(),
              savedProperties: merged,
            });
          } else {
            await setDoc(userDocRef, {
              ...userProfile,
              lastLoginAt: new Date().toISOString(),
            });
          }
        } catch (e) {
          console.warn('Firestore sync note:', e);
        }
      }

      setLocalStoredUser(userProfile);
      return userProfile;
    } catch (err: any) {
      console.warn('Firebase signInWithPopup note:', err?.message || err);
      throw new Error(err.message || 'خطا در احراز هویت با حساب گوگل. لطفاً مجدداً تلاش کنید.');
    }
  }

  throw new Error('سیستم ورود با گوگل در دسترس نیست. لطفاً از ورود امن با نام کاربری و رمز عبور استفاده فرمایید.');
}

export async function signOutUser(): Promise<void> {
  if (auth) {
    try {
      await fbSignOut(auth);
    } catch (e) {
      console.warn('Sign out note:', e);
    }
  }
  setLocalStoredUser(null);
}

export async function syncSavedPropertiesToUser(userId: string, savedIds: string[]): Promise<void> {
  const current = getLocalStoredUser();
  if (current && current.uid === userId) {
    current.savedProperties = savedIds;
    setLocalStoredUser(current);
  }

  if (db && isFirebaseConfigured) {
    try {
      const userDocRef = doc(db, 'users', userId);
      await updateDoc(userDocRef, {
        savedProperties: savedIds,
        updatedAt: new Date().toISOString(),
      });
    } catch (e) {
      console.warn('Firestore update note:', e);
    }
  }
}

export function subscribeToAuth(callback: (user: UserProfile | null) => void) {
  if (auth) {
    const unsubscribe = onAuthStateChanged(auth, async (fbUser: FirebaseUser | null) => {
      if (fbUser) {
        let savedList: string[] = [];
        if (db) {
          try {
            const snap = await getDoc(doc(db, 'users', fbUser.uid));
            if (snap.exists()) {
              savedList = snap.data().savedProperties || [];
            }
          } catch (e) {
            console.warn('Firestore read note:', e);
          }
        }
        const profile: UserProfile = {
          uid: fbUser.uid,
          displayName: fbUser.displayName || 'کاربر گرامی',
          email: fbUser.email || 'user@example.com',
          photoURL: fbUser.photoURL || undefined,
          savedProperties: savedList,
          role: 'vip',
          createdAt: new Date().toISOString(),
        };
        setLocalStoredUser(profile);
        callback(profile);
      } else {
        const local = getLocalStoredUser();
        callback(local);
      }
    });
    return unsubscribe;
  } else {
    // If no Firebase auth instance, check local
    const local = getLocalStoredUser();
    callback(local);
    return () => {};
  }
}

export const saveUserSavedProperties = syncSavedPropertiesToUser;

export { auth, db, isFirebaseConfigured };
