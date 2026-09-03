import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from './AuthContext';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Mail, 
  User as UserIcon, 
  Lock, 
  Info, 
  Eye, 
  EyeOff, 
  ArrowLeft,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  ShieldCheck,
  Clock,
  RefreshCw,
  Send,
  CheckCircle,
  XCircle,
  UserCheck,
  ExternalLink,
  Copy
} from 'lucide-react';
import { toast } from 'sonner';
import { auth, db } from './firebase';
import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  sendPasswordResetEmail,
  sendEmailVerification,
  updateProfile
} from 'firebase/auth';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';

const Auth: React.FC = () => {
  const [mode, setMode] = useState<'login' | 'signup' | 'forgot'>('login');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isGoogleSubmitting, setIsGoogleSubmitting] = useState(false);
  const [isGuestSubmitting, setIsGuestSubmitting] = useState(false);
  const [resetEmailSent, setResetEmailSent] = useState(false);
  const [verificationPending, setVerificationPending] = useState(false);
  const [registeredEmail, setRegisteredEmail] = useState('');
  const [resendCooldown, setResendCooldown] = useState(0);
  const [isResending, setIsResending] = useState(false);
  const [authErrorDetails, setAuthErrorDetails] = useState<{
    title: string;
    message: string;
    code?: string;
    type?: 'email-in-use' | 'invalid-credential' | 'weak-password' | 'unauthorized' | 'general';
  } | null>(null);
  
  const { user, loginAsGuest, reloadUserStatus } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const queryParams = new URLSearchParams(location.search);
  const redirectPath = queryParams.get('redirect');

  useEffect(() => {
    // If logged in and NOT waiting on verification screen
    if (user && !verificationPending) {
      if (redirectPath) {
        navigate(`/${redirectPath}`);
      } else {
        navigate('/dashboard');
      }
    }
  }, [user, navigate, redirectPath, verificationPending]);

  // Resend countdown timer
  useEffect(() => {
    if (resendCooldown > 0) {
      const timer = setTimeout(() => setResendCooldown(resendCooldown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [resendCooldown]);

  // Password matching helpers
  const passwordsMatch = password.length > 0 && confirmPassword.length > 0 && password === confirmPassword;
  const passwordsMismatch = confirmPassword.length > 0 && password !== confirmPassword;

  // Quick recovery actions for authentication errors
  const handleSwitchToLoginWithEmail = () => {
    setMode('login');
    setPassword('');
    setConfirmPassword('');
    setAuthErrorDetails(null);
    toast.info('Switched to Sign In. Please enter your password or continue with Google.');
  };

  const handleQuickPasswordReset = async () => {
    const targetEmail = email.trim();
    if (!targetEmail) {
      toast.error('Please enter your email address first.');
      return;
    }
    setIsSubmitting(true);
    try {
      await sendPasswordResetEmail(auth, targetEmail);
      setResetEmailSent(true);
      setMode('forgot');
      setAuthErrorDetails(null);
      toast.success(`Password reset email sent to ${targetEmail}!`);
    } catch (err: any) {
      console.error('Quick password reset error:', err);
      toast.error(err.message || 'Failed to send password reset email.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Google Sign-In
  const handleGoogleSignIn = async () => {
    setAuthErrorDetails(null);
    setIsGoogleSubmitting(true);
    try {
      const provider = new GoogleAuthProvider();
      provider.setCustomParameters({ prompt: 'select_account' });
      const result = await signInWithPopup(auth, provider);
      const firebaseUser = result.user;

      try {
        const userRef = doc(db, 'users', firebaseUser.uid);
        const userDoc = await getDoc(userRef);
        if (!userDoc.exists()) {
          await setDoc(userRef, {
            uid: firebaseUser.uid,
            name: firebaseUser.displayName || 'Community Member',
            email: firebaseUser.email || '',
            emailVerified: true, // Google emails are pre-verified
            approvalStatus: 'approved',
            role: 'member',
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp()
          }, { merge: true });
        }
      } catch (err) {
        console.warn('Firestore profile sync note:', err);
      }

      toast.success(`Welcome, ${firebaseUser.displayName || 'Member'}!`);
    } catch (error: any) {
      console.error('Google Auth Error:', error);
      if (error.code === 'auth/popup-closed-by-user') {
        toast.info('Google sign-in was closed.');
      } else if (error.code === 'auth/popup-blocked') {
        setAuthErrorDetails({
          title: 'Popup Blocked',
          message: 'Popups were blocked by your browser. Please enable popups or sign in with your email & password.',
          code: error.code,
          type: 'general'
        });
        toast.error('Popup blocked');
      } else if (
        error.code === 'auth/unauthorized-domain' ||
        error.code === 'auth/invalid-api-key' ||
        (error.message && (
          error.message.toLowerCase().includes('unauthorized-domain') ||
          error.message.toLowerCase().includes('unauthorized domain') ||
          error.message.toLowerCase().includes('invalid authorization') ||
          error.message.toLowerCase().includes('not authorized')
        ))
      ) {
        setAuthErrorDetails({
          title: 'Domain Not Authorized in Firebase',
          message: `Firebase blocked the authorization request from "${typeof window !== 'undefined' ? window.location.hostname : 'this domain'}". To enable sign-ins on this custom domain, add it to your Firebase Console Authorized Domains.`,
          code: error.code || 'auth/unauthorized-domain',
          type: 'unauthorized'
        });
        toast.error('Domain not authorized in Firebase');
      } else {
        setAuthErrorDetails({
          title: 'Google Sign-In Error',
          message: error.message || 'Google sign-in could not be completed. Please try again or use email login.',
          code: error.code,
          type: 'general'
        });
        toast.error('Google sign-in failed');
      }
    } finally {
      setIsGoogleSubmitting(false);
    }
  };

  // Instant Guest / Demo Sign-In
  const handleDemoSignIn = async () => {
    setAuthErrorDetails(null);
    setIsGuestSubmitting(true);
    try {
      await loginAsGuest();
      toast.success('Logged in as Guest Member!');
    } catch (error: any) {
      console.error('Demo login error:', error);
      try {
        await signInWithEmailAndPassword(auth, 'demo@sunnyvalemasjid.org', 'DemoPassword123!');
        toast.success('Signed in with Demo Account!');
      } catch (fallbackErr) {
        setAuthErrorDetails({
          title: 'Guest Login Unavailable',
          message: 'Unable to sign in as guest. Please use Google or create an account with email.',
          type: 'general'
        });
      }
    } finally {
      setIsGuestSubmitting(false);
    }
  };

  // Resend Email Verification handler
  const handleResendVerification = async () => {
    if (resendCooldown > 0) return;
    setIsResending(true);
    try {
      if (auth.currentUser) {
        await sendEmailVerification(auth.currentUser);
        setResendCooldown(60);
        toast.success('A new verification email has been sent!');
      } else {
        toast.error('Session expired. Please log in again.');
      }
    } catch (err: any) {
      console.error('Resend verification error:', err);
      toast.error(err.message || 'Could not resend email. Please try again shortly.');
    } finally {
      setIsResending(false);
    }
  };

  // Check if verified handler
  const handleCheckVerified = async () => {
    setIsSubmitting(true);
    try {
      await reloadUserStatus();
      if (auth.currentUser?.emailVerified) {
        toast.success('Email successfully verified! Welcome to Sunnyvale Masjid.');
        setVerificationPending(false);
        navigate('/dashboard');
      } else {
        toast.info('Email is not yet verified. Please check your inbox or spam folder.');
      }
    } catch (err) {
      toast.error('Could not refresh verification status.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Email/Password Submit
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthErrorDetails(null);
    
    const cleanEmail = email.trim().toLowerCase();

    if (!cleanEmail) {
      setAuthErrorDetails({
        title: 'Missing Email',
        message: 'Please enter your email address.',
        type: 'general'
      });
      return;
    }

    if (mode === 'forgot') {
      setIsSubmitting(true);
      try {
        await sendPasswordResetEmail(auth, cleanEmail);
        setResetEmailSent(true);
        toast.success('Password reset link sent to your email!');
      } catch (error: any) {
        console.error('Password reset error:', error);
        if (error.code === 'auth/user-not-found') {
          setAuthErrorDetails({
            title: 'Account Not Found',
            message: `No account was found with ${cleanEmail}. Click "Create Account" to register.`,
            code: error.code,
            type: 'general'
          });
        } else if (error.code === 'auth/invalid-email') {
          setAuthErrorDetails({
            title: 'Invalid Email',
            message: 'Please enter a valid email address format.',
            code: error.code,
            type: 'general'
          });
        } else {
          setAuthErrorDetails({
            title: 'Reset Error',
            message: error.message || 'Failed to send password reset email.',
            code: error.code,
            type: 'general'
          });
        }
      } finally {
        setIsSubmitting(false);
      }
      return;
    }

    if (!password) {
      setAuthErrorDetails({
        title: 'Missing Password',
        message: 'Please enter your password.',
        type: 'general'
      });
      return;
    }

    if (mode === 'signup') {
      if (!name.trim()) {
        setAuthErrorDetails({
          title: 'Missing Name',
          message: 'Please enter your full name.',
          type: 'general'
        });
        return;
      }
      if (password.length < 6) {
        setAuthErrorDetails({
          title: 'Weak Password',
          message: 'Password must be at least 6 characters long.',
          type: 'weak-password'
        });
        return;
      }
      if (password !== confirmPassword) {
        setAuthErrorDetails({
          title: 'Passwords Mismatch',
          message: 'Passwords do not match. Please verify your password entry.',
          type: 'general'
        });
        return;
      }
    }

    setIsSubmitting(true);
    try {
      if (mode === 'login') {
        const result = await signInWithEmailAndPassword(auth, cleanEmail, password);
        toast.success('Logged in successfully!');
        if (!result.user.emailVerified) {
          toast.info('Please verify your email address to unlock full member features.');
        }
      } else {
        const result = await createUserWithEmailAndPassword(auth, cleanEmail, password);
        const firebaseUser = result.user;

        // 1. Set display name
        await updateProfile(firebaseUser, { displayName: name.trim() });

        // 2. Send verification email immediately
        try {
          await sendEmailVerification(firebaseUser);
        } catch (verErr) {
          console.warn('Initial verification email trigger note:', verErr);
        }

        // 3. Save user record with pending approval and emailVerified = false
        try {
          const userRef = doc(db, 'users', firebaseUser.uid);
          await setDoc(userRef, {
            uid: firebaseUser.uid,
            name: name.trim(),
            email: cleanEmail,
            emailVerified: false,
            approvalStatus: 'pending', // Requires admin review
            role: 'member',
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp()
          });
        } catch (dbErr) {
          console.warn('Profile doc create note:', dbErr);
        }

        setRegisteredEmail(cleanEmail);
        setVerificationPending(true);
        setResendCooldown(60);
        toast.success('Registration successful! Please verify your email.');
      }
    } catch (error: any) {
      console.error('Auth error:', error);
      if (error.code === 'auth/operation-not-allowed') {
        setAuthErrorDetails({
          title: 'Provider Disabled',
          message: 'Email/Password sign-in provider is disabled in Firebase Authentication.',
          code: error.code,
          type: 'unauthorized'
        });
      } else if (
        error.code === 'auth/unauthorized-domain' || 
        error.code === 'auth/invalid-api-key' ||
        (error.message && (
          error.message.toLowerCase().includes('unauthorized-domain') ||
          error.message.toLowerCase().includes('unauthorized domain') ||
          error.message.toLowerCase().includes('invalid authorization') ||
          error.message.toLowerCase().includes('not authorized')
        ))
      ) {
        setAuthErrorDetails({
          title: 'Domain Not Authorized in Firebase',
          message: `Firebase blocked authentication on "${typeof window !== 'undefined' ? window.location.hostname : 'this domain'}". Add your domain to Firebase Console > Authentication > Settings > Authorized domains.`,
          code: error.code || 'auth/unauthorized-domain',
          type: 'unauthorized'
        });
      } else if (
        error.code === 'auth/user-not-found' || 
        error.code === 'auth/wrong-password' || 
        error.code === 'auth/invalid-credential'
      ) {
        setAuthErrorDetails({
          title: mode === 'login' ? 'Invalid Credentials' : 'Authentication Error',
          message: mode === 'login' 
            ? `The password or email entered for ${cleanEmail} is incorrect. If you previously registered using Google, click "Continue with Google", or reset your password.`
            : 'Unable to complete registration. If you already have an account, please sign in.',
          code: error.code,
          type: 'invalid-credential'
        });
      } else if (error.code === 'auth/email-already-in-use') {
        setAuthErrorDetails({
          title: 'Account Already Exists',
          message: `An account is already registered with ${cleanEmail}. Please sign in with your password, reset your password, or use Google.`,
          code: error.code,
          type: 'email-in-use'
        });
      } else if (error.code === 'auth/weak-password') {
        setAuthErrorDetails({
          title: 'Weak Password',
          message: 'Password is too weak. Please use at least 6 characters including letters and numbers.',
          code: error.code,
          type: 'weak-password'
        });
      } else if (error.code === 'auth/invalid-email') {
        setAuthErrorDetails({
          title: 'Invalid Email',
          message: 'The email address format is invalid. Please check for typos.',
          code: error.code,
          type: 'general'
        });
      } else if (error.code === 'auth/too-many-requests') {
        setAuthErrorDetails({
          title: 'Too Many Attempts',
          message: 'Access temporarily disabled due to multiple failed login attempts. Please reset your password or wait a few minutes.',
          code: error.code,
          type: 'general'
        });
      } else {
        setAuthErrorDetails({
          title: 'Authentication Error',
          message: error.message || 'Authentication failed. Please check your credentials.',
          code: error.code,
          type: 'general'
        });
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center px-4 py-12 bg-[#0d0f12] relative overflow-hidden transition-colors">
      <div className="absolute top-0 left-0 w-full h-full islamic-pattern pointer-events-none opacity-5"></div>
      
      <motion.div 
        initial={{ opacity: 0, scale: 0.97 }}
        animate={{ opacity: 1, scale: 1 }}
        className="max-w-md w-full bg-[#181b22] text-zinc-100 rounded-3xl shadow-2xl p-6 sm:p-8 border border-zinc-800 relative z-10"
      >
        {redirectPath && !verificationPending && (
          <div className="mb-5 bg-zinc-900 border border-zinc-700 p-3 rounded-2xl flex items-center gap-3 text-zinc-200 text-xs">
            <div className="bg-zinc-800 p-1.5 rounded-full text-zinc-300 shrink-0">
              <Info size={15} />
            </div>
            <p>Please sign in to proceed to the <strong>{redirectPath}</strong> page.</p>
          </div>
        )}

        {/* VERIFICATION PENDING SUCCESS SCREEN */}
        {verificationPending ? (
          <div className="text-center py-4 space-y-4">
            <div className="w-16 h-16 bg-zinc-800 text-zinc-200 rounded-full flex items-center justify-center mx-auto border border-zinc-700">
              <Mail size={32} className="text-zinc-300 animate-bounce" />
            </div>

            <div>
              <span className="px-3 py-0.5 bg-zinc-900 text-zinc-300 text-[10px] font-bold rounded-full uppercase tracking-wider border border-zinc-700">
                Step 1: Email Verification
              </span>
              <h2 className="text-xl sm:text-2xl font-bold text-white mt-2">Verify Your Email Address</h2>
              <p className="text-xs text-zinc-400 mt-1 leading-relaxed">
                We have sent a verification link to <strong className="text-zinc-200">{registeredEmail || email}</strong>.
              </p>
            </div>

            {/* Anti-Bot & Admin Approval Explanatory Card */}
            <div className="bg-[#121419] p-4 rounded-2xl border border-zinc-800 text-left text-xs space-y-2.5">
              <div className="flex items-start gap-2.5">
                <CheckCircle2 size={16} className="text-zinc-300 shrink-0 mt-0.5" />
                <p className="text-zinc-300">
                  <strong>Click the link in your email</strong> to confirm your address and protect against bots and duplicate profiles.
                </p>
              </div>
              <div className="flex items-start gap-2.5">
                <UserCheck size={16} className="text-amber-400 shrink-0 mt-0.5" />
                <p className="text-zinc-300">
                  <strong>Mosque Admin Review:</strong> To protect our community, new member profiles are placed in review before gaining full community publishing access.
                </p>
              </div>
            </div>

            <div className="space-y-2.5 pt-2">
              <button
                type="button"
                onClick={handleCheckVerified}
                disabled={isSubmitting}
                className="w-full py-3 bg-zinc-200 hover:bg-white text-zinc-950 font-bold text-xs rounded-xl shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <RefreshCw size={14} className={isSubmitting ? 'animate-spin' : ''} />
                {isSubmitting ? 'Checking Status...' : "I've Verified My Email (Continue)"}
              </button>

              <button
                type="button"
                onClick={handleResendVerification}
                disabled={resendCooldown > 0 || isResending}
                className="w-full py-2.5 bg-[#121419] hover:bg-zinc-800 text-zinc-300 font-semibold text-xs rounded-xl border border-zinc-700 transition-all flex items-center justify-center gap-1.5 disabled:opacity-50 cursor-pointer"
              >
                <Send size={13} />
                {isResending ? 'Sending...' : (resendCooldown > 0 ? `Resend email in ${resendCooldown}s` : 'Resend Verification Link')}
              </button>

              <button
                type="button"
                onClick={() => {
                  setVerificationPending(false);
                  navigate('/dashboard');
                }}
                className="text-xs text-zinc-400 hover:text-zinc-200 hover:underline pt-2 block mx-auto"
              >
                Go to Dashboard (Pending Status) →
              </button>
            </div>
          </div>
        ) : (
          <>
            {/* Tab Switcher */}
            {mode !== 'forgot' && (
              <div className="flex p-1 bg-[#121419] rounded-2xl mb-6 border border-zinc-800">
                <button
                  type="button"
                  onClick={() => {
                    setMode('login');
                    setAuthErrorDetails(null);
                  }}
                  className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition-all ${
                    mode === 'login' 
                      ? 'bg-[#e08a6e] text-zinc-950 shadow-md' 
                      : 'text-zinc-400 hover:text-zinc-200'
                  }`}
                >
                  Sign In
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setMode('signup');
                    setAuthErrorDetails(null);
                  }}
                  className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition-all ${
                    mode === 'signup' 
                      ? 'bg-[#e08a6e] text-zinc-950 shadow-md' 
                      : 'text-zinc-400 hover:text-zinc-200'
                  }`}
                >
                  Create Account
                </button>
              </div>
            )}

            {/* Header Title */}
            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold text-white tracking-tight">
                {mode === 'login' && 'Member Login'}
                {mode === 'signup' && 'Register as Member'}
                {mode === 'forgot' && 'Reset Password'}
              </h2>
              <p className="text-zinc-400 text-xs mt-1.5">
                {mode === 'login' && 'Access your dashboard, donation history, and profile'}
                {mode === 'signup' && 'Join the Sunnyvale Muslim Community portal with secure verification'}
                {mode === 'forgot' && 'Enter your email to receive a recovery link'}
              </p>
            </div>

            {/* Smart Interactive Auth Error Alert */}
            {authErrorDetails && (
              <motion.div 
                initial={{ opacity: 0, y: -5 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-5 p-4 bg-red-950/70 border border-red-800/80 rounded-2xl text-red-200 text-xs space-y-3 shadow-lg"
              >
                <div className="flex items-start gap-2.5">
                  <AlertCircle size={17} className="text-red-400 shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <p className="font-bold text-red-300 text-[13px]">{authErrorDetails.title}</p>
                    <p className="mt-0.5 text-red-200/90 leading-relaxed text-xs">{authErrorDetails.message}</p>
                  </div>
                </div>

                {/* Contextual Action Shortcuts */}
                {authErrorDetails.type === 'email-in-use' && (
                  <div className="pt-2 border-t border-red-900/60 flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={handleSwitchToLoginWithEmail}
                      className="px-3 py-1.5 bg-[#e08a6e] hover:bg-[#eb977c] text-zinc-950 font-bold rounded-lg text-xs transition-colors cursor-pointer"
                    >
                      Sign In to this Account →
                    </button>
                    <button
                      type="button"
                      onClick={handleQuickPasswordReset}
                      disabled={isSubmitting}
                      className="px-3 py-1.5 bg-red-900/80 hover:bg-red-800 text-red-100 font-semibold rounded-lg text-xs transition-colors cursor-pointer"
                    >
                      Reset Password
                    </button>
                    <button
                      type="button"
                      onClick={handleGoogleSignIn}
                      className="px-3 py-1.5 bg-white hover:bg-gray-100 text-zinc-900 font-semibold rounded-lg text-xs transition-colors cursor-pointer"
                    >
                      Sign in with Google
                    </button>
                  </div>
                )}

                {authErrorDetails.type === 'unauthorized' && (
                  <div className="pt-2.5 border-t border-red-900/60 space-y-2.5">
                    <div className="bg-zinc-950/80 p-3 rounded-xl border border-red-900/50 text-zinc-300">
                      <p className="font-semibold text-white mb-1.5 text-[11px]">Domain to authorize in Firebase:</p>
                      <div className="flex items-center justify-between gap-2 bg-[#121419] px-2.5 py-1.5 rounded-lg border border-zinc-700 font-mono text-xs text-[#f5a287]">
                        <span className="truncate">{typeof window !== 'undefined' ? window.location.hostname : 'your-domain.com'}</span>
                        <button
                          type="button"
                          onClick={() => {
                            if (typeof window !== 'undefined') {
                              navigator.clipboard.writeText(window.location.hostname);
                              toast.success(`Copied "${window.location.hostname}" to clipboard!`);
                            }
                          }}
                          className="px-2 py-1 bg-[#e08a6e] hover:bg-[#eb977c] text-zinc-950 font-bold rounded text-[10px] transition-colors cursor-pointer shrink-0 flex items-center gap-1"
                        >
                          <Copy size={11} /> Copy
                        </button>
                      </div>
                    </div>

                    <div className="text-[11px] text-zinc-300 space-y-1 pl-0.5">
                      <p className="font-semibold text-white">How to fix in Firebase Console:</p>
                      <ol className="list-decimal pl-4 space-y-0.5 text-zinc-300 text-[11px]">
                        <li>Open <strong>Firebase Console</strong> for project <code className="text-[#f5a287]">gen-lang-client-0490173530</code></li>
                        <li>Go to <strong>Authentication</strong> → <strong>Settings</strong> tab</li>
                        <li>Scroll to <strong>Authorized domains</strong> and click <strong>Add domain</strong></li>
                        <li>Paste your domain (<code className="text-[#f5a287]">{typeof window !== 'undefined' ? window.location.hostname : ''}</code>) and save</li>
                      </ol>
                    </div>

                    <div className="flex flex-wrap gap-2 pt-1">
                      <a
                        href="https://console.firebase.google.com/project/gen-lang-client-0490173530/authentication/settings"
                        target="_blank"
                        rel="noreferrer"
                        className="px-3 py-1.5 bg-[#e08a6e] hover:bg-[#eb977c] text-zinc-950 font-bold rounded-lg text-xs transition-colors cursor-pointer inline-flex items-center gap-1.5"
                      >
                        <ExternalLink size={12} /> Open Firebase Settings
                      </a>
                      <button
                        type="button"
                        onClick={handleDemoSignIn}
                        disabled={isGuestSubmitting}
                        className="px-3 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 font-semibold rounded-lg text-xs transition-colors cursor-pointer"
                      >
                        Sign In as Guest
                      </button>
                    </div>
                  </div>
                )}

                {authErrorDetails.type === 'invalid-credential' && (
                  <div className="pt-2 border-t border-red-900/60 flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={handleQuickPasswordReset}
                      disabled={isSubmitting}
                      className="px-3 py-1.5 bg-[#e08a6e] hover:bg-[#eb977c] text-zinc-950 font-bold rounded-lg text-xs transition-colors cursor-pointer"
                    >
                      Send Password Reset Link
                    </button>
                    <button
                      type="button"
                      onClick={handleGoogleSignIn}
                      className="px-3 py-1.5 bg-white hover:bg-gray-100 text-zinc-900 font-semibold rounded-lg text-xs transition-colors cursor-pointer"
                    >
                      Continue with Google
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setMode('signup');
                        setAuthErrorDetails(null);
                      }}
                      className="px-3 py-1.5 bg-red-900/80 hover:bg-red-800 text-red-100 font-semibold rounded-lg text-xs transition-colors cursor-pointer"
                    >
                      Create Account Instead
                    </button>
                  </div>
                )}
              </motion.div>
            )}

            {/* Quick Social & Demo Buttons */}
            {mode !== 'forgot' && (
              <div className="space-y-2.5 mb-6">
                <button
                  type="button"
                  onClick={handleGoogleSignIn}
                  disabled={isGoogleSubmitting || isSubmitting || isGuestSubmitting}
                  className="w-full flex items-center justify-center gap-3 bg-white text-zinc-900 hover:bg-zinc-100 py-3 px-4 rounded-xl font-bold text-xs sm:text-sm shadow-md transition-all disabled:opacity-60 cursor-pointer"
                >
                  <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
                    <path
                      fill="#4285F4"
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    />
                    <path
                      fill="#34A853"
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    />
                    <path
                      fill="#FBBC05"
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                    />
                    <path
                      fill="#EA4335"
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                    />
                  </svg>
                  <span>{isGoogleSubmitting ? 'Connecting with Google...' : 'Continue with Google'}</span>
                </button>

                {/* Quick Demo Preview Button */}
                <button
                  type="button"
                  onClick={handleDemoSignIn}
                  disabled={isGuestSubmitting || isSubmitting || isGoogleSubmitting}
                  className="w-full flex items-center justify-center gap-2 bg-[#181b22] hover:bg-zinc-800 text-zinc-200 hover:text-white py-2.5 px-4 rounded-xl font-semibold text-xs border border-zinc-700 hover:border-[#e08a6e]/40 transition-all cursor-pointer shadow-sm"
                >
                  <Sparkles size={14} className="text-[#f5a287]" />
                  <span>{isGuestSubmitting ? 'Signing in as Guest...' : 'Quick Demo Access (Test as Guest)'}</span>
                </button>

                <div className="relative flex items-center justify-center pt-2">
                  <div className="border-t border-zinc-800 w-full"></div>
                  <span className="bg-[#181b22] px-3 text-[10px] uppercase tracking-wider text-zinc-400 font-semibold absolute">
                    Or with email & password
                  </span>
                </div>
              </div>
            )}

            {/* Forgot password success state */}
            {mode === 'forgot' && resetEmailSent ? (
              <div className="text-center py-6">
                <div className="w-12 h-12 bg-[#251814] text-[#f5a287] rounded-full flex items-center justify-center mx-auto mb-3 border border-[#e08a6e]/40">
                  <CheckCircle2 size={26} />
                </div>
                <h3 className="font-bold text-white mb-2">Check Your Inbox</h3>
                <p className="text-xs text-zinc-300 mb-6 leading-relaxed">
                  We sent a password reset link to <strong>{email}</strong>. Follow the instructions to set your new password.
                </p>
                <button
                  onClick={() => {
                    setResetEmailSent(false);
                    setMode('login');
                  }}
                  className="inline-flex items-center gap-2 text-[#f5a287] hover:text-[#fbdcd3] text-xs font-bold hover:underline"
                >
                  <ArrowLeft size={14} /> Back to Sign In
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-3.5">
                {mode === 'signup' && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                  >
                    <label className="block text-xs font-medium text-zinc-300 mb-1">Full Name</label>
                    <div className="relative">
                      <UserIcon className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#f5a287]" size={16} />
                      <input
                        type="text"
                        required
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        autoComplete="name"
                        className="w-full pl-10 pr-4 py-2.5 bg-[#121419] border border-zinc-700 rounded-xl outline-none focus:ring-2 focus:ring-[#e08a6e]/40 focus:border-[#e08a6e] transition-all text-white text-sm"
                        placeholder="e.g. Ibrahim Abubakar"
                      />
                    </div>
                  </motion.div>
                )}

                <div>
                  <label className="block text-xs font-medium text-zinc-300 mb-1">Email Address</label>
                  <div className="relative">
                    <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#f5a287]" size={16} />
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      autoComplete="email"
                      className="w-full pl-10 pr-4 py-2.5 bg-[#121419] border border-zinc-700 rounded-xl outline-none focus:ring-2 focus:ring-[#e08a6e]/40 focus:border-[#e08a6e] transition-all text-white text-sm"
                      placeholder="you@example.com"
                    />
                  </div>
                </div>

                {mode !== 'forgot' && (
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="block text-xs font-medium text-zinc-300">
                        {mode === 'signup' ? 'Create Password' : 'Password'}
                      </label>
                      {mode === 'login' && (
                        <button
                          type="button"
                          onClick={() => {
                            setMode('forgot');
                            setResetEmailSent(false);
                            setAuthErrorDetails(null);
                          }}
                          className="text-[11px] text-[#f5a287] hover:text-[#fbdcd3] hover:underline"
                        >
                          Forgot Password?
                        </button>
                      )}
                    </div>
                    <div className="relative">
                      <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#f5a287]" size={16} />
                      <input
                        type={showPassword ? "text" : "password"}
                        required
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        autoComplete={mode === 'login' ? "current-password" : "new-password"}
                        className="w-full pl-10 pr-12 py-2.5 bg-[#121419] border border-zinc-700 rounded-xl outline-none focus:ring-2 focus:ring-[#e08a6e]/40 focus:border-[#e08a6e] transition-all text-white text-sm"
                        placeholder="••••••••"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3.5 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-200 transition-colors"
                      >
                        {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                    </div>
                    {mode === 'signup' && (
                      <p className="text-[10px] text-zinc-400 mt-1">Minimum 6 characters</p>
                    )}
                  </div>
                )}

                {/* DOUBLE PASSWORD ENTRY (CONFIRM PASSWORD) FOR REGISTRATION */}
                {mode === 'signup' && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <label className="block text-xs font-medium text-zinc-300">Confirm Password</label>
                      {passwordsMatch && (
                        <span className="text-[11px] text-[#f5a287] font-semibold flex items-center gap-1">
                          <CheckCircle size={12} /> Passwords Match
                        </span>
                      )}
                      {passwordsMismatch && (
                        <span className="text-[11px] text-red-400 font-semibold flex items-center gap-1">
                          <XCircle size={12} /> Passwords do not match
                        </span>
                      )}
                    </div>
                    <div className="relative">
                      <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#f5a287]" size={16} />
                      <input
                        type={showConfirmPassword ? "text" : "password"}
                        required
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        autoComplete="new-password"
                        className={`w-full pl-10 pr-12 py-2.5 bg-[#121419] border rounded-xl outline-none focus:ring-2 transition-all text-white text-sm ${
                          passwordsMismatch 
                            ? 'border-red-600 focus:ring-red-500/40' 
                            : (passwordsMatch ? 'border-[#e08a6e] focus:ring-[#e08a6e]/40' : 'border-zinc-700 focus:ring-[#e08a6e]/40')
                        }`}
                        placeholder="Re-enter password"
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute right-3.5 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-200 transition-colors"
                      >
                        {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                    </div>
                  </motion.div>
                )}

                <button
                  type="submit"
                  disabled={isSubmitting || isGoogleSubmitting || isGuestSubmitting || (mode === 'signup' && passwordsMismatch)}
                  className="w-full bg-[#e08a6e] hover:bg-[#eb977c] text-zinc-950 py-3 rounded-xl font-bold text-sm shadow-lg shadow-[#e08a6e]/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer mt-3"
                >
                  {isSubmitting ? 'Processing...' : (
                    mode === 'login' ? 'Sign In to Dashboard' : (
                      mode === 'signup' ? 'Create Verified Member Account' : 'Send Reset Link'
                    )
                  )}
                </button>
              </form>
            )}

            {/* Footer info & security badge */}
            <div className="mt-6 pt-4 border-t border-zinc-800 text-center flex items-center justify-between text-[11px] text-zinc-400">
              <div className="flex items-center gap-1.5">
                <ShieldCheck size={14} className="text-zinc-400" />
                <span>Email Verification & Admin Protected</span>
              </div>
              {mode === 'forgot' && (
                <button
                  onClick={() => {
                    setMode('login');
                    setResetEmailSent(false);
                  }}
                  className="text-zinc-400 hover:text-white font-medium"
                >
                  Back to Login
                </button>
              )}
            </div>
          </>
        )}
      </motion.div>
    </div>
  );
};

export default Auth;
