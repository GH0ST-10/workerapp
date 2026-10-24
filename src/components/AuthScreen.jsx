import React, { useState, useEffect } from 'react';
import { 
  CalendarDays, 
  LogIn, 
  UserPlus, 
  Mail, 
  Lock, 
  Eye, 
  EyeOff, 
  AlertCircle, 
  CheckCircle2,
  ShieldCheck,
  KeyRound,
  ArrowLeft
} from 'lucide-react';
import { 
  signInWithEmail, 
  signUpWithEmail, 
  signInWithGoogle,
  resetPasswordForEmail,
  updateUserPassword
} from '../utils/supabaseClient';

export default function AuthScreen({ onAuthSuccess }) {
  const [view, setView] = useState('signin'); // 'signin' | 'signup' | 'forgot' | 'updatePassword'
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Check if user came from a password recovery email link
  useEffect(() => {
    if (window.location.hash.includes('type=recovery') || window.location.hash.includes('recovery')) {
      setView('updatePassword');
    }
  }, []);

  const handleAuthSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');
    setLoading(true);

    try {
      if (view === 'signup') {
        const { data, error } = await signUpWithEmail(email, password);
        if (error) throw error;

        if (data?.user && data?.user?.identities?.length === 0) {
          setErrorMsg('An account with this email already exists. Please sign in.');
        } else if (data?.session) {
          setSuccessMsg('Account created successfully! Logging you in...');
          setTimeout(() => {
            onAuthSuccess(data.user);
          }, 600);
        } else {
          setSuccessMsg('Account created! Please check your email to confirm registration or sign in.');
        }
      } else if (view === 'signin') {
        const { data, error } = await signInWithEmail(email, password);
        if (error) throw error;

        if (data?.user) {
          setSuccessMsg('Signed in successfully!');
          setTimeout(() => {
            onAuthSuccess(data.user);
          }, 500);
        }
      }
    } catch (err) {
      console.error('Authentication error:', err);
      setErrorMsg(err.message || 'Authentication failed. Please verify your email and password.');
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');
    setLoading(true);

    try {
      if (!email.trim()) {
        throw new Error('Please enter your email address.');
      }
      const { error } = await resetPasswordForEmail(email.trim());
      if (error) throw error;

      setSuccessMsg('Password reset link sent! Please check your email inbox.');
    } catch (err) {
      console.error('Password reset error:', err);
      setErrorMsg(err.message || 'Could not send reset link. Please check the email address.');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdatePassword = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');
    setLoading(true);

    try {
      if (newPassword.length < 6) {
        throw new Error('Password must be at least 6 characters long.');
      }
      const { data, error } = await updateUserPassword(newPassword);
      if (error) throw error;

      setSuccessMsg('Password updated successfully! Logging you in...');
      setTimeout(() => {
        window.location.hash = '';
        if (data?.user) {
          onAuthSuccess(data.user);
        } else {
          setView('signin');
        }
      }, 800);
    } catch (err) {
      console.error('Update password error:', err);
      setErrorMsg(err.message || 'Could not update password. Please try requesting a new reset link.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setErrorMsg('');
    setLoading(true);
    try {
      const { error } = await signInWithGoogle();
      if (error) throw error;
    } catch (err) {
      console.error('Google login error:', err);
      setErrorMsg(err.message || 'Google sign-in could not be started.');
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '24px 16px',
      background: 'var(--bg-primary)'
    }}>
      <div style={{
        width: '100%',
        maxWidth: '440px',
        background: 'var(--bg-card)',
        border: '1px solid var(--border-color)',
        borderRadius: '24px',
        padding: '32px 24px',
        boxShadow: 'var(--shadow-xl)',
        display: 'flex',
        flexDirection: 'column',
        gap: 20
      }}>
        {/* Brand Header */}
        <div style={{ textAlign: 'center' }}>
          <div style={{
            width: 52,
            height: 52,
            margin: '0 auto 12px',
            borderRadius: '16px',
            background: 'var(--primary-gradient)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#ffffff',
            boxShadow: '0 8px 20px -4px rgba(99, 102, 241, 0.4)'
          }}>
            <CalendarDays size={28} strokeWidth={2.4} />
          </div>

          <h1 style={{
            fontFamily: 'var(--font-display)',
            fontSize: '24px',
            fontWeight: 800,
            margin: '0 0 4px',
            color: 'var(--text-primary)',
            letterSpacing: '-0.5px'
          }}>
            WorkTrack
          </h1>

          <p style={{ fontSize: '13.5px', color: 'var(--text-muted)', margin: 0 }}>
            Attendance & Daily Earnings Tracker
          </p>

          {/* Wage pill indicator */}
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 8,
            marginTop: 12,
            padding: '4px 12px',
            borderRadius: 'var(--radius-full)',
            background: 'var(--bg-input)',
            fontSize: '11.5px',
            fontWeight: 700,
            color: 'var(--text-secondary)'
          }}>
            <span style={{ color: 'var(--color-full)' }}>● Full Day ₹500</span>
            <span>•</span>
            <span style={{ color: 'var(--color-half)' }}>● Half Day ₹300</span>
          </div>
        </div>

        {/* Alerts */}
        {errorMsg && (
          <div style={{
            background: 'var(--color-absent-bg)',
            border: '1px solid var(--color-absent-border)',
            borderRadius: 'var(--radius-sm)',
            padding: '10px 14px',
            fontSize: '12.5px',
            color: 'var(--color-absent)',
            display: 'flex',
            alignItems: 'flex-start',
            gap: 8
          }}>
            <AlertCircle size={16} style={{ marginTop: 2, flexShrink: 0 }} />
            <span>{errorMsg}</span>
          </div>
        )}

        {successMsg && (
          <div style={{
            background: 'var(--color-full-bg)',
            border: '1px solid var(--color-full-border)',
            borderRadius: 'var(--radius-sm)',
            padding: '10px 14px',
            fontSize: '12.5px',
            color: 'var(--color-full)',
            display: 'flex',
            alignItems: 'center',
            gap: 8
          }}>
            <CheckCircle2 size={16} />
            <span>{successMsg}</span>
          </div>
        )}

        {/* VIEW 1: SIGN IN & SIGN UP */}
        {(view === 'signin' || view === 'signup') && (
          <>
            {/* Tab Switcher */}
            <div style={{
              display: 'flex',
              background: 'var(--bg-input)',
              padding: 4,
              borderRadius: 'var(--radius-md)'
            }}>
              <button
                type="button"
                onClick={() => {
                  setView('signin');
                  setErrorMsg('');
                  setSuccessMsg('');
                }}
                style={{
                  flex: 1,
                  padding: '9px 14px',
                  borderRadius: 'var(--radius-sm)',
                  fontSize: '13px',
                  fontWeight: 700,
                  background: view === 'signin' ? 'var(--bg-card)' : 'transparent',
                  color: view === 'signin' ? 'var(--text-primary)' : 'var(--text-muted)',
                  boxShadow: view === 'signin' ? 'var(--shadow-sm)' : 'none',
                  transition: 'all 0.15s ease'
                }}
              >
                Sign In
              </button>

              <button
                type="button"
                onClick={() => {
                  setView('signup');
                  setErrorMsg('');
                  setSuccessMsg('');
                }}
                style={{
                  flex: 1,
                  padding: '9px 14px',
                  borderRadius: 'var(--radius-sm)',
                  fontSize: '13px',
                  fontWeight: 700,
                  background: view === 'signup' ? 'var(--bg-card)' : 'transparent',
                  color: view === 'signup' ? 'var(--text-primary)' : 'var(--text-muted)',
                  boxShadow: view === 'signup' ? 'var(--shadow-sm)' : 'none',
                  transition: 'all 0.15s ease'
                }}
              >
                Create Account
              </button>
            </div>

            {/* Google OAuth Button */}
            <button
              type="button"
              onClick={handleGoogleLogin}
              disabled={loading}
              style={{
                width: '100%',
                padding: '12px',
                borderRadius: 'var(--radius-md)',
                background: 'var(--bg-input)',
                border: '1px solid var(--border-color)',
                color: 'var(--text-primary)',
                fontWeight: 600,
                fontSize: '14px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 10,
                boxShadow: 'var(--shadow-sm)',
                cursor: 'pointer'
              }}
            >
              <svg width="18" height="18" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
              </svg>
              <span>Continue with Google</span>
            </button>

            {/* Divider */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{ flex: 1, height: 1, background: 'var(--border-color)' }} />
              <span style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>
                or with email
              </span>
              <div style={{ flex: 1, height: 1, background: 'var(--border-color)' }} />
            </div>

            {/* Form */}
            <form onSubmit={handleAuthSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 5 }}>
                  Email Address
                </label>
                <div style={{ position: 'relative' }}>
                  <Mail size={16} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                  <input 
                    type="email"
                    required
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    style={{ width: '100%', paddingLeft: 36 }}
                  />
                </div>
              </div>

              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 5 }}>
                  <label style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)' }}>
                    Password
                  </label>
                  {view === 'signin' && (
                    <button
                      type="button"
                      onClick={() => {
                        setView('forgot');
                        setErrorMsg('');
                        setSuccessMsg('');
                      }}
                      style={{
                        fontSize: '11.5px',
                        fontWeight: 600,
                        color: 'var(--primary-accent)',
                        background: 'none',
                        padding: 0,
                        cursor: 'pointer'
                      }}
                    >
                      Forgot password?
                    </button>
                  )}
                </div>

                <div style={{ position: 'relative' }}>
                  <Lock size={16} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                  <input 
                    type={showPassword ? 'text' : 'password'}
                    required
                    minLength={6}
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    style={{ width: '100%', paddingLeft: 36, paddingRight: 38 }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }}
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                style={{
                  width: '100%',
                  marginTop: 4,
                  padding: '13px',
                  borderRadius: 'var(--radius-md)',
                  background: 'var(--primary-gradient)',
                  color: '#ffffff',
                  fontWeight: 700,
                  fontSize: '14px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 8,
                  boxShadow: 'var(--shadow-md)',
                  cursor: 'pointer'
                }}
              >
                {view === 'signin' ? <LogIn size={16} /> : <UserPlus size={16} />}
                <span>{loading ? 'Please wait...' : (view === 'signin' ? 'Sign In to Tracker' : 'Create My Account')}</span>
              </button>
            </form>
          </>
        )}

        {/* VIEW 2: FORGOT PASSWORD */}
        {view === 'forgot' && (
          <form onSubmit={handleForgotPassword} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div style={{ textAlign: 'left' }}>
              <button
                type="button"
                onClick={() => {
                  setView('signin');
                  setErrorMsg('');
                  setSuccessMsg('');
                }}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 6,
                  fontSize: '12.5px',
                  fontWeight: 600,
                  color: 'var(--text-muted)',
                  marginBottom: 12,
                  cursor: 'pointer'
                }}
              >
                <ArrowLeft size={14} />
                Back to Sign In
              </button>

              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                <KeyRound size={20} color="var(--primary-accent)" />
                <h2 style={{ fontSize: '18px', fontWeight: 700, margin: 0, color: 'var(--text-primary)' }}>
                  Reset your password
                </h2>
              </div>
              <p style={{ fontSize: '13px', color: 'var(--text-muted)', margin: 0 }}>
                Enter your registered email address and we will send you a link to reset your password.
              </p>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 5 }}>
                Email Address
              </label>
              <div style={{ position: 'relative' }}>
                <Mail size={16} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                <input 
                  type="email"
                  required
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  style={{ width: '100%', paddingLeft: 36 }}
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              style={{
                width: '100%',
                padding: '13px',
                borderRadius: 'var(--radius-md)',
                background: 'var(--primary-gradient)',
                color: '#ffffff',
                fontWeight: 700,
                fontSize: '14px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 8,
                boxShadow: 'var(--shadow-md)',
                cursor: 'pointer'
              }}
            >
              <Mail size={16} />
              <span>{loading ? 'Sending link...' : 'Send Reset Link'}</span>
            </button>
          </form>
        )}

        {/* VIEW 3: SET NEW PASSWORD (AFTER RECOVERY LINK CLICKED) */}
        {view === 'updatePassword' && (
          <form onSubmit={handleUpdatePassword} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div style={{ textAlign: 'left' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                <KeyRound size={20} color="var(--color-full)" />
                <h2 style={{ fontSize: '18px', fontWeight: 700, margin: 0, color: 'var(--text-primary)' }}>
                  Set New Password
                </h2>
              </div>
              <p style={{ fontSize: '13px', color: 'var(--text-muted)', margin: 0 }}>
                Enter your new password below to regain access to your account.
              </p>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 5 }}>
                New Password
              </label>
              <div style={{ position: 'relative' }}>
                <Lock size={16} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                <input 
                  type={showPassword ? 'text' : 'password'}
                  required
                  minLength={6}
                  placeholder="At least 6 characters"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  style={{ width: '100%', paddingLeft: 36, paddingRight: 38 }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              style={{
                width: '100%',
                padding: '13px',
                borderRadius: 'var(--radius-md)',
                background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                color: '#ffffff',
                fontWeight: 700,
                fontSize: '14px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 8,
                boxShadow: 'var(--shadow-md)',
                cursor: 'pointer'
              }}
            >
              <CheckCircle2 size={16} />
              <span>{loading ? 'Updating...' : 'Update Password & Enter'}</span>
            </button>
          </form>
        )}

        {/* Security assurance */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 6,
          fontSize: '11px',
          color: 'var(--text-muted)'
        }}>
          <ShieldCheck size={14} color="var(--color-full)" />
          <span>Your attendance data is private & encrypted per-account</span>
        </div>
      </div>
    </div>
  );
}
