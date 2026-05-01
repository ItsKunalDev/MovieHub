import { useState } from 'react';
import { createPortal } from 'react-dom';
import { useNavigate } from 'react-router-dom';
import { FiX, FiEye, FiEyeOff } from 'react-icons/fi';
import { useAuth } from '../context/AuthContext';
import {
  auth,
  googleProvider,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup,
  updateProfile,
  sendEmailVerification,
  signOut,
} from '../firebase';
import './AuthModal.css';

/* ── Social SVG icons ── */
const GoogleIcon = () => (
  <svg width="20" height="20" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
    <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
    <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
    <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
    <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.18 1.48-4.97 2.31-8.16 2.31-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
  </svg>
);

const FacebookIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <path fill="#1877F2" d="M24 12.073C24 5.405 18.627 0 12 0S0 5.405 0 12.073C0 18.1 4.388 23.094 10.125 24v-8.437H7.078v-3.49h3.047V9.41c0-3.025 1.792-4.697 4.533-4.697 1.312 0 2.686.235 2.686.235v2.97h-1.513c-1.491 0-1.956.93-1.956 1.886v2.269h3.328l-.532 3.49h-2.796V24C19.612 23.094 24 18.1 24 12.073z"/>
  </svg>
);

const AppleIcon = () => (
  <svg width="20" height="20" viewBox="0 0 814 1000" xmlns="http://www.w3.org/2000/svg">
    <path fill="#fff" d="M788.1 340.9c-5.8 4.5-108.2 62.2-108.2 190.5 0 148.4 130.3 200.9 134.2 202.2-.6 3.2-20.7 71.9-68.7 141.9-42.8 61.6-87.5 123.1-155.5 123.1s-85.5-39.5-164-39.5c-76 0-103.7 40.8-165.9 40.8s-105-42.4-155.5-127.4C46.7 790.7 0 663 0 541.8c0-207.5 133.4-317.1 264.4-317.1 70.1 0 128.4 46.4 172.5 46.4 42.4 0 109.2-49.1 190.5-49.1zm-3.7-222.4c31.3-37.5 54.3-89.7 54.3-141.9 0-7.1-.6-14.3-1.9-20.1-51.6 1.9-112.3 34.4-149.2 75.8-28.5 32.4-55.1 84.7-55.1 137.6 0 7.7 1.3 15.5 1.9 18 3.2.6 8.4 1.3 13.6 1.3 46.4 0 102.5-31.9 136.4-70.7z"/>
  </svg>
);

/* Map Firebase error codes → friendly messages */
const friendlyError = (code) => {
  const map = {
    'auth/email-already-in-use':    'This email is already registered. Try signing in.',
    'auth/invalid-email':           'Please enter a valid email address.',
    'auth/weak-password':           'Password must be at least 6 characters.',
    'auth/user-not-found':          'No account found with this email.',
    'auth/wrong-password':          'Incorrect password. Please try again.',
    'auth/invalid-credential':      'Invalid email or password.',
    'auth/too-many-requests':       'Too many attempts. Please wait and try again.',
    'auth/popup-closed-by-user':    'Sign-in popup was closed. Please try again.',
    'auth/network-request-failed':  'Network error. Check your connection.',
  };
  return map[code] || 'Something went wrong. Please try again.';
};

