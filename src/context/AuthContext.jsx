import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import {
  auth,
  onAuthStateChanged,
  signOut,
} from '../firebase';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true); // wait for Firebase to restore session
  const [showAuthModal, setShowAuthModal] = useState(false);

  // Keep user state in sync with Firebase session
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      if (firebaseUser) {
        const savedData = JSON.parse(localStorage.getItem(`userProfile_${firebaseUser.uid}`)) || {};
        setUser({
          uid: firebaseUser.uid,
          email: firebaseUser.email,
          name: firebaseUser.displayName || savedData.name || firebaseUser.email.split('@')[0],
          photoURL: savedData.photoURL || firebaseUser.photoURL || null,
        });
      } else {
        setUser(null);
      }
      setAuthLoading(false);
    });
    return unsubscribe;
  }, []);

  // Called by AuthModal after a successful Firebase sign-in/sign-up
  const login = useCallback((firebaseUser) => {
    const savedData = JSON.parse(localStorage.getItem(`userProfile_${firebaseUser.uid}`)) || {};
    setUser({
      uid: firebaseUser.uid,
      email: firebaseUser.email,
      name: firebaseUser.displayName || savedData.name || firebaseUser.email.split('@')[0],
      photoURL: savedData.photoURL || firebaseUser.photoURL || null,
    });
    setShowAuthModal(false);
  }, []);

  const logout = useCallback(async () => {
    try {
      await signOut(auth);
    } catch (err) {
      console.error('Sign out error:', err);
    } finally {
      setUser(null);
      setShowAuthModal(false);
    }
  }, []);

  const requireAuth = useCallback(
    (callback) => {
      if (user) {
        callback?.();
      } else {
        setShowAuthModal(true);
      }
    },
    [user]
  );

  return (
    <AuthContext.Provider
      value={{ user, authLoading, login, logout, showAuthModal, setShowAuthModal, requireAuth }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