export default function AuthModal() {
  const { setShowAuthModal, login } = useAuth();
  const navigate = useNavigate();
  const [mode, setMode] = useState('signin');
  const [showPass, setShowPass] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const update = (k, v) => setForm((p) => ({ ...p, [k]: v }));

  /* ── Email / Password submit ── */
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!form.email || !/\S+@\S+\.\S+/.test(form.email)) {
      setError('Please enter a valid email address.');
      return;
    }
    if (!form.password || form.password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }
    if (mode === 'signup' && !form.name.trim()) {
      setError('Please enter your full name.');
      return;
    }

    setLoading(true);
    try {
      let userCredential;
      if (mode === 'signup') {
        userCredential = await createUserWithEmailAndPassword(auth, form.email, form.password);
        await updateProfile(userCredential.user, { displayName: form.name.trim() });
        
        await sendEmailVerification(userCredential.user);
        await signOut(auth); // Do not sign them in automatically
        setMode('verify');
        setLoading(false);
        return;
      } else {
        userCredential = await signInWithEmailAndPassword(auth, form.email, form.password);
        
        if (!userCredential.user.emailVerified) {
          await signOut(auth);
          setMode('verify');
          setLoading(false);
          return;
        }
      }
      
      login(userCredential.user);

      if (mode === 'admin') {
        setShowAuthModal(false);
        navigate('/admin');
      }
    } catch (err) {
      setError(friendlyError(err.code));
    } finally {
      setLoading(false);
    }
  };

  /* ── Google Sign-In ── */
  const handleGoogle = async () => {
    setError('');
    setLoading(true);
    try {
      const result = await signInWithPopup(auth, googleProvider);
      login(result.user);
    } catch (err) {
      setError(friendlyError(err.code));
    } finally {
      setLoading(false);
    }
  };

  const switchMode = () => {
    setMode((m) => (m === 'signup' ? 'signin' : 'signup'));
    setError('');
    setForm({ name: '', email: '', password: '' });
  };

  return createPortal(
    <div className="auth-backdrop" onClick={() => setShowAuthModal(false)}>
      <div
        className="auth-split"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-label={mode === 'signin' ? 'Sign In' : mode === 'admin' ? 'Admin Sign In' : mode === 'verify' ? 'Verify Email' : 'Create Account'}
      >
        {/* ── LEFT: Poster Collage ── */}
        <div className="auth-left">
          <img src="/poster-collage.png" alt="Movie posters" className="auth-collage" />
          <div className="auth-left-overlay" />
        </div>

        {/* ── RIGHT: Form Panel ── */}
        <div className="auth-right">
          <button className="auth-close" onClick={() => setShowAuthModal(false)} aria-label="Close">
            <FiX />
          </button>

          {/* Brand */}
          <p className="auth-brand">CineNova</p>

          <h2 className="auth-heading">
            {mode === 'verify' ? 'Check Your Email' : mode === 'signin' ? 'Welcome Back' : mode === 'admin' ? 'Admin Sign In' : 'Create Account'}
          </h2>
          {mode !== 'verify' && <p className="auth-sub">Enter your Details</p>}

          {mode === 'verify' ? (
            <div className="auth-verify-container" style={{ textAlign: 'center', marginTop: '1rem' }}>
              <p style={{ color: 'rgba(255,255,255,0.7)', marginBottom: '2rem', lineHeight: '1.6', fontSize: '1.05rem' }}>
                We have sent you a verification email to <strong style={{ color: '#fff' }}>{form.email}</strong>. Please verify it and log in.
              </p>
              <button className="auth-submit" onClick={() => {
                setMode('signin');
                setError('');
                setForm(prev => ({...prev, password: ''}));
              }}>
                Login
              </button>
            </div>
          ) : (
            <>
              <form className="auth-form" onSubmit={handleSubmit} noValidate>
                {/* Name – sign-up only */}
                {mode === 'signup' && (
                  <input
                    className="auth-input"
                    type="text"
                    placeholder="Full Name"
                    value={form.name}
                    onChange={(e) => update('name', e.target.value)}
                    autoComplete="name"
                    autoFocus
                  />
                )}

                {/* Email */}
                <input
                  className="auth-input"
                  type="email"
                  placeholder="Enter your Email"
                  value={form.email}
                  onChange={(e) => update('email', e.target.value)}
                  autoComplete="email"
                  autoFocus={mode === 'signin'}
                />

                {/* Password */}
                <div className="auth-pass-wrap">
                  <input
                    className="auth-input"
                    type={showPass ? 'text' : 'password'}
                    placeholder="Password"
                    value={form.password}
                    onChange={(e) => update('password', e.target.value)}
                    autoComplete={mode === 'signin' ? 'current-password' : 'new-password'}
                  />
                  <button
                    type="button"
                    className="auth-pass-toggle"
                    onClick={() => setShowPass((p) => !p)}
                    aria-label="Toggle password"
                  >
                    {showPass ? <FiEyeOff /> : <FiEye />}
                  </button>
                </div>

                {error && <p className="auth-error">{error}</p>}

                <button type="submit" className="auth-submit" disabled={loading} id="auth-continue-btn">
                  {loading ? <span className="auth-spinner" /> : mode === 'signin' ? 'Sign In' : mode === 'admin' ? 'Admin Sign In' : 'Create Account'}
                </button>
              </form>

              {mode !== 'admin' && (
                <>
                  {/* OR divider */}
                  <div className="auth-or">
                    <span />
                    <p>OR</p>
                    <span />
                  </div>

                  {/* Social buttons */}
                  <div className="auth-socials">
                    <button className="auth-social-btn" id="google-btn" onClick={handleGoogle} disabled={loading}>
                      <GoogleIcon /> Continue With Google
                    </button>
                    <button className="auth-social-btn" id="facebook-btn" disabled>
                      <FacebookIcon /> Continue With Facebook
                    </button>
                    <button className="auth-social-btn" id="apple-btn" disabled>
                      <AppleIcon /> Continue With Apple
                    </button>
                  </div>
                </>
              )}

              {/* Switch mode */}
              {mode !== 'admin' && (
                <p className="auth-switch">
                  {mode === 'signin' ? "Don't have account?" : 'Already have an account?'}{' '}
                  <button className="auth-switch-btn" onClick={switchMode}>
                    {mode === 'signin' ? 'Sign Up' : 'Sign In'}
                  </button>
                </p>
              )}

              <p className="auth-switch" style={{ marginTop: '0.5rem' }}>
                {mode === 'admin' ? 'Are you a user?' : 'Are you an admin?'}{' '}
                <button 
                  className="auth-switch-btn" 
                  onClick={() => {
                    setMode(mode === 'admin' ? 'signin' : 'admin');
                    setError('');
                    setForm({ name: '', email: '', password: '' });
                  }}
                >
                  {mode === 'admin' ? 'User Sign In' : 'Admin Sign In'}
                </button>
              </p>
            </>
          )}
        </div>
      </div>
    </div>,
    document.body
  );
}
